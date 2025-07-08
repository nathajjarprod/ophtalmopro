import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  FileText, 
  Eye, 
  Activity, 
  User, 
  Phone, 
  Mail,
  Edit,
  Save,
  Printer,
  Settings
} from 'lucide-react';
import PatientProfile from './PatientProfile';

interface Consultation {
  id: number;
  date: string;
  type: string;
  doctor: string;
  notes: string;
  status: 'completed' | 'draft' | 'pending';
}

interface PatientDetailProps {
  patient: {
    id: number;
    name: string;
    age: number;
    phone: string;
    email: string;
    mutuelle: string;
    condition: string;
  };
  onBack: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewConsultation, setShowNewConsultation] = useState(false);
  const [consultationTab, setConsultationTab] = useState('consultation');
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(patient);

  const consultations: Consultation[] = [
    {
      id: 1,
      date: '2024-01-15',
      type: 'Consultation de routine',
      doctor: 'Dr. Martin',
      notes: 'Contrôle annuel - RAS',
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-10',
      type: 'Examen complet',
      doctor: 'Dr. Martin',
      notes: 'Bilan ophtalmologique complet',
      status: 'completed'
    },
    {
      id: 3,
      date: '2023-12-20',
      type: 'Urgence',
      doctor: 'Dr. Laurent',
      notes: 'Douleur oculaire - Conjonctivite',
      status: 'completed'
    }
  ];

  const consultationTabs = [
    { id: 'consultation', label: 'Consultation', icon: FileText },
    { id: 'examens', label: 'Examens', icon: Eye },
    { id: 'prescriptions', label: 'Prescriptions', icon: Activity },
    { id: 'images', label: 'Images', icon: Calendar }
  ];

  const renderConsultationForm = () => {
    switch (consultationTab) {
      case 'consultation':
        return (
          <div className="space-y-6">
            {/* En-tête avec utilisateur */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
                  <select className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>SYSADMIN - SYSADMIN</option>
                    <option>Dr. Martin - Ophtalmologue</option>
                    <option>Dr. Laurent - Spécialiste</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Anamnèse */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anamnèse</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Anamnèse du patient..."
              />
            </div>

            {/* Vision OD et OG */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Œil Droit (OD) */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-600">Vis.OD</h3>
                
                {/* Correction portées L */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Corr.portées L</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="text" placeholder="sph." className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" placeholder="cyl." className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" placeholder="axe" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" placeholder="add." className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Correction portées P */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Corr.portées P</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Autoréfracteur */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Autoréfracteur</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Dilatation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dilatation</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Réfr. Subjective */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Réfr. Subjective</label>
                  <div className="grid grid-cols-5 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Prescription VL */}
                <div>
                  <label className="block text-sm font-medium text-red-600 mb-2">Prescription VL</label>
                  <div className="grid grid-cols-5 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* VP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VP</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Mesures spécifiques OD */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-16">TO D</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-16">APL D</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-red-600 w-16">TS D</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                  </div>
                </div>
              </div>

              {/* Œil Gauche (OG) */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-blue-600">Vis.OG</h3>
                
                {/* Mêmes champs pour OG */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">sph. cyl. axe add.</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VL</label>
                  <div className="grid grid-cols-5 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">VP</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm" />
                  </div>
                </div>

                {/* Mesures spécifiques OG */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-16">TO G</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-16">APL G</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-red-600 w-16">TS G</span>
                    <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                  </div>
                </div>

                {/* Dist. IP */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dist. IP</label>
                  <input type="text" className="px-2 py-1 border border-gray-300 rounded text-sm w-20" />
                </div>
              </div>
            </div>

            {/* Sections étendues */}
            <div className="space-y-4">
              {/* LAF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LAF</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* FO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FO</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Champ visuel */}
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-2">Champ visuel</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Motilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motilité</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Diagnostic */}
              <div>
                <label className="block text-sm font-medium text-red-600 mb-2">Diagnost.</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Thérapie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thérapie</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Médicaments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Médicaments</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Remarques */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remarques</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Pied de page */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">Méd. Traitant</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-2">Envoyé par</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            Contenu de l'onglet {consultationTab} à développer
          </div>
        );
    }
  };

  const handlePatientUpdate = (updatedPatient: any) => {
    setCurrentPatient(updatedPatient);
    setShowPatientProfile(false);
  };

  if (showNewConsultation) {
    return (
      <div className="space-y-6">
        {/* Header nouvelle consultation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNewConsultation(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nouvelle consultation</h2>
                <p className="text-sm text-gray-600">{currentPatient.name} - {currentPatient.age} ans</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
              <button className="text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>
              <button className="text-gray-600 hover:text-gray-800">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Onglets de consultation */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-8 px-6">
              {consultationTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setConsultationTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      consultationTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {renderConsultationForm()}
          </div>

          {/* Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowNewConsultation(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Enregistrer la consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showPatientProfile && (
        <PatientProfile
          patient={currentPatient}
          onUpdate={handlePatientUpdate}
          onClose={() => setShowPatientProfile(false)}
        />
      )}
      
    <div className="space-y-6">
      {/* Header patient */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{currentPatient.name}</h2>
                <p className="text-gray-600">{currentPatient.age} ans • {currentPatient.condition}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{currentPatient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>{currentPatient.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowPatientProfile(true)}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Fiche complète</span>
            </button>
            <button 
              onClick={() => setShowNewConsultation(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle consultation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'consultations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consultations
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informations patient */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Mutuelle</span>
                        <p className="text-sm text-gray-900">{currentPatient.mutuelle}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Condition principale</span>
                        <p className="text-sm text-gray-900">{currentPatient.condition}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dernières consultations</h3>
                  <div className="space-y-3">
                    {consultations.slice(0, 3).map((consultation) => (
                      <div key={consultation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{consultation.type}</p>
                            <p className="text-sm text-gray-600">{consultation.notes}</p>
                            <p className="text-sm text-gray-500">Dr. {consultation.doctor}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{consultation.date}</p>
                            <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Terminé
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setShowNewConsultation(true)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <Plus className="w-5 h-5 text-blue-600" />
                      <span>Nouvelle consultation</span>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span>Planifier RDV</span>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <span>Générer rapport</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-900">Total consultations</p>
                      <p className="text-2xl font-bold text-blue-600">{consultations.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-900">Dernière visite</p>
                      <p className="text-sm text-green-600">Il y a 7 jours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Historique des consultations</h3>
                <button 
                  onClick={() => setShowNewConsultation(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouvelle consultation</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{consultation.type}</h4>
                          <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {consultation.status === 'completed' ? 'Terminé' : 'Brouillon'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{consultation.notes}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Dr. {consultation.doctor}</span>
                          <span>•</span>
                          <span>{consultation.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:text-blue-800 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:text-green-800 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun document disponible</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default PatientDetail;