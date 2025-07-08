import React, { useState } from 'react';
import { Eye, Calendar, Users, FileText, Activity, Settings, LogOut, Plus, Search, Filter } from 'lucide-react';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import AppointmentList from './components/AppointmentList';
import ExamView from './components/ExamView';
import PatientDetail from './components/PatientDetail';
import PatientSearchModule from './components/PatientSearchModule';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<string>('');
  const [selectedPatientFromSearch, setSelectedPatientFromSearch] = useState<any>(null);

  const handleLogin = (email: string, password: string) => {
    // Simulation d'authentification
    if (email && password) {
      setIsAuthenticated(true);
      setCurrentUser(email);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser('');
    setActiveTab('dashboard');
  };

  const handlePatientSearchSelect = (patient: any) => {
    setSelectedPatientFromSearch(patient);
    setActiveTab('patient-detail');
  };

  const handleBackFromPatientDetail = () => {
    setSelectedPatientFromSearch(null);
    setActiveTab('dashboard');
  };
  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar },
    { id: 'exams', label: 'Examens', icon: Eye },
    { id: 'prescriptions', label: 'Ordonnances', icon: FileText },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patients':
        return <PatientList />;
      case 'appointments':
        return <AppointmentList />;
      case 'exams':
        return <ExamView />;
      case 'patient-detail':
        return selectedPatientFromSearch ? (
          <PatientDetail 
            patient={selectedPatientFromSearch} 
            onBack={handleBackFromPatientDetail} 
          />
        ) : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Eye className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">OphtalmoPro</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">Cabinet d'ophtalmologie</p>
        </div>
        
        {/* Module de recherche patient */}
        <div className="p-4 border-b">
          <PatientSearchModule onPatientSelect={handlePatientSearchSelect} />
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-6 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUser.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Dr. {currentUser.split('@')[0]}</p>
              <p className="text-xs text-gray-500">Ophtalmologue</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              {activeTab === 'patient-detail' && selectedPatientFromSearch 
                ? `Dossier patient - ${selectedPatientFromSearch.name}`
                : menuItems.find(item => item.id === activeTab)?.label
              }
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Filter className="w-5 h-5" />
              </button>
              {activeTab !== 'patient-detail' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nouveau</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;