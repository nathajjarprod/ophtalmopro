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
  Edit, 
  Save, 
  X,
  Check,
  AlertCircle,
  Scan
} from 'lucide-react';

interface PatientProfileProps {
  patient: any;
  onUpdate: (updatedPatient: any) => void;
  onClose: () => void;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onUpdate, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReadingCard, setIsReadingCard] = useState(false);
  const [editedPatient, setEditedPatient] = useState(patient);

  // Simulation de lecture de carte eID
  const handleReadEidCard = async () => {
    setIsReadingCard(true);
    
    // Simulation d'une lecture de carte (remplacer par l'API réelle)
    setTimeout(() => {
      const simulatedCardData = {
        firstName: 'Marie',
        lastName: 'Dubois',
        dateOfBirth: '15/03/1979',
        niss: '79.03.15-123.45',
        cardNumber: '592123456789',
        nationality: 'Belge',
        address: {
          street: 'Rue de la Paix 123',
          postalCode: '1000',
          city: 'Bruxelles'
        },
        validUntil: '15/03/2029'
      };

      setEditedPatient({
        ...editedPatient,
        firstName: simulatedCardData.firstName,
        lastName: simulatedCardData.lastName,
        name: `${simulatedCardData.firstName} ${simulatedCardData.lastName}`,
        dateOfBirth: simulatedCardData.dateOfBirth,
        niss: simulatedCardData.niss,
        cardNumber: simulatedCardData.cardNumber,
        nationality: simulatedCardData.nationality,
        address: simulatedCardData.address,
        cardValidUntil: simulatedCardData.validUntil
      });

      setIsReadingCard(false);
      setIsEditing(true);
    }, 2000);
  };

  const handleSave = () => {
    onUpdate(editedPatient);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPatient(patient);
    setIsEditing(false);
  };

  const calculateAge = (dateOfBirth: string) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={editedPatient.firstName || ''}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          firstName: e.target.value,
                          name: `${e.target.value} ${editedPatient.lastName || ''}`
                        })}
                        className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded px-2 py-1 text-white placeholder-white placeholder-opacity-70"
                        placeholder="Prénom"
                      />
                      <input
                        type="text"
                        value={editedPatient.lastName || ''}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          lastName: e.target.value,
                          name: `${editedPatient.firstName || ''} ${e.target.value}`
                        })}
                        className="bg-white bg-opacity-20 border border-white border-opacity-30 rounded px-2 py-1 text-white placeholder-white placeholder-opacity-70"
                        placeholder="Nom"
                      />
                    </div>
                  ) : (
                    editedPatient.name
                  )}
                </h2>
                <p className="text-blue-100">
                  {editedPatient.dateOfBirth ? `${calculateAge(editedPatient.dateOfBirth)} ans` : 'Âge non renseigné'} • 
                  Patient #{editedPatient.id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={handleReadEidCard}
                    disabled={isReadingCard}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Scan className={`w-4 h-4 ${isReadingCard ? 'animate-pulse' : ''}`} />
                    <span>{isReadingCard ? 'Lecture...' : 'Lire carte eID'}</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notification de lecture de carte */}
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

        <div className="p-6 space-y-6">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPatient.firstName || ''}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          firstName: e.target.value,
                          name: `${e.target.value} ${editedPatient.lastName || ''}`
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{editedPatient.firstName || 'Non renseigné'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPatient.lastName || ''}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          lastName: e.target.value,
                          name: `${editedPatient.firstName || ''} ${e.target.value}`
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{editedPatient.lastName || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPatient.dateOfBirth || ''}
                        onChange={(e) => setEditedPatient({...editedPatient, dateOfBirth: e.target.value})}
                        placeholder="DD/MM/YYYY"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {editedPatient.dateOfBirth || 'Non renseigné'}
                        {editedPatient.dateOfBirth && (
                          <span className="text-gray-500 ml-2">({calculateAge(editedPatient.dateOfBirth)} ans)</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro NISS</label>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPatient.niss || ''}
                        onChange={(e) => setEditedPatient({...editedPatient, niss: e.target.value})}
                        placeholder="XX.XX.XX-XXX.XX"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-mono">{editedPatient.niss || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro carte eID</label>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedPatient.cardNumber || ''}
                        onChange={(e) => setEditedPatient({...editedPatient, cardNumber: e.target.value})}
                        placeholder="592123456789"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-mono">{editedPatient.cardNumber || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>

                {editedPatient.cardValidUntil && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carte valide jusqu'au</label>
                    <p className="text-gray-900">{editedPatient.cardValidUntil}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedPatient.nationality || ''}
                      onChange={(e) => setEditedPatient({...editedPatient, nationality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{editedPatient.nationality || 'Non renseigné'}</p>
                  )}
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
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedPatient.phone || ''}
                        onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{editedPatient.phone || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedPatient.email || ''}
                        onChange={(e) => setEditedPatient({...editedPatient, email: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{editedPatient.email || 'Non renseigné'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editedPatient.address?.street || ''}
                            onChange={(e) => setEditedPatient({
                              ...editedPatient,
                              address: { ...editedPatient.address, street: e.target.value }
                            })}
                            placeholder="Rue et numéro"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editedPatient.address?.postalCode || ''}
                              onChange={(e) => setEditedPatient({
                                ...editedPatient,
                                address: { ...editedPatient.address, postalCode: e.target.value }
                              })}
                              placeholder="Code postal"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              value={editedPatient.address?.city || ''}
                              onChange={(e) => setEditedPatient({
                                ...editedPatient,
                                address: { ...editedPatient.address, city: e.target.value }
                              })}
                              placeholder="Ville"
                              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-900">
                          {editedPatient.address ? (
                            <>
                              <p>{editedPatient.address.street}</p>
                              <p>{editedPatient.address.postalCode} {editedPatient.address.city}</p>
                            </>
                          ) : (
                            'Non renseigné'
                          )}
                        </div>
                      )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mutuelle</label>
                {isEditing ? (
                  <select
                    value={editedPatient.mutuelle || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, mutuelle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Mutualité Chrétienne">Mutualité Chrétienne</option>
                    <option value="Mutualité Socialiste">Mutualité Socialiste</option>
                    <option value="Mutualité Libérale">Mutualité Libérale</option>
                    <option value="Mutualité Neutre">Mutualité Neutre</option>
                    <option value="Autre">Autre</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{editedPatient.mutuelle || 'Non renseigné'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition principale</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedPatient.condition || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, condition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{editedPatient.condition || 'Non renseigné'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                {isEditing ? (
                  <select
                    value={editedPatient.status || ''}
                    onChange={(e) => setEditedPatient({...editedPatient, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Actif</option>
                    <option value="treatment">En traitement</option>
                    <option value="monitoring">Sous surveillance</option>
                    <option value="inactive">Inactif</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    editedPatient.status === 'active' ? 'bg-green-100 text-green-800' :
                    editedPatient.status === 'treatment' ? 'bg-blue-100 text-blue-800' :
                    editedPatient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {editedPatient.status === 'active' ? 'Actif' :
                     editedPatient.status === 'treatment' ? 'En traitement' :
                     editedPatient.status === 'monitoring' ? 'Sous surveillance' : 'Inactif'}
                  </span>
                )}
              </div>
            </div>

            {/* Notes médicales */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes médicales</label>
              {isEditing ? (
                <textarea
                  value={editedPatient.medicalNotes || ''}
                  onChange={(e) => setEditedPatient({...editedPatient, medicalNotes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notes médicales importantes..."
                />
              ) : (
                <p className="text-gray-900 bg-white p-3 rounded border">
                  {editedPatient.medicalNotes || 'Aucune note médicale'}
                </p>
              )}
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Informations système</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">ID Patient:</span>
                <p className="text-blue-900">{editedPatient.id}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Créé le:</span>
                <p className="text-blue-900">15/01/2024</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Dernière MAJ:</span>
                <p className="text-blue-900">22/01/2024</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Consultations:</span>
                <p className="text-blue-900">12 total</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;