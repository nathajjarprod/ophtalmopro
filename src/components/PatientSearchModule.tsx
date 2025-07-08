import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Calendar, CreditCard, X } from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  niss: string;
  age: number;
  phone: string;
  email: string;
  mutuelle: string;
  condition: string;
  status: string;
}

interface PatientSearchModuleProps {
  onPatientSelect: (patient: Patient) => void;
}

const PatientSearchModule: React.FC<PatientSearchModuleProps> = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Base de données des patients étendue
  const patients: Patient[] = [
    {
      id: 1,
      name: 'Marie Dubois',
      firstName: 'Marie',
      lastName: 'Dubois',
      dateOfBirth: '15/03/1979',
      niss: '79.03.15-123.45',
      age: 45,
      phone: '+32 2 123 45 67',
      email: 'marie.dubois@email.com',
      mutuelle: 'Mutualité Chrétienne',
      condition: 'Myopie',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jean Vandenberghe',
      firstName: 'Jean',
      lastName: 'Vandenberghe',
      dateOfBirth: '22/08/1962',
      niss: '62.08.22-234.56',
      age: 62,
      phone: '+32 2 234 56 78',
      email: 'jean.v@email.com',
      mutuelle: 'Mutualité Socialiste',
      condition: 'Cataracte',
      status: 'treatment'
    },
    {
      id: 3,
      name: 'Sophie Laurent',
      firstName: 'Sophie',
      lastName: 'Laurent',
      dateOfBirth: '10/12/1995',
      niss: '95.12.10-345.67',
      age: 28,
      phone: '+32 2 345 67 89',
      email: 'sophie.laurent@email.com',
      mutuelle: 'Mutualité Libérale',
      condition: 'Contrôle annuel',
      status: 'active'
    },
    {
      id: 4,
      name: 'Pierre Martin',
      firstName: 'Pierre',
      lastName: 'Martin',
      dateOfBirth: '05/07/1986',
      niss: '86.07.05-456.78',
      age: 38,
      phone: '+32 2 456 78 90',
      email: 'pierre.martin@email.com',
      mutuelle: 'Mutualité Chrétienne',
      condition: 'Glaucome',
      status: 'monitoring'
    },
    {
      id: 5,
      name: 'Anne Declercq',
      firstName: 'Anne',
      lastName: 'Declercq',
      dateOfBirth: '18/11/1969',
      niss: '69.11.18-567.89',
      age: 55,
      phone: '+32 2 567 89 01',
      email: 'anne.declercq@email.com',
      mutuelle: 'Mutualité Socialiste',
      condition: 'Presbytie',
      status: 'active'
    },
    {
      id: 6,
      name: 'Marc Janssen',
      firstName: 'Marc',
      lastName: 'Janssen',
      dateOfBirth: '03/04/1975',
      niss: '75.04.03-678.90',
      age: 49,
      phone: '+32 2 678 90 12',
      email: 'marc.janssen@email.com',
      mutuelle: 'Mutualité Chrétienne',
      condition: 'Dégénérescence maculaire',
      status: 'monitoring'
    },
    {
      id: 7,
      name: 'Lisa Peeters',
      firstName: 'Lisa',
      lastName: 'Peeters',
      dateOfBirth: '25/09/1988',
      niss: '88.09.25-789.01',
      age: 35,
      phone: '+32 2 789 01 23',
      email: 'lisa.peeters@email.com',
      mutuelle: 'Mutualité Libérale',
      condition: 'Astigmatisme',
      status: 'active'
    }
  ];

  // Fonction de recherche
  const searchPatients = (term: string) => {
    if (!term.trim()) {
      setFilteredPatients([]);
      return;
    }

    const searchLower = term.toLowerCase().replace(/\s+/g, '');
    
    const filtered = patients.filter(patient => {
      // Recherche par nom complet
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase().replace(/\s+/g, '');
      const reverseName = `${patient.lastName} ${patient.firstName}`.toLowerCase().replace(/\s+/g, '');
      
      // Recherche par nom seul
      const firstName = patient.firstName.toLowerCase();
      const lastName = patient.lastName.toLowerCase();
      
      // Recherche par date de naissance (format DD/MM/YYYY ou DDMMYYYY)
      const dobFormatted = patient.dateOfBirth.replace(/\D/g, '');
      const dobDisplay = patient.dateOfBirth.toLowerCase();
      
      // Recherche par NISS (avec ou sans points et tirets)
      const nissFormatted = patient.niss.replace(/\D/g, '');
      const nissDisplay = patient.niss.toLowerCase();
      
      return (
        fullName.includes(searchLower) ||
        reverseName.includes(searchLower) ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        dobFormatted.includes(term.replace(/\D/g, '')) ||
        dobDisplay.includes(term.toLowerCase()) ||
        nissFormatted.includes(term.replace(/\D/g, '')) ||
        nissDisplay.includes(term.toLowerCase())
      );
    });

    setFilteredPatients(filtered.slice(0, 8)); // Limiter à 8 résultats
  };

  useEffect(() => {
    searchPatients(searchTerm);
  }, [searchTerm]);

  // Fermer la liste quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm('');
    setIsOpen(false);
    setFilteredPatients([]);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredPatients([]);
    setIsOpen(false);
  };

  const getSearchIcon = (patient: Patient, term: string) => {
    const termLower = term.toLowerCase();
    
    // Vérifier si c'est une recherche par NISS
    if (patient.niss.toLowerCase().includes(termLower) || 
        patient.niss.replace(/\D/g, '').includes(term.replace(/\D/g, ''))) {
      return <CreditCard className="w-4 h-4 text-blue-500" />;
    }
    
    // Vérifier si c'est une recherche par date de naissance
    if (patient.dateOfBirth.toLowerCase().includes(termLower) || 
        patient.dateOfBirth.replace(/\D/g, '').includes(term.replace(/\D/g, ''))) {
      return <Calendar className="w-4 h-4 text-green-500" />;
    }
    
    // Par défaut, icône utilisateur pour recherche par nom
    return <User className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un patient..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (searchTerm) setIsOpen(true);
          }}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Aide à la recherche */}
      <div className="mt-2 text-xs text-gray-500 px-1">
        <div>Recherche par :</div>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="bg-gray-100 px-2 py-1 rounded">Nom</span>
          <span className="bg-gray-100 px-2 py-1 rounded">Prénom</span>
          <span className="bg-gray-100 px-2 py-1 rounded">Date naiss.</span>
          <span className="bg-gray-100 px-2 py-1 rounded">NISS</span>
        </div>
      </div>

      {/* Résultats de recherche */}
      {isOpen && filteredPatients.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {filteredPatients.map((patient) => (
            <button
              key={patient.id}
              onClick={() => handlePatientSelect(patient)}
              className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getSearchIcon(patient, searchTerm)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {patient.firstName} {patient.lastName}
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3" />
                      <span>{patient.dateOfBirth} ({patient.age} ans)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-3 h-3" />
                      <span>{patient.niss}</span>
                    </div>
                    <div className="text-blue-600 font-medium">
                      {patient.condition}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {isOpen && searchTerm && filteredPatients.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 text-sm">
          Aucun patient trouvé pour "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default PatientSearchModule;