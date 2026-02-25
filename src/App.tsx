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
  Star
} from 'lucide-react';
import { routes } from './data/routes';
import { Route, View } from './types';

const KAWASAKI_GREEN = '#66FF00';

const parseCoordinates = (coordStr: string) => {
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
              <SpecItem label="Larghezza Strada" value={`${selectedRoute.larghezza}m`} />
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
            <SectionHeader title="Vicino a" icon={MapPin} subtitle="distanza in linea d'aria" />
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
                      DISTANZA IN LINEA D'ARIA
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
            <CompareMetric label="Sviluppo KM" v1={`${route1.km}km`} v2={`${route2.km}km`} />
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

  const InfoView = () => (
    <div className="p-8 pb-40 max-w-3xl mx-auto space-y-16">
      <div className="mb-12">
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

      <section>
        <SectionHeader title="L'Autore" icon={Bike} />
        <div className="bg-[#151515] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Heart size={100} />
          </div>
          <p className="text-[#66FF00] text-3xl font-black italic uppercase mb-4">Gaia</p>
          <p className="text-gray-400 text-xl font-medium italic leading-snug relative z-10">
            "Giovane raider appassionata di curve e panorami mozzafiato. Ho creato GAIAA per condividere la mia passione con la community dei motociclisti."
          </p>
        </div>
      </section>

      <section>
        <SectionHeader title="Canali Ufficiali" icon={Activity} />
        <div className="grid gap-4">
          <ContactLink label="TikTok" value="@gaiantheninja" href="https://tiktok.com/@gaiantheninja" />
        </div>
      </section>

      <section className="pt-8">
        <a 
          href="https://ko-fi.com/gaiantheninja" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full py-6 bg-white text-black rounded-2xl font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-4 hover:bg-[#66FF00] transition-all skew-btn"
        >
          <Heart fill="currentColor" size={24} />
          <span>Supporta GAIAA</span>
        </a>
      </section>
    </div>
  );

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
          {currentView === 'dettaglio' && <DettaglioView />}
          {currentView === 'confronta' && <ConfrontaView />}
          {currentView === 'info' && <InfoView />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Bar */}
      {currentView !== 'dettaglio' && (
        <nav className="fixed bottom-6 left-6 right-6 z-50">
          <div className="max-w-md mx-auto bg-[#151515]/80 backdrop-blur-2xl border border-white/10 rounded-3xl px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center">
            <NavButton 
              active={currentView === 'onboarding'} 
              onClick={() => setCurrentView('onboarding')} 
              icon={<Bike size={22} />} 
              label="Ciao" 
            />
            <NavButton 
              active={currentView === 'percorsi'} 
              onClick={() => setCurrentView('percorsi')} 
              icon={<Navigation size={22} />} 
              label="Percorsi" 
            />
            <NavButton 
              active={currentView === 'confronta'} 
              onClick={() => setCurrentView('confronta')} 
              icon={<Scale size={22} />} 
              label="Confronta" 
            />
            <NavButton 
              active={currentView === 'info'} 
              onClick={() => setCurrentView('info')} 
              icon={<Info size={22} />} 
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
      className={`flex flex-col items-center gap-1.5 transition-all relative ${active ? 'text-[#66FF00] scale-110' : 'text-gray-400 hover:text-gray-200'}`}
    >
      {icon}
      <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute -inset-4 bg-[#66FF00]/5 blur-xl rounded-full -z-10"
        />
      )}
    </button>
  );
}
