import React, { useState } from 'react';
import { 
  Smartphone, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Info,
  ExternalLink
} from 'lucide-react';
import { itsmeService, type ItsmeUserData } from '../services/itsmeService';

interface ItsmeAuthButtonProps {
  onSuccess: (userData: ItsmeUserData) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const ItsmeAuthButton: React.FC<ItsmeAuthButtonProps> = ({ 
  onSuccess, 
  onError, 
  disabled = false 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [itsmeAvailable, setItsmeAvailable] = useState<boolean | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Vérifier la disponibilité d'itsme au montage
  React.useEffect(() => {
    checkItsmeAvailability();
  }, []);

  const checkItsmeAvailability = async () => {
    try {
      const status = await itsmeService.checkAvailability();
      setItsmeAvailable(status.available);
      if (!status.available) {
        console.warn('itsme non disponible:', status.message);
      }
    } catch (error) {
      setItsmeAvailable(false);
      console.error('Erreur vérification itsme:', error);
    }
  };

  const handleAuthentication = async () => {
    setIsAuthenticating(true);
    
    try {
      console.log('🔐 Démarrage authentification itsme...');
      
      // En mode développement ou si itsme n'est pas disponible, utiliser la simulation
      const useSimulation = !itsmeAvailable || process.env.NODE_ENV !== 'production';
      
      if (useSimulation) {
        console.log('🎭 Mode simulation itsme activé');
      }
      
      const userData = await itsmeService.getPatientData(useSimulation);
      
      console.log('✅ Authentification itsme réussie:', userData);
      onSuccess(userData);
      
    } catch (error) {
      console.error('❌ Erreur authentification itsme:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur d\'authentification itsme';
      onError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getButtonContent = () => {
    if (isAuthenticating) {
      return (
        <>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Authentification...</span>
        </>
      );
    }

    if (itsmeAvailable === false) {
      return (
        <>
          <Smartphone className="w-5 h-5" />
          <span>itsme (Mode démo)</span>
        </>
      );
    }

    return (
      <>
        <Smartphone className="w-5 h-5" />
        <span>Authentifier avec itsme</span>
      </>
    );
  };

  const getButtonStyle = () => {
    const baseStyle = "flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ";
    
    if (disabled || isAuthenticating) {
      return baseStyle + "bg-gray-300 text-gray-500 cursor-not-allowed";
    }
    
    if (itsmeAvailable === false) {
      return baseStyle + "bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl";
    }
    
    // Style officiel itsme (bleu)
    return baseStyle + "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl";
  };

  return (
    <div className="space-y-4">
      {/* Bouton principal */}
      <button
        onClick={handleAuthentication}
        disabled={disabled || isAuthenticating}
        className={getButtonStyle()}
      >
        {getButtonContent()}
      </button>

      {/* Indicateur de statut */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          {itsmeAvailable === true && (
            <>
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-600">Service itsme disponible</span>
            </>
          )}
          {itsmeAvailable === false && (
            <>
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-orange-600">Mode démonstration</span>
            </>
          )}
          {itsmeAvailable === null && (
            <>
              <Loader className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-gray-500">Vérification...</span>
            </>
          )}
        </div>
        
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <Info className="w-4 h-4" />
          <span>Info</span>
        </button>
      </div>

      {/* Panneau d'information */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">À propos d'itsme</h4>
              <p className="text-sm text-blue-700 mt-1">
                itsme est le service d'identité numérique officiel belge. Il permet une 
                authentification sécurisée et la récupération automatique de vos données 
                d'identité sans lecteur de cartes physique.
              </p>
            </div>
          </div>
          
          <div className="border-t border-blue-200 pt-3">
            <h5 className="font-medium text-blue-900 mb-2">Avantages :</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Pas besoin de lecteur de cartes eID</li>
              <li>• Fonctionne sur mobile et ordinateur</li>
              <li>• Données toujours à jour</li>
              <li>• Sécurité maximale</li>
              <li>• Compatible avec tous les navigateurs</li>
            </ul>
          </div>
          
          <div className="border-t border-blue-200 pt-3">
            <h5 className="font-medium text-blue-900 mb-2">Données récupérées :</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Nom et prénom</li>
              <li>• Date et lieu de naissance</li>
              <li>• Numéro national (NISS)</li>
              <li>• Adresse complète</li>
              <li>• Téléphone et email (si autorisés)</li>
            </ul>
          </div>
          
          {itsmeAvailable === false && (
            <div className="border-t border-orange-200 pt-3 bg-orange-50 -m-4 mt-3 p-4 rounded-b-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Mode Démonstration</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Le service itsme n'est pas accessible actuellement. 
                    Un mode démonstration avec des données fictives sera utilisé.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <a
              href="https://www.itsme.be/fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              <span>En savoir plus sur itsme</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItsmeAuthButton;