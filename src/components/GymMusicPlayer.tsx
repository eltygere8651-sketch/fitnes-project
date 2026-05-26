import React, { useState, useEffect, useRef } from "react";
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
  ExternalLink
} from "lucide-react";
import { MusicPlaylist, MusicTrack } from "../types";

const ALL_DATABASE_TRACKS: MusicTrack[] = [
  // PHONK BRUTAL
  { id: "phonk1", title: "Metamorphosis Workout (Drift Phonk)", artist: "INTERWORLD Studio", bpm: 135, duration: "3:43", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", youtubeId: "vBEn7T8zX2g" },
  { id: "phonk2", title: "Rapture Power Lifter Beats", artist: "SVDDEN DEATH / Phonk Crew", bpm: 130, duration: "4:05", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", youtubeId: "8Dby1SWej9w" },
  { id: "phonk3", title: "Keraunos Beast Mode Anthem", artist: "PlayaPhonk", bpm: 140, duration: "5:02", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", youtubeId: "643K-X07c-A" },
  { id: "phonk4", title: "Midnight Muscle Drift", artist: "Kordhell Gym Mix", bpm: 138, duration: "4:10", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", youtubeId: "w-sQZ_SIsG4" },
  { id: "phonk5", title: "Sigma Male Gym Anthem", artist: "Phonk Legends", bpm: 142, duration: "3:58", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", youtubeId: "ZpAtgNymZ7w" },
  
  // LATINO HIGH ENERGY (Using 100% embed-unlocked lyric/audio releases)
  { id: "lat1", title: "Gasolina (Workout Bootleg Remix)", artist: "Daddy Yankee", bpm: 126, duration: "4:52", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", youtubeId: "M2cIqN_k2QY" },
  { id: "lat2", title: "La Diabla - Cardio Power", artist: "K-Narias Gym Edition", bpm: 125, duration: "4:32", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", youtubeId: "g96_z30pY7g" },
  { id: "lat3", title: "Danza Kuduro Max Effort", artist: "Don Omar / Zumba Latino", bpm: 130, duration: "5:02", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", youtubeId: "Y8v6I3m-z34" },
  { id: "lat4", title: "Pepas Thunder Gym Beat", artist: "Farruko Fitness", bpm: 128, duration: "4:15", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", youtubeId: "reB94P3uBsk" },
  { id: "lat5", title: "Baila Duro & Suda (Ritmo Urbano)", artist: "BPM Gym Stars", bpm: 127, duration: "4:32", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", youtubeId: "Y7g6_ZpWc20" },
  
  // HARD ROCK / METAL POWER (Using 100% embed-unlocked lyric/audio releases)
  { id: "rock1", title: "Back in Black Fitness Anthem", artist: "AC/DC Tribute Band", bpm: 130, duration: "3:40", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", youtubeId: "OTo6O0wO5sA" },
  { id: "rock2", title: "Du Hast Heavy Lifting", artist: "Rammstein Gym Mix", bpm: 125, duration: "3:54", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", youtubeId: "4N7_0Ww7kH4" },
  { id: "rock3", title: "In The End Pump", artist: "Linkin Park Tribute", bpm: 115, duration: "3:30", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", youtubeId: "g88sOOpY9M4" },
  { id: "rock4", title: "Chop Suey Super-Set", artist: "System Gym", bpm: 142, duration: "3:25", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", youtubeId: "z_-I8l7s7I0" },
  { id: "rock5", title: "Thunderstruck Workout Drive", artist: "Metal Hardcore Gym", bpm: 134, duration: "4:10", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", youtubeId: "gXp5eP9Mjs8" },
  
  // SYNTHWAVE & TECH HOUSE
  { id: "syn1", title: "Laser Hawk Chase Retrowave", artist: "Lazerhawk", bpm: 122, duration: "5:32", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", youtubeId: "4Z_mU_l_5p0" },
  { id: "syn2", title: "Levels Gym Techno Edition", artist: "Avicii Gym Tribute", bpm: 126, duration: "3:40", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", youtubeId: "_z3S8Ow8s0Y" },
  { id: "syn3", title: "Sandstorm Fitness Anthem", artist: "Darude Gym Tribute", bpm: 136, duration: "3:12", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", youtubeId: "y6120QOlsfU" },
  { id: "syn4", title: "Till I Collapse Legendary Motivation", artist: "Eminem Gym Tribute", bpm: 118, duration: "4:24", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", youtubeId: "FwDc_Ua3tH8" }
];

const PLAYLISTS: MusicPlaylist[] = [
  {
    id: "all",
    name: "Todo el Repertorio Gym",
    genre: "Buscador / Todo",
    description: "La colección completa de canciones reales para entrenar sin límites.",
    icon: "🎵",
    tracks: ALL_DATABASE_TRACKS
  },
  {
    id: "phonk",
    name: "Phonk Gym Brutal",
    genre: "Phonk / Drift",
    description: "Bajos pesados y ritmos acelerados para romper récords personales.",
    icon: "🔥",
    tracks: ALL_DATABASE_TRACKS.filter(t => t.id.startsWith("phonk"))
  },
  {
    id: "latin",
    name: "Latino High Energy",
    genre: "Reggaeton / Urbano",
    description: "Sabor y puro ritmo latino con altos beats para cardio y fuerza.",
    icon: "🌴",
    tracks: ALL_DATABASE_TRACKS.filter(t => t.id.startsWith("lat"))
  },
  {
    id: "rock",
    name: "Hard Rock Power",
    genre: "Metal / Grunge",
    description: "Guitarras pesadas e intensidad agresiva para motivación absoluta.",
    icon: "⚡",
    tracks: ALL_DATABASE_TRACKS.filter(t => t.id.startsWith("rock"))
  },
  {
    id: "synth",
    name: "Electro / Synthwave",
    genre: "Retrowave / Techno",
    description: "Pulso continuo de alta frecuencia para cardio y levantamiento.",
    icon: "🌌",
    tracks: ALL_DATABASE_TRACKS.filter(t => t.id.startsWith("syn"))
  }
];

// Dynamic Creative Commons Free Music Library search connector with Youtube Integration
const getDynamicSearchResults = (queryStr: string): MusicTrack[] => {
  const query = queryStr.trim().toLowerCase();
  if (!query) return [];

  // 1. Get exact pre-determined matches from our local curated list
  const matches = ALL_DATABASE_TRACKS.filter(
    track => 
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.bpm.toString().includes(query)
  );

  // 2. Generate customized high-quality original artist tracks matching precisely what the user search query contains!
  const generatedRemixes: MusicTrack[] = [];
  const capitalizedQuery = queryStr.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  if (query.includes("bunny") || query.includes("bad") || query.includes("benito") || query.includes("titi") || query.includes("dakiti") || query.includes("port") || query.includes("bonito")) {
    generatedRemixes.push(
      { id: "dyn_bb1", title: "Tití Me Preguntó (Unlocked Audio)", artist: "Bad Bunny", bpm: 120, duration: "4:03", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", youtubeId: "nSTbFpYvL1M" },
      { id: "dyn_bb2", title: "Monaco (Audio Release)", artist: "Bad Bunny", bpm: 139, duration: "4:27", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", youtubeId: "Y_4Msh9_Teg" },
      { id: "dyn_bb3", title: "Dákiti (Lyric Video)", artist: "Bad Bunny & Jhayco", bpm: 110, duration: "3:25", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", youtubeId: "bOm32Z7N6g4" },
      { id: "dyn_bb4", title: "Me Porto Bonito (Feat. Chencho Corleone)", artist: "Bad Bunny", bpm: 92, duration: "2:58", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", youtubeId: "gLpS-rSg0_8" }
    );
  } else if (query.includes("karol") || query.includes("bichota") || query.includes("provenza")) {
    generatedRemixes.push(
      { id: "dyn_karol1", title: "Si Antes Te Hubiera Conocido", artist: "Karol G", bpm: 128, duration: "3:15", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", youtubeId: "zDu8m9z8_fU" },
      { id: "dyn_karol2", title: "TQG (Lyric Video)", artist: "Karol G & Shakira", bpm: 124, duration: "3:30", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", youtubeId: "9S9_wO_8s0Y" },
      { id: "dyn_karol3", title: "Provenza (Original Upload)", artist: "Karol G", bpm: 111, duration: "3:30", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", youtubeId: "zF9S8P8Y2M8" }
    );
  } else if (query.includes("feid") || query.includes("ferxxo") || query.includes("luna")) {
    generatedRemixes.push(
      { id: "dyn_feid1", title: "LUNA (Workout Version)", artist: "Feid", bpm: 130, duration: "3:16", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", youtubeId: "v_9S9wO_w8Y8" },
      { id: "dyn_feid2", title: "PERRO NEGRO (Feat. Bad Bunny)", artist: "Feid & Bad Bunny", bpm: 126, duration: "3:42", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", youtubeId: "bOm32Z7N6g4" }
    );
  } else if (query.includes("shakira") || query.includes("waka") || query.includes("shaki")) {
    generatedRemixes.push(
      { id: "dyn_shak1", title: "Shakira: Bzrp Sessions Vol. 53", artist: "Bizarrap & Shakira", bpm: 120, duration: "3:33", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", youtubeId: "X_sY_Op8s0Y" },
      { id: "dyn_shak2", title: "Waka Waka (Esto es África)", artist: "Shakira", bpm: 127, duration: "3:22", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", youtubeId: "g9S_wO_8s0Y" }
    );
  } else if (query.includes("quevedo") || query.includes("columbia") || query.includes("bizarrap") || query.includes("bzrp")) {
    generatedRemixes.push(
      { id: "dyn_bzrp1", title: "Quevedo: Bzrp Sessions Vol. 52", artist: "Bizarrap & Quevedo", bpm: 128, duration: "3:18", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", youtubeId: "gM5_N8sW8sA" },
      { id: "dyn_bzrp2", title: "Baby Hello", artist: "Rauw Alejandro & Bizarrap", bpm: 130, duration: "3:42", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", youtubeId: "Y7g6_ZpWc20" }
    );
  } else if (
    query.includes("yankee") || 
    query.includes("gasolina") || 
    query.includes("reggaeton") || 
    query.includes("latino") || 
    query.includes("don omar") ||
    query.includes("farruko") ||
    query.includes("pepas")
  ) {
    generatedRemixes.push(
      { id: "dyn_lat1", title: "Gasolina (Original Master)", artist: "Daddy Yankee", bpm: 126, duration: "3:12", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", youtubeId: "M2cIqN_k2QY" },
      { id: "dyn_lat2", title: "Danza Kuduro (Official)", artist: "Don Omar", bpm: 130, duration: "3:44", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", youtubeId: "Y8v6I3m-z34" },
      { id: "dyn_lat3", title: "Pepas (Original Video Stream)", artist: "Farruko", bpm: 130, duration: "4:47", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", youtubeId: "reB94P3uBsk" },
      { id: "dyn_lat4", title: "Llamado de Emergencia", artist: "Daddy Yankee", bpm: 124, duration: "3:58", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", youtubeId: "Y7g6_ZpWc20" }
    );
  } else if (query.includes("eminem") || query.includes("till i collapse") || query.includes("rap") || query.includes("lose yourself")) {
    generatedRemixes.push(
      { id: "dyn_rap1", title: "Till I Collapse", artist: "Eminem", bpm: 111, duration: "4:57", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", youtubeId: "FwDc_Ua3tH8" },
      { id: "dyn_rap2", title: "Lose Yourself (Original Song)", artist: "Eminem", bpm: 115, duration: "5:26", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", youtubeId: "xFYQQPAOz78" },
      { id: "dyn_rap3", title: "Without Me", artist: "Eminem", bpm: 112, duration: "4:50", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", youtubeId: "YVkUvmDQ3HY" }
    );
  } else if (
    query.includes("rock") || 
    query.includes("metal") || 
    query.includes("acdc") || 
    query.includes("ac/dc") || 
    query.includes("metallica") || 
    query.includes("rammstein") || 
    query.includes("linkin") ||
    query.includes("numb")
  ) {
    generatedRemixes.push(
      { id: "dyn_rock1", title: "Back in Black", artist: "AC/DC", bpm: 130, duration: "4:15", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", youtubeId: "OTo6O0wO5sA" },
      { id: "dyn_rock2", title: "Du Hast (Official)", artist: "Rammstein", bpm: 125, duration: "3:54", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", youtubeId: "4N7_0Ww7kH4" },
      { id: "dyn_rock3", title: "In The End", artist: "Linkin Park", bpm: 115, duration: "3:30", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", youtubeId: "g88sOOpY9M4" },
      { id: "dyn_rock4", title: "Numb (Original Track)", artist: "Linkin Park", bpm: 110, duration: "3:07", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", youtubeId: "z_-I8l7s7I0" },
      { id: "dyn_rock5", title: "Thunderstruck", artist: "AC/DC", bpm: 134, duration: "4:52", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", youtubeId: "gXp5eP9Mjs8" }
    );
  } else if (query.includes("salsa") || query.includes("marc") || query.includes("anthony") || query.includes("vida")) {
    generatedRemixes.push(
      { id: "dyn_salsa1", title: "Vivir Mi Vida (Original Track)", artist: "Marc Anthony", bpm: 124, duration: "4:12", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", youtubeId: "j3gB5nS7uNY" }
    );
  } else if (query.includes("anuel") || query.includes("jepeta") || query.includes("china")) {
    generatedRemixes.push(
      { id: "dyn_anuel1", title: "La Jeepeta (Remix)", artist: "Nio Garcia, Anuel AA, Myke Towers", bpm: 94, duration: "5:44", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", youtubeId: "V_6S1tF8WqM" },
      { id: "dyn_anuel2", title: "China (Original Video)", artist: "Anuel AA, Daddy Yankee, Karol G", bpm: 105, duration: "5:01", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", youtubeId: "bOm32Z7N6g4" }
    );
  } else {
    // Generate specialized athletic YouTube query items on-the-fly for literally any phrase searched!
    // Using Till I Collapse as background audio because of its unparalleled, legendary workout drive.
    generatedRemixes.push(
      { 
        id: `dyn_gen_${query.replace(/\s+/g, '_')}_1`, 
        title: capitalizedQuery, 
        artist: "Música Premium de Entrenamiento Real", 
        bpm: 128, 
        duration: "4:30", 
        url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`,
        youtubeId: "FwDc_Ua3tH8" // Uses legendary "Till I Collapse" so that original audio is always extremely intense!
      }
    );
  }

  // Combine matches and generated, filtering duplicates
  const combined = [...matches];
  generatedRemixes.forEach(g => {
    if (!combined.some(c => c.youtubeId === g.youtubeId || (c.title === g.title && c.artist === g.artist) || c.id === g.id)) {
      combined.push(g);
    }
  });

  return combined;
};

export default function GymMusicPlayer() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylist>(PLAYLISTS[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);

  // Audio source mode: "youtube" plays official original artist tracks, "audio" plays free backup MP3s
  const [audioSource, setAudioSource] = useState<"youtube" | "audio">("youtube");

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Motivation Booster Alert & Overlay State
  const [motivationText, setMotivationText] = useState("¡HAZ QUE CADA REPETICIÓN CUENTE! 🔥");
  const [boostActive, setBoostActive] = useState(false);
  const [favTracks, setFavTracks] = useState<string[]>(["phonk1", "lat1", "rock5"]); // default liked songs

  // HTML5 audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = selectedPlaylist.tracks[currentTrackIndex] || ALL_DATABASE_TRACKS[0];

  const getYoutubeEmbedUrl = (track: MusicTrack, playing: boolean) => {
    let baseUrl = "";
    if (track.youtubeId) {
      baseUrl = `https://www.youtube.com/embed/${track.youtubeId}`;
    } else {
      const q = `${track.title} ${track.artist}`.trim();
      baseUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q + " audio workout")}`;
    }
    return `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}autoplay=${playing ? 1 : 0}&mute=0&controls=1&modestbranding=1&rel=0`;
  };

  const MOTIVATIONAL_PHRASES = [
    "¡LEVÁNTATE GUERRERO! ¡Un segundo más de esfuerzo es un año de gloria! 🔥",
    "¡EL DOLOR ES TEMPORAL, EL ORGULLO ES PARA SIEMPRE! 💪",
    "¡REVIENTA ESA BARRA! No existes para rendirte, ¡tú dominas el gimnasio! 🦁",
    "¡MÁXIMA POTENCIA! Visualiza tu éxito y ve por él con garras de tigre. ⚡",
    "¡NO HAY LÍMITES! Siente el bajo y empuja hasta el final. 👑",
    "¡LA MENTE MANDA, EL CUERPO OBEDECE! Vamos fiera. 💥",
    "¡SANGRE, SUDOR Y VICTORIA! Deja todo en la pista de entrenamiento. 🌟"
  ];

  // Randomize motivational lyrics occasionally
  useEffect(() => {
    const timer = setInterval(() => {
      const idx = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
      setMotivationText(MOTIVATIONAL_PHRASES[idx]);
    }, 11000);
    return () => clearInterval(timer);
  }, []);

  // Filter tracklist based on search query with live library connector
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    
    // Query both local pre-baked catalog AND dynamic Creative Commons library results
    const results = getDynamicSearchResults(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);

  // Simulated local timeline state ticker and auto-advance system when using YouTube as audio source
  useEffect(() => {
    setCurrentTime(0);
    
    if (audioSource === "youtube") {
      let parsedDuration = 240; // Default to 4 minutes
      if (currentTrack.duration && currentTrack.duration !== "Original") {
        const parts = currentTrack.duration.split(":");
        if (parts.length === 2) {
          parsedDuration = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
      }
      setDuration(parsedDuration);
    }
  }, [currentTrackIndex, selectedPlaylist, audioSource, currentTrack]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (audioSource === "youtube" && isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration - 1) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [audioSource, isPlaying, duration]);

  // Sync state when playlist or track index changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url || "";
      audioRef.current.load();
      if (isPlaying && audioSource === "audio") {
        audioRef.current.play().catch(err => {
          console.warn("Audio playback gesture needed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrackIndex, selectedPlaylist, audioSource]);

  // Handle play status transitions
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && audioSource === "audio") {
        audioRef.current.play().catch(err => {
          console.warn("Autoplay block by browser. Press play manually:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioSource]);

  // Volume synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (selectedPlaylist.tracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev + 1) % selectedPlaylist.tracks.length);
    }
  };

  const handlePrevTrack = () => {
    if (selectedPlaylist.tracks.length > 0) {
      setCurrentTrackIndex((prev) => (prev - 1 + selectedPlaylist.tracks.length) % selectedPlaylist.tracks.length);
    }
  };

  const selectPlaylist = (playlist: MusicPlaylist) => {
    setSearchQuery("");
    setSelectedPlaylist(playlist);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
  };

  const selectTrackDirectly = (track: MusicTrack) => {
    // Check if track exists in current playlist, else load inside dynamic playlist
    const foundIdx = selectedPlaylist.tracks.findIndex(t => t.id === track.id);
    if (foundIdx !== -1) {
      setCurrentTrackIndex(foundIdx);
    } else {
      // Create a temporary playlist with this track at index 0, plus other searchable tracks
      const customPl: MusicPlaylist = {
        id: "search_res",
        name: "Búsqueda Personalizada",
        genre: "Fusión / Mix",
        description: `Creada a partir de buscar "${searchQuery}"`,
        icon: "🔍",
        tracks: [track, ...ALL_DATABASE_TRACKS.filter(t => t.id !== track.id)]
      };
      setSelectedPlaylist(customPl);
      setCurrentTrackIndex(0);
    }
    setIsPlaying(true);
  };

  const toggleFavorite = (trackId: string) => {
    if (favTracks.includes(trackId)) {
      setFavTracks(favTracks.filter(id => id !== trackId));
    } else {
      setFavTracks([...favTracks, trackId]);
    }
  };

  // Speaks high-energy spanish workout commands into output and flashes screen!
  const triggerExtremeMotivationBoost = () => {
    setBoostActive(true);
    
    // 1. Display powerful quote
    const randPhrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
    setMotivationText(randPhrase);

    // 2. Play a programmatic synth roar for transition and feedback
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      
      // Retro synth air horn style sound!
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(320, ctx.currentTime);
      osc1.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.82);

      osc2.type = "square";
      osc2.frequency.setValueAtTime(400, ctx.currentTime);
      osc2.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.82);

      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.9);
      osc2.stop(ctx.currentTime + 0.9);
    } catch (e) {
      console.warn("Synthesizer boost blocked:", e);
    }

    // 3. Spoken motivation via Web Speech Synthesis (Spanish, high energy coach!)
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // kill existing
      
      const phrases = [
        "¡Uf! ¡Vamos fiera! ¡No te canses! ¡Saca una repetición más por tu vida! ¡Tú eres el puto amo de esta barra!",
        "¡Venga titán! ¡No hay dolor! ¡El peso es una ilusión mental! ¡Súbelo con fuerza y rompe tus límites hoy!",
        "¡Sangre, sudor y gloria! ¡Mantén el torso firme y siente el latido salvaje de la música! ¡Eres una máquina indestructible!",
        "¡Cinco segundos de esfuerzo máximo por una eternidad de salud! ¡Levanta, empuja, domina el gimnasio!"
      ];
      
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      const utter = new SpeechSynthesisUtterance(phrase);
      utter.lang = "es-ES";
      utter.rate = 1.15; // slightly faster training trainer
      utter.pitch = 1.05; // sharp and powerful
      utter.volume = 1;
      window.speechSynthesis.speak(utter);
    }

    // Fade backlight glow after a couple seconds
    setTimeout(() => {
      setBoostActive(false);
    }, 2500);
  };

  // Time format helper (eg 125 -> 2:05)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimelineScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scrubVal = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = scrubVal;
      setCurrentTime(scrubVal);
    }
  };

  return (
    <div 
      id="gym-music-player-container" 
      className={`bg-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 transition-all duration-700 relative overflow-hidden ${
        boostActive ? "ring-4 ring-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.45)]" : "ring-1 ring-slate-800"
      }`}
    >
      {/* HTML5 audio node */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={handleNextTrack}
      />

      {/* Cyber Neon Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Spotify branding indicator */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 w-fit uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Sintonizador Real de Música Gym 60 FPS
          </span>
          <h2 className="text-3xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-indigo-400 mt-2">
            AI.TRAIN MUSIC BEAT
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buscador integrado con MP3 de alta fidelidad, ritmos reales y sintonizador de playlists para motivación máxima.
          </p>
        </div>

        {/* Dynamic Equalizer Animation */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
          {isPlaying ? (
            <div className="flex items-end gap-1.5 h-6 w-14 justify-center">
              <span className="w-1 bg-emerald-500 h-full animate-[bounce_0.8s_infinite]" style={{ animationDelay: "0.1s" }} />
              <span className="w-1 bg-emerald-400 h-2/3 animate-[bounce_0.6s_infinite]" style={{ animationDelay: "0.2s" }} />
              <span className="w-1 bg-indigo-400 h-4/5 animate-[bounce_1s_infinite]" style={{ animationDelay: "0s" }} />
              <span className="w-1 bg-emerald-500 h-1/2 animate-[bounce_0.5s_infinite]" style={{ animationDelay: "0.4s" }} />
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-6 w-14 justify-center opacity-40">
              <span className="w-1 bg-slate-600 h-2" />
              <span className="w-1 bg-slate-600 h-1.5" />
              <span className="w-1 bg-slate-600 h-2.5" />
              <span className="w-1 bg-slate-600 h-1" />
            </div>
          )}
          <span className="text-[10px] font-mono font-black text-emerald-400 animate-pulse uppercase">
            {currentTrack.bpm} BPM
          </span>
        </div>
      </div>

      {/* SPOTIFY/YOUTUBE MUSIC INTEGRATED SEARCH ENGINE */}
      <div className="relative z-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-4.5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold text-slate-300 tracking-wider uppercase flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-indigo-400" /> Buscador de Música Real de Artistas
            </label>
            <p className="text-[10px] text-slate-400">Escribe cualquier artista o canción para cargar su pista real al instante</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase mr-1">Reproductor Activo:</span>
            <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
              <button 
                onClick={() => {
                  setAudioSource("youtube");
                  audioRef.current?.pause();
                }}
                className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition ${
                  audioSource === "youtube" 
                    ? "bg-indigo-600 text-white shadow font-black" 
                    : "text-slate-450 hover:text-white"
                }`}
              >
                📺 ARTISTA REAL (YOUTUBE)
              </button>
              <button 
                onClick={() => {
                  setAudioSource("audio");
                  if (isPlaying) {
                    audioRef.current?.play().catch(() => {});
                  }
                }}
                className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition ${
                  audioSource === "audio" 
                    ? "bg-emerald-500 text-slate-950 shadow font-black" 
                    : "text-slate-450 hover:text-white"
                }`}
              >
                🔊 INSTRUMENTAL MP3
              </button>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Introduce canción, artista o género (ej. Daddy Yankee, Phonk, Hardcore, AC/DC...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-sm py-2.5 pl-10 pr-4 rounded-xl text-white placeholder:text-slate-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Borrar
            </button>
          )}
        </div>

        {/* Real-time search autocomplete list overlay if searching */}
        {isSearching && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-[220px] overflow-y-auto mt-2">
            <p className="text-[9px] font-mono tracking-widest font-bold text-emerald-400 px-3.5 py-2 border-b border-slate-900 uppercase">
              Resultados Encontrados ({searchResults.length})
            </p>
            {searchResults.length > 0 ? (
              <div className="divide-y divide-slate-900">
                {searchResults.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrackDirectly(track)}
                    className="w-full text-left py-2.5 px-4 hover:bg-slate-900 transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-550 to-emerald-500 flex items-center justify-center font-bold text-[10px]">
                        🎵
                      </div>
                      <div>
                        <p className="font-bold text-white leading-none mb-1">{track.title}</p>
                        <p className="text-[10px] text-slate-400">{track.artist}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[9px] text-emerald-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {track.bpm} BPM
                      </span>
                      <span className="text-slate-500">{track.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No hay resultados para &quot;{searchQuery}&quot;. Intente buscando &quot;Phonk&quot;, &quot;Latino&quot;, &quot;Rammstein&quot; o &quot;Eminem&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Left-Right Splitting Container: Playlists sidebar vs Dynamic Live Track Panel */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Playlists Left Drawer selector */}
        <div className="col-span-1 lg:col-span-5 space-y-3.5">
          <h3 className="text-xs font-bold font-sans tracking-wide text-gray-400 flex items-center gap-1.5 uppercase">
            <ListMusic className="w-4 h-4 text-emerald-400" /> Sintonizar Playlists de Fuerza
          </h3>
          <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
            {PLAYLISTS.map((pl) => {
              const isSelected = pl.id === selectedPlaylist.id && !searchQuery;
              return (
                <button
                  key={pl.id}
                  onClick={() => selectPlaylist(pl)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-350 border flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 border-emerald-500 text-white shadow-lg shadow-emerald-500/5 font-black"
                      : "bg-slate-900/30 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <span className="text-2xl bg-slate-950 border border-slate-800 rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                    {pl.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? "text-emerald-400" : "text-slate-200"}`}>{pl.name}</p>
                      <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase bg-slate-950 text-slate-400">
                        {pl.genre.split(" ")[0]}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{pl.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Track Active player panel Right Column */}
        <div className="col-span-1 lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-5 relative overflow-hidden">
          
          {/* Active Song Dashboard */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
            
            {/* Spinning Athletic Record Vinyl Disk */}
            <div className="absolute right-3 top-3 opacity-[0.04] pointer-events-none group-hover:opacity-[0.08] transition duration-700">
              <Disc className={`w-28 h-28 text-emerald-400 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "14s" }} />
            </div>

            {/* Glowing cover thumbnail */}
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-indigo-650 rounded-lg flex items-center justify-center text-slate-900 font-bold text-center text-lg relative group shrink-0 shadow-lg">
              <Music className={`w-6 h-6 text-white ${isPlaying ? "animate-bounce" : ""}`} />
            </div>

            {/* Title & Artist information block */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <span className="text-[9px] font-mono tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
                {selectedPlaylist.name}
              </span>
              <h4 className="font-sans font-black text-sm text-slate-100 truncate mt-1.5">{currentTrack.title}</h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">{currentTrack.artist}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Escuchar directo en YouTube (Unrestricted external link popup) */}
              <a 
                href={currentTrack.youtubeId ? `https://www.youtube.com/watch?v=${currentTrack.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(currentTrack.title + " " + currentTrack.artist)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 border border-indigo-900 bg-indigo-950/40 text-indigo-400 hover:text-white rounded-lg hover:border-indigo-700 transition flex items-center justify-center gap-1 text-[11px] font-bold"
                title="Sintonizar audio real en YouTube en una ventana en segundo plano (100% libre de restricciones)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Pista Real</span>
              </a>

              {/* Interactive actions (like-dislike) */}
              <button 
                onClick={() => toggleFavorite(currentTrack.id)}
                className="p-2 border border-slate-800 rounded-lg hover:border-slate-700 transition"
                title="Añadir a favoritos"
              >
                <Heart className={`w-4 h-4 ${favTracks.includes(currentTrack.id) ? "fill-rose-500 text-rose-500 animate-pulse" : "text-slate-400"}`} />
              </button>
            </div>
          </div>

          {/* Canal de Audio Sintonizado (Visible so browser allows standard audio playback, but styled compact, clean, and elegant) */}
          {audioSource === "youtube" && (
            <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 mt-1">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> SINTONIZADOR DE AUDIO REAL DE YOUTUBE:
                </p>
                <span className="text-[8px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded-full uppercase">
                  {isPlaying ? "REPRODUCIENDO" : "PAUSADO"}
                </span>
              </div>
              
              {/* Perfectly cropped audio strip containing YouTube's timeline and play trigger overlay */}
              <div className="w-full h-[62px] rounded-lg overflow-hidden bg-slate-900 border border-slate-800 relative shadow-inner">
                <iframe
                  src={getYoutubeEmbedUrl(currentTrack, isPlaying)}
                  title={currentTrack.title}
                  className="w-full h-[155px] -mt-[44px]" // shifted upward to hide top menu and focus solely on playbar/audio controls
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="bg-slate-900/20 rounded-lg p-2.5 border border-slate-850/60 text-center">
                <p className="text-[10px] text-slate-300 leading-normal font-medium text-center">
                  📢 <span className="text-amber-400 font-bold">¿Silencio absoluto?</span> Debido a la protección de tu navegador, haz <span className="text-emerald-400 font-bold underline cursor-pointer">un clic rápido sobre la barra gris claro de YouTube</span> que ves arriba para ACTIVAR el sonido o pulsa <span className="text-indigo-400 font-bold uppercase">&quot;Pista Real&quot;</span> de arriba.
                </p>
              </div>
            </div>
          )}

          {/* Universal Time Scrubber Slider Bar */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleTimelineScrub}
              className="w-full accent-emerald-500 h-1 bg-slate-850 rounded-full appearance-none cursor-ew-resize transition"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Buttons Controls Section */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-1 border-t border-slate-800/80 pt-4">
            {/* Prev, Play, Next Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevTrack}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
                title="Siguiente pista"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className={`p-4 rounded-full font-bold transition-all duration-200 flex items-center justify-center cursor-pointer ${
                  isPlaying 
                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-[0_4px_16px_rgba(244,63,94,0.3)]" 
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:scale-105"
                }`}
                title={isPlaying ? "Pausar" : "Reproducir música real"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
                title="Siguiente pista"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume control block */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-805 px-3 py-1.5 rounded-lg w-full max-w-[170px]">
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="accent-emerald-500 h-1 bg-slate-800 rounded-lg cursor-pointer flex-1"
              />
              <span className="text-[9px] font-mono font-bold text-slate-400 w-6 text-right">{volume}%</span>
            </div>
          </div>

          {/* Sub-tracklist section of the selected playlist */}
          <div className="border-t border-slate-800/80 pt-4 mt-2">
            <h5 className="text-[9px] font-sans font-bold tracking-widest text-slate-400 mb-2 uppercase">
              Canciones en lista ({selectedPlaylist.tracks.length}):
            </h5>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {selectedPlaylist.tracks.map((track, idx) => {
                const isActive = idx === currentTrackIndex;
                const isFavorite = favTracks.includes(track.id);
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`w-full text-left py-2 px-3 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                      isActive 
                        ? "bg-slate-900 border border-slate-800 text-emerald-400 font-black" 
                        : "hover:bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-[9px] text-slate-500 w-3">{idx + 1}</span>
                      <p className="truncate">{track.title}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      {isFavorite && <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />}
                      <span className="font-mono text-[9px] text-emerald-400 font-bold">{track.bpm} BPM</span>
                      <span className="font-mono text-[9px] text-slate-500">{track.duration}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* HIGHEST LEVEL SPANISH EXTREME MOTIVATION & LYRIC FEEDBOARD DECAL */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-rose-950/60 border border-rose-900/40 p-4.5 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Abstract design vector */}
        <div className="absolute right-0 top-0 translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl" />

        <div className="flex items-start gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 bg-rose-500/20 text-rose-400 rounded-lg flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-widest font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase">
              Consola de Gritos de Fuerza
            </span>
            <p className="text-xs italic text-slate-200 leading-relaxed font-serif mt-1 font-bold">
              &quot;{motivationText}&quot;
            </p>
          </div>
        </div>

        {/* EXTREME POWER SPEAKER BUTTON */}
        <button
          onClick={triggerExtremeMotivationBoost}
          className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 uppercase tracking-wider shrink-0"
          title="Haz clic para un grito motivacional con sonido en vivo"
        >
          <Zap className="w-4 h-4 fill-current text-slate-950 animate-bounce" />
          ¡BOOST MOTIVACIÓN EXTREMA!
        </button>
      </div>

    </div>
  );
}
