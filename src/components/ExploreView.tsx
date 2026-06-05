import React from 'react';
import { Play, Pause, ListPlus, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import { MusicTrack } from '../types';
import { Carousel } from './Carousel';

interface ExploreViewProps {
  exploreData: any;
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
    { title: "Top Playlists Reales Music", data: exploreData.top100 || [] },
    { title: "Nuevos Videos Musicales", data: exploreData.dailyTop || [] },
    { title: "Tendencias Globales", data: exploreData.trending || [] }
  ];

  return (
    <div className="space-y-4 pb-32 px-0 sm:px-2">
      {/* COUNTRY SELECTOR */}
      {setSelectedCountry && selectedCountry && (
        <div className="px-3">
          <div className="relative max-w-[200px]">
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full appearance-none bg-[#111113] border border-white/10 text-white rounded-full px-4 py-2 text-[11px] font-bold outline-none focus:border-[#1ED760]/50 hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              {[
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
              ].map((c) => (
                <option key={c.code} value={c.code} className="bg-[#111113] text-white">
                  {c.flag} Top Listas {c.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#1ED760]">
              <ChevronDown className="w-3.5 h-3.5" />
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
