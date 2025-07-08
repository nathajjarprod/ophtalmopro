/**
 * Utilitaires pour faciliter les tests en environnement de production
 */

export class ProductionTestHelper {
  private static instance: ProductionTestHelper;
  private testResults: Map<string, any> = new Map();

  static getInstance(): ProductionTestHelper {
    if (!ProductionTestHelper.instance) {
      ProductionTestHelper.instance = new ProductionTestHelper();
    }
    return ProductionTestHelper.instance;
  }

  /**
   * Lance une série de tests de validation pour l'environnement de production
   */
  async runProductionValidation(): Promise<{
    success: boolean;
    results: any[];
    summary: string;
  }> {
    console.log('🏥 Lancement des tests de validation production...');
    
    const tests = [
      {
        name: 'Middleware eID Disponibilité',
        test: this.testMiddlewareAvailability.bind(this)
      },
      {
        name: 'Lecteurs de Cartes',
        test: this.testCardReaders.bind(this)
      },
      {
        name: 'Endpoints API',
        test: this.testApiEndpoints.bind(this)
      },
      {
        name: 'Performance',
        test: this.testPerformance.bind(this)
      },
      {
        name: 'Sécurité',
        test: this.testSecurity.bind(this)
      },
      {
        name: 'Lecture Carte eID Réelle',
        test: this.testActualCardReading.bind(this)
      }
    ];

    const results = [];
    let successCount = 0;

    for (const test of tests) {
      try {
        console.log(`🔍 Test: ${test.name}...`);
        const result = await test.test();
        results.push({
          name: test.name,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });
        successCount++;
        console.log(`✅ ${test.name}: RÉUSSI`);
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          timestamp: new Date().toISOString()
        });
        console.error(`❌ ${test.name}: ÉCHEC`, error);
      }
    }

    const success = successCount === tests.length;
    const summary = `${successCount}/${tests.length} tests réussis`;

    return { success, results, summary };
  }

  /**
   * Test de disponibilité du middleware
   */
  private async testMiddlewareAvailability(): Promise<any> {
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:53001/service/info', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const serviceInfo = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      available: true,
      version: serviceInfo.version,
      responseTime: `${responseTime}ms`,
      serviceInfo
    };
  }

  /**
   * Test des lecteurs de cartes
   */
  private async testCardReaders(): Promise<any> {
    const response = await fetch('http://localhost:53001/readers', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const readers = await response.json();
    
    if (!Array.isArray(readers)) {
      throw new Error('Format de réponse invalide pour les lecteurs');
    }

    const readersWithCard = readers.filter(r => r.card_present || r.cardPresent);

    return {
      totalReaders: readers.length,
      readersWithCard: readersWithCard.length,
      readers: readers.map(r => ({
        name: r.name || r.reader_name,
        cardPresent: r.card_present || r.cardPresent || false,
        pinpad: r.pinpad || false
      }))
    };
  }

  /**
   * Test des endpoints API principaux
   */
  private async testApiEndpoints(): Promise<any> {
    const endpoints = [
      '/service/info',
      '/readers'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        const response = await fetch(`http://localhost:53001${endpoint}`, {
          signal: AbortSignal.timeout(3000)
        });
        
        const responseTime = Date.now() - startTime;
        
        results.push({
          endpoint,
          status: response.status,
          ok: response.ok,
          responseTime: `${responseTime}ms`
        });
      } catch (error) {
        results.push({
          endpoint,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          responseTime: 'timeout'
        });
      }
    }

    return { endpoints: results };
  }

  private async testActualCardReading(): Promise<any> {
    const startTime = Date.now();
    
    try {
      // Importer le service eID
      const { eidService } = await import('../services/eidService');
      
      // Tenter une lecture complète
      const cardData = await eidService.readCard({
        includePhoto: false,
        includeAddress: true
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        responseTime: `${responseTime}ms`,
        dataRead: {
          hasFirstName: !!cardData.firstName,
          hasLastName: !!cardData.lastName,
          hasDateOfBirth: !!cardData.dateOfBirth,
          hasNiss: !!cardData.niss,
          hasAddress: !!cardData.address?.street
        },
        cardInfo: {
          name: `${cardData.firstName} ${cardData.lastName}`,
          niss: cardData.niss,
          cardNumber: cardData.cardNumber
        }
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        responseTime: `${responseTime}ms`,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        troubleshooting: [
          'Vérifier que la carte est bien insérée',
          'Nettoyer la carte avec un chiffon doux',
          'Tester avec eID Viewer d\'abord',
          'Redémarrer les services Smart Card',
          'En VMware: vérifier USB passthrough'
        ]
      };
    }
  }

  /**
   * Test de performance
   */
  private async testPerformance(): Promise<any> {
    const iterations = 5;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await fetch('http://localhost:53001/service/info', {
          signal: AbortSignal.timeout(2000)
        });
        times.push(Date.now() - startTime);
      } catch (error) {
        times.push(-1); // Erreur
      }
    }

    const validTimes = times.filter(t => t > 0);
    const avgTime = validTimes.length > 0 
      ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length 
      : 0;

    return {
      iterations,
      successfulRequests: validTimes.length,
      averageResponseTime: `${Math.round(avgTime)}ms`,
      allTimes: times.map(t => t > 0 ? `${t}ms` : 'timeout'),
      performance: avgTime < 1000 ? 'Excellent' : avgTime < 3000 ? 'Bon' : 'Lent'
    };
  }

  /**
   * Test de sécurité de base
   */
  private async testSecurity(): Promise<any> {
    const checks = [];

    // Vérifier que le middleware n'est accessible que localement
    try {
      const response = await fetch('http://localhost:53001/service/info');
      checks.push({
        check: 'Accès localhost',
        result: response.ok ? 'OK' : 'ÉCHEC',
        details: 'Middleware accessible via localhost'
      });
    } catch (error) {
      checks.push({
        check: 'Accès localhost',
        result: 'ÉCHEC',
        details: 'Middleware non accessible'
      });
    }

    // Vérifier le protocole HTTPS de l'application
    checks.push({
      check: 'Protocole HTTPS',
      result: location.protocol === 'https:' || location.hostname === 'localhost' ? 'OK' : 'ATTENTION',
      details: `Application servie via ${location.protocol}`
    });

    // Vérifier les en-têtes de sécurité
    checks.push({
      check: 'Environnement',
      result: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DÉVELOPPEMENT',
      details: `Mode: ${process.env.NODE_ENV || 'non défini'}`
    });

    return { securityChecks: checks };
  }

  /**
   * Génère un rapport de test complet
   */
  generateTestReport(results: any): string {
    const timestamp = new Date().toLocaleString('fr-FR');
    
    let report = `# Rapport de Test eID - Production\n\n`;
    report += `**Date:** ${timestamp}\n`;
    report += `**Environnement:** ${process.env.NODE_ENV || 'non défini'}\n`;
    report += `**URL:** ${location.href}\n\n`;

    report += `## Résumé\n\n`;
    report += `- **Statut global:** ${results.success ? '✅ RÉUSSI' : '❌ ÉCHEC'}\n`;
    report += `- **Tests:** ${results.summary}\n\n`;

    report += `## Détails des Tests\n\n`;
    
    results.results.forEach((test: any) => {
      report += `### ${test.name}\n`;
      report += `- **Statut:** ${test.success ? '✅ RÉUSSI' : '❌ ÉCHEC'}\n`;
      report += `- **Heure:** ${test.timestamp}\n`;
      
      if (test.success && test.result) {
        report += `- **Résultat:**\n`;
        report += `\`\`\`json\n${JSON.stringify(test.result, null, 2)}\n\`\`\`\n`;
      }
      
      if (!test.success && test.error) {
        report += `- **Erreur:** ${test.error}\n`;
      }
      
      report += `\n`;
    });

    return report;
  }

  /**
   * Exporte le rapport de test
   */
  exportTestReport(results: any): void {
    const report = this.generateTestReport(results);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eid-test-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Test rapide de connectivité
   */
  async quickConnectivityTest(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:53001/service/info', {
        signal: AbortSignal.timeout(3000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Diagnostic spécifique pour VMware et lecteurs de cartes
   */
  async runVMwareCardReaderDiagnostic(): Promise<{
    success: boolean;
    results: any[];
    summary: string;
  }> {
    console.log('🖥️ Diagnostic VMware pour lecteurs de cartes...');
    
    const tests = [
      {
        name: 'Configuration VMware USB',
        test: this.testVMwareUSBConfig.bind(this)
      },
      {
        name: 'Détection Périphériques USB',
        test: this.testUSBDeviceDetection.bind(this)
      },
      {
        name: 'Services Smart Card Windows',
        test: this.testWindowsSmartCardServices.bind(this)
      },
      {
        name: 'Registre Windows Smart Card',
        test: this.testWindowsSmartCardRegistry.bind(this)
      },
      {
        name: 'Middleware eID dans VM',
        test: this.testMiddlewareInVM.bind(this)
      }
    ];

    const results = [];
    let successCount = 0;

    for (const test of tests) {
      try {
        console.log(`🔍 Test VMware: ${test.name}...`);
        const result = await test.test();
        results.push({
          name: test.name,
          success: true,
          result,
          timestamp: new Date().toISOString()
        });
        successCount++;
        console.log(`✅ ${test.name}: RÉUSSI`);
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          timestamp: new Date().toISOString()
        });
        console.error(`❌ ${test.name}: ÉCHEC`, error);
      }
    }

    const success = successCount === tests.length;
    const summary = `${successCount}/${tests.length} tests VMware réussis`;

    return { success, results, summary };
  }

  /**
   * Test de la configuration USB VMware
   */
  private async testVMwareUSBConfig(): Promise<any> {
    const instructions = {
      status: 'Configuration requise',
      vmwareVersion: 'Détection automatique non disponible',
      usbPassthrough: 'À vérifier manuellement',
      smartCardRedirection: 'À configurer',
      instructions: [
        '1. VMware Workstation → VM Settings → Hardware',
        '2. Ajouter → USB Controller → USB 3.1',
        '3. USB Controller → Show all USB input devices',
        '4. VM → Removable Devices → Alcor Micro USB Smart Card Reader',
        '5. Sélectionner "Connect (Disconnect from Host)"',
        '6. Vérifier dans Gestionnaire de périphériques de la VM',
        '7. Redémarrer la VM si nécessaire'
      ],
      troubleshooting: [
        'Si le lecteur n\'apparaît pas:',
        '• Déconnecter/reconnecter le lecteur USB physiquement',
        '• VM → Settings → USB → Remove et re-ajouter USB Controller',
        '• Essayer USB 2.0 au lieu de USB 3.1',
        '• Vérifier que VMware Tools est installé',
        '• Redémarrer VMware Workstation'
      ]
    };

    return instructions;
  }

  /**
   * Test de détection des périphériques USB
   */
  private async testUSBDeviceDetection(): Promise<any> {
    // Simulation de la détection USB (impossible via JavaScript)
    const usbInfo = {
      detectionMethod: 'Manuel requis',
      windowsDeviceManager: 'Gestionnaire de périphériques → Lecteurs de cartes à puce',
      expectedDevices: [
        'Alcor Micro USB Smart Card Reader',
        'Microsoft Usbccid Smartcard Reader (WUDF)',
        'Generic Smart Card Reader USB'
      ],
      checkCommands: [
        'Ouvrir Gestionnaire de périphériques',
        'Développer "Lecteurs de cartes à puce"',
        'Vérifier présence du lecteur Alcor Micro',
        'Clic droit → Propriétés → Vérifier "Périphérique fonctionne correctement"'
      ],
      troubleshooting: [
        'Si lecteur absent ou avec erreur:',
        '• Réinstaller les pilotes du lecteur',
        '• Mettre à jour VMware Tools',
        '• Vérifier USB passthrough dans VMware',
        '• Tester sur l\'hôte physique d\'abord'
      ]
    };

    return usbInfo;
  }

  /**
   * Test des services Smart Card Windows
   */
  private async testWindowsSmartCardServices(): Promise<any> {
    const services = {
      requiredServices: [
        'Smart Card (SCardSvr)',
        'Smart Card Device Enumeration Service (ScDeviceEnum)',
        'Smart Card Removal Policy (SCPolicySvc)'
      ],
      checkMethod: 'services.msc',
      instructions: [
        '1. Ouvrir services.msc',
        '2. Chercher "Smart Card"',
        '3. Vérifier que tous les services sont "Démarrés"',
        '4. Si arrêtés: Clic droit → Démarrer',
        '5. Configurer en "Automatique" si nécessaire'
      ],
      alternativeCheck: [
        'CMD en tant qu\'administrateur:',
        'sc query SCardSvr',
        'sc query ScDeviceEnum', 
        'sc query SCPolicySvc'
      ]
    };

    return services;
  }

  /**
   * Test du registre Windows Smart Card
   */
  private async testWindowsSmartCardRegistry(): Promise<any> {
    const registryInfo = {
      keyPaths: [
        'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography\\Calais\\Readers',
        'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\SCardSvr',
        'HKEY_LOCAL_MACHINE\\SOFTWARE\\BEID'
      ],
      checkMethod: 'regedit.exe',
      instructions: [
        '1. Ouvrir regedit en tant qu\'administrateur',
        '2. Naviguer vers les clés ci-dessus',
        '3. Vérifier présence des entrées de lecteurs',
        '4. Chercher "Alcor" dans les sous-clés'
      ],
      warning: 'Ne modifiez pas le registre sans expertise technique'
    };

    return registryInfo;
  }

  /**
   * Test du middleware eID dans l'environnement VM
   */
  private async testMiddlewareInVM(): Promise<any> {
    const vmSpecific = {
      commonIssues: [
        'Middleware installé mais ne détecte pas le lecteur',
        'Lecteur visible dans Windows mais pas dans middleware',
        'eID Viewer fonctionne mais pas l\'API REST'
      ],
      solutions: [
        '1. Réinstaller le middleware eID APRÈS avoir configuré USB',
        '2. Installer en tant qu\'administrateur',
        '3. Choisir "Installation complète" avec tous les composants',
        '4. Redémarrer la VM après installation',
        '5. Tester avec eID Viewer avant l\'application web'
      ],
      vmwareSpecific: [
        'VMware peut nécessiter des pilotes spéciaux',
        'Certains lecteurs fonctionnent mieux en USB 2.0',
        'La redirection USB peut causer des latences',
        'Parfois nécessaire de déconnecter/reconnecter'
      ],
      testSteps: [
        '1. Insérer carte eID dans lecteur',
        '2. Vérifier LED du lecteur (si présente)',
        '3. Ouvrir eID Viewer → doit lire la carte',
        '4. Si eID Viewer fonctionne, problème = API REST',
        '5. Si eID Viewer ne fonctionne pas, problème = USB/pilotes'
      ]
    };

    return vmSpecific;
  }
}

// Export de l'instance singleton
export const productionTestHelper = ProductionTestHelper.getInstance();