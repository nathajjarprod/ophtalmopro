import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings,
  AlertTriangle,
  Info
} from 'lucide-react';
import { productionTestHelper } from '../utils/productionTestHelper';

const ProductionTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [quickStatus, setQuickStatus] = useState<boolean | null>(null);

  const runQuickTest = async () => {
    setQuickStatus(null);
    const isConnected = await productionTestHelper.quickConnectivityTest();
    setQuickStatus(isConnected);
  };

  const runFullValidation = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await productionTestHelper.runProductionValidation();
      setTestResults(results);
    } catch (error) {
      console.error('Erreur lors des tests:', error);
      setTestResults({
        success: false,
        results: [],
        summary: 'Erreur lors de l\'exécution des tests',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runVMwareCardReaderTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      const results = await productionTestHelper.runVMwareCardReaderDiagnostic();
      setTestResults(results);
    } catch (error) {
      console.error('Erreur lors du diagnostic VMware:', error);
      setTestResults({
        success: false,
        results: [],
        summary: 'Erreur lors du diagnostic VMware',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsRunning(false);
    }
  };
  const exportReport = () => {
    if (testResults) {
      productionTestHelper.exportTestReport(testResults);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Tests de Production eID
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Validation complète de l'environnement de production
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={runQuickTest}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Test Rapide</span>
          </button>
          
          <button
            onClick={runVMwareCardReaderTest}
            disabled={isRunning}
            className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Diagnostic VMware</span>
          </button>
          
          <button
            onClick={runFullValidation}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Tests en cours...' : 'Tests Complets'}</span>
          </button>
        </div>
      </div>

      {/* Test rapide */}
      {quickStatus !== null && (
        <div className={`p-4 rounded-lg mb-4 ${
          quickStatus ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {getStatusIcon(quickStatus)}
            <div className="ml-3">
              <p className={`font-medium ${quickStatus ? 'text-green-800' : 'text-red-800'}`}>
                {quickStatus ? 'Middleware eID Accessible' : 'Middleware eID Non Accessible'}
              </p>
              <p className={`text-sm ${quickStatus ? 'text-green-600' : 'text-red-600'}`}>
                {quickStatus 
                  ? 'Le middleware répond correctement sur le port 53001'
                  : 'Vérifiez que le middleware eID est installé et démarré'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de chargement */}
      {isRunning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div>
              <p className="font-medium text-blue-800">Tests en cours d'exécution...</p>
              <p className="text-sm text-blue-600">Validation de l'environnement de production</p>
            </div>
          </div>
        </div>
      )}

      {/* Résultats des tests */}
      {testResults && (
        <div className="space-y-4">
          {/* Résumé */}
          <div className={`p-4 rounded-lg ${
            testResults.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(testResults.success)}
                <div className="ml-3">
                  <p className={`font-medium ${
                    testResults.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResults.success ? 'Tous les tests réussis' : 'Certains tests ont échoué'}
                  </p>
                  <p className={`text-sm ${
                    testResults.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {testResults.summary}
                  </p>
                </div>
              </div>
              
              <button
                onClick={exportReport}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
            </div>
          </div>

          {/* Détails des tests */}
          <div className="space-y-3">
            {testResults.results.map((test: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(test.success)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{test.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(test.timestamp).toLocaleString('fr-FR')}
                      </p>
                      
                      {test.success && test.result && (
                        <div className="mt-2">
                          <details className="text-sm">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                              Voir les détails
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                              {JSON.stringify(test.result, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                      
                      {!test.success && test.error && (
                        <div className="mt-2 p-2 bg-red-50 rounded">
                          <p className="text-sm text-red-600">{test.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Erreur globale */}
          {testResults.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Erreur lors des tests</p>
                  <p className="text-sm text-red-600">{testResults.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informations d'aide */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Guide de Test Production & VMware</p>
            <p className="text-sm text-blue-600 mt-1">
              Consultez le fichier <code>docs/PRODUCTION_TEST_SETUP.md</code> pour un guide complet 
              de configuration et de test en environnement de production.
            </p>
            <div className="mt-2 text-sm text-blue-600">
              <p><strong>Prérequis :</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Middleware eID belge installé</li>
                <li>Lecteur de cartes connecté</li>
                <li>Carte eID valide insérée</li>
                <li>Service Windows démarré</li>
                <li><strong>VMware :</strong> USB passthrough configuré</li>
                <li><strong>VMware :</strong> Smart Card redirection activée</li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="font-medium text-orange-800">⚠️ Configuration VMware Spéciale</p>
              <p className="text-sm text-orange-600 mt-1">
                Si vous utilisez VMware, cliquez sur "Diagnostic VMware" pour des instructions spécifiques.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionTestPanel;