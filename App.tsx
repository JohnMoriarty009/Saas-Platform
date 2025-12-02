import React, { useState, useEffect } from 'react';
import { Layout, PenTool, Settings, LogOut } from 'lucide-react';
import { CompanyConfig, DEFAULT_CONFIG } from './types';
import AnalysisTab from './components/AnalysisTab';
import SettingsTab from './components/SettingsTab';

const App = () => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'settings'>('analysis');
  const [config, setConfig] = useState<CompanyConfig>(DEFAULT_CONFIG);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('btp_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse config", e);
      }
    }
    setIsConfigLoaded(true);
  }, []);

  const handleSaveConfig = (newConfig: CompanyConfig) => {
    setConfig(newConfig);
    localStorage.setItem('btp_config', JSON.stringify(newConfig));
    alert("Configuration sauvegardée !");
  };

  if (!isConfigLoaded) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <Layout className="w-6 h-6 text-white" />
             </div>
             <div>
                 <h1 className="font-bold text-lg leading-tight">BTP Audit AI</h1>
                 <p className="text-xs text-slate-400">Plateforme SaaS</p>
             </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            <button 
                onClick={() => setActiveTab('analysis')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'analysis' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <PenTool className="w-5 h-5" />
                <span className="font-medium">Analyse Plan</span>
            </button>

            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Configuration</span>
            </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Votre Entreprise</p>
                <p className="font-semibold text-sm truncate">{config.name}</p>
                <p className="text-xs text-slate-500 truncate">{config.contact}</p>
            </div>
            <button className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-white transition w-full px-2">
                <LogOut className="w-4 h-4" /> Déconnexion
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-8 overflow-hidden h-screen flex flex-col">
          <header className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'analysis' ? 'Espace de Travail' : 'Paramètres du Compte'}
                </h2>
                <p className="text-slate-500 text-sm">
                    {activeTab === 'analysis' ? 'Analysez vos plans et générez des rapports experts.' : 'Personnalisez l\'en-tête de vos documents exportés.'}
                </p>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto">
             {activeTab === 'analysis' ? (
                 <AnalysisTab config={config} />
             ) : (
                 <SettingsTab config={config} onSave={handleSaveConfig} />
             )}
          </div>
      </main>
    </div>
  );
};

export default App;