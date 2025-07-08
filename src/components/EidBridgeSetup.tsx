import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  ExternalLink,
  Settings,
  Play,
  RefreshCw,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';
import { eidBridgeService } from '../services/eidBridgeService';

const EidBridgeSetup: React.FC = () => {
  const [bridgeStatus, setBridgeStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const [statusData, setStatusData] = useState<any>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    checkBridgeStatus();
    
    // Vérifier le statut périodiquement
    const interval = setInterval(checkBridgeStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkBridgeStatus = async () => {
    try {
      const result = await eidBridgeService.isBridgeAvailable();
      
      if (result.available) {
        setBridgeStatus('available');
        setStatusData(result.status);
      } else {
        setBridgeStatus('unavailable');
        setStatusData({ error: result.error });
      }
    } catch (error) {
      setBridgeStatus('unavailable');
      setStatusData({ error: 'Erreur de connexion' });
    }
  };

  const handleDownload = () => {
    setIsInstalling(true);
    
    // Simuler le téléchargement (en réalité, cela ouvrirait un lien de téléchargement)
    setTimeout(() => {
      setIsInstalling(false);
      alert('Le téléchargement va commencer. Exécutez le fichier en tant qu\'administrateur après téléchargement.');
    }, 2000);
  };

  const renderStatusIndicator = () => {
    switch (bridgeStatus) {
      case 'checking':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Vérification...</span>
          </div>
        );
      
      case 'available':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span>Service opérationnel</span>
          </div>
        );
      
      case 'unavailable':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Service non disponible</span>
          </div>
        );
    }
  };

  const renderDetailedStatus = () => {
    if (bridgeStatus === 'available' && statusData) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-3">État du Service</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-700 font-medium">Version:</span>
              <p className="text-green-900">{statusData.version}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Middleware:</span>
              <p className="text-green-900">{statusData.middleware}</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Lecteurs:</span>
              <p className="text-green-900">{statusData.readers} total</p>
            </div>
            <div>
              <span className="text-green-700 font-medium">Cartes:</span>
              <p className="text-green-900">{statusData.readersWithCard} détectée(s)</p>
            </div>
          </div>
          
          {statusData.lastRead && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <span className="text-green-700 font-medium">Dernière lecture:</span>
              <p className="text-green-900 text-sm">
                {new Date(statusData.lastRead).toLocaleString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (bridgeStatus === 'unavailable') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Service Non Disponible</h4>
          <p className="text-red-700 text-sm mb-3">
            {statusData?.error || 'L\'application eID Bridge n\'est pas installée ou démarrée.'}
          </p>
          
          <div className="space-y-2 text-sm text-red-700">
            <p><strong>Solutions possibles :</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Installer l'application eID Bridge</li>
              <li>Vérifier que le service Windows est démarré</li>
              <li>Exécuter en tant qu'administrateur</li>
              <li>Vérifier le pare-feu Windows</li>
            </ul>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Monitor className="w-5 h-5 mr-2 text-blue-600" />
            Application eID Bridge Windows
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Service Windows pour la lecture sécurisée des cartes eID
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={checkBridgeStatus}
            className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            title="Actualiser le statut"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {renderStatusIndicator()}
        </div>
      </div>

      {/* Statut détaillé */}
      {renderDetailedStatus()}

      {/* Actions selon le statut */}
      {bridgeStatus === 'unavailable' && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-3">Installation Requise</h4>
            <p className="text-blue-700 text-sm mb-4">
              L'application eID Bridge Windows doit être installée pour lire les cartes eID.
              Cette solution résout définitivement les problèmes de VMware et de middleware.
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDownload}
                disabled={isInstalling}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isInstalling ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isInstalling ? 'Préparation...' : 'Télécharger eID Bridge'}</span>
              </button>
              
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Instructions</span>
              </button>
            </div>
          </div>

          {/* Instructions détaillées */}
          {showInstructions && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Instructions d'Installation</h5>
              
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <h6 className="font-medium text-gray-900">1. Téléchargement</h6>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Téléchargez <code>OphtalmoPro-eID-Bridge-Setup.exe</code></li>
                    <li>Ou téléchargez le fichier ZIP et extrayez-le</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-gray-900">2. Installation</h6>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><strong>Clic droit</strong> sur l'installateur → <strong>"Exécuter en tant qu'administrateur"</strong></li>
                    <li>Suivez l'assistant d'installation</li>
                    <li>Redémarrez si demandé</li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-gray-900">3. Vérification</h6>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Ouvrez <code>services.msc</code></li>
                    <li>Vérifiez que <strong>"OphtalmoPro eID Bridge"</strong> est démarré</li>
                    <li>Testez avec <code>https://localhost:8443/</code></li>
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-gray-900">4. Dépannage</h6>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>Exécutez <code>test-connection.bat</code> pour diagnostiquer</li>
                    <li>Vérifiez les logs dans <code>C:\ProgramData\OphtalmoPro\eID-Bridge\Logs\</code></li>
                    <li>Assurez-vous que le middleware eID belge est installé</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm">
                  <strong>Important :</strong> Cette solution résout définitivement les problèmes 
                  de VMware, de lecteurs USB et de middleware. Une fois installée, 
                  la lecture des cartes eID fonctionnera de manière fiable.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Avantages de la solution */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-3">✅ Avantages de l'eID Bridge</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-700">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>Résout les problèmes VMware</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>Compatible tous lecteurs</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>Sécurité maximale</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>Installation simple</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>Monitoring intégré</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <span>Support technique</span>
          </div>
        </div>
      </div>

      {/* Liens utiles */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <a
            href="https://localhost:8443/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Interface Bridge</span>
          </a>
          
          <a
            href="https://localhost:8443/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Documentation API</span>
          </a>
        </div>
        
        <span>Version recommandée: 1.0.0</span>
      </div>
    </div>
  );
};

export default EidBridgeSetup;