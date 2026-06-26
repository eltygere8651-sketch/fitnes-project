import React, { useState } from 'react';
import { Play, Pause, ListPlus, Sparkles, ChevronRight, ChevronDown, X, Loader2, Plus } from 'lucide-react';
import { MusicTrack } from '../types';
import { Carousel } from './Carousel';

interface ExploreViewProps {
  exploreData: any;
  customPlaylists?: any[];
  isAdmin?: boolean;
  onAddCustomPlaylist?: (url: string) => Promise<void>;
  onDeleteCustomPlaylist?: (docId: string) => Promise<void>;
  setOverrideCurrentTrack: (track: MusicTrack) => void;
  setIsPlaying: (playing: boolean) => void;
  showNotification: (msg: string) => void;
  addYoutubeTrackToPlaylist: (track: any) => void;
  loadPlaylistAndPlay: (item: any) => void;
  playTracksContext?: (tracks: any[], startIndex: number) => void;
  selectedCountry?: string;
  setSelectedCountry?: (country: string) => void;
  currentTrack?: MusicTrack | null;
  isPlaying?: boolean;
}

export const ExploreView: React.FC<ExploreViewProps> = React.memo(({
  exploreData,
  customPlaylists = [],
  isAdmin,
  onAddCustomPlaylist,
  onDeleteCustomPlaylist,
  setOverrideCurrentTrack,
  setIsPlaying,
  showNotification,
  addYoutubeTrackToPlaylist,
  loadPlaylistAndPlay,
  playTracksContext,
  selectedCountry,
  setSelectedCountry,
  currentTrack,
  isPlaying
}) => {
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const COUNTRIES = [
    { code: "GLOBAL", label: "Global", flag: "🌎" },
    { code: "US", label: "Estados Unidos", flag: "🇺🇸" },
    { code: "ES", label: "España", flag: "🇪🇸" },
    { code: "MX", label: "México", flag: "🇲🇽" },
    { code: "AR", label: "Argentina", flag: "🇦🇷" },
    { code: "CO", label: "Colombia", flag: "🇨🇴" },
    { code: "DO", label: "República Dominicana", flag: "🇩🇴" },
    { code: "CL", label: "Chile", flag: "🇨🇱" },
    { code: "PE", label: "Perú", flag: "🇵🇪" },
    { code: "GB", label: "Reino Unido", flag: "🇬🇧" },
    { code: "DE", label: "Alemania", flag: "🇩🇪" },
    { code: "FR", label: "Francia", flag: "🇫🇷" },
    { code: "IT", label: "Italia", flag: "🇮🇹" }
  ];

  if (!exploreData || (exploreData.top100?.length === 0 && exploreData.trending?.length === 0)) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="flex justify-center">
            <Sparkles className="w-8 h-8 text-emerald-500/30 animate-pulse" />
        </div>
        <p className="text-slate-400 text-sm font-medium">No se han podido cargar las tendencias en este momento.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const sections = [
    { title: "💎 Recomendaciones Especiales", data: customPlaylists },
    { title: "✨ Mixes Para Ti", data: exploreData.mixParaTi || [] },
    { title: "Top 100 Playlists", data: exploreData.top100 || [] },
    { title: "Top 20 Tendencias", data: exploreData.top20Tendencias || [] },
    { title: "Daily Top 20", data: exploreData.dailyTopPlaylists || [] },
    { title: "Nuevos Videos Musicales", data: exploreData.dailyTop || [] },
    { title: "Tendencias Globales", data: exploreData.trending || [] }
  ];

  const handleAddSubmit = async () => {
    if (!newPlaylistUrl || !onAddCustomPlaylist) return;
    setIsAdding(true);
    await onAddCustomPlaylist(newPlaylistUrl);
    setNewPlaylistUrl("");
    setShowAddModal(false);
    setIsAdding(false);
  };

  return (
    <div className="space-y-4 pb-32 px-0 sm:px-2">
      {/* COUNTRY SELECTOR & ADMIN ACTIONS */}
      <div className="px-3 flex items-center justify-between">
        {setSelectedCountry && selectedCountry && (
          <div className="relative max-w-[200px] w-full">
            <button
              onClick={() => setIsCountryModalOpen(!isCountryModalOpen)}
              className="w-full text-left bg-[#111113] border border-white/10 text-white rounded-full px-4 py-2 text-[11px] font-bold outline-none focus:border-[#1ED760]/50 hover:bg-white/[0.05] transition-colors cursor-pointer flex justify-between items-center"
            >
              <span className="truncate">
                {COUNTRIES.find(c => c.code === selectedCountry)?.flag} Top Listas {COUNTRIES.find(c => c.code === selectedCountry)?.label}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#1ED760] shrink-0 transition-transform ${isCountryModalOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCountryModalOpen && (
              <>
                <div className="fixed inset-0 z-[40]" onClick={() => setIsCountryModalOpen(false)}></div>
                <div className="absolute top-full left-0 mt-2 z-[50] w-full min-w-[220px] bg-[#18181A] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[300px] overflow-y-auto p-1">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setSelectedCountry(c.code);
                          setIsCountryModalOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${selectedCountry === c.code ? 'bg-[#1ED760]/10 text-[#1ED760] font-bold' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
                      >
                        <span className="text-xl">{c.flag}</span>
                        <span className="text-xs">{c.label}</span>
                        {selectedCountry === c.code && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1ED760]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {isAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#1ED760]/10 hover:bg-[#1ED760]/20 text-[#1ED760] px-3 py-2 rounded-full text-[11px] font-bold transition-colors border border-[#1ED760]/20 whitespace-nowrap ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Añadir Lista</span>
          </button>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1ED760]" />
              Añadir al Explorador
            </h3>
            <p className="text-xs text-slate-400 mb-4">Pega el enlace de una lista de YouTube Music para fijarla en "Recomendaciones Especiales".</p>
            
            <input
              type="text"
              placeholder="https://music.youtube.com/playlist?list=..."
              value={newPlaylistUrl}
              onChange={(e) => setNewPlaylistUrl(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1ED760]/50 transition-colors mb-4"
              disabled={isAdding}
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white"
                disabled={isAdding}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={!newPlaylistUrl || isAdding}
                className="px-4 py-2 bg-[#1ED760] text-black text-xs font-bold rounded-full disabled:opacity-50 flex items-center gap-2"
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Añadir Lista"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sections.map((section, idx) => (
        section.data && section.data.length > 0 && (
          <section key={idx} className="space-y-3">
            <Carousel 
              title={
                <h2 className="text-sm font-bold text-white flex items-center gap-2 cursor-pointer hover:underline w-fit">
                  {section.title}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </h2>
              }
              className="gap-4 pb-2 snap-x px-3 sm:px-1"
            >
              {section.data.map((item: any, songIdx: number) => {
                const isActive = currentTrack && (currentTrack.url === item.url || currentTrack.id === item.id);
                
                return (
                <div key={item.id + idx + songIdx} className="snap-start shrink-0 w-[130px] sm:w-36 group cursor-pointer" onClick={() => {
                  if (item.isPlaylist) {
                    loadPlaylistAndPlay(item.data || item);
                    return;
                  }
                  
                  if (isActive) {
                    setIsPlaying(!isPlaying);
                    return;
                  }

                  if (playTracksContext) {
                    const songsOnly = section.data.filter((t: any) => !t.isPlaylist);
                    const idxInSongs = songsOnly.findIndex((t: any) => t.id === item.id);
                    playTracksContext(songsOnly, idxInSongs !== -1 ? idxInSongs : 0);
                  } else {
                    const mapped: MusicTrack = {
                      id: item.id,
                      title: item.title,
                      artist: item.artist || "Artista",
                      url: item.url,
                      duration: item.duration || "0:00",
                      bpm: 120
                    };
                    setOverrideCurrentTrack(mapped);
                    setIsPlaying(true);
                    showNotification(`Reproduciendo: ${item.title}`);
                  }
                }}>
                  <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#111113] border border-white/5 relative mb-2.5">
                      <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                         <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-xl">
                            {isActive && isPlaying ? (
                              <Pause className="w-2 h-2 text-black fill-black" />
                            ) : (
                              <Play className="w-2 h-2 text-black fill-black ml-0.5" />
                            )}
                         </div>
                      </div>
                      <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-[9px] font-medium text-white px-1.5 py-0.5 rounded-sm backdrop-blur-sm shadow-md">
                        {item.artist !== "YouTube Music" ? "PLAYLIST" : "CANAL"}
                      </div>
                      {isAdmin && item.docId && onDeleteCustomPlaylist && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("¿Seguro que deseas eliminar esta lista recomendada?")) {
                              onDeleteCustomPlaylist(item.docId);
                            }
                          }}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500/80 text-white p-1 rounded-full backdrop-blur-sm shadow-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                  </div>
                  <p className="text-[12px] font-bold text-white leading-tight line-clamp-2" title={item.title}>{item.title}</p>
                </div>
              );})}
            </Carousel>
          </section>
        )
      ))}
    </div>
  );
});
