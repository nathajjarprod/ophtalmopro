import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, Phone, Mail, Calendar, User, Filter } from 'lucide-react';
import PatientDetail from './PatientDetail';
import NewPatientForm from './NewPatientForm';

const PatientList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const patients = [
    {
      id: 1,
      name: 'Marie Dubois',
      age: 45,
      phone: '+32 2 123 45 67',
      email: 'marie.dubois@email.com',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-01-30',
      mutuelle: 'Mutualité Chrétienne',
      condition: 'Myopie',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jean Vandenberghe',
      age: 62,
      phone: '+32 2 234 56 78',
      email: 'jean.v@email.com',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-02-05',
      mutuelle: 'Mutualité Socialiste',
      condition: 'Cataracte',
      status: 'treatment'
    },
    {
      id: 3,
      name: 'Sophie Laurent',
      age: 28,
      phone: '+32 2 345 67 89',
      email: 'sophie.laurent@email.com',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25',
      mutuelle: 'Mutualité Libérale',
      condition: 'Contrôle annuel',
      status: 'active'
    },
    {
      id: 4,
      name: 'Pierre Martin',
      age: 38,
      phone: '+32 2 456 78 90',
      email: 'pierre.martin@email.com',
      lastVisit: '2024-01-08',
      nextAppointment: '2024-02-10',
      mutuelle: 'Mutualité Chrétienne',
      condition: 'Glaucome',
      status: 'monitoring'
    },
    {
      id: 5,
      name: 'Anne Declercq',
      age: 55,
      phone: '+32 2 567 89 01',
      email: 'anne.declercq@email.com',
      lastVisit: '2024-01-05',
      nextAppointment: '2024-01-28',
      mutuelle: 'Mutualité Socialiste',
      condition: 'Presbytie',
      status: 'active'
    }
  ];

  const handleNewPatient = (newPatient: any) => {
    // Ici vous pourriez ajouter le patient à votre base de données
    console.log('Nouveau patient créé:', newPatient);
    setShowNewPatientForm(false);
    // Optionnellement, rediriger vers le dossier du nouveau patient
    setSelectedPatient(newPatient);
  };
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || patient.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'treatment': return 'bg-blue-100 text-blue-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'treatment': return 'Traitement';
      case 'monitoring': return 'Surveillance';
      default: return 'Inactif';
    }
  };

  if (selectedPatient) {
    return (
      <PatientDetail 
        patient={selectedPatient} 
        onBack={() => setSelectedPatient(null)} 
      />
    );
  }

  if (showNewPatientForm) {
    return (
      <NewPatientForm
        onSave={handleNewPatient}
        onClose={() => setShowNewPatientForm(false)}
      />
    );
  }
  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les patients</option>
                <option value="active">Actifs</option>
                <option value="treatment">En traitement</option>
                <option value="monitoring">Sous surveillance</option>
              </select>
            </div>
            
            <button 
              onClick={() => setShowNewPatientForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Liste des patients */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mutuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière visite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prochain RDV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.age} ans</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.phone}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.mutuelle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.condition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.lastVisit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {patient.nextAppointment}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                      {getStatusText(patient.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredPatients.length}</span> sur <span className="font-medium">{patients.length}</span> patients
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Précédent
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientList;