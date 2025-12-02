import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CompanyConfig, AnalysisState } from '../types';
import { analyzePlan } from '../services/geminiService';
import { generateDocx } from '../services/docxService';
import { UploadCloud, FileText, Play, Download, Image as ImageIcon, Loader2 } from 'lucide-react';

interface AnalysisTabProps {
  config: CompanyConfig;
}

const PRESET_PROMPTS = [
  "Audit Technique",
  "Métré & Surfaces",
  "Optimisation Espace",
  "Vérification Normes PMR"
];

const AnalysisTab: React.FC<AnalysisTabProps> = ({ config }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("Audit Technique");
  const [prompt, setPrompt] = useState("Fais un audit technique complet...");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({ isLoading: false, result: null, error: null });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedPreset(val);
    setPrompt(`Analyse pour : ${val}`);
  };

  const runAnalysis = async () => {
    if (!imagePreview || !imageFile) return;

    setAnalysisState({ isLoading: true, result: null, error: null });

    try {
      // Extract base64 content without header (data:image/png;base64,...)
      const base64Content = imagePreview.split(',')[1];
      const mimeType = imageFile.type;

      const result = await analyzePlan(prompt, context, base64Content, mimeType);
      setAnalysisState({ isLoading: false, result, error: null });
    } catch (err: any) {
        let msg = "Une erreur inconnue est survenue.";
        if (err instanceof Error) msg = err.message;
        setAnalysisState({ isLoading: false, result: null, error: msg });
    }
  };

  const handleExport = async () => {
    if (!analysisState.result) return;
    
    try {
        const blob = await generateDocx(
            analysisState.result,
            imageFile,
            prompt,
            context,
            config
        );
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapport_Expertise_${new Date().toISOString().split('T')[0]}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Export failed", e);
        alert("Erreur lors de l'export Word.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* LEFT COLUMN: INPUTS */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto">
        
        {/* 1. PLAN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-3 flex items-center gap-2">
            <span className="bg-slate-100 p-1 rounded">1</span> Plan Architecte
          </h3>
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer hover:bg-slate-50 ${imageFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300'}`}
            onClick={() => fileInputRef.current?.click()}
          >
             <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
             {imageFile ? (
                 <div className="flex flex-col items-center text-emerald-700">
                     <ImageIcon className="w-8 h-8 mb-2" />
                     <span className="text-sm font-medium truncate w-full">{imageFile.name}</span>
                     <span className="text-xs mt-1">Cliquez pour changer</span>
                 </div>
             ) : (
                 <div className="flex flex-col items-center text-slate-500">
                     <UploadCloud className="w-8 h-8 mb-2" />
                     <span className="text-sm font-medium">Charger un Plan (Image)</span>
                     <span className="text-xs mt-1">PNG, JPG acceptés</span>
                 </div>
             )}
          </div>
        </div>

        {/* 2. CONTEXT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-3 flex items-center gap-2">
            <span className="bg-slate-100 p-1 rounded">2</span> Contexte Projet
          </h3>
          <textarea 
            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
            placeholder="Ex: Rénovation appartement Paris, mur porteur central, client souhaite ouvrir la cuisine..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {/* 3. ANALYSIS SETTINGS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-grow">
          <h3 className="text-sm font-bold text-slate-800 uppercase mb-3 flex items-center gap-2">
            <span className="bg-slate-100 p-1 rounded">3</span> Configuration Analyse
          </h3>
          
          <div className="mb-4">
              <label className="block text-xs font-medium text-slate-500 mb-1">Type d'analyse</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={selectedPreset}
                onChange={handlePresetChange}
              >
                  {PRESET_PROMPTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
          </div>

          <div className="mb-6">
              <label className="block text-xs font-medium text-slate-500 mb-1">Instructions Spécifiques</label>
              <textarea 
                className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
          </div>

          <div className="flex flex-col gap-3">
              <button 
                onClick={runAnalysis}
                disabled={!imageFile || analysisState.isLoading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white flex justify-center items-center gap-2 transition ${!imageFile || analysisState.isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
              >
                 {analysisState.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Play className="w-5 h-5" />}
                 {analysisState.isLoading ? 'Analyse en cours...' : 'Lancer Analyse IA'}
              </button>

              <button 
                onClick={handleExport}
                disabled={!analysisState.result}
                className={`w-full py-3 px-4 rounded-lg font-bold flex justify-center items-center gap-2 border transition ${!analysisState.result ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
              >
                 <Download className="w-5 h-5" />
                 Exporter Rapport (.docx)
              </button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="w-full lg:w-2/3 bg-slate-100 rounded-xl border-2 border-slate-200 p-1 overflow-hidden flex flex-col h-[800px] lg:h-auto">
         {/* Toggle Tabs (Visual only in this simplistic version, mostly scrolling) */}
         <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-blue-600" />
                 Résultat Analyse
             </h3>
             {imageFile && <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">Image chargée</span>}
         </div>

         <div className="flex-grow overflow-y-auto p-8 bg-white">
            {!analysisState.result && !analysisState.isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <FileText className="w-16 h-16 mb-4" />
                    <p>Le rapport s'affichera ici après l'analyse.</p>
                </div>
            )}

            {analysisState.isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-blue-500">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">L'IA examine votre plan...</p>
                    <p className="text-xs text-slate-400 mt-2">Cela peut prendre jusqu'à 30 secondes.</p>
                </div>
            )}

            {analysisState.error && (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">
                    <strong>Erreur:</strong> {analysisState.error}
                </div>
            )}

            {analysisState.result && (
                <div className="prose prose-sm md:prose-base prose-slate max-w-none">
                     {/* We use ReactMarkdown to render the Gemini Output. 
                         The gfm plugin enables tables. */}
                    <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                            table: ({node, ...props}) => <table className="border-collapse border border-slate-300 w-full my-4" {...props} />,
                            th: ({node, ...props}) => <th className="bg-slate-100 border border-slate-300 p-2 text-left" {...props} />,
                            td: ({node, ...props}) => <td className="border border-slate-300 p-2" {...props} />
                        }}
                    >
                        {analysisState.result}
                    </ReactMarkdown>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default AnalysisTab;