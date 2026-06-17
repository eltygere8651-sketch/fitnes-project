import React, { useState, useEffect, useRef } from 'react';
import { Mic, Search, Play, Pause, Loader2, ChevronLeft, ChevronDown, Headphones, Radio, Heart, Bookmark, Library, Clock } from 'lucide-react';

interface Podcast {
  id: number;
  name: string;
  artist: string;
  imageUrl: string;
  feedUrl: string;
  genres: string[];
}

interface Episode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration?: string;
  pubDate?: string;
  imageUrl?: string;
}

interface LikedEpisode {
  episode: Episode;
  podcastContext: { name: string; artist: string; imageUrl: string; feedUrl: string };
  likedAt: number;
}

const CATEGORIES = [
  "Fitness y Entrenamiento",
  "Salud y Bienestar",
  "Motivación Diaria",
  "Correr y Running",
  "Nutrición",
  "Mindfulness",
  "Emprendimiento",
  "Comedia y Entretenimiento"
];

export const PodcastView = ({ isVisible, pauseBackgroundMusic }: { isVisible: boolean, pauseBackgroundMusic: () => void }) => {
  const [activeTab, setActiveTab] = useState<"explore" | "library" | "liked">("explore");
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [activeCategory, setActiveCategory] = useState("Fitness y Entrenamiento");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  // Persistence State
  const [savedPodcasts, setSavedPodcasts] = useState<Podcast[]>([]);
  const [likedEpisodes, setLikedEpisodes] = useState<LikedEpisode[]>([]);
  const [episodeProgress, setEpisodeProgress] = useState<Record<string, number>>({});

  // Audio player state
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isVisible && !selectedPodcast && activeTab === "explore") {
      searchPodcasts(activeCategory);
    }
  }, [isVisible, activeCategory, activeTab]);

  useEffect(() => {
    // Load persisted data
    try {
      const sp = localStorage.getItem("gymapp_podcast_library");
      if (sp) setSavedPodcasts(JSON.parse(sp));
      
      const le = localStorage.getItem("gymapp_podcast_liked");
      if (le) setLikedEpisodes(JSON.parse(le));
      
      const ep = localStorage.getItem("gymapp_podcast_progress");
      if (ep) setEpisodeProgress(JSON.parse(ep));
    } catch(e) {}

    // Ensure we have an audio element
    if (!audioRef.current) {
      const audio = new Audio();
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      let lastSave = 0;
      audio.addEventListener('timeupdate', () => {
        const current = audio.currentTime;
        if (current - lastSave > 5) {
          lastSave = current;
          const currentEpId = audioRef.current?.getAttribute('data-episode-id');
          if (currentEpId) {
             setEpisodeProgress(prev => {
                const updated = { ...prev, [currentEpId]: current };
                localStorage.setItem("gymapp_podcast_progress", JSON.stringify(updated));
                return updated;
             });
          }
        }
      });

      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const searchPodcasts = async (query: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/podcasts/search?term=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data = await res.json();
      setPodcasts(data);
    } catch (err: any) {
      setError("No pudimos cargar los podcasts. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveCategory("");
      searchPodcasts(searchQuery);
    }
  };

  const loadEpisodes = async (podcast: Podcast) => {
    setSelectedPodcast(podcast);
    setIsLoadingEpisodes(true);
    setEpisodes([]);
    setError("");
    try {
      const res = await fetch(`/api/podcasts/episodes?feedUrl=${encodeURIComponent(podcast.feedUrl)}`);
      if (!res.ok) throw new Error("Error obteniendo los episodios");
      const data = await res.json();
      setEpisodes(data);
    } catch (err: any) {
      setError("No pudimos cargar los episodios.");
    } finally {
      setIsLoadingEpisodes(false);
    }
  };

  const playEpisode = (episode: Episode, forcePodcastCtx?: Podcast | null) => {
    if (currentEpisode?.id === episode.id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        pauseBackgroundMusic();
        audioRef.current?.play();
      }
      return;
    }

    pauseBackgroundMusic();
    setCurrentEpisode(episode);
    if (audioRef.current) {
      audioRef.current.setAttribute('data-episode-id', episode.id);
      audioRef.current.src = episode.audioUrl;
      
      // Restore progress if explicitly tracked
      setEpisodeProgress(prev => {
        const progress = prev[episode.id];
        if (progress && audioRef.current) {
          audioRef.current.currentTime = progress;
        }
        return prev;
      });

      audioRef.current.play();
    }
  };

  const toggleSavePodcast = (podcast: Podcast, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPodcasts(prev => {
      const isSaved = prev.some(p => p.feedUrl === podcast.feedUrl);
      const updated = isSaved ? prev.filter(p => p.feedUrl !== podcast.feedUrl) : [podcast, ...prev];
      localStorage.setItem("gymapp_podcast_library", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleLikeEpisode = (episode: Episode, ctxPodcast: Podcast | null | {name: string, artist: string, imageUrl: string, feedUrl: string}, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedEpisodes(prev => {
      const isLiked = prev.some(l => l.episode.id === episode.id);
      let updated;
      if (isLiked) {
         updated = prev.filter(l => l.episode.id !== episode.id);
      } else {
         const pctx = ctxPodcast || { name: "Podcast", artist: "Unknown", imageUrl: episode.imageUrl || "", feedUrl: "" };
         updated = [{ episode, podcastContext: pctx, likedAt: Date.now() }, ...prev];
      }
      localStorage.setItem("gymapp_podcast_liked", JSON.stringify(updated));
      return updated;
    });
  };

  if (!isVisible) return null;

  return (
    <div className="w-full h-full pb-[150px] overflow-y-auto premium-scrollbar bg-[#050505] relative flex flex-col">
      {!selectedPodcast ? (
        <div className="flex flex-col gap-6 p-4 pt-6 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col items-start px-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight flex items-center gap-3 mb-4">
              Podcasts <Radio className="w-6 h-6 text-emerald-400" />
            </h1>
            
            {/* Tabs */}
            <div className="flex gap-4 md:gap-6 border-b border-white/10 w-full mb-2 overflow-x-auto premium-scrollbar justify-start md:justify-start snap-x">
              <button 
                onClick={() => setActiveTab("explore")}
                className={`snap-start shrink-0 pb-3 text-sm md:text-base font-bold border-b-2 transition-all flex items-center gap-1.5 md:gap-2 ${activeTab === "explore" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-white"}`}
              >
                <Search className="w-4 h-4" /> Explorar
              </button>
              <button 
                onClick={() => setActiveTab("library")}
                className={`snap-start shrink-0 pb-3 text-sm md:text-base font-bold border-b-2 transition-all flex items-center gap-1.5 md:gap-2 ${activeTab === "library" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-white"}`}
              >
                <Library className="w-4 h-4" /> Biblioteca
              </button>
              <button 
                onClick={() => setActiveTab("liked")}
                className={`snap-start shrink-0 pb-3 text-sm md:text-base font-bold border-b-2 transition-all flex items-center gap-1.5 md:gap-2 ${activeTab === "liked" ? "border-emerald-500 text-emerald-400" : "border-transparent text-slate-500 hover:text-white"}`}
              >
                <Heart className="w-4 h-4" /> Favoritos
              </button>
            </div>
          </div>

          {activeTab === "explore" && (
            <>
              {/* Controls Container (Search + Categories) */}
              <div className="flex flex-col md:flex-row gap-3 px-2 mb-4">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                  <div className="relative h-full">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar podcasts..."
                      className="w-full h-full bg-[#111113] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm"
                    />
                  </div>
                </form>

                {/* Categories Dropdown */}
                <div className="relative w-full md:w-[280px] shrink-0">
                  <select
                    value={activeCategory}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setSearchQuery("");
                      setActiveCategory(cat);
                      searchPodcasts(cat);
                    }}
                    className="w-full h-full appearance-none bg-[#111113] border border-white/5 rounded-2xl py-3.5 pl-4 pr-10 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-colors shadow-sm text-sm"
                  >
                    <option disabled value="">Explorar categorías...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Podcast Grid */}
              <div className="px-2 mt-2">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                ) : error ? (
                  <p className="text-red-400 text-center py-10 font-bold">{error}</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-20">
                    {podcasts.map(podcast => {
                      const isSaved = savedPodcasts.some(p => p.feedUrl === podcast.feedUrl);
                      return (
                      <div
                        key={podcast.id}
                        onClick={() => loadEpisodes(podcast)}
                        className="group bg-[#0b0b0d] border border-white/5 rounded-2xl p-3 cursor-pointer hover:bg-[#151518] hover:border-emerald-500/30 transition-all flex flex-col relative"
                      >
                        <button 
                          onClick={(e) => toggleSavePodcast(podcast, e)}
                          className={`absolute top-4 right-4 p-1.5 rounded-full z-10 transition-all ${isSaved ? "bg-emerald-500 text-white shadow-lg" : "bg-black/50 text-white hover:bg-black/80"}`}
                        >
                          <Bookmark className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                        <img
                          src={podcast.imageUrl}
                          alt={podcast.name}
                          className="w-full aspect-square rounded-xl object-cover mb-3 shadow-md group-hover:scale-[1.02] transition-transform"
                          loading="lazy"
                        />
                        <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-1 group-hover:text-emerald-400 transition-colors">
                          {podcast.name}
                        </h3>
                        <p className="text-slate-500 text-xs line-clamp-1">{podcast.artist}</p>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "library" && (
            <div className="px-2 mt-2">
              {savedPodcasts.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <Library className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-slate-400 font-medium text-lg">Tu biblioteca está vacía.</p>
                  <p className="text-slate-500 text-sm mt-2">Guarda podcasts para acceder a ellos rápidamente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-20">
                  {savedPodcasts.map(podcast => {
                    const isSaved = true;
                    return (
                    <div
                      key={podcast.feedUrl}
                      onClick={() => loadEpisodes(podcast)}
                      className="group bg-[#0b0b0d] border border-white/5 rounded-2xl p-3 cursor-pointer hover:bg-[#151518] hover:border-emerald-500/30 transition-all flex flex-col relative"
                    >
                      <button 
                        onClick={(e) => toggleSavePodcast(podcast, e)}
                        className={`absolute top-4 right-4 p-1.5 rounded-full z-10 transition-all ${isSaved ? "bg-emerald-500 text-white shadow-lg" : "bg-black/50 text-white hover:bg-black/80"}`}
                      >
                        <Bookmark className={`w-3 h-3 ${isSaved ? "fill-current" : ""}`} />
                      </button>
                      <img
                        src={podcast.imageUrl}
                        alt={podcast.name}
                        className="w-full aspect-square rounded-xl object-cover mb-3 shadow-md group-hover:scale-[1.02] transition-transform"
                        loading="lazy"
                      />
                      <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight mb-1 group-hover:text-emerald-400 transition-colors">
                        {podcast.name}
                      </h3>
                      <p className="text-slate-500 text-xs line-clamp-1">{podcast.artist}</p>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}

          {activeTab === "liked" && (
            <div className="px-2 mt-2">
              {likedEpisodes.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <Heart className="w-12 h-12 text-slate-700 mb-4" />
                  <p className="text-slate-400 font-medium text-lg">No tienes episodios guardados.</p>
                  <p className="text-slate-500 text-sm mt-2">Dale me gusta a episodios para escucharlos más tarde.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pb-20">
                  {likedEpisodes.map(({episode, podcastContext}) => {
                    const isThisPlaying = currentEpisode?.id === episode.id && isPlaying;
                    const progress = episodeProgress[episode.id];
                    const isLiked = true;
                    return (
                      <div
                        key={episode.id}
                        className={`flex flex-col gap-2 p-3 md:p-4 rounded-2xl border transition-all ${
                          currentEpisode?.id === episode.id 
                            ? "bg-emerald-500/10 border-emerald-500/30" 
                            : "bg-[#0b0b0d] border-transparent hover:border-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0 cursor-pointer" onClick={() => playEpisode(episode, podcastContext as any)}>
                            <img 
                              src={episode.imageUrl || podcastContext.imageUrl} 
                              className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shadow-sm bg-black/50" 
                              alt="" 
                            />
                            {isThisPlaying && (
                               <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                  <Pause className="w-6 h-6 text-white" />
                               </div>
                            )}
                            {currentEpisode?.id === episode.id && !isPlaying && (
                               <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                  <Play className="w-6 h-6 text-white ml-1" />
                               </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playEpisode(episode, podcastContext as any)}>
                            <h4 className={`font-bold text-[13px] md:text-sm leading-tight line-clamp-2 mb-1 ${currentEpisode?.id === episode.id ? "text-emerald-400" : "text-white"}`}>
                              {episode.title}
                            </h4>
                            <p className="text-slate-400 text-xs mb-1 line-clamp-1">{podcastContext.name}</p>
                            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                               {episode.pubDate && <span>{new Date(episode.pubDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>}
                               {episode.duration && <span>• {episode.duration}</span>}
                               {progress > 0 && <span className="text-emerald-500 flex items-center gap-1"><Clock className="w-3 h-3"/></span>}
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleLikeEpisode(episode, podcastContext, e)}
                            className={`p-2.5 rounded-full transition-all shrink-0 ${isLiked ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-white"}`}
                          >
                            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-slate-400 text-xs line-clamp-2 md:line-clamp-1 flex-1 pr-3" dangerouslySetInnerHTML={{ __html: episode.description }} />
                            <button
                              onClick={() => playEpisode(episode, podcastContext as any)}
                              className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                                isThisPlaying
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-white/5 text-white hover:bg-white/10"
                              }`}
                            >
                              {isThisPlaying ? <><Pause className="w-3 h-3" /> Pausar</> : <><Play className="w-3 h-3" /> Escuchar</>}
                            </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col p-4 pt-4 md:pt-6 max-w-4xl mx-auto w-full pb-20">
          <button
            onClick={() => setSelectedPodcast(null)}
            className="self-start flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 md:mb-6 text-sm font-bold uppercase tracking-wider"
          >
            <ChevronLeft className="w-5 h-5" /> Volver
          </button>

          <div className="flex flex-row gap-4 md:gap-6 mb-4 items-center text-left bg-[#111113]/80 p-4 md:p-6 rounded-3xl border border-white/5 relative overflow-hidden">
             <div 
               className="absolute inset-0 opacity-20 blur-3xl rounded-3xl" 
               style={{ backgroundImage: `url(${selectedPodcast.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
             />
            <img
              src={selectedPodcast.imageUrl}
              alt={selectedPodcast.name}
              className="w-20 h-20 sm:w-24 sm:h-24 md:w-36 md:h-36 rounded-2xl shadow-xl object-cover shrink-0 relative z-10"
            />
            <div className="flex-1 flex flex-col justify-center min-w-0 relative z-10">
              <h2 className="text-lg md:text-3xl font-black text-white mb-0.5 md:mb-2 line-clamp-2 leading-tight">{selectedPodcast.name}</h2>
              <p className="text-emerald-400 font-bold text-xs md:text-base mb-2 md:mb-4 line-clamp-1">{selectedPodcast.artist}</p>
              <div className="hidden sm:flex flex-wrap items-center gap-2 justify-start">
                {selectedPodcast.genres.slice(0, 3).map(g => (
                  <span key={g} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-300">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6 px-1">
             <button
                onClick={(e) => toggleSavePodcast(selectedPodcast, e)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all flex-1 md:flex-none justify-center ${
                   savedPodcasts.some(p => p.feedUrl === selectedPodcast.feedUrl)
                     ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                     : "bg-white/10 text-white hover:bg-white/20"
                }`}
             >
                <Library className={`w-4 h-4 ${savedPodcasts.some(p => p.feedUrl === selectedPodcast.feedUrl) ? "fill-current" : ""}`} />
                {savedPodcasts.some(p => p.feedUrl === selectedPodcast.feedUrl) ? "En tu biblioteca" : "Guardar en biblioteca"}
             </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2 px-1">
            <Radio className="w-5 h-5 text-emerald-400" /> Episodios
          </h3>

          {isLoadingEpisodes ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          ) : error ? (
             <p className="text-red-400 text-center py-10 font-bold">{error}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {episodes.map(episode => {
                const isThisPlaying = currentEpisode?.id === episode.id && isPlaying;
                const progress = episodeProgress[episode.id];
                const isLiked = likedEpisodes.some(l => l.episode.id === episode.id);

                return (
                  <div
                    key={episode.id}
                    className={`flex flex-col gap-2 p-3 md:p-4 rounded-2xl border transition-all ${
                      currentEpisode?.id === episode.id 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-[#0b0b0d] border-transparent hover:border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0 cursor-pointer" onClick={() => playEpisode(episode, selectedPodcast)}>
                        <img 
                          src={episode.imageUrl || selectedPodcast.imageUrl} 
                          className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shadow-sm bg-black/50" 
                          alt="" 
                        />
                        {isThisPlaying && (
                           <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                              <Pause className="w-6 h-6 text-white" />
                           </div>
                        )}
                        {currentEpisode?.id === episode.id && !isPlaying && (
                           <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                              <Play className="w-6 h-6 text-white ml-1" />
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => playEpisode(episode, selectedPodcast)}>
                        <h4 className={`font-bold text-[13px] md:text-sm leading-tight line-clamp-2 mb-1 ${currentEpisode?.id === episode.id ? "text-emerald-400" : "text-white"}`}>
                          {episode.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                           {episode.pubDate && <span>{new Date(episode.pubDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>}
                           {episode.duration && <span>• {episode.duration}</span>}
                           {progress > 0 && <span className="text-emerald-500 flex items-center gap-1"><Clock className="w-3 h-3"/></span>}
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleLikeEpisode(episode, selectedPodcast, e)}
                        className={`p-2.5 rounded-full transition-all shrink-0 ${isLiked ? "text-emerald-400 bg-emerald-500/10" : "text-slate-500 hover:text-white"}`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-slate-400 text-xs line-clamp-2 md:line-clamp-1 flex-1 pr-3" dangerouslySetInnerHTML={{ __html: episode.description }} />
                        <button
                          onClick={() => playEpisode(episode, selectedPodcast)}
                          className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                            isThisPlaying
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/5 text-white hover:bg-white/10"
                          }`}
                        >
                          {isThisPlaying ? <><Pause className="w-3 h-3" /> Pausar</> : <><Play className="w-3 h-3" /> Escuchar</>}
                        </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mini Player Fixed at bottom inside this view */}
      {currentEpisode && (
        <div className="fixed bottom-[65px] md:bottom-0 left-1.5 md:left-[240px] right-1.5 md:right-[320px] lg:right-[380px] bg-[#111113]/95 backdrop-blur-md border border-emerald-500/30 md:border-x-0 md:border-b-0 md:border-t p-3 md:p-4 flex items-center gap-3 md:gap-4 z-[55] rounded-2xl md:rounded-none shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {currentEpisode.imageUrl && (
            <img src={currentEpisode.imageUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover shadow-lg shrink-0" alt="" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-emerald-400 uppercase tracking-widest mb-0.5">Escuchando Ahora</p>
            <p className="text-white font-bold text-xs md:text-sm truncate">{currentEpisode.title}</p>
          </div>
          <button
            onClick={() => {
              if (isPlaying) audioRef.current?.pause();
              else audioRef.current?.play();
            }}
            className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" />}
          </button>
        </div>
      )}
    </div>
  );
};
