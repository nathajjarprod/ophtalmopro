import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  Save, 
  X,
  Check,
  AlertCircle,
  Scan,
  Loader,
  Plus,
  Smartphone
} from 'lucide-react';
import { eidService, type EidData } from '../services/eidService';
import { type ItsmeUserData } from '../services/itsmeService';
import ProductionTestPanel from './ProductionTestPanel';
import ItsmeAuthButton from './ItsmeAuthButton';

interface NewPatientFormProps {
  onSave: (patient: any) => void;
  onClose: () => void;
}


const NewPatientForm: React.FC<NewPatientFormProps> = ({ onSave, onClose }) => {
  const [isReadingCard, setIsReadingCard] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardSuccess, setCardSuccess] = useState(false);
  const [showProductionTests, setShowProductionTests] = useState(false);
  const [authMethod, setAuthMethod] = useState<'eid' | 'itsme'>('itsme'); // Par défaut itsme
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    niss: '',
    cardNumber: '',
    validityBeginDate: '',
    validityEndDate: '',
    address: {
      street: '',
      postalCode: '',
      city: '',
      country: 'Belgique'
    },
    phone: '',
    email: '',
    mutuelle: '',
    condition: '',
    status: 'active',
    medicalNotes: ''
  });

  // Fonction pour lire la carte eID via le middleware belge
  const readEidCard = async () => {
    setIsReadingCard(true);
    setCardError(null);
    setCardSuccess(false);

    try {
      console.log('🔍 Début de la lecture de carte eID avec middleware officiel...');
      
      // Vérifier d'abord la connectivité
      const { eidService } = await import('../services/eidService');
      const systemInfo = await eidService.getSystemInfo();
      
      if (!systemInfo.middlewareFound) {
        throw new Error('Middleware eID non trouvé');
      }
      
      if (systemInfo.readers.length === 0) {
        throw new Error(
          'Aucun lecteur de cartes détecté.\n\n' +
          'En environnement VMware :\n' +
          '1. VM → Removable Devices → Alcor Micro → Connect\n' +
          '2. Vérifier dans Gestionnaire de périphériques\n' +
          '3. Redémarrer la VM si nécessaire'
        );
      }
      
      console.log(`📱 ${systemInfo.readers.length} lecteur(s) détecté(s)`);
      console.log(`💳 ${systemInfo.readersWithCard.length} carte(s) présente(s)`);
      
      // Utiliser le service eID officiel
      const eidData = await eidService.readCard({
        includePhoto: true,
        includeAddress: true
      });

      // Mettre à jour le formulaire avec les données de la carte
      setFormData({
        ...formData,
        firstName: eidData.firstName,
        lastName: eidData.lastName,
        dateOfBirth: eidData.dateOfBirth,
        placeOfBirth: eidData.placeOfBirth,
        nationality: eidData.nationality,
        niss: eidData.niss,
        cardNumber: eidData.cardNumber,
        validityBeginDate: eidData.validityBeginDate,
        validityEndDate: eidData.validityEndDate,
        address: {
          street: eidData.address.street,
          postalCode: eidData.address.postalCode,
          city: eidData.address.city,
          country: eidData.address.country || 'Belgique'
        }
      });

      setCardSuccess(true);
      setTimeout(() => setCardSuccess(false), 3000);

      console.log('✅ Lecture de carte réussie:', eidData);

    } catch (error) {
      console.error('Erreur lecture eID:', error);
      
      // Mode simulation uniquement pour démonstration (à retirer en production)
      if ((!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') && error instanceof Error && (
        error.message.includes('non accessible') || 
        error.message.includes('non trouvé') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Middleware non trouvé') ||
        error.message.includes('Aucune carte eID détectée') ||
        error.message.includes('Impossible de lire') ||
        error.message.includes('Timeout')
      )) {
        console.log('🔄 Activation du mode simulation pour démonstration...');
        console.warn('⚠️ MODE SIMULATION - Développement uniquement !');
        
        setCardError(`Problème détecté - Activation du mode démonstration...\n\nErreur: ${error.message}`);
        
        setTimeout(() => {
          const simulatedData = {
            firstName: 'Marie',
            lastName: 'Dubois',
            dateOfBirth: '15/03/1979',
            placeOfBirth: 'Bruxelles',
            nationality: 'Belge',
            niss: '79.03.15-123.45',
            cardNumber: '592123456789',
            validityBeginDate: '15/03/2019',
            validityEndDate: '15/03/2029',
            address: {
              street: 'Rue de la Paix 123',
              postalCode: '1000',
              city: 'Bruxelles',
              country: 'Belgique'
            }
          };

          setFormData({
            ...formData,
            ...simulatedData
          });

          setCardError(null);
          setCardSuccess(true);
          setTimeout(() => setCardSuccess(false), 3000);
        }, 1500);
      } else {
        // En production ou autres erreurs, afficher l'erreur
        let errorMessage = 'Erreur lors de la lecture de la carte';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        setCardError(errorMessage);
        console.error('🚨 ERREUR:', error);
      }
    } finally {
      setIsReadingCard(false);
    }
  };

  // Fonction pour traiter les données itsme
  const handleItsmeSuccess = (userData: ItsmeUserData) => {
    console.log('✅ Données itsme reçues:', userData);
    
    // Mettre à jour le formulaire avec les données itsme
    setFormData({
      ...formData,
      firstName: userData.firstName,
      lastName: userData.lastName,
      dateOfBirth: userData.dateOfBirth,
      placeOfBirth: userData.placeOfBirth || '',
      nationality: userData.nationality || 'Belge',
      niss: userData.niss,
      address: userData.address ? {
        street: userData.address.street,
        postalCode: userData.address.postalCode,
        city: userData.address.city,
        country: userData.address.country || 'Belgique'
      } : formData.address,
      phone: userData.phone || '',
      email: userData.email || ''
    });

    setCardSuccess(true);
    setCardError(null);
    setTimeout(() => setCardSuccess(false), 3000);
  };

  const handleItsmeError = (error: string) => {
    console.error('❌ Erreur itsme:', error);
    setCardError(`Erreur itsme: ${error}`);
    setCardSuccess(false);
  };

  // Fonction pour afficher les diagnostics système
  const showSystemDiagnostics = async () => {
    try {
      console.log('🔧 Lancement des diagnostics système...');
      const systemInfo = await eidService.getSystemInfo();
      console.log('=== DIAGNOSTICS SYSTÈME eID ===');
      console.log(systemInfo);
      
      const diagnosticsText = systemInfo.diagnostics?.join('\n') || 'Aucun diagnostic disponible';
      const readersInfo = systemInfo.readers?.map((r: any) => 
        `${r.name} (Carte: ${r.cardPresent ? 'OUI' : 'NON'})`
      ).join('\n') || 'Aucun lecteur détecté';
      
      alert(
        '🔧 DIAGNOSTICS SYSTÈME eID OFFICIEL\n\n' +
        `Middleware trouvé: ${systemInfo.middlewareFound ? 'OUI' : 'NON'}\n` +
        `URL: ${systemInfo.middlewareUrl || 'Aucune'}\n\n` +
        `Version: ${systemInfo.middlewareVersion || 'Inconnue'}\n\n` +
        `Lecteurs détectés:\n${readersInfo}\n\n` +
        `Lecteurs avec carte: ${systemInfo.readersWithCard?.length || 0}\n\n` +
        'Détails:\n' + diagnosticsText
      );
    } catch (error) {
      console.error('Erreur lors des diagnostics:', error);
      alert('Erreur lors des diagnostics: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  // Formater la date au format DD/MM/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    // Si la date est déjà au bon format
    if (dateString.includes('/')) return dateString;
    
    // Si la date est au format YYYY-MM-DD
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Si la date est au format YYYYMMDD
    if (dateString.length === 8) {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  // Formater le NISS au format XX.XX.XX-XXX.XX
  const formatNiss = (niss: string): string => {
    if (!niss) return '';
    
    // Supprimer tous les caractères non numériques
    const numbers = niss.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return `${numbers.substring(0, 2)}.${numbers.substring(2, 4)}.${numbers.substring(4, 6)}-${numbers.substring(6, 9)}.${numbers.substring(9, 11)}`;
    }
    
    return niss;
  };

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    
    const [day, month, year] = dateOfBirth.split('/');
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSave = () => {
    // Validation basique
    if (!formData.firstName || !formData.lastName) {
      setCardError('Le prénom et le nom sont obligatoires');
      return;
    }

    const newPatient = {
      id: Date.now(), // ID temporaire
      name: `${formData.firstName} ${formData.lastName}`,
      age: calculateAge(formData.dateOfBirth),
      ...formData
    };

    onSave(newPatient);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Nouveau patient</h2>
                <p className="text-green-100">
                  Création d'un nouveau dossier patient avec {authMethod === 'itsme' ? 'itsme' : 'carte eID'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Sélecteur de méthode d'authentification */}
              <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
                <button
                  onClick={() => setAuthMethod('itsme')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'itsme' 
                      ? 'bg-white text-green-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  <Smartphone className="w-4 h-4 inline mr-1" />
                  itsme
                </button>
                <button
                  onClick={() => setAuthMethod('eid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    authMethod === 'eid' 
                      ? 'bg-white text-green-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  <Scan className="w-4 h-4 inline mr-1" />
                  Carte eID
                </button>
              </div>
              
              {authMethod === 'eid' && (
                <button
                  onClick={readEidCard}
                  disabled={isReadingCard}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isReadingCard ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scan className="w-4 h-4" />
                  )}
                  <span>{isReadingCard ? 'Lecture...' : 'Lire carte eID'}</span>
                </button>
              )}
              
              <button
                onClick={showSystemDiagnostics}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                title="Afficher les diagnostics système"
              >
                🔧
              </button>
              <button
                onClick={() => setShowProductionTests(!showProductionTests)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                title="Tests de production"
              >
                🏥
              </button>
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {cardError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <div>
                <p className="text-red-800 font-medium">Erreur de lecture</p>
                <p className="text-red-600 text-sm">{cardError}</p>
              </div>
            </div>
          </div>
        )}

        {cardSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 m-6 rounded">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <p className="text-green-800 font-medium">Carte lue avec succès</p>
                <p className="text-green-600 text-sm">Les informations ont été automatiquement remplies</p>
              </div>
            </div>
          </div>
        )}

        {isReadingCard && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 m-6 rounded">
            <div className="flex items-center">
              <Scan className="w-5 h-5 text-blue-400 animate-pulse mr-3" />
              <div>
                <p className="text-blue-800 font-medium">Lecture de la carte eID en cours...</p>
                <p className="text-blue-600 text-sm">Veuillez insérer votre carte dans le lecteur et suivre les instructions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Panel de tests de production */}
        {showProductionTests && (
          <div className="m-6">
            <ProductionTestPanel />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Section d'authentification */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {authMethod === 'itsme' ? (
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
              ) : (
                <Scan className="w-5 h-5 mr-2 text-blue-600" />
              )}
              Récupération des données d'identité
            </h3>
            
            {authMethod === 'itsme' ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Utilisez itsme pour récupérer automatiquement vos données d'identité 
                  de manière sécurisée, sans lecteur de cartes.
                </p>
                <ItsmeAuthButton
                  onSuccess={handleItsmeSuccess}
                  onError={handleItsmeError}
                  disabled={isReadingCard}
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Insérez votre carte eID dans le lecteur et cliquez sur le bouton 
                  pour récupérer automatiquement vos données.
                </p>
                <button
                  onClick={readEidCard}
                  disabled={isReadingCard}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {isReadingCard ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scan className="w-4 h-4" />
                  )}
                  <span>{isReadingCard ? 'Lecture en cours...' : 'Lire carte eID'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Informations personnelles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identité */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Identité
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nom de famille"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      placeholder="DD/MM/YYYY"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {formData.dateOfBirth && (
                      <span className="text-sm text-gray-500">
                        ({calculateAge(formData.dateOfBirth)} ans)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                  <input
                    type="text"
                    value={formData.placeOfBirth}
                    onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Lieu de naissance"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro NISS</label>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.niss}
                      onChange={(e) => setFormData({...formData, niss: e.target.value})}
                      placeholder="XX.XX.XX-XXX.XX"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro carte eID</label>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
                      placeholder="592123456789"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte valide du</label>
                    <input
                      type="text"
                      value={formData.validityBeginDate}
                      onChange={(e) => setFormData({...formData, validityBeginDate: e.target.value})}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte valide jusqu'au</label>
                    <input
                      type="text"
                      value={formData.validityEndDate}
                      onChange={(e) => setFormData({...formData, validityEndDate: e.target.value})}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nationalité"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-green-600" />
                Contact
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+32 2 123 45 67"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="email@exemple.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })}
                        placeholder="Rue et numéro"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, postalCode: e.target.value }
                          })}
                          placeholder="Code postal"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value }
                          })}
                          placeholder="Ville"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, country: e.target.value }
                        })}
                        placeholder="Pays"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations médicales */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Informations médicales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutuelle</label>
                <select
                  value={formData.mutuelle}
                  onChange={(e) => setFormData({...formData, mutuelle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="Mutualité Chrétienne">Mutualité Chrétienne</option>
                  <option value="Mutualité Socialiste">Mutualité Socialiste</option>
                  <option value="Mutualité Libérale">Mutualité Libérale</option>
                  <option value="Mutualité Neutre">Mutualité Neutre</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition principale</label>
                <input
                  type="text"
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Raison de la consultation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="treatment">En traitement</option>
                  <option value="monitoring">Sous surveillance</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes médicales</label>
              <textarea
                value={formData.medicalNotes}
                onChange={(e) => setFormData({...formData, medicalNotes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Notes médicales importantes, allergies, antécédents..."
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Créer le patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPatientForm;