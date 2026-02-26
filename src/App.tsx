/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Navigation, 
  Info, 
  ArrowLeft, 
  Search, 
  Filter, 
  ExternalLink, 
  Heart, 
  ShieldAlert,
  Bike,
  Scale,
  ChevronRight,
  Gauge,
  Activity,
  Compass,
  Star,
  Map as MapIcon,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Wind,
  Eye,
  Thermometer,
  Droplets,
  Snowflake,
  CloudLightning
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routes } from './data/routes';
import { Route, View } from './types';

// Fix for Leaflet default marker icons
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const KAWASAKI_GREEN = '#66FF00';

const parseCoordinates = (coordStr: string) => {
  if (coordStr.includes(',')) {
    const parts = coordStr.split(',').map(p => p.trim());
    return { lat: parseFloat(parts[0]), lon: parseFloat(parts[1]) };
  }
  const parts = coordStr.split(' ');
  const lat = parseFloat(parts[0].replace('°', ''));
  const lon = parseFloat(parts[2].replace('°', ''));
  return { lat, lon };
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isAdult, setIsAdult] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('Tutte');
  const [compareIds, setCompareIds] = useState<[string, string]>(['', '']);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gaiaa_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('gaiaa_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(routes.map(r => r.regione)));
    return ['Tutte', 'Preferiti', ...uniqueRegions];
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => {
      const matchesSearch = r.nome.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'Tutte' 
        ? true 
        : regionFilter === 'Preferiti'
          ? favorites.includes(r.id)
          : r.regione === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, regionFilter, favorites]);

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route);
    setCurrentView('dettaglio');
  };

  const openGoogleMaps = (coords: string) => {
    const parts = coords.match(/[\d.]+/g);
    if (parts && parts.length >= 2) {
      const url = `https://www.google.com/maps/search/?api=1&query=${parts[0]},${parts[1]}`;
      window.open(url, '_blank');
    }
  };

  // --- COMPONENTS ---

  const GaiAASmallTitle = () => (
    <div className="text-sm font-black tracking-tighter mb-1 leading-none italic">
      <span className="text-white">GAI</span>
      <span style={{ color: KAWASAKI_GREEN }}>AA</span>
    </div>
  );

  const MotorcycleGreetingIcon = ({ size = 22, className = "" }: { size?: number, className?: string }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
      <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v9" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8a7 7 0 0 0 7 7h1a2 2 0 0 0 2-2v-1" />
    </svg>
  );

  const Badge = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${className}`}>
      {children}
    </span>
  );

  const SectionHeader = ({ title, icon: Icon, subtitle }: { title: string, icon: any, subtitle?: string }) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-6 bg-[#66FF00]" />
      <Icon size={16} className="text-[#66FF00]" />
      <div className="flex items-baseline gap-2">
        <h3 className="text-white font-black uppercase tracking-widest text-xs">{title}</h3>
        {subtitle && <span className="text-gray-500 text-[10px] lowercase font-medium italic">{subtitle}</span>}
      </div>
    </div>
  );

  // --- VIEWS ---

  const OnboardingView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-[#0A0A0A] carbon-pattern relative overflow-hidden">
      {/* Decorative Speed Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#66FF00] to-transparent opacity-20" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#66FF00] to-transparent opacity-20" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md z-10"
      >
        <div className="mb-2 inline-block px-4 py-1 bg-[#66FF00] text-black font-black text-[10px] uppercase skew-x-[-12deg]">
          <span className="skew-x-[12deg] inline-block">Official App</span>
        </div>
        <h1 className="text-7xl font-black tracking-tighter mb-0 leading-none italic">
          <span className="text-white">GAI</span>
          <span style={{ color: KAWASAKI_GREEN }}>AA</span>
        </h1>
        <h2 className="text-xl font-black text-white mb-12 uppercase tracking-[0.4em] italic opacity-60">1000 curve</h2>
        
        <div className="relative mb-12">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#66FF00]" />
          <p className="text-gray-400 text-lg font-medium leading-tight text-left pl-6 italic">
            "Ciao, mi chiamo Gaia e sono una giovane raider. Ho creato questa applicazione per scegliere i migliori percorsi da fare in moto e la voglio condividere con te. Divertiti"
          </p>
        </div>

        <div className="bg-[#151515] p-6 rounded-2xl border border-white/5 mb-10 text-left">
          <div className="flex items-start gap-4">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                id="terms" 
                checked={isAdult}
                onChange={(e) => setIsAdult(e.target.checked)}
                className="peer appearance-none w-6 h-6 rounded border-2 border-white/20 checked:bg-[#66FF00] checked:border-[#66FF00] transition-all cursor-pointer"
              />
              <div className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 left-1 text-black font-black">✓</div>
            </div>
            <label htmlFor="terms" className="text-sm text-gray-400 leading-snug">
              Dichiaro di essere maggiorenne. Dichiaro di aver letto il{' '}
              <button 
                onClick={() => setCurrentView('disclaimer')}
                className="text-[#66FF00] font-bold underline hover:brightness-125"
              >
                [Disclaimer]
              </button>{' '}
              e di averne accettato ogni sua parte.
            </label>
          </div>
        </div>

        <button
          disabled={!isAdult}
          onClick={() => setCurrentView('percorsi')}
          className={`w-full py-5 rounded-xl font-black text-2xl uppercase tracking-tighter transition-all duration-500 skew-btn ${
            isAdult 
              ? 'bg-[#66FF00] text-black ninja-glow-strong hover:scale-105 active:scale-95' 
              : 'bg-gray-900 text-gray-700 cursor-not-allowed'
          }`}
        >
          <span>Accendi il motore</span>
        </button>
      </motion.div>
    </div>
  );

  const DisclaimerView = () => (
    <div className="min-h-screen bg-[#0A0A0A] p-8 carbon-pattern overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-[#66FF00]/10 rounded-2xl border border-[#66FF00]/20">
            <ShieldAlert size={32} style={{ color: KAWASAKI_GREEN }} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic leading-none" style={{ color: KAWASAKI_GREEN }}>Disclaimer</h1>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Legale e Limitazione di Responsabilità</p>
          </div>
        </div>
        
        <div className="space-y-8 text-gray-400 text-sm font-medium leading-relaxed bg-[#151515] p-8 rounded-3xl border border-white/5">
          <div className="text-center mb-6">
            <h4 className="text-white font-black uppercase tracking-widest text-base mb-1">DISCLAIMER LEGALE E LIMITAZIONE DI RESPONSABILITÀ</h4>
            <p className="text-[10px] opacity-60">(ai sensi degli artt. 1229, 1322, 1341, 1342, 2043 e ss. c.c., D.Lgs. 70/2003, D.Lgs. 206/2005)</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">1. Natura del Servizio</h5>
            <p>La presente applicazione (di seguito, “App”) fornisce contenuti informativi relativi a percorsi motociclistici, strade panoramiche, passi montani e itinerari stradali, comprensivi – a titolo esemplificativo – di mappe, tracciati GPS, indicazioni geografiche, altimetrie, descrizioni tecniche, recensioni e valutazioni soggettive. Il Servizio ha natura esclusivamente informativa e divulgativa.</p>
            <p>Le informazioni fornite non costituiscono: attività di organizzazione di viaggi o pacchetti turistici ai sensi del D.Lgs. 79/2011; servizio di guida o accompagnamento; consulenza tecnica o professionale; certificazione di sicurezza o idoneità del percorso; garanzia di percorribilità o conformità alle normative vigenti. L’App non assume alcun obbligo di risultato.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">2. Aggiornamento e Accuratezza delle Informazioni</h5>
            <p>Le condizioni dei percorsi possono variare in qualsiasi momento per cause non controllabili dal gestore (lavori stradali, frane, condizioni meteorologiche, ordinanze comunali, chiusure stagionali, eventi straordinari). Il gestore non garantisce: l’esattezza; la completezza; l’aggiornamento costante; la precisione cartografica o GPS; l’assenza di errori tecnici o informatici. Ai sensi dell’art. 1229 c.c., resta ferma la responsabilità per dolo o colpa grave, ove applicabile.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">3. Assunzione del Rischio e Responsabilità dell’Utente</h5>
            <p>La guida di motocicli comporta rischi intrinseci e oggettivi. L’utente dichiara di essere consapevole che: ogni percorso può presentare pericoli non segnalati; le condizioni del fondo stradale possono mutare improvvisamente; la segnaletica ufficiale prevale su qualsiasi indicazione fornita dall’App.</p>
            <p>L’utente è l’unico responsabile: del rispetto del Codice della Strada (D.Lgs. 285/1992); della verifica preventiva della percorribilità; dello stato di manutenzione del proprio veicolo; dell’utilizzo di dispositivi di protezione omologati; della valutazione delle condizioni meteo e ambientali. L’uso delle informazioni fornite avviene sotto la piena ed esclusiva responsabilità dell’utente.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">4. Esclusione e Limitazione di Responsabilità</h5>
            <p>Nei limiti consentiti dagli artt. 1229 e 2043 c.c., il gestore non risponde per: danni materiali o patrimoniali; danni al veicolo; lesioni personali; danni a terzi; sanzioni amministrative o penali; danni indiretti o consequenziali; mancato guadagno; spese mediche o assicurative; eventi lesivi derivanti da affidamento sulle informazioni fornite.</p>
            <p>È esclusa ogni responsabilità per fatto dell’utente, per condotta imprudente, negligente o imperita, nonché per inosservanza di norme di legge. Resta impregiudicata la responsabilità non derogabile per dolo o colpa grave del gestore, ove accertata.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">5. Contenuti Generati dagli Utenti</h5>
            <p>Qualora l’App consenta la pubblicazione di recensioni o contributi da parte degli utenti, il gestore opera quale prestatore di servizi della società dell’informazione ai sensi del D.Lgs. 70/2003. Il gestore non è responsabile dei contenuti immessi dagli utenti, salvo il caso di conoscenza effettiva dell’illiceità e mancata tempestiva rimozione. I contenuti esprimono esclusivamente opinioni personali dei rispettivi autori.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">6. Assenza di Rapporto Contrattuale</h5>
            <p>L’utilizzo dell’App non comporta la conclusione di alcun contratto di trasporto, accompagnamento o organizzazione turistica. Non si configura alcuna responsabilità da contatto sociale qualificato.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">7. Clausola di Manleva</h5>
            <p>L’utente si impegna a manlevare e tenere indenne il gestore da qualsiasi richiesta risarcitoria derivante dall’utilizzo dell’App, dalla violazione di norme di legge, da comportamenti imprudenti o pericolosi e dall’affidamento esclusivo sulle informazioni fornite.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">8. Limitazioni Tecnologiche</h5>
            <p>Il gestore non garantisce continuità del servizio, assenza di interruzioni, funzionamento ininterrotto del GPS o assenza di bug. Il Servizio è fornito “così com’è” e “secondo disponibilità”.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">9. Utenti Consumatori</h5>
            <p>Qualora l’utente rivesta la qualifica di consumatore ai sensi del D.Lgs. 206/2005 (Codice del Consumo), restano ferme le tutele inderogabili previste dalla normativa vigente.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">10. Legge Applicabile e Foro Competente</h5>
            <p>Il presente disclaimer è regolato dalla legge italiana. Per ogni controversia: se l’utente agisce quale professionista, sarà competente il Foro della sede legale del gestore; se l’utente è consumatore, sarà competente il Foro del luogo di residenza o domicilio del consumatore.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">11. Accettazione Espressa</h5>
            <p>Ai sensi degli artt. 1341 e 1342 c.c., l’utente dichiara di aver letto e approvato specificamente le clausole relative a: limitazione di responsabilità; esclusione di garanzie; assunzione del rischio; manleva; foro competente.</p>
          </div>
        </div>

        <div className="mt-10 pb-20">
          <button
            onClick={() => setCurrentView('onboarding')}
            className="w-full py-5 bg-[#66FF00] text-black rounded-xl font-black text-2xl uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all skew-btn shadow-[0_10px_30px_rgba(102,255,0,0.2)]"
          >
            <span>Ho letto e accetto</span>
          </button>
        </div>
      </div>
    </div>
  );

  const PercorsiView = () => (
    <div className="pb-32 pt-8 px-6 max-w-4xl mx-auto">
      <div className="mb-10">
        <GaiAASmallTitle />
        <h1 className="text-5xl font-black uppercase italic leading-none mb-2" style={{ color: KAWASAKI_GREEN }}>Percorsi</h1>
        <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Esplora le 1000 curve</p>
      </div>

      <div className="sticky top-4 z-30 mb-8">
        <div className="bg-[#151515]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
          <div className="relative mb-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="CERCA PERCORSO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent py-4 pl-12 pr-4 text-white font-bold placeholder:text-gray-700 outline-none uppercase text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 pb-2 flex-nowrap">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setRegionFilter(region)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 whitespace-nowrap ${
                  regionFilter === region 
                    ? 'bg-[#66FF00] text-black border-[#66FF00]' 
                    : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(route => (
            <motion.div
              key={route.id}
              layoutId={route.id}
              onClick={() => handleRouteClick(route)}
              className="bg-[#151515] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-[#66FF00]/40 transition-all group relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#66FF00]/5 blur-3xl -mr-16 -mt-16 group-hover:bg-[#66FF00]/10 transition-all" />
              
              <div className="p-6 relative">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="border-[#66FF00] text-[#66FF00]">{route.regione}</Badge>
                      <Badge className="border-white/20 text-gray-500">{route.provincia}</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-white group-hover:text-[#66FF00] transition-colors italic uppercase leading-none">{route.nome}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex flex-col items-end">
                      <div className="text-[10px] text-gray-400 font-black uppercase mb-1">Rating</div>
                      <div className="bg-[#66FF00] text-black px-3 py-1 rounded font-black text-xl italic">
                        {route.voto}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(route.id);
                      }}
                      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                    >
                      <Star 
                        size={20} 
                        className={favorites.includes(route.id) ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-500"} 
                      />
                    </button>
                  </div>
                </div>
              
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Lunghezza" value={`${route.km} KM`} icon={<Activity size={12} />} />
                <StatBox label="Tornanti" value={route.tornanti} icon={<Gauge size={12} />} />
                <StatBox label="Quota" value={`${route.quota}M`} icon={<Compass size={12} />} />
              </div>
              
              <div className="mt-6 flex items-center justify-end text-[#66FF00] font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                Dettagli <ChevronRight size={14} />
              </div>
            </div>
          </motion.div>
        ))
      ) : (
        <div className="py-20 text-center">
          <Star size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
          <p className="text-gray-600 font-black uppercase tracking-widest italic">
            {regionFilter === 'Preferiti' ? 'Nessun Percorso Preferito' : 'Nessun percorso trovato'}
          </p>
        </div>
      )}
      </div>
    </div>
  );

  const StatBox = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="flex items-center gap-1 text-[9px] text-gray-400 uppercase font-black mb-1">
        {icon}
        {label}
      </div>
      <div className="text-white font-black text-sm font-mono">{value}</div>
    </div>
  );

  const WeatherSection = ({ route }: { route: Route }) => {
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      const fetchWeather = async () => {
        try {
          const { lat, lon } = parseCoordinates(route.coordinate);
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,visibility&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto`
          );
          if (!response.ok) throw new Error();
          const data = await response.json();
          setWeather(data);
          setError(false);
        } catch (err) {
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchWeather();
    }, [route]);

    const getWeatherIcon = (code: number, size = 20) => {
      if (code === 0) return <Sun size={size} className="text-yellow-400" />;
      if (code <= 3) return <Cloud size={size} className="text-gray-400" />;
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return <CloudRain size={size} className="text-blue-400" />;
      if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return <CloudSnow size={size} className="text-white" />;
      if (code >= 95) return <CloudLightning size={size} className="text-purple-400" />;
      return <Cloud size={size} className="text-gray-400" />;
    };

    const getWeatherLabel = (code: number) => {
      if (code === 0) return "Sereno";
      if (code <= 3) return "Nuvoloso";
      if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "Pioggia";
      if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "Neve";
      if (code >= 95) return "Temporale";
      return "Variabile";
    };

    if (loading) return (
      <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="h-24 bg-white/5 rounded-2xl" />
      </div>
    );
    
    if (error) return (
      <div className="bg-[#151515] p-6 rounded-3xl border border-red-500/20 text-center">
        <p className="text-red-400 font-black uppercase text-[10px] tracking-widest">Meteo temporaneamente non disponibile.</p>
      </div>
    );

    const current = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;
    const isHighAltitude = parseInt(route.quota) > 1000;

    return (
      <div className="bg-[#151515] rounded-3xl p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Cloud size={120} />
        </div>
        
        <SectionHeader title="Condizioni Meteo" icon={Cloud} />

        {/* Current Weather */}
        <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              {getWeatherIcon(current.weather_code, 32)}
            </div>
            <div>
              <div className={`text-3xl font-black italic ${isHighAltitude ? 'text-[#66FF00]' : 'text-white'}`}>
                {Math.round(current.temperature_2m)}°C
              </div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                {getWeatherLabel(current.weather_code)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[9px] text-gray-500 font-black uppercase mb-1">Vento</div>
              <div className={`text-sm font-black italic ${!isHighAltitude ? 'text-[#66FF00]' : 'text-white'}`}>
                {current.wind_speed_10m} <span className="text-[10px]">km/h</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-gray-500 font-black uppercase mb-1">Visibilità</div>
              <div className="text-sm font-black italic text-white">
                {(current.visibility / 1000).toFixed(1)} <span className="text-[10px]">km</span>
              </div>
            </div>
          </div>
        </div>

        {/* High Altitude Warnings */}
        {isHighAltitude && (
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-xl border ${current.temperature_2m < 3 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center gap-2 mb-1">
                <Snowflake size={12} className={current.temperature_2m < 3 ? 'text-blue-400' : 'text-gray-500'} />
                <span className="text-[9px] font-black uppercase text-gray-400">Rischio Ghiaccio</span>
              </div>
              <div className={`text-xs font-black uppercase ${current.temperature_2m < 3 ? 'text-blue-400' : 'text-white'}`}>
                {current.temperature_2m < 3 ? 'ELEVATO' : 'BASSO'}
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${current.weather_code >= 71 && current.weather_code <= 86 ? 'bg-white/10 border-white/30' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center gap-2 mb-1">
                <CloudSnow size={12} className="text-white" />
                <span className="text-[9px] font-black uppercase text-gray-400">Neve</span>
              </div>
              <div className="text-xs font-black uppercase text-white">
                {current.weather_code >= 71 && current.weather_code <= 86 ? 'IN CORSO' : 'ASSENTE'}
              </div>
            </div>
          </div>
        )}

        {/* Today's Forecast */}
        <div className="mb-8">
          <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Oggi</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-[8px] text-gray-500 font-black uppercase mb-2">Mattina</div>
              <div className="flex justify-center mb-2">{getWeatherIcon(hourly.weather_code[9], 18)}</div>
              <div className="text-sm font-black italic text-white">{Math.round(hourly.temperature_2m[9])}°C</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-[8px] text-gray-500 font-black uppercase mb-2">Pomeriggio</div>
              <div className="flex justify-center mb-2">{getWeatherIcon(hourly.weather_code[15], 18)}</div>
              <div className="text-sm font-black italic text-white">{Math.round(hourly.temperature_2m[15])}°C</div>
            </div>
            <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
              <div className="text-[8px] text-gray-500 font-black uppercase mb-2">Sera</div>
              <div className="flex justify-center mb-2">{getWeatherIcon(hourly.weather_code[21], 18)}</div>
              <div className="text-sm font-black italic text-white">{Math.round(hourly.temperature_2m[21])}°C</div>
            </div>
          </div>
        </div>

        {/* Tomorrow's Forecast */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Domani</div>
              {getWeatherIcon(daily.weather_code[1], 24)}
              <div className="text-xl font-black italic text-white">
                {Math.round(daily.temperature_2m_min[1])}° / {Math.round(daily.temperature_2m_max[1])}°
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-gray-500 font-black uppercase mb-1">Pioggia</div>
              <div className={`text-sm font-black italic ${!isHighAltitude && daily.precipitation_probability_max[1] > 30 ? 'text-[#66FF00]' : 'text-white'}`}>
                {daily.precipitation_probability_max[1]}%
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DettaglioView = () => {
    if (!selectedRoute) return null;

    const userDistance = useMemo(() => {
      if (!userLocation) return null;
      const currentCoords = parseCoordinates(selectedRoute.coordinate);
      return calculateDistance(userLocation.lat, userLocation.lon, currentCoords.lat, currentCoords.lon);
    }, [selectedRoute, userLocation]);

    const nearbyRoutes = useMemo(() => {
      const currentCoords = parseCoordinates(selectedRoute.coordinate);
      return routes
        .filter(r => r.id !== selectedRoute.id)
        .map(r => {
          const coords = parseCoordinates(r.coordinate);
          const distance = calculateDistance(currentCoords.lat, currentCoords.lon, coords.lat, coords.lon);
          return { ...r, distance };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);
    }, [selectedRoute]);

    return (
      <div className="min-h-screen bg-[#0A0A0A] pb-40">
        <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-2xl p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('percorsi')}
              className="p-3 bg-white/5 rounded-xl text-white hover:bg-[#66FF00] hover:text-black transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white uppercase italic leading-none">{selectedRoute.nome}</h1>
              <p className="text-[#66FF00] text-[10px] font-black uppercase tracking-widest mt-1">{selectedRoute.regione}</p>
            </div>
          </div>
          <div className="bg-[#66FF00] text-black px-4 py-2 rounded-xl font-black text-2xl italic">
            {selectedRoute.voto}
          </div>
        </div>

        <div className="px-6 pt-10 max-w-3xl mx-auto space-y-12">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DashboardStat label="Quota Massima" value={`${selectedRoute.quota}m`} />
            <DashboardStat label="Lunghezza" value={`${selectedRoute.km}km`} />
            <DashboardStat label="Tornanti" value={selectedRoute.tornanti} />
            <DashboardStat label="Dislivello" value={`${selectedRoute.dislivello}m`} />
          </div>

          {/* Technical Specs Grid */}
          <div className="bg-[#151515] rounded-3xl p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Gauge size={120} />
            </div>
            
            <SectionHeader title="Specifiche Tecniche" icon={Activity} />
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-6 relative z-10">
              <SpecItem label="Provincia" value={selectedRoute.provincia} />
              <SpecItem label="Pendenza Media/Max" value={selectedRoute.pendenza} />
              <SpecItem label="Larghezza Media Carreggiata" value={`${selectedRoute.larghezza}m`} />
              <SpecItem label="Grip Rating" value={`${selectedRoute.grip}/10`} />
              <SpecItem label="Esposizione" value={selectedRoute.esposizione} />
              <SpecItem label="Apertura" value={selectedRoute.apertura} />
              <SpecItem label="Rifornimento" value={`${selectedRoute.rifornimento}km`} />
              <SpecItem label="Raggio Curva" value={selectedRoute.raggioCurva} />
              <SpecItem label="Coordinate" value={selectedRoute.coordinate} />
            </div>
          </div>

          {/* Narrative */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <SectionHeader title="Descrizione" icon={Compass} />
              <p className="text-gray-400 leading-relaxed font-medium italic text-lg border-l-2 border-white/10 pl-6">
                {selectedRoute.descrizione}
              </p>
            </div>
            <div className="space-y-4">
              <SectionHeader title="Recensione Rider" icon={Heart} />
              <div className="bg-[#66FF00]/5 p-6 rounded-2xl border border-[#66FF00]/20">
                <p className="text-white italic text-2xl font-black leading-tight mb-4">
                  "{selectedRoute.recensione}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-0.5 flex-grow bg-gradient-to-r from-[#66FF00] to-transparent" />
                  <span className="text-[#66FF00] font-black text-xs uppercase tracking-widest">Top Rider Choice</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Routes */}
          <div className="space-y-4">
            <SectionHeader title="VICINO A" icon={MapPin} subtitle="distanza in linea d'aria" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyRoutes.map(route => (
                <button
                  key={route.id}
                  onClick={() => handleRouteClick(route)}
                  className="bg-[#151515] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#66FF00]/30 transition-all text-left"
                >
                  <div>
                    <div className="text-white font-black italic uppercase text-lg group-hover:text-[#66FF00] transition-colors">
                      {route.nome}
                    </div>
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      {route.regione}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#66FF00] font-mono font-black text-xl">
                      {route.distance.toFixed(1)}
                      <span className="text-[10px] ml-1">KM</span>
                    </div>
                  </div>
                </button>
              ))}
              
              {userDistance !== null && (
                <div className="bg-[#151515] p-5 rounded-2xl border border-[#66FF00]/20 flex items-center justify-between text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#66FF00]/5 blur-2xl -mr-12 -mt-12" />
                  <div className="relative z-10">
                    <div className="text-[#66FF00] font-black italic uppercase text-lg">
                      DA DOVE SONO IO
                    </div>
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      distanza in linea d'aria
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-[#66FF00] font-mono font-black text-xl">
                      {userDistance.toFixed(1)}
                      <span className="text-[10px] ml-1">KM</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <WeatherSection route={selectedRoute} />

          {/* Action Area */}
          <div className="pt-12 pb-20 space-y-4">
            <button 
              onClick={() => toggleFavorite(selectedRoute.id)}
              className="w-full py-5 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
            >
              <Star 
                size={24} 
                className={favorites.includes(selectedRoute.id) ? "fill-[#FFD700] text-[#FFD700]" : "text-gray-500 group-hover:text-gray-400"} 
              />
              <span className={`text-sm font-black uppercase tracking-widest ${favorites.includes(selectedRoute.id) ? "text-[#FFD700]" : "text-gray-400 group-hover:text-gray-300"}`}>
                {favorites.includes(selectedRoute.id) ? "Rimuovi dai Preferiti" : "Aggiungi ai Preferiti"}
              </span>
            </button>

            <button 
              onClick={() => openGoogleMaps(selectedRoute.coordinate)}
              className="w-full py-6 bg-[#66FF00] text-black rounded-2xl font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all ninja-glow-strong skew-btn"
            >
              <Navigation size={28} />
              <span>Avvia Navigatore</span>
            </button>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
              <p className="text-gray-400 text-sm font-black italic uppercase tracking-wider leading-relaxed">
                “Guida con prudenza, rispetta il Codice della Strada, utilizza sempre le protezioni e divertiti.”
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const DashboardStat = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-[#151515] p-5 rounded-2xl border border-white/5 text-center group hover:border-[#66FF00]/30 transition-all">
      <div className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">{label}</div>
      <div className="text-white font-black text-2xl font-mono group-hover:text-[#66FF00] transition-colors">{value}</div>
    </div>
  );

  const SpecItem = ({ label, value }: { label: string, value: string }) => (
    <div>
      <div className="text-[9px] text-gray-400 uppercase font-black mb-1 tracking-tighter">{label}</div>
      <div className="text-white font-bold text-sm">{value}</div>
    </div>
  );

  const ConfrontaView = () => {
    const route1 = routes.find(r => r.id === compareIds[0]);
    const route2 = routes.find(r => r.id === compareIds[1]);

    return (
      <div className="p-8 pb-40 max-w-5xl mx-auto">
        <div className="mb-12">
          <GaiAASmallTitle />
          <h1 className="text-5xl font-black uppercase italic leading-none mb-2" style={{ color: KAWASAKI_GREEN }}>Confronta</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Analisi Tecnica Comparativa</p>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-black uppercase ml-2">Percorso A</label>
            <select 
              value={compareIds[0]}
              onChange={(e) => setCompareIds([e.target.value, compareIds[1]])}
              className="w-full bg-[#151515] border border-white/10 rounded-xl p-5 text-white font-black outline-none focus:border-[#66FF00] appearance-none cursor-pointer uppercase text-sm italic"
            >
              <option value="">-- SELEZIONA --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-black uppercase ml-2">Percorso B</label>
            <select 
              value={compareIds[1]}
              onChange={(e) => setCompareIds([compareIds[0], e.target.value])}
              className="w-full bg-[#151515] border border-white/10 rounded-xl p-5 text-white font-black outline-none focus:border-[#66FF00] appearance-none cursor-pointer uppercase text-sm italic"
            >
              <option value="">-- SELEZIONA --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
        </div>

        {route1 && route2 ? (
          <div className="space-y-3">
            <CompareMetric label="Quota Valico" v1={`${route1.quota}m`} v2={`${route2.quota}m`} />
            <CompareMetric label="Regione" v1={route1.regione} v2={route2.regione} />
            <CompareMetric label="Lunghezza" v1={`${route1.km}km`} v2={`${route2.km}km`} />
            <CompareMetric label="Tornanti" v1={route1.tornanti} v2={route2.tornanti} />
            <CompareMetric label="Pendenza Max" v1={route1.pendenza} v2={route2.pendenza} />
            <CompareMetric label="Grip Rating" v1={`${route1.grip}/10`} v2={`${route2.grip}/10`} />
            <CompareMetric label="Voto Rider" v1={`${route1.voto}/10`} v2={`${route2.voto}/10`} highlight />
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-3xl">
            <Scale size={48} className="mx-auto text-gray-800 mb-4" />
            <div className="text-gray-600 font-black uppercase tracking-[0.2em] text-sm">
              Seleziona due percorsi per il confronto tecnico
            </div>
          </div>
        )}
      </div>
    );
  };

  const CompareMetric = ({ label, v1, v2, highlight }: { label: string, v1: string, v2: string, highlight?: boolean }) => (
    <div className="bg-[#151515] rounded-2xl p-6 border border-white/5 group hover:border-white/10 transition-all">
      <div className="text-[10px] text-gray-400 uppercase font-black text-center mb-4 tracking-widest">{label}</div>
      <div className="grid grid-cols-2 gap-8 items-center">
        <div className={`text-center font-black text-2xl italic ${highlight ? 'text-[#66FF00]' : 'text-white'}`}>{v1}</div>
        <div className={`text-center font-black text-2xl italic ${highlight ? 'text-[#66FF00]' : 'text-white'} border-l border-white/5`}>{v2}</div>
      </div>
    </div>
  );

  const MapView = () => {
    const mapMarkers = useMemo(() => {
      return routes.map(route => {
        const coords = parseCoordinates(route.coordinate);
        return {
          ...route,
          lat: coords.lat,
          lon: coords.lon
        };
      });
    }, []);

    const MapBounds = () => {
      const map = useMap();
      useEffect(() => {
        if (mapMarkers.length > 0) {
          const bounds = L.latLngBounds(mapMarkers.map(m => [m.lat, m.lon]));
          if (userLocation) {
            bounds.extend([userLocation.lat, userLocation.lon]);
          }
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }, [map, mapMarkers]);
      return null;
    };

    return (
      <div className="p-8 pb-40 max-w-5xl mx-auto h-screen flex flex-col">
        <div className="mb-8">
          <GaiAASmallTitle />
          <h1 className="text-5xl font-black uppercase italic leading-none mb-2" style={{ color: KAWASAKI_GREEN }}>Mappa</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Esplora i percorsi sul territorio</p>
        </div>
        
        <div className="flex-grow w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative z-10">
          <MapContainer 
            center={userLocation ? [userLocation.lat, userLocation.lon] : [45.5, 10.5]} 
            zoom={userLocation ? 10 : 7} 
            style={{ height: '100%', width: '100%', background: '#151515' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MarkerClusterGroup>
              {mapMarkers.map(marker => (
                <Marker key={marker.id} position={[marker.lat, marker.lon]}>
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <h3 className="font-black uppercase italic text-sm mb-1 text-black">{marker.nome}</h3>
                      <div className="text-[9px] text-gray-500 uppercase font-bold mb-3">{marker.regione}</div>
                      <button 
                        onClick={() => handleRouteClick(marker)}
                        className="w-full py-2 bg-[#66FF00] text-black rounded font-black text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity"
                      >
                        Vedi Dettaglio
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {userLocation && (
              <Marker 
                position={[userLocation.lat, userLocation.lon]}
                icon={L.divIcon({
                  className: 'user-marker-container',
                  html: `<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              >
                <Popup><span className="text-black font-bold">La tua posizione</span></Popup>
              </Marker>
            )}
            
            <MapBounds />
          </MapContainer>
        </div>
      </div>
    );
  };

  const InfoView = () => (
    <div className="p-8 pb-40 max-w-3xl mx-auto space-y-16">
      <div className="mb-12">
        <GaiAASmallTitle />
        <h1 className="text-3xl font-black uppercase italic leading-none mb-2" style={{ color: KAWASAKI_GREEN }}>Informazioni</h1>
        <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em]">GAIAA Project Hub</p>
      </div>

      <section>
        <SectionHeader title="Disclaimer Legale" icon={ShieldAlert} />
        <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 text-gray-400 font-medium text-sm leading-relaxed space-y-8">
          <div className="text-center mb-6">
            <h4 className="text-white font-black uppercase tracking-widest text-base mb-1">DISCLAIMER LEGALE E LIMITAZIONE DI RESPONSABILITÀ</h4>
            <p className="text-[10px] opacity-60">(ai sensi degli artt. 1229, 1322, 1341, 1342, 2043 e ss. c.c., D.Lgs. 70/2003, D.Lgs. 206/2005)</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">1. Natura del Servizio</h5>
            <p>La presente applicazione (di seguito, “App”) fornisce contenuti informativi relativi a percorsi motociclistici, strade panoramiche, passi montani e itinerari stradali, comprensivi – a titolo esemplificativo – di mappe, tracciati GPS, indicazioni geografiche, altimetrie, descrizioni tecniche, recensioni e valutazioni soggettive. Il Servizio ha natura esclusivamente informativa e divulgativa.</p>
            <p>Le informazioni fornite non costituiscono: attività di organizzazione di viaggi o pacchetti turistici ai sensi del D.Lgs. 79/2011; servizio di guida o accompagnamento; consulenza tecnica o professionale; certificazione di sicurezza o idoneità del percorso; garanzia di percorribilità o conformità alle normative vigenti. L’App non assume alcun obbligo di risultato.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">2. Aggiornamento e Accuratezza delle Informazioni</h5>
            <p>Le condizioni dei percorsi possono variare in qualsiasi momento per cause non controllabili dal gestore (lavori stradali, frane, condizioni meteorologiche, ordinanze comunali, chiusure stagionali, eventi straordinari). Il gestore non garantisce: l’esattezza; la completezza; l’aggiornamento costante; la precisione cartografica o GPS; l’assenza di errori tecnici o informatici. Ai sensi dell’art. 1229 c.c., resta ferma la responsabilità per dolo o colpa grave, ove applicabile.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">3. Assunzione del Rischio e Responsabilità dell’Utente</h5>
            <p>La guida di motocicli comporta rischi intrinseci e oggettivi. L’utente dichiara di essere consapevole che: ogni percorso può presentare pericoli non segnalati; le condizioni del fondo stradale possono mutare improvvisamente; la segnaletica ufficiale prevale su qualsiasi indicazione fornita dall’App.</p>
            <p>L’utente è l’unico responsabile: del rispetto del Codice della Strada (D.Lgs. 285/1992); della verifica preventiva della percorribilità; dello stato di manutenzione del proprio veicolo; dell’utilizzo di dispositivi di protezione omologati; della valutazione delle condizioni meteo e ambientali. L’uso delle informazioni fornite avviene sotto la piena ed esclusiva responsabilità dell’utente.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">4. Esclusione e Limitazione di Responsabilità</h5>
            <p>Nei limiti consentiti dagli artt. 1229 e 2043 c.c., il gestore non risponde per: danni materiali o patrimoniali; danni al veicolo; lesioni personali; danni a terzi; sanzioni amministrative o penali; danni indiretti o consequenziali; mancato guadagno; spese mediche o assicurative; eventi lesivi derivanti da affidamento sulle informazioni fornite.</p>
            <p>È esclusa ogni responsabilità per fatto dell’utente, per condotta imprudente, negligente o imperita, nonché per inosservanza di norme di legge. Resta impregiudicata la responsabilità non derogabile per dolo o colpa grave del gestore, ove accertata.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">5. Contenuti Generati dagli Utenti</h5>
            <p>Qualora l’App consenta la pubblicazione di recensioni o contributi da parte degli utenti, il gestore opera quale prestatore di servizi della società dell’informazione ai sensi del D.Lgs. 70/2003. Il gestore non è responsabile dei contenuti immessi dagli utenti, salvo il caso di conoscenza effettiva dell’illiceità e mancata tempestiva rimozione. I contenuti esprimono esclusivamente opinioni personali dei rispettivi autori.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">6. Assenza di Rapporto Contrattuale</h5>
            <p>L’utilizzo dell’App non comporta la conclusione di alcun contratto di trasporto, accompagnamento o organizzazione turistica. Non si configura alcuna responsabilità da contatto sociale qualificato.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">7. Clausola di Manleva</h5>
            <p>L’utente si impegna a manlevare e tenere indenne il gestore da qualsiasi richiesta risarcitoria derivante dall’utilizzo dell’App, dalla violazione di norme di legge, da comportamenti imprudenti o pericolosi e dall’affidamento esclusivo sulle informazioni fornite.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">8. Limitazioni Tecnologiche</h5>
            <p>Il gestore non garantisce continuità del servizio, assenza di interruzioni, funzionamento ininterrotto del GPS o assenza di bug. Il Servizio è fornito “così com’è” e “secondo disponibilità”.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">9. Utenti Consumatori</h5>
            <p>Qualora l’utente rivesta la qualifica di consumatore ai sensi del D.Lgs. 206/2005 (Codice del Consumo), restano ferme le tutele inderogabili previste dalla normativa vigente.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">10. Legge Applicabile e Foro Competente</h5>
            <p>Il presente disclaimer è regolato dalla legge italiana. Per ogni controversia: se l’utente agisce quale professionista, sarà competente il Foro della sede legale del gestore; se l’utente è consumatore, sarà competente il Foro del luogo di residenza o domicilio del consumatore.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">11. Accettazione Espressa</h5>
            <p>Ai sensi degli artt. 1341 e 1342 c.c., l’utente dichiara di aver letto e approvato specificamente le clausole relative a: limitazione di responsabilità; esclusione di garanzie; assunzione del rischio; manleva; foro competente.</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Informativa Privacy" icon={ShieldAlert} />
        <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 text-gray-400 font-medium text-sm leading-relaxed space-y-8">
          <div className="text-center mb-6">
            <h4 className="text-white font-black uppercase tracking-widest text-base mb-1">Informativa Privacy</h4>
            <p className="text-[10px] opacity-60">(ai sensi dell’art. 13 Regolamento UE 2016/679 – GDPR)</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">1. Titolare del trattamento</h5>
            <p>La presente App è sviluppata e gestita in forma amatoriale, senza struttura societaria e senza organizzazione imprenditoriale. Il Titolare del trattamento coincide con lo sviluppatore dell’App. Non essendo prevista raccolta di dati personali né canali di contatto attivi, non sono istituiti sistemi di gestione centralizzata dei dati.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">2. Assenza di raccolta di dati personali</h5>
            <p>L’App:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>non richiede registrazione o autenticazione;</li>
              <li>non richiede nome, email o altri dati identificativi;</li>
              <li>non crea account;</li>
              <li>non conserva dati su server remoti;</li>
              <li>non implementa database utenti;</li>
              <li>non effettua profilazione;</li>
              <li>non integra strumenti di analytics;</li>
              <li>non utilizza cookie propri (trattandosi di app mobile).</li>
            </ul>
            <p>Non viene effettuata alcuna raccolta sistematica di dati personali da parte del Titolare.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">3. Geolocalizzazione</h5>
            <p>L’eventuale accesso alla posizione del dispositivo:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>avviene esclusivamente previa autorizzazione dell’utente tramite il sistema operativo;</li>
              <li>è utilizzato solo per funzionalità locali di visualizzazione;</li>
              <li>non comporta trasmissione o conservazione presso il Titolare.</li>
            </ul>
            <p>La posizione non viene registrata, tracciata o memorizzata su server.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">4. Servizi esterni di navigazione</h5>
            <p>L’App può consentire l’apertura di percorsi tramite servizi esterni quali Google e Google Maps. Nel momento in cui l’utente apre tali servizi, l’eventuale trattamento di dati (es. indirizzo IP, posizione, identificativi dispositivo) è effettuato esclusivamente dal fornitore esterno secondo le proprie condizioni contrattuali e informative privacy.</p>
            <p>Il Titolare dell’App non riceve tali dati, non vi accede, non li conserva e non esercita alcun controllo su tali trattamenti.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">5. Base giuridica</h5>
            <p>L’App è progettata secondo i principi di minimizzazione dei dati (art. 5 GDPR) e privacy by design (art. 25 GDPR). Poiché non vi è raccolta di dati personali da parte del Titolare, non vengono effettuati trattamenti soggetti a obblighi di conservazione o gestione.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">6. Diritti dell’interessato</h5>
            <p>Qualora, per ragioni tecniche indipendenti dall’App (es. sistemi operativi, store digitali, fornitori cartografici), si configurasse un trattamento di dati personali, l’utente dovrà fare riferimento direttamente ai rispettivi titolari del trattamento. L’App, in sé, non conserva né tratta dati personali sui quali esercitare diritti di accesso, rettifica o cancellazione.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">7. Natura non commerciale</h5>
            <p>L’App è sviluppata a titolo amatoriale e informativo, senza finalità commerciali, senza monetizzazione e senza raccolta dati a fini economici.</p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[#66FF00] font-black uppercase text-xs tracking-wider">8. Aggiornamenti</h5>
            <p>La presente informativa potrà essere aggiornata qualora l’App introduca funzionalità che comportino trattamenti di dati personali.</p>
          </div>
        </div>
      </section>
    </div>
  );

  const CommunityView = () => {
    const appUrl = window.location.href;
    const shareMessage = `Ciao! Ti segnalo GAIAA - 1000 curve, un'app gratuita per scoprire i migliori percorsi moto in Italia 🏍️ ${appUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    return (
      <div className="p-8 pb-40 max-w-3xl mx-auto space-y-16">
        <div className="mb-12">
          <GaiAASmallTitle />
          <h1 className="text-5xl font-black uppercase italic leading-none mb-2" style={{ color: KAWASAKI_GREEN }}>Community</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Uniti dalla passione per le curve</p>
        </div>

        {/* 1. Lo spirito */}
        <section className="space-y-6">
          <SectionHeader title="Lo Spirito" icon={Heart} />
          <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="space-y-2">
              <p className="text-white italic text-xl font-medium leading-relaxed">
                "Dove gli altri vedono una strada, i rider vedono la libertà. Ho sempre pensato che una curva non sia solo un cambio di direzione, ma un battito del cuore. GAIAA è nata così: dal desiderio di mappare quelle emozioni. Mi serviva qualcosa che mi aiutasse a scegliere la destinazione, dove andare e volevo un modo semplice per farlo. Ora che lo sto costruendo lo voglio condividere con voi."
              </p>
              <p className="text-right italic text-lg" style={{ color: KAWASAKI_GREEN }}>Gaia</p>
            </div>
            <div className="h-px bg-white/5 w-full" />
            <p className="text-gray-400 font-medium leading-relaxed">
              La nostra community di rider si incontra su WhatsApp e non cerca solo la meta, ma gode di ogni singolo metro del viaggio. Per questo GAIAA non è solo un'app, è il nostro modo di dirci: <span className="text-[#66FF00] font-black italic">"Ci vediamo in piazza e poi andiamo in cima"</span>. È la bussola per chi, come noi, trova la pace solo quando il motore ruggisce tra i tornanti.
            </p>
          </div>
        </section>

        {/* 2. Partecipa */}
        <section className="space-y-6">
          <SectionHeader title="Partecipa" icon={Navigation} />
          <div className="bg-[#151515] p-8 rounded-3xl border border-white/5">
            <p className="text-gray-400 mb-6 leading-relaxed">
              Ti va di seguirmi su TikTok? Hai scoperto un nuovo percorso mozzafiato? Hai notato un errore o un aggiornamento necessario? La tua voce è fondamentale per far crescere GAIAA.
            </p>
            <a 
              href="https://www.tiktok.com/@gaiantheninja" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-[#66FF00]/50 transition-all group"
            >
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.21-1.35 2.06-.11.97.23 1.99 1.05 2.58.62.42 1.4.53 2.14.44.93-.11 1.84-.79 2.14-1.68.3-.8.26-1.68.27-2.52.02-3.85-.01-7.71.02-11.56z"/></svg>
              </div>
              <div>
                <div className="text-white font-black italic uppercase tracking-widest text-sm">TikTok</div>
                <div className="text-[#66FF00] font-bold text-xs">@GAIANTHENINJA</div>
              </div>
              <ExternalLink size={16} className="ml-auto text-gray-600" />
            </a>
          </div>
        </section>

        {/* 3. Condividi l'app */}
        <section className="space-y-6">
          <SectionHeader title="Condividi l'app" icon={ExternalLink} />
          <div className="space-y-4">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-6 bg-[#25D366] text-white rounded-2xl font-black text-xl uppercase tracking-tighter flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(37,211,102,0.2)]"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              <span>Condividi su WhatsApp</span>
            </a>

            <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#66FF00] rounded-full" />
                <h3 className="text-white font-black uppercase italic tracking-wider text-sm">Come installarla sul tuo telefono</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#66FF00] font-black uppercase text-[10px] tracking-widest">
                    <div className="w-1.5 h-1.5 bg-[#66FF00] rounded-full" />
                    iOS (iPhone)
                  </div>
                  <ol className="text-gray-400 text-xs space-y-3 list-decimal pl-4 font-medium">
                    <li>Apri il link in <span className="text-white">Safari</span></li>
                    <li>Tocca l'icona <span className="text-white">Condividi</span> (quadrato con freccia)</li>
                    <li>Seleziona <span className="text-white">"Aggiungi alla schermata Home"</span></li>
                    <li>Tocca <span className="text-white">"Aggiungi"</span></li>
                  </ol>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#66FF00] font-black uppercase text-[10px] tracking-widest">
                    <div className="w-1.5 h-1.5 bg-[#66FF00] rounded-full" />
                    Android
                  </div>
                  <ol className="text-gray-400 text-xs space-y-3 list-decimal pl-4 font-medium">
                    <li>Apri il link in <span className="text-white">Chrome</span></li>
                    <li>Tocca i <span className="text-white">tre puntini</span> in alto a destra</li>
                    <li>Seleziona <span className="text-white">"Aggiungi a schermata Home"</span></li>
                    <li>Conferma toccando <span className="text-white">"Aggiungi"</span></li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Sostieni Gaia */}
        <section className="space-y-6">
          <SectionHeader title="Sostieni Gaia" icon={Droplets} />
          <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 text-center space-y-6">
            <p className="text-gray-400 font-medium leading-relaxed max-w-xl mx-auto">
              GAIAA è un progetto indipendente, nato per passione e offerto gratuitamente a tutti i rider. Se l'app ti aiuta a scoprire nuove strade e vivere meglio la tua passione, puoi supportare il mio lavoro offrendomi un caffè simbolico. Ogni piccolo gesto aiuta a mantenere i server attivi e a mappare nuove curve!
            </p>
            <a 
              href="https://ko-fi.com/gaiantheninja" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-4 px-10 py-5 bg-[#FF5E5B] text-white rounded-2xl font-black text-xl uppercase tracking-tighter hover:scale-[1.05] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,94,91,0.3)] skew-btn"
            >
              <span>Offrimi un caffè ☕</span>
            </a>
          </div>
        </section>
      </div>
    );
  };

  const ContactLink = ({ label, value, href }: { label: string, value: string, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="bg-[#151515] p-6 rounded-2xl flex items-center justify-between group border border-white/5 hover:border-[#66FF00]/30 transition-all">
      <span className="text-gray-500 font-black uppercase text-xs tracking-widest">{label}</span>
      <span className="text-white font-black italic group-hover:text-[#66FF00] transition-colors">{value}</span>
    </a>
  );

  // --- MAIN RENDER ---

  if (currentView === 'onboarding') return <OnboardingView />;
  if (currentView === 'disclaimer') return <DisclaimerView />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans carbon-pattern">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView + (selectedRoute?.id || '')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {currentView === 'percorsi' && <PercorsiView />}
          {currentView === 'mappa' && <MapView />}
          {currentView === 'dettaglio' && <DettaglioView />}
          {currentView === 'confronta' && <ConfrontaView />}
          {currentView === 'community' && <CommunityView />}
          {currentView === 'info' && <InfoView />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Bar */}
      {currentView !== 'dettaglio' && (
        <nav className="fixed bottom-6 left-4 right-4 z-50">
          <div className="max-w-md mx-auto bg-[#151515]/80 backdrop-blur-2xl border border-white/10 rounded-3xl px-4 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center">
            <NavButton 
              active={currentView === 'percorsi'} 
              onClick={() => setCurrentView('percorsi')} 
              icon={<Navigation size={20} />} 
              label="Percorsi"
            />
            <NavButton 
              active={currentView === 'mappa'} 
              onClick={() => setCurrentView('mappa')} 
              icon={<MapIcon size={20} />} 
              label="Maps"
            />
            <NavButton 
              active={currentView === 'confronta'} 
              onClick={() => setCurrentView('confronta')} 
              icon={<Scale size={20} />} 
              label="Vs"
            />
            <NavButton 
              active={currentView === 'community'} 
              onClick={() => setCurrentView('community')} 
              icon={<MotorcycleGreetingIcon size={20} />} 
              label="GAIAA"
            />
            <NavButton 
              active={currentView === 'info'} 
              onClick={() => setCurrentView('info')} 
              icon={<Info size={20} />} 
              label="Info"
            />
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-[#66FF00] scale-105' : 'text-gray-400 hover:text-gray-200'}`}
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-wider leading-none">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute -inset-4 bg-[#66FF00]/5 blur-xl rounded-full -z-10"
        />
      )}
    </button>
  );
}
