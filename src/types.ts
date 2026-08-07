export interface Route {
  id: string;
  nome: string;
  stato: string;
  quota: number | string;
  provincia: string;
  regione: string;
  coordinate: string;
  lat?: number;
  lon?: number;
  tipoStrada: string;
  superficie: string;
  rifStrada: string;
  wikipedia?: string;
  voto?: string;
  lunghezza?: string;
  pendenza?: string;
  difficolta?: string;
  tornanti?: number;
  periodo?: string;
  descrizione?: string;
  rating?: number;
  gpxAvailable?: boolean;
}

export type View = 'onboarding' | 'disclaimer' | 'percorsi' | 'dettaglio' | 'confronta' | 'info' | 'mappa' | 'community';
