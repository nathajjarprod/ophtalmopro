import React from 'react';
import { Calendar, Users, Eye, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Patients aujourd\'hui',
      value: '24',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Rendez-vous',
      value: '18',
      change: '+5%',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Examens réalisés',
      value: '42',
      change: '+18%',
      icon: Eye,
      color: 'bg-purple-500',
    },
    {
      title: 'Chiffre d\'affaires',
      value: '3.240€',
      change: '+8%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const recentAppointments = [
    {
      time: '09:30',
      patient: 'Marie Dubois',
      type: 'Consultation de routine',
      status: 'confirmed',
    },
    {
      time: '10:15',
      patient: 'Jean Vandenberghe',
      type: 'Contrôle post-opératoire',
      status: 'in-progress',
    },
    {
      time: '11:00',
      patient: 'Sophie Laurent',
      type: 'Examen de la vue',
      status: 'waiting',
    },
    {
      time: '14:30',
      patient: 'Pierre Martin',
      type: 'Consultation spécialisée',
      status: 'confirmed',
    },
  ];

  const urgentTasks = [
    {
      title: 'Rapport à envoyer',
      patient: 'Anne Declercq',
      deadline: 'Aujourd\'hui',
      priority: 'high',
    },
    {
      title: 'Suivi post-opératoire',
      patient: 'Marc Janssen',
      deadline: 'Demain',
      priority: 'medium',
    },
    {
      title: 'Résultats d\'examens',
      patient: 'Lisa Peeters',
      deadline: 'Cette semaine',
      priority: 'low',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rendez-vous du jour */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Rendez-vous du jour
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAppointments.map((appointment, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{appointment.patient}</p>
                        <p className="text-sm text-gray-500">{appointment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmé' : 
                           appointment.status === 'in-progress' ? 'En cours' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tâches urgentes */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
              Tâches urgentes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {urgentTasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${
                    task.priority === 'high' ? 'bg-red-500' : 
                    task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500">{task.patient}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{task.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Graphique activité récente */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Activité de la semaine</h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-between space-x-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => {
              const heights = [60, 80, 45, 90, 70, 30, 20];
              return (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${heights[index]}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;