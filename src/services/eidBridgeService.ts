/**
 * Service pour communiquer avec l'application Windows eID Bridge
 * Cette approche résout les problèmes de VMware et de middleware
 */

export interface EidBridgeData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  niss: string;
  cardNumber: string;
  validityBeginDate: string;
  validityEndDate: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  photo?: string;
}

export interface EidBridgeStatus {
  status: string;
  middleware: string;
  readers: number;
  readersWithCard: number;
  lastRead?: string;
  version: string;
  uptime: string;
}

export interface EidBridgeResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  requestId?: string;
  timestamp: string;
}

class EidBridgeService {
  private readonly bridgeUrl = 'https://localhost:8443/api';
  private readonly timeout = 30000; // 30 secondes
  private token: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Vérifie si l'application Windows eID Bridge est disponible
   */
  async isBridgeAvailable(): Promise<{ available: boolean; status?: EidBridgeStatus; error?: string }> {
    try {
      console.log('🔍 Vérification de l\'application eID Bridge...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.bridgeUrl}/status`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const status = await response.json() as EidBridgeStatus;
        console.log('✅ eID Bridge disponible:', status);
        
        return {
          available: true,
          status
        };
      } else {
        return {
          available: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      console.warn('eID Bridge non disponible:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            available: false,
            error: 'Timeout de connexion vers eID Bridge'
          };
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
          return {
            available: false,
            error: 'Application eID Bridge non démarrée'
          };
        }
      }
      
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Obtient un token d'authentification temporaire
   */
  private async getAuthToken(): Promise<string> {
    // Vérifier si le token actuel est encore valide
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(`${this.bridgeUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: 'OphtalmoPro-Web'
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur d'authentification: HTTP ${response.status}`);
      }

      const tokenData = await response.json();
      this.token = tokenData.token;
      this.tokenExpiry = Date.now() + (tokenData.expiresIn * 1000) - 10000; // 10s de marge

      return this.token;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token:', error);
      throw new Error('Impossible d\'obtenir un token d\'authentification');
    }
  }

  /**
   * Lit les données d'une carte eID via l'application Bridge
   */
  async readCard(options: {
    includePhoto?: boolean;
    includeAddress?: boolean;
  } = {}): Promise<EidBridgeData> {
    console.log('🔍 Début de la lecture de carte eID via Bridge...');

    // Vérifier la disponibilité du Bridge
    const availability = await this.isBridgeAvailable();
    if (!availability.available) {
      throw new Error(
        `Application eID Bridge non disponible.\n\n` +
        `Erreur: ${availability.error}\n\n` +
        `Solutions:\n` +
        `1. Installer l'application eID Bridge Windows\n` +
        `2. Vérifier que le service est démarré\n` +
        `3. Exécuter test-connection.bat pour diagnostiquer`
      );
    }

    // Vérifier qu'il y a des lecteurs avec cartes
    if (availability.status && availability.status.readersWithCard === 0) {
      throw new Error(
        `Aucune carte eID détectée.\n\n` +
        `Lecteurs disponibles: ${availability.status.readers}\n` +
        `Cartes détectées: ${availability.status.readersWithCard}\n\n` +
        `Actions:\n` +
        `1. Insérer votre carte eID dans le lecteur\n` +
        `2. Vérifier que le lecteur est bien connecté\n` +
        `3. Attendre quelques secondes et réessayer`
      );
    }

    try {
      // Obtenir un token d'authentification
      const token = await this.getAuthToken();

      console.log('📖 Envoi de la requête de lecture...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.bridgeUrl}/read-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          includePhoto: options.includePhoto || false,
          includeAddress: options.includeAddress !== false,
          timeout: this.timeout
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await response.json() as EidBridgeResponse<EidBridgeData>;

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la lecture de la carte');
      }

      if (!result.data) {
        throw new Error('Aucune donnée reçue de la carte eID');
      }

      console.log('✅ Lecture de carte réussie via Bridge:', result.data);
      return result.data;

    } catch (error) {
      console.error('Erreur lors de la lecture via Bridge:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(
            `Timeout lors de la lecture de la carte.\n\n` +
            `La lecture a pris plus de ${this.timeout / 1000} secondes.\n\n` +
            `Solutions:\n` +
            `1. Vérifier que la carte est bien insérée\n` +
            `2. Nettoyer la carte avec un chiffon doux\n` +
            `3. Redémarrer l'application eID Bridge\n` +
            `4. Tester avec eID Viewer d'abord`
          );
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          // Reset du token et retry
          this.token = null;
          throw new Error(
            `Erreur d'authentification avec eID Bridge.\n\n` +
            `L'application web n'est pas autorisée à accéder au service.\n\n` +
            `Solutions:\n` +
            `1. Redémarrer l'application eID Bridge\n` +
            `2. Vérifier la configuration de sécurité\n` +
            `3. Contacter le support technique`
          );
        } else if (error.message.includes('503') || error.message.includes('Service Unavailable')) {
          throw new Error(
            `Service de lecture temporairement indisponible.\n\n` +
            `Le middleware eID ou les lecteurs ne répondent pas.\n\n` +
            `Solutions:\n` +
            `1. Vérifier que le middleware eID belge est installé\n` +
            `2. Redémarrer les services Smart Card Windows\n` +
            `3. Tester avec eID Viewer\n` +
            `4. Redémarrer l'ordinateur si nécessaire`
          );
        }
      }
      
      throw error;
    }
  }

  /**
   * Obtient le statut détaillé du système eID
   */
  async getSystemStatus(): Promise<{
    bridge: EidBridgeStatus;
    middleware: string;
    readers: any[];
    diagnostic: any;
  }> {
    try {
      // Statut général
      const statusResponse = await fetch(`${this.bridgeUrl}/status`);
      const status = await statusResponse.json() as EidBridgeStatus;

      // Lecteurs
      const readersResponse = await fetch(`${this.bridgeUrl}/readers`);
      const readersData = await readersResponse.json();

      // Diagnostic
      const diagnosticResponse = await fetch(`${this.bridgeUrl}/diagnostic`);
      const diagnostic = await diagnosticResponse.json();

      return {
        bridge: status,
        middleware: status.middleware,
        readers: readersData.readers || [],
        diagnostic
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du statut système:', error);
      throw new Error('Impossible de récupérer le statut du système eID');
    }
  }

  /**
   * Test de connectivité rapide
   */
  async quickConnectivityTest(): Promise<boolean> {
    try {
      const response = await fetch(`${this.bridgeUrl}/status`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Instructions d'installation pour l'utilisateur
   */
  getInstallationInstructions(): string {
    return `
🏥 Installation de l'Application eID Bridge

L'application eID Bridge Windows est requise pour lire les cartes eID.

📥 TÉLÉCHARGEMENT:
1. Téléchargez OphtalmoPro-eID-Bridge-Setup.exe
2. Ou téléchargez le fichier ZIP et suivez les instructions

⚙️ INSTALLATION:
1. Exécutez l'installateur en tant qu'administrateur
2. Suivez l'assistant d'installation
3. Redémarrez si demandé
4. Le service se lance automatiquement

✅ VÉRIFICATION:
1. Ouvrez services.msc
2. Vérifiez que "OphtalmoPro eID Bridge" est démarré
3. Testez avec https://localhost:8443/ dans votre navigateur

🔧 DÉPANNAGE:
- Exécutez test-connection.bat pour diagnostiquer
- Vérifiez les logs dans C:\\ProgramData\\OphtalmoPro\\eID-Bridge\\Logs\\
- Assurez-vous que le middleware eID belge est installé

Cette solution résout définitivement les problèmes VMware !
    `.trim();
  }
}

// Instance singleton
export const eidBridgeService = new EidBridgeService();

// Export des types
export type { EidBridgeData, EidBridgeStatus, EidBridgeResponse };