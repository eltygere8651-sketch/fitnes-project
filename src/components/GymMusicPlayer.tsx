import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  ListMusic,
  Volume2,
  Sparkles,
  Disc,
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Shuffle,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  collectionGroup,
} from "firebase/firestore";
import { db, loginWithGoogle, logout } from "../lib/firebase";
import { useFirebase } from "./FirebaseProvider";
import { MusicPlaylist, MusicTrack } from "../types";

const ALL_DATABASE_TRACKS: MusicTrack[] = [
  {
    id: "phonk1",
    title: "Metamorphosis (Drift Phonk)",
    artist: "INTERWORLD",
    bpm: 135,
    duration: "2:23",
    soundcloudUrl: "https://soundcloud.com/interworld-music/metamorphosis",
  },
  {
    id: "phonk2",
    title: "Midnight City",
    artist: "M83",
    bpm: 105,
    duration: "4:03",
    soundcloudUrl: "https://soundcloud.com/m83/midnight-city",
  },
];

export default function GymMusicPlayer() {
  const { user, loading: authLoading } = useFirebase();
  const isAdmin = user?.email === "eltygere8651@gmail.com";
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MusicPlaylist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [userPlaylists, setUserPlaylists] = useState<MusicPlaylist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const [currentTrackMeta, setCurrentTrackMeta] = useState<any>(null);

  // REALTIME ENGINE STATES
  const [engineTracks, setEngineTracks] = useState<any[]>([]);
  const [engineTrackIndex, setEngineTrackIndex] = useState(0);
  const [engineCurrentSound, setEngineCurrentSound] = useState<any>(null);

  const [showLibrary, setShowLibrary] = useState(false);
  const [showTracks, setShowTracks] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [volume, setVolume] = useState(70);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const widgetRef = useRef<any>(null);

  const currentTrack =
    selectedPlaylist?.tracks[currentTrackIndex] || ALL_DATABASE_TRACKS[0];
  const currentUrl = currentTrack.url || currentTrack.soundcloudUrl || "";

  const togglePlayback = useCallback(() => {
    if (widgetRef.current) widgetRef.current.toggle();
    else setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (isShuffle) {
      if (engineTracks.length > 1 && widgetRef.current) {
        const randomIndex = Math.floor(Math.random() * engineTracks.length);
        widgetRef.current.skip(randomIndex);
        setIsPlaying(true);
      } else if (selectedPlaylist && selectedPlaylist.tracks.length > 1) {
        const randomIndex = Math.floor(
          Math.random() * selectedPlaylist.tracks.length,
        );
        setCurrentTrackIndex(randomIndex);
      }
      return;
    }

    if (engineTracks.length > 1 && widgetRef.current) {
      widgetRef.current.next();
      setIsPlaying(true);
    } else if (
      selectedPlaylist &&
      currentTrackIndex < selectedPlaylist.tracks.length - 1
    ) {
      setCurrentTrackIndex((prev) => prev + 1);
    }
  }, [selectedPlaylist, currentTrackIndex, engineTracks, isShuffle]);

  const handlePrev = useCallback(() => {
    if (isShuffle) {
      if (engineTracks.length > 1 && widgetRef.current) {
        const randomIndex = Math.floor(Math.random() * engineTracks.length);
        widgetRef.current.skip(randomIndex);
        setIsPlaying(true);
      } else if (selectedPlaylist && selectedPlaylist.tracks.length > 1) {
        const randomIndex = Math.floor(
          Math.random() * selectedPlaylist.tracks.length,
        );
        setCurrentTrackIndex(randomIndex);
      }
      return;
    }

    if (engineTracks.length > 1 && widgetRef.current) {
      widgetRef.current.prev();
      setIsPlaying(true);
    } else if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
    }
  }, [currentTrackIndex, engineTracks, isShuffle, selectedPlaylist]);

  // Fetch meta for custom UI
  useEffect(() => {
    if (currentUrl) {
      fetchMetadata(currentUrl).then((meta) => {
        if (meta) {
          setCurrentTrackMeta(meta);
        }
      });
    }
  }, [currentTrack, currentUrl]);

  // Sync with Firestore
  useEffect(() => {
    let q;
    if (user) {
      q = query(
        collection(db, "users", user.uid, "playlists"),
        orderBy("createdAt", "desc"),
      );
    } else {
      q = query(collectionGroup(db, "playlists"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MusicPlaylist[];
      setUserPlaylists(folders);
      if (!selectedPlaylist && folders.length > 0) {
        setSelectedPlaylist(folders[0]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!(window as any).SC) {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleNextRef = useRef(handleNext);

  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const initWidget = useCallback(() => {
    const iframe = document.getElementById("sc-iframe") as HTMLIFrameElement;
    if (iframe && (window as any).SC) {
      const widget = (window as any).SC.Widget(iframe);
      widgetRef.current = widget;

      try {
        widget.unbind((window as any).SC.Widget.Events.READY);
        widget.unbind((window as any).SC.Widget.Events.PLAY);
        widget.unbind((window as any).SC.Widget.Events.PAUSE);
        widget.unbind((window as any).SC.Widget.Events.PLAY_PROGRESS);
        widget.unbind((window as any).SC.Widget.Events.FINISH);
      } catch (e) {}

      widget.bind((window as any).SC.Widget.Events.READY, () => {
        widget.getSounds((sounds: any[]) => {
          if (sounds && sounds.length > 0) {
            setEngineTracks(
              sounds.map((s) => ({
                id: s.id.toString(),
                title: s.title,
                artist: s.user?.username || "SoundCloud Artist",
                artwork_url: s.artwork_url,
              })),
            );
          }
        });
        widget.getDuration((d: number) => setDuration(d));
        if (isPlayingRef.current) widget.play();
      });

      widget.bind((window as any).SC.Widget.Events.PLAY, () => {
        setIsPlaying(true);
        widget.getCurrentSoundIndex((index: number) =>
          setEngineTrackIndex(index),
        );
        widget.getCurrentSound((sound: any) => {
          setEngineCurrentSound(sound);
          setDuration(sound.duration);
        });
      });

      widget.bind((window as any).SC.Widget.Events.PAUSE, () =>
        setIsPlaying(false),
      );

      widget.bind(
        (window as any).SC.Widget.Events.PLAY_PROGRESS,
        (data: any) => {
          setPosition(data.currentPosition);
        },
      );

      widget.bind((window as any).SC.Widget.Events.FINISH, () => {
        if (handleNextRef.current) handleNextRef.current();
      });
    }
  }, []);

  useEffect(() => {
    if (widgetRef.current) {
      widgetRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (selectedPlaylist) {
      const timer = setTimeout(() => initWidget(), 300);
      return () => clearTimeout(timer);
    }
  }, [currentUrl, initWidget, selectedPlaylist]);

  const fetchMetadata = async (url: string) => {
    try {
      const res = await fetch(
        `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
      );
      if (res.ok) return await res.json();
    } catch (e) {
      console.error("Metadata fetch error", e);
    }
    return null;
  };

  const handleAddPlaylist = async () => {
    if (!isAdmin) return alert("Solo admin puede añadir playlists");
    const url = customUrl.trim();
    if (!url || !url.includes("soundcloud.com")) {
      alert("Por favor inserta un enlace válido de SoundCloud");
      return;
    }

    setIsFetchingMeta(true);
    const meta = await fetchMetadata(url);
    setIsFetchingMeta(false);

    const isPlaylist = url.includes("/sets/");
    const provider = "SoundCloud";

    try {
      const newPlDoc = {
        name: meta?.title || (isPlaylist ? `Nueva lista` : `Nuevo tema`),
        genre: provider,
        description: meta?.author_name || `Audio via ${provider}`,
        icon: isPlaylist ? "📂" : "🎵",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tracks: [
          {
            id: `track_${Date.now()}`,
            title: meta?.title || "Audio Importado",
            artist: meta?.author_name || provider,
            url: url,
          },
        ],
      };
      const docRef = await addDoc(
        collection(db, "users", user.uid, "playlists"),
        newPlDoc,
      );
      setCustomUrl("");
      setIsAdding(false);
      setSelectedPlaylist({ id: docRef.id, ...newPlDoc } as any);
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      setShowLibrary(false);
    } catch (error) {
      console.error("Error adding playlist", error);
    }
  };

  const startEditing = (pl: MusicPlaylist) => {
    setEditingId(pl.id);
    setEditingName(pl.name);
  };

  const saveEdit = async () => {
    if (!editingId || !isAdmin) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "playlists", editingId), {
        name: editingName,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving edit", error);
    }
  };

  const deletePlaylist = async (plId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "playlists", plId));
      if (selectedPlaylist?.id === plId) setSelectedPlaylist(null);
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  const selectPlaylist = (playlist: MusicPlaylist) => {
    setCustomUrl("");
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setEngineTracks([]);
    setEngineTrackIndex(0);
    setEngineCurrentSound(null);
    setPosition(0);
    setDuration(0);
    setIsPlaying(true);
    setShowLibrary(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseInt(e.target.value);
    setPosition(newPos);
    if (widgetRef.current) {
      widgetRef.current.seekTo(newPos);
    }
  };

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Media Session API Integration for background playback
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    if (selectedPlaylist && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || selectedPlaylist.name,
        album: "Bienve Music App",
        artwork: [
          {
            src: "https://cdn-icons-png.flaticon.com/512/3844/3844724.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });
      try {
        navigator.mediaSession.setActionHandler("play", togglePlayback);
        navigator.mediaSession.setActionHandler("pause", togglePlayback);
        navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
        navigator.mediaSession.setActionHandler("nexttrack", handleNext);
      } catch (e) {
        console.warn("MediaSession Action Handler error", e);
      }
    }
    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    };
  }, [currentTrack, selectedPlaylist, togglePlayback, handleNext, handlePrev]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (widgetRef.current) {
      try {
        widgetRef.current.setVolume(newVol);
      } catch (e) {
        console.warn("Widget volume set failed", e);
      }
    }
  };

  const getEmbedUrl = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2310b981&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_playcount=false&buying=false&sharing=false&download=false`;
  };

  // --- DERIVED UI STATES ---
  const displayTracks =
    engineTracks.length > 0
      ? engineTracks
      : selectedPlaylist?.tracks || ALL_DATABASE_TRACKS;
  const displayTrackIndex =
    engineTracks.length > 0 ? engineTrackIndex : currentTrackIndex;

  const displayTitle =
    engineCurrentSound?.title || currentTrack?.title || "Waiting...";
  const displayArtist =
    engineCurrentSound?.user?.username ||
    engineCurrentSound?.artist ||
    currentTrack?.artist ||
    "Original Arch";
  const displayArtwork =
    engineCurrentSound?.artwork_url?.replace("large", "t500x500") ||
    currentTrackMeta?.thumbnail_url?.replace("badge", "t500x500") ||
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="bg-[#080809]/90 backdrop-blur-3xl text-white shadow-2xl h-full min-h-[85vh] lg:min-h-[620px] lg:h-full flex flex-col border border-white/5 overflow-hidden font-sans relative sm:rounded-[40px] rounded-[32px]">
      {/* 1. COMPACT HEADER */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-[#0a0a0b]/60 backdrop-blur-xl shrink-0 z-40">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20"
          >
            <Music className="w-4 h-4 text-emerald-500" />
          </motion.div>
          <div className="min-w-0">
            <p className="text-[9px] font-black tracking-[0.3em] uppercase text-emerald-500 mb-0.5 opacity-70">
              SoundCloud Engine
            </p>
            <h2 className="text-sm font-black tracking-tight text-white truncate max-w-[200px] sm:max-w-md uppercase">
              {displayTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setShowLibrary(!showLibrary);
              setIsAdding(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-[10px] font-black uppercase ${
              showLibrary
                ? "bg-white text-black border-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Librería</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setIsAdding(!isAdding);
                setShowLibrary(false);
              }}
              className={`p-2.5 rounded-xl transition-all border ${isAdding ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400"}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {!user ? (
            <button
              onClick={loginWithGoogle}
              title="Admin Login"
              className="p-2.5 rounded-xl transition-all border bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-emerald-500"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl transition-all border bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-rose-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN SPLIT STAGE */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative overflow-y-auto lg:overflow-hidden scrollbar-hide">
        {/* LEFT: COMPACT PLAYER ENGINE */}
        <div className="flex-none lg:flex-[1] flex flex-col min-w-0 bg-[#080808] border-b lg:border-b-0 lg:border-r border-white/5 pb-6 lg:pb-0 shrink-0">
          {selectedPlaylist ? (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-hide relative">
              <div className="flex-1 flex flex-col p-6 lg:px-8">
                <div className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center gap-6 sm:gap-8 py-2">
                  {/* Compact Visual Center */}
                  <div className="relative group self-center w-full flex justify-center mt-2 sm:mt-0">
                    <AnimatePresence>
                      {isPlaying && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          className="absolute -inset-10 bg-emerald-500/10 blur-[80px] rounded-full z-0 pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                    <motion.div
                      layoutId="artwork"
                      className={`relative z-10 w-40 h-40 sm:w-56 sm:h-56 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-2xl border border-white/10 transition-all duration-700 ${isPlaying ? "scale-105 border-emerald-500/30" : "scale-100"}`}
                    >
                      <img
                        src={displayArtwork}
                        alt="Artwork"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    </motion.div>
                  </div>

                  {/* Text Info */}
                  <div className="text-center space-y-3">
                    <motion.div
                      key={currentTrack.id}
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="space-y-1"
                    >
                      <h1 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight truncate max-w-sm mx-auto">
                        {displayTitle}
                      </h1>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">
                        {displayArtist}
                      </p>
                    </motion.div>
                  </div>

                  {/* Minimal Controls */}
                  <div className="w-full max-w-sm mx-auto">
                    <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                      <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-2 transition-all transform hover:scale-110 ${isShuffle ? "text-emerald-500 bg-emerald-500/10 rounded-full" : "text-slate-400 hover:text-white"}`}
                      >
                        <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={handlePrev}
                        className="p-2 text-slate-600 hover:text-white transition-all transform hover:scale-110"
                      >
                        <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlayback}
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${isPlaying ? "bg-emerald-500 text-black shadow-emerald-500/30" : "bg-white text-black hover:bg-slate-200"}`}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 sm:w-7 sm:h-7 fill-black" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-7 sm:h-7 fill-black ml-1" />
                        )}
                      </motion.button>
                      <button
                        onClick={handleNext}
                        className="p-2 text-slate-600 hover:text-white transition-all transform hover:scale-110"
                      >
                        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                      <div className="w-8 shrink-0" />{" "}
                      {/* Balance spacer for the shuffle button */}
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[9px] font-mono text-slate-500">
                        {formatTime(position)}
                      </span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group shadow-inner">
                        <input
                          type="range"
                          min="0"
                          max={duration || 100}
                          value={position}
                          onChange={handleSeek}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className="h-full bg-emerald-500 rounded-full relative pointer-events-none"
                          style={{
                            width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                          }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md translate-x-1/2 scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">
                        {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group shadow-inner">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) =>
                            handleVolumeChange(parseInt(e.target.value))
                          }
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300 relative pointer-events-none"
                          style={{ width: `${volume}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-xl translate-x-1/2 scale-0 group-hover:scale-100 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SC Engine Viewport (Hidden but active) */}
              <div className="absolute bottom-4 right-4 w-32 h-10 opacity-0 pointer-events-none overflow-hidden select-none">
                <iframe
                  id="sc-iframe"
                  key={currentUrl}
                  src={getEmbedUrl(currentUrl)}
                  allow="autoplay; encrypted-media"
                  loading="lazy"
                  className="w-64 h-32 absolute top-0 -left-10"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-32 h-32 border border-dashed border-white/10 rounded-full flex items-center justify-center mb-6">
                <Music className="w-8 h-8 text-white/5 animate-pulse" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 mb-4">
                Signal Offline
              </h3>
              <button
                onClick={() => setShowLibrary(true)}
                className="px-6 py-3 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-xl hover:scale-105 transition-all shadow-xl active:scale-95"
              >
                Abrir Biblioteca
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: PERMANENT TRACK LIST (Optimized for Visibility) */}
        <div
          className={`flex-none lg:flex-[0.7] h-[400px] lg:h-auto bg-black/40 flex flex-col ${!selectedPlaylist ? "hidden" : ""}`}
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                En Cola
              </p>
              <h3 className="text-xs font-black text-white uppercase truncate max-w-[150px]">
                {selectedPlaylist?.name}
              </h3>
            </div>
            <Disc className="w-4 h-4 text-emerald-500/20 animate-spin-slow" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-hide">
            {displayTracks.map((track, idx) => (
              <button
                key={track.id || idx}
                onClick={() => {
                  if (engineTracks.length > 0) {
                    widgetRef.current?.skip(idx);
                    setIsPlaying(true);
                  } else {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                  }
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left border ${
                  displayTrackIndex === idx
                    ? "bg-emerald-500 border-white/10 text-black shadow-md"
                    : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/5"
                }`}
              >
                <div
                  className={`text-[9px] font-black w-4 shrink-0 transition-colors ${displayTrackIndex === idx ? "text-black/40" : "text-emerald-500/30"}`}
                >
                  {(idx + 1).toString().padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[11px] font-black truncate leading-tight ${displayTrackIndex === idx ? "text-black" : "text-white"}`}
                  >
                    {track.title}
                  </p>
                  <p
                    className={`text-[8px] font-bold uppercase truncate opacity-60`}
                  >
                    {track.artist || "Unknown"}
                  </p>
                </div>
                {displayTrackIndex === idx && isPlaying && (
                  <div className="flex gap-0.5 items-end h-3">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [2, 10, 2] }}
                        transition={{
                          duration: 0.4 + i * 0.1,
                          repeat: Infinity,
                        }}
                        className="w-[2px] bg-black rounded-full"
                      />
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="p-4 bg-black/40 border-t border-white/5">
            <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-600 tracking-widest">
              <span>Pistas: {displayTracks.length || 0}</span>
              <span className="text-emerald-500/40">Studio Pro v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY: LIBRARY MODAL */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 sm:p-12"
          >
            <div className="w-full max-w-5xl h-full max-h-[90%] flex flex-col bg-[#080808] border border-white/10 rounded-[48px] overflow-hidden shadow-4xl relative">
              {/* Starry Background for Library */}
              <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />

              <div className="flex justify-between items-center px-6 py-6 sm:px-10 sm:py-10 relative z-10 shrink-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-[0.5em] text-emerald-400 mb-2">
                    Music Archive
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    {userPlaylists.length} Canales Sincronizados
                  </p>
                </div>
                <button
                  onClick={() => setShowLibrary(false)}
                  className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-8 sm:px-10 sm:pb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 scrollbar-hide relative z-10">
                {userPlaylists.map((pl, idx) => (
                  <motion.div
                    key={pl.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative group h-full"
                  >
                    <button
                      onClick={() => selectPlaylist(pl)}
                      className={`w-full flex flex-col gap-6 p-8 rounded-[40px] border transition-all text-left h-full group ${
                        selectedPlaylist?.id === pl.id
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="w-16 h-16 bg-black/40 rounded-[28px] flex items-center justify-center text-3xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform duration-500">
                        {pl.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-black truncate uppercase tracking-tight mb-2">
                          {pl.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-widest leading-relaxed">
                          {pl.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 bg-white/[0.05] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, delay: idx * 0.1 }}
                            className="h-full bg-emerald-500/40"
                          />
                        </div>
                        <span className="text-[10px] font-black text-emerald-500/60 uppercase">
                          {pl.tracks.length} PISTAS
                        </span>
                      </div>
                    </button>

                    {isAdmin && (
                      <div className="absolute right-6 top-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(pl);
                          }}
                          className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-slate-400 hover:text-emerald-400 border border-white/10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlaylist(pl.id);
                          }}
                          className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-slate-400 hover:text-red-400 border border-white/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: ADD PLAYLIST MODAL */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-[#111] border border-white/10 rounded-[32px] sm:rounded-[48px] p-6 sm:p-10 shadow-4xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[100px] rounded-full" />

              <div className="flex justify-between items-center mb-8 sm:mb-10 relative z-10">
                <p className="text-[11px] sm:text-sm font-black uppercase text-white tracking-[0.4em]">
                  Connect Channel
                </p>
                <button
                  onClick={() => setIsAdding(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 block">
                    Dirección SoundCloud
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="https://soundcloud.com/..."
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      disabled={isFetchingMeta}
                      className="w-full bg-black/50 border border-white/10 rounded-3xl px-8 py-5 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium pr-14"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600 px-4 italic">
                    Inserta el enlace de un tema o una lista de reproducción
                    completa.
                  </p>
                </div>

                <button
                  onClick={handleAddPlaylist}
                  disabled={isFetchingMeta}
                  className="w-full bg-white text-black py-5 rounded-3xl text-sm font-black shadow-2xl hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                >
                  {isFetchingMeta ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      SINCRONIZAR AHORA{" "}
                      <SkipForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
