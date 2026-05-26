import React, { useState, useEffect, useRef, useCallback } from "react";
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
  VolumeX, 
  Search, 
  Flame, 
  Plus, 
  Zap, 
  RotateCcw, 
  Heart,
  ExternalLink,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Lock
} from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, collectionGroup } from "firebase/firestore";
import { db, auth, loginWithGoogle } from "../lib/firebase";
import { handleFirestoreError, OperationType, useFirebase } from "./FirebaseProvider";
import { MusicPlaylist, MusicTrack } from "../types";

const ALL_DATABASE_TRACKS: MusicTrack[] = [
  { id: "phonk1", title: "Metamorphosis (Drift Phonk)", artist: "INTERWORLD", bpm: 135, duration: "2:23", soundcloudUrl: "https://soundcloud.com/interworld-music/metamorphosis" },
  { id: "phonk3", title: "Keraunos Beast Mode", artist: "PlayaPhonk", bpm: 140, duration: "2:26", soundcloudUrl: "https://soundcloud.com/playaphonk/keraunos" }
];

export default function GymMusicPlayer() {
  const { user, loading: authLoading } = useFirebase();
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [userPlaylists, setUserPlaylists] = useState<MusicPlaylist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [volume, setVolume] = useState(70);
  const widgetRef = useRef<any>(null);

  // Sync with Firestore
  useEffect(() => {
    let q;
    if (user) {
      q = query(
        collection(db, "users", user.uid, "playlists"),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(collectionGroup(db, "playlists"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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

  const currentTrack = selectedPlaylist?.tracks[currentTrackIndex] || ALL_DATABASE_TRACKS[0];

  const initWidget = useCallback(() => {
    const iframe = document.getElementById("sc-iframe") as HTMLIFrameElement;
    if (iframe && (window as any).SC) {
      const widget = (window as any).SC.Widget(iframe);
      widgetRef.current = widget;
      widget.bind((window as any).SC.Widget.Events.READY, () => {
        widget.setVolume(volume);
        if (isPlaying) widget.play();
      });
      widget.bind((window as any).SC.Widget.Events.PLAY, () => setIsPlaying(true));
      widget.bind((window as any).SC.Widget.Events.PAUSE, () => setIsPlaying(false));
    }
  }, [volume, isPlaying]);

  useEffect(() => {
    if (selectedPlaylist) initWidget();
  }, [currentTrack.soundcloudUrl, initWidget, selectedPlaylist]);

  const fetchMetadata = async (url: string) => {
    try {
      const res = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error("Metadata fetch error", e);
    }
    return null;
  };

  const handleAddPlaylist = async () => {
    if (!user) return alert("Inicia sesión para guardar tus playlists");
    const url = customUrl.trim();
    if (!url || !url.includes("soundcloud.com")) {
      alert("Por favor inserta un enlace válido de SoundCloud");
      return;
    }

    setIsFetchingMeta(true);
    const meta = await fetchMetadata(url);
    setIsFetchingMeta(false);

    const isPlaylist = url.includes("/sets/");
    try {
      const newPlDoc = {
        name: meta?.title || (isPlaylist ? "Mi Playlist" : "Mi Track"),
        genre: "SoundCloud",
        description: meta?.author_name || "Usuario",
        icon: isPlaylist ? "📂" : "🎵",
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tracks: [{
          id: `track_${Date.now()}`,
          title: meta?.title || "Audio Importado",
          artist: meta?.author_name || "SoundCloud",
          soundcloudUrl: url,
        }]
      };
      const docRef = await addDoc(collection(db, "users", user.uid, "playlists"), newPlDoc);
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
    if (!editingId || !user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "playlists", editingId), {
        name: editingName,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving edit", error);
    }
  };

  const deletePlaylist = async (plId: string) => {
    if (!user) return;
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
    setIsPlaying(true);
    setShowLibrary(false);
  };

  const togglePlayback = useCallback(() => {
    if (widgetRef.current) widgetRef.current.toggle();
    else setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.next();
      setIsPlaying(true);
    }
  }, []);

  const handlePrev = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.prev();
      setIsPlaying(true);
    }
  }, []);

  // Media Session API Integration for background playback
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    if (selectedPlaylist && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist || selectedPlaylist.name,
        album: "Gym Music Sync",
        artwork: [
          { src: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png', sizes: '512x512', type: 'image/png' },
        ]
      });
      try {
        navigator.mediaSession.setActionHandler('play', togglePlayback);
        navigator.mediaSession.setActionHandler('pause', togglePlayback);
        navigator.mediaSession.setActionHandler('previoustrack', handlePrev);
        navigator.mediaSession.setActionHandler('nexttrack', handleNext);
      } catch (e) {
        console.warn("MediaSession Action Handler error", e);
      }
    }
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [currentTrack, selectedPlaylist, togglePlayback, handleNext, handlePrev]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (widgetRef.current) widgetRef.current.setVolume(newVol);
  };

  const getSoundCloudEmbedUrl = (scUrl: string) => {
    const encodedUrl = encodeURIComponent(scUrl);
    // Force visual=false for a much cleaner, more technical UI with fewer external links
    return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2310b981&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_playcount=false&buying=false&sharing=false&download=false`;
  };

  return (
    <div className="bg-[#050505] text-white rounded-[32px] p-2 shadow-2xl h-full min-h-[450px] max-h-[75vh] lg:max-h-[600px] flex flex-col border border-white/5 ring-1 ring-white/10 overflow-hidden relative">
      {/* HUD Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-xl">
            <Music className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-widest uppercase italic leading-none">Bienve Music</h2>
            {selectedPlaylist && (
              <p className="text-[10px] text-emerald-400/60 font-bold uppercase mt-1 flex items-center gap-1.5">
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                {selectedPlaylist.name}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowLibrary(!showLibrary)}
            className={`p-2 rounded-xl transition flex items-center gap-2 ${showLibrary ? 'bg-emerald-500 text-black' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
          >
            <ListMusic className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase hidden sm:block">Biblioteca</span>
          </button>
          
          {user && (
            <button 
              onClick={() => { setIsAdding(!isAdding); if (!isAdding) setShowLibrary(false); }}
              className={`p-2 rounded-xl transition ${isAdding ? 'bg-amber-500 text-black' : 'bg-white/5 hover:bg-white/10 border border-white/5'}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 relative min-h-0 flex flex-col">
        {selectedPlaylist ? (
          <div className="flex-1 flex flex-col p-2 min-h-0">
            <div className="flex-1 rounded-2xl overflow-hidden bg-black relative shadow-2xl ring-1 ring-white/10">
              <iframe
                id="sc-iframe"
                key={currentTrack.soundcloudUrl}
                src={getSoundCloudEmbedUrl(currentTrack.soundcloudUrl)}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-white transition"><SkipBack className="w-5 h-5" /></button>
                <button onClick={togglePlayback} className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg shadow-white/10">
                  {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
                </button>
                <button onClick={handleNext} className="p-2 text-slate-400 hover:text-white transition"><SkipForward className="w-5 h-5" /></button>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                 <Volume2 className="w-4 h-4 text-slate-500" />
                 <input type="range" min="0" max="100" value={volume} onChange={(e) => handleVolumeChange(parseInt(e.target.value))} className="w-16 sm:w-32 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 p-12">
            <Disc className="w-16 h-16 mb-4 animate-spin-slow" />
            <p className="text-xs font-black uppercase tracking-[0.2em]">Sincronización de Audio</p>
          </div>
        )}

        {/* Overlays */}
        {showLibrary && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-20 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Tus Canales</h3>
                <p className="text-[10px] text-slate-500 mt-1">{userPlaylists.length} Carpetas Sincronizadas</p>
              </div>
              <button onClick={() => setShowLibrary(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-2 scrollbar-hide">
              {userPlaylists.length === 0 && !isAdding && (
                <div className="col-span-full py-20 border border-dashed border-white/10 rounded-3xl text-center">
                  <Music className="w-8 h-8 text-white/10 mx-auto mb-3" />
                  <p className="text-[10px] text-slate-500 uppercase font-black">Biblioteca Vacía</p>
                </div>
              )}

              {userPlaylists.map((pl) => (
                <div key={pl.id} className="relative group">
                  <button
                    onClick={() => selectPlaylist(pl)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      selectedPlaylist?.id === pl.id ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/5 border-transparent hover:bg-white/10"
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-lg">{pl.icon}</div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-bold truncate">{pl.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase truncate">{pl.description}</p>
                    </div>
                  </button>
                  {user && pl.ownerId === user.uid && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={(e) => { e.stopPropagation(); startEditing(pl); }} className="p-1.5 text-slate-500 hover:text-emerald-400"><Edit2 className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }} className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isAdding && (
          <div className="absolute inset-x-0 top-0 p-4 z-30 animate-in slide-in-from-top duration-300">
            <div className="bg-[#111] border border-emerald-500/20 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Importar desde SoundCloud</p>
                <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  placeholder="Enlace de canción o playlist..." 
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  disabled={isFetchingMeta}
                  className="w-full bg-black border border-white/5 rounded-2xl px-5 py-3 text-xs outline-none focus:border-emerald-500 transition"
                />
                <button 
                  onClick={handleAddPlaylist}
                  disabled={isFetchingMeta}
                  className="w-full bg-emerald-500 text-black py-3 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
                >
                  {isFetchingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : "VINCULAR CANAL"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!user && !authLoading && (
        <div className="mx-4 mb-4 bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <p className="text-[9px] font-black uppercase text-emerald-400">Modo Invitado</p>
          </div>
          <button onClick={loginWithGoogle} className="text-[9px] font-black text-emerald-400 hover:underline">Sincronizar Cloud →</button>
        </div>
      )}
    </div>
  );
}
