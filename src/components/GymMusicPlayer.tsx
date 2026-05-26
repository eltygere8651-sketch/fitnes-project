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
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [volume, setVolume] = useState(70);
  const widgetRef = useRef<any>(null);

  // Sync with Firestore
  useEffect(() => {
    let q;
    let fallbackPath = "global_playlists";
    
    if (user) {
      // User specific playlists
      q = query(
        collection(db, "users", user.uid, "playlists"),
        orderBy("createdAt", "desc")
      );
      fallbackPath = `users/${user.uid}/playlists`;
    } else {
      // Guest mode: fetch ALL playlists from all users
      // Note: Removed orderBy to avoid requiring a composite index for new apps
      q = query(
        collectionGroup(db, "playlists")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MusicPlaylist[];
      
      setUserPlaylists(folders);
      
      // Select first if none selected
      if (!selectedPlaylist && folders.length > 0) {
        setSelectedPlaylist(folders[0]);
      }
    }, (error) => {
      if (user) {
        handleFirestoreError(error, OperationType.LIST, fallbackPath);
      } else {
        console.warn("Guest access: Some playlists might be restricted", error);
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
    const path = `users/${user.uid}/playlists`;
    
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
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const startEditing = (pl: MusicPlaylist) => {
    setEditingId(pl.id);
    setEditingName(pl.name);
  };

  const saveEdit = async () => {
    if (!editingId || !user) return;
    const path = `users/${user.uid}/playlists/${editingId}`;
    try {
      await updateDoc(doc(db, "users", user.uid, "playlists", editingId), {
        name: editingName,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deletePlaylist = async (plId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/playlists/${plId}`;
    try {
      await deleteDoc(doc(db, "users", user.uid, "playlists", plId));
      if (selectedPlaylist?.id === plId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const selectPlaylist = (playlist: MusicPlaylist) => {
    setCustomUrl("");
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  const togglePlayback = () => {
    if (widgetRef.current) widgetRef.current.toggle();
    else setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (widgetRef.current) {
      widgetRef.current.next();
      setIsPlaying(true);
    }
  };

  const handlePrev = () => {
    if (widgetRef.current) {
      widgetRef.current.prev();
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (widgetRef.current) widgetRef.current.setVolume(newVol);
  };

  const getSoundCloudEmbedUrl = (scUrl: string) => {
    const encodedUrl = encodeURIComponent(scUrl);
    const isPlaylist = scUrl.includes("/sets/");
    return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2310b981&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=${isPlaylist}&show_playcount=false`;
  };

  return (
    <div className="bg-[#050505] text-white rounded-3xl p-4 shadow-2xl h-full flex flex-col gap-4 border border-white/5 ring-1 ring-white/10 overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Music className="w-5 h-5 text-black" />
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic">
            Focus <span className="text-emerald-400">Audio</span>
          </h2>
        </div>
        {user && (
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-2xl transition text-xs font-bold"
          >
            {isAdding ? "Cerrar" : <><Plus className="w-4 h-4" /> Importar</>}
          </button>
        )}
      </div>

      {!user && !authLoading && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-emerald-400 leading-none">Modo Invitado Activo</p>
              <p className="text-[9px] text-slate-500 mt-1">Reproduce música libremente. Inicia sesión para guardar tus propios canales.</p>
            </div>
          </div>
          <button 
            onClick={loginWithGoogle}
            className="bg-emerald-500 text-black px-3 py-1.5 rounded-xl text-[9px] font-black hover:scale-105 transition shadow-lg shadow-emerald-500/20 whitespace-nowrap"
          >
            GUARDAR CANALES
          </button>
        </div>
      )}

      {user && isAdding && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-3xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-bold uppercase text-emerald-400">Escaneando SoundCloud...</p>
            {isFetchingMeta && <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Pega el enlace oficial aquí..." 
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              disabled={isFetchingMeta}
              className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-emerald-500 transition disabled:opacity-50"
            />
            <button 
              onClick={handleAddPlaylist}
              disabled={isFetchingMeta}
              className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-xs font-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition flex items-center gap-2"
            >
              {isFetchingMeta ? "IDENTIFICANDO..." : "IMPORTAR"}
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left Side: Library Grid */}
        <div className="lg:w-1/3 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500 px-2 tracking-widest">
            <span>Tu Música</span>
            <span>{userPlaylists.length} Carpetas</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
            {userPlaylists.length === 0 && !isAdding && (
              <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl text-center">
                <Music className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-[10px] text-slate-500 uppercase font-black">Biblioteca Vacía</p>
                <p className="text-[10px] text-slate-600">Importa tus temas favoritos</p>
              </div>
            )}

            {userPlaylists.map((pl) => (
              <div key={pl.id} className="relative group/item">
                <button
                  onClick={() => selectPlaylist(pl)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    selectedPlaylist?.id === pl.id ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-xl ring-1 ring-white/5 shadow-inner">
                    {pl.icon}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    {editingId === pl.id ? (
                      <div className="flex items-center gap-2 pr-16" onClick={e => e.stopPropagation()}>
                        <input 
                          autoFocus
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          className="w-full bg-black border border-emerald-500/50 rounded px-2 py-0.5 text-xs outline-none"
                        />
                        <button onClick={saveEdit} className="text-emerald-400 hover:text-white"><Check className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-black truncate">{pl.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter truncate">{pl.description}</p>
                      </>
                    )}
                  </div>
                </button>
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition">
                  {user && pl.ownerId === user.uid && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEditing(pl); }}
                        className="p-2 text-slate-500 hover:text-emerald-400 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl.id);
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Player Stage */}
        <div className="flex-1 flex flex-col gap-4 bg-white/5 border border-white/5 rounded-[32px] p-2 relative">
          {selectedPlaylist ? (
            <>
              <div className="flex justify-between items-center px-4 pt-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-slate-700'}`} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Reproduciendo de {selectedPlaylist.name}</p>
                    <p className="text-xs font-black truncate text-emerald-400 mt-1">{currentTrack.title}</p>
                  </div>
                </div>
                <a href={currentTrack.soundcloudUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl hover:text-emerald-400 transition">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="flex-1 min-h-[350px] rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 relative group">
                <iframe
                  id="sc-iframe"
                  key={currentTrack.soundcloudUrl}
                  src={getSoundCloudEmbedUrl(currentTrack.soundcloudUrl)}
                  className="w-full h-full border-0 rounded-2xl"
                  allow="autoplay"
                />
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer" onClick={togglePlayback}>
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center transform hover:scale-110 transition duration-300 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                      <Play className="w-10 h-10 text-black fill-black ml-1.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between px-4 pb-4 pt-3 border-t border-white/5 gap-4">
                <div className="flex items-center gap-4">
                   <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-white transition"><SkipBack className="w-5 h-5" /></button>
                   <button onClick={togglePlayback} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-lg">
                     {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-1" />}
                   </button>
                   <button onClick={handleNext} className="p-2 text-slate-400 hover:text-white transition"><SkipForward className="w-5 h-5" /></button>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5 min-w-[150px]">
                   <Volume2 className="w-4 h-4 text-slate-400" />
                   <input type="range" min="0" max="100" value={volume} onChange={(e) => handleVolumeChange(parseInt(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                   <span className="text-[10px] font-mono text-slate-500 w-6">{volume}%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
              <Disc className="w-20 h-20 mb-4 animate-spin-slow" />
              <p className="text-sm font-black uppercase tracking-widest italic">Selecciona o importa un canal de SoundCloud</p>
              <p className="text-[10px] text-slate-500 mt-2">La música se sincronizará automáticamente para tu entrenamiento</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="bg-emerald-500/5 p-2 rounded-2xl border border-emerald-500/10 flex items-center justify-center gap-3">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 opacity-60">
          Entrenamiento Optimizado • Audio Cloud Streaming
        </p>
        <Sparkles className="w-3 h-3 text-emerald-400" />
      </div>
    </div>
  );
}
