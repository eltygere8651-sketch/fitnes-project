import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  ListMusic,
  Volume2,
  Volume1,
  VolumeX,
  Sparkles,
  Disc,
  Plus,
  Minus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Shuffle,
  Shield,
  ShieldAlert,
  LogOut,
  LogIn,
  Headphones,
  Save,
  ChevronDown,
  ChevronUp,
  Search,
  ListPlus,
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
    url: "https://www.youtube.com/watch?v=H5b0pZ79XgQ",
  },
  {
    id: "phonk2",
    title: "Midnight City",
    artist: "M83",
    bpm: 105,
    duration: "4:03",
    url: "https://www.youtube.com/watch?v=dX3kSGcoD6M",
  },
  {
    id: "gym1",
    title: "The Business",
    artist: "Tiësto",
    bpm: 120,
    duration: "2:44",
    url: "https://www.youtube.com/watch?v=nCg3upGToOk",
  },
  {
    id: "gym2",
    title: "Levels",
    artist: "Avicii",
    bpm: 126,
    duration: "3:20",
    url: "https://www.youtube.com/watch?v=_ovdm2y5tZg",
  },
  {
    id: "gym3",
    title: "Animals",
    artist: "Martin Garrix",
    bpm: 128,
    duration: "5:04",
    url: "https://www.youtube.com/watch?v=gCYcHz2k5OI",
  },
  {
    id: "gym4",
    title: "Faded",
    artist: "Alan Walker",
    bpm: 90,
    duration: "3:32",
    url: "https://www.youtube.com/watch?v=60ItHLz5WeA",
  },
  {
    id: "gym5",
    title: "Blinding Lights",
    artist: "The Weeknd",
    bpm: 171,
    duration: "3:20",
    url: "https://www.youtube.com/watch?v=4NRXx6U8ABQ",
  },
  {
    id: "gym6",
    title: "Keraunos (Drift Phonk)",
    artist: "PlayaPhonk",
    bpm: 151,
    duration: "2:27",
    url: "https://www.youtube.com/watch?v=p79tLALf61c",
  },
  {
    id: "gym7",
    title: "Rapture",
    artist: "Nadia Ali (Avicii Remix)",
    bpm: 126,
    duration: "3:38",
    url: "https://www.youtube.com/watch?v=b09f_c3uCg0",
  },
  {
    id: "gym8",
    title: "Wake Me Up",
    artist: "Avicii",
    bpm: 124,
    duration: "4:07",
    url: "https://www.youtube.com/watch?v=IcrbM1l_BoI",
  },
  {
    id: "gym9",
    title: "Adagio for Strings",
    artist: "Tiësto",
    bpm: 140,
    duration: "7:20",
    url: "https://www.youtube.com/watch?v=8To-Xih87JE",
  },
  {
    id: "gym10",
    title: "Clarity",
    artist: "Zedd ft. Foxes",
    bpm: 128,
    duration: "4:31",
    url: "https://www.youtube.com/watch?v=IXXxciRUMzE",
  },
  {
    id: "gym11",
    title: "Lean On",
    artist: "Major Lazer & DJ Snake",
    bpm: 98,
    duration: "2:56",
    url: "https://www.youtube.com/watch?v=YqeW9_5kURI",
  },
  {
    id: "gym12",
    title: "Titanium",
    artist: "David Guetta ft. Sia",
    bpm: 126,
    duration: "4:05",
    url: "https://www.youtube.com/watch?v=JRfuAAtPhic",
  },
  {
    id: "gym13",
    title: "Strobe (Club Edit)",
    artist: "deadmau5",
    bpm: 128,
    duration: "6:12",
    url: "https://www.youtube.com/watch?v=tKi9Z-f6qHY",
  },
  {
    id: "gym14",
    title: "Intro",
    artist: "The xx",
    bpm: 120,
    duration: "2:08",
    url: "https://www.youtube.com/watch?v=sV4_wYedXyU",
  },
];

const getPlaylistGradientClass = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    "from-purple-600 via-indigo-700 to-blue-950",
    "from-emerald-600 via-teal-700 to-cyan-950",
    "from-rose-600 via-pink-700 to-red-950",
    "from-amber-600 via-orange-700 to-yellow-950",
    "from-blue-600 via-purple-700 to-pink-950",
    "from-fuchsia-600 via-purple-700 to-violet-950",
    "from-red-600 via-rose-700 to-indigo-950",
  ];
  return gradients[hash % gradients.length];
};

const calculatePlaylistDuration = (tracks: MusicTrack[]) => {
  if (!tracks || tracks.length === 0) return "0 min";
  
  let totalSeconds = 0;
  tracks.forEach(track => {
    let secs = 0;
    if (track.duration && typeof track.duration === "string" && track.duration.includes(":")) {
      const parts = track.duration.split(":");
      if (parts.length === 2) {
        const m = parseInt(parts[0], 10);
        const s = parseInt(parts[1], 10);
        if (!isNaN(m) && !isNaN(s)) {
          secs = m * 60 + s;
        }
      } else if (parts.length === 3) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const s = parseInt(parts[2], 10);
        if (!isNaN(h) && !isNaN(m) && !isNaN(s)) {
          secs = h * 3600 + m * 60 + s;
        }
      }
    } else if (track.duration && !isNaN(Number(track.duration))) {
      const val = Number(track.duration);
      if (val > 1000) {
        secs = Math.floor(val / 1000);
      } else {
        secs = val;
      }
    }
    
    // Fallback to 3:30 (210s) if track exists but has no valid duration
    if (secs === 0) {
      secs = 210;
    }
    
    totalSeconds += secs;
  });

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min ${seconds} s`;
};

export default function GymMusicPlayer() {
  const { user, loading: authLoading, setAuthModalOpen } = useFirebase();
  
  // --- Page Visibility State for Power Saving ---
  const [isPageVisible, setIsPageVisible] = useState(true);
  const isEcoMode = true;

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const isAdmin = user?.email === "eltygere8651@gmail.com";
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MusicPlaylist | null>(null);
  const [isTracklistOpen, setIsTracklistOpen] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const saved = localStorage.getItem("gym_music_current_track_index");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [userPlaylists, setUserPlaylists] = useState<MusicPlaylist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addStep, setAddStep] = useState<"auth" | "form">("auth");
  const [addMode, setAddMode] = useState<"import_set" | "create_empty" | "add_track">("import_set");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [newPlaylistIcon, setNewPlaylistIcon] = useState("");
  const [newPlaylistCover, setNewPlaylistCover] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const [currentTrackMeta, setCurrentTrackMeta] = useState<any>(null);

  const [showLibrary, setShowLibrary] = useState(false);
  const [showTracks, setShowTracks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [isSearchingYT, setIsSearchingYT] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCover, setEditingCover] = useState("");
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [editingTrackTitle, setEditingTrackTitle] = useState("");
  const [editingTrackArtist, setEditingTrackArtist] = useState("");
  const [editingTrackDescription, setEditingTrackDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [trackQueue, setTrackQueue] = useState<MusicTrack[]>([]);
  const [trackListTab, setTrackListTab] = useState<"playlist" | "search" | "queue">("playlist");
  const trackQueueRef = useRef<MusicTrack[]>([]);
  
  useEffect(() => {
    trackQueueRef.current = trackQueue;
  }, [trackQueue]);

  // Memory preservation effects
  useEffect(() => {
    localStorage.setItem("gym_music_current_track_index", currentTrackIndex.toString());
  }, [currentTrackIndex]);

  useEffect(() => {
    if (selectedPlaylist?.id) {
      localStorage.setItem("gym_music_selected_playlist_id", selectedPlaylist.id);
    }
  }, [selectedPlaylist]);

  const [overrideCurrentTrack, setOverrideCurrentTrack] = useState<MusicTrack | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [securityAttempts, setSecurityAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [savedSecurityCode, setSavedSecurityCode] = useState<string | null>(null);

  // Persistence for security and block state
  useEffect(() => {
    const savedCode = localStorage.getItem("gym_music_security_code");
    if (savedCode) setSavedSecurityCode(savedCode);
    
    const blockedTime = localStorage.getItem("gym_music_blocked_until");
    if (blockedTime && Date.now() < parseInt(blockedTime)) {
      setIsBlocked(true);
    }
  }, []);

  const handleBlockUser = () => {
    setIsBlocked(true);
    const blockedUntil = Date.now() + (1000 * 60 * 60); // 1 hour block
    localStorage.setItem("gym_music_blocked_until", blockedUntil.toString());
    alert("Acceso bloqueado por seguridad (1 hora).");
  };

  const [wakeLock, setWakeLock] = useState<any>(null);

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);
      console.log("Wake Lock active for training session stability.");
    } catch (err) {
      console.warn("Wake Lock not acquired:", err);
    }
  };

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        console.log("Wake Lock released.");
      } catch (err) {
        console.warn("Wake Lock release error:", err);
      }
    }
  }, [wakeLock]);

  // Handle active audio keep-alive and screen wake lock when isPlaying is true
  useEffect(() => {
    if (isPlaying) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [isPlaying]);



  // Maintain mobile audio focus natively
  const fallbackSilentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying && fallbackSilentAudioRef.current) {
      // Intentionally ignore promise rejection to avoid console spam / loops
      fallbackSilentAudioRef.current.play().catch(() => {});
    } else if (!isPlaying && fallbackSilentAudioRef.current) {
      fallbackSilentAudioRef.current.pause();
    }
  }, [isPlaying]);

  // Document Visibility & Screen Unlock Event handling to synchronize playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isPlaying) {
          // Re-establish Screen Wake Lock
          requestWakeLock();

          // Resynchronize and play YouTube player if it got suspended/paused by iOS screen lock
          if (youtubePlayerRef.current) {
            try {
              const intPlayer = youtubePlayerRef.current.getInternalPlayer();
              if (intPlayer && typeof intPlayer.playVideo === "function") {
                intPlayer.playVideo();
              } else if (intPlayer && typeof intPlayer.play === "function") {
                intPlayer.play();
              }
            } catch (err) {
              console.warn("Resync player error:", err);
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, wakeLock]);

  const [volume, setVolume] = useState(() => {
    const savedVol = localStorage.getItem("gym_music_volume");
    return savedVol !== null ? parseInt(savedVol, 10) : 70;
  });
  const [lastVolume, setLastVolume] = useState(() => volume > 0 ? volume : 70);
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
    localStorage.setItem("gym_music_volume", volume.toString());
  }, [volume]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const isShuffleRef = useRef(isShuffle);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);

  const youtubePlayerRef = useRef<any>(null);
  const expectedPlayingRef = useRef(false);

  // Initialize security code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("gym_music_security_code");
    if (savedCode) {
      setSavedSecurityCode(savedCode);
    }
  }, []);

  const displayTracks = React.useMemo(() => {
    return selectedPlaylist?.tracks || ALL_DATABASE_TRACKS;
  }, [selectedPlaylist]);

  const filteredDisplayTracks = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return displayTracks.map((track, idx) => ({ track, idx }));
    }
    const lowerQuery = searchQuery.toLowerCase();
    return displayTracks
      .map((track, idx) => ({ track, idx }))
      .filter(({ track }) => {
        const titleMatch = track.title?.toLowerCase().includes(lowerQuery);
        const artistMatch = track.artist?.toLowerCase().includes(lowerQuery);
        return titleMatch || artistMatch;
      });
  }, [displayTracks, searchQuery]);

  const displayTrackIndex = overrideCurrentTrack ? -1 : currentTrackIndex;

  const baseCurrentTrack =
    displayTracks[currentTrackIndex] || displayTracks[0] || ALL_DATABASE_TRACKS[0];
  const currentTrack = overrideCurrentTrack || baseCurrentTrack;
  const currentUrl = currentTrack.url || "";

  const togglePlayback = useCallback(() => {
    expectedPlayingRef.current = !isPlaying;
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    expectedPlayingRef.current = true;

    if (trackQueueRef.current.length > 0) {
      const nextTrack = trackQueueRef.current[0];
      setOverrideCurrentTrack(nextTrack);
      setIsPlaying(true);
      setTrackQueue(trackQueueRef.current.slice(1));
      showNotification(`Siguiente en cola: ${nextTrack.title}`);
      return;
    }

    // Si la cola está vacía, limpiamos la pista forzada para volver al flujo de la lista de reproducción
    setOverrideCurrentTrack(null);

    if (isShuffle) {
      const tracksList = displayTracks;
      if (tracksList.length > 1) {
        const currentIndex = currentTrackIndex;
        let randomIndex = Math.floor(Math.random() * tracksList.length);
        if (randomIndex === currentIndex) {
          randomIndex = (randomIndex + 1) % tracksList.length;
        }
        setCurrentTrackIndex(randomIndex);
      } else {
        // Playlist has only 1 track or is empty! Jump to a random song in ANY other user playlist with songs, or database tracks
        const allPlaylistsWithTracks = userPlaylists.filter(pl => pl.tracks && pl.tracks.length > 0);
        if (allPlaylistsWithTracks.length > 0) {
          const randomPl = allPlaylistsWithTracks[Math.floor(Math.random() * allPlaylistsWithTracks.length)];
          setSelectedPlaylist(randomPl);
          const randTrackIdx = Math.floor(Math.random() * randomPl.tracks.length);
          setCurrentTrackIndex(randTrackIdx);
        } else {
          const randDbTrackIdx = Math.floor(Math.random() * ALL_DATABASE_TRACKS.length);
          setCurrentTrackIndex(randDbTrackIdx);
        }
      }
      setIsPlaying(true);
      return;
    }

    const tracksList = displayTracks;
    if (currentTrackIndex < tracksList.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    } else if (tracksList.length > 0) {
      setCurrentTrackIndex(0);
    }
    setIsPlaying(true);
  }, [displayTracks, currentTrackIndex, isShuffle, userPlaylists]);

  const handlePrev = useCallback(() => {
    setOverrideCurrentTrack(null);
    expectedPlayingRef.current = true;

    if (isShuffle) {
      const tracksList = displayTracks;
      if (tracksList.length > 1) {
        const currentIndex = currentTrackIndex;
        let randomIndex = Math.floor(Math.random() * tracksList.length);
        if (randomIndex === currentIndex) {
          randomIndex = (randomIndex + 1) % tracksList.length;
        }
        setCurrentTrackIndex(randomIndex);
      } else {
        // Playlist has only 1 track or is empty! Jump to a random song in ANY other user playlist with songs, or database tracks
        const allPlaylistsWithTracks = userPlaylists.filter(pl => pl.tracks && pl.tracks.length > 0);
        if (allPlaylistsWithTracks.length > 0) {
          const randomPl = allPlaylistsWithTracks[Math.floor(Math.random() * allPlaylistsWithTracks.length)];
          setSelectedPlaylist(randomPl);
          const randTrackIdx = Math.floor(Math.random() * randomPl.tracks.length);
          setCurrentTrackIndex(randTrackIdx);
        } else {
          const randDbTrackIdx = Math.floor(Math.random() * ALL_DATABASE_TRACKS.length);
          setCurrentTrackIndex(randDbTrackIdx);
        }
      }
      setIsPlaying(true);
      return;
    }

    const tracksList = displayTracks;
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex((prev) => prev - 1);
    } else if (tracksList.length > 0) {
      setCurrentTrackIndex(tracksList.length - 1);
    }
    setIsPlaying(true);
  }, [currentTrackIndex, isShuffle, displayTracks, userPlaylists]);

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
    if (user && !isAdmin && savedSecurityCode !== "ho82788278") {
      q = query(
        collection(db, "users", user.uid, "playlists"),
        orderBy("createdAt", "desc"),
      );
    } else {
      q = query(collectionGroup(db, "playlists"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const folders = snapshot.docs.map((doc) => {
        const data = doc.data();
        let ownerId = data.ownerId;
        
        if (!ownerId && doc.ref.path.includes("users/")) {
          const segments = doc.ref.path.split("/");
          const userIdx = segments.indexOf("users");
          if (userIdx !== -1 && segments[userIdx + 1]) {
            ownerId = segments[userIdx + 1];
          }
        }

        // Clean any SoundCloud tracks from the playlist tracks array
        const rawTracks = data.tracks || [];
        const cleanedTracks = rawTracks.filter((track: any) => {
          const url = track.url || "";
          return !url.toLowerCase().includes("soundcloud.com") && !url.toLowerCase().includes("snd.sc");
        });

        return {
          id: doc.id,
          ...data,
          ownerId: ownerId,
          tracks: cleanedTracks,
        };
      })
      .filter((pl: any) => {
        // Keep Martina Cumple playlist no matter what
        const isMartina = pl.name?.toLowerCase().includes("martina");
        if (isMartina) return true;

        // Otherwise filter out SoundCloud playlists
        const isSoundCloud = 
          pl.name?.toLowerCase().includes("soundcloud") ||
          pl.description?.toLowerCase().includes("soundcloud") ||
          pl.genre?.toLowerCase().includes("soundcloud");
          
        if (isSoundCloud) return false;

        // If it was created from a soundcloud import or had no youtube tracks, check
        // but let's allow other personal custom playlists
        return true;
      }) as MusicPlaylist[];

      setUserPlaylists(folders);
      const savedPlaylistId = localStorage.getItem("gym_music_selected_playlist_id");
      if (savedPlaylistId && folders.length > 0) {
        const found = folders.find((f) => f.id === savedPlaylistId);
        if (found) {
          setSelectedPlaylist(found);
          return;
        }
      }
      if (!selectedPlaylist && folders.length > 0) {
        setSelectedPlaylist(folders[0]);
      }
    });
    return () => unsubscribe();
  }, [user, isAdmin]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const fetchMetadata = async (url: string) => {
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`);
      if (!res.ok) return null;
      
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Metadata fetch error via proxy", e);
    }
    return null;
  };

  const handleAddNewCanalClick = () => {
    setAdminCode(savedSecurityCode || "");
    setCustomUrl("");
    setAddMode("import_set");
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setNewPlaylistIcon("");
    setNewPlaylistCover("");
    if (savedSecurityCode === "ho82788278") {
      setAddStep("form");
    } else {
      setAddStep("auth");
    }
    setIsAdding(true);
    setShowLibrary(false);
  };

  const handleVerifyAdmin = () => {
    if (isBlocked) {
      alert("Acceso bloqueado.");
      return;
    }

    if (adminCode === "ho82788278") {
      if (!savedSecurityCode) {
        localStorage.setItem("gym_music_security_code", adminCode);
        setSavedSecurityCode(adminCode);
      }
      setAddStep("form");
    } else {
      const nextAttempts = securityAttempts + 1;
      setSecurityAttempts(nextAttempts);
      if (nextAttempts >= 2) {
        handleBlockUser();
      } else {
        alert(`Código maestro incorrecto. Te queda ${2 - nextAttempts} intento.`);
      }
    }
  };

  const handleProcessAdd = async () => {
    if (isBlocked) {
      alert("Acceso bloqueado.");
      return;
    }

    if (adminCode !== "ho82788278") {
      alert("Clave de administrador incorrecta");
      return;
    }

    try {
      let currentUser = user;
      if (!currentUser) {
        const { signInAnonymously: firebaseSignInAnonymously } = await import("../lib/firebase");
        const { auth: firebaseAuth } = await import("../lib/firebase");
        const cred = await firebaseSignInAnonymously(firebaseAuth);
        currentUser = cred.user;
      }

      if (!currentUser) {
        alert("Error de autenticación. Por favor intenta de nuevo.");
        return;
      }

      if (addMode === "create_empty") {
        const name = newPlaylistName.trim();
        if (!name) {
          alert("Por favor inserta un nombre para la playlist");
          return;
        }

        const promptBase = newPlaylistDesc.trim() ? `${name} ${newPlaylistDesc}` : name;
        const prompt = encodeURIComponent(`${promptBase}, modern aesthetic, artistic music album cover art, spotify playlist style, vibrant colors, minimalist, no text`);
        const generatedCoverUrl = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true`;

        const newPlDoc = {
          name: name,
          genre: "Personalizado",
          description: newPlaylistDesc.trim() || "Playlist creada manualmente",
          icon: newPlaylistIcon.trim() || "📂",
          thumbnail_url: newPlaylistCover.trim() || generatedCoverUrl,
          ownerId: currentUser.uid,
          adminSecret: adminCode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tracks: [],
        };
        const docRef = await addDoc(
          collection(db, "users", currentUser.uid, "playlists"),
          newPlDoc,
        );
        
        setNewPlaylistName("");
        setNewPlaylistDesc("");
        setNewPlaylistIcon("");
        setNewPlaylistCover("");
        setIsAdding(false);
        setSelectedPlaylist({ id: docRef.id, ...newPlDoc } as any);
        setShowLibrary(false);
        return;
      }

      const url = customUrl.trim();
      if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
        alert("Por favor inserta un enlace válido de YouTube");
        return;
      }

      setIsFetchingMeta(true);
      const meta = await fetchMetadata(url);
      setIsFetchingMeta(false);

      const provider = "YouTube";

      if (addMode === "add_track") {
        if (!selectedPlaylist?.id) {
           alert("No hay ningún canal seleccionado.");
           return;
        }
        const newTrack: MusicTrack = {
          id: `track_${Date.now()}`,
          title: meta?.title || "Audio Importado",
          artist: meta?.author_name || provider,
          bpm: 0,
          duration: "",
          url: url,
        };
        
        const targetOwnerId = selectedPlaylist.ownerId || currentUser.uid;
        const docRef = doc(db, "users", targetOwnerId, "playlists", selectedPlaylist.id);
        const updatedTracks = [...(selectedPlaylist.tracks || []), newTrack];
        await updateDoc(docRef, { tracks: updatedTracks, updatedAt: serverTimestamp() });
        
        setSelectedPlaylist({ ...selectedPlaylist, tracks: updatedTracks });
        setCustomUrl("");
        setIsAdding(false);
        
        return;
      }

      // Default: mode is "import_set" or anything else
      // Original handleAddPlaylist behavior
      const isPlaylist = url.includes("/sets/");
      const tracksToSave = (isPlaylist && meta?.tracks && meta.tracks.length > 0)
        ? meta.tracks
        : [
            {
              id: `track_${Date.now()}`,
              title: meta?.title || "Audio Importado",
              artist: meta?.author_name || provider,
              url: url,
            },
          ];

      const newPlDoc = {
        name: meta?.title || (isPlaylist ? `Nueva lista` : `Nuevo tema`),
        genre: provider,
        description: meta?.author_name || `Audio via ${provider}`,
        icon: isPlaylist ? "📂" : "🎵",
        ownerId: currentUser.uid,
        adminSecret: adminCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tracks: tracksToSave,
      };
      
      const docRef = await addDoc(
        collection(db, "users", currentUser.uid, "playlists"),
        newPlDoc,
      );
      setCustomUrl("");
      setAdminCode("");
      setIsAdding(false);
      setSelectedPlaylist({ id: docRef.id, ...newPlDoc } as any);
      setCurrentTrackIndex(0);
      expectedPlayingRef.current = true;
      setIsPlaying(true);
      setShowLibrary(false);
    } catch (error) {
      console.error("Error processing add", error);
      alert("Error al procesar la solicitud. Verifica los permisos.");
      setIsFetchingMeta(false);
    }
  };

  const startEditing = (pl: MusicPlaylist) => {
    setEditingId(pl.id);
    setEditingName(pl.name);
    setEditingDescription(pl.description || "");
    setEditingCover(pl.thumbnail_url || "");
    setAuthCode(savedSecurityCode || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;

    if (isBlocked) {
      alert("Acceso bloqueado por demasiados intentos fallidos. Reinicia la aplicación.");
      return;
    }

    if (!isAdmin) {
      const actualCode = authCode || savedSecurityCode;
      if (actualCode !== "ho82788278") {
        const nextAttempts = securityAttempts + 1;
        setSecurityAttempts(nextAttempts);
        if (nextAttempts >= 2) {
          handleBlockUser();
        } else {
          alert(`Código incorrecto. Te queda ${2 - nextAttempts} intento.`);
        }
        return;
      }
      if (!savedSecurityCode) {
        localStorage.setItem("gym_music_security_code", actualCode);
        setSavedSecurityCode(actualCode);
      }
    }

    try {
      // Ensure user is signed in (anonymously if needed) to satisfy firestore rules
      let currentUser = user;
      if (!currentUser) {
        const { signInAnonymously: firebaseSignInAnonymously, auth: firebaseAuth } = await import("../lib/firebase");
        const cred = await firebaseSignInAnonymously(firebaseAuth);
        currentUser = cred.user;
      }

      const pl = userPlaylists.find(p => p.id === editingId);
      if (!pl) {
        alert("Playlist no encontrada.");
        return;
      }
      
      const targetOwnerId = pl.ownerId;
      if (!targetOwnerId) {
        alert("No se pudo determinar el propietario (ownerId missing).");
        return;
      }
      
      const promptBase = editingDescription.trim() ? `${editingName} ${editingDescription}` : editingName;
      const prompt = encodeURIComponent(`${promptBase}, modern aesthetic, artistic music album cover art, spotify playlist style, vibrant colors, minimalist, no text`);
      const generatedCoverUrl = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true`;

      const coverToSave = editingCover.trim() || generatedCoverUrl;

      await updateDoc(doc(db, "users", targetOwnerId, "playlists", editingId), {
        name: editingName,
        description: editingDescription,
        thumbnail_url: coverToSave,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
      alert("Canal actualizado.");
    } catch (error: any) {
      console.error("Error saving edit", error);
      alert(`Error al guardar: ${error.message || "Verifica tus permisos."}`);
    }
  };

  const startDeleting = (plId: string) => {
    setDeletingId(plId);
    setAuthCode(savedSecurityCode || "");
  };

  const executeDelete = async () => {
    if (!deletingId || isDeleting) return;

    if (isBlocked) {
      alert("Acceso bloqueado por demasiados intentos fallidos.");
      return;
    }

    if (!isAdmin) {
      const actualCode = authCode || savedSecurityCode;
      if (actualCode !== "ho82788278") {
        const nextAttempts = securityAttempts + 1;
        setSecurityAttempts(nextAttempts);
        if (nextAttempts >= 2) {
          handleBlockUser();
        } else {
          alert(`Código incorrecto. Te queda ${2 - nextAttempts} intento.`);
        }
        return;
      }
      if (!savedSecurityCode) {
        localStorage.setItem("gym_music_security_code", actualCode);
        setSavedSecurityCode(actualCode);
      }
    }

    try {
      setIsDeleting(true);
      // Ensure user is signed in (anonymously if needed) to satisfy firestore rules
      let currentUser = user;
      if (!currentUser) {
        const { signInAnonymously: firebaseSignInAnonymously, auth: firebaseAuth } = await import("../lib/firebase");
        const cred = await firebaseSignInAnonymously(firebaseAuth);
        currentUser = cred.user;
      }

      const pl = userPlaylists.find(p => p.id === deletingId);
      if (!pl) {
        alert("Canal no encontrado en la lista actual.");
        setDeletingId(null);
        return;
      }
      
      const targetOwnerId = pl.ownerId;
      if (!targetOwnerId) {
        alert("No se pudo determinar el propietario para borrar.");
        setDeletingId(null);
        return;
      }
      
      await deleteDoc(doc(db, "users", targetOwnerId, "playlists", deletingId));
      
      if (selectedPlaylist?.id === deletingId) {
        setSelectedPlaylist(null);
      }
      
      setDeletingId(null);
      alert("Canal eliminado con éxito.");
    } catch (error: any) {
      console.error("Error deleting", error);
      alert(`Error al eliminar: ${error.message || "Verifica tu conexión y permisos."}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const logoutSecurity = () => {
    if (confirm("¿Cerrar sesión de seguridad y olvidar el código maestro?")) {
      localStorage.removeItem("gym_music_security_code");
      setSavedSecurityCode(null);
      setAuthCode("");
      alert("Sesión de seguridad cerrada.");
    }
  };

  const handleDeleteTrack = async (trackToDelete: MusicTrack, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedPlaylist?.id || selectedPlaylist.id === "all") return;
    
    const isMasterAdmin = savedSecurityCode === "ho82788278";
    if (selectedPlaylist.ownerId !== user?.uid && !isAdmin && !isMasterAdmin) {
      showNotification("No tienes permisos para eliminar.");
      return;
    }

    try {
      const docRef = doc(db, "users", selectedPlaylist.ownerId, "playlists", selectedPlaylist.id);
      const updatedTracks = selectedPlaylist.tracks.filter((t: any) => t.id !== trackToDelete.id);
      await updateDoc(docRef, { tracks: updatedTracks, updatedAt: serverTimestamp() });
      setSelectedPlaylist({ ...selectedPlaylist, tracks: updatedTracks });
      showNotification(`"${trackToDelete.title}" eliminada`);
    } catch (error) {
      console.error("Error removing track:", error);
      showNotification("Error al eliminar la canción.");
    }
  };

  const startEditingTrack = (track: MusicTrack, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setEditingTrack(track);
    setEditingTrackTitle(track.title || "");
    setEditingTrackArtist(track.artist || "");
    setEditingTrackDescription(track.description || "");
  };

  const saveTrackEdit = async () => {
    if (!editingTrack || !selectedPlaylist?.id || selectedPlaylist.id === "all") return;
    
    const isMasterAdmin = savedSecurityCode === "ho82788278";
    if (selectedPlaylist.ownerId !== user?.uid && !isAdmin && !isMasterAdmin) {
      showNotification("No tienes permisos para editar.");
      return;
    }

    try {
      const tracksCopy = [...selectedPlaylist.tracks];
      const idx = tracksCopy.findIndex(t => t.id === editingTrack.id);
      if (idx === -1) {
        alert("Canción no encontrada en esta playlist.");
        return;
      }

      tracksCopy[idx] = {
        ...tracksCopy[idx],
        title: editingTrackTitle.trim(),
        artist: editingTrackArtist.trim(),
        description: editingTrackDescription.trim() || "",
      };

      const ownerIdToUse = selectedPlaylist.ownerId || user?.uid;
      if (!ownerIdToUse) {
        alert("Error: no se detectó el ownerId.");
        return;
      }

      const docRef = doc(db, "users", ownerIdToUse, "playlists", selectedPlaylist.id);
      await updateDoc(docRef, { tracks: tracksCopy, updatedAt: serverTimestamp() });

      setSelectedPlaylist({
        ...selectedPlaylist,
        tracks: tracksCopy,
      });

      showNotification("Canción actualizada.");
      setEditingTrack(null);
    } catch (error: any) {
      console.error("Error saving track edit:", error);
      alert(`Error al guardar: ${error.message || "Permiso denegado."}`);
    }
  };

  const handleYoutubeSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setTrackListTab("search");
    setIsSearchingYT(true);
    try {
      const resp = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      if (!resp.ok) throw new Error("Search failed");
      const data = await resp.json();
      setYoutubeResults(data);
    } catch (err) {
      console.error(err);
      showNotification("Error buscando música.");
    } finally {
      setIsSearchingYT(false);
    }
  };

  const addYoutubeTrackToPlaylist = async (ytTrack: any) => {
    if (!selectedPlaylist?.id || selectedPlaylist.id === "all") {
      showNotification("Selecciona una playlist primero.");
      return;
    }

    const isMasterAdmin = savedSecurityCode === "ho82788278";
    if (selectedPlaylist.ownerId !== user?.uid && !isAdmin && !isMasterAdmin) {
      showNotification("No tienes permisos para añadir a esta playlist.");
      return;
    }

    try {
      const targetOwnerId = selectedPlaylist.ownerId || user?.uid;
      if (!targetOwnerId) {
        showNotification("Error: no se pudo identificar al dueño de la lista.");
        return;
      }
      
      const docRef = doc(db, "users", targetOwnerId, "playlists", selectedPlaylist.id);
      let updatedTracks = [...(selectedPlaylist.tracks || [])];
      
      if (ytTrack.isPlaylist) {
         showNotification("Extrayendo canciones de la playlist...");
         try {
           const res = await fetch(`/api/youtube/playlist?id=${ytTrack.id}`);
           if (res.ok) {
             const tracks = await res.json();
             const newTracks = tracks.map((t: any, i: number) => ({
                id: `yt_${t.id}_${Date.now()}_${i}`,
                title: t.title,
                artist: t.artist,
                url: t.url,
                duration: t.duration || "N/A",
                bpm: 120,
             }));
             updatedTracks = [...updatedTracks, ...newTracks];
             showNotification(`Se han añadido ${newTracks.length} canciones.`);
           } else {
             throw new Error("No se pudo obtener las canciones");
           }
         } catch(e) {
           showNotification("Error al procesar playlist.");
           return;
         }
      } else {
        const newTrack: MusicTrack = {
          id: `yt_${ytTrack.id}_${Date.now()}`,
          title: ytTrack.title,
          artist: ytTrack.artist,
          url: ytTrack.url,
          duration: ytTrack.duration || "N/A",
          bpm: 120,
        };
        updatedTracks.push(newTrack);
        showNotification("Canción añadida.");
      }

      await updateDoc(docRef, { tracks: updatedTracks, updatedAt: serverTimestamp() });

      setSelectedPlaylist({ ...selectedPlaylist, tracks: updatedTracks });
      showNotification("Añadida a la playlist.");
    } catch (err) {
      console.error(err);
      showNotification("Error al añadir canción.");
    }
  };

  const handleAddToQueue = (track: MusicTrack, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setTrackQueue(q => [...q, track]);
    showNotification(`Añadida a la cola: ${track.title}`);
  };

  const selectPlaylist = (playlist: MusicPlaylist) => {
    setIsLoadingTrack(true);
    setCustomUrl("");
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setPosition(0);
    setDuration(0);
    expectedPlayingRef.current = true;
    setIsPlaying(true);
    setShowLibrary(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseInt(e.target.value);
    setPosition(newPos);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(newPos / 1000, "seconds");
    }
  };

  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const updatePosition = (clientX: number) => {
      const rect = container.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const width = rect.width;
      if (width > 0 && duration > 0) {
        const pct = Math.max(0, Math.min(1, clickX / width));
        const newPos = Math.round(pct * duration);
        setPosition(newPos);
        if (youtubePlayerRef.current) {
          youtubePlayerRef.current.seekTo(newPos / 1000, "seconds");
        }
      }
    };

    updatePosition(e.clientX);
    container.setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      updatePosition(moveEvent.clientX);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      container.releasePointerCapture(e.pointerId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
  };

  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const updateVolume = (clientX: number) => {
      const rect = container.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const width = rect.width;
      if (width > 0) {
        const pct = Math.max(0, Math.min(1, clickX / width));
        const newVol = Math.round(pct * 100);
        handleVolumeChange(newVol);
      }
    };

    updateVolume(e.clientX);
    container.setPointerCapture(e.pointerId);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const clickX = moveEvent.clientX - rect.left;
      const width = rect.width;
      if (width > 0) {
        const pct = Math.max(0, Math.min(1, clickX / width));
        const newVol = Math.round(pct * 100);
        handleVolumeChange(newVol);
      }
    };

    const handlePointerUp = () => {
      container.releasePointerCapture(e.pointerId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerUp);
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerup", handlePointerUp);
  };

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const displayTitle =
    currentTrack?.title || "Waiting...";
  const displayArtist =
    currentTrack?.artist ||
    "Original Arch";
  const displayArtwork =
    currentTrackMeta?.thumbnail_url ||
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop";

  // USE STABLE HANDLERS FOR MEDIA SESSION TO PREVENT LOCK SCREEN LAG/RE-REGISTRATION ISSUES
  const handlersRef = useRef({ togglePlayback, handleNext, handlePrev });
  useEffect(() => {
    handlersRef.current = { togglePlayback, handleNext, handlePrev };
  }, [togglePlayback, handleNext, handlePrev]);

  // Sync Position State with Lock Screen - THROTTLED ECO OPTIMAL
  const lastSyncTrackRef = useRef<number>(-1);
  const lastSyncIsPlayingRef = useRef<boolean>(false);
  const lastSessionSyncTimeRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const isPlayingChanged = lastSyncIsPlayingRef.current !== isPlaying;
    const isNewTrack = lastSyncTrackRef.current !== currentTrackIndex;
    // Throttle rate is 8 seconds on Eco mode, else 3 seconds (avoids blasting OS audio subsystem with high-frequency updates)
    const isThrottleTimeoutPassed = now - lastSessionSyncTimeRef.current > (isEcoMode ? 8000 : 3000);

    if (isPlayingChanged || isNewTrack || isThrottleTimeoutPassed) {
      if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
        try {
          navigator.mediaSession.setPositionState({
            duration: (duration || 0) / 1000,
            playbackRate: 1,
            position: (position || 0) / 1000,
          });
          lastSessionSyncTimeRef.current = now;
          lastSyncTrackRef.current = currentTrackIndex;
          lastSyncIsPlayingRef.current = isPlaying;
        } catch (e) {}
      }
    }
  }, [position, duration, isPlaying, currentTrackIndex, isEcoMode]);

  // Media Session API Integration for background playback
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // Update Metadata
    if (selectedPlaylist) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: displayTitle,
        artist: displayArtist,
        album: selectedPlaylist.name || "Flux Player",
        artwork: [
          {
            src: displayArtwork,
            sizes: "512x512",
            type: "image/jpeg",
          },
          {
            src: displayArtwork,
            sizes: "256x256",
            type: "image/jpeg",
          },
          {
            src: displayArtwork,
            sizes: "96x96",
            type: "image/jpeg",
          },
        ],
      });
    }

    // Define handlers that use the latest state via handlersRef to avoid stale closures
    const playHandler = () => {
      handlersRef.current.togglePlayback();
    };

    const pauseHandler = () => {
      handlersRef.current.togglePlayback();
    };

    const nextHandler = () => {
      handlersRef.current.handleNext();
    };

    const prevHandler = () => {
      handlersRef.current.handlePrev();
    };

    // Register handlers - always register both next and prev to ensure they show up on iOS
    const actions: [MediaSessionAction, () => void][] = [
      ["play", playHandler],
      ["pause", pauseHandler],
      ["previoustrack", prevHandler],
      ["nexttrack", nextHandler],
      ["seekforward", () => {
        if (youtubePlayerRef.current) {
          const currentSec = youtubePlayerRef.current.getCurrentTime() || 0;
          youtubePlayerRef.current.seekTo(currentSec + 10, "seconds");
        }
      }],
      ["seekbackward", () => {
        if (youtubePlayerRef.current) {
          const currentSec = youtubePlayerRef.current.getCurrentTime() || 0;
          youtubePlayerRef.current.seekTo(Math.max(0, currentSec - 10), "seconds");
        }
      }],
    ];

    actions.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (error) {
        // Fallback for older browsers
      }
    });

    // Add SeekTo Support
    try {
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          if (youtubePlayerRef.current) {
            youtubePlayerRef.current.seekTo(details.seekTime, "seconds");
          }
        }
      });
    } catch (e) {}

    return () => {
      // Keep persistent for session stability during app usage
    };
  }, [displayTitle, displayArtist, displayArtwork, selectedPlaylist]); // Minimal dependencies to prevent excessive re-registration

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
  };

  // --- DERIVED UI STATES (already defined above) ---

  return (
    <div className="bg-[#080809]/90 backdrop-blur-3xl text-white shadow-2xl h-full w-full flex flex-col border border-white/5 overflow-hidden font-sans relative sm:rounded-[40px] rounded-[32px]">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-black px-6 py-3 rounded-full font-bold text-sm shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Invisible embedding of YouTube ReactPlayer and background thread preservation audio */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-[-1] opacity-0 flex">
        {currentUrl && (
          <ReactPlayer
            ref={youtubePlayerRef}
            url={currentUrl}
            playing={isPlaying}
            volume={volume / 100}
            progressInterval={isEcoMode ? 4000 : 1000}
            onEnded={() => handleNext()}
            onProgress={(state) => {
              if (document.visibilityState === "visible") {
                setPosition(state.playedSeconds * 1000);
              }
            }}
            onDuration={(dur) => {
              if (document.visibilityState === "visible") {
                setDuration(dur * 1000);
              }
            }}
            config={{ 
              youtube: { playerVars: { origin: window.location.origin, playsinline: 1 } },
              file: { 
                forceAudio: true, 
                attributes: { playsInline: true, id: 'native-audio' }
              } 
            }}
            width="300px"
            height="300px"
            playsinline={true}
          />
        )}
        <audio
          ref={fallbackSilentAudioRef}
          loop
          playsInline
          preload="auto"
          src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
          className="hidden"
        />
      </div>
      {/* 1. COMPACT HEADER */}
      <div className="flex justify-between items-center px-3 py-3 sm:px-6 sm:py-4 border-b border-white/5 bg-[#0a0a0b]/60 backdrop-blur-xl shrink-0 z-40">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <div
            className={`hidden sm:flex bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 ${isPlaying && isPageVisible && !isEcoMode ? "animate-[spin_12s_linear_infinite] will-change-transform" : ""}`}
          >
            <Music className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[8px] sm:text-[9px] font-black tracking-[0.3em] uppercase text-emerald-500 mb-0.5 opacity-70">
              Flux Player
            </p>
            <h2 className="text-xs sm:text-sm font-black tracking-tight text-white truncate max-w-[150px] sm:max-w-md uppercase">
              {displayTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={() => {
              setShowLibrary(!showLibrary);
              setIsAdding(false);
            }}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all border text-[10px] font-black uppercase ${
              showLibrary
                ? "bg-white text-black border-white shadow-lg"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Librería</span>
          </button>

          {savedSecurityCode && (
            <button
              onClick={logoutSecurity}
              title="Cerrar Sesión de Seguridad"
              className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleAddNewCanalClick}
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl transition-all border text-[10px] font-black uppercase cursor-pointer ${
              isAdding
                ? "bg-emerald-500 text-black border-emerald-400"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
        </div>

         {/* 2. MAIN SPLIT STAGE */}
      <div className="flex-1 flex flex-row min-h-0 relative overflow-hidden">
        {/* SIDEBAR: LIBRARY (Responsive layout: Compact vertical column on mobile, spacious on desktop) */}
        <div className="flex w-[80px] md:w-[240px] flex-col bg-[#050505] border-r border-white/5 shrink-0 overflow-hidden z-30">
            <div className="p-3 border-b border-white/[0.03] shrink-0 flex items-center justify-between w-full h-auto">
                <div className="text-center md:text-left w-full md:w-auto">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 text-center md:text-left">
                        Canal
                    </h3>
                </div>
                <button 
                  onClick={handleAddNewCanalClick}
                  title="Añadir Nuevo Canal"
                  className="hidden md:flex p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-white transition-all shadow-lg active:scale-95 items-center justify-center shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                </button>
            </div>
            
            <div className="flex flex-col p-1.5 md:p-3 gap-2.5 overflow-y-auto scrollbar-none flex-1 min-h-0 w-full items-center md:items-stretch">
                {userPlaylists.map(pl => {
                    const isSelected = selectedPlaylist?.id === pl.id;
                    const gradient = getPlaylistGradientClass(pl.name);
                    
                    return (
                        <button 
                          key={pl.id} 
                          onClick={() => selectPlaylist(pl)} 
                          className={`group flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-1.5 flex-wrap md:flex-nowrap md:px-3 md:py-2.5 rounded-xl transition-all text-center md:text-left shrink-0 ${
                            isSelected 
                              ? 'bg-emerald-500/10 border-l-[3px] border-emerald-500 ring-1 ring-emerald-500/10' 
                              : 'border-l-[3px] border-transparent hover:bg-white/[0.03]'
                          }`}
                        >
                            {/* Dynamic Premium Cover Art */}
                            <div className={`relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-sm md:text-lg font-black text-white/90 shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                                {pl.thumbnail_url ? (
                                    <img src={pl.thumbnail_url} alt={pl.name} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        {/* Inner Gloss Sheen Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                        
                                        <span className="relative z-10 shrink-0 select-none filter drop-shadow flex items-center justify-center">
                                            {pl.icon && pl.icon !== "📂" && pl.icon !== "📁" && pl.icon !== "🎵" ? (
                                                pl.icon
                                            ) : (
                                                <Headphones className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                                            )}
                                        </span>
                                    </>
                                )}
 
                                {/* Hover Play Indicator Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-white scale-90 group-hover:scale-100 transition-transform duration-300" />
                                </div>
                            </div>
 
                            {/* Info */}
                            <div className="min-w-0 text-center md:text-left flex flex-col justify-center">
                                <p className={`text-[10px] md:text-[13px] font-bold truncate leading-snug max-w-[70px] md:max-w-[130px] ${
                                  isSelected ? 'text-emerald-400' : 'text-white/90 group-hover:text-white'
                                }`}>
                                    {pl.name}
                                </p>
                                <p className="hidden md:block text-[10px] md:text-[11.5px] text-slate-300 font-extrabold mt-0.5 truncate max-w-[130px]" title={`${pl.tracks?.length || 0} tracks, duration ${calculatePlaylistDuration(pl.tracks)}`}>
                                    {pl.tracks.length} {pl.tracks.length === 1 ? 'Pista' : 'Pistas'} • <span className="text-emerald-400 font-black">{calculatePlaylistDuration(pl.tracks)}</span>
                                </p>
                                {pl.description && (
                                  <p className="hidden md:block text-[9.5px] md:text-[10.5px] text-slate-400 font-medium truncate max-w-[130px] mt-0.5 normal-case tracking-wide" title={pl.description}>
                                    {pl.description}
                                  </p>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* ACCESO ADMIN BANNER */}
            {!user && (
              <div className="p-2 md:p-3 md:mt-auto border-t border-white/5 bg-emerald-500/5 flex flex-col items-stretch gap-2 shrink-0">
                <div className="hidden md:block text-left shrink-0">
                  <p className="text-[8px] font-black uppercase text-emerald-400 tracking-wider">
                    Modo Administrador
                  </p>
                  <p className="text-[8px] text-slate-500 font-bold mt-0.5">
                    Para gestionar canales
                  </p>
                </div>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="py-1.5 md:py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider text-[10px] rounded-lg md:rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>Entrar</span>
                </button>
              </div>
            )}
        </div>

        {/* CONTAINER PLAYER + TRACKLIST */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden bg-[#070708]">
            
          {/* PLAYER BAR */}
          <div className="flex-none bg-[#0a0a0b]/80 backdrop-blur-2xl border-b border-white/10 p-3 sm:p-5 relative overflow-hidden shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Subtle neon-accent decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-500/40 via-emerald-400/20 to-transparent" />
            
            {selectedPlaylist ? (
              <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center w-full max-w-2xl mx-auto">
                
                {/* UP/CENTER: Artwork + Title centered visually */}
                <div className="flex items-center justify-center w-full min-w-0 px-2">
                  <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-full">
                    <div className="relative shrink-0">
                      <AnimatePresence>
                        {isPlaying && !isEcoMode && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute -inset-1.5 bg-emerald-500/20 blur-md rounded-full pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                      <div
                        className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-2xl border-2 transition-colors duration-500 ${
                          isPlaying ? "border-emerald-500/50 shadow-emerald-500/20" : "border-white/10 shadow-black/40"
                        } ${
                          isPlaying && isPageVisible && !isEcoMode ? "animate-disc-spin animate-disc-pulse" : ""
                        }`}
                      >
                        <img
                          src={displayArtwork}
                          alt="Artwork"
                          className="w-full h-full object-cover"
                        />
                        {/* Vinyl Record Center Hole Decor */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-3 h-3 bg-[#080809] rounded-full border border-white/20 shadow-inner" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                        </div>
                      </div>
                    </div>
                  <div className="flex flex-col min-w-0 shrink justify-center">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <h1 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-[320px] text-left">
                        {displayTitle}
                      </h1>
                      {isLoadingTrack && (
                        <Loader2 className="w-3 h-3 text-emerald-500 animate-spin shrink-0" />
                      )}
                    </div>
                    <p className="text-[8px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-0.5 truncate max-w-[180px] sm:max-w-[300px] text-left">
                      {displayArtist}
                    </p>
                  </div>
                  </div>
                </div>

                {/* BOTTOM/CENTER: Timeline + Controls combined */}
                <div className="flex flex-col w-full max-w-md gap-4 sm:gap-6 px-4 sm:px-0">
                  
                  {/* Controls Row - Premium 3-column layout to keep play button centered */}
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center w-full px-1 gap-1">
                    
                    {/* Left Column: Shuffle Button */}
                    <div className="flex justify-start">
                      <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        title="Aleatorio"
                        className={`group/shuffle relative p-1.5 sm:p-2 transition-all transform active:scale-90 ${
                          isShuffle ? "text-emerald-500" : "text-slate-500 hover:text-white"
                        }`}
                      >
                        <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                        {isShuffle && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        )}
                        {/* Tooltip-like label for Shuffle on hover */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 text-[10px] py-1 px-2 rounded opacity-0 group-hover/shuffle:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-tighter">
                          Mezcla
                        </span>
                      </button>
                    </div>

                    {/* Center Column: Primary Playback Controls */}
                    <div className="flex items-center justify-center gap-1 sm:gap-6">
                      <button
                        onClick={handlePrev}
                        title="Anterior"
                        className="p-1 sm:p-2 text-slate-400 hover:text-white transition-all transform active:scale-90 hover:scale-110 flex-shrink-0"
                      >
                        <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      </button>

                      <div className="relative group flex-shrink-0 mx-1 sm:mx-0">
                        {/* Premium Outer Glow */}
                        <div className={`absolute -inset-4 rounded-full blur-2xl transition-all duration-1000 ${isPlaying ? "bg-emerald-500/30 opacity-100 scale-110" : "bg-white/5 opacity-0 group-hover:opacity-100"}`} />
                        
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={togglePlayback}
                          className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_15px_50px_rgba(0,0,0,0.6)] border-2 ${
                            isPlaying 
                              ? "bg-emerald-500 border-emerald-400/40 text-black shadow-emerald-500/40 hover:shadow-emerald-500/50" 
                              : "bg-white border-white/20 text-black hover:bg-slate-50 shadow-white/10"
                          }`}
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 sm:w-8 sm:h-8 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 sm:w-8 sm:h-8 fill-current ml-1" />
                          )}
                        </motion.button>
                      </div>

                      <button
                        onClick={handleNext}
                        title="Siguiente"
                        className="p-1 sm:p-2 text-slate-400 hover:text-white transition-all transform active:scale-90 hover:scale-110 flex-shrink-0"
                      >
                        <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      </button>
                    </div>

                    {/* Right Column: Optimized Volume Control */}
                    <div className="flex justify-end min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-300 w-full max-w-[110px] sm:max-w-[150px] shadow-md select-none">
                        <button
                          onClick={() => {
                            if (volume > 0) {
                              setLastVolume(volume);
                              handleVolumeChange(0);
                            } else {
                              handleVolumeChange(lastVolume > 0 ? lastVolume : 70);
                            }
                          }}
                          className="text-slate-400 hover:text-emerald-400 p-0.5 sm:p-1 rounded-full hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                          title={volume > 0 ? "Silenciar" : "Activar sonido"}
                        >
                          {volume === 0 ? (
                            <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                          ) : volume < 50 ? (
                            <Volume1 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500/80" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                          )}
                        </button>
                        
                        <div
                          onPointerDown={handleVolumePointerDown}
                          className="flex-1 relative flex items-center h-4 cursor-pointer select-none touch-none group/volume-slider min-w-[35px] sm:min-w-[65px]"
                        >
                          <div className="w-full h-1 bg-white/10 rounded-full relative overflow-hidden pointer-events-none group-hover/volume-slider:h-1.5 transition-all">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                              style={{ width: `${volume}%` }}
                            />
                          </div>
                          <div
                            className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white rounded-full opacity-100 sm:opacity-0 sm:group-hover/volume-slider:opacity-100 transition-opacity shadow-[0_0_4px_rgba(255,255,255,0.7)] pointer-events-none"
                            style={{ left: `calc(${volume}% - 4px)` }}
                          />
                        </div>

                        <span className="text-[8px] sm:text-[10px] font-mono font-bold text-slate-400 w-5 sm:w-6 text-right shrink-0 select-none">
                          {volume}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Timeline Row */}
                  <div className="flex flex-col gap-3 w-full mt-1">
                    <div 
                      onPointerDown={handleTimelinePointerDown}
                      className="flex-1 relative flex items-center h-4 cursor-pointer min-w-0 group/timeline select-none touch-none"
                    >
                      <div className="w-full h-1.5 bg-white/5 rounded-full relative overflow-hidden border border-white/5 pointer-events-none">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full relative shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                          style={{
                            width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
                          }}
                        >
                          <div className="absolute right-0 inset-y-0 w-12 bg-white/20 blur-md pointer-events-none" />
                        </div>
                      </div>
                      
                      {/* Premium Spotify-Style Interactive Handle */}
                      <div 
                        className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover/timeline:opacity-100 transition-opacity duration-150 shadow-[0_0_5px_rgba(255,255,255,0.8)] pointer-events-none"
                        style={{
                          left: `calc(${duration > 0 ? (position / duration) * 100 : 0}% - 6px)`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-black font-mono text-slate-500 uppercase tracking-[0.2em] w-full px-0.5">
                      <span className="shrink-0">{formatTime(position)}</span>
                      <div className="flex items-center gap-1.5 opacity-30">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">Quantum Engine</span>
                      </div>
                      <span className="shrink-0">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Selecciona o Añade un Canal para empezar</p>
              </div>
            )}
          </div>

          {/* BELOW LAYOUT: PERMANENT TRACK LIST */}
          {selectedPlaylist ? (
            <div className="flex flex-col min-h-0 bg-black/40 flex-1">
              <div 
                className="w-full relative px-3 py-2.5 sm:px-5 sm:py-3.5 border-b border-white/5 flex flex-col gap-3 shrink-0 bg-[#080809]/40"
              >
                <div className="flex flex-col gap-3 sm:gap-4 w-full">
                  {/* Premium Tabs Area */}
                  <div className="flex items-center justify-between pb-2 w-full gap-2 relative">
                    {/* Scrollable Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      <button
                        onClick={() => {
                          setTrackListTab("playlist");
                          setSearchQuery("");
                        }}
                        className={`relative px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap flex items-center justify-center shrink-0 rounded-full ${trackListTab === "playlist" ? "bg-emerald-500 text-black" : "bg-white/[0.08] text-white hover:bg-white/[0.15]"}`}
                      >
                        <span className="block max-w-[120px] sm:max-w-[200px] truncate" title={selectedPlaylist.name || "Lista actual"}>
                          {selectedPlaylist.name || "Lista actual"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setTrackListTab("search");
                          setSearchQuery("");
                        }}
                        className={`relative px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap flex items-center justify-center shrink-0 rounded-full ${trackListTab === "search" ? "bg-emerald-500 text-black" : "bg-white/[0.08] text-white hover:bg-white/[0.15]"}`}
                      >
                        Explorar
                      </button>

                      <button
                        onClick={() => {
                          setTrackListTab("queue");
                          setSearchQuery("");
                        }}
                        className={`relative px-4 py-1.5 text-[13px] font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 rounded-full ${trackListTab === "queue" ? "bg-emerald-500 text-black" : "bg-white/[0.08] text-white hover:bg-white/[0.15]"}`}
                      >
                        Siguientes
                        {trackQueue.length > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${trackListTab === "queue" ? "bg-black/20 text-black" : "bg-white/20 text-white"}`}>
                            {trackQueue.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Action buttons on the right (Fixed) */}
                    <div className="flex items-center gap-2 shrink-0">
                       {trackListTab === "queue" && trackQueue.length > 0 && (
                        <button
                          onClick={() => {
                            setTrackQueue([]);
                            showNotification("Cola vaciada con éxito");
                          }}
                          className="py-1 px-3 text-[9px] font-black uppercase text-red-400 bg-red-500/10 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/20 rounded-full transition-all whitespace-nowrap"
                        >
                          Vaciar
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAdminCode(savedSecurityCode || "");
                          setCustomUrl("");
                          setAddMode("add_track");
                          if (savedSecurityCode === "ho82788278") {
                            setAddStep("form");
                          } else {
                            setAddStep("auth");
                          }
                          setIsAdding(true);
                        }}
                        title="Añadir pista a esta lista"
                        className="p-1.5 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-all shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Search Bar matching Tab */}
                  <div className="relative w-full group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                      <Search className={`w-4 h-4 transition-colors ${searchQuery ? 'text-emerald-500' : 'text-slate-500 group-focus-within:text-emerald-500'}`} />
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setTrackListTab("search");
                      handleYoutubeSearch(e);
                    }}>
                      <input
                        type="text"
                        placeholder={
                          trackListTab === "playlist" ? `Buscar en ${selectedPlaylist.name || "playlist"}...` :
                          trackListTab === "queue" ? "¿Qué hay en la cola?" :
                          "Buscar en internet..."
                        }
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (!e.target.value && trackListTab === "search") {
                            setYoutubeResults([]);
                          }
                        }}
                        className="w-full bg-[#111113] border border-white/5 rounded-full py-2 sm:py-2.5 pl-9 pr-10 text-[11px] sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.05] focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                      />
                    </form>
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          if (trackListTab === "search") {
                            setYoutubeResults([]);
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-0 bg-[#030303] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-1 sm:p-3 premium-scrollbar relative">
                  {trackListTab === "search" ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-2 py-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Resultados de Búsqueda
                        </span>
                      </div>
                      
                      {isSearchingYT && (
                        <div className="flex items-center justify-center py-12">
                           <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                      )}

                      {!isSearchingYT && youtubeResults.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                          <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-widest">
                            {searchQuery ? "No se encontraron resultados" : "Busca cualquier canción en internet para empezar"}
                          </p>
                        </div>
                      )}

                      {youtubeResults.map((ytTrack, idx) => (
                        <div 
                          key={`yt-${ytTrack.id}-${idx}`}
                          className="group/yt flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-emerald-500/[0.05] border border-transparent hover:border-emerald-500/10 transition-all cursor-default"
                        >
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black/40">
                            <img 
                              src={ytTrack.thumbnail} 
                              alt="" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover/yt:bg-transparent transition-colors" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold text-white truncate leading-tight group-hover/yt:text-emerald-400 transition-colors uppercase tracking-tight flex items-center gap-1.5">
                              {ytTrack.isPlaylist && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-black shrink-0">
                                  PLAYLIST
                                </span>
                              )}
                              {ytTrack.title}
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-bold uppercase tracking-widest">
                              {ytTrack.artist} {ytTrack.duration && `• ${ytTrack.duration}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 pr-1">
                             <button
                               onClick={() => addYoutubeTrackToPlaylist(ytTrack)}
                               title="Añadir a Playlist"
                               className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-lg transition-all"
                             >
                               <ListPlus className="w-4 h-4" />
                             </button>
                             <button
                               onClick={async (e) => {
                                 if (ytTrack.isPlaylist) {
                                   showNotification("Cargando playlist...");
                                   try {
                                     const res = await fetch(`/api/youtube/playlist?id=${ytTrack.id}`);
                                     if (res.ok) {
                                       const tracks = await res.json();
                                       if (tracks.length > 0) {
                                          const queueTracks = tracks.map((t: any, i: number) => ({
                                            id: `yt_temp_${t.id}_${i}`,
                                            title: t.title,
                                            artist: t.artist,
                                            url: t.url,
                                            duration: t.duration,
                                            bpm: 120
                                          }));
                                          handleAddToQueue(queueTracks[0], e);
                                          if (queueTracks.length > 1) {
                                            setTrackQueue(prev => [...prev, ...queueTracks.slice(1)]);
                                          }
                                       }
                                     }
                                   } catch (err) {
                                     showNotification("Error reproduciendo playlist");
                                   }
                                 } else {
                                   const track: MusicTrack = {
                                     id: `yt_temp_${ytTrack.id}`,
                                     title: ytTrack.title,
                                     artist: ytTrack.artist,
                                     url: ytTrack.url,
                                     duration: ytTrack.duration,
                                     bpm: 120
                                   };
                                   handleAddToQueue(track, e);
                                 }
                               }}
                               title="Escuchar ahora"
                               className="p-1.5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                             >
                                <Play className="w-3.5 h-3.5" />
                             </button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-white/5 mt-4" />
                    </div>
                  ) : trackListTab === "queue" ? (
                    (() => {
                      const lowerQuery = searchQuery.toLowerCase().trim();
                      const filteredQueue = lowerQuery 
                        ? trackQueue.filter(track => 
                            track.title?.toLowerCase().includes(lowerQuery) || 
                            track.artist?.toLowerCase().includes(lowerQuery)
                          )
                        : trackQueue;

                      if (filteredQueue.length === 0) {
                        return (
                          <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
                            <ListMusic className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                            <p>{searchQuery ? "No se encontraron coincidencias en la cola." : "No hay canciones en la cola de reproducción."}</p>
                            {!searchQuery && (
                              <p className="text-[10px] text-slate-500">
                                Añade canciones a la cola usando el botón <span className="inline-flex items-center text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded"><ListPlus className="w-3.5 h-3.5" /></span> en las pistas.
                              </p>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-1 w-full">
                          {filteredQueue.map((track, idx) => {
                            return (
                              <div
                                key={`queue_${track.id || idx}_${idx}`}
                                onClick={() => {
                                  expectedPlayingRef.current = true;
                                  setOverrideCurrentTrack(track);
                                  setIsPlaying(true);
                                  setTrackQueue(prev => prev.filter((_, i) => i !== idx));
                                  showNotification(`Reproduciendo: ${track.title}`);
                                }}
                                role="button"
                                className="group/track w-full flex items-center gap-2 sm:gap-3 px-2 py-1 sm:px-3 sm:py-1 transition-all text-left relative overflow-hidden rounded-lg cursor-pointer bg-transparent hover:bg-white/[0.04]"
                              >
                                <div className="hidden sm:flex items-center justify-center w-6 shrink-0 relative z-10">
                                  <span className="text-[11px] font-medium text-slate-500 group-hover/track:text-emerald-400 transition-colors">
                                    {idx + 1}
                                  </span>
                                </div>

                                <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                                  {track.artwork_url || track.thumbnail || track.artwork ? (
                                    <img src={track.artwork_url || track.thumbnail || track.artwork} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 pr-3 relative z-10 flex flex-col justify-center">
                                  <p className="text-[11px] sm:text-xs font-semibold truncate leading-tight text-white group-hover/track:text-emerald-400 transition-colors uppercase tracking-wide">
                                    {track.title}
                                  </p>
                                  <p className="text-[9.5px] sm:text-[10px] font-normal truncate mt-0.5 text-slate-400 group-hover/track:text-white transition-colors">
                                    {track.artist || track.author || "Unknown Artist"}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1.5 relative z-20">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setTrackQueue(prev => prev.filter((_, i) => i !== idx));
                                      showNotification(`Quitada de la cola: ${track.title}`);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-500/10 cursor-pointer"
                                    title="Quitar de la cola"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : filteredDisplayTracks.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-xs font-medium">
                      No se encontraron resultados para "{searchQuery}"
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 w-full">
                      {filteredDisplayTracks.map(({ track, idx }) => {
                        const isActive = displayTrackIndex === idx;
                        return (
                          <div
                            key={track.id || idx}
                            onClick={() => {
                              expectedPlayingRef.current = true;
                              setOverrideCurrentTrack(null);
                              if (isActive) {
                                setIsPlaying(!isPlaying);
                              } else {
                                setCurrentTrackIndex(idx);
                                setIsPlaying(true);
                              }
                            }}
                            role="button"
                            className={`group/track w-full flex items-center gap-2 sm:gap-3 px-2 py-1 sm:px-3 sm:py-1 transition-all text-left relative overflow-hidden rounded-lg cursor-pointer ${
                              isActive
                                ? "bg-white/[0.08] shadow-[inset_0_0_12px_rgba(255,255,255,0.02)] border-l-2 border-emerald-500"
                                : "bg-transparent hover:bg-white/[0.04]"
                            }`}
                          >
                            {/* Track Number & Hover/Active States (Spotify Style) */}
                            <div className="hidden sm:flex items-center justify-center w-6 shrink-0 relative z-10">
                              {/* Default Track Number */}
                              <span className={`text-[11px] font-medium transition-opacity duration-200 ${
                                isActive ? "opacity-0 text-emerald-400" : "opacity-100 group-hover/track:opacity-0 text-slate-400"
                              }`}>
                                {idx + 1}
                              </span>
                              
                              {/* Play/Pause/EQ Icon overlay */}
                              <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                                isActive ? "opacity-100" : "opacity-0 group-hover/track:opacity-100"
                              }`}>
                                 {isActive && isPlaying ? (
                                    <div className="flex gap-[2px] items-end h-[11px] shrink-0">
                                      {[...Array(3)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-[2px] bg-emerald-400 rounded-full ${isPageVisible && !isEcoMode ? `animate-eq-bar-${i}` : ""} will-change-transform`}
                                          style={{ height: "11px", transformOrigin: "bottom" }}
                                        />
                                      ))}
                                    </div>
                                 ) : (
                                    <Play className={`w-3.5 h-3.5 ml-0.5 fill-current ${isActive ? "text-emerald-400" : "text-white"}`} />
                                 )}
                              </div>
                            </div>
                            
                            {/* Thumbnail */}
                            <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white/5 rounded flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                              {track.artwork_url || track.thumbnail || track.artwork ? (
                                <img src={track.artwork_url || track.thumbnail || track.artwork} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                              )}
                              
                              {/* Mobile Play Overlay (since number is hidden on mobile) */}
                              <div className={`sm:hidden absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'}`}>
                                 {isActive && isPlaying ? (
                                    <div className="flex gap-[2px] items-end h-[11px] shrink-0">
                                      {[...Array(3)].map((_, i) => (
                                        <div
                                          key={i}
                                          className={`w-[2px] bg-emerald-400 rounded-full ${isPageVisible && !isEcoMode ? `animate-eq-bar-${i}` : ""} will-change-transform`}
                                          style={{ height: "11px", transformOrigin: "bottom" }}
                                        />
                                      ))}
                                    </div>
                                 ) : (
                                    <Play className="w-3.5 h-3.5 ml-0.5 fill-white" />
                                 )}
                              </div>
                            </div>
                            
                            {/* Track Info */}
                            <div className="flex-1 min-w-0 pr-1.5 sm:pr-3 relative z-10 flex flex-col justify-center">
                              <p className={`text-[11.5px] sm:text-xs font-semibold truncate leading-tight transition-colors duration-200 uppercase tracking-wide ${
                                isActive ? "text-emerald-400 font-extrabold" : "text-white"
                              }`}>
                                {track.title}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <p className={`text-[9.5px] sm:text-[10px] font-normal truncate transition-colors duration-200 ${
                                  isActive ? "text-emerald-500/80 font-bold" : "text-slate-400 group-hover/track:text-white"
                                }`}>
                                  {track.artist || track.author || "Unknown Artist"}
                                </p>
                                {track.description && (
                                  <>
                                    <span className="text-[9px] text-zinc-600 shrink-0">•</span>
                                    <p className="text-[9.5px] sm:text-[10px] text-emerald-400/60 font-medium truncate italic shrink-1" title={track.description}>
                                      {track.description}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
        
                            {/* Actions (Queue / Edit / Delete) */}
                            <div className="flex items-center gap-1.5 relative z-20 mr-1.5">
                              <button onClick={(e) => handleAddToQueue(track, e)} className="p-1.5 sm:p-1 text-slate-400 hover:text-emerald-400 rounded-md hover:bg-emerald-500/10 cursor-pointer" title="Añadir a la cola">
                                <ListPlus className="w-3.5 h-3.5" />
                              </button>
                              {selectedPlaylist?.id && selectedPlaylist.id !== "all" && (
                                isAdmin ||
                                savedSecurityCode === "ho82788278" ||
                                (user && selectedPlaylist.ownerId === user?.uid)
                              ) && (
                                <>
                                  <button onClick={(e) => startEditingTrack(track, e)} className="p-1.5 sm:p-1 text-slate-400 hover:text-emerald-400 rounded-md hover:bg-emerald-500/10 cursor-pointer" title="Editar canción / renombrar">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={(e) => handleDeleteTrack(track, e)} className="p-1.5 sm:p-1 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-500/10 cursor-pointer" title="Eliminar de la playlist">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
    
                            {/* Duration / Options */}
                            <div className="hidden sm:flex items-center gap-2 shrink-0 relative z-10 text-[10.5px] font-medium text-slate-400">
                              {track.duration && (
                                 <span className="w-9 text-right group-hover/track:text-white transition-colors">
                                   {track.duration}
                                 </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-[#050505] border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase text-slate-500 tracking-widest shrink-0">
                  <span>Total de canciones: {displayTracks.length || 0}</span>
                  <span className="text-emerald-500">Flux Engine Premium</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-transparent">
              <div className="w-24 h-24 border border-dashed border-white/10 rounded-full flex items-center justify-center mb-6">
                <Music className="w-7 h-7 text-white/5 animate-pulse" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">
                Estación Offline
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowLibrary(true)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-black uppercase text-[10px] rounded-lg hover:bg-white/10 transition-all"
                >
                  Abrir Biblioteca
                </button>
                <button
                  onClick={() => setIsAdding(true)}
                  className="px-5 py-2.5 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-lg hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Canal
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* OVERLAY: LIBRARY MODAL */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-start justify-center p-4 sm:p-6 pt-10 sm:pt-20"
          >
            <div className="w-full max-w-5xl h-fit max-h-[85vh] flex flex-col bg-[#080808] border border-white/10 rounded-[40px] overflow-hidden shadow-4xl relative">
              {/* Starry Background for Library */}
              <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/[0.04] to-transparent pointer-events-none" />

              <div className="flex justify-between items-center px-6 py-6 sm:px-10 relative z-10 shrink-0">
                <div>
                  <h3 className="text-sm sm:text-lg font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">
                    Music Archive
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    {userPlaylists.length} Canales Sincronizados
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setIsAdding(true);
                      setShowLibrary(false);
                    }}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-black uppercase text-[9px] rounded-lg hover:scale-105 transition-all shadow-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir</span>
                  </button>
                  <button
                    onClick={() => setShowLibrary(false)}
                    className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-12 sm:px-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 scrollbar-hide relative z-10 justify-center">
                {userPlaylists.map((pl, idx) => (
                  <motion.div
                    key={pl.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="relative group flex flex-col"
                  >
                    <div
                      onClick={() => selectPlaylist(pl)}
                      className={`w-full flex flex-col gap-2 p-3 rounded-2xl border transition-all text-left group aspect-[4/5] relative cursor-pointer ${
                        selectedPlaylist?.id === pl.id
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className={`w-full aspect-square rounded-xl bg-gradient-to-tr ${getPlaylistGradientClass(pl.name)} flex items-center justify-center text-xl shadow-lg relative overflow-hidden shrink-0 transition-transform duration-500`}>
                        {pl.thumbnail_url ? (
                          <img src={pl.thumbnail_url} alt={pl.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                            <span className="relative z-10 shrink-0 select-none filter drop-shadow flex items-center justify-center">
                              {pl.icon && pl.icon !== "📂" && pl.icon !== "📁" && pl.icon !== "🎵" ? (
                                pl.icon
                              ) : (
                                <Headphones className="w-6 h-6 text-white/90" />
                              )}
                            </span>
                          </>
                        )}
                        
                        {/* Indicador de pistas flotante */}
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/85 backdrop-blur-md rounded-md text-[9px] sm:text-[10.5px] font-extrabold text-emerald-300 uppercase tracking-widest border border-emerald-500/20 shadow-md">
                          {pl.tracks.length} P • {calculatePlaylistDuration(pl.tracks)}
                        </div>
                      </div>
                      
                      <div className="flex-1 mt-2 overflow-hidden flex flex-col justify-start">
                        <p className="text-xs sm:text-[14px] font-bold truncate text-white leading-tight">
                          {pl.name}
                        </p>
                        <p className="text-[10.5px] sm:text-[12px] text-slate-300 font-medium truncate mt-1 normal-case tracking-wide opacity-100" title={pl.description || "Sin descripción"}>
                          {pl.description || "Canal personalizado de música"}
                        </p>
                        <p className="text-[10.5px] sm:text-[11.5px] text-emerald-400 font-extrabold tracking-wide mt-1 flex items-center gap-1">
                          {pl.tracks.length} {pl.tracks.length === 1 ? 'Tema' : 'Temas'} • <span>{calculatePlaylistDuration(pl.tracks)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción: Independientes del área de clic del card */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1.5 z-[50] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(pl);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-black/95 backdrop-blur-xl rounded-lg text-slate-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 shadow-2xl transition-all cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startDeleting(pl.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-black/95 backdrop-blur-xl rounded-lg text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 shadow-2xl transition-all cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: EDIT PLAYLIST MODAL */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80"
          >
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[40px] p-6 sm:p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)] relative"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full" />
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <Edit2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-white tracking-[0.3em]">
                      Editar Canal
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Actualizar Metadatos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                      Nombre del Canal
                    </label>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Nombre del Canal"
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                      Descripción
                    </label>
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="Breve descripción..."
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium h-32 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                      URL de la Foto de Portada (Déjalo en blanco para auto-generar)
                    </label>
                    <input
                      type="text"
                      value={editingCover}
                      onChange={(e) => setEditingCover(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />
                  </div>

                  {!isAdmin && !isBlocked && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em] px-3 block">
                        Código Maestro de Seguridad
                      </label>
                      <input
                        type="password"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                  )}

                  {isBlocked && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                        Acceso Bloqueado permanentemente
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={saveEdit}
                    className="w-full bg-emerald-500 text-black py-6 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                  >
                    Guardar Cambios
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: EDIT TRACK MODAL */}
      <AnimatePresence>
        {editingTrack && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[105] flex items-center justify-center p-4 sm:p-6 bg-black/85"
          >
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[40px] p-6 sm:p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)] relative text-left"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full" />
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    <Edit2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-white tracking-[0.3em]">
                      Editar Canción
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Renombrar y agregar descripción
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTrack(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 relative z-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                      Nombre / Título de la Canción
                    </label>
                    <input
                      type="text"
                      value={editingTrackTitle}
                      onChange={(e) => setEditingTrackTitle(e.target.value)}
                      placeholder="Ej. Phonk Remix"
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                      Artista / Distribuidor / Autor
                    </label>
                    <input
                      type="text"
                      value={editingTrackArtist}
                      onChange={(e) => setEditingTrackArtist(e.target.value)}
                      placeholder="Ej. M83"
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium text-white"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                      Descripción o Detalles
                    </label>
                    <textarea
                      value={editingTrackDescription}
                      onChange={(e) => setEditingTrackDescription(e.target.value)}
                      placeholder="Escribe una nota, descripción o dedicatoria para esta canción..."
                      className="w-full bg-black/40 border border-white/5 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-medium h-32 resize-none text-white"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={saveTrackEdit}
                    className="w-full bg-emerald-500 text-black py-6 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                  >
                    Guardar Cambios
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: DELETE PLAYLIST MODAL */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80"
          >
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-red-500/20 rounded-[40px] p-6 sm:p-12 shadow-[0_0_100px_rgba(239,68,68,0.1)] relative"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/20 blur-[120px] rounded-full" />
              
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-white tracking-[0.3em]">
                      Eliminar Canal
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Acción Irreversible
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeletingId(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-8 relative z-10">
                <p className="text-sm text-slate-400 font-medium px-2">
                  ¿Estás seguro de que deseas eliminar este canal? Esta acción borrará todos los datos asociados de forma permanente.
                </p>

                <div className="space-y-6">
                  {!isAdmin && !isBlocked && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.2em] px-3 block">
                        Código Maestro de Seguridad
                      </label>
                      <input
                        type="password"
                        value={authCode}
                        onChange={(e) => setAuthCode(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-red-500/5 border border-red-500/20 rounded-[24px] px-6 py-4 text-sm outline-none focus:border-red-500 transition-all font-mono"
                      />
                    </div>
                  )}

                  {isBlocked && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                        Acceso Bloqueado permanentemente
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeletingId(null)}
                    className="bg-white/5 text-white/60 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={isDeleting}
                    className={`bg-red-500 text-white py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${
                      isDeleting ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600 active:scale-95"
                    }`}
                  >
                    {isDeleting ? "Borrando..." : "Eliminar"}
                    {!isDeleting && <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: ADD PLAYLIST MODAL */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80"
          >
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[40px] p-6 sm:p-12 shadow-[0_0_100px_rgba(16,185,129,0.1)] relative"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 blur-[120px] rounded-full" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/5 blur-[120px] rounded-full" />

              <div className="flex justify-between items-center mb-10 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                    {addStep === 'auth' ? <Shield className="w-5 h-5 text-emerald-500" /> : <Plus className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-white tracking-[0.3em]">
                      {addStep === 'auth' ? 'Acceso Maestro' : 'Sincronizar Canal'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      {addStep === 'auth' ? 'Verificación de Identidad' : 'Pegar Enlace YouTube'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:rotate-90"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-10 relative z-10">
                {addStep === 'auth' ? (
                  <div className="space-y-10">
                    <div className="space-y-5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                        Ingresa el Código de Acceso
                      </label>
                      <div className="relative group">
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={adminCode}
                          onChange={(e) => setAdminCode(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleVerifyAdmin()}
                          className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-6 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium pr-16 shadow-inner text-center tracking-[1em]"
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleVerifyAdmin}
                      className="w-full bg-white text-black py-6 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                    >
                      Verificar Código
                      <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Add Mode Toggle */}
                    {addMode !== "add_track" && (
                      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
                        <button
                          onClick={() => setAddMode("import_set")}
                          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${addMode === "import_set" ? "bg-emerald-500 text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                          Importar de YouTube
                        </button>
                        <button
                          onClick={() => setAddMode("create_empty")}
                          className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${addMode === "create_empty" ? "bg-emerald-500 text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
                        >
                          Crear Playlist
                        </button>
                      </div>
                    )}

                    {addMode === "create_empty" ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block mb-2">
                            Nombre de la Nueva Playlist
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              placeholder="Mi Nueva Playlist..."
                              value={newPlaylistName}
                              onChange={(e) => setNewPlaylistName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleProcessAdd()}
                              className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-4 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium shadow-inner"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block mb-2">
                            Descripción (Opcional)
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              placeholder="Ej. Temazos para correr..."
                              value={newPlaylistDesc}
                              onChange={(e) => setNewPlaylistDesc(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleProcessAdd()}
                              className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-4 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium shadow-inner"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block mb-2">
                            Icono o Emoji (Opcional)
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              placeholder="Ej. 🏃‍♂️ o 🚀"
                              value={newPlaylistIcon}
                              onChange={(e) => setNewPlaylistIcon(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleProcessAdd()}
                              className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-4 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium shadow-inner"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block mb-2">
                            URL de la Foto de Portada (Opcional)
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              placeholder="https://..."
                              value={newPlaylistCover}
                              onChange={(e) => setNewPlaylistCover(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleProcessAdd()}
                              className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-4 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium shadow-inner"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                          {addMode === "add_track" ? "URL de la Canción (YouTube)" : "URL de la Playlist / Canción"}
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            disabled={isFetchingMeta}
                            onKeyDown={(e) => e.key === 'Enter' && handleProcessAdd()}
                            className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-6 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium pr-16 shadow-inner"
                            autoFocus
                          />
                          <div className="absolute right-7 top-1/2 -translate-y-1/2">
                            <Sparkles className={`w-5 h-5 transition-all ${customUrl ? 'text-emerald-500 animate-pulse' : 'text-slate-700'}`} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleProcessAdd}
                        disabled={isFetchingMeta || (addMode === "create_empty" ? !newPlaylistName : !customUrl)}
                        className="w-full bg-emerald-500 text-black py-6 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-white hover:shadow-white/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-4 group"
                      >
                        {isFetchingMeta ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            {addMode === "create_empty" ? "Crear Playlist" : (addMode === "add_track" ? "Añadir Canción" : "Completar Sincronización")}
                            <SkipForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
