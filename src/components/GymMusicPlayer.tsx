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
  {
    id: "gym1",
    title: "The Business",
    artist: "Tiësto",
    bpm: 120,
    duration: "2:44",
    soundcloudUrl: "https://soundcloud.com/tiesto/the-business",
  },
  {
    id: "gym2",
    title: "Levels",
    artist: "Avicii",
    bpm: 126,
    duration: "3:20",
    soundcloudUrl: "https://soundcloud.com/aviciiofficial/avicii-levels",
  },
  {
    id: "gym3",
    title: "Animals",
    artist: "Martin Garrix",
    bpm: 128,
    duration: "5:04",
    soundcloudUrl: "https://soundcloud.com/martingarrix/animals-original-mix",
  },
  {
    id: "gym4",
    title: "Faded",
    artist: "Alan Walker",
    bpm: 90,
    duration: "3:32",
    soundcloudUrl: "https://soundcloud.com/alanwalker/faded",
  },
  {
    id: "gym5",
    title: "Blinding Lights",
    artist: "The Weeknd",
    bpm: 171,
    duration: "3:20",
    soundcloudUrl: "https://soundcloud.com/theweeknd/blinding-lights",
  },
  {
    id: "gym6",
    title: "Keraunos (Drift Phonk)",
    artist: "PlayaPhonk",
    bpm: 151,
    duration: "2:27",
    soundcloudUrl: "https://soundcloud.com/playaphonk/keraunos",
  },
  {
    id: "gym7",
    title: "Rapture",
    artist: "Nadia Ali (Avicii Remix)",
    bpm: 126,
    duration: "3:38",
    soundcloudUrl: "https://soundcloud.com/aviciiofficial/nadia-ali-rapture-avicii",
  },
  {
    id: "gym8",
    title: "Wake Me Up",
    artist: "Avicii",
    bpm: 124,
    duration: "4:07",
    soundcloudUrl: "https://soundcloud.com/aviciiofficial/preview-avicii-wake-me-up",
  },
  {
    id: "gym9",
    title: "Adagio for Strings",
    artist: "Tiësto",
    bpm: 140,
    duration: "7:20",
    soundcloudUrl: "https://soundcloud.com/tiesto/adagio-for-strings-original",
  },
  {
    id: "gym10",
    title: "Clarity",
    artist: "Zedd ft. Foxes",
    bpm: 128,
    duration: "4:31",
    soundcloudUrl: "https://soundcloud.com/zedd/clarity",
  },
  {
    id: "gym11",
    title: "Lean On",
    artist: "Major Lazer & DJ Snake",
    bpm: 98,
    duration: "2:56",
    soundcloudUrl: "https://soundcloud.com/majorlazer/lean-on",
  },
  {
    id: "gym12",
    title: "Titanium",
    artist: "David Guetta ft. Sia",
    bpm: 126,
    duration: "4:05",
    soundcloudUrl: "https://soundcloud.com/davidguetta/titanium-feat-sia",
  },
  {
    id: "gym13",
    title: "Strobe (Club Edit)",
    artist: "deadmau5",
    bpm: 128,
    duration: "6:12",
    soundcloudUrl: "https://soundcloud.com/deadmau5/strobe-club-edit",
  },
  {
    id: "gym14",
    title: "Intro",
    artist: "The xx",
    bpm: 120,
    duration: "2:08",
    soundcloudUrl: "https://soundcloud.com/thexxofficial/intro",
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

const getEmbedUrl = (url: string, autoPlay: boolean = false) => {
  const encodedUrl = encodeURIComponent(url);
  const autoPlayParam = autoPlay ? "true" : "false";
  return `https://w.soundcloud.com/player/?url=${encodedUrl}&color=%2310b981&auto_play=${autoPlayParam}&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false&show_playcount=false&buying=false&sharing=false&download=false&api_enable=true`;
};

export default function GymMusicPlayer() {
  const { user, loading: authLoading, setAuthModalOpen } = useFirebase();
  const isAdmin = user?.email === "eltygere8651@gmail.com";
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MusicPlaylist | null>(null);
  const [isTracklistOpen, setIsTracklistOpen] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [userPlaylists, setUserPlaylists] = useState<MusicPlaylist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addStep, setAddStep] = useState<"auth" | "form">("auth");
  const [adminCode, setAdminCode] = useState("");
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);

  const [currentTrackMeta, setCurrentTrackMeta] = useState<any>(null);

  // REALTIME ENGINE STATES
  const [engineTracks, setEngineTracks] = useState<any[]>([]);
  const [engineTrackIndex, setEngineTrackIndex] = useState(0);
  
  useEffect(() => {
    engineTracksRef.current = engineTracks;
  }, [engineTracks]);

  useEffect(() => {
    engineTrackIndexRef.current = engineTrackIndex;
  }, [engineTrackIndex]);

  const [engineCurrentSound, setEngineCurrentSound] = useState<any>(null);

  const [showLibrary, setShowLibrary] = useState(false);
  const [showTracks, setShowTracks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authCode, setAuthCode] = useState("");
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
  const [volume, setVolume] = useState(70);
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const isShuffleRef = useRef(isShuffle);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);

  const widgetRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const expectedPlayingRef = useRef(false);
  const userSkippedRef = useRef(false);
  const engineTracksRef = useRef<any[]>([]);
  const engineTrackIndexRef = useRef(0);

  // Initialize security code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("gym_music_security_code");
    if (savedCode) {
      setSavedSecurityCode(savedCode);
    }
  }, []);

  const displayTracks = React.useMemo(() => {
    const plTracks = selectedPlaylist?.tracks;
    if (plTracks && plTracks.length > 1) {
      if (engineTracks && engineTracks.length > 0) {
        // Enforce alignment: use engineTracks structure but enrich names & artist from plTracks!
        return engineTracks.map((et, idx) => {
          const pt = plTracks[idx];
          const hasInvalidTitle = !et.title || et.title.includes("SoundCloud Artist") || et.title === "SoundCloud";
          const hasInvalidArtist = !et.artist || et.artist.includes("SoundCloud Artist") || et.artist === "SoundCloud";
          
          return {
            ...et,
            title: (pt && pt.title && (hasInvalidTitle || pt.title !== "Audio Importado")) ? pt.title : (et.title || "SoundCloud Track"),
            artist: (pt && pt.artist && (hasInvalidArtist || pt.artist !== "SoundCloud")) ? pt.artist : (et.artist || "SoundCloud Artist"),
            artwork_url: et.artwork_url || (pt && (pt as any).artwork_url),
          };
        });
      }
      return plTracks;
    }

    if (engineTracks && engineTracks.length > 0) {
      return engineTracks;
    }
    // Otherwise, faithfully display whatever tracks are in the current playlist.
    return selectedPlaylist?.tracks || ALL_DATABASE_TRACKS;
  }, [engineTracks, selectedPlaylist]);

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

  const displayTrackIndex =
    engineTracks.length > 0 ? engineTrackIndex : currentTrackIndex;

  const currentTrack =
    displayTracks[currentTrackIndex] || displayTracks[0] || ALL_DATABASE_TRACKS[0];
  const currentUrl = currentTrack.url || currentTrack.soundcloudUrl || "";

  // Keep background JS context alive on iOS/Android via silent loop ambient audio synchronizer
  const [hasInitializedWidget, setHasInitializedWidget] = useState(false);
  const [initialIframeUrl] = useState(() => getEmbedUrl(currentUrl, false));
  const loadedTrackUrlRef = useRef<string>(currentUrl);

  useEffect(() => {
    if (!silentAudioRef.current) return;
    silentAudioRef.current.volume = 0.05; // Non-zero volume is more reliable for lock screen sessions
    if (isPlaying) {
      silentAudioRef.current.play().catch((err) => {
        console.warn("Silent audio context initialization deferred for interaction click:", err);
      });
    } else {
      silentAudioRef.current.pause();
    }
  }, [isPlaying]);

  const togglePlayback = useCallback(() => {
    const widget = widgetRef.current;
    if (!widget || !hasInitializedWidget) {
      console.warn("Widget not ready");
      return;
    }

    if (silentAudioRef.current) {
      if (!isPlaying) {
        silentAudioRef.current.play().catch(() => {});
      } else {
        silentAudioRef.current.pause();
      }
    }

    if (isPlaying) {
      expectedPlayingRef.current = false;
      widget.toggle();
      setIsPlaying(false);
    } else {
      expectedPlayingRef.current = true;
      widget.toggle();
      setIsPlaying(true);
    }
  }, [isPlaying, hasInitializedWidget]);

  const handleNext = useCallback(() => {
    if (silentAudioRef.current) {
      silentAudioRef.current.currentTime = 0;
      silentAudioRef.current.play().catch(() => {});
    }
    
    expectedPlayingRef.current = true;

    if (isShuffle) {
      if (engineTracks.length > 1 && widgetRef.current) {
        const currentIndex = engineTrackIndex;
        let randomIndex = Math.floor(Math.random() * engineTracks.length);
        if (randomIndex === currentIndex && engineTracks.length > 1) {
          randomIndex = (randomIndex + 1) % engineTracks.length;
        }
        const widget = widgetRef.current;
        try {
          userSkippedRef.current = true;
          widget.skip(randomIndex);
          widget.play();
        } catch (e) {
          console.warn("Skip failed", e);
        }
      } else {
        const tracksList = displayTracks;
        if (tracksList.length > 1) {
          const currentIndex = currentTrackIndex;
          let randomIndex = Math.floor(Math.random() * tracksList.length);
          if (randomIndex === currentIndex) {
            randomIndex = (randomIndex + 1) % tracksList.length;
          }
          setCurrentTrackIndex(randomIndex);
        } else if (tracksList.length === 1) {
          setCurrentTrackIndex(0);
        }
      }
      setIsPlaying(true);
      return;
    }

    if (engineTracks.length > 1 && widgetRef.current) {
      const widget = widgetRef.current;
      try {
        userSkippedRef.current = true;
        widget.next();
        widget.play();
      } catch (e) {
        console.warn("Next failed", e);
      }
    } else {
      const tracksList = displayTracks;
      if (currentTrackIndex < tracksList.length - 1) {
        setCurrentTrackIndex((prev) => prev + 1);
      } else if (tracksList.length > 0) {
        setCurrentTrackIndex(0);
      }
    }
    setIsPlaying(true);
  }, [displayTracks, currentTrackIndex, engineTracks, isShuffle, engineTrackIndex]);

  const handlePrev = useCallback(() => {
    if (silentAudioRef.current) {
      silentAudioRef.current.currentTime = 0;
      silentAudioRef.current.play().catch(() => {});
    }

    expectedPlayingRef.current = true;

    if (isShuffle) {
      if (engineTracks.length > 1 && widgetRef.current) {
        const currentIndex = engineTrackIndex;
        let randomIndex = Math.floor(Math.random() * engineTracks.length);
        if (randomIndex === currentIndex && engineTracks.length > 1) {
          randomIndex = (randomIndex + 1) % engineTracks.length;
        }
        const widget = widgetRef.current;
        try {
          userSkippedRef.current = true;
          widget.skip(randomIndex);
          widget.play();
        } catch (e) {
          console.warn("Skip failed", e);
        }
      } else {
        const tracksList = displayTracks;
        if (tracksList.length > 1) {
          const currentIndex = currentTrackIndex;
          let randomIndex = Math.floor(Math.random() * tracksList.length);
          if (randomIndex === currentIndex) {
            randomIndex = (randomIndex + 1) % tracksList.length;
          }
          setCurrentTrackIndex(randomIndex);
        } else if (tracksList.length === 1) {
          setCurrentTrackIndex(0);
        }
      }
      setIsPlaying(true);
      return;
    }

    if (engineTracks.length > 1 && widgetRef.current) {
      const widget = widgetRef.current;
      try {
        userSkippedRef.current = true;
        widget.prev();
        widget.play();
      } catch (e) {
        console.warn("Prev failed", e);
      }
    } else {
      const tracksList = displayTracks;
      if (currentTrackIndex > 0) {
        setCurrentTrackIndex((prev) => prev - 1);
      } else if (tracksList.length > 0) {
        setCurrentTrackIndex(tracksList.length - 1);
      }
    }
    setIsPlaying(true);
  }, [currentTrackIndex, engineTracks, isShuffle, displayTracks, engineTrackIndex]);

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

        return {
          id: doc.id,
          ...data,
          ownerId: ownerId,
        };
      }) as MusicPlaylist[];
      setUserPlaylists(folders);
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

  const initWidget = useCallback((forcedUrl?: string) => {
    const iframe = document.getElementById("sc-iframe") as HTMLIFrameElement;
    if (iframe && (window as any).SC) {
      if (!widgetRef.current) {
        const widget = (window as any).SC.Widget(iframe);
        widgetRef.current = widget;

        widget.bind((window as any).SC.Widget.Events.READY, () => {
          console.log("SoundCloud Widget READY");
          setHasInitializedWidget(true);
          setIsLoadingTrack(false);
          widget.setVolume(volumeRef.current);
          
          widget.getSounds((sounds: any[]) => {
            if (sounds && sounds.length > 0) {
              setEngineTracks(
                sounds.map((s: any) => ({
                  id: s.id.toString(),
                  title: s.title,
                  artist: s.user?.username || "SoundCloud Artist",
                  artwork_url: s.artwork_url,
                })),
              );
            }
          });

          widget.getDuration((d: number) => setDuration(d));
          if (isPlayingRef.current) {
            widget.play();
          }
        });

        widget.bind((window as any).SC.Widget.Events.PLAY, () => {
          expectedPlayingRef.current = true;
          setIsPlaying(true);
          setIsLoadingTrack(false);
          widget.getCurrentSoundIndex((index: number) => {
             const prevIndex = engineTrackIndexRef.current;
             
             // If we didn't manually skip, shuffle is ON, and it's a playlist
             if (!userSkippedRef.current && isShuffleRef.current && engineTracksRef.current.length > 1) {
                // If the widget automatically advanced sequentially (or looped to 0 naturally)
                if (index === prevIndex + 1 || (prevIndex > 0 && index === 0)) {
                    let randomIndex = Math.floor(Math.random() * engineTracksRef.current.length);
                    if (randomIndex === index) {
                       randomIndex = (randomIndex + 1) % engineTracksRef.current.length;
                    }
                    console.log("Shuffle intercept! Auto-play detected. Skipping to:", randomIndex);
                    userSkippedRef.current = true; 
                    widget.skip(randomIndex);
                    return; // Early return so we don't update UI incorrectly until the skip completes
                }
             }
             
             userSkippedRef.current = false;
             setEngineTrackIndex(index);
          });
          widget.getCurrentSound((sound: any) => {
            setEngineCurrentSound(sound);
            if (sound && sound.duration) setDuration(sound.duration);
          });
        });

        widget.bind((window as any).SC.Widget.Events.PAUSE, () => {
          if (!expectedPlayingRef.current) {
            setIsPlaying(false);
          }
        });

        widget.bind((window as any).SC.Widget.Events.PLAY_PROGRESS, (data: any) => {
          setPosition(data.currentPosition);
        });

        widget.bind((window as any).SC.Widget.Events.ERROR, () => {
          console.warn("Track blocked or unavailable. Skipping to next.");
          if (handleNextRef.current) handleNextRef.current();
        });

        widget.bind((window as any).SC.Widget.Events.FINISH, () => {
          if (handleNextRef.current) handleNextRef.current();
        });
      }

      // Smoothly load new URLs via Widget API
      if (forcedUrl && widgetRef.current) {
        // If not initialized yet, we can't 'load' reliably, so we'll wait for the READY event
        // to handle the first track. But if it's already true, we load.
        if (hasInitializedWidget && forcedUrl !== loadedTrackUrlRef.current) {
          loadedTrackUrlRef.current = forcedUrl;
          setIsLoadingTrack(true);
          widgetRef.current.load(forcedUrl, {
            auto_play: expectedPlayingRef.current,
            show_artwork: false,
            color: "#10b981",
            callback: () => {
              setIsLoadingTrack(false);
              if (widgetRef.current) {
                widgetRef.current.setVolume(volumeRef.current);
                if (expectedPlayingRef.current) {
                  const widget = widgetRef.current;
                  try {
                    widget.play();
                  } catch (e) {
                    console.warn("Play failed", e);
                  }
                }
                widgetRef.current.getSounds((sounds: any[]) => {
                  if (sounds && sounds.length > 0) {
                    setEngineTracks(
                      sounds.map((s: any) => ({
                        id: s.id.toString(),
                        title: s.title,
                        artist: s.user?.username || "SoundCloud Artist",
                        artwork_url: s.artwork_url,
                      })),
                    );
                  }
                });
              }
            }
          });
        }
      }
    }
  }, [hasInitializedWidget]);

  useEffect(() => {
    if (!(window as any).SC) {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      script.onload = () => initWidget();
      document.body.appendChild(script);
    } else {
      initWidget();
    }
  }, [initWidget]);

  useEffect(() => {
    if (widgetRef.current && hasInitializedWidget) {
      widgetRef.current.setVolume(volume);
    }
  }, [volume, hasInitializedWidget]);

  useEffect(() => {
    if (hasInitializedWidget && currentUrl) {
      initWidget(currentUrl);
    }
  }, [currentUrl, initWidget, hasInitializedWidget]);

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

  // Automatic playlist self-healing and background tracks list retrieval
  useEffect(() => {
    if (!selectedPlaylist) return;
    
    const url = selectedPlaylist.tracks?.[0]?.url || selectedPlaylist.tracks?.[0]?.soundcloudUrl || "";
    const isPlaylistUrl = url.includes("/sets/");
    const hasOnlyOneTrack = selectedPlaylist.tracks && selectedPlaylist.tracks.length === 1;

    if (isPlaylistUrl && hasOnlyOneTrack) {
      console.log(`Healing playlist dynamically for: ${selectedPlaylist.name}`);
      fetchMetadata(url).then(async (meta) => {
        if (meta && meta.tracks && meta.tracks.length > 0) {
          console.log(`Dynamic heal fetched ${meta.tracks.length} tracks for ${selectedPlaylist.name}`);
          
          const healedPlaylist = {
            ...selectedPlaylist,
            tracks: meta.tracks
          };
          setSelectedPlaylist(healedPlaylist);

          try {
            const { updateDoc, doc: fsDoc } = await import("firebase/firestore");
            const ownerId = selectedPlaylist.ownerId || user?.uid;
            if (ownerId && db) {
              const playlistRef = fsDoc(db, "users", ownerId, "playlists", selectedPlaylist.id);
              await updateDoc(playlistRef, {
                tracks: meta.tracks,
                updatedAt: new Date()
              });
              console.log(`Firestore record updated for playlist: ${selectedPlaylist.id}`);
            }
          } catch (persistErr) {
            console.error("Could not persist healed tracks to Firestore:", persistErr);
          }
        }
      });
    }
  }, [selectedPlaylist, user]);

  const handleAddNewCanalClick = () => {
    setAdminCode(savedSecurityCode || "");
    setCustomUrl("");
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

  const handleAddPlaylist = async () => {
    if (isBlocked) {
      alert("Acceso bloqueado.");
      return;
    }

    if (adminCode !== "ho82788278") {
      alert("Clave de administrador incorrecta");
      return;
    }

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
        adminSecret: adminCode, // Added to pass firestore rules
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
      console.error("Error adding playlist", error);
      alert("Error al añadir playlist. Verifica los permisos.");
    }
  };

  const startEditing = (pl: MusicPlaylist) => {
    setEditingId(pl.id);
    setEditingName(pl.name);
    setEditingDescription(pl.description || "");
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
      
      await updateDoc(doc(db, "users", targetOwnerId, "playlists", editingId), {
        name: editingName,
        description: editingDescription,
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

  const selectPlaylist = (playlist: MusicPlaylist) => {
    if (silentAudioRef.current) {
      silentAudioRef.current.play().catch(() => {});
    }
    setIsLoadingTrack(true);
    setCustomUrl("");
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setEngineTracks([]);
    setEngineTrackIndex(0);
    setEngineCurrentSound(null);
    setPosition(0);
    setDuration(0);
    expectedPlayingRef.current = true;
    setIsPlaying(true);
    setShowLibrary(false);
    if (widgetRef.current) {
      // If widget is already ready but URL changes, mobile still trusts the gesture context here if load is immediate, but we rely on reinit
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseInt(e.target.value);
    setPosition(newPos);
    if (widgetRef.current) {
      widgetRef.current.seekTo(newPos);
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
        if (widgetRef.current) {
          widgetRef.current.seekTo(newPos);
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

  const formatTime = (ms: number) => {
    if (!ms || isNaN(ms)) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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

  // USE STABLE HANDLERS FOR MEDIA SESSION TO PREVENT LOCK SCREEN LAG/RE-REGISTRATION ISSUES
  const handlersRef = useRef({ togglePlayback, handleNext, handlePrev });
  useEffect(() => {
    handlersRef.current = { togglePlayback, handleNext, handlePrev };
  }, [togglePlayback, handleNext, handlePrev]);

  // Sync Position State with Lock Screen
  useEffect(() => {
    if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: (duration || 0) / 1000,
          playbackRate: 1,
          position: (position || 0) / 1000,
        });
      } catch (e) {}
    }
  }, [position, duration]);

  // Media Session API Integration for background playback
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // Update Metadata
    if (selectedPlaylist) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: displayTitle,
        artist: displayArtist,
        album: selectedPlaylist.name || "Bienve Music App",
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
      if (silentAudioRef.current) silentAudioRef.current.play().catch(() => {});
      handlersRef.current.togglePlayback();
    };

    const pauseHandler = () => {
      handlersRef.current.togglePlayback();
    };

    const nextHandler = () => {
      if (silentAudioRef.current) {
        silentAudioRef.current.currentTime = 0;
        silentAudioRef.current.play().catch(() => {});
      }
      handlersRef.current.handleNext();
    };

    const prevHandler = () => {
      if (silentAudioRef.current) {
        silentAudioRef.current.currentTime = 0;
        silentAudioRef.current.play().catch(() => {});
      }
      handlersRef.current.handlePrev();
    };

    // Register handlers - always register both next and prev to ensure they show up on iOS
    const actions: [MediaSessionAction, () => void][] = [
      ["play", playHandler],
      ["pause", pauseHandler],
      ["previoustrack", prevHandler],
      ["nexttrack", nextHandler],
      ["seekforward", () => {
        if (widgetRef.current) widgetRef.current.getPosition((p: number) => widgetRef.current.seekTo(p + 10000));
      }],
      ["seekbackward", () => {
        if (widgetRef.current) widgetRef.current.getPosition((p: number) => widgetRef.current.seekTo(Math.max(0, p - 10000)));
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
        if (details.seekTime !== undefined && widgetRef.current) {
          widgetRef.current.seekTo(details.seekTime * 1000);
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
    if (widgetRef.current) {
      try {
        widgetRef.current.setVolume(newVol);
      } catch (e) {
        console.warn("Widget volume set failed", e);
      }
    }
  };

  const iframeSrc = React.useMemo(() => getEmbedUrl(currentUrl, isPlaying), [currentUrl]);

  // --- DERIVED UI STATES (already defined above) ---

  return (
    <div className="bg-[#080809]/90 backdrop-blur-3xl text-white shadow-2xl h-full w-full flex flex-col border border-white/5 overflow-hidden font-sans relative sm:rounded-[40px] rounded-[32px]">
      {/* Invisible embedding of SoundCloud API optimized to prevent iOS Safari/Android active viewport suspension */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-[-1] opacity-0">
        <iframe
          id="sc-iframe"
          src={initialIframeUrl}
          allow="autoplay; encrypted-media"
          className="w-[300px] h-[300px]"
        />
        <audio
          ref={silentAudioRef}
          loop
          playsInline
          preload="auto"
          src="data:audio/wav;base64,UklGRqAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8Pw=="
          className="hidden"
        />
      </div>
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
              Bienve App Music
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border text-[10px] font-black uppercase cursor-pointer ${
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
                                {/* Inner Gloss Sheen Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                
                                <span className="relative z-10 shrink-0 select-none filter drop-shadow flex items-center justify-center">
                                    {pl.icon && pl.icon !== "📂" && pl.icon !== "📁" && pl.icon !== "🎵" ? (
                                        pl.icon
                                    ) : (
                                        <Headphones className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
                                    )}
                                </span>
 
                                {/* Hover Play Indicator Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-white scale-90 group-hover:scale-100 transition-transform duration-300" />
                                </div>
                            </div>
 
                            {/* Info */}
                            <div className="min-w-0 text-center md:text-left">
                                <p className={`text-[9px] md:text-[11px] font-black truncate leading-tight max-w-[70px] md:max-w-[130px] ${
                                  isSelected ? 'text-emerald-400 font-extrabold' : 'text-slate-400 group-hover:text-white'
                                }`}>
                                    {pl.name}
                                </p>
                                <p className="hidden md:block text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                    {pl.tracks.length} {pl.tracks.length === 1 ? 'Pista' : 'Pistas'}
                                </p>
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
        <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden bg-[#070708]">
            
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
                        {isPlaying && (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute -inset-1.5 bg-emerald-500/20 blur-md rounded-full pointer-events-none"
                          />
                        )}
                      </AnimatePresence>
                      <motion.div
                        animate={{ 
                          rotate: isPlaying ? 360 : 0,
                          scale: isPlaying ? [1, 1.02, 1] : 1
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-2xl border-2 transition-colors duration-500 ${isPlaying ? "border-emerald-500/50 shadow-emerald-500/20" : "border-white/10 shadow-black/40"}`}
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
                      </motion.div>
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
                      <div className="flex flex-col items-center gap-1 px-1.5 py-1 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                        {/* Plus (Up) */}
                        <button
                          onClick={() => handleVolumeChange(Math.min(100, volume + 10))}
                          className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-white/10 active:scale-90 rounded-full transition-all flex-shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        
                        {/* Status (Middle) */}
                        <div className="flex flex-col items-center gap-0.5 justify-center select-none overflow-hidden py-0.5">
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500/70" />
                          <span className="text-[9px] sm:text-[11px] font-mono font-bold text-emerald-400 leading-none">
                            {volume}%
                          </span>
                        </div>

                        {/* Minus (Down) */}
                        <button
                          onClick={() => handleVolumeChange(Math.max(0, volume - 10))}
                          className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-white/10 active:scale-90 rounded-full transition-all flex-shrink-0"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
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
                <div className="flex items-center justify-between w-full">
                  <div className="space-y-0.5 text-left">
                    <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                      LISTA DE REPRODUCCIÓN
                      <span className="px-1.5 py-0.5 rounded pl-1 bg-emerald-500/10 text-[7px] text-emerald-400">
                        {displayTracks.length} PISTAS
                      </span>
                    </p>
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-[240px]">
                      {selectedPlaylist.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Disc className="w-4 h-4 text-emerald-500/20 animate-spin-slow shrink-0" />
                  </div>
                </div>

                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar canción o artista..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#111113] border border-white/5 rounded-full py-1.5 pl-9 pr-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-[#030303]">
                <div className="flex-1 overflow-y-auto p-1 sm:p-3 space-y-0 premium-scrollbar">
                  {filteredDisplayTracks.length === 0 ? (
                    <div className="p-8 text-center text-white/30 text-xs font-medium">
                      No se encontraron resultados para "{searchQuery}"
                    </div>
                  ) : (
                    filteredDisplayTracks.map(({ track, idx }) => {
                      const isActive = displayTrackIndex === idx;
                      return (
                        <button
                          key={track.id || idx}
                        onClick={() => {
                          if (silentAudioRef.current) {
                            silentAudioRef.current.play().catch(() => {});
                          }
                          expectedPlayingRef.current = true;
                          if (isActive && hasInitializedWidget && widgetRef.current) {
                            if (!isPlaying) {
                               widgetRef.current.play();
                            }
                          } else {
                            if (engineTracks.length > 0) {
                              userSkippedRef.current = true;
                              widgetRef.current?.skip(idx);
                              widgetRef.current?.play();
                            } else {
                              setCurrentTrackIndex(idx);
                            }
                          }
                          setIsPlaying(true);
                        }}
                        className={`group/track w-full flex items-center gap-3 sm:gap-6 px-3 py-1.5 sm:px-6 sm:py-3 transition-all text-left relative overflow-hidden rounded-xl sm:rounded-2xl ${
                          isActive
                            ? "bg-white/[0.08]"
                            : "bg-transparent hover:bg-white/[0.04]"
                        }`}
                      >
                        {/* Track Number & Hover/Active States (Spotify Style) */}
                        <div className="hidden sm:flex items-center justify-center w-8 shrink-0 relative z-10">
                          {/* Default Track Number */}
                          <span className={`text-[13px] font-medium transition-opacity duration-200 ${
                            isActive ? "opacity-0 text-emerald-400" : "opacity-100 group-hover/track:opacity-0 text-slate-400"
                          }`}>
                            {idx + 1}
                          </span>
                          
                          {/* Play/Pause/EQ Icon overlay */}
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                            isActive ? "opacity-100" : "opacity-0 group-hover/track:opacity-100"
                          }`}>
                             {isActive && isPlaying ? (
                                <div className="flex gap-[2px] items-end h-[12px] shrink-0">
                                  {[...Array(3)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ height: [3, 12, 3] }}
                                      transition={{ duration: 0.45 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                                      className="w-[2px] bg-emerald-400 rounded-full"
                                    />
                                  ))}
                                </div>
                             ) : (
                                <Play className={`w-4 h-4 ml-0.5 fill-current ${isActive ? "text-emerald-400" : "text-white"}`} />
                             )}
                          </div>
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-md flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                          {track.artwork_url || track.thumbnail || track.artwork ? (
                            <img src={track.artwork_url || track.thumbnail || track.artwork} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                          )}
                          
                          {/* Mobile Play Overlay (since number is hidden on mobile) */}
                          <div className={`sm:hidden absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover/track:opacity-100'}`}>
                             {isActive && isPlaying ? (
                                <div className="flex gap-[2px] items-end h-[12px] shrink-0">
                                  {[...Array(3)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      animate={{ height: [3, 12, 3] }}
                                      transition={{ duration: 0.45 + i * 0.1, repeat: Infinity }}
                                      className="w-[2px] bg-emerald-400 rounded-full"
                                    />
                                  ))}
                                </div>
                             ) : (
                                <Play className="w-5 h-5 ml-0.5 fill-white" />
                             )}
                          </div>
                        </div>
                        
                        {/* Track Info */}
                        <div className="flex-1 min-w-0 pr-4 relative z-10 flex flex-col justify-center">
                          <p className={`text-[13px] sm:text-[15px] font-medium truncate leading-tight transition-colors duration-200 ${
                            isActive ? "text-emerald-400" : "text-white"
                          }`}>
                            {track.title}
                          </p>
                          <p className={`text-[11px] sm:text-[13px] font-normal truncate mt-0.5 transition-colors duration-200 ${
                            isActive ? "text-emerald-500/80" : "text-slate-400 group-hover/track:text-white"
                          }`}>
                            {track.artist || track.author || "Unknown Artist"}
                          </p>
                        </div>
    
                        {/* Duration / Options */}
                        <div className="hidden sm:flex items-center gap-4 shrink-0 relative z-10 text-[12px] font-medium text-slate-400">
                          {track.duration && (
                             <span className="w-10 text-right group-hover/track:text-white transition-colors">
                               {track.duration}
                             </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                  )}
                </div>

                <div className="p-3.5 bg-[#050505] border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase text-slate-500 tracking-widest shrink-0">
                  <span>Total de canciones: {displayTracks.length || 0}</span>
                  <span className="text-emerald-500">Bienve Engine Premium</span>
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
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                        <span className="relative z-10 shrink-0 select-none filter drop-shadow flex items-center justify-center">
                          {pl.icon && pl.icon !== "📂" && pl.icon !== "📁" && pl.icon !== "🎵" ? (
                            pl.icon
                          ) : (
                            <Headphones className="w-6 h-6 text-white/90" />
                          )}
                        </span>
                        
                        {/* Indicador de pistas flotante */}
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[7px] font-black text-white/80 uppercase">
                          {pl.tracks.length} P
                        </div>
                      </div>
                      
                      <div className="flex-1 mt-1 overflow-hidden">
                        <p className="text-[10px] font-black truncate uppercase tracking-tight text-white/90">
                          {pl.name}
                        </p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase truncate tracking-widest mt-0.5 opacity-50">
                          {pl.description || "Archive"}
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
                      {addStep === 'auth' ? 'Verificación de Identidad' : 'Pegar Enlace SoundCloud'}
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
                    <div className="space-y-5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 block">
                        URL de la Playlist / Canción
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="https://soundcloud.com/usuario/sets/playlist"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          disabled={isFetchingMeta}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddPlaylist()}
                          className="w-full bg-black/40 border border-white/5 group-hover:border-emerald-500/30 rounded-[30px] px-8 py-6 text-sm outline-none focus:border-emerald-500/50 focus:bg-black/60 transition-all font-medium pr-16 shadow-inner"
                          autoFocus
                        />
                        <div className="absolute right-7 top-1/2 -translate-y-1/2">
                          <Sparkles className={`w-5 h-5 transition-all ${customUrl ? 'text-emerald-500 animate-pulse' : 'text-slate-700'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleAddPlaylist}
                        disabled={isFetchingMeta || !customUrl}
                        className="w-full bg-emerald-500 text-black py-6 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-white hover:shadow-white/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-4 group"
                      >
                        {isFetchingMeta ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            Completar Sincronización
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
