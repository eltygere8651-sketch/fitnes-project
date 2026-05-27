import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Music,
  MessageSquare,
  Layers,
  Play,
  LogOut,
  LogIn,
  Smartphone,
  Share2,
  X,
  BookOpen,
  Download
} from "lucide-react";
import AIPersonalizedRoutine from "./components/AIPersonalizedRoutine";
import AICoachChat from "./components/AICoachChat";
import GymMusicPlayer from "./components/GymMusicPlayer";
import Dashboard from "./components/Dashboard";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { logout } from "./lib/firebase";
import { AuthErrorModal } from "./components/AuthErrorModal";
import { AuthModal } from "./components/AuthModal";

type TabType =
  | "music"
  | "dashboard"
  | "book"
  | "chat";

function AppContent() {
  const { user, loading: authLoading, isOnline, setAuthModalOpen } = useFirebase();
  const [activeTab, setActiveTab] = useState<TabType>("music");
  const [chatPrefilledExercise, setChatPrefilledExercise] = useState<
    string | null
  >(null);

  const handleExerciseCompletedSimulated = (calories: number) => {
    // Silent workout completed telemetry callback
  };

  const handleAskCoachForExerciseName = (exerciseName: string) => {
    setChatPrefilledExercise(exerciseName);
    setActiveTab("chat");
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
      {/* PREMIUM STICKY HEADER & NAVIGATION */}
      <nav id="main-navigation" className="sticky top-0 z-50 bg-[#080809]/95 backdrop-blur-md border-b border-white/5 flex flex-col shrink-0 pt-12 sm:pt-4 pb-1">
        <div className="w-full mb-3 px-6 flex items-center justify-between">
          {/* LEFT: Nativo Optimizado (cleaner, smaller) */}
          <div className="flex-1 flex justify-start">
             {!isStandalone && (
               <button
                  onClick={handleInstallPress}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/5 text-slate-400 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all duration-300 group cursor-pointer"
                  title="Instalar App Móvil"
               >
                  <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] hidden sm:block">
                    Get Native App
                  </span>
               </button>
             )}
          </div>

          {/* CENTER: LOGO BRAND */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div 
              onClick={() => setActiveTab("music")} 
              className="flex items-center gap-2.5 group cursor-pointer select-none"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform duration-300 overflow-hidden relative">
                  {/* High Intensity Energy Layers */}
                  <div className="absolute inset-0 bg-white energy-glow pointer-events-none mix-blend-overlay z-10" />
                  <div className="absolute inset-0 bg-emerald-400 energy-sweep pointer-events-none mix-blend-screen opacity-30 z-20" />
                  
                  {/* Lightning Arcs */}
                  <div className="absolute left-1/4 top-0 bottom-0 lightning-arc energy-glow z-30" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute left-2/4 top-0 bottom-0 lightning-arc energy-glow z-30" style={{ animationDelay: '0.7s' }} />
                  <div className="absolute left-3/4 top-0 bottom-0 lightning-arc energy-glow z-30" style={{ animationDelay: '1.2s' }} />

                  <img src="/icon-512.png" alt="Logo" className="w-full h-full object-cover relative z-0" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 z-40" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-brand font-black tracking-[-0.02em] text-premium-gradient uppercase italic leading-none drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] select-none">
                  BIENVE
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-[1px] w-3 bg-emerald-500/30" />
                  <span className="text-[7.5px] font-black tracking-[0.35em] text-emerald-400 uppercase leading-none opacity-80">
                    MUSIC APP
                  </span>
                  <div className="h-[1px] w-3 bg-emerald-500/30" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Status or Empty Space */}
          <div className="flex-1 flex justify-end">
            <button
              onClick={() => {
                if (user) logout();
                else setAuthModalOpen(true);
              }}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors group cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:text-emerald-400" />
              <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest hidden sm:block">
                {user ? "Cerrar Sesión" : "CONNECT ACCOUNT"}
              </span>
            </button>
          </div>
        </div>

        {/* COMPACT FLOATING NAVIGATION PILL ROW */}
        <div className="pb-4 mt-1 flex justify-center w-full px-4 overflow-hidden">
          <div className="flex bg-[#111]/80 backdrop-blur-md p-1.5 rounded-[22px] items-center gap-1 sm:gap-2 border border-white/5 shadow-2xl shrink-0 max-w-full overflow-x-auto scrollbar-none no-scrollbar">
            {[
              { id: "music", icon: <Play className="w-4 h-4" />, label: "PLAYER" },
              { id: "dashboard", icon: <Layers className="w-4 h-4" />, label: "PANEL" },
              { id: "book", icon: <BookOpen className="w-4 h-4" />, label: "RUTINA" },
              { id: "chat", icon: <MessageSquare className="w-4 h-4" />, label: "COACH" },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`h-11 px-4 sm:px-6 rounded-[18px] transition-all flex items-center gap-3 cursor-pointer relative overflow-hidden group shrink-0 ${
                    isSelected
                      ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-[1.02]"
                      : "text-slate-500 hover:text-white bg-transparent hover:bg-white/5"
                  }`}
                >
                  <div className={`${isSelected ? "scale-110" : "group-hover:scale-110"} transition-transform duration-300`}>
                    {tab.icon}
                  </div>
                  <span className={`text-[10px] font-brand font-black uppercase tracking-[0.1em] ${isSelected ? "opacity-100" : "opacity-0 w-0 group-hover:opacity-100 group-hover:w-auto overflow-hidden transition-all duration-300"}`}>
                    {tab.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* MOBILE NAVIGATION BAR (FOR TRUE PREMIUM FEEL ON TOUCH DEVICES) */}
      <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-24px)] max-w-[420px]">
        <div className="bg-[#0c0c0d]/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-1.5 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)] px-2">
           {[
              { id: "music", icon: <Play className="w-4.5 h-4.5" />, label: "PLAYER" },
              { id: "dashboard", icon: <Layers className="w-4.5 h-4.5" />, label: "PANEL" },
              { id: "chat", icon: <MessageSquare className="w-4.5 h-4.5" />, label: "COACH" },
              { id: "book", icon: <BookOpen className="w-4.5 h-4.5" />, label: "RUTINA" },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-[22px] transition-all duration-300 relative group flex-1 ${
                    isSelected ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  <div className={`${isSelected ? "scale-110 mb-0.5" : "group-active:scale-95 opacity-60"} transition-all duration-300 relative z-10`}>
                    {tab.icon}
                  </div>
                  <span className={`text-[6.5px] font-black tracking-[0.1em] uppercase transition-all duration-300 relative z-10 ${isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 h-0 overflow-hidden"}`}>
                    {tab.label}
                  </span>
                  {isSelected && (
                    <motion.div 
                      layoutId="mobileActiveTab"
                      className="absolute inset-x-1 inset-y-1 bg-emerald-500/10 rounded-[18px] z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
        </div>
      </div>

      <main className={`w-full mx-auto ${
        activeTab === "music"
          ? "max-w-7xl px-1 sm:px-4 md:px-6 h-[calc(100vh-170px)] sm:h-[calc(100vh-190px)] lg:h-[720px] min-h-[500px] overflow-hidden"
          : "max-w-4xl px-4 sm:px-6 lg:px-8"
      } py-4 flex-1 flex flex-col gap-6`}>

        <section className="flex flex-col gap-6 flex-1">
          <div
            className={`rounded-[32px] overflow-hidden flex-1 ${activeTab === "music" ? "bg-transparent border-transparent h-full" : "bg-[#111] border border-white/5 p-4 sm:p-6"} flex flex-col`}
          >
            <div className={`flex-1 relative ${activeTab === "music" ? "h-full overflow-hidden" : ""}`}>
              {activeTab === "dashboard" && (
                <Dashboard />
              )}
              {activeTab === "book" && (
                <AIPersonalizedRoutine
                  onAskCoachExercise={handleAskCoachForExerciseName}
                  onWorkoutSuccess={handleExerciseCompletedSimulated}
                />
              )}
              {activeTab === "chat" && (
                <AICoachChat
                  prefilledExercise={chatPrefilledExercise}
                  onClosePrefill={() => setChatPrefilledExercise(null)}
                />
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
            <div className="bg-[#0c0c0d] rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-4 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-shadow">
                    <Music className="w-5 h-5 animate-pulse" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-brand font-black uppercase tracking-[0.1em] text-premium-gradient mb-0.5">
                    BIENVE MUSIC ACTIVE
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
      </main>

      <footer className="py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
          <p>2026 BIENVE MUSIC APP • ALL RIGHTS RESERVED</p>
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
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] overflow-hidden relative group/hero">
                    {/* High Intensity Energy Layers */}
                    <div className="absolute inset-0 bg-white energy-glow pointer-events-none mix-blend-overlay z-10" />
                    <div className="absolute inset-0 bg-emerald-400 energy-sweep pointer-events-none mix-blend-screen opacity-40 z-20" />
                    
                    {/* Lightning Arcs */}
                    <div className="absolute left-1/3 top-0 bottom-0 lightning-arc energy-glow z-20" style={{ animationDelay: '0.1s' }} />
                    <div className="absolute left-2/3 top-0 bottom-0 lightning-arc energy-glow z-20" style={{ animationDelay: '0.5s' }} />

                    <img src="/icon-512.png" alt="App Icon" className="w-full h-full object-cover relative z-0" referrerPolicy="no-referrer" />
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
      <AuthErrorModal />
      <AuthModal />
    </FirebaseProvider>
  );
}
