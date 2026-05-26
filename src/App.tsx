import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dumbbell,
  Flame,
  Award,
  CheckCircle,
  Music,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Layers,
  Play,
  TrendingUp,
  CheckCircle2,
  Activity,
  Bell,
  BookOpen,
  LogOut,
  User as UserIcon,
  LogIn,
  Smartphone,
  Download,
  Share2,
  X,
} from "lucide-react";
import AIPersonalizedRoutine from "./components/AIPersonalizedRoutine";
import TechGuide from "./components/TechGuide";
import AICoachChat from "./components/AICoachChat";
import ProgressTracker from "./components/ProgressTracker";
import GymMusicPlayer from "./components/GymMusicPlayer";
import MotivationalNotifications from "./components/MotivationalNotifications";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { loginWithGoogle, logout } from "./lib/firebase";

type TabType =
  | "routine"
  | "guide"
  | "chat"
  | "progress"
  | "notifications"
  | "music";

function AppContent() {
  const { user, loading: authLoading, isOnline } = useFirebase();
  const [activeTab, setActiveTab] = useState<TabType>("routine");
  const [activeStreak, setActiveStreak] = useState(4);
  const [caloriesBurned, setCaloriesBurned] = useState(300);
  const [exercisesCount, setExercisesCount] = useState(8);
  const [chatPrefilledExercise, setChatPrefilledExercise] = useState<
    string | null
  >(null);
  const [todayCompleted, setTodayCompleted] = useState<string[]>([]);

  useEffect(() => {
    const savedStreak = localStorage.getItem("gym_streak_count");
    if (savedStreak) setActiveStreak(parseInt(savedStreak));
    const savedCal = localStorage.getItem("gym_calories_burned");
    if (savedCal) setCaloriesBurned(parseInt(savedCal));
    const savedExCount = localStorage.getItem("gym_exercises_count");
    if (savedExCount) setExercisesCount(parseInt(savedExCount));
    const savedTodayComp = localStorage.getItem("gym_today_completed");
    if (savedTodayComp) {
      try {
        setTodayCompleted(JSON.parse(savedTodayComp));
      } catch (e) {}
    }
  }, []);

  const handleStreakUpdate = (count: number) => {
    setActiveStreak(count);
    localStorage.setItem("gym_streak_count", count.toString());
  };

  const handleExerciseCompletedSimulated = (calories: number) => {
    const nextCal = caloriesBurned + calories;
    const nextCount = exercisesCount + 1;
    setCaloriesBurned(nextCal);
    setExercisesCount(nextCount);
    localStorage.setItem("gym_calories_burned", nextCal.toString());
    localStorage.setItem("gym_exercises_count", nextCount.toString());
  };

  const handleAskCoachForExerciseName = (exerciseName: string) => {
    setChatPrefilledExercise(exerciseName);
    setActiveTab("chat");
  };

  const toggleTodayExercise = (exId: string) => {
    let next: string[];
    if (todayCompleted.includes(exId)) {
      next = todayCompleted.filter((e) => e !== exId);
    } else {
      next = [...todayCompleted, exId];
      handleExerciseCompletedSimulated(75);
    }
    setTodayCompleted(next);
    localStorage.setItem("gym_today_completed", JSON.stringify(next));
  };

  // --- Progressive Web App (PWA) Install Logic ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installTab, setInstallTab] = useState<"ios" | "android">("ios");

  useEffect(() => {
    // Check if running in mobile stand-alone app mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for the Chrome/Android beforeinstallprompt event
    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforePrompt);

    // Detect general device to set default help instructions tab
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (!isIOSDevice) {
      setInstallTab("android");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
    };
  }, []);

  const handleInstallPress = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("PWA Installation accepted by the user");
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <div
      id="premium-music-app"
      className="min-h-screen bg-[#080809] text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col justify-between"
    >
      {/* 0. UTILITY TOP BAR */}
      <div className="bg-black/40 border-b border-white/5 py-1.5 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          {/* PWA Badge Left Side */}
          <div className="flex items-center gap-2">
            {isStandalone ? (
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-black tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Nativo Optimizado</span>
              </div>
            ) : (
              <button
                onClick={handleInstallPress}
                className="flex items-center gap-1.5 text-[9px] text-slate-300 hover:text-white font-black tracking-widest bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/35 px-3 py-1 rounded-full uppercase cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-100 hover:scale-[1.03] active:scale-95"
              >
                <Download className="w-3 h-3 text-emerald-400 animate-bounce" />
                <span>Instalar App Móvil</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 group">
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase text-emerald-500 tracking-[0.2em] leading-none mb-0.5">
                    SYNC ACTIVE
                  </p>
                  <p className="text-[10px] font-bold text-slate-400">
                    {user.displayName || user.email?.split("@")[0]}
                  </p>
                </div>
                <div className="relative">
                  <img
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`
                    }
                    className="w-6 h-6 rounded-full ring-1 ring-white/10 object-cover"
                    alt="avatar"
                  />
                  <button
                    onClick={logout}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full text-white"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                disabled={authLoading}
                className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors py-0.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Connect Account
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-3 bg-black/20 backdrop-blur-3xl border-b border-white/5 sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              <Music className="w-6 h-6 text-black" />
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-20" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-[0.2em] text-white uppercase italic leading-none">
              BIENVE
            </span>
            <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase leading-none mt-1 opacity-80">
              MUSIC APP
            </span>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl items-center gap-1 border border-white/10 shadow-inner">
          {[
            {
              id: "music",
              label: "MUSIC APP",
              icon: <Play className="w-3.5 h-3.5" />,
              special: true,
            },
            {
              id: "routine",
              label: "IA Rutinas",
              icon: <Layers className="w-3.5 h-3.5" />,
            },
            {
              id: "guide",
              label: "Guías",
              icon: <BookOpen className="w-3.5 h-3.5" />,
            },
            {
              id: "chat",
              label: "Coach",
              icon: <MessageSquare className="w-3.5 h-3.5" />,
            },
            {
              id: "progress",
              label: "Log",
              icon: <TrendingUp className="w-3.5 h-3.5" />,
            },
            {
              id: "notifications",
              label: "Alertas",
              icon: <Bell className="w-3.5 h-3.5" />,
            },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-3 sm:px-4 rounded-xl text-[10px] font-black tracking-widest whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? tab.special
                      ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105"
                      : "bg-white/10 text-white border border-white/10"
                    : "text-slate-500 hover:text-white bg-transparent"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline uppercase">{tab.label}</span>
                {tab.special && !isSelected && (
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-white/5">
          <div className="flex items-center gap-1.5 opacity-60">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
              Engine Optimized
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {activeTab !== "music" && (
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-[#111] p-5 rounded-[24px] border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 flex items-center justify-between">
                <span>Constancia Semanal</span>
                <span className="text-xs text-emerald-500 font-mono font-bold">
                  4 / 7 Días
                </span>
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end bg-black/40 p-3 rounded-[16px] border border-white/5">
                  {[
                    { tag: "L", h: "h-12" },
                    { tag: "M", h: "h-16" },
                    { tag: "M", h: "h-10" },
                    { tag: "J", h: "h-20", active: true },
                    { tag: "V", h: "h-3" },
                    { tag: "S", h: "h-3" },
                    { tag: "D", h: "h-3" },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="h-20 w-3.5 bg-black/60 rounded-full overflow-hidden flex flex-col justify-end border border-white/5 shadow-inner">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: bar.active ? "80%" : bar.h }}
                          className={`w-full ${bar.active ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] relative" : "bg-emerald-500/10"}`}
                        >
                          {bar.active && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 blur-[2px]" />
                          )}
                        </motion.div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-500">
                        {bar.tag}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bold uppercase">
                    Racha:
                  </span>
                  <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ⚡ {activeStreak} Días
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#111] p-4.5 rounded-[20px] border border-white/5 text-center flex flex-col justify-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                  Calorías Totales
                </span>
                <span className="text-lg font-mono font-black text-white mt-1">
                  {caloriesBurned} Kcal
                </span>
              </div>
              <div className="bg-[#111] p-4.5 rounded-[20px] border border-white/5 text-center flex flex-col justify-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                  Ejercicios Hechos
                </span>
                <span className="text-lg font-mono font-black text-white mt-1">
                  {exercisesCount} Ejs
                </span>
              </div>
            </div>
          </aside>
        )}

        <section
          className={`${activeTab === "music" ? "lg:col-span-12" : "lg:col-span-6"} flex flex-col gap-6 min-h-[500px]`}
        >
          <div
            className={`rounded-[32px] overflow-hidden flex-1 ${activeTab === "music" ? "bg-transparent border-transparent" : "bg-[#111] border border-white/5 p-4 sm:p-6"} flex flex-col`}
          >
            <div className="flex-1 relative">
              {activeTab === "routine" && (
                <AIPersonalizedRoutine
                  onAskCoachExercise={handleAskCoachForExerciseName}
                  onWorkoutSuccess={handleExerciseCompletedSimulated}
                />
              )}
              {activeTab === "guide" && (
                <TechGuide onAskCoach={handleAskCoachForExerciseName} />
              )}
              {activeTab === "chat" && (
                <AICoachChat
                  prefilledExercise={chatPrefilledExercise}
                  onClosePrefill={() => setChatPrefilledExercise(null)}
                />
              )}
              {activeTab === "progress" && (
                <ProgressTracker
                  onStreakUpdate={handleStreakUpdate}
                  onWorkoutLogged={() => handleExerciseCompletedSimulated(75)}
                />
              )}
              {activeTab === "notifications" && (
                <MotivationalNotifications activeStreak={activeStreak} />
              )}

              <div
                className={
                  activeTab === "music"
                    ? "h-full"
                    : "pointer-events-none absolute inset-0 opacity-0 -z-10"
                }
              >
                <GymMusicPlayer />
              </div>
            </div>
          </div>

          {activeTab !== "music" && (
            <div className="bg-[#0c0c0d] rounded-3xl p-3.5 border border-white/5 flex items-center justify-between gap-4 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-shadow">
                    <Music className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c0c0d]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-0.5">
                    BIENVE MUSIC APP ACTIVE
                  </span>
                  <p className="text-[11px] text-white font-bold truncate max-w-[200px]">
                    Optimized Training Flow
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("music")}
                className="text-[10px] font-black bg-emerald-500 text-black px-5 py-2.5 rounded-xl hover:bg-white transition-colors shadow-lg shadow-emerald-500/10 active:scale-95"
              >
                OPEN PLAYER
              </button>
            </div>
          )}
        </section>

        {activeTab !== "music" && (
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-[#111] rounded-[24px] p-6 border border-white/5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Hoy Entrenas:
                  </h3>
                  <span className="text-[10px] font-mono leading-none py-1 px-2 rounded-full bg-white/5 text-slate-400 font-semibold border border-white/10 text-center">
                    Fullbody
                  </span>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      id: "ex1",
                      name: "Calentamiento Pro",
                      desc: "Movilidad articular",
                    },
                    {
                      id: "ex2",
                      name: "Sentadilla Copa",
                      desc: "Forma vertical",
                    },
                    {
                      id: "ex3",
                      name: "Flexiones Soporte",
                      desc: "Codos adentro",
                    },
                    {
                      id: "ex4",
                      name: "Bicho Muerto Core",
                      desc: "Ombligo adentro",
                    },
                    {
                      id: "ex5",
                      name: "Plancha Apoyos",
                      desc: "Espalda paralela",
                    },
                  ].map((item) => {
                    const isChecked = todayCompleted.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`relative pl-8 border-l-2 transition-all ${isChecked ? "border-emerald-500 opacity-60" : "border-white/10"}`}
                      >
                        <button
                          onClick={() => toggleTodayExercise(item.id)}
                          className={`absolute -left-[9px] top-0 w-4.5 h-4.5 rounded-full ring-4 ring-[#111] transition flex items-center justify-center ${isChecked ? "bg-emerald-500 text-black" : "bg-white/10 text-transparent"}`}
                        >
                          <span className="text-[8px] font-bold">✓</span>
                        </button>
                        <div
                          className="cursor-pointer select-none"
                          onClick={() => toggleTodayExercise(item.id)}
                        >
                          <p
                            className={`text-[10px] font-black tracking-tight ${isChecked ? "text-emerald-500" : "text-slate-500"}`}
                          >
                            {isChecked ? "COMPLETADO" : "PENDIENTE"}
                          </p>
                          <p className="text-xs font-black text-white mt-0.5">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 leading-none">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      <footer className="py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
          <p>© 2026 BIENVE MUSIC APP • OPTIMIZED FLOW</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500"}`}
              />
              <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-500">
              {user ? user.email : "GUEST MODE"}
            </span>
          </div>
        </div>
      </footer>

      {/* --- PWA INSTALLATION MODAL --- */}
      <AnimatePresence>
        {showInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#0c0c0d] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] relative"
            >
              {/* Decorative line */}
              <div className="h-1 bg-gradient-to-r from-[#10b981]/20 via-[#10b981] to-[#10b981]/20" />

              {/* Header */}
              <div className="p-6 pb-4 flex justify-between items-start border-b border-white/5 bg-[#0e0e10]/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <Smartphone className="w-5.5 h-5.5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white">
                      Instalar App Nativa
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Optimizado para iOS y Android
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                <p className="text-xs text-slate-300 leading-relaxed text-center">
                  Instala{" "}
                  <strong className="text-emerald-500 font-bold">
                    Bienve Music App
                  </strong>{" "}
                  directamente en tu pantalla de inicio móvil. Disfruta de un
                  acceso rápido, persistente, rendimiento optimizado y
                  experiencia fluida a pantalla completa sin los límites del
                  navegador.
                </p>

                {/* Tabs selection */}
                <div className="grid grid-cols-2 p-1 bg-black/40 border border-white/5 rounded-2xl">
                  <button
                    onClick={() => setInstallTab("ios")}
                    className={`py-2 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                      installTab === "ios"
                        ? "bg-emerald-500 text-black shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Apple iOS
                  </button>
                  <button
                    onClick={() => setInstallTab("android")}
                    className={`py-2 px-4 rounded-xl text-xs font-black tracking-widest uppercase transition-all duration-150 cursor-pointer ${
                      installTab === "android"
                        ? "bg-emerald-500 text-black shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Android / Chrome
                  </button>
                </div>

                {/* Tab content */}
                <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-5 space-y-4">
                  {installTab === "ios" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                          Safari
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Pasos para iPhone & iPad
                        </span>
                      </div>
                      <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside pl-1 leading-relaxed">
                        <li>
                          Abre el navegador{" "}
                          <strong className="text-white">Safari</strong> para
                          entrar a la aplicación.
                        </li>
                        <li className="flex items-start gap-2 list-none">
                          <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                            1
                          </span>
                          <span>
                            Pulsa el botón de{" "}
                            <strong className="text-white">Compartir</strong> (
                            <Share2 className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />{" "}
                            cuadro con flecha hacia arriba) en la barra de
                            navegación inferior de Safari.
                          </span>
                        </li>
                        <li className="flex items-start gap-2 list-none">
                          <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            Busca e ingresa la opción{" "}
                            <strong className="text-white">
                              "Añadir a la pantalla de inicio"
                            </strong>
                            .
                          </span>
                        </li>
                        <li className="flex items-start gap-2 list-none">
                          <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                            3
                          </span>
                          <span>
                            Confirma pulsando{" "}
                            <strong className="text-emerald-500 font-bold">
                              Añadir
                            </strong>{" "}
                            en la esquina superior derecha.
                          </span>
                        </li>
                      </ol>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase">
                          Chrome
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Pasos para la instalación
                        </span>
                      </div>
                      <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside pl-1 leading-relaxed">
                        <li>
                          Usa el navegador{" "}
                          <strong className="text-white">Google Chrome</strong>{" "}
                          para acceder de manera óptima.
                        </li>
                        <li className="flex items-start gap-2 list-none">
                          <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                            1
                          </span>
                          <span>
                            Haz clic en el botón de{" "}
                            <strong className="text-white">tres puntos</strong>{" "}
                            verticales (esquina superior derecha de Chrome).
                          </span>
                        </li>
                        <li className="flex items-start gap-2 list-none">
                          <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            Selecciona la opción{" "}
                            <strong className="text-white">
                              "Instalar aplicación"
                            </strong>{" "}
                            o "Añadir a pantalla de inicio".
                          </span>
                        </li>
                        <li className="flex items-start gap-2 list-none">
                          <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                            3
                          </span>
                          <span>
                            Confirma pulsando{" "}
                            <strong className="text-emerald-500 font-bold">
                              Instalar
                            </strong>{" "}
                            y ¡listo! Disfruta del icono de la app nativa en tu
                            teléfono.
                          </span>
                        </li>
                      </ol>
                    </div>
                  )}
                </div>

                {/* Core values bullet points */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[14px] text-emerald-400 font-black mb-1">
                      9mb
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                      Carga Ultra Ligera
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[14px] text-emerald-400 font-black mb-1">
                      100%
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                      Sin Anuncios
                    </p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <p className="text-[14px] text-emerald-400 font-black mb-1">
                      ⚡
                    </p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                      Inicio Al Instante
                    </p>
                  </div>
                </div>
              </div>

              {/* Install Buttons Footer */}
              <div className="p-5 border-t border-white/5 bg-[#0e0e10]/60 flex justify-end gap-3.5">
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="px-5 py-2.5 bg-white/5 rounded-xl text-xs font-black uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
