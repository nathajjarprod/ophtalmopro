/**
 * Service d'intégration avec itsme - Service d'identité numérique belge
 * Documentation: https://belgianmobileid.github.io/doc/
 * 
 * itsme permet une authentification sécurisée et la récupération
 * des données d'identité sans lecteur de cartes physique
 */

export interface ItsmeUserData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  nationality?: string;
  niss: string;
  address?: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  phone?: string;
  email?: string;
  photo?: string;
}

export interface ItsmeConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
  scopes: string[];
}

class ItsmeService {
  private config: ItsmeConfig;
  private readonly sandboxUrl = 'https://idp.e2e.itsme.services';
  private readonly productionUrl = 'https://idp.itsme.services';
  
  constructor() {
    // Configuration par défaut (à adapter selon votre environnement)
    this.config = {
      clientId: import.meta.env.VITE_ITSME_CLIENT_ID || 'demo-client-id',
      clientSecret: import.meta.env.VITE_ITSME_CLIENT_SECRET || 'demo-secret',
      redirectUri: `${window.location.origin}/itsme/callback`,
      environment: import.meta.env.MODE === 'production' ? 'production' : 'sandbox',
      scopes: [
        'openid',
        'profile',
        'eid',
        'address',
        'phone',
        'email'
      ]
    };
  }

  /**
   * Obtient l'URL de base selon l'environnement
   */
  private getBaseUrl(): string {
    return this.config.environment === 'production' 
      ? this.productionUrl 
      : this.sandboxUrl;
  }

  /**
   * Génère l'URL d'authentification itsme
   */
  generateAuthUrl(): string {
    const state = this.generateRandomString(32);
    const nonce = this.generateRandomString(32);
    
    // Stocker state et nonce pour validation
    sessionStorage.setItem('itsme_state', state);
    sessionStorage.setItem('itsme_nonce', nonce);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(' '),
      state: state,
      nonce: nonce,
      // Paramètres spécifiques itsme
      acr_values: 'http://itsme.services/V2/claim/acr_basic',
      ui_locales: 'fr',
      max_age: '300' // 5 minutes
    });

    return `${this.getBaseUrl()}/v2/authorization?${params.toString()}`;
  }

  /**
   * Démarre le processus d'authentification itsme
   */
  async startAuthentication(): Promise<void> {
    console.log('🔐 Démarrage de l\'authentification itsme...');
    
    const authUrl = this.generateAuthUrl();
    console.log('🌐 URL d\'authentification générée:', authUrl);
    
    // Ouvrir dans une popup pour une meilleure UX
    const popup = window.open(
      authUrl,
      'itsme-auth',
      'width=400,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      throw new Error(
        'Impossible d\'ouvrir la popup d\'authentification.\n\n' +
        'Veuillez autoriser les popups pour ce site et réessayer.'
      );
    }

    // Surveiller la popup pour détecter la redirection
    return new Promise((resolve, reject) => {
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          reject(new Error('Authentification annulée par l\'utilisateur'));
        }
      }, 1000);

      // Écouter les messages de la popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'ITSME_AUTH_SUCCESS') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageHandler);
          resolve();
        } else if (event.data.type === 'ITSME_AUTH_ERROR') {
          clearInterval(checkClosed);
          popup.close();
          window.removeEventListener('message', messageHandler);
          reject(new Error(event.data.error || 'Erreur d\'authentification'));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  /**
   * Traite le callback d'authentification
   */
  async handleAuthCallback(code: string, state: string): Promise<ItsmeUserData> {
    console.log('🔄 Traitement du callback itsme...');
    
    // Vérifier le state pour la sécurité
    const storedState = sessionStorage.getItem('itsme_state');
    if (state !== storedState) {
      throw new Error('État de sécurité invalide');
    }

    // Échanger le code contre un token
    const tokenData = await this.exchangeCodeForToken(code);
    
    // Récupérer les données utilisateur
    const userData = await this.getUserData(tokenData.access_token);
    
    // Nettoyer le stockage temporaire
    sessionStorage.removeItem('itsme_state');
    sessionStorage.removeItem('itsme_nonce');
    
    return userData;
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   */
  private async exchangeCodeForToken(code: string): Promise<any> {
    console.log('🔑 Échange du code contre un token...');
    
    const tokenUrl = `${this.getBaseUrl()}/v2/token`;
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.config.redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: body.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de l'échange de token: ${error}`);
    }

    const tokenData = await response.json();
    console.log('✅ Token obtenu avec succès');
    return tokenData;
  }

  /**
   * Récupère les données utilisateur via l'API itsme
   */
  private async getUserData(accessToken: string): Promise<ItsmeUserData> {
    console.log('👤 Récupération des données utilisateur...');
    
    const userInfoUrl = `${this.getBaseUrl()}/v2/userinfo`;
    
    const response = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur lors de la récupération des données: ${error}`);
    }

    const rawData = await response.json();
    console.log('📋 Données brutes reçues:', rawData);
    
    // Normaliser les données selon le format attendu
    const userData = this.normalizeItsmeData(rawData);
    console.log('✅ Données utilisateur normalisées:', userData);
    
    return userData;
  }

  /**
   * Normalise les données itsme selon notre format
   */
  private normalizeItsmeData(rawData: any): ItsmeUserData {
    console.log('🔄 Normalisation des données itsme...');
    
    // itsme retourne les données selon les standards OpenID Connect
    const userData: ItsmeUserData = {
      firstName: rawData.given_name || rawData.first_name || '',
      lastName: rawData.family_name || rawData.last_name || '',
      dateOfBirth: this.formatDate(rawData.birthdate || rawData.date_of_birth || ''),
      placeOfBirth: rawData.place_of_birth || rawData.birthplace || '',
      nationality: rawData.nationality || 'Belge',
      niss: this.formatNiss(rawData.eid?.national_number || rawData.national_number || ''),
      phone: rawData.phone_number || rawData.phone || '',
      email: rawData.email || ''
    };

    // Traiter l'adresse si disponible
    if (rawData.address) {
      userData.address = {
        street: rawData.address.street_address || rawData.address.street || '',
        postalCode: rawData.address.postal_code || rawData.address.zip || '',
        city: rawData.address.locality || rawData.address.city || '',
        country: rawData.address.country || 'Belgique'
      };
    }

    // Traiter la photo si disponible
    if (rawData.picture) {
      userData.photo = rawData.picture;
    }

    return userData;
  }

  /**
   * Simulation pour démonstration (mode développement)
   */
  async simulateAuthentication(): Promise<ItsmeUserData> {
    console.log('🎭 Mode simulation itsme activé...');
    
    // Simuler un délai d'authentification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const simulatedData: ItsmeUserData = {
      firstName: 'Marie',
      lastName: 'Dubois',
      dateOfBirth: '15/03/1979',
      placeOfBirth: 'Bruxelles',
      nationality: 'Belge',
      niss: '79.03.15-123.45',
      address: {
        street: 'Rue de la Paix 123',
        postalCode: '1000',
        city: 'Bruxelles',
        country: 'Belgique'
      },
      phone: '+32 2 123 45 67',
      email: 'marie.dubois@email.com'
    };

    console.log('✅ Données simulées générées:', simulatedData);
    return simulatedData;
  }

  /**
   * Méthode principale pour récupérer les données patient
   */
  async getPatientData(useSimulation: boolean = false): Promise<ItsmeUserData> {
    if (useSimulation || import.meta.env.MODE !== 'production') {
      console.log('🎭 Utilisation du mode simulation itsme');
      return this.simulateAuthentication();
    }

    console.log('🔐 Authentification itsme réelle...');
    
    try {
      // Démarrer l'authentification
      await this.startAuthentication();
      
      // Note: En réalité, les données seraient récupérées via le callback
      // Ici on simule pour la démonstration
      throw new Error('Implémentation du callback requis pour la production');
      
    } catch (error) {
      console.error('Erreur authentification itsme:', error);
      throw error;
    }
  }

  /**
   * Vérifie si itsme est disponible
   */
  async checkAvailability(): Promise<{ available: boolean; message: string }> {
    try {
      const testUrl = `${this.getBaseUrl()}/.well-known/openid_configuration`;
      const response = await fetch(testUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return {
          available: true,
          message: 'Service itsme disponible'
        };
      } else {
        return {
          available: false,
          message: `Service itsme indisponible (HTTP ${response.status})`
        };
      }
    } catch (error) {
      return {
        available: false,
        message: `Erreur de connexion itsme: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }

  /**
   * Utilitaires
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // itsme retourne généralement au format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  }

  private formatNiss(niss: string): string {
    if (!niss) return '';
    
    const numbers = niss.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return `${numbers.substring(0, 2)}.${numbers.substring(2, 4)}.${numbers.substring(4, 6)}-${numbers.substring(6, 9)}.${numbers.substring(9, 11)}`;
    }
    
    return niss;
  }
}

// Instance singleton
export const itsmeService = new ItsmeService();

// Export des types
export type { ItsmeUserData, ItsmeConfig };