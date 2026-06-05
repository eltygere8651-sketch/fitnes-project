import React from 'react';
import { Play, ListPlus, Sparkles, ChevronRight } from 'lucide-react';
import { MusicTrack } from '../types';
import { Carousel } from './Carousel';

interface ExploreViewProps {
  exploreData: any;
  communityPlaylists?: any[];
  setOverrideCurrentTrack: (track: MusicTrack) => void;
  setIsPlaying: (playing: boolean) => void;
  showNotification: (msg: string) => void;
  addYoutubeTrackToPlaylist: (track: any) => void;
  loadPlaylistAndPlay: (item: any) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  exploreData,
  communityPlaylists = [],
  setOverrideCurrentTrack,
  setIsPlaying,
  showNotification,
  addYoutubeTrackToPlaylist,
  loadPlaylistAndPlay
}) => {
  if (!exploreData) {
    return <div className="p-8 text-center text-slate-400">Cargando...</div>;
  }

  // Map community playlists to the format expected by the carousel
  const mappedCommunity = communityPlaylists.map(pl => ({
    id: pl.id,
    title: pl.name,
    artist: `Por ${pl.ownerName || 'Comunidad'}`,
    thumbnail: pl.thumbnail_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop",
    isPlaylist: true,
    data: pl // Keep original data for loadPlaylistAndPlay
  }));

  const sections = [
    { title: "Últimos Lanzamientos", data: exploreData.trends || [] },
    { title: "Descubrimiento Diario", data: exploreData.dailyTop || [] },
    { title: "Canciones en Tendencia", data: exploreData.trending || [] },
    { title: "Listas Comunidad Populares", data: exploreData.latin || [] },
    { title: "Tops de Playlist", data: exploreData.top100 || [] }
  ];

  return (
    <div className="space-y-8 pb-32 px-2">
      {sections.map((section, idx) => (
        section.data && section.data.length > 0 && (
          <section key={idx} className="space-y-4">
            <Carousel 
              title={
                <h2 className="text-sm font-bold text-white flex items-center gap-2 cursor-pointer hover:underline w-fit">
                  {section.title}
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </h2>
              }
              className="gap-4 pb-4 snap-x px-1"
            >
              {section.data.map((item: any) => (
                <div key={item.id + idx} className="snap-start shrink-0 w-36 group cursor-pointer" onClick={() => {
                  if (item.isPlaylist) {
                    loadPlaylistAndPlay(item.data || item);
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
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black border border-white/5 relative mb-2">
                      <img src={item.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                      {item.isPlaylist && (
                          <div className="absolute bottom-2 right-2 bg-emerald-500/90 text-[8px] font-bold text-black px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">COMUNIDAD</div>
                      )}
                  </div>
                  <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                  <p className="text-[9px] text-slate-500 truncate">{item.artist}</p>
                </div>
              ))}
            </Carousel>
          </section>
        )
      ))}
    </div>
  );
};
