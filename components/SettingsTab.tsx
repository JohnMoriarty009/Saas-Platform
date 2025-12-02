import React, { useState, ChangeEvent } from 'react';
import { CompanyConfig } from '../types';
import { Save, Upload, Building, Phone, MapPin, BadgeCheck } from 'lucide-react';

interface SettingsTabProps {
  config: CompanyConfig;
  onSave: (newConfig: CompanyConfig) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ config, onSave }) => {
  const [formData, setFormData] = useState<CompanyConfig>(config);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoDataUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="p-3 bg-blue-100 rounded-lg">
          <Building className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Configuration de l'Entreprise</h2>
          <p className="text-slate-500 text-sm">Ces informations apparaîtront dans l'en-tête de vos rapports DOCX.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Building className="w-4 h-4" /> Nom de l'Entreprise
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapPin className="w-4 h-4" /> Adresse du Siège
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Phone className="w-4 h-4" /> Contacts (Tél | Email)
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <BadgeCheck className="w-4 h-4" /> Slogan / Expertise
            </label>
            <input
              type="text"
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>

        <div className="pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo de l'Entreprise</label>
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                    {formData.logoDataUrl ? (
                        <img src={formData.logoDataUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-slate-400 text-xs text-center p-2">Aucun logo</span>
                    )}
                </div>
                <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-sm font-medium">
                        <Upload className="w-4 h-4" />
                        Choisir une image...
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    <p className="mt-2 text-xs text-slate-500">Format recommandé: PNG ou JPG transparent.</p>
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition transform active:scale-95"
          >
            <Save className="w-5 h-5" />
            Sauvegarder Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsTab;