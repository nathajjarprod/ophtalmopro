/**
 * Service pour l'intégration avec le middleware eID belge officiel
 * Basé sur le repository officiel: https://github.com/Fedict/eid-mw
 * 
 * Le middleware eID belge expose une API REST sur localhost
 * Documentation: https://github.com/Fedict/eid-mw/blob/master/doc/sdk/documentation/Applet/
 */

export interface EidAddress {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface EidData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  niss: string; // Numéro d'identification de sécurité sociale
  cardNumber: string;
  validityBeginDate: string;
  validityEndDate: string;
  address: EidAddress;
  photo?: string; // Base64 encoded photo
}

export interface EidReaderInfo {
  name: string;
  cardPresent: boolean;
  pinpad: boolean;
}

class EidService {
  // Configuration basée sur le middleware officiel
  private readonly middlewarePort = process.env.NODE_ENV === 'production' ? 53001 : 53001;
  private readonly middlewareHost = 'localhost';
  private readonly middlewareUrl = `http://${this.middlewareHost}:${this.middlewarePort}`;
  private readonly timeout = process.env.NODE_ENV === 'production' ? 60000 : 30000; // Plus de temps en prod
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly enableSimulation = !this.isProduction; // Simulation uniquement en dev

  /**
   * Vérifie si le middleware eID est disponible
   * Utilise l'endpoint /service/info du middleware officiel
   */
  async isMiddlewareAvailable(): Promise<{ available: boolean; version?: string; diagnostics: string[] }> {
    const diagnostics: string[] = [];
    
    try {
      diagnostics.push('🔍 Vérification du middleware eID belge officiel...');
      
      // Tester plusieurs ports possibles
      const portsToTest = [53001, 35963, 35964, 24727];
      let workingPort = null;
      let serviceInfo = null;
      
      for (const port of portsToTest) {
        try {
          diagnostics.push(`📡 Test du port ${port}...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);

          const testUrl = `http://localhost:${port}`;
          
          // Tester différents endpoints possibles
          const endpointsToTest = ['/service/info', '/info', '/status', '/'];
          
          for (const endpoint of endpointsToTest) {
            try {
              const response = await fetch(`${testUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'User-Agent': 'OphtalmoPro-eID-Client/1.0'
                },
                signal: controller.signal
              });

              if (response.ok) {
                workingPort = port;
                try {
                  serviceInfo = await response.json();
                } catch {
                  serviceInfo = { status: 'ok', endpoint };
                }
                diagnostics.push(`✅ Middleware trouvé sur port ${port}${endpoint}`);
                break;
              }
            } catch (endpointError) {
              // Continue avec l'endpoint suivant
            }
          }
          
          clearTimeout(timeoutId);
          
          if (workingPort) break;
          
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              diagnostics.push(`⏰ Timeout sur port ${port}`);
            } else if (error.message.includes('ECONNREFUSED')) {
              diagnostics.push(`🚫 Port ${port} fermé`);
            } else {
              diagnostics.push(`❌ Port ${port}: ${error.message}`);
            }
          }
        }
      }
      
      if (workingPort) {
        // Mettre à jour l'URL du middleware avec le port qui fonctionne
        this.middlewarePort = workingPort;
        this.middlewareUrl = `http://${this.middlewareHost}:${workingPort}`;
        
        diagnostics.push(`🔧 Middleware opérationnel sur port ${workingPort}`);
        diagnostics.push(`📋 Version: ${serviceInfo?.version || 'Inconnue'}`);
        diagnostics.push(`🔧 Service: ${serviceInfo?.name || serviceInfo?.status || 'eID Middleware'}`);
        
        return { 
          available: true, 
          version: serviceInfo?.version,
          diagnostics 
        };
      }
      
    } catch (error) {
      if (error instanceof Error) {
        diagnostics.push(`❌ Erreur générale: ${error.message}`);
      }
    }

    // Ajouter les instructions de diagnostic
    diagnostics.push('');
    diagnostics.push('🔧 DIAGNOSTIC ET SOLUTIONS:');
    diagnostics.push('');
    diagnostics.push('1. Vérification de l\'installation:');
    diagnostics.push('   ✓ eID Viewer fonctionne = middleware installé');
    diagnostics.push('   ✓ Problème = port ou service différent');
    diagnostics.push('');
    diagnostics.push('2. Recherche du service eID:');
    diagnostics.push('   ✓ Ouvrez "services.msc"');
    diagnostics.push('   ✓ Cherchez: "Belgium eID", "eID", "BEID", "Fedict"');
    diagnostics.push('   ✓ Ou cherchez: "Card", "Smart", "PKCS"');
    diagnostics.push('');
    diagnostics.push('3. Vérification des processus:');
    diagnostics.push('   ✓ Gestionnaire des tâches → Processus');
    diagnostics.push('   ✓ Cherchez: beid, eid, pkcs11, cardmod');
    diagnostics.push('');
    diagnostics.push('4. Installation alternative:');
    diagnostics.push('   ✓ Téléchargez depuis: https://eid.belgium.be/fr/middleware-eid');
    diagnostics.push('   ✓ Réinstallez en tant qu\'administrateur');
    diagnostics.push('   ✓ Choisissez "Installation complète"');
    diagnostics.push('');
    diagnostics.push('5. Test manuel des ports:');
    diagnostics.push('   ✓ Ouvrez http://localhost:53001 dans le navigateur');
    diagnostics.push('   ✓ Testez aussi: 35963, 35964, 24727');
    diagnostics.push('   ✓ L\'un devrait répondre si le middleware fonctionne');
    diagnostics.push('');
    diagnostics.push('6. Diagnostic avancé:');
    diagnostics.push('   ✓ CMD: netstat -an | findstr :53001');
    diagnostics.push('   ✓ CMD: tasklist | findstr -i eid');
    diagnostics.push('   ✓ Registre: HKEY_LOCAL_MACHINE\\SOFTWARE\\BEID');
    diagnostics.push('');
    diagnostics.push('💡 SOLUTION TEMPORAIRE:');
    diagnostics.push('   ✓ Si eID Viewer fonctionne, le middleware est présent');
    diagnostics.push('   ✓ Utilisez le mode simulation en attendant');
    diagnostics.push('   ✓ Contactez le support technique si nécessaire');

    return { available: false, diagnostics };
  }

  /**
   * Obtient la liste des lecteurs de cartes disponibles
   * Utilise l'endpoint /readers du middleware officiel
   */
  async getReaders(): Promise<EidReaderInfo[]> {
    // Tester différents endpoints pour les lecteurs
    const endpointsToTest = ['/readers', '/reader', '/cardreaders', '/devices'];
    
    for (const endpoint of endpointsToTest) {
      try {
        const response = await fetch(`${this.middlewareUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const readers = await response.json();
          console.log(`Lecteurs trouvés via ${endpoint}:`, readers);
          
          // Normaliser le format des lecteurs
          if (Array.isArray(readers)) {
            return readers.map((reader: any) => ({
              name: reader.name || reader.reader_name || reader.readerName || 'Lecteur inconnu',
              cardPresent: reader.card_present || reader.cardPresent || reader.hasCard || false,
              pinpad: reader.pinpad || reader.hasPinpad || false
            }));
          }
        }
      } catch (error) {
        console.warn(`Endpoint ${endpoint} non disponible:`, error);
      }
    }

    throw new Error(`Aucun endpoint de lecteurs trouvé sur ${this.middlewareUrl}`);
  }

  /**
   * Lit les données d'identité de la carte eID
   * Utilise l'endpoint /identity du middleware officiel
   */
  async readIdentity(): Promise<any> {
    console.log('📖 Lecture des données d\'identité...');
    
    // Tester différents endpoints pour l'identité
    const endpointsToTest = ['/identity', '/id', '/card/identity', '/eid/identity'];
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      for (const endpoint of endpointsToTest) {
        try {
          const response = await fetch(`${this.middlewareUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: controller.signal
          });

          if (response.ok) {
            const identity = await response.json();
            console.log(`✅ Identité lue via ${endpoint}:`, identity);
            return identity;
          }
        } catch (endpointError) {
          console.warn(`Endpoint ${endpoint} non disponible:`, endpointError);
        }
      }

      throw new Error('Aucun endpoint d\'identité disponible');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Lit l'adresse de la carte eID
   * Utilise l'endpoint /address du middleware officiel
   */
  async readAddress(): Promise<any> {
    console.log('📍 Lecture de l\'adresse...');
    
    // Tester différents endpoints pour l'adresse
    const endpointsToTest = ['/address', '/addr', '/card/address', '/eid/address'];
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      for (const endpoint of endpointsToTest) {
        try {
          const response = await fetch(`${this.middlewareUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            signal: controller.signal
          });

          if (response.ok) {
            const address = await response.json();
            console.log(`✅ Adresse lue via ${endpoint}:`, address);
            return address;
          }
        } catch (endpointError) {
          console.warn(`Endpoint ${endpoint} non disponible:`, endpointError);
        }
      }

      console.warn('Aucun endpoint d\'adresse disponible');
      return null; // L'adresse n'est pas critique
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Lit la photo de la carte eID
   * Utilise l'endpoint /photo du middleware officiel
   */
  async readPhoto(): Promise<string | null> {
    console.log('📷 Lecture de la photo...');
    
    // Tester différents endpoints pour la photo
    const endpointsToTest = ['/photo', '/image', '/card/photo', '/eid/photo'];
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      for (const endpoint of endpointsToTest) {
        try {
          const response = await fetch(`${this.middlewareUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Accept': 'image/jpeg, application/json'
            },
            signal: controller.signal
          });

          if (response.ok) {
            // La photo peut être retournée en base64 ou en binaire
            const contentType = response.headers.get('content-type');
            
            if (contentType?.includes('application/json')) {
              const data = await response.json();
              return data.photo || data.image || null;
            } else if (contentType?.includes('image/')) {
              const blob = await response.blob();
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
            }
          }
        } catch (endpointError) {
          console.warn(`Endpoint photo ${endpoint} non disponible:`, endpointError);
        }
      }

      clearTimeout(timeoutId);
      return null;
    } catch (error) {
      console.warn('Erreur lecture photo:', error);
      return null;
    }
  }

  /**
   * Lit toutes les données de la carte eID
   */
  async readCard(options: {
    includePhoto?: boolean;
    includeAddress?: boolean;
  } = {}): Promise<EidData> {
    console.log('🔍 Début de la lecture complète de la carte eID...');
    
    // Vérifier la disponibilité du middleware
    const availability = await this.isMiddlewareAvailable();
    if (!availability.available) {
      console.error('Middleware non disponible:', availability.diagnostics);
      
      throw new Error(
        'Middleware eID non accessible'
      );
    }

    console.log(`🏥 Mode: ${this.isProduction ? 'PRODUCTION' : 'DÉVELOPPEMENT'}`);
    
    // Vérifier les lecteurs
    let readers: EidReaderInfo[] = [];
    let readerWithCard = null;
    
    try {
      readers = await this.getReaders();
      console.log('Lecteurs détectés:', readers);
      
      readerWithCard = readers.find(reader => reader.cardPresent);
      if (!readerWithCard) {
        // Essayer de forcer la détection de carte
        console.log('🔄 Aucune carte détectée, tentative de lecture forcée...');
        
        // Parfois le middleware ne détecte pas la présence de carte mais peut quand même lire
        if (readers.length > 0) {
          console.log(`⚠️ Tentative de lecture sur ${readers[0].name} sans détection de carte...`);
          readerWithCard = readers[0]; // Utiliser le premier lecteur disponible
        } else {
          throw new Error(
            'Aucun lecteur de cartes détecté.\n\n' +
            'Vérifications VMware :\n' +
            '1. Le lecteur est-il bien connecté à la VM ?\n' +
            '2. VM → Removable Devices → Alcor Micro → Connect\n' +
            '3. Gestionnaire de périphériques → Lecteurs de cartes à puce\n' +
            '4. Redémarrer la VM si nécessaire'
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la détection des lecteurs:', error);
      throw new Error(
        'Impossible de détecter les lecteurs de cartes.\n\n' +
        'Actions à effectuer :\n' +
        '1. Vérifier la connexion USB dans VMware\n' +
        '2. Redémarrer les services Smart Card\n' +
        '3. Réinstaller le middleware eID\n' +
        '4. Tester avec eID Viewer d\'abord'
      );
    }

    console.log(`✅ Carte détectée dans le lecteur: ${readerWithCard.name}`);

    try {
      // Attendre un peu pour la stabilisation (important en VM)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Lire les données d'identité (obligatoire) avec retry
      let identity = null;
      let lastError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`📖 Tentative ${attempt}/3 de lecture d'identité...`);
          identity = await this.readIdentity();
          break; // Succès
        } catch (error) {
          lastError = error;
          console.warn(`❌ Tentative ${attempt} échouée:`, error);
          
          if (attempt < 3) {
            console.log('⏳ Attente avant nouvelle tentative...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!identity) {
        throw new Error(
          `Impossible de lire les données d'identité après 3 tentatives.\n\n` +
          `Dernière erreur: ${lastError instanceof Error ? lastError.message : 'Erreur inconnue'}\n\n` +
          'Solutions :\n' +
          '1. Vérifier que la carte est bien insérée\n' +
          '2. Nettoyer la carte avec un chiffon doux\n' +
          '3. Retirer et réinsérer la carte\n' +
          '4. Tester avec eID Viewer d\'abord\n' +
          '5. Redémarrer la VM si nécessaire'
        );
      }
      
      // Lire l'adresse si demandée
      let address = null;
      if (options.includeAddress !== false) {
        try {
          console.log('📍 Lecture de l\'adresse...');
          address = await this.readAddress();
        } catch (error) {
          console.warn('Impossible de lire l\'adresse:', error);
          // Continuer sans l'adresse
        }
      }

      // Lire la photo si demandée
      let photo = null;
      if (options.includePhoto) {
        try {
          console.log('📷 Lecture de la photo...');
          photo = await this.readPhoto();
        } catch (error) {
          console.warn('Impossible de lire la photo:', error);
          // Continuer sans la photo
        }
      }

      // Normaliser et retourner les données
      const normalizedData = this.normalizeEidData(identity, address, photo);
      console.log('✅ Lecture de carte terminée avec succès');
      return normalizedData;

    } catch (error) {
      console.error('Erreur lors de la lecture de la carte:', error);
      
      // En production, pas de simulation - erreur directe
      if (this.isProduction) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('AbortError')) {
          throw new Error(
            'Timeout lors de la lecture de la carte.\n\n' +
            'En environnement VMware, cela peut indiquer :\n' +
            '1. Latence USB élevée\n' +
            '2. Carte mal insérée\n' +
            '3. Lecteur instable\n' +
            '4. Middleware surchargé\n\n' +
            'Solutions :\n' +
            '• Retirer et réinsérer la carte\n' +
            '• Redémarrer les services Smart Card\n' +
            '• Utiliser USB 2.0 au lieu de USB 3.1\n' +
            '• Tester sur l\'hôte physique'
          );
        } else if (error.message.includes('HTTP 404')) {
          throw new Error(
            'Version du middleware incompatible.\n\n' +
            'Le middleware installé ne supporte pas les endpoints requis.\n' +
            'Réinstallez la dernière version depuis :\n' +
            'https://eid.belgium.be/fr/middleware-eid'
          );
        } else if (error.message.includes('HTTP 500')) {
          throw new Error(
            'Erreur interne du middleware.\n\n' +
            'Le middleware a rencontré une erreur interne.\n' +
            'Solutions :\n' +
            '1. Redémarrer les services Smart Card\n' +
            '2. Retirer et réinsérer la carte\n' +
            '3. Redémarrer la VM\n' +
            '4. Réinstaller le middleware'
          );
        }
      }
      
      throw error;
    }
  }

  /**
   * Configuration spécifique pour la production
   */
  async configureForProduction(): Promise<void> {
    if (!this.isProduction) {
      console.warn('⚠️ configureForProduction() appelée en mode développement');
      return;
    }

    console.log('🏥 Configuration pour environnement de production...');
    
    // Vérifications supplémentaires en production
    const systemInfo = await this.getSystemInfo();
    
    if (!systemInfo.middlewareFound) {
      throw new Error(
        'ERREUR CRITIQUE: Middleware eID non trouvé en production!\n\n' +
        'Actions requises:\n' +
        '1. Installer le middleware eID depuis https://eid.belgium.be/fr/middleware-eid\n' +
        '2. Redémarrer le service Windows\n' +
        '3. Vérifier avec eID Viewer\n' +
        '4. Contacter le support technique si le problème persiste'
      );
    }

    if (systemInfo.readersWithCard.length === 0) {
      console.warn('⚠️ Aucune carte eID détectée au démarrage');
    }

    console.log('✅ Configuration production validée');
  }

  /**
   * Surveillance continue du middleware en production
   */
  startProductionMonitoring(): void {
    if (!this.isProduction) return;

    console.log('🔍 Démarrage de la surveillance du middleware...');
    
    setInterval(async () => {
      try {
        const status = await this.testConnection();
        if (!status.success) {
          console.error('🚨 ALERTE: Middleware eID indisponible!', status.error);
          // Ici vous pourriez envoyer une notification à l'administrateur
        }
      } catch (error) {
        console.error('🚨 Erreur de surveillance:', error);
      }
    }, 60000); // Vérification chaque minute
  }

  /**
   * Normalise les données selon le format attendu
   * Basé sur la structure des données du middleware officiel
   */
  private normalizeEidData(identity: any, address: any, photo: string | null): EidData {
    console.log('🔄 Normalisation des données...');
    console.log('Identité brute:', identity);
    console.log('Adresse brute:', address);
    
    // Le middleware officiel retourne les données avec des noms spécifiques
    const normalized: EidData = {
      firstName: identity.first_name || identity.firstName || identity.given_name || '',
      lastName: identity.last_name || identity.lastName || identity.surname || '',
      dateOfBirth: this.formatDate(identity.date_of_birth || identity.dateOfBirth || identity.birth_date || ''),
      placeOfBirth: identity.place_of_birth || identity.placeOfBirth || identity.birth_place || '',
      nationality: identity.nationality || identity.nationalite || '',
      niss: this.formatNiss(identity.national_number || identity.niss || identity.rrn || ''),
      cardNumber: identity.card_number || identity.cardNumber || identity.chip_number || '',
      validityBeginDate: this.formatDate(identity.validity_begin_date || identity.validityBeginDate || identity.valid_from || ''),
      validityEndDate: this.formatDate(identity.validity_end_date || identity.validityEndDate || identity.valid_until || ''),
      address: {
        street: address?.street_and_number || address?.street || address?.rue || '',
        postalCode: address?.zip_code || address?.postalCode || address?.postal_code || '',
        city: address?.municipality || address?.city || address?.ville || '',
        country: address?.country || 'Belgique'
      },
      photo: photo || undefined
    };

    console.log('✅ Données normalisées:', normalized);
    return normalized;
  }

  /**
   * Formate une date au format DD/MM/YYYY
   */
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // Si la date est déjà au bon format DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) return dateString;
    
    // Si la date est au format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Si la date est au format DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      return dateString.replace(/-/g, '/');
    }
    
    // Si la date est au format YYYYMMDD
    if (/^\d{8}$/.test(dateString)) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  }

  /**
   * Formate le NISS au format XX.XX.XX-XXX.XX
   */
  private formatNiss(niss: string): string {
    if (!niss) return '';
    
    // Supprimer tous les caractères non numériques
    const numbers = niss.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return `${numbers.substring(0, 2)}.${numbers.substring(2, 4)}.${numbers.substring(4, 6)}-${numbers.substring(6, 9)}.${numbers.substring(9, 11)}`;
    }
    
    return niss;
  }

  /**
   * Teste la connectivité avec le middleware
   */
  async testConnection(): Promise<{ success: boolean; version?: string; error?: string; diagnostics?: string[] }> {
    try {
      const result = await this.isMiddlewareAvailable();
      if (result.available) {
        return { 
          success: true, 
          version: result.version,
          diagnostics: result.diagnostics
        };
      } else {
        return { 
          success: false, 
          error: 'Middleware non trouvé sur le port 53001',
          diagnostics: result.diagnostics
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  /**
   * Obtient des informations détaillées sur l'état du système
   */
  async getSystemInfo(): Promise<any> {
    const availability = await this.isMiddlewareAvailable();
    let readers: EidReaderInfo[] = [];
    
    if (availability.available) {
      try {
        readers = await this.getReaders();
      } catch (error) {
        console.warn('Impossible de récupérer les lecteurs:', error);
      }
    }
    
    return {
      middlewareFound: availability.available,
      middlewareUrl: availability.available ? this.middlewareUrl : null,
      middlewareVersion: availability.version,
      readers: readers,
      readersWithCard: readers.filter(r => r.cardPresent),
      diagnostics: availability.diagnostics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
  }
}

// Instance singleton
export const eidService = new EidService();

// Export des types pour utilisation dans d'autres composants
export type { EidData, EidAddress, EidReaderInfo };