export interface Route {
  id: string;
  nome: string;
  quota: string;
  provincia: string;
  regione: string;
  coordinate: string;
  km: string;
  pendenza: string;
  larghezza: string;
  tornanti: string;
  raggioCurva: string;
  grip: string;
  esposizione: string;
  apertura: string;
  dislivello: string;
  rifornimento: string;
  descrizione: string;
  recensione: string;
  voto: string;
}

export type View = 'onboarding' | 'disclaimer' | 'percorsi' | 'dettaglio' | 'confronta' | 'info';
