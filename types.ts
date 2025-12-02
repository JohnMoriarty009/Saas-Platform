export interface CompanyConfig {
  name: string;
  address: string;
  contact: string;
  expertise: string;
  logoDataUrl: string; // Base64 string for the logo
}

export const DEFAULT_CONFIG: CompanyConfig = {
  name: "Nom de Votre Entreprise",
  address: "Adresse du Siège",
  contact: "Téléphone | Email",
  expertise: "Vos Domaines d'Expertise",
  logoDataUrl: ""
};

export interface AnalysisState {
  isLoading: boolean;
  result: string | null; // The raw markdown
  error: string | null;
}

export const BTP_SYSTEM_PROMPT = `
RÔLE : Expert Architecte et Ingénieur BTP.
DIRECTIVES :
1. TABLEAUX : Présentez TOUTES les données chiffrées sous forme de TABLEAUX Markdown.
2. TON : Technique, précis, orienté solution.
3. CONTENU : Identifiez structure, flux, surfaces et donnez des recommandations normatives.
`;
