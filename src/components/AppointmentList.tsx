import React, { useState } from 'react';
import { Calendar, Clock, User, Phone, Plus, Edit, Trash2, Check, X } from 'lucide-react';

const AppointmentList: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2024-01-22');
  const [selectedView, setSelectedView] = useState('day');

  const appointments = [
    {
      id: 1,
      time: '08:30',
      duration: 30,
      patient: 'Marie Dubois',
      phone: '+32 2 123 45 67',
      type: 'Consultation de routine',
      status: 'confirmed',
      notes: 'Contrôle annuel - Myopie'
    },
    {
      id: 2,
      time: '09:15',
      duration: 45,
      patient: 'Jean Vandenberghe',
      phone: '+32 2 234 56 78',
      type: 'Contrôle post-opératoire',
      status: 'in-progress',
      notes: 'Suivi cataracte - Œil droit'
    },
    {
      id: 3,
      time: '10:30',
      duration: 30,
      patient: 'Sophie Laurent',
      phone: '+32 2 345 67 89',
      type: 'Première consultation',
      status: 'waiting',
      notes: 'Troubles de la vision'
    },
    {
      id: 4,
      time: '11:30',
      duration: 60,
      patient: 'Pierre Martin',
      phone: '+32 2 456 78 90',
      type: 'Examen complet',
      status: 'confirmed',
      notes: 'Surveillance glaucome'
    },
    {
      id: 5,
      time: '14:00',
      duration: 30,
      patient: 'Anne Declercq',
      phone: '+32 2 567 89 01',
      type: 'Consultation de routine',
      status: 'confirmed',
      notes: 'Presbytie - Ajustement lunettes'
    },
    {
      id: 6,
      time: '15:00',
      duration: 45,
      patient: 'Marc Janssen',
      phone: '+32 2 678 90 12',
      type: 'Urgence',
      status: 'urgent',
      notes: 'Douleur oculaire soudaine'
    },
    {
      id: 7,
      time: '16:15',
      duration: 30,
      patient: 'Lisa Peeters',
      phone: '+32 2 789 01 23',
      type: 'Résultats d\'examens',
      status: 'confirmed',
      notes: 'Retour analyses'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'in-progress': return 'En cours';
      case 'waiting': return 'En attente';
      case 'urgent': return 'Urgent';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation de dates */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Planning du</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setSelectedView('day')}
                className={`px-4 py-2 text-sm ${selectedView === 'day' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Jour
              </button>
              <button
                onClick={() => setSelectedView('week')}
                className={`px-4 py-2 text-sm ${selectedView === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Semaine
              </button>
            </div>
          </div>
          
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau RDV</span>
          </button>
        </div>
      </div>

      {/* Vue du planning */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Rendez-vous du {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="text-sm text-gray-500">
              {appointments.length} rendez-vous planifiés
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getStatusColor(appointment.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(appointment.time)} - {getEndTime(appointment.time, appointment.duration)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({appointment.duration} min)
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{appointment.patient}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{appointment.phone}</span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">{appointment.type}</p>
                      <p className="text-sm text-gray-600">{appointment.notes}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {appointment.status === 'waiting' && (
                      <>
                        <button className="p-1 text-green-600 hover:text-green-800 rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-800 rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button className="p-1 text-blue-600 hover:text-blue-800 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-red-600 hover:text-red-800 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé du jour */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total RDV</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmés</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'confirmed').length}
              </p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter(a => a.status === 'waiting').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgents</p>
              <p className="text-2xl font-bold text-red-600">
                {appointments.filter(a => a.status === 'urgent').length}
              </p>
            </div>
            <X className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentList;