import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Music,
  Play,
  LogOut,
  LogIn,
  Smartphone,
  Share2,
  X,
  Download,
  Headphones,
  Menu,
  Shield
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

  useEffect(() => {
    const handleTriggerInstall = () => {
      handleInstallPress();
    };
    window.addEventListener("trigger-install", handleTriggerInstall);
    return () => {
      window.removeEventListener("trigger-install", handleTriggerInstall);
    };
  }, [deferredPrompt]);

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
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all duration-200 active:scale-95 cursor-pointer"
                title="Menú"
             >
                <Menu className="w-3.5 h-3.5" />
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
              <div className="flex flex-col">
                <span className="text-2xl font-brand font-black tracking-[-0.02em] uppercase italic leading-none select-none text-emerald-400">
                  FLUX
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="h-[1px] w-3 bg-emerald-500/30" />
                  <span className="text-[7.5px] font-black tracking-[0.35em] text-emerald-400 uppercase leading-none opacity-80">
                    PLAYER
                  </span>
                  <div className="h-[1px] w-3 bg-emerald-500/30" />
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
                {!isStandalone && (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); handleInstallPress(); }}
                    className="flex-1 h-8 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(30,215,96,0.15)] active:scale-[0.98]"
                  >
                    <Download className="w-3 h-3 stroke-[2.5px]" />
                    <span>Descargar</span>
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
              {!isStandalone && (
                <button
                  type="button"
                  onClick={() => { setIsDesktopMenuOpen(false); handleInstallPress(); }}
                  className="h-8 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5px]" />
                  <span>Descargar</span>
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

      <main className="w-full mx-auto max-w-7xl px-1 sm:px-4 md:px-6 flex-1 min-h-0 overflow-hidden py-2 sm:py-4 flex flex-col gap-6">
        <section className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
          <div className="rounded-2xl sm:rounded-[32px] flex-1 bg-transparent border-transparent min-h-0 flex flex-col overflow-hidden">
            <div className="flex-1 w-full min-h-0 relative overflow-hidden">
              <GymMusicPlayer />
            </div>
          </div>
        </section>
      </main>

      {/* --- PWA INSTALLATION MODAL --- */}
      <AnimatePresence>
        {showInstallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg max-h-[90vh] bg-[#0c0c0d] border border-white/10 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] relative flex flex-col"
            >
              <div className="h-1 bg-gradient-to-r from-[#10b981]/20 via-[#10b981] to-[#10b981]/20 shrink-0" />
              <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex justify-between items-start border-b border-white/5 bg-[#0e0e10]/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)] overflow-hidden relative">
                    <img src="/icon-512.png" alt="App Icon" className="w-full h-full object-cover relative z-0" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                      Instalar App Nativa
                    </h3>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Optimizado para iOS y Android
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInstallModal(false)}
                  className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-left min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(16,185,129,0.2)_transparent]">
                <p className="text-xs text-slate-300 leading-relaxed text-center">
                  Instala <strong className="text-emerald-500 font-bold">Flux Player</strong> directamente en tu pantalla de inicio móvil. Disfruta de una experiencia fluida a pantalla completa.
                </p>
              </div>

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
