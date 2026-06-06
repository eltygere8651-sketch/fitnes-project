import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Music,
  Play,
  LogOut,
  LogIn,
  Smartphone,
  Share,
  X,
  Download,
  Headphones,
  Menu,
  Shield,
  ChevronDown,
  PlusSquare,
  ArrowDown
} from "lucide-react";
import GymMusicPlayer from "./components/GymMusicPlayer";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { logout } from "./lib/firebase";
import { AuthErrorModal } from "./components/AuthErrorModal";
import { AuthModal } from "./components/AuthModal";

function AppContent() {
  const { user, loading: authLoading, isOnline, setAuthModalOpen } = useFirebase();
  const isAdmin = user?.email === "eltygere8651@gmail.com";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);

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

  // --- Progressive Web App (PWA) Install Logic ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // Check if running in mobile stand-alone app mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Listen for the Chrome/Android beforeinstallprompt event
    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforePrompt);
    
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setShowIosPrompt(false);
      console.log("PWA was installed");
    };
    
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
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
    } else if (isIOS && !isStandalone) {
      setShowIosPrompt(true);
    }
  };

  useEffect(() => {
    const handleTriggerInstall = () => {
      handleInstallPress();
    };
    window.addEventListener("trigger-install", handleTriggerInstall);
    return () => {
      window.removeEventListener("trigger-install", handleTriggerInstall);
    };
  }, [deferredPrompt, isIOS, isStandalone]);

  const canShowInstallHelper = (deferredPrompt || isIOS) && !isStandalone;

  return (
    <div
      id="premium-music-app"
      className="h-[100dvh] overflow-hidden bg-[#080809] text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col justify-between"
    >
      {/* PREMIUM STICKY HEADER & LOGO BRAND */}
      <nav id="main-navigation" className="sticky top-0 z-50 bg-[#080809]/95 backdrop-blur-md border-b border-white/5 flex flex-col shrink-0 pt-4 pb-2 sm:pb-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="w-full mb-1 sm:mb-3 px-3 sm:px-6 flex items-center justify-between">
          
          {/* LEFT: Menu Toggle */}
          <div className="flex items-center gap-2">
             <button
                type="button"
                onClick={() => {
                  if (window.innerWidth < 640) setIsMobileMenuOpen(!isMobileMenuOpen);
                  else setIsDesktopMenuOpen(!isDesktopMenuOpen);
                }}
                className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-auto sm:px-3 rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all duration-300 active:scale-90 cursor-pointer gap-2 group"
                title="Menú"
             >
                <Menu className="w-4 h-4 group-hover:text-emerald-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden sm:inline-block">Menú</span>
             </button>
          </div>

          {/* CENTER: LOGO BRAND */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div 
              className="flex items-center gap-2.5 group cursor-default select-none"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-transform duration-300 overflow-hidden relative">
                  <img src="/icon-512.png" alt="Logo" className="w-full h-full object-cover relative z-0" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 z-40" />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-brand font-black tracking-[-0.05em] uppercase leading-none select-none text-white transition-all duration-700 group-hover:tracking-[0.05em]">
                  FLUX
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 opacity-90">
                  <div className="h-[1px] w-3 bg-emerald-500/40" />
                  <span className="text-[7px] font-bold tracking-[0.3em] text-emerald-400 uppercase leading-none">
                    MUSIC
                  </span>
                  <div className="h-[1px] w-3 bg-emerald-500/40" />
                </div>
              </div>
            </div>
          </div>
          <div className="w-8 shrink-0" /> {/* Spacer for symmetry */}
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="sm:hidden overflow-hidden w-full border-t border-white/5 bg-[#090b0a]"
            >
              <div className="px-3.5 py-2.5 flex items-center justify-center gap-2 bg-[#090b0a]">
                {canShowInstallHelper && (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); handleInstallPress(); }}
                    className="flex-1 h-8 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(30,215,96,0.15)] active:scale-[0.98]"
                  >
                    <Download className="w-3 h-3 stroke-[2.5px]" />
                    <span>Instalar App</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event('open-support')); }}
                  className="flex-1 h-8 bg-[#121212] border border-[#1ED760]/15 hover:border-[#1ED760]/30 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                >
                  <Headphones className="w-3 h-3 stroke-[2.5px]" />
                  <span>Soporte</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event('open-admin-panel')); }}
                    className="flex-1 h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <Shield className="w-3 h-3 stroke-[2.5px]" />
                    <span>Admin</span>
                  </button>
                )}
                {user ? (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className="flex-1 h-8 bg-emerald-950/25 border border-[#1ED760]/20 hover:border-[#1ED760]/30 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <LogOut className="w-3 h-3 stroke-[2.5px]" />
                    <span>Salir</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true); }}
                    className="flex-1 h-8 bg-[#121212] border border-[#1ED760]/20 hover:border-[#1ED760]/30 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <LogIn className="w-3 h-3 stroke-[2.5px]" />
                    <span>Entrar</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Desktop Menu Dropdown */}
      <AnimatePresence>
        {isDesktopMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden sm:block absolute top-16 left-4 bg-[#090b0a] border border-white/10 rounded-xl p-2 w-48 z-[100] shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {canShowInstallHelper && (
                <button
                  type="button"
                  onClick={() => { setIsDesktopMenuOpen(false); handleInstallPress(); }}
                  className="h-8 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Instalar App</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => { setIsDesktopMenuOpen(false); window.dispatchEvent(new Event('open-support')); }}
                className="h-8 bg-[#121212] border border-[#1ED760]/15 hover:border-[#1ED760]/30 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Headphones className="w-3.5 h-3.5 stroke-[2.5px]" />
                <span>Soporte</span>
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => { setIsDesktopMenuOpen(false); window.dispatchEvent(new Event('open-admin-panel')); }}
                  className="h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Shield className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Admin</span>
                </button>
              )}
              {user ? (
                <button
                  type="button"
                  onClick={() => { setIsDesktopMenuOpen(false); logout(); }}
                  className="h-8 bg-emerald-950/25 border border-[#1ED760]/20 hover:border-[#1ED760]/30 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Salir</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setIsDesktopMenuOpen(false); setAuthModalOpen(true); }}
                  className="h-8 bg-[#121212] border border-[#1ED760]/20 hover:border-[#1ED760]/30 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Entrar</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full mx-auto px-0 sm:px-2 md:px-4 flex-1 min-h-0 overflow-hidden py-2 sm:py-2 flex flex-col gap-6">
        <section className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
          <div className="rounded-2xl sm:rounded-[32px] flex-1 bg-transparent border-transparent min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 w-full min-h-0 relative overflow-hidden">
              <GymMusicPlayer />
            </div>
          </div>
        </section>
      </main>

      {/* --- PWA ONE-CLICK INSTALL FLOAT --- */}
      <AnimatePresence>
        {canShowInstallHelper && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-[90] px-4 sm:px-0 w-full sm:w-auto flex justify-center"
          >
            <button
              onClick={handleInstallPress}
              className="w-full sm:w-auto bg-[#1ED760] hover:bg-emerald-400 text-black px-6 sm:px-10 py-3 sm:py-4 rounded-full font-black uppercase text-[11px] sm:text-[13px] tracking-widest shadow-[0_15px_40px_rgba(30,215,96,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3 animate-bounce shadow-xl"
            >
              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Instalar App 1-Click</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- IOS INSTALL INSTRUCTION (FOOLPROOF) --- */}
      <AnimatePresence>
        {showIosPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/90 backdrop-blur-xl"
            onClick={() => setShowIosPrompt(false)}
          >
             <div className="flex-1 flex flex-col items-center justify-center px-6">
                <button 
                  onClick={() => setShowIosPrompt(false)}
                  className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="w-20 h-20 bg-emerald-500 rounded-[20px] sm:rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-8 shrink-0 overflow-hidden">
                  <img src="/icon-512.png" alt="Flux Music" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4 text-center">Instalar en iOS</h2>
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center gap-6 shadow-2xl">
                   <div className="flex items-center gap-4 text-left w-full">
                     <div className="w-10 h-10 bg-[#1e1e1e] rounded-xl flex items-center justify-center shrink-0">
                       <Share className="w-5 h-5 text-[#3b82f6]" />
                     </div>
                     <p className="text-sm font-bold text-white leading-snug">
                       <span className="text-emerald-400">Paso 1:</span> Toca el ícono de <br/><strong>Compartir</strong> en la barra inferior.
                     </p>
                   </div>
                   <div className="h-px w-full bg-white/5" />
                   <div className="flex items-center gap-4 text-left w-full">
                     <div className="w-10 h-10 bg-[#1e1e1e] rounded-xl flex items-center justify-center shrink-0">
                       <PlusSquare className="w-5 h-5 text-white" />
                     </div>
                     <p className="text-sm font-bold text-white leading-snug">
                       <span className="text-emerald-400">Paso 2:</span> Selecciona <br/><strong>"Añadir a inicio"</strong>
                     </p>
                   </div>
                </div>
             </div>
             
             <motion.div 
                initial={{ y: -10 }}
                animate={{ y: 10 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                className="w-full h-32 flex flex-col items-center justify-end pb-8 gap-2 pointer-events-none"
             >
                <span className="text-xs font-black uppercase text-emerald-400 tracking-widest">Toca aquí abajo</span>
                <ArrowDown className="w-10 h-10 text-emerald-400" />
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
