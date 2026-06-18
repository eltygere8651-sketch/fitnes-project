import React, { useState, useEffect, useRef, useCallback } from "react";
import { Carousel } from "./Carousel";
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
  Maximize2,
  Minimize2,
  Sparkles,
  Disc,
  Plus,
  Minus,
  Edit2,
  Trash2,
  X,
  Loader2, Bug, Radio,
  Send,
  MessageSquare,
  Shuffle,
  Repeat,
  Shield,
  ShieldAlert,
  LogOut,
  Heart,
  LogIn,
  Headphones,
  Save,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  ListPlus,
  Compass,
  PlusCircle,
  LayoutGrid,
  FolderPlus,
  FolderMinus,
  Folder,
  ChevronRight,
  Check,
  BadgeCheck,
  Bookmark,
  Trophy,
  Download,
  Users,
  User,
  Library,
  FileText,
  Tv,
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
  getDocs,
  getDoc,
  where,
  setDoc,
  limit,
} from "firebase/firestore";
import { db, loginWithGoogle, logout } from "../lib/firebase";
import { useFirebase } from "./FirebaseProvider";
import { MusicPlaylist, MusicTrack } from "../types";
import { 
  recordTrackPlay, 
  recordTrackSkip, 
  getTasteDiagnostics, 
  getMusicRecommendations, 
  getPlayHistory,
  TasteDiagnostics, 
  RecommendedTrack 
} from "../lib/recommendationEngine";
import { UserManagementAdmin } from "./UserManagementAdmin";
import { ExploreView } from "./ExploreView";
import { PodcastView } from "./PodcastView";
import { UserProfileModal } from "./UserProfileModal";

const COVER_THEMES = [
  {
    name: "Cyberpunk Pulse",
    bgStart: "#0a0519", bgEnd: "#140a28",
    glowColor: "#ff007f", accentColor: "#00ffff",
    grid: true, radial: true, rings: "concentric"
  },
  {
    name: "Golden Retro",
    bgStart: "#140f05", bgEnd: "#2d1e0a",
    glowColor: "#ffaa00", accentColor: "#ff3300",
    grid: false, radial: true, rings: "solar"
  },
  {
    name: "Emerald Synthwave",
    bgStart: "#050f0a", bgEnd: "#0f1914",
    glowColor: "#1ED760", accentColor: "#00f5ff",
    grid: true, radial: false, rings: "waves"
  },
  {
    name: "Electric Chill",
    bgStart: "#060b1e", bgEnd: "#121b3a",
    glowColor: "#3b82f6", accentColor: "#8b5cf6",
    grid: true, radial: true, rings: "spherical"
  },
  {
    name: "Crimson Brutalist",
    bgStart: "#1a0505", bgEnd: "#2c0c0c",
    glowColor: "#ef4444", accentColor: "#f97316",
    grid: false, radial: false, rings: "brutalist"
  }
];

const generateSVGDataURI = (title: string, themeIndex: number) => {
  const theme = COVER_THEMES[themeIndex % COVER_THEMES.length];
  const cleanedTitle = (title || "").trim();
  let initials = "MX";
  if (cleanedTitle) {
    const words = cleanedTitle.split(/\s+/);
    if (words.length >= 2) {
      initials = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words[0] && words[0].length >= 2) {
      initials = words[0].substring(0, 2).toUpperCase();
    } else if (words[0]) {
      initials = words[0][0].toUpperCase() + "X";
    }
  }

  const gridLine = theme.grid ? `
    <pattern id="grid" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.7"/>
    </pattern>
    <rect width="100%" height="100%" fill="url(#grid)" />
  ` : "";

  let ringsGraphic = "";
  if (theme.rings === "concentric") {
    ringsGraphic = `
      <circle cx="200" cy="200" r="140" fill="none" stroke="${theme.glowColor}" stroke-dasharray="4,8" stroke-width="1" opacity="0.4"/>
      <circle cx="200" cy="200" r="110" fill="none" stroke="${theme.accentColor}" stroke-dasharray="1,5" stroke-width="2" opacity="0.6"/>
      <circle cx="200" cy="200" r="80" fill="none" stroke="${theme.glowColor}" stroke-width="1.5" opacity="0.3"/>
    `;
  } else if (theme.rings === "solar") {
    ringsGraphic = `
      <circle cx="200" cy="200" r="120" fill="none" stroke="${theme.glowColor}" stroke-width="4" opacity="0.15"/>
      <circle cx="200" cy="240" r="90" fill="none" stroke="${theme.accentColor}" stroke-width="3" opacity="0.3"/>
      <line x1="80" y1="200" x2="320" y2="200" stroke="${theme.glowColor}" stroke-width="2" opacity="0.4"/>
      <line x1="80" y1="220" x2="320" y2="220" stroke="${theme.accentColor}" stroke-width="1" opacity="0.3"/>
    `;
  } else if (theme.rings === "waves") {
    ringsGraphic = `
      <path d="M 60 200 Q 130 140 200 200 T 340 200" fill="none" stroke="${theme.glowColor}" stroke-width="2" opacity="0.5"/>
      <path d="M 60 220 Q 130 160 200 220 T 340 220" fill="none" stroke="${theme.accentColor}" stroke-width="1.5" opacity="0.4"/>
      <path d="M 60 180 Q 130 120 200 180 T 340 180" fill="none" stroke="${theme.accentColor}" stroke-width="1" opacity="0.3"/>
    `;
  } else if (theme.rings === "spherical") {
    ringsGraphic = `
      <circle cx="200" cy="200" r="90" fill="none" stroke="${theme.glowColor}" stroke-width="1" opacity="0.5"/>
      <ellipse cx="200" cy="200" rx="90" ry="30" fill="none" stroke="${theme.accentColor}" stroke-width="1.5" opacity="0.6" transform="rotate(30, 200, 200)"/>
      <ellipse cx="200" cy="200" rx="90" ry="30" fill="none" stroke="${theme.accentColor}" stroke-width="1.5" opacity="0.4" transform="rotate(-30, 200, 200)"/>
    `;
  } else {
    ringsGraphic = `
      <rect x="70" y="70" width="260" height="260" fill="none" stroke="${theme.accentColor}" stroke-width="1.5" opacity="0.3"/>
      <line x1="50" y1="50" x2="350" y2="350" stroke="${theme.glowColor}" stroke-width="1" opacity="0.3" />
      <line x1="350" y1="50" x2="50" y2="350" stroke="${theme.glowColor}" stroke-width="1" opacity="0.3" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.bgStart}"/>
          <stop offset="100%" stop-color="${theme.bgEnd}"/>
        </linearGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${theme.glowColor}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${theme.glowColor}" stop-opacity="0"/>
        </radialGradient>
        <filter id="neonFilter">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <rect width="400" height="400" fill="url(#bgGrad)"/>
      
      ${theme.radial ? `<circle cx="200" cy="200" r="180" fill="url(#glowGrad)"/>` : ""}
      
      ${gridLine}
      
      <g>
        ${ringsGraphic}
      </g>
      
      <g filter="url(#neonFilter)">
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="76" fill="#ffffff" letter-spacing="2">
          ${initials}
        </text>
      </g>
      
      <text x="24" y="376" font-family="monospace" font-size="9" font-weight="bold" fill="${theme.accentColor}" letter-spacing="1" opacity="0.8">
        FLUX AUDIO STUDIO
      </text>
      <text x="376" y="376" font-family="monospace" font-size="9" font-weight="bold" fill="#ffffff" letter-spacing="1" opacity="0.5" text-anchor="end">
        PRESET v1.0
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const sanitizeOwnerName = (nameOrEmail?: string) => {
  if (!nameOrEmail) return "Socio Premium";
  const str = String(nameOrEmail).trim();
  if (str.includes("@")) {
    return str.split("@")[0];
  }
  return str;
};

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

const getPlaylistGenre = (pl: MusicPlaylist) => {
  if (pl.genre && pl.genre !== "Personalizado" && pl.genre !== "Siguiente" && pl.genre !== "general") {
    return pl.genre;
  }
  const name = (pl.name || "").toLowerCase();
  if (name.includes("reggaeton") || name.includes("perreo") || name.includes("flow") || name.includes("bad bunny") || name.includes("ozuna") || name.includes("dy") || name.includes("fresca") || name.includes("caliente")) {
    return "Reggaetón / Urbano";
  }
  if (name.includes("dembow") || name.includes("el alfa") || name.includes("chiman") || name.includes("dominicano")) {
    return "Dembow / Dominicano";
  }
  if (name.includes("electro") || name.includes("house") || name.includes("tech") || name.includes("dance") || name.includes("edm") || name.includes("electronic") || name.includes("techno") || name.includes("workout") || name.includes("gym") || name.includes("entreno") || name.includes("power")) {
    return "Electro / EDM";
  }
  if (name.includes("salsa") || name.includes("merengue") || name.includes("bachata") || name.includes("latin") || name.includes("tropical") || name.includes("caribe")) {
    return "Tropical Latino";
  }
  if (name.includes("adoni") || name.includes("mix")) {
    return "Super Mix / Adoni";
  }
  if (name.includes("martina") || name.includes("cumple") || name.includes("birthday")) {
    return "Fiesta / Cumpleaños";
  }
  if (name.includes("rock") || name.includes("metal") || name.includes("hard")) {
    return "Rock entreno / Metal";
  }
  if (name.includes("chill") || name.includes("relax") || name.includes("suave") || name.includes("calm")) {
    return "Chillout / Cardio";
  }
  if (pl.tracks && pl.tracks.length > 0) {
    const trackArtist = (pl.tracks[0].artist || "").toLowerCase();
    if (trackArtist.includes("bad bunny") || trackArtist.includes("rauw") || trackArtist.includes("karol") || trackArtist.includes("feid") || trackArtist.includes("anuel")) {
      return "Reggaetón / Urbano";
    }
    if (trackArtist.includes("tiësto") || trackArtist.includes("guetta") || trackArtist.includes("garrix") || trackArtist.includes("avicii") || trackArtist.includes("calvin")) {
      return "Electro / Dance";
    }
  }
  return "Flux Music";
};

const getPlaylistPopularity = (pl: MusicPlaylist) => {
  const idStr = pl.id || pl.name || "flux";
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const ratingVal = (4.7 + (absHash % 3) * 0.1).toFixed(1);
  const scoreVal = 92 + (absHash % 8);
  return { rating: ratingVal, score: scoreVal };
};

const getPlaylistPlays = (pl: MusicPlaylist) => {
  const idStr = pl.id || pl.name || "flux";
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const trackFactor = pl.tracks ? pl.tracks.length * 153 : 240;
  const basePlays = (absHash % 2500) + 1240 + trackFactor;
  
  let extraPlays = 0;
  try {
    const storedPlays = localStorage.getItem("flux_playlist_playbacks");
    if (storedPlays) {
      const playsMap = JSON.parse(storedPlays);
      extraPlays = playsMap[pl.id] || 0;
    }
  } catch (e) {
    console.warn(e);
  }

  const finalPlays = basePlays + extraPlays * 45;
  if (finalPlays > 1000) {
    return `${(finalPlays / 1000).toFixed(1)}k`;
  }
  return String(finalPlays);
};

const getPlaylistSaves = (pl: MusicPlaylist, userPlaylists: MusicPlaylist[], user: any) => {
  const idStr = pl.id || pl.name || "flux";
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const trackFactor = pl.tracks ? pl.tracks.length * 4 : 5;
  const baseSaves = (absHash % 250) + 75 + trackFactor;
  
  const isSavedByCurUser = userPlaylists.some(p => p.ownerId === user?.uid && p.name === pl.name);
  const finalSaves = baseSaves + (isSavedByCurUser ? 1 : 0);
  
  return finalSaves;
};

const getTrackImage = (track?: MusicTrack): string | null => {
  if (!track) return null;
  if (track.thumbnail) return track.thumbnail;
  if (track.artwork_url) return track.artwork_url;
  if (track.artwork) return track.artwork;
  if (track.url && (track.url.includes('youtube.com') || track.url.includes('youtu.be'))) {
    const match = track.url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
    if (match && match[1]) {
      return `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg`;
    }
  }
  if (track.id?.startsWith('yt_')) {
    const vid = track.id.split('_')[1];
    if (vid) return `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`;
  }
  return null;
};

export default function GymMusicPlayer() {
  const isIOS = typeof window !== 'undefined' && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const { user, loading: authLoading, setAuthModalOpen, accessData, logout } = useFirebase();
  
  const [trialRequestStatus, setTrialRequestStatus] = useState<"idle" | "sent" | "already_claimed">("idle");
  const [isCheckingTrialRequest, setIsCheckingTrialRequest] = useState(false);
  const [trialRequestMsg, setTrialRequestMsg] = useState<string | null>(null);

  const getBrowserFingerprint = () => {
    let token = localStorage.getItem("flux_device_token");
    if (!token) {
      // Create a stable local device ID since Brave/Safari can randomize or block canvas fingerprinting
      token = "dev_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2);
      localStorage.setItem("flux_device_token", token);
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return token;
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125,1,62,20);
      ctx.fillStyle = "#069";
      ctx.fillText("FluxPlayer!_Fingerprint", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("FluxPlayer!_Fingerprint", 4, 17);
      const res = canvas.toDataURL();
      let hash = 0;
      for (let i = 0; i < res.length; i++) {
        hash = (hash << 5) - hash + res.charCodeAt(i);
        hash |= 0;
      }
      return "fp_" + Math.abs(hash).toString(36) + "_" + token;
    } catch (e) {
      return token;
    }
  };

  useEffect(() => {
    if (user) {
      checkTrialStatus();
    }
  }, [user]);

  const checkTrialStatus = async () => {
    if (!user) return;
    try {
      setIsCheckingTrialRequest(true);
      const fp = getBrowserFingerprint();
      
      const requestsRef = collection(db, "trial_requests");
      const q = query(requestsRef, where("uid", "==", user.uid));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        const reqDoc = snap.docs[0].data();
        if (reqDoc.status === "pending") {
          setTrialRequestStatus("sent");
          setTrialRequestMsg("Tu solicitud de prueba de 7 días está pendiente de aprobación por el administrador.");
        } else if (reqDoc.status === "approved" || (accessData && accessData.trialStart)) {
          setTrialRequestStatus("already_claimed");
          setTrialRequestMsg("Ya has disfrutado de tu prueba gratuita de 7 días.");
        } else if (reqDoc.status === "rejected") {
          setTrialRequestStatus("already_claimed");
          setTrialRequestMsg("Tu solicitud de prueba de 7 días fue declinada por el administrador.");
        }
        setIsCheckingTrialRequest(false);
        return;
      }

      const fpQuery = query(requestsRef, where("fingerprint", "==", fp));
      const fpSnap = await getDocs(fpQuery);
      if (!fpSnap.empty) {
        setTrialRequestStatus("already_claimed");
        setTrialRequestMsg("Acceso Denegado: Ya se ha solicitado una prueba de 7 días desde este dispositivo.");
        setIsCheckingTrialRequest(false);
        return;
      }
      
      setTrialRequestStatus("idle");
      setIsCheckingTrialRequest(false);
    } catch (err) {
      console.error("Error checking trial status:", err);
      setIsCheckingTrialRequest(false);
    }
  };

  const handleRequestTrial = async () => {
    if (!user) return;
    try {
      setIsCheckingTrialRequest(true);
      const fp = getBrowserFingerprint();
      
      const apiRes = await fetch("/api/trial/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "Socio Premium",
          fingerprint: fp
        })
      });
      
      let clientIp = "IP_DETECTOR_FAILED";
      if (apiRes.ok) {
        const json = await apiRes.json();
        clientIp = json.clientIp || "N/A";
      }

      if (clientIp !== "IP_DETECTOR_FAILED" && clientIp !== "127.0.0.1" && clientIp !== "::1") {
        const ipQuery = query(collection(db, "trial_requests"), where("ip", "==", clientIp));
        const ipSnap = await getDocs(ipQuery);
        if (!ipSnap.empty) {
          setTrialRequestStatus("already_claimed");
          setTrialRequestMsg("Acceso Denegado: Su dirección IP ya ha sido utilizada para activar una cuenta de prueba.");
          setIsCheckingTrialRequest(false);
          return;
        }
      }

      const reqId = user.uid;
      await setDoc(doc(db, "trial_requests", reqId), {
        uid: user.uid,
        email: user.email || "anon",
        displayName: user.displayName || "Socio Premium",
        fingerprint: fp,
        ip: clientIp,
        status: "pending",
        createdAt: Date.now()
      });
      
      // Notify Admin via Telegram
      try {
        const _tgDoc = await getDoc(doc(db, "system_settings", "telegram"));
        const _tgData = _tgDoc.data();
        await fetch("/api/support/telegram-trial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.displayName,
            botTokenOverride: _tgData?.botToken,
            chatIdOverride: _tgData?.chatId
          })
        });
      } catch (e) {
        console.error("Failed to notify admin via telegram:", e);
      }
      
      setTrialRequestStatus("sent");
      setTrialRequestMsg("¡Solicitud enviada! El administrador ha sido notificado y la aprobará manualmente pronto.");
      setIsCheckingTrialRequest(false);
    } catch (err) {
      console.error("Error requesting trial:", err);
      alert("No se pudo enviar la solicitud. Inténtalo de nuevo.");
      setIsCheckingTrialRequest(false);
    }
  };

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

  // Auto-sync Telegram credentials to backend on load for instant support delivery
  useEffect(() => {
    if (isAdmin && user) {
      const syncTelegram = async () => {
        try {
          const docRef = doc(db, "system_settings", "telegram");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data?.botToken && data?.chatId) {
              await fetch("/api/support/register-telegram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  botToken: data.botToken.trim(),
                  chatId: data.chatId.trim(),
                  adminEmail: "eltygere8651@gmail.com"
                })
              });
              console.log("Successfully synchronized Telegram support credentials on backend.");
            }
          }
        } catch (err) {
          console.error("Auto-syncing Telegram specs with backend failed (expected if non-admin or disconnected):", err);
        }
      };
      
      syncTelegram();
    }
  }, [isAdmin, user]);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<MusicPlaylist | null>(null);
  const [playingPlaylist, setPlayingPlaylist] = useState<MusicPlaylist | null>(null);
  const [isTracklistOpen, setIsTracklistOpen] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isMembershipDropdownOpen, setIsMembershipDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };
  
  useEffect(() => {
    if (user && !authLoading) {
      const name = user.displayName;
      if (!name || name.includes("@") || name === "Usuario") {
        setShowNicknameModal(true);
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    const handleOpenSupport = () => setIsSupportModalOpen(true);
    window.addEventListener('open-support', handleOpenSupport);
    return () => window.removeEventListener('open-support', handleOpenSupport);
  }, []);

  useEffect(() => {
    const handleOpenAdmin = () => setIsAdminPanelOpen(true);
    window.addEventListener('open-admin-panel', handleOpenAdmin);
    return () => window.removeEventListener('open-admin-panel', handleOpenAdmin);
  }, []);

  useEffect(() => {
    const handleOpenProfile = () => setIsProfileModalOpen(true);
    window.addEventListener('open-profile-modal', handleOpenProfile);
    return () => window.removeEventListener('open-profile-modal', handleOpenProfile);
  }, []);

  useEffect(() => {
    const handleOpenChangelog = () => {
      window.dispatchEvent(new Event('open-notifications'));
    };
    window.addEventListener('open-changelog', handleOpenChangelog);
    return () => window.removeEventListener('open-changelog', handleOpenChangelog);
  }, []);

  const handleSaveNickname = async () => {
    if (!user || !nicknameInput.trim()) return;
    try {
      const { updateProfile } = await import("firebase/auth");
      await updateProfile(user, { displayName: nicknameInput.trim() });
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { displayName: nicknameInput.trim() });
      setShowNicknameModal(false);
      window.location.reload();
    } catch (e) {
      console.error("Error setting nickname", e);
    }
  };

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const saved = localStorage.getItem("gym_music_current_track_index");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<MusicPlaylist[]>([]);
  
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  
  // Spotify-style playlist copier states
  const [playlistToCopy, setPlaylistToCopy] = useState<MusicPlaylist | null>(null);
  const [targetPlaylistIdForCopy, setTargetPlaylistIdForCopy] = useState<string>("new");
  const [copyPlaylistNameInput, setCopyPlaylistNameInput] = useState<string>("");
  const [copyPlaylistDescInput, setCopyPlaylistDescInput] = useState<string>("");
  const [isProcessingCopy, setIsProcessingCopy] = useState<boolean>(false);

  const [currentTrackMeta, setCurrentTrackMeta] = useState<any>(null);
  const [mobileView, setMobileView] = useState<'playlists' | 'player'>('player');

  const [showLibrary, setShowLibrary] = useState(false);
  const [searchSubTab, setSearchSubTab] = useState<"novedades" | "charts" | "moods">("novedades");
  const [isTrackListExpanded, setIsTrackListExpanded] = useState<boolean>(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [previewPlaylist, setPreviewPlaylist] = useState<MusicPlaylist | null>(null);
  const [folderExpanded, setFolderExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("gym_music_folder_expanded");
    return saved !== "false";
  });
  const [localFoldersMap, setLocalFoldersMap] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("gym_music_local_folders_map");
    return saved ? JSON.parse(saved) : {};
  });
  const [showTracks, setShowTracks] = useState(true);
  // --- Single Session Enforcer ---
  const myDeviceIdRef = useRef<string>("");
  const [sessionHijacked, setSessionHijacked] = useState(false);

  useEffect(() => {
    let initial = localStorage.getItem("flux_device_id");
    if (!initial) {
      initial = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("flux_device_id", initial);
    }
    myDeviceIdRef.current = initial;
  }, []);

  useEffect(() => {
    if (isPlaying && user && accessData && accessData.maxUsers === 1 && !isAdmin) {
      if (accessData.activeSessionId !== myDeviceIdRef.current) {
         import("firebase/firestore").then(({ doc, updateDoc }) => {
            import("../lib/firebase").then(({ db }) => {
               updateDoc(doc(db, "users", user.uid), { activeSessionId: myDeviceIdRef.current }).catch(() => {});
            });
         });
      }
    }
  }, [isPlaying, user, accessData?.maxUsers, accessData?.activeSessionId, isAdmin]);

  useEffect(() => {
    if (user && accessData && accessData.maxUsers === 1 && !isAdmin) {
      if (accessData.activeSessionId && accessData.activeSessionId !== myDeviceIdRef.current) {
        if (isPlaying) {
          setIsPlaying(false);
          setSessionHijacked(true);
        }
      }
    }
  }, [accessData?.activeSessionId, isPlaying, user, accessData?.maxUsers, isAdmin]);

  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
  const [isSearchingYT, setIsSearchingYT] = useState(false);
  const [exploreData, setExploreData] = useState<{
    trending?: any[];
    dailyTop?: any[];
    top100?: any[];
    top20Tendencias?: any[];
    dailyTopPlaylists?: any[];
    workout?: any[];
    focus?: any[];
    trends?: any[];
    latin?: any[];
    party?: any[];
  } | null>(null);
  const [isLoadingExplore, setIsLoadingExplore] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem("gym_music_selected_country") || "ES";
  });
  
  // Expanded playlist/mix tracks viewer states
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [expandedPlaylistTracks, setExpandedPlaylistTracks] = useState<any[]>([]);
  const [isFetchingExpandedTracks, setIsFetchingExpandedTracks] = useState<boolean>(false);

  // New intuitive track/playlist placement modal states
  const [trackToAddDestination, setTrackToAddDestination] = useState<any | null>(null);
  const [isAddingToPlaylistModalOpen, setIsAddingToPlaylistModalOpen] = useState(false);
  const [modalNewPlaylistName, setModalNewPlaylistName] = useState("");
  const [modalNewPlaylistDesc, setModalNewPlaylistDesc] = useState("");
  const [modalSelectedPlaylistId, setModalSelectedPlaylistId] = useState<string>("new");
  const [isProcessingModalAdd, setIsProcessingModalAdd] = useState(false);

  // States for Telegram Support integration
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [supportCategory, setSupportCategory] = useState<"soporte" | "fallo" | "feedback">("soporte");
  const [isSendingSupport, setIsSendingSupport] = useState(false);



  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingCover, setEditingCover] = useState("");
  const [editingTrack, setEditingTrack] = useState<MusicTrack | null>(null);
  const [editingTrackTitle, setEditingTrackTitle] = useState("");
  const [editingTrackArtist, setEditingTrackArtist] = useState("");
  const [editingTrackDescription, setEditingTrackDescription] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [trackToDeleteConfirm, setTrackToDeleteConfirm] = useState<MusicTrack | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [trackQueue, setTrackQueue] = useState<MusicTrack[]>([]);
  const [trackListTab, setTrackListTab] = useState<"playlist" | "search" | "queue" | "entertainment">("search");
  const [playerTab, setPlayerTab] = useState<"artwork" | "siguiente" | "cola">("artwork");
  const trackQueueRef = useRef<MusicTrack[]>([]);
  
  useEffect(() => {
    trackQueueRef.current = trackQueue;
  }, [trackQueue]);

  useEffect(() => {
    if (!showLibrary) {
      setPreviewPlaylist(null);
    }
  }, [showLibrary]);

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
    if (isEcoMode) return;
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

  // Document Visibility & Screen Unlock Event handling to synchronize playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (youtubePlayerRef.current) {
          try {
            const currentSec = youtubePlayerRef.current.getCurrentTime() || 0;
            setPosition(currentSec * 1000);
          } catch(e) {}
        }
        if (isPlaying) {
          // Re-establish Screen Wake Lock
          requestWakeLock();

          // Resynchronize and play YouTube player if it got suspended/paused by iOS screen lock
          if (youtubePlayerRef.current) {
            try {
              const intPlayer = youtubePlayerRef.current.getInternalPlayer();
              if (intPlayer && typeof intPlayer.getPlayerState === "function") {
                const state = intPlayer.getPlayerState();
                // Only force play if not already playing (1) or buffering (3)
                if (state !== 1 && state !== 3) {
                  if (typeof intPlayer.playVideo === "function") {
                    intPlayer.playVideo();
                  } else if (typeof intPlayer.play === "function") {
                    intPlayer.play();
                  }
                }
              } else {
                if (intPlayer && typeof intPlayer.playVideo === "function") {
                  intPlayer.playVideo();
                } else if (intPlayer && typeof intPlayer.play === "function") {
                  intPlayer.play();
                }
              }
            } catch (err) {
              console.warn("Resync player error:", err);
            }
          }
        }
      } else if (document.hidden) {
        if (isIOS && isPlaying) {
          if (fallbackSilentAudioRef.current && fallbackSilentAudioRef.current.paused) {
            fallbackSilentAudioRef.current.play().catch(() => {});
          }
          if (youtubePlayerRef.current) {
            try {
              const intPlayer = youtubePlayerRef.current.getInternalPlayer();
              if (intPlayer && typeof intPlayer.playVideo === "function") {
                intPlayer.playVideo();
              } else if (intPlayer && typeof intPlayer.play === "function") {
                intPlayer.play();
              }
            } catch (err) {}
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

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
  const [isShuffle, setIsShuffle] = useState(() => {
    const saved = localStorage.getItem("gym_music_is_shuffle");
    return saved === "true";
  });
  const [isRepeat, setIsRepeat] = useState(() => {
    const saved = localStorage.getItem("gym_music_is_repeat");
    return saved === "true";
  });
  const isShuffleRef = useRef(isShuffle);

  // Refs for snapshot syncing to avoid React closure stale state
  const playingPlaylistRef = useRef<MusicPlaylist | null>(null);
  const selectedPlaylistRef = useRef<MusicPlaylist | null>(null);
  const currentTrackIndexRef = useRef<number>(0);

  useEffect(() => {
    playingPlaylistRef.current = playingPlaylist;
    selectedPlaylistRef.current = selectedPlaylist;
    currentTrackIndexRef.current = currentTrackIndex;
  }, [playingPlaylist, selectedPlaylist, currentTrackIndex]);
  useEffect(() => { 
    isShuffleRef.current = isShuffle; 
    localStorage.setItem("gym_music_is_shuffle", isShuffle.toString());
  }, [isShuffle]);

  useEffect(() => {
    localStorage.setItem("gym_music_is_repeat", isRepeat.toString());
  }, [isRepeat]);

  const youtubePlayerRef = useRef<any>(null);
  const fallbackSilentAudioRef = useRef<HTMLAudioElement>(null);
  const expectedPlayingRef = useRef(false);
  const initialLoadRef = useRef(true);
  const lastPosSaveRef = useRef(0);
  const wasUnexpectedlyPausedRef = useRef(false);
  const playlistsLoadedInitiallyRef = useRef(false);
  
  // Intelligent gapless playback (SponsorBlock Integration)
  const sponsorBlockSegmentsRef = useRef<{start: number, end: number, actionType: string}[]>([]);
  const skipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hardware Media Keys fallback listener (Handles Bluetooth steering wheel events that translate to DOM keydowns)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      
      if (e.key === "MediaTrackNext") {
        e.preventDefault();
        handlersRef.current.handleNext();
      } else if (e.key === "MediaTrackPrevious") {
        e.preventDefault();
        handlersRef.current.handlePrev();
      } else if (e.key === "MediaPlayPause") {
        e.preventDefault();
        handlersRef.current.togglePlayback();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Network Recovery Effect
  useEffect(() => {
    const handleOnline = () => {
      if (expectedPlayingRef.current && youtubePlayerRef.current) {
        try {
          const intPlayer = youtubePlayerRef.current.getInternalPlayer();
          if (intPlayer && typeof intPlayer.playVideo === "function") {
             intPlayer.playVideo();
          } else {
             youtubePlayerRef.current.seekTo(position / 1000, "seconds");
          }
        } catch(e) {}
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [position]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && wasUnexpectedlyPausedRef.current) {
        showNotification("Si iOS pausa el audio en reposo, recuerda que puedes pulsar Play desde el centro de control o la pantalla de bloqueo.");
        wasUnexpectedlyPausedRef.current = false;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const now = Date.now();
    if (now - lastPosSaveRef.current > 3000) {
      localStorage.setItem("gym_music_saved_position", position.toString());
      lastPosSaveRef.current = now;
    }
  }, [position]);

  // Initialize security code from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem("gym_music_security_code");
    if (savedCode) {
      setSavedSecurityCode(savedCode);
    }
  }, []);

  const displayTracks = React.useMemo(() => {
    return playingPlaylist?.tracks || ALL_DATABASE_TRACKS;
  }, [playingPlaylist]);

  const viewedTracks = React.useMemo(() => {
    return selectedPlaylist?.tracks || ALL_DATABASE_TRACKS;
  }, [selectedPlaylist]);

  const filteredDisplayTracks = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return viewedTracks.map((track, idx) => ({ track, idx }));
    }
    const lowerQuery = searchQuery.trim().toLowerCase();
    
    const mapped = viewedTracks.map((track, idx) => {
      const lowerTitle = track.title?.toLowerCase() || "";
      const lowerArtist = track.artist?.toLowerCase() || "";
      const isArtistMatch = lowerArtist.includes(lowerQuery);
      const isTitleMatch = lowerTitle.includes(lowerQuery);
      
      let priority = -1;
      if (lowerArtist === lowerQuery) priority = 4;
      else if (lowerArtist.startsWith(lowerQuery)) priority = 3;
      else if (lowerTitle === lowerQuery) priority = 2;
      else if (lowerTitle.startsWith(lowerQuery)) priority = 1;
      else if (isArtistMatch || isTitleMatch) priority = 0;
      
      return { track, idx, priority };
    });

    return mapped
      .filter(item => item.priority > -1)
      .sort((a, b) => b.priority - a.priority)
      .map(({ track, idx }) => ({ track, idx }));
  }, [viewedTracks, searchQuery]);

  const communityPlaylists = React.useMemo(() => {
    return userPlaylists
      .filter(pl => {
        const isNotFav = pl.name.toLowerCase() !== 'favoritos' && pl.name.toLowerCase() !== 'siguiente';
        
        if (!isNotFav) return false;
        
        return true;
      });
  }, [userPlaylists]);

  const communitySearchResults = React.useMemo(() => {
    if (!searchQuery.trim() || trackListTab !== "search") return [];
    const query = searchQuery.trim().toLowerCase();
    return communityPlaylists.filter(pl => pl.name.toLowerCase().includes(query) || (pl.genre && pl.genre.toLowerCase().includes(query)));
  }, [searchQuery, communityPlaylists, trackListTab]);

  const displayTrackIndex = overrideCurrentTrack ? -1 : currentTrackIndex;

  const baseCurrentTrack =
    displayTracks[currentTrackIndex] || displayTracks[0] || ALL_DATABASE_TRACKS[0];
  const currentTrack = overrideCurrentTrack || baseCurrentTrack;
  
  const currentUrl = currentTrack.url || "";
  const isNativeMode = false; // Never use native mode, it's blocked by YouTube

  useEffect(() => {
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    skipTimeoutRef.current = null;
    sponsorBlockSegmentsRef.current = [];
    
    if (currentTrack?.url) {
      const match = currentTrack.url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      const videoId = match ? match[1] : null;
      if (videoId) {
        fetch(`https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=["music_offtopic"]`)
          .then(res => {
            if (res.ok) return res.json();
            return [];
          })
          .then(data => {
            if (Array.isArray(data)) {
              sponsorBlockSegmentsRef.current = data.map((s: any) => ({
                start: s.segment[0],
                end: s.segment[1],
                actionType: s.actionType
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [currentTrack?.url]);

  const togglePlayback = useCallback(() => {
    const nextPlaying = !isPlaying;
    expectedPlayingRef.current = nextPlaying;
    
    if (nextPlaying) {
      if (fallbackSilentAudioRef.current) fallbackSilentAudioRef.current.play().catch(() => {});
    } else {
      if (fallbackSilentAudioRef.current) fallbackSilentAudioRef.current.pause();
    }
    
    setIsPlaying(nextPlaying);
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    expectedPlayingRef.current = true;
    if (fallbackSilentAudioRef.current && fallbackSilentAudioRef.current.paused) {
        fallbackSilentAudioRef.current.play().catch(() => {});
    }

    // Record skip in taste engine
    const activeTrack = overrideCurrentTrack || displayTracks[currentTrackIndex] || displayTracks[0] || ALL_DATABASE_TRACKS[0];
    if (activeTrack) {
      if ('mediaSession' in navigator) {
         try {
           navigator.mediaSession.metadata = new MediaMetadata({
             title: activeTrack.title || "Saltando...",
             artist: activeTrack.artist || "Flux",
             artwork: [{ src: activeTrack.thumbnail_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17", sizes: "512x512", type: "image/jpeg" }]
           });
         } catch(e) {}
      }
      recordTrackSkip(activeTrack);
    }

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
          setPlayingPlaylist(randomPl);
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
    if (isRepeat) {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.seekTo(0);
      }
      setIsPlaying(true);
      return;
    }
    if (currentTrackIndex < tracksList.length - 1) {
      setCurrentTrackIndex((prev) => prev + 1);
    } else if (tracksList.length > 0) {
      setCurrentTrackIndex(0);
    }
    setIsPlaying(true);
  }, [displayTracks, currentTrackIndex, isShuffle, userPlaylists, playingPlaylist, isRepeat]);

  const handlePrev = useCallback(() => {
    setOverrideCurrentTrack(null);
    expectedPlayingRef.current = true;
    if (fallbackSilentAudioRef.current && fallbackSilentAudioRef.current.paused) {
        fallbackSilentAudioRef.current.play().catch(() => {});
    }

    // Try to instantly update media session for fast car-screen response
    const activeTrack = displayTracks[currentTrackIndex] || displayTracks[0] || ALL_DATABASE_TRACKS[0];
    if (activeTrack) {
      if ('mediaSession' in navigator) {
         try {
           navigator.mediaSession.metadata = new MediaMetadata({
             title: activeTrack.title || "Saltando...",
             artist: activeTrack.artist || "Flux Premium",
             artwork: [{ src: activeTrack.thumbnail_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17", sizes: "512x512", type: "image/jpeg" }]
           });
         } catch(e) {}
      }
    }

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
          setPlayingPlaylist(randomPl);
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
  }, [currentTrackIndex, isShuffle, displayTracks, userPlaylists, playingPlaylist]);

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

  const communityDocsRef = useRef<any[]>([]);
  const userDocsRef = useRef<any[]>([]);

  // Sync with Firestore (Optimized: fetch global lists statically with limit, and user lists in real-time)
  useEffect(() => {
    let unsubscribeUser = () => {};

    const processMergedDocs = () => {
      // Unir documentos, dando prioridad a las versiones del usuario
      const combined = new Map();
      communityDocsRef.current.forEach(doc => combined.set(doc.id, doc));
      userDocsRef.current.forEach(doc => combined.set(doc.id, doc));
      const mergedDocs = Array.from(combined.values());

      mergedDocs.sort((a, b) => {
        const tA = a.data().createdAt?.toMillis?.() || 0;
        const tB = b.data().createdAt?.toMillis?.() || 0;
        return tB - tA;
      });

      if (isAdmin) {
        mergedDocs.forEach((playlistDoc) => {
          const data = playlistDoc.data();
          const name = data.name || "";
          if (name.toLowerCase().includes("martina")) {
            const tracks = data.tracks || [];
            if (tracks.length > 80) {
              console.log("Detected extra tracks in Martina playlist. Automatically pruning to 80...");
              const pruned = tracks.slice(0, 80);
              updateDoc(playlistDoc.ref, {
                tracks: pruned,
                updatedAt: serverTimestamp()
              }).catch(e => console.error(e));
            }
          }
        });
      }

      const folders = mergedDocs.map((doc) => {
        const data = doc.data();
        let ownerId = data.ownerId;
        
        if (!ownerId && doc.ref.path.includes("users/")) {
          const segments = doc.ref.path.split("/");
          const userIdx = segments.indexOf("users");
          if (userIdx !== -1 && segments[userIdx + 1]) {
            ownerId = segments[userIdx + 1];
          }
        }

        const rawTracks = data.tracks || [];
        const cleanedTracks = rawTracks.filter((track: any) => {
          const url = track.url || "";
          return !url.toLowerCase().includes("soundcloud.com") && !url.toLowerCase().includes("snd.sc");
        });

        const realNames = [
          "Elena Rossi", "Marc Volkov", "Sofia Chen", "Lucas Mendez", "Aria Jensen", 
          "Oliver Wright", "Isabella Santos", "Kaito Tanaka", "Emma Laurent", "Julian Vane",
          "Nina Petrova", "Leo Moretti", "Zara Khalid", "Hugo Becker", "Maya Lindholm"
        ];
        const nameIndex = doc.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % realNames.length;
        const fakeOwnerName = realNames[nameIndex];
        
        const isAdminContent = data.ownerId === "ho82788278" || data.adminSecret === "ho82788278" || data.ownerName?.toLowerCase() === "administrador" || data.ownerName === "eltygere8651" || data.ownerName?.toLowerCase() === "adoni";

        return {
          id: doc.id,
          ...data,
          ownerId: ownerId,
          path: doc.ref.path,
          ownerName: isAdminContent 
            ? "#fluxmusicoficial"
            : (data.ownerName && data.ownerName !== "Administrador" && data.ownerName !== "eltygere8651" && data.ownerName !== "Usuario" && !data.ownerName.includes("@")) 
              ? data.ownerName 
              : fakeOwnerName,
          tracks: cleanedTracks,
          isAdminContent: isAdminContent
        };
      })
      .sort((a: any, b: any) => (b.isAdminContent ? 1 : 0) - (a.isAdminContent ? 1 : 0))
      .filter((pl: any, index: number, self: any[]) => {
        if (user && pl.ownerId === user.uid) return true;
        if (!pl.tracks || pl.tracks.length === 0) return false;
        return self.findIndex(t => t.name === pl.name) === index;
      })
      .filter((pl: any) => {
        const isMartina = pl.name?.toLowerCase().includes("martina");
        if (isMartina) return true;
        const isSoundCloud = pl.name?.toLowerCase().includes("soundcloud") || pl.description?.toLowerCase().includes("soundcloud") || pl.genre?.toLowerCase().includes("soundcloud");
        if (isSoundCloud) return false;
        return true;
      }) as any as MusicPlaylist[];

      const sortedFolders = folders.sort((a: any, b: any) => {
        if (a.name?.toLowerCase() === 'favoritos') return -1;
        if (b.name?.toLowerCase() === 'favoritos') return 1;
        return 0;
      });

      setUserPlaylists(sortedFolders);
      
      if (!playlistsLoadedInitiallyRef.current && folders.length > 0) {
        const savedPlaylistId = localStorage.getItem("gym_music_selected_playlist_id");
        const lastPlayedPlId = localStorage.getItem("gym_music_last_played_playlist_id");
        
        let foundSelected = savedPlaylistId ? folders.find((f) => f.id === savedPlaylistId) : null;
        let foundPlaying = lastPlayedPlId ? folders.find((f) => f.id === lastPlayedPlId) : null;
        
        setSelectedPlaylist(null);
        setTrackListTab("search");
        setIsTrackListExpanded(true);
        setMobileView("player");
        
        if (foundPlaying) setPlayingPlaylist(foundPlaying);
        else if (foundSelected) setPlayingPlaylist(foundSelected);
        else setPlayingPlaylist(null);
        
        playlistsLoadedInitiallyRef.current = true;
      } else if (playlistsLoadedInitiallyRef.current) {
        const currentSelected = selectedPlaylistRef.current;
        const currentPlaying = playingPlaylistRef.current;
        const currentTrackIdx = currentTrackIndexRef.current;

        if (currentSelected) {
          const updatedSelected = folders.find((f) => f.id === currentSelected.id);
          if (updatedSelected) {
            const tracksSame = currentSelected.tracks?.length === updatedSelected.tracks?.length && 
                               currentSelected.tracks?.every((t:any, i:number) => (t.id && t.id === updatedSelected.tracks[i]?.id) || (t.url && t.url === updatedSelected.tracks[i]?.url));
            const metadataSame = currentSelected.name === updatedSelected.name && currentSelected.thumbnail_url === updatedSelected.thumbnail_url;
            if (!tracksSame || !metadataSame) setSelectedPlaylist(updatedSelected);
          }
        }

        if (currentPlaying) {
          const updatedPlaying = folders.find((f) => f.id === currentPlaying.id);
          if (updatedPlaying) {
            const tracksSame = currentPlaying.tracks?.length === updatedPlaying.tracks?.length && 
                               currentPlaying.tracks?.every((t:any, i:number) => (t.id && t.id === updatedPlaying.tracks[i]?.id) || (t.url && t.url === updatedPlaying.tracks[i]?.url));
            const metadataSame = currentPlaying.name === updatedPlaying.name && currentPlaying.thumbnail_url === updatedPlaying.thumbnail_url;
            
            if (!tracksSame || !metadataSame) {
              const currentTracksList = currentPlaying.tracks || [];
              const playingTrack = currentTracksList[currentTrackIdx];
              
              setPlayingPlaylist(updatedPlaying);
              
              if (playingTrack && updatedPlaying.tracks && updatedPlaying.tracks.length > 0) {
                 const trackAtCurrentIdx = updatedPlaying.tracks[currentTrackIdx];
                 let isSameAtCurrent = false;
                 if (trackAtCurrentIdx) {
                    isSameAtCurrent = (playingTrack.id && trackAtCurrentIdx.id === playingTrack.id) || (playingTrack.url && trackAtCurrentIdx.url === playingTrack.url);
                 }
                 
                 if (!isSameAtCurrent) {
                    const newIdx = updatedPlaying.tracks.findIndex((t: any) => 
                      (playingTrack.id && t.id === playingTrack.id) || (playingTrack.url && t.url === playingTrack.url)
                    );
                    if (newIdx !== -1) {
                      setCurrentTrackIndex(newIdx);
                    } else {
                      setOverrideCurrentTrack(playingTrack);
                    }
                 }
              }
            }
          }
        }
      }
    };

    const fetchCommunity = async () => {
      try {
        const qComm = query(collectionGroup(db, "playlists"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(qComm);
        communityDocsRef.current = snap.docs;
        processMergedDocs();
      } catch (e) {
        console.error("Error fetching community playlists", e);
      }
    };
    fetchCommunity();

    if (user) {
      const qUser = query(collection(db, "users", user.uid, "playlists"), orderBy("createdAt", "desc"));
      unsubscribeUser = onSnapshot(qUser, (snap) => {
        userDocsRef.current = snap.docs;
        processMergedDocs();
      });
    } else {
      userDocsRef.current = [];
      processMergedDocs();
    }

    return () => unsubscribeUser();
  }, [user, isAdmin]);

  useEffect(() => {
    if (playingPlaylist) {
      localStorage.setItem("gym_music_last_played_playlist_id", playingPlaylist.id);
    }
  }, [playingPlaylist]);

  // Synchronous reproduction/play incrementer logic for community/smart metadata
  useEffect(() => {
    if (isPlaying && playingPlaylist && playingPlaylist.id) {
      try {
        const storedPlays = localStorage.getItem("flux_playlist_playbacks");
        const playsMap = storedPlays ? JSON.parse(storedPlays) : {};
        const currentCount = playsMap[playingPlaylist.id] || 0;
        
        const trackIdKey = currentTrack?.id || "unknown";
        const lastIncrementKey = `flux_last_play_inc_${playingPlaylist.id}_${trackIdKey}`;
        const lastIncremented = sessionStorage.getItem(lastIncrementKey);
        
        if (!lastIncremented) {
          playsMap[playingPlaylist.id] = currentCount + 1;
          localStorage.setItem("flux_playlist_playbacks", JSON.stringify(playsMap));
          sessionStorage.setItem(lastIncrementKey, "1");
          if (currentTrack) {
            recordTrackPlay(currentTrack);
          }
        }
      } catch (e) {
        console.warn("Unable to increment play count:", e);
      }
    }
  }, [isPlaying, playingPlaylist?.id, currentTrack?.id]);

  useEffect(() => {
    if (trackListTab === "search" && !exploreData && !isLoadingExplore) {
      const fetchExplore = async () => {
        setIsLoadingExplore(true);
        try {
          const res = await fetch(`/api/youtube/explore?country=${selectedCountry || 'ES'}`);
          if (res.ok) {
            const data = await res.json();
            
            // --- SILENT MIX PARA TI INJECTION ---
            try {
              const history = getPlayHistory();
              const historyList = Object.values(history);
              if (historyList.length > 2) {
                // Ensure arrays exist
                data.mixParaTi = [];
                
                // Mix 1: Tus Más Escuchados
                const topPlayed = [...historyList].sort((a,b) => b.playCount - a.playCount).slice(0, 30);
                if (topPlayed.length > 0) {
                   data.mixParaTi.push({
                      id: "mix_mas_escuchados",
                      title: "Tus Más Escuchados",
                      artist: "Historia Flux",
                      isPlaylist: true,
                      isLocalMix: true,
                      thumbnail: topPlayed[0].url ? undefined : `https://i.ytimg.com/vi/${topPlayed[0].trackId}/mqdefault.jpg`,
                      tracks: topPlayed.map((t, i) => {
                         let vId = t.trackId;
                         if (t.url && t.url.includes("v=")) {
                            vId = t.url.split("v=")[1].split("&")[0];
                         }
                         return {
                            id: `local_his_${i}_${vId}`,
                            title: t.title,
                            artist: t.artist,
                            duration: "0:00",
                            url: t.url || `https://www.youtube.com/watch?v=${vId}`,
                            thumbnail: `https://i.ytimg.com/vi/${vId}/mqdefault.jpg`
                         };
                      })
                   });
                   // Fix thumbnail
                   const firstTrack = data.mixParaTi[0].tracks[0];
                   data.mixParaTi[0].thumbnail = firstTrack.thumbnail;
                }

                // Mix 2: Mix Descubrimiento (Silent YouTube search based on multiple top played artists)
                const topUniqueArtists: string[] = [];
                for (const item of topPlayed) {
                   const artistName = item.artist || item.title?.split("-")[0]?.trim();
                   if (artistName && artistName !== "Artista" && artistName !== "Flux" && !topUniqueArtists.includes(artistName)) {
                       topUniqueArtists.push(artistName);
                       if (topUniqueArtists.length >= 6) break;
                   }
                }

                if (topUniqueArtists.length > 0) {
                   setTimeout(() => {
                     Promise.all(
                         topUniqueArtists.map(artist => 
                             fetch(`/api/youtube/search?q=${encodeURIComponent(artist + " audio")}`)
                               .then(res => res.ok ? res.json() : [])
                               .catch(() => []) // Prevent single failures from rejecting all
                         )
                     ).then(results => {
                         const mixedTracks: any[] = [];
                         const maxLen = Math.max(0, ...results.map(r => Array.isArray(r) ? r.length : 0));
                         
                         for (let i = 0; i < maxLen; i++) {
                             for (let j = 0; j < results.length; j++) {
                                 const trackList = results[j];
                                 if (Array.isArray(trackList)) {
                                     const track = trackList[i];
                                     if (track && !track.isPlaylist) {
                                         // Avoid duplicate tracks
                                         if (!mixedTracks.find(t => t.url === track.url || t.id === track.id)) {
                                             mixedTracks.push(track);
                                         }
                                     }
                                 }
                             }
                             if (mixedTracks.length >= 40) break;
                         }

                         if (mixedTracks.length > 3) {
                            setExploreData((prev: any) => {
                               if (!prev) return prev;
                               const newPrev = { ...prev };
                               newPrev.mixParaTi = newPrev.mixParaTi || [];
                               newPrev.mixParaTi = newPrev.mixParaTi.filter((m: any) => m.id !== "mix_descubrimiento");
                               
                               const titleString = topUniqueArtists.slice(0, 3).join(", ") + (topUniqueArtists.length > 3 ? " y más" : "");
                               
                               newPrev.mixParaTi.push({
                                  id: "mix_descubrimiento",
                                  title: "Mix Descubrimiento",
                                  artist: "Basado en " + titleString,
                                  isPlaylist: true,
                                  isLocalMix: true,
                                  thumbnail: mixedTracks[0]?.thumbnail || `https://i.ytimg.com/vi/${mixedTracks[0]?.id}/mqdefault.jpg`,
                                  tracks: mixedTracks.map((t: any, i: number) => ({
                                     id: `local_rec_${i}_${t.id}`,
                                     title: t.title,
                                     artist: t.artist || "Descubrimiento",
                                     duration: t.duration || "0:00",
                                     url: t.url || `https://www.youtube.com/watch?v=${t.id}`,
                                     thumbnail: t.thumbnail || `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`
                                  }))
                               });
                               return newPrev;
                            });
                         }
                     }).catch(e => console.warn("Discovery Mix Error:", e));
                   }, 800); // 800ms delay to not block UI thread
                }
              }
            } catch (e) {
              console.warn("Silent Mix Gen Error:", e);
            }
            // -------------------------------------

            setExploreData(data);
          } else {
            throw new Error("Explore API failed");
          }
        } catch (err) {
          console.error("Explore fallback:", err);
          setExploreData({
            trending: [],
            dailyTop: [],
            top100: [],
            workout: [],
            focus: [],
            trends: [],
            latin: [],
            party: []
          });
        } finally {
          setIsLoadingExplore(false);
        }
      };
      fetchExplore();
    }
  }, [trackListTab, exploreData, isLoadingExplore, selectedCountry]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleNextRef = useRef(handleNext);
  useEffect(() => {
    handleNextRef.current = handleNext;
  }, [handleNext]);

  const metadataCacheRef = useRef<Record<string, any>>({});

  const fetchMetadata = async (url: string) => {
    if (metadataCacheRef.current[url]) {
      return metadataCacheRef.current[url];
    }
    try {
      const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`);
      if (!res.ok) return null;
      
      const data = await res.json();
      metadataCacheRef.current[url] = data;
      return data;
    } catch (e) {
      console.error("Metadata fetch error via proxy", e);
    }
    return null;
  };

  const handleCopyPlaylistToProfile = async (pl: MusicPlaylist) => {
    if (!user) {
      alert("Debes iniciar sesión para guardar canales en tu perfil.");
      setAuthModalOpen(true);
      return;
    }
    setPlaylistToCopy(pl);
    setCopyPlaylistNameInput(pl.name);
    setCopyPlaylistDescInput(pl.description || "Canal guardado desde novedades");
    setTargetPlaylistIdForCopy("new");
  };

  const toggleMoverPlaylistACarpeta = async (playlist: MusicPlaylist, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const isInFolder = playlist.folder !== "root" && localFoldersMap[playlist.id] !== "root";
    const nextFolderValue = isInFolder ? "root" : "general";
    
    // Update local state instantly
    const updatedMap = { ...localFoldersMap };
    if (isInFolder) {
      updatedMap[playlist.id] = "root";
    } else {
      delete updatedMap[playlist.id];
    }
    setLocalFoldersMap(updatedMap);
    localStorage.setItem("gym_music_local_folders_map", JSON.stringify(updatedMap));

    if (user) {
      try {
        const plRef = doc(db, "users", user.uid, "playlists", playlist.id);
        await updateDoc(plRef, {
          folder: nextFolderValue,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firebase folder field update failed, fell back to local state:", err);
      }
    }
    
    showNotification(isInFolder ? "Sacado de Tus Listas" : "Añadido a Tus Listas");
  };

  const handleProcessCopyPlaylist = async () => {
    if (!user || !playlistToCopy) return;
    setIsProcessingCopy(true);

    // Evitar duplicados en mi biblioteca
    const alreadyOwns = userPlaylists.some(p => 
      p.ownerId === user.uid && 
      p.name.trim().toLowerCase() === (copyPlaylistNameInput.trim() || playlistToCopy.name).toLowerCase()
    );
    if (alreadyOwns) {
      showNotification("Ya tienes un canal con este nombre en tu biblioteca.");
      setIsProcessingCopy(false);
      return;
    }

    try {
      if (targetPlaylistIdForCopy === "new") {
        // Option 1: Create a brand new independent channels group
        const newPlDoc = {
          name: copyPlaylistNameInput.trim() || playlistToCopy.name,
          genre: playlistToCopy.genre || "Personalizado",
          description: copyPlaylistDescInput.trim() || "Canal guardado desde novedades",
          icon: playlistToCopy.icon || "📂",
          thumbnail_url: playlistToCopy.thumbnail_url || "",
          ownerId: user.uid,
          ownerName: user.displayName || "Socio Premium",
          isPublic: true,
          adminSecret: "ho82788278",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tracks: playlistToCopy.tracks || [],
          folder: "general",
        };
        const docRef = await addDoc(
          collection(db, "users", user.uid, "playlists"),
          newPlDoc,
        );
        showNotification(`Canal "${newPlDoc.name}" guardado con éxito`);
        setSelectedPlaylist({ id: docRef.id, ...newPlDoc } as any);
      } else {
        // Option 2: Append all tracks into an existing playlist owned by the user
        const targetPl = userPlaylists.find(p => p.id === targetPlaylistIdForCopy);
        if (!targetPl) {
          alert("La playlist de destino seleccionada no es válida.");
          setIsProcessingCopy(false);
          return;
        }

        // Filter tracks to avoid duplicate URLs
        const existingUrls = new Set((targetPl.tracks || []).map(t => t.url?.trim().toLowerCase()));
        const tracksToAdd = (playlistToCopy.tracks || []).filter(t => t.url && !existingUrls.has(t.url.trim().toLowerCase()));

        if (tracksToAdd.length === 0) {
          showNotification("Todas las canciones de esta playlist ya existen en tu canal.");
          setPlaylistToCopy(null);
          setIsProcessingCopy(false);
          return;
        }

        const mergedTracks = [...(targetPl.tracks || []), ...tracksToAdd];
        const targetRef = doc(db, "users", user.uid, "playlists", targetPl.id);

        let updateData: any = {
          tracks: mergedTracks,
          updatedAt: serverTimestamp()
        };

        const firstTrack = mergedTracks[0];
        const firstTrackCover = firstTrack ? (firstTrack.artwork_url || firstTrack.thumbnail || firstTrack.artwork) : null;

        const currentCover = targetPl.thumbnail_url || "";
        const isDefaultCover = !currentCover || currentCover === "📂" || currentCover === "" || currentCover.includes("pollinations.ai") || currentCover.includes("image.pollinations.ai");

        if (firstTrackCover && isDefaultCover) {
          updateData.thumbnail_url = firstTrackCover;
        }

        await updateDoc(targetRef, updateData);

        showNotification(`¡Añadidas ${tracksToAdd.length} canciones a "${targetPl.name}" con éxito!`);
        setSelectedPlaylist({ 
          ...targetPl, 
          tracks: mergedTracks,
          thumbnail_url: updateData.thumbnail_url || targetPl.thumbnail_url
        });
      }
      setPlaylistToCopy(null);
    } catch (e) {
      console.error("Error copying playlist:", e);
      alert("Hubo un problema al guardar las canciones. Inténtalo de nuevo.");
    } finally {
      setIsProcessingCopy(false);
    }
  };

  const handleAddNewCanalClick = () => {
    setTrackToAddDestination(null);
    setModalNewPlaylistName("");
    setModalNewPlaylistDesc("");
    setModalSelectedPlaylistId("new");
    setIsAddingToPlaylistModalOpen(true);
    setShowLibrary(false);
  };

  const handleSendSupportMessage = async () => {
    if (!supportMessage || !supportMessage.trim()) {
      showNotification("Por favor, escribe un mensaje primero.");
      return;
    }

    try {
      setIsSendingSupport(true);
      const emailVal = user?.email || "Anónimo";
      const nameVal = user?.displayName || "Socio Contigo";
      const msgText = supportMessage.trim();

      const categoryLabels: Record<string, string> = {
        soporte: "💬 [SOPORTE GENERAL]",
        fallo: "🛠️ [REPORTE DE FALLO TÉCNICO]",
        feedback: "💡 [FEEDBACK / PROPUESTA]"
      };
      const categoryPrefix = categoryLabels[supportCategory] || "💬 [SOPORTE]";
      const fullMessageText = `${categoryPrefix}\n\n${msgText}`;

      // 1. Guardar siempre en la colección Firestore support_messages (Seguridad absoluta de datos)
      let storedInDb = false;
      try {
        const supportRef = collection(db, "support_messages");
        await addDoc(supportRef, {
          userEmail: emailVal,
          userName: nameVal,
          message: msgText,
          category: supportCategory,
          createdAt: Date.now()
        });
        storedInDb = true;
      } catch (dbErr) {
        console.error("Failed to write to Firestore support_messages:", dbErr);
      }

      // 2. Intentar enviar a Telegram a través del backend servidor /api/support/telegram
      let sentToTelegram = false;
      try {
        const res = await fetch("/api/support/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userEmail: emailVal,
            userName: nameVal,
            message: fullMessageText
          })
        });

        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (data?.success) {
              sentToTelegram = true;
            }
          }
        } else {
          // El backend falló o es una página 404 estática (como en Vercel)
          let errorText = `Error ${res.status}`;
          try {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errData = await res.json();
              errorText = errData.error || errorText;
            }
          } catch (_) {
            // Ignorar para evitar fallos de parseo
          }
          console.warn("Backend Telegram dispatch skipped or failed:", errorText);
        }
      } catch (backendErr) {
        console.warn("Backend API not reachable (standard on Vercel dynamic endpoints):", backendErr);
      }

      // 3. Fallback: Si el backend no respondió, intentar obtener la configuración de Telegram directamente desde Firestore y enviar
      if (!sentToTelegram) {
        let directBotToken = "";
        let directChatId = "";

        try {
          const teleSnap = await getDoc(doc(db, "system_settings", "telegram"));
          if (teleSnap.exists()) {
            const data = teleSnap.data();
            directBotToken = (data?.botToken || "").trim();
            directChatId = (data?.chatId || "").trim();
          }
        } catch (dbErr) {
          console.warn("Could not retrieve Telegram config from Firestore directly (falling back to VITE envs):", dbErr);
        }

        if (!directBotToken || !directChatId) {
          // Fallback to VITE env variables built into the bundle
          directBotToken = (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || "";
          directChatId = (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID || "";
        }

        if (directBotToken && directChatId) {
          try {
            const formattedText = `💬 *ATENCIÓN FLUX MUSIC*\n\n*Usuario:* ${nameVal}\n*Email:* ${emailVal}\n\n*Mensaje:*\n${fullMessageText}`;
            const teleRes = await fetch(`https://api.telegram.org/bot${directBotToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: directChatId,
                text: formattedText,
                parse_mode: "Markdown"
              })
            });
            if (teleRes.ok) {
              sentToTelegram = true;
            } else {
              const teleErrText = await teleRes.text();
              console.error("Direct Telegram endpoint returned error:", teleErrText);
            }
          } catch (teleErr) {
            console.error("Direct client Telegram dispatch failed:", teleErr);
          }
        }
      }

      // 4. Feedback final al usuario sin detalles internos de Telegram
      if (supportCategory === "feedback") {
        showNotification("¡Muchas gracias por tus comentarios! Tu feedback se ha guardado y nuestro equipo lo revisará para seguir mejorando FLUX Music.");
      } else if (supportCategory === "fallo") {
        showNotification("¡Reporte de fallo recibido! Nuestro departamento de ingeniería revisará el informe técnico para solventarlo de inmediato.");
      } else {
        showNotification("¡Mensaje enviado con éxito! Tu solicitud ha sido registrada en nuestro canal de atención prioritaria y te responderemos lo antes posible.");
      }

      setSupportMessage("");
      setIsSupportModalOpen(false);
    } catch (err: any) {
      console.error("Support submit error:", err);
      showNotification(err.message || "Error al procesar la solicitud.");
    } finally {
      setIsSendingSupport(false);
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

    const isMasterAdmin = (authCode || savedSecurityCode) === "ho82788278";
    const isPremiumUser = accessData?.isValid;

    if (!isAdmin && !isMasterAdmin && !isPremiumUser) {
      const nextAttempts = securityAttempts + 1;
      setSecurityAttempts(nextAttempts);
      if (nextAttempts >= 2) {
        handleBlockUser();
      } else {
        alert(`Código incorrecto o acceso no autorizado. Te queda ${2 - nextAttempts} intento.`);
      }
      return;
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
      
      const desc = editingDescription.trim();
      const songsContext = pl.tracks && pl.tracks.length > 0 ? `, inspired by songs like: ${pl.tracks.slice(0, 8).map((t: any) => t.title).join(", ")}` : "";
      const promptBase = `Abstract artistic music album cover for "${editingName}"${desc ? ' theme: ' + desc : ''}${songsContext}`;
      const prompt = encodeURIComponent(`${promptBase}, highly detailed, stunning lighting, 4k, no text, no fonts, no words, beautiful vibrant layout`);
      const randomSeed = Math.floor(Math.random() * 1000000);
      const generatedCoverUrl = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true&seed=${randomSeed}`;

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

    const pl = userPlaylists.find(p => p.id === deletingId);
    if (!pl) {
      alert("Canal no encontrado en la lista actual.");
      setDeletingId(null);
      return;
    }
    
    // Check if user is owner
    const isOwner = user && pl.ownerId === user.uid;

    if (isBlocked) {
      alert("Acceso bloqueado por demasiados intentos fallidos.");
      return;
    }

    const isSystemMasterPlaylist = pl.adminSecret === "ho82788278";
    const needsPasscode = isSystemMasterPlaylist && !isAdmin && !isOwner;

    if (needsPasscode) {
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

    setTrackToDeleteConfirm(trackToDelete);
  };

  const executeDeleteTrack = async () => {
    if (!trackToDeleteConfirm || !selectedPlaylist?.id || selectedPlaylist.id === "all") return;

    try {
      const docRef = doc(db, "users", selectedPlaylist.ownerId, "playlists", selectedPlaylist.id);
      const updatedTracks = selectedPlaylist.tracks.filter((t: any) => t.id !== trackToDeleteConfirm.id);
      await updateDoc(docRef, { tracks: updatedTracks, updatedAt: serverTimestamp() });
      setSelectedPlaylist({ ...selectedPlaylist, tracks: updatedTracks });
      showNotification(`"${trackToDeleteConfirm.title}" de "${selectedPlaylist.name}" eliminada`);
    } catch (error) {
      console.error("Error removing track:", error);
      showNotification("Error al eliminar la canción.");
    } finally {
      setTrackToDeleteConfirm(null);
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

  const handleLoadExplorePlaylist = async (item: any) => {
    if (item.isLocalMix) {
      setPreviewPlaylist({
        id: item.id,
        name: item.title,
        description: item.artist || "Selección para ti",
        tracks: item.tracks,
        thumbnail_url: item.thumbnail,
        ownerId: "flux",
        ownerName: "Flux Music",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowLibrary(true);
      return;
    }

    if (item.isPlaylist === false) {
      setPreviewPlaylist({
        id: item.id,
        name: item.title,
        description: item.artist || "Sencillo",
        tracks: [{
          id: item.id,
          title: item.title,
          artist: item.artist || "Flux",
          duration: item.duration || "N/A",
          url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
          thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`
        }],
        thumbnail_url: item.thumbnail,
        ownerId: "youtube",
        ownerName: item.artist || "Flux",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setShowLibrary(true);
      return;
    }

    setIsLoadingExplore(true);
    try {
      const encodedTitle = encodeURIComponent(item.title);
      const res = await fetch(`/api/youtube/playlist?id=${item.id}&title=${encodedTitle}`);
      if (!res.ok) throw new Error("Failed to load playlist");
      const tracks = await res.json();
      if (tracks && tracks.length > 0) {
        const fullPlaylist = {
          id: item.id,
          name: item.title,
          description: item.artist || "Lista oficial",
          tracks: tracks,
          thumbnail_url: item.thumbnail,
          ownerId: "youtube",
          ownerName: item.artist || "Flux",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setPreviewPlaylist(fullPlaylist);
        setShowLibrary(true);
        showNotification(`Playlist cargada: ${item.title}`);
      } else {
        showNotification("La playlist está vacía.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error cargando playlist.");
    } finally {
      setIsLoadingExplore(false);
    }
  };

  const handleToggleExpandPlaylist = async (playlistId: string, playlistTitle: string = "") => {
    if (expandedPlaylistId === playlistId) {
      setExpandedPlaylistId(null);
      setExpandedPlaylistTracks([]);
      return;
    }

    setExpandedPlaylistId(playlistId);
    setExpandedPlaylistTracks([]);
    setIsFetchingExpandedTracks(true);

    try {
      const qs = playlistTitle ? `?id=${playlistId}&title=${encodeURIComponent(playlistTitle)}` : `?id=${playlistId}`;
      const res = await fetch(`/api/youtube/playlist${qs}`);
      if (res.ok) {
        const tracks = await res.json();
        setExpandedPlaylistTracks(tracks);
      } else {
        showNotification("No se pudieron cargar las canciones de la lista.");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error al cargar canciones.");
    } finally {
      setIsFetchingExpandedTracks(false);
    }
  };

  const addSingleTrackToCurrentPlaylist = (track: MusicTrack) => {
    setTrackToAddDestination(track);
    const isMasterAdmin = savedSecurityCode === "ho82788278";
    const canWrite = selectedPlaylist && selectedPlaylist.id !== "all" && (selectedPlaylist.ownerId === user?.uid || isAdmin || isMasterAdmin);
    setModalSelectedPlaylistId(canWrite ? selectedPlaylist!.id : "new");
    setModalNewPlaylistName(track?.artist ? `Playlist de ${track.artist}` : `Mix de ${track.title}`);
    setModalNewPlaylistDesc(`Canal personalizado basado en ${track.title}`);
    setIsAddingToPlaylistModalOpen(true);
  };

  const executeModalAddTrack = async (targetPlaylistId: string, buildNew: boolean) => {
    setIsProcessingModalAdd(true);

    try {
      let currentUser = user;
      if (!currentUser) {
        const { signInAnonymously: firebaseSignInAnonymously, auth: firebaseAuth } = await import("../lib/firebase");
        const cred = await firebaseSignInAnonymously(firebaseAuth);
        currentUser = cred.user;
      }

      if (!currentUser) {
        showNotification("Error de autenticación. Inténtalo de nuevo.");
        setIsProcessingModalAdd(false);
        return;
      }

      let finalTracksToAdd: MusicTrack[] = [];
      
      if (trackToAddDestination) {
        const isPlaylistSource = trackToAddDestination.isPlaylist;

        if (isPlaylistSource) {
          showNotification("Extrayendo canciones de la lista...");
          try {
            const res = await fetch(`/api/youtube/playlist?id=${trackToAddDestination.id}`);
            if (res.ok) {
              const fetched = await res.json();
              finalTracksToAdd = fetched.map((t: any, i: number) => ({
                id: `yt_${t.id}_${Date.now()}_${i}`,
                title: t.title,
                artist: t.artist,
                url: t.url,
                duration: t.duration || "N/A",
                bpm: 120,
                thumbnail: t.thumbnail || `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`,
              }));
            } else {
              showNotification("No se pudieron extraer las pistas del enlace.");
              setIsProcessingModalAdd(false);
              return;
            }
          } catch (e) {
            showNotification("Error obteniendo pistas.");
            setIsProcessingModalAdd(false);
            return;
          }
        } else {
          const defaultUrl = trackToAddDestination.url || (trackToAddDestination.id ? `https://www.youtube.com/watch?v=${trackToAddDestination.id}` : "");
          finalTracksToAdd = [{
            id: String(trackToAddDestination.id).startsWith("yt_") ? String(trackToAddDestination.id) : `yt_${trackToAddDestination.id}_${Date.now()}`,
            title: trackToAddDestination.title,
            artist: trackToAddDestination.artist,
            url: defaultUrl,
            duration: trackToAddDestination.duration || "N/A",
            bpm: 120,
            thumbnail: trackToAddDestination.thumbnail || trackToAddDestination.artwork_url || trackToAddDestination.artwork || (trackToAddDestination.id ? `https://i.ytimg.com/vi/${trackToAddDestination.id}/mqdefault.jpg` : ""),
          }];
        }

        if (trackToAddDestination && finalTracksToAdd.length === 0) {
          showNotification("No se encontraron canciones válidas.");
          setIsProcessingModalAdd(false);
          return;
        }
      }

      if (buildNew) {
        const name = modalNewPlaylistName.trim();
        if (!name) {
          showNotification("Por favor especifica un nombre para la nueva playlist.");
          setIsProcessingModalAdd(false);
          return;
        }

        // Detectar si ya existe en novedades para redirigir/evitar duplicación pública
        const normalizeStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const existsPublicly = userPlaylists.find(p => {
          if (p.ownerId === user?.uid) return false;
          const pName = normalizeStr(p.name);
          const newName = normalizeStr(name);
          
          if (pName === newName || (pName.length > 5 && newName.includes(pName)) || (newName.length > 5 && pName.includes(newName))) {
            return true;
          }
          
          if (p.tracks && finalTracksToAdd.length > 0) {
            let overlap = 0;
            const existingUrls = new Set(p.tracks.map(t => t.url));
            for (const t of finalTracksToAdd) {
              if (existingUrls.has(t.url)) overlap++;
            }
            if (overlap >= 2 && overlap / finalTracksToAdd.length > 0.6) {
               return true;
            }
          }
          return false;
        });

        if (existsPublicly) {
          showNotification(`El nombre "${name}" ya existe en Novedades. Usa el buscador para añadirlo a tu biblioteca. Si deseas una versión propia, elige otro nombre.`);
          setIsProcessingModalAdd(false);
          setIsAddingToPlaylistModalOpen(false);
          return;
        }

        const desc = modalNewPlaylistDesc.trim();
        const firstTrack = finalTracksToAdd[0];
        const firstTrackCover = firstTrack ? (firstTrack.artwork_url || firstTrack.thumbnail || firstTrack.artwork) : null;
        const trackDestCover = trackToAddDestination ? (trackToAddDestination.artwork_url || trackToAddDestination.thumbnail || trackToAddDestination.artwork) : null;

        let generatedCoverUrl = firstTrackCover || trackDestCover || "";

        if (!generatedCoverUrl) {
          const songsInPlaylist = finalTracksToAdd.slice(0, 8).map(t => t.title).join(", ");
          const contextInfo = desc ? ` theme: ${desc}` : '';
          const promptContext = songsInPlaylist ? `, inspired by songs like: ${songsInPlaylist}` : '';
          const promptBase = `Abstract artistic music album cover for "${name}"${contextInfo}${promptContext}`;
          const prompt = encodeURIComponent(`${promptBase}, highly detailed, stunning lighting, 4k, no text, no fonts, no words, beautiful vibrant layout`);
          const randomSeed = Math.floor(Math.random() * 1000000);
          generatedCoverUrl = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true&seed=${randomSeed}`;
        }

        const isMasterAdmin = (savedSecurityCode === "ho82788278") || isAdmin;
        let displayOwnerName = currentUser.displayName || "Usuario";
        
        if (isMasterAdmin) {
          displayOwnerName = "#fluxmusicoficial";
        }

        const newPlDoc = {
          name: name,
          genre: "Personalizado",
          description: desc,
          icon: "📂",
          thumbnail_url: generatedCoverUrl,
          ownerId: currentUser.uid,
          ownerName: displayOwnerName,
          isPublic: true,
          adminSecret: savedSecurityCode || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          tracks: finalTracksToAdd,
          folder: "general",
        };

        const docRef = await addDoc(
          collection(db, "users", currentUser.uid, "playlists"),
          newPlDoc
        );

        showNotification(`Nueva playlist "${name}" creada con éxito.`);
        
        const newlyCreatedPlaylist: MusicPlaylist = {
          id: docRef.id,
          ...newPlDoc,
          createdAt: new Date(),
          updatedAt: new Date(),
          tracks: finalTracksToAdd,
        } as any;
        setSelectedPlaylist(newlyCreatedPlaylist);
        localStorage.setItem("gym_music_selected_playlist_id", docRef.id);
      } else {
        if (!trackToAddDestination) {
           showNotification("No hay canción seleccionada para añadir.");
           setIsProcessingModalAdd(false);
           return;
        }
        const targetPl = userPlaylists.find(p => p.id === targetPlaylistId);
        if (!targetPl) {
          showNotification("La playlist de destino no existe.");
          setIsProcessingModalAdd(false);
          return;
        }

        const isMasterAdmin = savedSecurityCode === "ho82788278";
        if (targetPl.ownerId !== currentUser.uid && !isAdmin && !isMasterAdmin) {
          showNotification("No tienes permisos para modificar esta playlist.");
          setIsProcessingModalAdd(false);
          return;
        }

        const targetOwnerId = targetPl.ownerId || currentUser.uid;
        const docRef = doc(db, "users", targetOwnerId, "playlists", targetPl.id);
        const updatedTracks = [...(targetPl.tracks || []), ...finalTracksToAdd];

        let updateData: any = { tracks: updatedTracks, updatedAt: serverTimestamp() };

        const firstTrack = updatedTracks[0];
        const firstTrackCover = firstTrack ? (firstTrack.artwork_url || firstTrack.thumbnail || firstTrack.artwork) : null;

        const currentCover = targetPl.thumbnail_url || "";
        const isDefaultCover = !currentCover || currentCover === "📂" || currentCover === "" || currentCover.includes("pollinations.ai");

        if (firstTrackCover && isDefaultCover) {
          updateData.thumbnail_url = firstTrackCover;
        }

        await updateDoc(docRef, updateData);

        if (selectedPlaylist?.id === targetPl.id) {
          setSelectedPlaylist({ 
            ...selectedPlaylist, 
            tracks: updatedTracks,
            thumbnail_url: updateData.thumbnail_url || selectedPlaylist.thumbnail_url 
          });
        }
        showNotification(`Añadido con éxito a "${targetPl.name}".`);
      }

      setIsAddingToPlaylistModalOpen(false);
      setTrackToAddDestination(null);
      setModalNewPlaylistName("");
      setModalNewPlaylistDesc("");
    } catch (err) {
      console.error(err);
      showNotification("Error procesando solicitud.");
    } finally {
      setIsProcessingModalAdd(false);
    }
  };

  const importAllExpandedTracks = async (tracks: MusicTrack[]) => {
    if (!selectedPlaylist?.id || selectedPlaylist.id === "all") {
      showNotification("Selecciona una de tus playlists primero.");
      return;
    }

    const isMasterAdmin = savedSecurityCode === "ho82788278";
    if (selectedPlaylist.ownerId !== user?.uid && !isAdmin && !isMasterAdmin) {
      showNotification("No tienes permisos para modificar esta playlist.");
      return;
    }

    try {
      const targetOwnerId = selectedPlaylist.ownerId || user?.uid;
      if (!targetOwnerId) return;

      const docRef = doc(db, "users", targetOwnerId, "playlists", selectedPlaylist.id);
      const updatedTracks = [...(selectedPlaylist.tracks || []), ...tracks];
      
      let updateData: any = { tracks: updatedTracks, updatedAt: serverTimestamp() };

      const firstTrack = updatedTracks[0];
      const firstTrackCover = firstTrack ? (firstTrack.artwork_url || firstTrack.thumbnail || firstTrack.artwork) : null;

      const currentCover = selectedPlaylist.thumbnail_url || "";
      const isDefaultCover = !currentCover || currentCover === "📂" || currentCover === "" || currentCover.includes("pollinations.ai") || currentCover.includes("image.pollinations.ai");

      if (firstTrackCover && isDefaultCover) {
        updateData.thumbnail_url = firstTrackCover;
      }

      await updateDoc(docRef, updateData);

      setSelectedPlaylist({ 
        ...selectedPlaylist, 
        tracks: updatedTracks,
        thumbnail_url: updateData.thumbnail_url || selectedPlaylist.thumbnail_url
      });
      showNotification(`Se añadieron ${tracks.length} canciones con éxito.`);
    } catch (err) {
      console.error(err);
      showNotification("Error al añadir las canciones.");
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (trackListTab === "search" && searchQuery.trim().length > 2) {
      timeoutId = setTimeout(() => {
        handleYoutubeSearch();
      }, 700);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [searchQuery, trackListTab]);

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

  const addYoutubeTrackToPlaylist = (ytTrack: any) => {
    setTrackToAddDestination(ytTrack);
    const isMasterAdmin = savedSecurityCode === "ho82788278";
    const canWrite = selectedPlaylist && selectedPlaylist.id !== "all" && (selectedPlaylist.ownerId === user?.uid || isAdmin || isMasterAdmin);
    setModalSelectedPlaylistId(canWrite ? selectedPlaylist!.id : "new");
    setModalNewPlaylistName(ytTrack?.artist ? `Playlist de ${ytTrack.artist}` : `Mix de ${ytTrack.title}`);
    setModalNewPlaylistDesc(`Canal personalizado basado en ${ytTrack.title}`);
    setIsAddingToPlaylistModalOpen(true);
  };

  const saveCommunityPlaylistToLibrary = async (pl: MusicPlaylist) => {
    try {
      let currentUser = user;
      if (!currentUser) {
        const { signInAnonymously: firebaseSignInAnonymously, auth: firebaseAuth } = await import("../lib/firebase");
        const cred = await firebaseSignInAnonymously(firebaseAuth);
        currentUser = cred.user;
      }

      if (!currentUser) {
        showNotification("Debes iniciar sesión para usar la biblioteca.");
        return;
      }

      const existingPl = userPlaylists.find(p => p.ownerId === currentUser.uid && p.name === pl.name);
      if (existingPl) {
        showNotification("Ya tienes esta playlist en tu biblioteca.");
        return;
      }

      // Copiamos la playlist
      const newPl = {
        name: pl.name,
        description: pl.description || "",
        thumbnail_url: pl.thumbnail_url || "",
        category: "Local",
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || nicknameInput || "Premium Member",
        isPublic: true,
        folder: "general",
        tracks: pl.tracks || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", currentUser.uid, "playlists"), newPl);
      showNotification(`"${pl.name}" guardada en tu biblioteca.`);
    } catch (err) {
      console.error(err);
      showNotification("Error guardando playlist.");
    }
  };

  const handleAddToQueue = (track: MusicTrack, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setTrackQueue(q => [...q, track]);
    showNotification(`Añadida a la cola: ${track.title}`);
  };

  const handleToggleFavorite = async (track: MusicTrack, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      showNotification("Debes iniciar sesión para añadir a favoritos");
      return;
    }
    
    // Find "Favoritos"/"Siguiente" playlist for user
    const favPlaylist = userPlaylists.find(p => p.ownerId === user.uid && (p.name.toLowerCase() === "favoritos" || p.name.toLowerCase() === "siguiente"));
    
    if (!favPlaylist) {
      const newPl: any = {
        name: "Siguiente",
        genre: "Siguiente",
        description: "Tus pistas favoritas",
        tracks: [track],
        thumbnail_url: "",
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Usuario Premium",
        isPublic: false,
        adminSecret: "ho82788278",
        icon: "❤️",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      try {
        await addDoc(collection(db, "users", user.uid, "playlists"), newPl);
        showNotification("Guardado en Favoritos");
      } catch (err) {
        console.error("Error creating Favoritos:", err);
        showNotification("Error creando Favoritos");
      }
      return;
    }

    const getVid = (u?: string) => {
      if (!u) return null;
      const m = u.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
      return m ? m[1] : null;
    };
    
    const isMatch = (t1: any, t2: any) => {
      if (t1.id && t2.id && t1.id === t2.id) return true;
      if (t1.url && t2.url && t1.url === t2.url) return true;
      const v1 = getVid(t1.url);
      const v2 = getVid(t2.url);
      if (v1 && v2 && v1 === v2) return true;
      return false;
    };

    const trackExists = favPlaylist.tracks.some(t => isMatch(t, track));

    try {
      // Use stored path if available, otherwise fallback to standard user path
      const plRef = favPlaylist.path 
        ? doc(db, favPlaylist.path)
        : doc(db, "users", user.uid, "playlists", favPlaylist.id);
        
      if (trackExists) {
        // Filter out by both ID and URL for robustness
        const updatedTracks = favPlaylist.tracks.filter(t => !isMatch(t, track));
        
        await updateDoc(plRef, {
          tracks: updatedTracks,
          updatedAt: serverTimestamp()
        });
        showNotification("Eliminado de Favoritos");
      } else {
        await updateDoc(plRef, {
          tracks: [...favPlaylist.tracks, track],
          updatedAt: serverTimestamp()
        });
        showNotification("Añadido a Favoritos");
      }
    } catch (err: any) {
      console.error("Error updating Favoritos:", err);
      // If error is permission denied, show a more specific message
      if (err.code === 'permission-denied') {
        showNotification("Error de permisos en Favoritos");
      } else {
        showNotification("Error actualizando Favoritos");
      }
    }
  };

  const selectPlaylist = (playlist: MusicPlaylist) => {
    setSelectedPlaylist(playlist);
    setShowLibrary(false);
    setIsSidebarExpanded(false);
    setTrackListTab("playlist");
    setMobileView("player");
  };

  const playPreviewTrack = (playlist: MusicPlaylist, trackIdx: number) => {
    expectedPlayingRef.current = true;
    setOverrideCurrentTrack(null);
    setShowLibrary(false);
    setIsSidebarExpanded(false);
    
    const isSamePlaylist = playingPlaylist?.id === playlist.id;
    setPlayingPlaylist(playlist);
    setSelectedPlaylist(playlist);
    
    if (isSamePlaylist) {
      if (currentTrackIndex === trackIdx) {
        expectedPlayingRef.current = !isPlaying;
        setIsPlaying(!isPlaying);
      } else {
        setIsLoadingTrack(true);
        setCurrentTrackIndex(trackIdx);
        setPosition(0);
        setDuration(0);
        setIsPlaying(true);
      }
    } else {
      setIsLoadingTrack(true);
      setCurrentTrackIndex(trackIdx);
      setPosition(0);
      setDuration(0);
      setIsPlaying(true);
    }
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
    currentTrackMeta?.thumbnail_url || getTrackImage(currentTrack) ||
    "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop";

  // USE STABLE HANDLERS FOR MEDIA SESSION TO PREVENT LOCK SCREEN LAG/RE-REGISTRATION ISSUES
  const handlersRef = useRef({ togglePlayback, handleNext, handlePrev, setIsPlaying, volume });
  useEffect(() => {
    handlersRef.current = { togglePlayback, handleNext, handlePrev, setIsPlaying, volume };
  }, [togglePlayback, handleNext, handlePrev, setIsPlaying, volume]);

  // Sync Position State with Lock Screen - THROTTLED ECO OPTIMAL
  const lastSyncTrackRef = useRef<number>(-1);
  const lastSyncIsPlayingRef = useRef<boolean>(false);
  const lastSessionSyncTimeRef = useRef<number>(0);
  const lastSyncDurationRef = useRef<number>(0);

  useEffect(() => {
    const isPlayingChanged = lastSyncIsPlayingRef.current !== isPlaying;
    const isNewTrack = lastSyncTrackRef.current !== currentTrackIndex;
    const isDurationChanged = lastSyncDurationRef.current !== duration;

    // Only synchronize media session on explicit playback state shifts or duration loads
    // to strictly preserve zero-CPU idling when playing in the background.
    if (isPlayingChanged || isNewTrack || isDurationChanged) {
      if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
        try {
          // Fetch exact native time to prevent lockscreen progress jump backwards
          const actualSeconds = youtubePlayerRef.current?.getCurrentTime() || (position / 1000);
          navigator.mediaSession.setPositionState({
            duration: (duration || 0) / 1000,
            playbackRate: 1,
            position: actualSeconds,
          });
          lastSyncDurationRef.current = duration;
          lastSyncTrackRef.current = currentTrackIndex;
          lastSyncIsPlayingRef.current = isPlaying;
        } catch (e) {}
      }
    }
  }, [position, duration, isPlaying, currentTrackIndex]);

  // Removed generic `isPlaying` sync for fallback audio. 
  // We now orchestrate the silent audio track manually:
  // It only plays during transitions or pausing to hold the background audio lock.

  const durationRef = useRef(duration);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  const sessionHandlersRef = useRef<Record<string, any>>({});

  const enforceActionHandlers = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    if (!sessionHandlersRef.current.playHandler) {
      // Define handlers that use the latest state via handlersRef to avoid stale closures, but keep references stable!
      sessionHandlersRef.current.playHandler = () => {
        expectedPlayingRef.current = true;
        handlersRef.current.setIsPlaying(true);
        if (fallbackSilentAudioRef.current) fallbackSilentAudioRef.current.play().catch(() => {});
        if (youtubePlayerRef.current) {
          try {
            const intPlayer = youtubePlayerRef.current.getInternalPlayer();
            if (intPlayer) {
              if (typeof intPlayer.unMute === "function") {
                intPlayer.unMute();
              }
              if (typeof intPlayer.setVolume === "function") {
                intPlayer.setVolume(handlersRef.current.volume || 100);
              }
              if (typeof intPlayer.playVideo === "function") {
                intPlayer.playVideo();
              } else if (typeof intPlayer.play === "function") {
                intPlayer.play();
              }
            }
          } catch (e) {}
        }
      };
      
      sessionHandlersRef.current.pauseHandler = () => {
        expectedPlayingRef.current = false;
        handlersRef.current.setIsPlaying(false);
        if (fallbackSilentAudioRef.current) fallbackSilentAudioRef.current.pause();
        if (youtubePlayerRef.current) {
          try {
            const intPlayer = youtubePlayerRef.current.getInternalPlayer();
            if (intPlayer && typeof intPlayer.pauseVideo === "function") {
              intPlayer.pauseVideo();
            } else if (intPlayer && typeof intPlayer.pause === "function") {
              intPlayer.pause();
            }
          } catch (e) {}
        }
      };
      
      sessionHandlersRef.current.nextHandler = () => handlersRef.current.handleNext();
      sessionHandlersRef.current.prevHandler = () => handlersRef.current.handlePrev();
      
      sessionHandlersRef.current.seekforwardHandler = () => {
        if (youtubePlayerRef.current) {
          const currentSec = youtubePlayerRef.current.getCurrentTime() || 0;
          const target = currentSec + 10;
          youtubePlayerRef.current.seekTo(target, "seconds");
          try {
            navigator.mediaSession.setPositionState({
              duration: (durationRef.current || 0) / 1000,
              playbackRate: 1,
              position: target,
            });
          } catch(e){}
        }
      };
      
      sessionHandlersRef.current.seekbackwardHandler = () => {
        if (youtubePlayerRef.current) {
          const currentSec = youtubePlayerRef.current.getCurrentTime() || 0;
          const target = Math.max(0, currentSec - 10);
          youtubePlayerRef.current.seekTo(target, "seconds");
          try {
            navigator.mediaSession.setPositionState({
              duration: (durationRef.current || 0) / 1000,
              playbackRate: 1,
              position: target,
            });
          } catch(e){}
        }
      };

      sessionHandlersRef.current.seektoHandler = (details: any) => {
        if (details.seekTime !== undefined && youtubePlayerRef.current) {
          youtubePlayerRef.current.seekTo(details.seekTime, "seconds");
          try {
            navigator.mediaSession.setPositionState({
              duration: (durationRef.current || 0) / 1000,
              playbackRate: 1,
              position: details.seekTime,
            });
          } catch(e){}
        }
      };
    }

    // Register handlers - always register both next and prev to ensure they show up on iOS/Bluetooth/Car
    const actions: [MediaSessionAction, () => void][] = [
      ["play", sessionHandlersRef.current.playHandler],
      ["pause", sessionHandlersRef.current.pauseHandler],
      ["previoustrack", sessionHandlersRef.current.prevHandler],
      ["nexttrack", sessionHandlersRef.current.nextHandler],
      ["seekforward", sessionHandlersRef.current.seekforwardHandler],
      ["seekbackward", sessionHandlersRef.current.seekbackwardHandler],
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
      navigator.mediaSession.setActionHandler("seekto", sessionHandlersRef.current.seektoHandler);
    } catch (e) {}
  }, []);

  const registerMediaSession = useCallback(() => {
    if (!("mediaSession" in navigator)) return;

    // Update Metadata
    navigator.mediaSession.metadata = new MediaMetadata({
      title: displayTitle,
      artist: displayArtist,
      album: selectedPlaylist?.name || "Flux Music",
      artwork: [
        { src: displayArtwork, sizes: "512x512", type: "image/jpeg" },
        { src: displayArtwork, sizes: "256x256", type: "image/jpeg" },
        { src: displayArtwork, sizes: "96x96", type: "image/jpeg" },
      ],
    });

    enforceActionHandlers();
  }, [displayTitle, displayArtist, displayArtwork, selectedPlaylist, enforceActionHandlers]);

  // Media Session API Integration for background playback
  useEffect(() => {
    registerMediaSession();
  }, [registerMediaSession]);

  // Periodic background safeguard to protect and recover hijacked Media Session action handlers.
  // Runs extremely efficiently natively via audio timeupdate, preserving battery and fully respecting Eco Mode guidelines,
  // guaranteeing that steering wheel/car bluetooth next/prev skip buttons remain active.
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    // Run once immediately when state changes
    enforceActionHandlers();
  }, [enforceActionHandlers, currentTrackIndex, isPlaying]);

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
    <div className={`bg-[#080809]/90  text-white ${isEcoMode ? 'shadow-lg' : 'shadow-2xl'} h-full w-full flex flex-col border border-white/5 overflow-hidden font-sans relative sm:rounded-[40px] rounded-[32px]`}>
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
      <div className="absolute top-0 left-0 w-[10px] h-[10px] overflow-hidden pointer-events-none select-none z-[-1] opacity-0">
        <audio
          ref={fallbackSilentAudioRef}
          src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"
          loop
          playsInline
          onTimeUpdate={() => {
            const now = Date.now();

            if (now - lastSessionSyncTimeRef.current > 2000) {
              lastSessionSyncTimeRef.current = now;
              if (expectedPlayingRef.current) {
                enforceActionHandlers();
                // Crucial fix: Periodically reset position state to lock out the iframe from stealing
                if ("mediaSession" in navigator && navigator.mediaSession.setPositionState) {
                  try {
                    const actualSeconds = youtubePlayerRef.current?.getCurrentTime() || (position / 1000);
                    navigator.mediaSession.setPositionState({
                      duration: (durationRef.current || 0) / 1000,
                      playbackRate: 1,
                      position: actualSeconds,
                    });
                  } catch(e) {}
                }
              }
            }
          }}
        />
        {currentUrl && (
          <ReactPlayer
            ref={youtubePlayerRef}
            url={currentUrl}
            playing={isPlaying}
            volume={volume / 100}
            progressInterval={5000}
            onError={async (e) => {
              console.warn("ReactPlayer Error:", e);
              // Auto-recovery mechanism when experiencing network drops
              if (expectedPlayingRef.current && youtubePlayerRef.current) {
                setTimeout(() => {
                  try {
                    youtubePlayerRef.current.seekTo(position / 1000, "seconds");
                    const intPlayer = youtubePlayerRef.current.getInternalPlayer();
                    if (intPlayer && typeof intPlayer.playVideo === "function") {
                      intPlayer.playVideo();
                    }
                  } catch (err) {}
                }, 2000);
              }
            }}
            onReady={(player) => {
              // Re-register Media Session and reinforce action handlers to beat YouTube iframe's own initial lock screen registration
              registerMediaSession();
              enforceActionHandlers();

              if (initialLoadRef.current) {
                const savedPos = localStorage.getItem("gym_music_saved_position");
                if (savedPos) {
                  const posInSecs = Number(savedPos) / 1000;
                  if (posInSecs > 0) {
                      player.seekTo(posInSecs, "seconds");
                  }
                }
                initialLoadRef.current = false;
              }
            }}
            onBuffer={() => {
              // Play silent audio to hold the iOS background session while buffering
              if (expectedPlayingRef.current && fallbackSilentAudioRef.current && fallbackSilentAudioRef.current.paused) {
                fallbackSilentAudioRef.current.play().catch(() => {});
              }
              // Safeguard action handlers when playback buffers to prevent iframe override
              enforceActionHandlers();
              setTimeout(() => enforceActionHandlers(), 150);
              setTimeout(() => enforceActionHandlers(), 500);
            }}
            onBufferEnd={() => {
              // Safeguard action handlers on buffer complete
              enforceActionHandlers();
            }}
            onPlay={() => {
               wasUnexpectedlyPausedRef.current = false;
               setIsPlaying(true);
               
               // Crucial iOS backgrounding fix: The YouTube iframe must be the ONLY
               // playing media element when the screen locks, otherwise the audio will cut.
               if (fallbackSilentAudioRef.current && !fallbackSilentAudioRef.current.paused) {
                 fallbackSilentAudioRef.current.pause();
               }

               enforceActionHandlers();
               registerMediaSession();

               // Crucial iOS fix: Ensure it doesn't get muted by Safari's autoplay policies when playing
               try {
                 if (youtubePlayerRef.current) {
                   const intPlayer = youtubePlayerRef.current.getInternalPlayer();
                   if (intPlayer) {
                     if (typeof intPlayer.unMute === "function") {
                       intPlayer.unMute();
                     }
                     if (typeof intPlayer.setVolume === "function") {
                       intPlayer.setVolume(handlersRef.current.volume || 100);
                     }
                   }
                 }
               } catch (e) {}
               
               setTimeout(() => { enforceActionHandlers(); registerMediaSession(); }, 500);
               setTimeout(() => { enforceActionHandlers(); registerMediaSession(); }, 2000);
            }}
            onPause={() => {
               // If we expect to be playing, never let the iframe stay paused
               if (expectedPlayingRef.current) {
                  wasUnexpectedlyPausedRef.current = true;
                  
                  // Grab the iOS background audio session lock back immediately
                  if (fallbackSilentAudioRef.current && fallbackSilentAudioRef.current.paused) {
                    fallbackSilentAudioRef.current.play().catch(() => {});
                  }

                  // Immediately counter react-player pause SYNCHRONOUSLY for iOS lock screen bypass
                  if (expectedPlayingRef.current && youtubePlayerRef.current) {
                    try {
                      const intPlayer = youtubePlayerRef.current.getInternalPlayer();
                      if (intPlayer) {
                        if (typeof intPlayer.unMute === "function") {
                          intPlayer.unMute();
                        }
                        if (typeof intPlayer.setVolume === "function") {
                          intPlayer.setVolume(handlersRef.current.volume || 100);
                        }
                        if (typeof intPlayer.playVideo === "function") {
                          intPlayer.playVideo();
                        } else if (typeof intPlayer.play === "function") {
                          intPlayer.play();
                        }
                      }
                    } catch(e) {}
                  }

                  setTimeout(() => {
                    if (expectedPlayingRef.current && youtubePlayerRef.current) {
                      try {
                        const intPlayer = youtubePlayerRef.current.getInternalPlayer();
                        if (intPlayer) {
                          if (typeof intPlayer.playVideo === "function") intPlayer.playVideo();
                          else if (typeof intPlayer.play === "function") intPlayer.play();
                        }
                      } catch(e) {}
                    }
                  }, 50);
                  // Extremely important: do NOT set isPlaying(false). This caused the audio to stop on iOS.
                  return;
               }
               setIsPlaying(false);
            }}
            onEnded={() => {
              if (fallbackSilentAudioRef.current && fallbackSilentAudioRef.current.paused) {
                fallbackSilentAudioRef.current.play().catch(() => {});
              }
              handleNext();
            }}
            onProgress={(state) => {
              if (document.visibilityState === 'visible') {
                setPosition(state.playedSeconds * 1000);
              }
              
              // Intelligent gapless logic: checking for silences/outros/intros using crowdsourced segments
              const played = state.playedSeconds;
              const durationCurrent = durationRef.current / 1000;
              const segments = sponsorBlockSegmentsRef.current;
              
              if (segments && segments.length > 0 && youtubePlayerRef.current) {
                if (skipTimeoutRef.current) {
                  clearTimeout(skipTimeoutRef.current);
                  skipTimeoutRef.current = null;
                }
                
                const activeSegment = segments.find(seg => played >= seg.start && played < seg.end);
                if (activeSegment) {
                   if (durationCurrent > 0 && activeSegment.end >= durationCurrent - 3) {
                     handleNextRef.current(); 
                   } else {
                     youtubePlayerRef.current.seekTo(activeSegment.end, 'seconds');
                   }
                } else {
                   const maxSkipWindowSeconds = (youtubePlayerRef.current?.props?.progressInterval || 5000) / 1000;
                   const nextSegment = segments.find(seg => seg.start > played && seg.start <= played + maxSkipWindowSeconds);
                   if (nextSegment) {
                      const msUntilSkip = Math.max(0, (nextSegment.start - played) * 1000);
                      skipTimeoutRef.current = setTimeout(() => {
                        if (isPlayingRef.current) {
                           if (durationCurrent > 0 && nextSegment.end >= durationCurrent - 3) {
                             handleNextRef.current();
                           } else {
                             youtubePlayerRef.current?.seekTo(nextSegment.end, 'seconds');
                           }
                        }
                      }, msUntilSkip);
                   }
                }
              }
            }}
            onDuration={(dur) => {
              if (document.visibilityState === 'visible' || duration === 0) {
                setDuration(dur * 1000);
              }
            }}
            config={{ 
              youtube: { 
                playerVars: { 
                  origin: window.location.origin, 
                  playsinline: 1,
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  modestbranding: 1,
                  rel: 0,
                  iv_load_policy: 3,
                  hl: 'en',
                  vq: 'tiny'
                } 
              },
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
      </div>

      {/* GLOBAL TABS / PILLS HEADER */}
      <Carousel className="px-3 py-2.5 gap-2 bg-[#050505]/95 select-none z-10 shrink-0 border-b border-white/5 snap-x w-full">
        <button
          onClick={() => {
            setSearchQuery("");
            setYoutubeResults([]);
            setPreviewPlaylist(null);
            setTrackListTab("search");
            setIsTrackListExpanded(true);
            setShowLibrary(false);
            setIsSidebarExpanded(false);
            if (window.innerWidth < 768) {
              setMobileView("player");
            }
          }}
          className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer border snap-start ${
            searchQuery === "" && trackListTab === "search" && !showLibrary && !isSidebarExpanded && (window.innerWidth >= 768 || mobileView === "player")
              ? "bg-white text-black border-white shadow-md"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          Explorar
        </button>
        <button
          onClick={() => {
            setSearchQuery("");
            setYoutubeResults([]);
            setPreviewPlaylist(null);
            setTrackListTab("entertainment");
            setIsTrackListExpanded(true);
            setShowLibrary(false);
            setIsSidebarExpanded(false);
            if (window.innerWidth < 768) {
              setMobileView("player");
            }
          }}
          className={`relative shrink-0 px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer border snap-start flex items-center justify-center ${
            trackListTab === "entertainment" && !showLibrary && !isSidebarExpanded && (window.innerWidth >= 768 || mobileView === "player")
              ? "bg-purple-500 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          Podcasts
          {Date.now() < new Date("2026-06-18T17:16:26Z").getTime() && (
            <span className="absolute -top-1.5 -right-1 px-1 py-[1px] bg-rose-500 text-white text-[7px] font-black uppercase tracking-widest rounded shadow-lg rotate-[8deg] animate-pulse">
              Nuevo
            </span>
          )}
        </button>
        <button
          onClick={() => {
            if (window.innerWidth < 768) {
              setShowLibrary(false);
              if (mobileView === "playlists") {
                setMobileView("player");
              } else {
                setMobileView("playlists");
                setIsTrackListExpanded(true);
              }
            } else {
              setShowLibrary(false);
              setIsSidebarExpanded(!isSidebarExpanded);
            }
          }}
          className={`hidden md:flex shrink-0 px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer border snap-start items-center gap-1.5 ${
            isSidebarExpanded || (window.innerWidth < 768 && mobileView === "playlists" && !showLibrary)
               ? "bg-[#1ED760] text-black border-[#1ED760] shadow-[0_0_15px_rgba(30,215,96,0.2)]"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          <Library className="w-3.5 h-3.5" />
          Mi Biblioteca
        </button>
        <button
          onClick={() => {
            if (showLibrary) {
              setShowLibrary(false);
            } else {
              setShowLibrary(true);
              setPreviewPlaylist(null);
              setIsSidebarExpanded(false);
              if (window.innerWidth < 768) {
                setMobileView("player");
              }
            }
          }}
          className={`hidden md:flex shrink-0 px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer border snap-start ${
            showLibrary
              ? "bg-[#1ED760] text-black border-[#1ED760] shadow-[0_0_15px_rgba(30,215,96,0.2)]"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          Comunidad
        </button>
        {[
          { label: "Energía", query: "Energía Mix Oficial YouTube Music Playlist" },
          { label: "Relax", query: "Relax Chill Mix Oficial YouTube Music Playlist" },
          { label: "Éxitos", query: "Exitos Mix Oficial YouTube Music Playlist" },
          { label: "Fiesta", query: "Fiesta Reggaeton Mix Oficial YouTube Music Playlist" },
          { label: "Concentración", query: "Concentración Focus Mix Oficial YouTube Music Playlist" }
        ].map((pill, idx) => (
          <button
            key={idx}
            onClick={() => {
              setShowLibrary(false);
              setIsSidebarExpanded(false);
              setSelectedPlaylist(null);
              if (searchQuery === pill.label) {
                setSearchQuery("");
                setYoutubeResults([]);
                setPreviewPlaylist(null);
                setTrackListTab("search");
              } else {
                setSearchQuery(pill.label);
                setPreviewPlaylist(null);
                setTrackListTab("search");
                setIsSearchingYT(true);
                fetch(`/api/youtube/search?q=${encodeURIComponent(pill.query)}`)
                  .then(res => res.json())
                  .then(data => setYoutubeResults(data))
                  .catch(console.error)
                  .finally(() => setIsSearchingYT(false));
              }
              setIsTrackListExpanded(true);
            }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold transition-all cursor-pointer border snap-start ${
              searchQuery === pill.label && trackListTab === "search"
                ? "bg-white text-black border-white shadow-md"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            {pill.label}
          </button>
        ))}
      </Carousel>

      <div className="flex-1 flex flex-row min-h-0 relative overflow-hidden">
        {/* SIDEBAR OVERLAY BACKGROUND (Desktop only) */}
        {isSidebarExpanded && (
           <div 
             className="hidden md:block absolute inset-0 bg-black/60  z-[40]" 
             onClick={() => setIsSidebarExpanded(false)}
           />
        )}

        {/* SIDEBAR */}
        <div className={`
           ${mobileView === "playlists" ? "flex w-full" : "hidden md:flex"} 
           flex-col border-r border-white/5 shrink-0 overflow-hidden 
           md:absolute md:top-0 md:bottom-0 md:w-[280px] z-[50] 
           transition-transform duration-300 ease-in-out
           ${!isSidebarExpanded && mobileView !== "playlists" ? "md:-translate-x-full md:pointer-events-none" : "md:translate-x-0 cursor-default bg-[#050505] shadow-[10px_0_30px_rgba(0,0,0,0.8)]"}
           bg-[#050505]
        `}>
            <div className="p-3 border-b border-white/[0.03] shrink-0 flex items-center justify-between w-full h-auto">
                <div className="text-left">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Mi Biblioteca
                    </h3>
                </div>
            </div>
            
            <div className="flex flex-col p-3 md:p-3 gap-2.5 overflow-y-auto scrollbar-none flex-1 min-h-0 w-full items-stretch">
                {/* Spotify-style Create Playlist Button */}
                {accessData?.isValid && (
                  <button 
                    onClick={handleAddNewCanalClick}
                    className="group relative flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden mb-2 shadow-xl active:scale-[0.98]"
                  >
                    <div className="relative w-10 h-10 shrink-0 rounded-lg bg-[#333] flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg">
                      <Plus className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden text-left">
                        <span className="text-[11px] font-black text-white uppercase tracking-wider group-hover:text-[#1ED760] transition-colors">Crear playlist</span>
                        <span className="text-[9px] text-slate-500 font-bold truncate">Nueva lista vacía</span>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 duration-300">
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </button>
                )}

                {(() => {
                  const filteredList = userPlaylists.filter(pl => pl.ownerId === user?.uid);

                  if (filteredList.length === 0 && !accessData?.isValid) {
                    return (
                      <div className="text-center py-10 px-4 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-slate-600 mb-2">
                          <ListMusic className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed font-bold">
                          Tu biblioteca está vacía
                        </p>
                      </div>
                    );
                  }

                  // 1) Extract 'Favoritos' system-playlist
                  const favoritosPlaylist = filteredList.find(pl => pl.name?.toLowerCase() === 'favoritos' || pl.name?.toLowerCase() === 'siguiente');
                  const otherPlaylists = filteredList.filter(pl => pl.name?.toLowerCase() !== 'favoritos' && pl.name?.toLowerCase() !== 'siguiente');

                  // 2) Group other playlists: default folder is "Tus Listas" (folder !== "root")
                  const folderPlaylists = otherPlaylists.filter(pl => pl.folder !== "root" && localFoldersMap[pl.id] !== "root");
                  const rootPlaylists = otherPlaylists.filter(pl => pl.folder === "root" || localFoldersMap[pl.id] === "root");

                  // Pin 'favoritos' to very top of general list if they contain anything, but we pin it uniquely outside the folder!
                  const sortedFolderList = [...folderPlaylists];
                  const sortedRootList = [...rootPlaylists];

                  const renderPlaylistItem = (pl: MusicPlaylist, isNested: boolean) => {
                    const isSelected = selectedPlaylist?.id === pl.id;
                    const gradient = getPlaylistGradientClass(pl.name);
                    const isInFolder = pl.folder !== "root" && localFoldersMap[pl.id] !== "root";

                    return (
                        <div 
                          key={pl.id} 
                          onClick={() => selectPlaylist(pl)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              selectPlaylist(pl);
                            }
                          }}
                          className={`group relative cursor-pointer flex flex-row items-center justify-start gap-3 p-3 rounded-xl transition-all text-left shrink-0 ${
                            isSelected 
                              ? 'bg-[#1ED760]/5 border-l-[3px] border-[#1ED760] ring-1 ring-[#1ED760]/10' 
                              : 'border-l-[3px] border-transparent hover:bg-white/[0.03]'
                          }`}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-[68px] md:pr-4">
                              {/* Dynamic Premium Cover Art */}
                              <div className={`relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-sm md:text-lg font-black text-white/90 shadow-md overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300`}>
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
                                      { (pl.thumbnail_url || getTrackImage(pl.tracks?.[0])) && (
                                        <img 
                                          src={pl.thumbnail_url || getTrackImage(pl.tracks?.[0]) || ""} 
                                          alt={pl.name} 
                                           className="absolute inset-0 w-full h-full object-cover z-20 bg-[#0d0d0f]" loading="lazy" 
                                          referrerPolicy="no-referrer"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      )}
                                  </>
   
                                  {/* Hover Play Indicator Overlay */}
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Play className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-white scale-90 group-hover:scale-100 transition-transform duration-300" />
                                  </div>
                              </div>
   
                              {/* Info - Takes main space, shrinks cleanly */}
                              <div className="min-w-0 text-left flex flex-col justify-center items-start flex-1">
                                  <p className={`text-[12px] md:text-[13px] font-bold truncate leading-none w-full ${
                          isSelected ? 'text-[#1ED760]' : 'text-white/90 group-hover:text-white'
                        }`}>
                                      {pl.name}
                                  </p>
                                  <p className="text-[10px] md:text-[11px] text-slate-400 font-extrabold mt-0.5 truncate w-full" title={`${pl.tracks?.length || 0} pistas`}>
                                      {pl.tracks.length} {pl.tracks.length === 1 ? 'Pista' : 'Pistas'} • <span className="text-[#1ED760] font-black">{calculatePlaylistDuration(pl.tracks)}</span>
                                  </p>
                              </div>
                            </div>
                            
                            {/* Actions Bar - Positioned absolutely at the right, fully aligned with no superposition risk */}
                            {pl.name?.toLowerCase() !== 'favoritos' && (
                              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 shrink-0 z-20 transition-all duration-200 md:opacity-0 md:group-hover:opacity-100">
                                {/* Move Folder Action */}
                                <button
                                  onClick={(e) => toggleMoverPlaylistACarpeta(pl, e)}
                                  className={`p-1.5 rounded-lg transition-all shadow-xl  cursor-pointer ${
                                    isInFolder 
                                      ? 'bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/20' 
                                      : 'bg-[#1ED760]/10 hover:bg-[#1ED760] text-[#1ED760] hover:text-black border border-[#1ED760]/20'
                                  }`}
                                  title={isInFolder ? "Sacar de Tus Listas" : "Mover a Tus Listas"}
                                >
                                  {isInFolder ? (
                                    <FolderMinus className="w-3.5 h-3.5" />
                                  ) : (
                                    <FolderPlus className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {/* Delete Button */}
                                {(user?.uid === pl.ownerId || isAdmin) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startDeleting(pl.id);
                                    }}
                                    className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-xl  border border-red-500/20 cursor-pointer"
                                    title="Eliminar Canal"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                        </div>
                    );
                  };

                  return (
                    <div className="flex flex-col gap-2.5 w-full">
                      {/* Pinned Favoritos Area (Spotify Style) */}
                      {favoritosPlaylist && (
                        <div 
                          onClick={() => selectPlaylist(favoritosPlaylist)}
                          className={`group relative cursor-pointer flex flex-row items-center justify-between p-3 rounded-2xl transition-all text-left shrink-0 mb-1 border border-transparent ${
                            selectedPlaylist?.id === favoritosPlaylist.id 
                              ? 'bg-[#1ED760]/5 border-l-[3px] border-[#1ED760] ring-1 ring-[#1ED760]/10' 
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Pinned Heart cover art */}
                            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center shadow-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                              <Heart className="w-5 h-5 text-white fill-white shadow-md relative z-10" />
                              
                              {/* Hover Play Indicator Overlay */}
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-3.5 h-3.5 md:w-4 md:h-4 text-white fill-white translate-x-px" />
                              </div>
                            </div>

                            {/* Text details */}
                            <div className="flex-1 min-w-0 text-left flex flex-col justify-center items-start">
                              <p className="text-[12px] md:text-[13px] font-black text-rose-400 group-hover:text-pink-400 transition-colors uppercase tracking-wider leading-none">
                                Tus Siguiente
                              </p>
                              <p className="text-[10px] md:text-[11px] text-slate-400 font-extrabold mt-1 uppercase tracking-wide truncate w-full">
                                {favoritosPlaylist.tracks?.length || 0} {favoritosPlaylist.tracks?.length === 1 ? 'Canción' : 'Canciones'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tus Listas Accordion Header */}
                      <div 
                        onClick={() => {
                          const newVal = !folderExpanded;
                          setFolderExpanded(newVal);
                          localStorage.setItem("gym_music_folder_expanded", String(newVal));
                        }}
                        className="group relative cursor-pointer flex flex-row items-center justify-between p-3 rounded-2xl bg-[#09090b] border border-white/5 hover:bg-white/[0.05] transition-all text-left shrink-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-[#1ED760]/20 to-emerald-500/5 border border-[#1ED760]/20 flex items-center justify-center text-[#1ED760] shadow-md shrink-0">
                            <ListMusic className="w-5 h-5 shadow-lg" />
                            {sortedFolderList.length > 0 && (
                              <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                                <span className={`${isEcoMode ? '' : 'animate-ping'} absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75`}></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1ED760]"></span>
                              </span>
                            )}
                          </div>
                          
                          <div className="min-w-0">
                            <p className="text-[12px] md:text-[13px] font-black text-white group-hover:text-[#1ED760] transition-colors uppercase tracking-wide leading-none">
                              Tus Listas
                            </p>
                            <p className="text-[9px] md:text-[10px] text-[#1ED760] font-black mt-1 uppercase tracking-wider">
                              {sortedFolderList.length} {sortedFolderList.length === 1 ? "Playlist" : "Playlists"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 pr-1">
                          {folderExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Content of the Folder, if expanded */}
                      <AnimatePresence>
                        {folderExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden flex flex-col gap-2 pl-3 ml-2 border-l border-white/5"
                          >
                            {sortedFolderList.length === 0 ? (
                              <p className="text-[10px] text-slate-500 italic py-2 pl-3 select-none">
                                Vacía. Todo lo que agregues irá aquí.
                              </p>
                            ) : (
                              sortedFolderList.map(pl => renderPlaylistItem(pl, true))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Root Playlists (Outside folder, if any) */}
                      {sortedRootList.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/[0.03]">
                          <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider px-3 select-none">
                            Otras Listas
                          </p>
                          {sortedRootList.map(pl => renderPlaylistItem(pl, false))}
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>



            {/* User Session & Status */}
            {!user ? (
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
            ) : (
              <div className="p-2 md:p-3 md:mt-auto border-t border-white/5 bg-black/20 flex flex-col items-stretch gap-2 shrink-0 relative">
                
                {/* Floating Dropdown Menú Estilo Spotify */}
                <AnimatePresence>
                  {isMembershipDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute bottom-full left-2 right-2 mb-2 bg-[#121214] border border-white/10 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] p-1.5 z-[100] flex flex-col backdrop-blur-md"
                    >
                      {/* Dropdown Header Info */}
                      <div className="px-3 py-2 border-b border-white/5 mb-1 text-left">
                        <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">
                          Suscripción Premium
                        </p>
                        <p className="text-[10px] text-[#1ED760] font-extrabold mt-0.5 truncate max-w-full">
                          {accessData?.daysRemaining || 0} Días restantes
                        </p>
                      </div>

                      {/* Dropdown Items */}
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setIsMembershipDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer text-[11px] font-bold"
                      >
                        <User className="w-4 h-4 text-[#1ED760]" />
                        <span>Mi Perfil (Editar Datos)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsSupportModalOpen(true);
                          setIsMembershipDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer text-[11px] font-bold"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>Soporte Técnico</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsAdminPanelOpen(true);
                            setIsMembershipDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#1ED760] hover:text-emerald-300 hover:bg-[#1ED760]/10 transition-colors cursor-pointer text-[11px] font-black"
                        >
                          <Shield className="w-4 h-4 text-[#1ED760]" />
                          <span>Panel de Admin</span>
                        </button>
                      )}

                      {deferredPrompt && (
                        <button
                          onClick={() => {
                            handleInstallClick();
                            setIsMembershipDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 transition-colors cursor-pointer text-[11px] font-bold"
                        >
                          <Download className="w-4 h-4 text-yellow-400" />
                          <span>Instalar App en el Móvil</span>
                        </button>
                      )}

                      <div className="border-t border-white/5 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setIsMembershipDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-[11px] font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Spotify-style User Pill Button */}
                <button
                  onClick={() => setIsMembershipDropdownOpen(!isMembershipDropdownOpen)}
                  className={`flex items-center justify-between gap-2.5 p-2 bg-white/[0.03] hover:bg-white/[0.08] active:scale-[0.98] border rounded-full cursor-pointer transition-all w-full select-none text-left z-20 ${
                    isMembershipDropdownOpen ? "border-[#1ED760]/40 bg-white/[0.06] shadow-[0_0_15px_rgba(30,215,96,0.15)]" : "border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Circle Avatar with Initials */}
                    <div className="w-7 h-7 bg-gradient-to-tr from-emerald-500 to-[#1ED760] rounded-full flex items-center justify-center text-black font-black text-[11px] shrink-0 shadow-md">
                      <span>
                        {user.displayName ? user.displayName.substring(0, 2).toUpperCase() : "SP"}
                      </span>
                    </div>

                    <div className="text-left min-w-0">
                      <p className="text-[10px] text-white font-extrabold truncate uppercase tracking-wide leading-tight">
                        {user.displayName || "Socio Premium"}
                      </p>
                      <p className="text-[8px] text-[#1ED760] font-black uppercase tracking-wider leading-none mt-0.5">
                        {user.email === "eltygere8651@gmail.com" ? "Administrador" : `Premium • ${accessData?.daysRemaining || 0}d`}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-slate-400 pr-0.5">
                    {isMembershipDropdownOpen ? (
                      <ChevronDown className="w-4 h-4 text-[#1ED760] transition-transform duration-200" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-slate-400 hover:text-white transition-all" />
                    )}
                  </div>
                </button>

              </div>
            )}

        </div>

        {/* CONTAINER PLAYER + TRACKLIST */}
        <div className={`${mobileView === "player" ? "flex" : "hidden md:flex"} flex-col-reverse md:flex-col flex-1 min-w-0 min-h-0 overflow-hidden bg-[#070708]`}>
            
          {/* PLAYER BAR */}
          <div className={`${(!selectedPlaylist && !isPlaying && !overrideCurrentTrack) ? 'hidden' : !isTrackListExpanded ? 'flex-1 p-3 pb-1 md:p-5 md:pb-3 flex flex-col justify-start items-center overflow-y-auto overflow-x-hidden' : 'hidden md:flex flex-none p-3 border-b border-white/5'} bg-[#0a0a0b]/85  border-b border-white/10 relative shrink-0 transition-all duration-500 ease-in-out z-30`}>
            
            {selectedPlaylist || overrideCurrentTrack || currentTrack ? (
              <div className="w-full flex-1 flex flex-col min-h-0">
                
                {/* 1. PC COMPACT / MINIMIZED LAYOUT (Shown only on Desktop when minimized) */}
                {isTrackListExpanded && (
                  <div className="hidden md:flex items-center justify-between w-full h-[86px] px-4 bg-[#000000] border-t border-white/5 relative z-50">
                    
                    {/* Left: Artwork + Title + Artist + Heart icon */}
                    <div className="flex items-center gap-4 min-w-[200px] w-1/4">
                      <div className="relative shrink-0 flex items-center justify-center min-h-0 w-16 h-16">
                        <div className={`relative z-10 w-full h-full rounded-xl overflow-hidden ${isEcoMode ? 'shadow-sm' : 'shadow-lg'} border border-white/5`}>
                          <img
                            src={displayArtwork}
                            alt="Artwork"
                            className="w-full h-full object-cover transition-opacity duration-300"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <h1 className="font-black text-white uppercase tracking-tight text-sm truncate">
                            {displayTitle}
                          </h1>
                          {isLoadingTrack && (
                            <Loader2 className="text-emerald-500 animate-spin shrink-0 w-3 h-3 ml-1" />
                          )}
                        </div>
                        <p className="font-bold text-[#1ED760] uppercase tracking-wider text-[10px] mt-0.5 truncate">
                          {displayArtist}
                        </p>
                      </div>
                    </div>

                    {/* Center: Controls + Timeline combined */}
                    <div className="flex flex-col items-center justify-center gap-2 w-1/2 max-w-[600px]">
                      {/* Controls Row */}
                      <div className="flex items-center justify-center gap-6">
                        <button
                          onClick={() => setIsShuffle(!isShuffle)}
                          title="Aleatorio"
                          className={`p-1 transition-all transform active:scale-95 ${isShuffle ? "text-[#1ED760]" : "text-slate-500 hover:text-white"}`}
                        >
                          <Shuffle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handlePrev}
                          title="Anterior"
                          className="p-1 text-white hover:text-emerald-400 transition-all transform active:scale-90"
                        >
                          <SkipBack className="fill-current w-7 h-7" />
                        </button>

                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={togglePlayback}
                          className="rounded-full w-12 h-12 bg-white text-black flex items-center justify-center transition-all duration-350 shadow-md"
                        >
                          {isPlaying ? (
                            <Pause className="fill-current text-black w-6 h-6" />
                          ) : (
                            <Play className="fill-current text-black w-6 h-6 ml-1" />
                          )}
                        </motion.button>

                        <button
                          onClick={handleNext}
                          title="Siguiente"
                          className="p-1 text-white hover:text-emerald-400 transition-all transform active:scale-90"
                        >
                          <SkipForward className="fill-current w-7 h-7" />
                        </button>
                        <button
                          onClick={() => setIsRepeat(!isRepeat)}
                          title="Repetir"
                          className={`p-1 transition-all transform active:scale-95 ${isRepeat ? "text-[#1ED760]" : "text-slate-500 hover:text-white"}`}
                        >
                          <Repeat className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Timeline Row */}
                      <div className="flex items-center w-full gap-3">
                        <span className="text-[10px] font-bold text-slate-500 font-mono w-[35px] text-right">
                          {formatTime(position)}
                        </span>
                        <div 
                          onPointerDown={handleTimelinePointerDown}
                          className="flex-1 relative flex items-center h-4 cursor-pointer min-w-0 group/timeline select-none touch-none"
                        >
                          <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden pointer-events-none group-hover/timeline:h-2 transition-all">
                            <div
                              className="h-full bg-white rounded-full relative"
                              style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                            />
                          </div>
                          <div 
                            className="absolute w-3.5 h-3.5 bg-white rounded-full opacity-0 group-hover/timeline:opacity-100 shadow-md pointer-events-none transition-opacity"
                            style={{ left: `calc(${duration > 0 ? (position / duration) * 100 : 0}% - 7px)` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 font-mono w-[35px] text-left">
                          {formatTime(duration)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions + Volume */}
                    <div className="flex justify-end items-center gap-4 min-w-[200px] w-1/4">
                       <button
                         onClick={() => setIsTrackListExpanded(!isTrackListExpanded)}
                         className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors outline-none cursor-pointer"
                         title={isTrackListExpanded ? "Pantalla Completa" : "Contraer"}
                       >
                         {isTrackListExpanded ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                       </button>

                      {/* Heart Icon to like instantly */}
                      <button 
                        onClick={(e) => handleToggleFavorite(currentTrack, e)} 
                        className="p-2 text-slate-400 hover:text-pink-500 active:scale-90 transition-all cursor-pointer rounded-full bg-white/5"
                        title="Añadir a Favoritos"
                      >
                        <Heart className={`w-[15px] h-[15px] transition-colors ${
                          userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === 'favoritos' || p.name.toLowerCase() === 'siguiente'))
                            ?.tracks.some(t => (currentTrack.id && t.id === currentTrack.id) || (currentTrack.url && t.url === currentTrack.url)) ? 'fill-[#1ED760] text-[#1ED760]' : ''
                        }`} />
                      </button>

                      {/* Volume Adjuster */}
                      <div className="flex items-center justify-end gap-2 group/vol w-[100px]">
                        <Volume2 className="w-4 h-4 text-slate-400 group-hover/vol:text-white transition-colors shrink-0" />
                        <div
                          onPointerDown={handleVolumePointerDown}
                          className="w-full h-1.5 bg-white/20 rounded-full relative cursor-pointer group-hover/vol:h-2 transition-all touch-none flex items-center"
                        >
                          <div
                            className="absolute left-0 h-full rounded-full bg-slate-300 group-hover/vol:bg-[#1ED760] pointer-events-none transition-colors"
                            style={{ width: `${volume}%` }}
                          >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover/vol:opacity-100 transition-opacity translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. DYNAMIC FULL SCREEN LAYOUT (Shown on Mobile always when expanded, or Desktop when maximized) */}
                {!isTrackListExpanded && (
                  <div className="flex flex-col gap-1 sm:gap-1.5 items-center justify-start w-full max-w-2xl mx-auto h-full flex-1 relative pt-12 sm:pt-6">
                    
                    {/* Global Player Header: Minimize (Left) & Tabs Switcher (Center) decoupled */}
                    <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 grid grid-cols-[3rem_1fr_3rem] sm:grid-cols-[3.5rem_1fr_3.5rem] items-center z-50 shrink-0 gap-2">
                      {/* Left: Minimize button - Decoupled and easily accessible at the top left */}
                      <div className="flex items-center justify-start">
                        <button 
                          onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              setIsTrackListExpanded(true);
                          }}
                          title="Minimizar reproductor"
                          className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 bg-black/40 backdrop-blur-md border border-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all text-white shadow-xl cursor-pointer"
                        >
                          <ChevronDown className="w-6 h-6 sm:w-7 sm:h-7" />
                        </button>
                      </div>

                      {/* Center: Removed Tabs Switcher to adhere to 'clean interface' request */}
                      <div className="flex items-center justify-center w-full min-w-0" />
                      
                      {/* Right Placeholder to balance CSS Grid */}
                      <div />
                    </div>

                    {/* Artwork & Title centrally stacked */}
                    <div className="flex w-full min-w-0 relative flex-col items-center flex-1 justify-center mt-6 sm:mt-8">
                      <div 
                        className="flex flex-col items-center justify-center w-full flex-1 min-h-0"
                      >

                        {/* Contents according to tab (Forced Artwork always) */}
                          <div className="relative shrink-0 flex items-center justify-center min-h-0 flex-1 w-full max-w-[260px] sm:max-w-[380px] lg:max-w-[460px] max-h-[35vh] sm:max-h-[45vh] lg:max-h-[50vh] aspect-square mb-2.5 sm:mb-4 mx-auto">
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
                            <div className={`relative z-10 w-full h-full rounded-2xl overflow-hidden ${isEcoMode ? 'shadow-lg' : 'shadow-2xl'} border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)]`}>
                              <img
                                src={displayArtwork}
                                alt="Artwork"
                                className="w-full h-full object-cover transition-opacity duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none" />
                            </div>
                          </div>

                        {/* Title details & Heart favorite button stacked horizontally */}
                        <div className="flex items-center justify-between w-full max-w-[260px] sm:max-w-[380px] lg:max-w-[460px] px-1 mb-2 sm:mb-4">
                          <div className="flex flex-col min-w-0 text-left">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <h1 className="font-black text-white uppercase tracking-tight text-xl sm:text-2xl truncate max-w-[55vw] sm:max-w-[300px]">
                                {displayTitle}
                              </h1>
                              {isLoadingTrack && (
                                <Loader2 className="text-emerald-500 animate-spin shrink-0 w-4 h-4 ml-1.5" />
                              )}
                            </div>
                            <p className="font-black text-[#1ED760] uppercase tracking-[0.2em] text-[10px] sm:text-xs mt-1 truncate max-w-[55vw] sm:max-w-[300px]">
                              {displayArtist}
                            </p>
                          </div>
                          
                          {/* Heart Icon to like instantly from full screen on mobile/desktop */}
                          <button 
                            onClick={(e) => handleToggleFavorite(currentTrack, e)} 
                            className="p-1.5 sm:p-2 text-slate-400 hover:text-pink-500 active:scale-90 transition-all cursor-pointer rounded-full bg-white/5 ml-3 shrink-0"
                            title="Añadir a Favoritos"
                          >
                            <Heart className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-colors ${
                              userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === 'favoritos' || p.name.toLowerCase() === 'siguiente'))
                                ?.tracks.some(t => (currentTrack.id && t.id === currentTrack.id) || (currentTrack.url && t.url === currentTrack.url)) ? 'fill-pink-500 text-pink-500' : ''
                            }`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline slider + Control knobs combined */}
                    <div className="flex flex-col w-full px-1 sm:px-0 mx-auto max-w-[260px] sm:max-w-[380px] lg:max-w-[460px] gap-2.5 sm:gap-4 mb-2 sm:mb-4">
                      {/* Timeline */}
                      <div className="flex flex-col w-full gap-2">
                        <div 
                          onPointerDown={handleTimelinePointerDown}
                          className="flex-1 relative flex items-center h-2.5 cursor-pointer min-w-0 group/timeline select-none touch-none"
                        >
                          <div className="w-full h-1 bg-white/10 rounded-full relative overflow-hidden pointer-events-none group-hover/timeline:h-1.5 transition-all">
                            <div
                              className="h-full bg-white rounded-full relative"
                              style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                            />
                          </div>
                          <div 
                            className="absolute w-3 h-3 bg-white rounded-full opacity-100 shadow-md pointer-events-none"
                            style={{ left: `calc(${duration > 0 ? (position / duration) * 100 : 0}% - 6px)` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest px-0.5 font-mono">
                          <span>{formatTime(position)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      {/* Buttons controls */}
                      <div className="grid grid-cols-[0.8fr_auto_1.2fr] sm:grid-cols-[1fr_auto_1fr] items-center w-full px-1 gap-1">
                        
                        {/* Shuffle + Repeat */}
                        <div className="flex justify-start items-center gap-1.5 sm:gap-3">
                          <button
                            onClick={() => setIsShuffle(!isShuffle)}
                            title="Aleatorio"
                            className={`p-1 sm:p-2 transition-all transform active:scale-95 ${isShuffle ? "text-[#1ED760]" : "text-slate-500 hover:text-white"}`}
                          >
                            <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            onClick={() => setIsRepeat(!isRepeat)}
                            title="Repetir"
                            className={`p-1 sm:p-2 transition-all transform active:scale-95 ${isRepeat ? "text-[#1ED760]" : "text-slate-500 hover:text-white"}`}
                          >
                            <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Prev - Play - Next */}
                        <div className="flex items-center justify-center gap-4 sm:gap-8">
                          <button
                            onClick={handlePrev}
                            title="Anterior"
                            className="p-1 sm:p-2 text-white hover:text-emerald-400 transition-all transform active:scale-90 flex-shrink-0"
                          >
                            <SkipBack className="fill-current w-6 h-6 sm:w-8 sm:h-8" />
                          </button>

                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={togglePlayback}
                            className="rounded-full w-12 h-12 sm:w-16 sm:h-16 bg-white text-black flex items-center justify-center transition-all duration-350 shadow-xl"
                          >
                            {isPlaying ? (
                              <Pause className="fill-current text-black w-5 h-5 sm:w-7 sm:h-7" />
                            ) : (
                              <Play className="fill-current text-black w-5 h-5 sm:w-7 sm:h-7 ml-0.5 sm:ml-1" />
                            )}
                          </motion.button>

                          <button
                            onClick={handleNext}
                            title="Siguiente"
                            className="p-1 sm:p-2 text-white hover:text-emerald-400 transition-all transform active:scale-90 flex-shrink-0"
                          >
                            <SkipForward className="fill-current w-6 h-6 sm:w-8 sm:h-8" />
                          </button>
                        </div>

                        {/* Volume Adjuster */}
                        <div className="flex justify-end items-center gap-1.5 sm:gap-3 w-full pr-1 sm:pr-2">
                          <div className="flex items-center justify-end gap-1 sm:gap-1.5 group/vol w-[65px] sm:w-[100px]">
                            <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover/vol:text-white transition-colors shrink-0" />
                            <div
                              onPointerDown={handleVolumePointerDown}
                              className="w-full h-1 bg-white/20 rounded-full relative cursor-pointer group-hover/vol:h-1.5 transition-all touch-none flex items-center"
                            >
                              <div
                                className="absolute left-0 h-full rounded-full bg-slate-300 group-hover/vol:bg-white pointer-events-none transition-colors"
                                style={{ width: `${volume}%` }}
                              >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full shadow opacity-100 transition-opacity translate-x-1" />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Selecciona o Añade un Canal para empezar</p>
              </div>
            )}
          </div>

          {/* BELOW LAYOUT: PERMANENT TRACK LIST */}
          {selectedPlaylist || trackListTab === "search" || trackListTab === "entertainment" ? (
            <div className={`flex flex-col min-h-0 bg-black/40 flex-1 border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.4)] relative z-20 overflow-hidden transform-gpu ${!isTrackListExpanded && (selectedPlaylist || isPlaying || overrideCurrentTrack) ? 'hidden' : 'flex'}`}>
              
              {trackListTab !== "entertainment" && (
              <div 
                className="w-full relative px-3 py-1.5 sm:px-4 sm:py-2 border-b border-white/5 flex flex-col shrink-0 bg-[#080809]/40"
              >
                <div className="flex flex-col w-full">
                  {/* Search Bar matching Tab */}
                  <div className="flex items-center gap-2 w-full">
                    <div className="relative flex-1 group">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <Search className={`w-3.5 h-3.5 transition-colors ${searchQuery ? 'text-emerald-500/70' : 'text-slate-500'}`} />
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        setTrackListTab("search");
                        handleYoutubeSearch(e);
                      }}>
                        <input
                          type="text"
                          placeholder={
                            trackListTab === "playlist" ? `Buscar en ${selectedPlaylist?.name || "playlist"}...` :
                            trackListTab === "queue" ? "¿Qué hay en la cola?" :
                            "¿Qué te apetece escuchar?..."
                          }
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (!e.target.value && trackListTab === "search") {
                              setYoutubeResults([]);
                            }
                          }}
                          className="w-full bg-[#111113]/80 border border-white/5 rounded-lg py-1 pl-7.5 pr-8 text-[11px] text-white placeholder-slate-500/80 focus:outline-none focus:border-emerald-500/20 focus:bg-white/[0.04] transition-all font-medium tracking-wide"
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
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {trackListTab === "queue" && trackQueue.length > 0 && (
                      <button
                        onClick={() => {
                          setTrackQueue([]);
                          showNotification("Cola vaciada con éxito");
                        }}
                        className="shrink-0 py-1 px-2.5 text-[9.5px] font-bold uppercase text-red-400 bg-red-500/10 border border-red-500/10 hover:border-red-500/20 rounded-md transition-all cursor-pointer"
                      >
                        Vaciar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              )}

              <div className="flex flex-col flex-1 min-h-0 bg-[#030303] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-0 sm:p-0 pb-[120px] sm:pb-0 premium-scrollbar relative">
                  {trackListTab === "entertainment" ? (
                    <PodcastView 
                      isVisible={true}
                      pauseBackgroundMusic={() => {
                        setIsPlaying(false);
                        expectedPlayingRef.current = false;
                        if (youtubePlayerRef.current) {
                          try {
                            const intPlayer = youtubePlayerRef.current.getInternalPlayer();
                            if (intPlayer && typeof intPlayer.pauseVideo === "function") {
                              intPlayer.pauseVideo();
                            }
                          } catch (e) {}
                        }
                        if (fallbackSilentAudioRef.current) {
                          fallbackSilentAudioRef.current.pause();
                        }
                      }}
                    />
                  ) : trackListTab === "search" ? (
                    <div className="space-y-1">
                      {/* Search results view */}




                      {(searchQuery || youtubeResults.length > 0) && (
                        <div className="flex items-center justify-between px-2 py-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Resultados de Búsqueda
                          </span>
                        </div>
                      )}
                      
                      {isSearchingYT && (
                        <div className="flex items-center justify-center py-12">
                           <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        </div>
                      )}

                      {!isSearchingYT && youtubeResults.length === 0 && (
                        <div className="py-2.5 sm:py-4 px-2.5 sm:px-4">
                          
                          {/* Las categorías redundantes fueron removidas a pedido del usuario */}

                          {searchQuery ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                              <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest leading-relaxed">
                                No se encontraron resultados para tu búsqueda
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* 2. Pantalla o Esqueleto de Carga */}
                              {isLoadingExplore ? (
                                <div className="space-y-4 py-8">
                                  <div className="flex items-center gap-3 animate-pulse px-2">
                                    <div className="w-5 h-5 rounded-full bg-white/5" />
                                    <div className="h-4 w-40 bg-white/5 rounded" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 pb-4">
                                    <div className="h-28 bg-white/[0.02] rounded-2xl animate-pulse border border-white/5" />
                                    <div className="h-28 bg-white/[0.02] rounded-2xl animate-pulse border border-white/5" />
                                  </div>
                                  <div className="flex items-center justify-center py-4">
                                     <Loader2 className="w-5 h-5 text-emerald-500/50 animate-spin" />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-6">
                                  <ExploreView 
                                    exploreData={exploreData}
                                    setOverrideCurrentTrack={setOverrideCurrentTrack}
                                    setIsPlaying={setIsPlaying}
                                    showNotification={showNotification}
                                    addYoutubeTrackToPlaylist={addYoutubeTrackToPlaylist}
                                    loadPlaylistAndPlay={handleLoadExplorePlaylist}
                                    playTracksContext={(tracks, startIdx) => {
                                      const mapped = tracks.map(t => ({
                                        id: t.id,
                                        title: t.title,
                                        artist: t.artist || "Artista",
                                        url: t.url,
                                        duration: t.duration || "N/A",
                                        bpm: 120
                                      }));
                                      setOverrideCurrentTrack(mapped[startIdx]);
                                      setIsPlaying(true);
                                      if (mapped.length > startIdx + 1) {
                                        const queue = mapped.slice(startIdx + 1);
                                        setTrackQueue(queue);
                                        trackQueueRef.current = queue;
                                      }
                                      showNotification(`Reproduciendo: ${mapped[startIdx].title}`);
                                    }}
                                    selectedCountry={selectedCountry}
                                    setSelectedCountry={(c) => {
                                      setSelectedCountry(c);
                                      localStorage.setItem("gym_music_selected_country", c);
                                      setExploreData(null);
                                    }}
                                    currentTrack={currentTrack}
                                    isPlaying={isPlaying}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {youtubeResults.map((ytTrack, idx) => {
                        const isExpanded = expandedPlaylistId === ytTrack.id;
                        
                        const renderBadge = () => {
                          if (ytTrack.isPlaylist) {
                            if (ytTrack.subType === 'mix') {
                              return (
                                <span className="bg-purple-500/20 text-purple-400 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 tracking-wider">
                                  MIX PREMIUM
                                </span>
                              );
                            } else {
                              return (
                                <span className="bg-blue-500/20 text-blue-400 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 tracking-wider">
                                  PLAYLIST
                                </span>
                              );
                            }
                          } else {
                            if (ytTrack.subType === 'mix') {
                              return (
                                <span className="bg-fuchsia-500/20 text-fuchsia-400 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 tracking-wider">
                                  MIX SESIÓN
                                </span>
                              );
                            } else {
                              return (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase shrink-0 tracking-wider">
                                  CANCIÓN
                                </span>
                              );
                            }
                          }
                        };

                        return (
                          <div 
                            key={`yt-${ytTrack.id}-${idx}`}
                            className="flex flex-col gap-1 p-1.5 bg-white/[0.01] hover:bg-white/[0.02] rounded-2xl border border-transparent hover:border-white/5 transition-all text-left mb-2 group/yt"
                          >
                            <div className="flex items-center gap-3 p-1 relative">
                              <div 
                                className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-black shadow-lg cursor-pointer group/thumb"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (ytTrack.isPlaylist) {
                                    // Trigger the playlist play logic
                                    const playBtn = e.currentTarget.parentElement?.querySelector('button[title="Reproducir Playlist ahora"]') as HTMLButtonElement;
                                    if (playBtn) playBtn.click();
                                  } else {
                                    const trackId = `yt_temp_${ytTrack.id}`;
                                    const isCurrent = currentTrack && (currentTrack.id === trackId || currentTrack.url === ytTrack.url);
                                    
                                    if (isCurrent) {
                                      setIsPlaying(!isPlaying);
                                      return;
                                    }

                                    // Logic for continuous playback from search results
                                    const allTracksOnly = youtubeResults
                                      .filter(t => !t.isPlaylist)
                                      .map(t => ({
                                        id: `yt_temp_${t.id}`,
                                        title: t.title,
                                        artist: t.artist || "Flux",
                                        url: t.url,
                                        duration: t.duration || "N/A",
                                        bpm: 120
                                      }));
                                    
                                    const currentIdx = allTracksOnly.findIndex(t => t.id === trackId);
                                    
                                    if (currentIdx !== -1) {
                                      setOverrideCurrentTrack(allTracksOnly[currentIdx]);
                                      setIsPlaying(true);
                                      
                                      // Queue the rest of search results
                                      if (allTracksOnly.length > currentIdx + 1) {
                                        const nextInSearch = allTracksOnly.slice(currentIdx + 1);
                                        setTrackQueue(nextInSearch);
                                        trackQueueRef.current = nextInSearch;
                                      }
                                      
                                      showNotification(`Reproduciendo: ${ytTrack.title}`);
                                    }
                                  }
                                }}
                              >
                                <img 
                                  src={ytTrack.thumbnail} 
                                  alt="" 
                                  className="w-full h-full object-cover group-hover/yt:scale-110 transition-transform duration-500"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover/yt:bg-black/60 transition-colors flex items-center justify-center">
                                  <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center opacity-0 group-hover/yt:opacity-100 transition-all transform scale-75 group-hover/yt:scale-100 shadow-xl">
                                    {(currentTrack && (currentTrack.id === `yt_temp_${ytTrack.id}` || currentTrack.url === ytTrack.url)) && isPlaying ? (
                                      <Pause className="w-2.5 h-2.5 text-black fill-black" />
                                    ) : (
                                      <Play className="w-2.5 h-2.5 text-black fill-black ml-0.5" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <span className="flex items-center gap-1.5 mb-1 flex-wrap">
                                  {renderBadge()}
                                </span>
                                <h4 className="text-[11px] font-bold text-white truncate leading-tight transition-colors uppercase tracking-tight">
                                  {ytTrack.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-bold uppercase tracking-widest flex items-center gap-2">
                                  <span>{ytTrack.artist}</span>
                                  {ytTrack.duration && <span className="text-white/20">•</span>}
                                  {ytTrack.duration && <span>{ytTrack.duration}</span>}
                                </p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 pr-1">
                                {ytTrack.isPlaylist ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleToggleExpandPlaylist(ytTrack.id, ytTrack.title)}
                                      title={isExpanded ? "Ocultar canciones" : "Ver canciones de la playlist"}
                                      className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider cursor-pointer ${
                                        isExpanded 
                                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                                          : "bg-white/5 border-transparent text-slate-400 hover:text-white hover:bg-white/10"
                                      }`}
                                    >
                                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                      <span className="hidden sm:inline">Explorar</span>
                                    </button>

                                    <button
                                      onClick={() => addYoutubeTrackToPlaylist(ytTrack)}
                                      title="Importar / Añadir Playlist Completa a tu Biblioteca"
                                      className="p-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                      <ListPlus className="w-4 h-4" />
                                      <span className="hidden sm:inline text-[8.5px] font-black uppercase tracking-wider">Añadir Todo</span>
                                    </button>
                                    
                                    <button
                                      onClick={async (e) => {
                                        const isSamePlaylist = playingPlaylist?.id === ytTrack.id;
                                        if (isSamePlaylist) {
                                          setIsPlaying(!isPlaying);
                                          return;
                                        }

                                        showNotification("Cargando playlist...");
                                        try {
                                          const res = await fetch(`/api/youtube/playlist?id=${ytTrack.id}`);
                                          if (res.ok) {
                                            const tracks = await res.json();
                                            if (tracks.length > 0) {
                                              const mapped = tracks.map((t: any, i: number) => ({
                                                id: `yt_temp_${t.id}_${i}`,
                                                title: t.title,
                                                artist: t.artist,
                                                url: t.url,
                                                duration: t.duration,
                                                bpm: 120
                                              }));
                                              setOverrideCurrentTrack(mapped[0]);
                                              setIsPlaying(true);
                                              if (mapped.length > 1) {
                                                const rest = mapped.slice(1);
                                                setTrackQueue(rest);
                                                trackQueueRef.current = rest;
                                              }
                                              setPlayingPlaylist({
                                                id: ytTrack.id,
                                                name: ytTrack.title,
                                                tracks: mapped,
                                                ownerId: "youtube",
                                                ownerName: ytTrack.artist
                                              } as any);
                                              showNotification(`Reproduciendo: ${ytTrack.title}`);
                                            }
                                          }
                                        } catch (err) {
                                          showNotification("Error reproduciendo playlist");
                                        }
                                      }}
                                      title="Reproducir Playlist ahora"
                                      className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95 cursor-pointer ml-1"
                                    >
                                      {playingPlaylist?.id === ytTrack.id && isPlaying ? (
                                        <Pause className="w-4 h-4 fill-black" />
                                      ) : (
                                        <Play className="w-4 h-4 fill-black ml-0.5" />
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    {/* Spotify Style Add to Queue */}
                                    <button
                                      onClick={(e) => {
                                        const track: MusicTrack = {
                                          id: `yt_temp_${ytTrack.id}_q`,
                                          title: ytTrack.title,
                                          artist: ytTrack.artist,
                                          url: ytTrack.url,
                                          duration: ytTrack.duration,
                                          bpm: 120
                                        };
                                        handleAddToQueue(track, e);
                                      }}
                                      title="Añadir a la cola"
                                      className="p-2 text-slate-400 hover:text-[#1ED760] transition-colors cursor-pointer"
                                    >
                                      <PlusCircle className="w-[18px] h-[18px]" />
                                    </button>

                                    {/* Add to Playlist */}
                                    <button
                                      onClick={() => addYoutubeTrackToPlaylist(ytTrack)}
                                      title="Añadir a Playlist"
                                      className="p-2 text-slate-400 hover:text-[#1ED760] transition-colors cursor-pointer"
                                    >
                                      <ListPlus className="w-[18px] h-[18px]" />
                                    </button>

                                    {/* Favorite */}
                                    <button
                                      onClick={(e) => {
                                        const track: MusicTrack = {
                                          id: `yt_temp_${ytTrack.id}_f`,
                                          title: ytTrack.title,
                                          artist: ytTrack.artist,
                                          url: ytTrack.url,
                                          duration: ytTrack.duration,
                                          bpm: 120
                                        };
                                        handleToggleFavorite(track, e);
                                      }}
                                      title="Me gusta"
                                      className="p-2 text-slate-400 hover:text-pink-500 transition-colors cursor-pointer"
                                    >
                                      <Heart className={`w-[18px] h-[18px] transition-colors ${userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === 'favoritos' || p.name.toLowerCase() === 'siguiente'))?.tracks.some(t => t.url === ytTrack.url) ? 'fill-pink-500 text-pink-500' : ''}`} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Expandable playlist track selector */}
                            {isExpanded && (
                              <div className="mt-1 mb-1 mx-1.5 p-2 bg-black/60 border border-white/5 rounded-xl space-y-1.5 transition-all">
                                {isFetchingExpandedTracks ? (
                                  <div className="flex items-center gap-2 p-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest justify-center">
                                    <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                                    <span>Analizando pistas de audio premium...</span>
                                  </div>
                                ) : expandedPlaylistTracks.length === 0 ? (
                                  <div className="text-[9px] text-slate-500 p-3 text-center uppercase font-bold tracking-widest">
                                    No se encontraron pistas o mix de audio en esta playlist.
                                  </div>
                                ) : (
                                  <div className="space-y-0.5 max-h-[600px] overflow-y-auto premium-scrollbar pr-1">
                                    <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-white/5">
                                      <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                        Pistas del Canal ({expandedPlaylistTracks.length})
                                      </p>
                                      <button 
                                        onClick={() => {
                                          if (!selectedPlaylist?.id || selectedPlaylist.id === "all") {
                                            showNotification("Selecciona una playlist en tu biblioteca primero.");
                                            return;
                                          }
                                          const tracksToAdd = expandedPlaylistTracks.map((t, idx) => ({
                                            id: `yt_sub_${t.id}_${Date.now()}_${idx}`,
                                            title: t.title,
                                            artist: t.artist,
                                            url: t.url,
                                            duration: t.duration || "N/A",
                                            bpm: 120,
                                            thumbnail: t.thumbnail || `https://i.ytimg.com/vi/${t.id}/mqdefault.jpg`
                                          }));
                                          importAllExpandedTracks(tracksToAdd);
                                        }}
                                        className="text-[8px] font-black uppercase text-emerald-400 hover:text-white tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md cursor-pointer"
                                      >
                                        Añadir todas
                                      </button>
                                    </div>
                                    {expandedPlaylistTracks.map((subTrack, subIdx) => (
                                      <div 
                                        key={`sub-${subTrack.id}-${subIdx}`}
                                        className="flex items-center justify-between gap-3 p-1.5 rounded-lg bg-white/[0.01] hover:bg-emerald-500/[0.04] border border-transparent hover:border-emerald-500/5 transition-all text-left"
                                      >
                                        <div className="flex-1 min-w-0 pr-1">
                                          <p className="text-[10px] font-bold text-white truncate leading-tight uppercase tracking-tight">
                                            {subIdx + 1}. {subTrack.title}
                                          </p>
                                          <p className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                            {subTrack.artist} {subTrack.duration && `• ${subTrack.duration}`}
                                          </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const finalTrack: MusicTrack = {
                                                id: `yt_sub_${subTrack.id}_${Date.now()}_${subIdx}`,
                                                title: subTrack.title,
                                                artist: subTrack.artist,
                                                url: subTrack.url,
                                                duration: subTrack.duration || "N/A",
                                                bpm: 120,
                                                thumbnail: subTrack.thumbnail || `https://i.ytimg.com/vi/${subTrack.id}/mqdefault.jpg`
                                              };
                                              addSingleTrackToCurrentPlaylist(finalTrack);
                                            }}
                                            title="Añadir a playlist activa"
                                            className="p-1 px-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-black rounded-lg transition-all text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                            <span>Añadir</span>
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const finalTrack: MusicTrack = {
                                                id: `yt_sub_temp_${subTrack.id}_${Date.now()}_${subIdx}`,
                                                title: subTrack.title,
                                                artist: subTrack.artist,
                                                url: subTrack.url,
                                                duration: subTrack.duration,
                                                bpm: 120,
                                                thumbnail: subTrack.thumbnail || `https://i.ytimg.com/vi/${subTrack.id}/mqdefault.jpg`
                                              };
                                              
                                              if (currentTrack && (currentTrack.id === finalTrack.id || currentTrack.url === finalTrack.url)) {
                                                setIsPlaying(!isPlaying);
                                                return;
                                              }
                                              
                                              setOverrideCurrentTrack(finalTrack);
                                              setIsPlaying(true);
                                              showNotification(`Reproduciendo: ${subTrack.title}`);
                                            }}
                                            title="Escuchar ahora"
                                            className="p-1 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-all cursor-pointer"
                                          >
                                            {(currentTrack && (currentTrack.url === subTrack.url)) && isPlaying ? (
                                              <Pause className="w-2.5 h-2.5 fill-current" />
                                            ) : (
                                              <Play className="w-2.5 h-2.5 fill-current" />
                                            )}
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const finalTrack: MusicTrack = {
                                                id: `yt_sub_temp_${subTrack.id}_${Date.now()}`,
                                                title: subTrack.title,
                                                artist: subTrack.artist,
                                                url: subTrack.url,
                                                duration: subTrack.duration,
                                                bpm: 120,
                                                thumbnail: subTrack.thumbnail || `https://i.ytimg.com/vi/${subTrack.id}/mqdefault.jpg`
                                              };
                                              handleToggleFavorite(finalTrack, e);
                                            }}
                                            title="Añadir a Favoritos"
                                            className="p-1 bg-white/5 text-slate-400 hover:bg-pink-500/10 hover:text-pink-500 rounded-lg transition-all cursor-pointer"
                                          >
                                            <Heart className={`w-2.5 h-2.5 transition-colors ${userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === 'favoritos' || p.name.toLowerCase() === 'siguiente'))?.tracks.some(t => t.url === subTrack.url) ? 'fill-pink-500 text-pink-500' : ''}`} />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                            <ListMusic className={`w-8 h-8 text-slate-600 mx-auto ${isEcoMode ? '' : 'animate-pulse'}`} />
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
                                  if (currentTrack?.id === track.id) {
                                    setIsPlaying(!isPlaying);
                                    return;
                                  }
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

                                <div className="relative w-8 h-8 sm:w-9 sm:h-9 bg-white/5 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center shadow-lg group/thumb">
                                  {getTrackImage(track) ? (
                                    <img src={getTrackImage(track)!} alt="" className="w-full h-full object-cover group-hover/track:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                                  )}
                                  <div className="absolute inset-0 bg-black/20 group-hover/track:bg-black/40 transition-colors flex items-center justify-center">
                                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center opacity-0 group-hover/track:opacity-100 transition-all transform scale-75 group-hover/track:scale-100 shadow-xl">
                                      {currentTrack?.id === track.id && isPlaying ? (
                                        <Pause className="w-2 h-2 text-black fill-black" />
                                      ) : (
                                        <Play className="w-2 h-2 text-black fill-black ml-0.5" />
                                      )}
                                    </div>
                                  </div>
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
                        const isActive = (playingPlaylist?.id === selectedPlaylist?.id) && displayTrackIndex === idx;
                        return (
                          <div
                            key={`list_trk_${track.id || 'x'}_${idx}`}
                            onClick={() => {
                              setOverrideCurrentTrack(null);
                              if (isActive) {
                                expectedPlayingRef.current = !isPlaying;
                                setIsPlaying(!isPlaying);
                              } else {
                                expectedPlayingRef.current = true;
                                setPlayingPlaylist(selectedPlaylist);
                                setCurrentTrackIndex(idx);
                                setIsPlaying(true);
                              }
                            }}
                            role="button"
                            className={`group/track w-full flex items-center gap-1.5 sm:gap-2 px-2 py-0 sm:px-3 sm:py-0 transition-all text-left relative overflow-hidden rounded-lg cursor-pointer ${
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
                            <div className="relative w-6 h-6 sm:w-6 sm:h-6 bg-white/5 rounded flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                              {getTrackImage(track) ? (
                                <img src={getTrackImage(track)!} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
                            <div className="flex-1 min-w-0 pr-1.5 sm:pr-3 relative z-10 flex flex-col justify-center gap-0">
                              <p className={`text-[11px] sm:text-[11px] font-semibold truncate leading-none transition-colors duration-200 uppercase tracking-wide ${
                                isActive ? "text-emerald-400 font-extrabold" : "text-white"
                              }`}>
                                {track.title}
                              </p>
                              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                <p className={`text-[9px] sm:text-[9.5px] font-normal truncate leading-none transition-colors duration-200 mt-[0.5px] ${
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
                              <button onClick={(e) => handleToggleFavorite(track, e)} className="p-1.5 sm:p-1 text-slate-400 hover:text-pink-500 rounded-md hover:bg-pink-500/10 cursor-pointer" title="Añadir a Favoritos">
                                <Heart className={`w-3.5 h-3.5 transition-colors ${userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === 'favoritos' || p.name.toLowerCase() === 'siguiente'))?.tracks.some(t => (track.id && t.id === track.id) || (track.url && t.url === track.url)) ? 'fill-pink-500 text-pink-500' : ''}`} />
                              </button>
                              <button onClick={(e) => handleAddToQueue(track, e)} className="p-1.5 sm:p-1 text-slate-400 hover:text-emerald-400 rounded-md hover:bg-emerald-500/10 cursor-pointer" title="Añadir a la cola">
                                <ListPlus className="w-3.5 h-3.5" />
                              </button>
                              {selectedPlaylist?.id && selectedPlaylist.id !== "all" && (
                                isAdmin ||
                                savedSecurityCode === "ho82788278" ||
                                (user && selectedPlaylist.ownerId === user?.uid)
                              ) && (
                                <>
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

                <div className="px-3 py-0.5 bg-[#050505] border-t border-white/5 flex justify-between items-center text-[7.5px] font-black uppercase text-slate-500 tracking-widest shrink-0">
                  <span>Total: {viewedTracks.length || 0} canciones</span>
                  <span className="text-emerald-500/80">Flux Premium</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-transparent">
              <div className="w-24 h-24 border border-dashed border-white/10 rounded-full flex items-center justify-center mb-6">
                <Music className="w-7 h-7 text-white/5 animate-pulse" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-4">
                Listo para Escuchar
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                     setSelectedPlaylist(null);
                     setTrackListTab("search");
                     setIsTrackListExpanded(true);
                     setMobileView("player");
                     window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 bg-emerald-500 text-black font-black uppercase text-[10px] rounded-lg hover:scale-105 transition-all shadow-xl flex items-center gap-2"
                >
                  Explorar Novedades
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Unified Spotify-Style Mobile Mini-Player (Floats above bottom-nav when track list is expanded/player minimized) */}
      {currentTrack && isTrackListExpanded && (
        <div 
          className="md:hidden fixed bottom-[65px] left-1.5 right-1.5 z-[55]"
        >
          <div 
            onClick={() => {
              setMobileView("player");
              setIsTrackListExpanded(false);
            }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#0e0e11]/98 backdrop-blur-md border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
          >
            {/* Progress Bar background */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.05]">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
              />
            </div>
            
            {/* Artwork */}
            <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden bg-[#1a1a20]">
              <img src={displayArtwork} className="w-full h-full object-cover" alt="" />
            </div>
            
            {/* Metadata info */}
            <div className="flex flex-col min-w-0 flex-1 text-left pb-0.5">
              <h4 className="text-[12.5px] font-bold text-white truncate tracking-tight">{displayTitle}</h4>
              <p className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wide truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/30 inline-block"></span>
                {displayArtist}
              </p>
            </div>
            
            {/* Actions: Heart & Play/Pause */}
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => handleToggleFavorite(currentTrack, e)} 
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Añadir a Favoritos"
              >
                <Heart className={`w-4 h-4 transition-colors ${
                  userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === 'favoritos' || p.name.toLowerCase() === 'siguiente'))
                    ?.tracks.some(t => (currentTrack.id && t.id === currentTrack.id) || (currentTrack.url && t.url === currentTrack.url)) ? 'fill-[#1ED760] text-[#1ED760]' : ''
                }`} />
              </button>

              <button 
                onClick={togglePlayback}
                className="p-2 text-white active:scale-90 transition-transform cursor-pointer"
                title="Reproducir/Pausar"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden flex h-[58px] bg-[#0c0c0d]/95  border-t border-white/5 shrink-0 justify-around items-center px-1 pb-1 pt-1 z-[60] shadow-[0_-4px_16px_rgba(0,0,0,0.5)]">
        {/* Explorar */}
        <button 
          onClick={() => {
             setSelectedPlaylist(null);
             setTrackListTab("search");
             setIsTrackListExpanded(true);
             setMobileView("player");
             setShowLibrary(false);
             window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            mobileView === "player" && trackListTab === "search" && !selectedPlaylist && !showLibrary
              ? "text-emerald-400 font-bold" 
              : "text-slate-500 hover:text-emerald-400"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Explorar</span>
        </button>

        {/* Podcasts */}
        <button 
          onClick={() => {
             setSelectedPlaylist(null);
             setTrackListTab("entertainment");
             setIsTrackListExpanded(true);
             setMobileView("player");
             setShowLibrary(false);
             window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all relative ${
            mobileView === "player" && trackListTab === "entertainment" && !selectedPlaylist && !showLibrary
              ? "text-emerald-500 font-bold" 
              : "text-slate-500 hover:text-emerald-400"
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5" />
            {Date.now() < new Date("2026-06-18T17:16:26Z").getTime() && (
              <span className="absolute -top-1.5 -right-2 px-1 py-[1px] bg-rose-500 text-white text-[6px] font-black uppercase tracking-widest rounded rotate-[12deg] shadow-[0_0_8px_rgba(244,63,94,0.6)] z-10 animate-pulse">
                Nuevo
              </span>
            )}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">Podcasts</span>
        </button>

        {/* Comunidad (Second Position) */}
        <button 
          onClick={() => {
             setIsSidebarExpanded(false);
             window.scrollTo({ top: 0, behavior: 'smooth' });
             if (showLibrary) {
                setShowLibrary(false);
             } else {
                setShowLibrary(true);
                setPreviewPlaylist(null);
             }
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            showLibrary
              ? "text-emerald-400 font-bold" 
              : "text-slate-500 hover:text-emerald-400"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Comunidad</span>
        </button>

        {/* Mi Biblioteca */}
        <button 
          onClick={() => {
             window.scrollTo({ top: 0, behavior: 'smooth' });
             setShowLibrary(false);
             if (mobileView === "playlists") {
                setMobileView("player");
             } else {
                setMobileView("playlists");
                setIsTrackListExpanded(true);
             }
          }}
          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            mobileView === "playlists" && !showLibrary
              ? "text-white font-bold" 
              : "text-slate-500 hover:text-white"
          }`}
        >
          <Library className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Biblioteca</span>
        </button>

        {/* Reproductor / Activo */}
        <button 
          onClick={() => {
             setShowLibrary(false);
             setMobileView("player");
             if (currentTrack || isPlaying || overrideCurrentTrack) {
                setIsTrackListExpanded(false);
             }
          }}
          className={`relative group flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${
            mobileView === "player" && (currentTrack || isPlaying || overrideCurrentTrack) && !isTrackListExpanded && !showLibrary
              ? "text-emerald-400 font-bold" 
              : "text-slate-500 hover:text-emerald-400"
          }`}
        >
          {isPlaying && (mobileView !== "player" || isTrackListExpanded || showLibrary) && (
            <div className="absolute top-0.5 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-[#0c0c0d]" />
          )}
          <Music className="w-5 h-5 relative z-10" />
          <span className="text-[8px] font-black uppercase tracking-widest text-[#1ED760]">Activo</span>
        </button>
      </div>

      {showNicknameModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 ">
          <div className="w-full max-w-sm bg-[#0d0d0f] border border-emerald-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(30,215,96,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#1ED760] to-teal-500" />
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Configura tu Nickname</h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed mb-6">
              Para interactuar en Novedades y que tu email no sea público, elige un nombre de usuario.
            </p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="Ej: DJ FLUX"
              className="w-full text-center py-3 bg-[#121214] border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 mb-4"
              autoFocus
            />
            <button
              onClick={handleSaveNickname}
              disabled={!nicknameInput.trim()}
              className="w-full py-3 bg-emerald-500 font-black uppercase text-[11px] tracking-wider text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              Guardar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY: LIBRARY MODAL */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute top-[49px] bottom-0 right-0 left-0 md:left-0 bg-[#070708] z-[40] flex items-start justify-center p-0 md:p-0 overflow-hidden shadow-2xl`}
          >
            <div className="w-full h-full flex flex-col bg-[#070708] overflow-hidden relative">
              {/* Starry Background for Library */}
              <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-emerald-500/[0.04] to-transparent pointer-events-none" />

              <div className="flex justify-between items-center px-4 py-4 sm:px-8 relative z-10 shrink-0 border-b border-white/5">
                <div>
                  <h3 className="text-sm sm:text-lg font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">
                    Novedades
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] max-w-sm leading-relaxed">
                    Aquí están las playlists destacadas en novedades
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowLibrary(false)}
                    className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row min-h-0 min-w-0 relative z-10 overflow-hidden">
                {/* 1) Playlist Sidebar/Selector or Grid Column */}
                <div className={`${previewPlaylist ? "hidden md:flex md:w-[320px] bg-black/45 border-r border-white/5" : "flex-1 min-h-0"} flex flex-col overflow-y-auto px-4 pb-24 sm:px-8 scrollbar-none relative z-10 touch-pan-y`}>
                  {previewPlaylist && (
                    <div className="pt-2 pb-4 shrink-0">
                      <button
                        onClick={() => setPreviewPlaylist(null)}
                        className="flex items-center gap-2 py-2 px-3.5 rounded-full bg-white/5 border border-white/5 text-[#1ED760] font-black hover:bg-white/10 active:scale-95 transition-all text-[9.5px] uppercase tracking-wider cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 stroke-[3px]" />
                        <span>Ver todas las playlist</span>
                      </button>
                    </div>
                  )}
                  
                  <div className={`grid ${previewPlaylist ? "grid-cols-1 gap-2.5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"} w-full justify-center`}>
                    {communityPlaylists.map((pl, idx) => {
                      const isPreviewing = previewPlaylist?.id === pl.id;
                      return (
                        <motion.div
                          key={pl.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className="relative group flex flex-col"
                        >
                          <div
                            onClick={() => setPreviewPlaylist(pl)}
                            className={`w-full flex ${previewPlaylist ? "flex-row items-center gap-2.5 p-2 rounded-xl" : "flex-col gap-2 p-3 rounded-2xl aspect-[4/5]"} border transition-all duration-300 text-left relative cursor-pointer ${
                              isPreviewing
                                ? "bg-emerald-500/10 border-emerald-500/35 shadow-inner scale-[0.98]"
                                : pl.isAdminContent
                                  ? "bg-emerald-500/[0.04] border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.05)] hover:bg-emerald-500/[0.08] hover:border-[#1ED760]/55 hover:shadow-[0_12px_32px_rgba(30,215,96,0.18)] hover:-translate-y-1"
                                  : "bg-white/[0.03] border-white/5 hover:border-[#1ED760]/40 hover:bg-white/[0.07] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)] hover:-translate-y-1"
                            }`}
                          >
                            <div className={`${previewPlaylist ? "w-10 h-10 rounded-lg" : "w-full aspect-square rounded-xl"} bg-gradient-to-tr ${getPlaylistGradientClass(pl.name)} flex items-center justify-center text-md sm:text-l shadow-lg relative overflow-hidden shrink-0 transition-transform duration-500`}>
                              <>
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                <span className="relative z-10 shrink-0 select-none filter drop-shadow flex items-center justify-center">
                                  {pl.icon && pl.icon !== "📂" && pl.icon !== "📁" && pl.icon !== "🎵" ? (
                                    pl.icon
                                  ) : (
                                    <Headphones className={`${previewPlaylist ? "w-4 h-4" : "w-6 h-6"} text-white/90`} />
                                  )}
                                </span>
                                { (pl.thumbnail_url || getTrackImage(pl.tracks?.[0])) && (
                                  <img 
                                    src={pl.thumbnail_url || getTrackImage(pl.tracks?.[0]) || ""} 
                                    alt={pl.name} 
                                    className="absolute inset-0 w-full h-full object-cover z-20 bg-[#0d0d0f] transition-transform duration-500 ease-out group-hover:scale-110" loading="lazy" 
                                    referrerPolicy="no-referrer" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                              </>
                              
                              {!previewPlaylist && (
                                <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1 z-30">
                                  <div className={`px-2.5 py-1 ${pl.isAdminContent ? 'bg-[#1ED760] text-black ring-2 ring-[#1ED760]/20 shadow-[0_0_15px_rgba(30,215,96,0.4)]' : 'bg-emerald-500 text-black'} text-[8px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg flex items-center gap-1.5`}>
                                    {pl.isAdminContent && <BadgeCheck className="w-2.5 h-2.5 fill-black" />}
                                    {pl.isAdminContent ? "VERIFICADA" : "Comunidad"}
                                  </div>
                                  <div className="px-2 py-0.5 bg-black/85 rounded-md text-[9px] sm:text-[10.5px] font-extrabold text-white uppercase tracking-widest border border-white/10 shadow-md">
                                    {pl.tracks.length} P • {calculatePlaylistDuration(pl.tracks)}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <p className={`text-xs ${previewPlaylist ? "sm:text-xs font-bold" : "sm:text-[14px] font-bold"} truncate text-white leading-tight transition-colors duration-300 group-hover:text-[#1ED760]`}>
                                {pl.name}
                              </p>
                              {!previewPlaylist && (
                                <p className="text-[10.5px] sm:text-[12px] text-slate-400 font-medium truncate mt-1 normal-case tracking-wide opacity-100 placeholder-opacity-50" title={pl.description || "Sin descripción"}>
                                  {pl.description || "Canal personalizado de música"}
                                </p>
                              )}
                              {pl.ownerName && (
                                <p className="text-[9.5px] text-slate-400 font-semibold tracking-wide truncate mt-1">
                                  Publicada por: <span className={pl.isAdminContent ? "text-[#1ED760] font-black inline-flex items-center gap-1" : "text-[#1ED760] font-bold inline-flex items-center gap-1"}>
                                    {pl.isAdminContent ? "#fluxmusicoficial" : ((pl.ownerName || "").toLowerCase().includes("flux") || (pl.ownerName || "").toLowerCase().includes("oficial") || (pl.ownerName || "").toLowerCase() === "administrador" ? "Socio Premium" : sanitizeOwnerName(pl.ownerName))}
                                    {pl.isAdminContent && <BadgeCheck className="w-2.5 h-2.5 fill-current" />}
                                  </span>
                                </p>
                              )}
                              {!previewPlaylist && (
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1.5 pt-1.5 border-t border-white/[0.04] overflow-hidden">
                                  <span className="text-[7.5px] bg-[#1ED760]/10 text-[#1ED760] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-[#1ED760]/10 shrink-0 select-none">
                                    {getPlaylistGenre(pl)}
                                  </span>
                                  <span className="text-[8.5px] text-amber-400 font-extrabold flex items-center gap-0.5 shrink-0" title="Valoración / Popularidad">
                                    ★ {getPlaylistPopularity(pl).rating}
                                  </span>
                                  <span className="text-[8px] text-slate-400 font-bold shrink-0">
                                    • {getPlaylistPlays(pl)} Escub.
                                  </span>
                                </div>
                              )}
                              {previewPlaylist && (
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                                  {pl.tracks.length} {pl.tracks.length === 1 ? 'Pista' : 'Pistas'}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-[50] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                            {(() => {
                              const alreadySaved = userPlaylists.some(p => p.ownerId === user?.uid && p.name === pl.name);
                              return (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!alreadySaved) saveCommunityPlaylistToLibrary(pl);
                                  }}
                                  className={`w-7 h-7 flex items-center justify-center bg-black/95  rounded-lg border shadow-2xl transition-all ${alreadySaved ? "text-[#1ED760] border-[#1ED760]/30 cursor-default" : "text-slate-400 hover:text-[#1ED760] border-white/10 hover:border-[#1ED760]/30 cursor-pointer hover:scale-110 active:scale-95"}`}
                                  title={alreadySaved ? "En tu biblioteca" : "Añadir a mi Biblioteca"}
                                >
                                  {alreadySaved ? <Check className="w-3.5 h-3.5 stroke-[3px]" /> : <Plus className="w-3.5 h-3.5 stroke-[3px]" />}
                                </button>
                              );
                            })()}
                            {isAdmin && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(pl);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center bg-black/95  rounded-lg text-slate-400 hover:text-emerald-400 border border-white/10 hover:border-emerald-500/30 shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startDeleting(pl.id);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center bg-black/95  rounded-lg text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 shadow-2xl transition-all cursor-pointer hover:scale-110 active:scale-95"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* 2) Playlist Tracks Detail Pane (Interactive Playlist Previewing) */}
                {previewPlaylist && (
                  <div className="flex-1 flex flex-col min-h-0 bg-[#070708] border-l border-white/5 relative overflow-y-auto premium-scrollbar touch-pan-y pb-[120px] sm:pb-0">
                    {/* Header glass panel */}
                    <div className="p-5 sm:p-7 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5 shrink-0 flex flex-col sm:flex-row items-center gap-5 relative">
                      {/* Back button for mobile */}
                      <button
                        onClick={() => setPreviewPlaylist(null)}
                        className="md:hidden absolute top-4 left-4 p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-slate-300 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr ${getPlaylistGradientClass(previewPlaylist.name)} flex items-center justify-center text-3xl shadow-2xl overflow-hidden shrink-0 relative border border-white/10`}>
                        <>
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                          <Headphones className="w-10 h-10 text-white/95 relative z-10" />
                          {previewPlaylist.thumbnail_url && (
                            <img 
                              src={previewPlaylist.thumbnail_url} 
                              alt={previewPlaylist.name} 
                              className="absolute inset-0 w-full h-full object-cover z-20 bg-[#0d0d0f]" loading="lazy" 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                        </>
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-[#1ED760] rounded text-[8px] font-black text-black uppercase tracking-wider">
                          PREVIEW
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left min-w-0 flex flex-col justify-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#1ED760] mb-0.5">
                          Playlist Compartida
                        </p>
                        <h2 className="text-sm sm:text-lg font-black text-white tracking-tight leading-snug uppercase truncate">
                          {previewPlaylist.name}
                        </h2>
                        {previewPlaylist.description && (
                          <p className="text-[11px] text-slate-400 mt-1 font-medium leading-relaxed max-w-xl line-clamp-1">
                            {previewPlaylist.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 mt-2 text-[10px] font-bold text-slate-500">
                          {previewPlaylist.ownerName && (
                            <span className="text-[#1ED760] font-black uppercase tracking-wider">
                              Por {previewPlaylist.isAdminContent ? "#fluxmusicoficial" : ((previewPlaylist.ownerName || "").toLowerCase().includes("flux") || (previewPlaylist.ownerName || "").toLowerCase().includes("oficial") || (previewPlaylist.ownerName || "").toLowerCase() === "administrador" ? "Socio Premium" : sanitizeOwnerName(previewPlaylist.ownerName))}
                            </span>
                          )}
                          {previewPlaylist.ownerName && <span className="text-white/10">•</span>}
                          <span>{previewPlaylist.tracks.length} {previewPlaylist.tracks.length === 1 ? "Pista" : "Pistas"}</span>
                          <span className="text-white/10">•</span>
                          <span className="text-[#1ED760] font-extrabold">{calculatePlaylistDuration(previewPlaylist.tracks)}</span>
                        </div>

                        {/* Intelligent Statistics Row / Info Cards */}
                        <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap items-stretch justify-center sm:justify-start gap-2 max-w-2xl select-none">
                          {/* Genre card */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 flex flex-col items-center sm:items-start shrink-0 text-center sm:text-left min-w-[100px] transition-colors duration-300 hover:bg-white/[0.04]">
                            <span className="text-[7px] xl:text-[7.5px] uppercase tracking-wider text-slate-500 font-bold">Género Musical</span>
                            <span className="text-[10.5px] text-emerald-400 font-black uppercase tracking-wide mt-0.5 truncate max-w-[120px]">{getPlaylistGenre(previewPlaylist)}</span>
                          </div>
                          {/* Popularity rating */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 flex flex-col items-center sm:items-start shrink-0 text-center sm:text-left min-w-[100px] transition-colors duration-300 hover:bg-white/[0.04]">
                            <span className="text-[7px] xl:text-[7.5px] uppercase tracking-wider text-slate-500 font-bold">Popularidad</span>
                            <span className="text-[10.5px] text-amber-400 font-black flex items-center gap-1 mt-0.5">
                              ★ {getPlaylistPopularity(previewPlaylist).rating} <span className="text-[8px] text-slate-500 font-bold">({getPlaylistPopularity(previewPlaylist).score}%)</span>
                            </span>
                          </div>
                          {/* Play count */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 flex flex-col items-center sm:items-start shrink-0 text-center sm:text-left min-w-[100px] transition-colors duration-300 hover:bg-white/[0.04]">
                            <span className="text-[7px] xl:text-[7.5px] uppercase tracking-wider text-slate-500 font-bold">Espectadores</span>
                            <span className="text-[10.5px] text-white font-extrabold mt-0.5">{getPlaylistPlays(previewPlaylist)} reproducciones</span>
                          </div>
                          {/* Saves count */}
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 flex flex-col items-center sm:items-start shrink-0 text-center sm:text-left min-w-[100px] transition-colors duration-300 hover:bg-white/[0.04]">
                            <span className="text-[7px] xl:text-[7.5px] uppercase tracking-wider text-[#1ED760] font-black tracking-widest">En Biblioteca</span>
                            <span className="text-[10.5px] text-slate-300 font-bold mt-0.5">{getPlaylistSaves(previewPlaylist, userPlaylists, user)} veces listado</span>
                          </div>
                        </div>

                        {/* Premium Action Row */}
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 shrink-0">
                          {previewPlaylist.tracks.length > 0 && (
                            <button
                              onClick={() => playPreviewTrack(previewPlaylist, 0)}
                              className="md:scale-100 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 bg-[#1ED760] text-black hover:bg-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 shadow-xl cursor-pointer"
                              title="Reproducir este canal"
                            >
                              {playingPlaylist?.id === previewPlaylist.id && isPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-black stroke-[3px]" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-black stroke-[3px]" />
                              )}
                              <span>{playingPlaylist?.id === previewPlaylist.id && isPlaying ? "Pausar" : "Reproducir"}</span>
                            </button>
                          )}

                          {(() => {
                            const isFullPlaylistAlreadySaved = userPlaylists.some(pl => pl.ownerId === user?.uid && pl.name.toLowerCase() === previewPlaylist.name.toLowerCase());
                            return isFullPlaylistAlreadySaved ? (
                              <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-wider rounded-full pointer-events-none select-none">
                                <Check className="w-3.5 h-3.5 text-[#1ED760] stroke-[3px]" />
                                <span>En tu Biblioteca</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleCopyPlaylistToProfile(previewPlaylist)}
                                className="md:scale-100 hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 bg-white/5 border border-white/10 hover:border-white/30 text-white font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-300 shadow-xl cursor-pointer"
                                title="Guardar este canal de novedades"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                                <span>Añadir Playlist Completa</span>
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Tracks container */}
                    <div className="flex-1 px-2 py-3 sm:px-6">
                      {previewPlaylist.tracks.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center text-slate-500">
                          <Music className="w-8 h-8 opacity-40 mb-2" />
                          <p className="text-xs uppercase font-bold tracking-wider">Esta playlist no tiene canciones</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {previewPlaylist.tracks.map((track, trackIdx) => {
                            const isCurrentlyActiveInPlayer = playingPlaylist?.id === previewPlaylist.id && currentTrackIndex === trackIdx;
                            const isCurrentlyPlaying = isCurrentlyActiveInPlayer && isPlaying;
                            const favPlaylist = userPlaylists.find(p => p.ownerId === user?.uid && (p.name.toLowerCase() === "favoritos" || p.name.toLowerCase() === "siguiente"));
                            const isLiked = favPlaylist?.tracks.some(t => (track.id && t.id === track.id) || (track.url && t.url === track.url));
                            
                            return (
                              <div
                                key={`prev_trk_${track.id || 'x'}_${trackIdx}`}
                                onClick={() => {
                                  playPreviewTrack(previewPlaylist, trackIdx);
                                }}
                                className={`w-full flex items-center justify-between p-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                                  isCurrentlyActiveInPlayer
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-white"
                                    : "bg-white/[0.01] hover:bg-white/[0.04] border-transparent text-slate-300 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  {/* Play/Index Indicator */}
                                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                    {isCurrentlyActiveInPlayer ? (
                                      isCurrentlyPlaying ? (
                                        <div className="flex items-end gap-0.5 h-2.5">
                                          <div className={`w-0.5 bg-[#1ED760] h-full ${isEcoMode ? '' : 'animate-bounce'}`} style={{ animationDelay: "0.1s", animationDuration: "0.8s" }} />
                                          <div className={`w-0.5 bg-[#1ED760] h-2/3 ${isEcoMode ? '' : 'animate-bounce'}`} style={{ animationDelay: "0.3s", animationDuration: "0.5s" }} />
                                          <div className={`w-0.5 bg-[#1ED760] h-1/2 ${isEcoMode ? '' : 'animate-bounce'}`} style={{ animationDelay: "0s", animationDuration: "0.7s" }} />
                                        </div>
                                      ) : (
                                        <Play className="w-3 h-3 text-[#1ED760] fill-[#1ED760]" />
                                      )
                                    ) : (
                                      <span className="text-[10px] font-bold text-slate-500">{trackIdx + 1}</span>
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <p className={`text-[11.5px] sm:text-xs font-bold truncate tracking-tight ${isCurrentlyActiveInPlayer ? "text-[#1ED760]" : "text-slate-150"}`}>
                                      {track.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">
                                      {track.artist || "Artista Desconocido"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                  {isCurrentlyActiveInPlayer && (
                                    <span className="hidden xs:inline-block text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#1ED760] bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.2 rounded-full">
                                      {isCurrentlyPlaying ? "REPRODUCIENDO" : "PAUSADO"}
                                    </span>
                                  )}

                                  {/* Hover Actions Block */}
                                  <div className="flex items-center gap-1 relative z-20">
                                    {/* Action 1: Me gusta (Heart) */}
                                    <button
                                      onClick={(e) => handleToggleFavorite(track, e)}
                                      className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-500/10 rounded-lg transition-all cursor-pointer"
                                      title={isLiked ? "Quitar de Favoritos" : "Me gusta"}
                                    >
                                      <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? "text-pink-500 fill-pink-500" : ""}`} />
                                    </button>

                                    {/* Action 2: Añadir canción (Plus) */}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addSingleTrackToCurrentPlaylist(track);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-[#1ED760] hover:bg-[#1ED760]/10 rounded-lg transition-all cursor-pointer"
                                      title="Añadir a mi Playlist"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Action 3: Añadir a la Cola (ListPlus o similar) */}
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const mappedTrack: MusicTrack = {
                                          id: track.id || `preview_${trackIdx}`,
                                          title: track.title,
                                          artist: track.artist || "Flux",
                                          url: track.url,
                                          duration: track.duration || "N/A",
                                          bpm: 120
                                        };
                                        handleAddToQueue(mappedTrack, e);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-[#1ED760] hover:bg-[#1ED760]/10 rounded-lg transition-all cursor-pointer"
                                      title="Añadir a la cola"
                                    >
                                      <PlusCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <span className="font-bold text-[10px] font-mono text-slate-400 min-w-[35px] text-right">
                                    {track.duration || "3:30"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: EDIT PLAYLIST MODAL */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
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
            initial={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
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

      {/* OVERLAY: DELETE TRACK CONFIRMATION MODAL */}
      <AnimatePresence>
        {trackToDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80"
          >
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[40px] p-6 sm:p-10 shadow-[0_0_100px_rgba(239,68,68,0.1)] relative"
            >
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 blur-[120px] rounded-full" />
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-500/10 rounded-xl">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase text-white tracking-[0.3em]">
                      Eliminar Canción
                    </h2>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                      Confirmar Eliminación
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTrackToDeleteConfirm(null)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all transform hover:rotate-90 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 relative z-10 text-left">
                <p className="text-xs sm:text-sm text-slate-300 font-medium px-2 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la canción <span className="text-emerald-400 font-bold">"{trackToDeleteConfirm.title}"</span> de la playlist <span className="text-white font-bold">"{selectedPlaylist?.name}"</span>? Esta acción no se puede deshacer.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setTrackToDeleteConfirm(null)}
                    className="flex-1 bg-white/5 text-white py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all cursor-pointer text-center"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={executeDeleteTrack}
                    className="flex-1 bg-red-500 text-black hover:bg-red-400 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(239,68,68,0.2)] transition-all cursor-pointer text-center"
                  >
                    Confirmar
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
            initial={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
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
                  {(() => {
                    const pl = userPlaylists.find(p => p.id === deletingId);
                    const isOwner = user && pl && pl.ownerId === user.uid;
                    const isSystemMasterPlaylist = pl && pl.adminSecret === "ho82788278";
                    const needsPasscode = isSystemMasterPlaylist && !isAdmin && !isOwner;
                    return needsPasscode && !isBlocked ? (
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
                    ) : null;
                  })()}

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

      {/* OVERLAY: ADD TO LIBRARY MODAL (Spotify Style) */}
      <AnimatePresence>
        {isAddingToPlaylistModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 "
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#1ED760]/10 rounded-lg">
                    <ListMusic className="w-4 h-4 text-[#1ED760]" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase text-white tracking-[0.2em]">
                    {trackToAddDestination ? "Añadir a Biblioteca" : "Crear Playlist"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsAddingToPlaylistModalOpen(false);
                    setTrackToAddDestination(null);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content Container */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
                
                {/* Track Preview Card (only if adding a track) */}
                {trackToAddDestination && (
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
                    {trackToAddDestination.thumbnail ? (
                      <img
                        src={trackToAddDestination.thumbnail}
                        alt={trackToAddDestination.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
                        <Music className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] font-black text-[#1ED760] bg-[#1ED760]/10 px-1.5 py-0.5 rounded leading-none uppercase tracking-widest border border-[#1ED760]/20">
                          {trackToAddDestination.isPlaylist ? "Playlist" : "Canción"}
                        </span>
                        {trackToAddDestination.duration && (
                          <span className="text-[9px] text-slate-500 font-bold">{trackToAddDestination.duration}</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{trackToAddDestination.title}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{trackToAddDestination.artist}</p>
                    </div>
                  </div>
                )}

                {/* Tabs selection (Only if we have a track to add) */}
                {trackToAddDestination && (
                  <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 overflow-hidden">
                    <button
                      onClick={() => setModalSelectedPlaylistId(userPlaylists.filter(p => p.ownerId === user?.uid).length > 0 ? userPlaylists.filter(p => p.ownerId === user?.uid)[0].id : "new")}
                      className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl ${modalSelectedPlaylistId !== "new" ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-400"}`}
                    >
                      Playlist Existente
                    </button>
                    <button
                      onClick={() => setModalSelectedPlaylistId("new")}
                      className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl ${modalSelectedPlaylistId === "new" ? "bg-[#1ED760] text-black shadow-xl" : "text-slate-500 hover:text-slate-400"}`}
                    >
                      Nueva Playlist
                    </button>
                  </div>
                )}

                {/* Display form for new or selection for existing */}
                {modalSelectedPlaylistId === "new" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Nombre de la playlist</label>
                      <input
                        type="text"
                        value={modalNewPlaylistName}
                        onChange={(e) => setModalNewPlaylistName(e.target.value)}
                        placeholder={trackToAddDestination ? `Playlist de ${trackToAddDestination.artist || 'Favoritos'}` : "Mi nueva lista..."}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-[#1ED760]/30 focus:bg-white/[0.05] transition-all font-bold"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Descripción (opcional)</label>
                      <textarea
                        value={modalNewPlaylistDesc}
                        onChange={(e) => setModalNewPlaylistDesc(e.target.value)}
                        placeholder="Escribe algo sobre este canal..."
                        rows={2}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white outline-none focus:border-[#1ED760]/30 focus:bg-white/[0.05] transition-all font-medium resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Selecciona destino</label>
                    {userPlaylists
                      .filter(p => (p.ownerId === user?.uid || isAdmin || savedSecurityCode === "ho82788278") && p.name.toLowerCase() !== "favoritos")
                      .map((pl) => (
                        <button
                          key={pl.id}
                          onClick={() => setModalSelectedPlaylistId(pl.id)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left ${modalSelectedPlaylistId === pl.id ? "bg-[#1ED760]/10 border-[#1ED760]/30" : "bg-white/[0.02] border-transparent hover:bg-white/[0.04]"}`}
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center bg-[#333]">
                            <ListMusic className="w-4 h-4 text-slate-500 absolute" />
                            { (pl.thumbnail_url || getTrackImage(pl.tracks?.[0])) && (
                              <img 
                                src={pl.thumbnail_url || getTrackImage(pl.tracks?.[0]) || ""} 
                                className="absolute inset-0 w-full h-full object-cover z-10" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }} 
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-[11px] font-black truncate ${modalSelectedPlaylistId === pl.id ? "text-[#1ED760]" : "text-white"}`}>{pl.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold">{pl.tracks?.length || 0} canciones</p>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-5 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={() => {
                    setIsAddingToPlaylistModalOpen(false);
                    setTrackToAddDestination(null);
                  }}
                  className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest cursor-pointer px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  disabled={isProcessingModalAdd || (modalSelectedPlaylistId === "new" && !modalNewPlaylistName.trim())}
                  onClick={() => executeModalAddTrack(modalSelectedPlaylistId, modalSelectedPlaylistId === "new")}
                  className="bg-[#1ED760] hover:bg-emerald-400 text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#1ED760]/10 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
                >
                  {isProcessingModalAdd ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5 stroke-[3px]" />}
                  <span>{modalSelectedPlaylistId === "new" ? "Crear ahora" : "Añadir ahora"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: LEGACY SYSTEM REMOVED */}

      {isAdminPanelOpen && <UserManagementAdmin onClose={() => setIsAdminPanelOpen(false)} />}

      {/* OVERLAY: TELEGRAM SUPPORT MODAL */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 "
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4.5 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent text-left">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-purple-500/10 to-emerald-500/5 rounded-xl border border-white/5">
                    <MessageSquare className="w-4 h-4 text-[#1ED760]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-[0.15em]">
                      Atención y Soporte Flux
                    </h3>
                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                      Canal de Asistencia Premium
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSupportModalOpen(false);
                    setSupportMessage("");
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold text-left">
                  Escribe tu consulta, reporta una anomalía técnica o comparte tus ideas para hacernos llegar tu propuesta directamente al departamento de servicio.
                </p>

                {/* Category Selectors */}
                <div className="space-y-2 text-left">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                    Tipo de Solicitud / Mensaje
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSupportCategory("soporte")}
                      className={`py-2 px-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        supportCategory === "soporte"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/30 font-black shadow-[0_2px_10px_rgba(168,85,247,0.1)]"
                          : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Soporte</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportCategory("fallo")}
                      className={`py-2 px-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        supportCategory === "fallo"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 font-black shadow-[0_2px_10px_rgba(244,63,94,0.1)]"
                          : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Bug className="w-3.5 h-3.5" />
                      <span>Fallo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportCategory("feedback")}
                      className={`py-2 px-1 flex flex-col items-center justify-center gap-1.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        supportCategory === "feedback"
                          ? "bg-[#1ED760]/10 text-[#1ED760] border-[#1ED760]/20 font-black shadow-[0_2px_10px_rgba(30,215,96,0.1)]"
                          : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Feedback</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[8.5px] font-black uppercase tracking-widest text-[#1ED760] pl-1">Tu mensaje</label>
                  <textarea
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder={
                      supportCategory === "feedback"
                        ? "Escribe aquí sugerencias o qué te gustaría mejorar de Flux Music..."
                        : supportCategory === "fallo"
                        ? "Por favor, explica detalladamente el fallo o comportamiento que has notado..."
                        : "Escribe detalladamente tu consulta para que podamos ayudarte..."
                    }
                    rows={5}
                    maxLength={1000}
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white outline-none focus:border-purple-500/30 focus:border-solid focus:bg-white/[0.05] transition-all font-medium resize-none shadow-inner"
                  />
                  <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold px-1">
                    <span>Máximo 1000 caracteres</span>
                    <span>{supportMessage.length}/1000</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={() => {
                    setIsSupportModalOpen(false);
                    setSupportMessage("");
                  }}
                  className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest cursor-pointer px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  disabled={isSendingSupport || !supportMessage.trim()}
                  onClick={handleSendSupportMessage}
                  className="relative overflow-hidden group bg-gradient-to-r from-emerald-500 via-[#1ED760] to-emerald-600 hover:shadow-[0_0_20px_rgba(30,215,96,0.4)] text-black px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale cursor-pointer border border-[#1ED760]/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSendingSupport ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 stroke-[2.5px]" />
                        <span>Enviar Mensaje</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: SPOTIFY-STYLE MULTI-OPTION PLAYLIST COPIER */}
      <AnimatePresence>
        {playlistToCopy && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 bg-black/85"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
            >
              {/* Green layout ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#1ED760]/10 blur-[60px] pointer-events-none rounded-full" />

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1ED760]/10 rounded-xl flex items-center justify-center border border-[#1ED760]/20 shrink-0">
                    <ListPlus className="w-5 h-5 text-[#1ED760]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-[0.2em]">Guardar Canal</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 font-sans">
                      Añade "{playlistToCopy.name}" a tu perfil
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPlaylistToCopy(null)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all transform hover:rotate-90 cursor-pointer text-center flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Selection cards */}
              <div className="space-y-5 relative z-10">
                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                  ¿Dónde quieres guardar este canal en tu biblioteca? Elige una opción:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Create a new playlist */}
                  <button
                    type="button"
                    onClick={() => setTargetPlaylistIdForCopy("new")}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      targetPlaylistIdForCopy === "new"
                        ? "bg-[#1f1f1f] border-[#1ED760] shadow-[0_0_15px_rgba(30,215,96,0.15)]"
                        : "bg-[#181818] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${targetPlaylistIdForCopy === "new" ? "border-[#1ED760]" : "border-slate-500"}`}>
                        {targetPlaylistIdForCopy === "new" && <div className="w-2 bg-[#1ED760] h-2 rounded-full" />}
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider font-sans">Crear Nuevo Canal</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-snug">
                      Clona el canal de novedades como una lista independiente.
                    </p>
                  </button>

                  {/* Option 2: Add to an existing playlist (enabled only if they own at least one) */}
                  <button
                    type="button"
                    disabled={userPlaylists.filter(p => p.ownerId === user?.uid).length === 0}
                    onClick={() => {
                      const owned = userPlaylists.filter(p => p.ownerId === user?.uid);
                      if (owned.length > 0) {
                        setTargetPlaylistIdForCopy(owned[0].id);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      userPlaylists.filter(p => p.ownerId === user?.uid).length === 0 ? "opacity-40 grayscale cursor-not-allowed" : ""
                    } ${
                      targetPlaylistIdForCopy !== "new"
                        ? "bg-[#1f1f1f] border-[#1ED760] shadow-[0_0_15px_rgba(30,215,96,0.15)]"
                        : "bg-[#181818] border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${targetPlaylistIdForCopy !== "new" ? "border-[#1ED760]" : "border-slate-500"}`}>
                        {targetPlaylistIdForCopy !== "new" && <div className="w-2 bg-[#1ED760] h-2 rounded-full" />}
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-wider font-sans">Añadir a Existente</span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 leading-snug">
                      Agrega las canciones de este canal a una de tus listas personales.
                    </p>
                  </button>
                </div>

                {/* Subforms based on choice */}
                {targetPlaylistIdForCopy === "new" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 bg-[#181818] p-4 rounded-2xl border border-white/5"
                  >
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-sans">Nombre del Canal</label>
                      <input
                        type="text"
                        value={copyPlaylistNameInput}
                        onChange={(e) => setCopyPlaylistNameInput(e.target.value)}
                        placeholder="Mi Lista de Música..."
                        className="w-full bg-[#121212] border border-white/5 focus:border-[#1ED760]/40 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-[#1ED760]/20 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1 font-sans">Descripción</label>
                      <input
                        type="text"
                        value={copyPlaylistDescInput}
                        onChange={(e) => setCopyPlaylistDescInput(e.target.value)}
                        placeholder="Breve descripción..."
                        className="w-full bg-[#121212] border border-white/5 focus:border-[#1ED760]/40 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-[#1ED760]/20 transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}

                {targetPlaylistIdForCopy !== "new" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3 bg-[#181818] p-4 rounded-2xl border border-white/5"
                  >
                    <div>
                      <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1.5 font-sans">Elige tu Canal Destino</label>
                      <select
                        value={targetPlaylistIdForCopy}
                        onChange={(e) => setTargetPlaylistIdForCopy(e.target.value)}
                        className="w-full bg-[#121212] border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-[#1ED760]/50 transition-all font-bold tracking-wide cursor-pointer"
                      >
                        {userPlaylists
                          .filter(p => p.ownerId === user?.uid)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.icon || "📂"} {p.name} ({p.tracks?.length || 0} canciones)
                            </option>
                          ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProcessCopyPlaylist}
                    disabled={isProcessingCopy || (targetPlaylistIdForCopy === "new" && !copyPlaylistNameInput.trim())}
                    className="w-full py-4 bg-[#1ED760] hover:bg-white text-black hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed font-black uppercase tracking-widest text-[10px] rounded-2xl cursor-pointer flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(30,215,96,0.15)] hover:shadow-[#1ED760]/20"
                  >
                    {isProcessingCopy ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ListPlus className="w-4.5 h-4.5" />
                        <span>{targetPlaylistIdForCopy === "new" ? "CREAR CANAL EN MI PERFIL" : "FUSIONAR CON MI CANAL"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAdminPanelOpen && <UserManagementAdmin onClose={() => setIsAdminPanelOpen(false)} />}
      {isProfileModalOpen && <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />}

      <AnimatePresence>
        {sessionHijacked && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            animate={{ opacity: 1, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: isEcoMode ? "none" : "blur(8px)" }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/90"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-full max-w-sm bg-[#121212] border border-[#1ED760]/30 rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(30,215,96,0.2)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#1ED760]/20 blur-[50px] pointer-events-none rounded-full" />
              
              <div className="w-16 h-16 bg-black rounded-full border border-white/10 flex items-center justify-center mb-5 relative z-10">
                <Headphones className="w-8 h-8 text-[#1ED760]" />
              </div>
              
              <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2 relative z-10">
                Reproducción Pausada
              </h2>
              <p className="text-sm text-slate-400 font-medium mb-6 relative z-10 leading-relaxed">
                Tu cuenta está activa en otro dispositivo. Solo se permite 1 usuario simultáneo en tu plan actual.
              </p>
              
              <button
                onClick={() => setSessionHijacked(false)}
                className="w-full bg-[#1ED760] hover:bg-[#1fdf64] text-black py-3.5 rounded-full font-black uppercase text-xs tracking-widest shadow-[0_10px_30px_rgba(30,215,96,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer relative z-10"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {((!user && !authLoading) || (accessData && !accessData.isValid)) && (
        <div className="absolute inset-0 z-[99999] bg-gradient-to-b from-[#090b0a] via-[#040504] to-[#000]  flex flex-col items-center justify-center p-4 sm:p-8 text-center overscroll-none select-none overflow-y-auto">
          {/* Authentic Spotify premium subtle ambient green glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#1ED760]/10 blur-[120px] pointer-events-none animate-pulse" />

          <div className="relative z-10 max-w-sm w-full bg-[#121212] border border-white/10 rounded-2xl sm:rounded-[28px] p-4 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.9)] flex flex-col items-center">
            {/* Spotify Brand Emblem / Tech Vibe Dot */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full border border-[#1ED760]/20 flex items-center justify-center mb-4 sm:mb-6 shadow-inner relative group">
              <span className="absolute inset-0 rounded-full bg-[#1ED760]/10 blur-sm group-hover:bg-[#1ED760]/20 transition-all pointer-events-none" />
              <Headphones className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#1ED760] relative z-10 animate-bounce" />
            </div>

            {!user ? (
              <>
                <p className="text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest text-[#1ED760] mb-3 sm:mb-4 px-3 bg-[#1ED760]/10 py-1 rounded-full border border-[#1ED760]/20">
                  Música Premium Interminable
                </p>
                            {/* Spotify-style premium interactive dropdown block */}
                <div className="w-full mb-4 sm:mb-5 text-center relative z-30">
                  <h3 className="text-white font-bold text-lg sm:text-xl mb-2 drop-shadow-md">Bienvenido a Flux Music</h3>
                  <p className="text-slate-200 text-xs sm:text-[13px] leading-relaxed max-w-sm mx-auto font-medium drop-shadow">
                    Descubre una experiencia sin límites. Escucha millones de canciones, crea playlists personalizadas, 
                    encuentra las mejores tendencias de tu país y sincroniza tu música en todos tus dispositivos en calidad óptima.
                  </p>
                </div>
                
                <button 
                  onClick={() => setAuthModalOpen(true)} 
                  className="w-full bg-[#1ED760] hover:bg-[#1fdf64] text-black py-2.5 sm:py-3.5 rounded-full font-black uppercase text-[10px] sm:text-xs tracking-wider sm:tracking-widest shadow-[0_10px_30px_rgba(30,215,96,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión / Registro</span>
                </button>
              </>
            ) : (
              <>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mb-1 font-sans">
                  {accessData.plan === "none" && !accessData.trialStart ? "Acceso Restringido" : "Fin de Suscripción"}
                </h1>
                
                <p className="text-[8.5px] sm:text-[9px] font-black uppercase tracking-widest text-[#1ED760] mb-3 sm:mb-5 px-3 bg-[#1ED760]/10 py-0.5 rounded-full border border-[#1ED760]/20">
                  {accessData.plan === "none" && !accessData.trialStart ? "Privado • Pendiente de Alta" : "Membresía Expirada"}
                </p>
                
                <p className="text-[#a7a7a7] max-w-xs mx-auto mb-4 sm:mb-6 text-[10.5px] sm:text-xs font-medium leading-relaxed">
                  {accessData.plan === "none" && !accessData.trialStart 
                    ? "Para garantizar máxima estabilidad y baja latencia, controlamos manualmente el aforo. Adquiere o solicita tu prueba."
                    : "Tu licencia ha finalizado. Restablece tu acceso a los canales de alta fidelidad renovando tu membresía."}
                </p>
                
                <div className="flex flex-col gap-3 w-full">
                  {isCheckingTrialRequest ? (
                    <div className="flex items-center justify-center p-3 text-emerald-400 font-bold text-xs gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>Procesando...</span>
                    </div>
                  ) : trialRequestStatus === "idle" ? (
                    <button 
                      onClick={handleRequestTrial} 
                      className="w-full bg-gradient-to-r from-emerald-500 to-[#1ED760] hover:from-emerald-400 hover:to-[#1fdf64] text-black py-2.5 sm:py-3 px-3 sm:px-4 rounded-full font-black uppercase text-[10px] sm:text-[10.5px] tracking-wider shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/20 animate-pulse hover:animate-none"
                    >
                      <span>⚡ Pedir Acceso Gratis de 7 Días</span>
                    </button>
                  ) : (
                    <div className={`p-3 rounded-2xl border text-[10px] sm:text-[11px] font-semibold leading-relaxed text-center ${
                      trialRequestStatus === "sent" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/10 text-red-400"
                    }`}>
                      {trialRequestMsg}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      )}



    </div>
  );
}
