import React, { useState } from 'react';
import { Eye, Activity, FileText, Calendar, User, Printer, Save, Plus } from 'lucide-react';

const ExamView: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('acuite');

  const recentExams = [
    {
      id: 1,
      date: '2024-01-22',
      time: '10:30',
      patient: 'Marie Dubois',
      type: 'Examen complet',
      results: 'Normal',
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-01-22',
      time: '09:15',
      patient: 'Jean Vandenberghe',
      type: 'Contrôle post-opératoire',
      results: 'Amélioration',
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-01-21',
      time: '16:00',
      patient: 'Sophie Laurent',
      type: 'Test de vision',
      results: 'Myopie légère',
      status: 'completed'
    }
  ];

  const examTypes = [
    { id: 'acuite', label: 'Acuité visuelle', icon: Eye },
    { id: 'tension', label: 'Tension oculaire', icon: Activity },
    { id: 'fond', label: 'Fond d\'œil', icon: FileText },
    { id: 'champ', label: 'Champ visuel', icon: Calendar }
  ];

  const renderExamForm = () => {
    switch (activeTab) {
      case 'acuite':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Test d'acuité visuelle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Œil droit */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Œil droit (OD)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vision de loin</label>
                    <input
                      type="text"
                      placeholder="ex: 10/10"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vision de près</label>
                    <input
                      type="text"
                      placeholder="ex: P2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sphère</label>
                    <input
                      type="text"
                      placeholder="ex: -2.00"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cylindre</label>
                    <input
                      type="text"
                      placeholder="ex: -0.50"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Axe</label>
                    <input
                      type="text"
                      placeholder="ex: 90°"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Œil gauche */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Œil gauche (OG)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vision de loin</label>
                    <input
                      type="text"
                      placeholder="ex: 10/10"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vision de près</label>
                    <input
                      type="text"
                      placeholder="ex: P2"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sphère</label>
                    <input
                      type="text"
                      placeholder="ex: -2.00"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cylindre</label>
                    <input
                      type="text"
                      placeholder="ex: -0.50"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Axe</label>
                    <input
                      type="text"
                      placeholder="ex: 90°"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Observations</label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Notes sur l'examen d'acuité visuelle..."
              />
            </div>
          </div>
        );

      case 'tension':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Mesure de la tension oculaire</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Œil droit (OD)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pression intraoculaire (mmHg)</label>
                    <input
                      type="number"
                      placeholder="ex: 15"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Méthode</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Tonomètrie de Goldman</option>
                      <option>Tonomètrie à air</option>
                      <option>Tonomètrie de Schiötz</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Œil gauche (OG)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pression intraoculaire (mmHg)</label>
                    <input
                      type="number"
                      placeholder="ex: 14"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Méthode</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Tonomètrie de Goldman</option>
                      <option>Tonomètrie à air</option>
                      <option>Tonomètrie de Schiötz</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Interprétation</label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Interprétation des résultats de tension oculaire..."
              />
            </div>
          </div>
        );

      case 'fond':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Examen du fond d'œil</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Œil droit (OD)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Papille</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Normale</option>
                      <option>Œdème papillaire</option>
                      <option>Excavation</option>
                      <option>Pâleur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Macula</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Normale</option>
                      <option>Drusen</option>
                      <option>Œdème maculaire</option>
                      <option>Atrophie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vaisseaux</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Normaux</option>
                      <option>Rétrécissement artériel</option>
                      <option>Tortuosité veineuse</option>
                      <option>Hémorragies</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">Œil gauche (OG)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Papille</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Normale</option>
                      <option>Œdème papillaire</option>
                      <option>Excavation</option>
                      <option>Pâleur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Macula</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Normale</option>
                      <option>Drusen</option>
                      <option>Œdème maculaire</option>
                      <option>Atrophie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vaisseaux</label>
                    <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                      <option>Normaux</option>
                      <option>Rétrécissement artériel</option>
                      <option>Tortuosité veineuse</option>
                      <option>Hémorragies</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Conclusions</label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Conclusions de l'examen du fond d'œil..."
              />
            </div>
          </div>
        );

      default:
        return <div>Sélectionnez un type d'examen</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Examens ophtalmologiques</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouvel examen</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des examens récents */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-900">Examens récents</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {recentExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedExam(exam.id.toString())}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{exam.patient}</span>
                      <span className="text-xs text-gray-500">{exam.date}</span>
                    </div>
                    <div className="text-sm text-gray-600">{exam.type}</div>
                    <div className="text-sm text-green-600 font-medium">{exam.results}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'examen */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Nouvel examen</h3>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </button>
                  <button className="text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                    <Printer className="w-4 h-4" />
                    <span>Imprimer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sélection du patient */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Patient:</span>
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Sélectionner un patient</option>
                  <option>Marie Dubois</option>
                  <option>Jean Vandenberghe</option>
                  <option>Sophie Laurent</option>
                </select>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Onglets des types d'examens */}
            <div className="border-b">
              <nav className="flex space-x-8 px-4">
                {examTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setActiveTab(type.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === type.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Contenu de l'examen */}
            <div className="p-6">
              {renderExamForm()}
            </div>

            {/* Actions */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Enregistrer l'examen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamView;