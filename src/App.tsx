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
  ArrowDown,
  Bell
} from "lucide-react";
import GymMusicPlayer from "./components/GymMusicPlayer";
import { FluxLogo, FluxLogoLarge } from "./components/FluxLogo";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { logout, db } from "./lib/firebase";
import { collection, getDocs, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { AuthErrorModal } from "./components/AuthErrorModal";
import { AuthModal } from "./components/AuthModal";
import { NotificationsModal, COMPILED_UPDATES } from "./components/NotificationsModal";

function AppContent() {
  const { user, loading: authLoading, isOnline, setAuthModalOpen } = useFirebase();
  const isAdmin = user?.email === "eltygere8651@gmail.com";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsNotificationsOpen(true);
    window.addEventListener("open-notifications", handleOpen);
    window.addEventListener("open-changelog", handleOpen);
    return () => {
      window.removeEventListener("open-notifications", handleOpen);
      window.removeEventListener("open-changelog", handleOpen);
    };
  }, []);

  useEffect(() => {
    // Real-time unread check to guarantee 100% instant notification indicator illumination
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(1));
    const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      try {
        const lastViewed = localStorage.getItem("flux_last_viewed_announcement_id");
        let hasUnreadDb = false;

        let newestId = COMPILED_UPDATES.length > 0 ? COMPILED_UPDATES[0].id : null;
        let staticDate = COMPILED_UPDATES.length > 0 ? COMPILED_UPDATES[0].createdAt : new Date(0);

        if (!snapshot.empty) {
          const newestDoc = snapshot.docs[0];
          const createdAt = newestDoc.data().createdAt;
          const dbDate = createdAt ? (typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)) : new Date(0);
          
          if (dbDate > staticDate) {
            newestId = newestDoc.id;
          }
        }

        if (newestId && newestId !== lastViewed) {
          hasUnreadDb = true;
        }

        setHasUnread(hasUnreadDb);
      } catch (err) {
        console.warn("No se pudo revisar anuncios de Firebase en tiempo real:", err);
      }
    }, (error) => {
      console.warn("Error en el snapshot de anuncios:", error);
    });

    const handleRead = () => {
      setHasUnread(false);
    };
    window.addEventListener("notifications-read", handleRead);
    return () => {
      unsubscribeSnapshot();
      window.removeEventListener("notifications-read", handleRead);
    };
  }, []);

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
                className="flex items-center justify-center p-1.5 sm:p-2 pr-3.5 sm:pr-4 rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 active:scale-90 cursor-pointer gap-2 group shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
                title="Menú"
             >
                {user ? (
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid || 'flux')}`} 
                    alt="Perfil" 
                    className="w-5.5 h-5.5 sm:w-6 sm:h-6 rounded-full object-cover border border-[#1ED760]/30 shrink-0 shadow-md" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Menu className="w-4 h-4 group-hover:text-emerald-400 transition-colors shrink-0" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-emerald-300 transition-colors">
                  Menú
                </span>
             </button>
          </div>

          {/* CENTER: LOGO BRAND */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div 
              className="flex items-center gap-2.5 group cursor-default select-none"
            >
              <div className="relative">
                <FluxLogo className="w-9 h-9" />
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
          
          {/* RIGHT: PREMIUM BELL NOTIFICATIONS */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative flex items-center justify-center p-2 rounded-full border border-white/10 text-white bg-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 active:scale-95 cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.4)] group"
              title="Avisos e importantes"
            >
              <Bell className="w-4 h-4 group-hover:text-amber-400 transition-colors shrink-0" />
              {hasUnread && (
                <>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full animate-ping opacity-75" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 border border-[#080809] rounded-full shadow-[0_0_8px_rgba(244,63,94,1)] animate-pulse" />
                </>
              )}
            </button>
          </div>
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
              <div className="px-3.5 py-2.5 flex flex-wrap items-center justify-center gap-2 bg-[#090b0a]">
                {canShowInstallHelper && (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); handleInstallPress(); }}
                    className="flex-1 min-w-[90px] h-8 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shadow-[0_2px_8px_rgba(30,215,96,0.15)] active:scale-[0.98]"
                  >
                    <Download className="w-3 h-3 stroke-[2.5px]" />
                    <span>Instalar App</span>
                  </button>
                )}
                {user && (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event('open-profile-modal')); }}
                    className="flex-1 min-w-[90px] h-8 bg-[#121212] border border-emerald-500/20 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  >
                    <img 
                      src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid || 'flux')}`} 
                      alt="Perfil" 
                      className="w-4 h-4 rounded-full object-cover border border-[#1ED760]/30" 
                      referrerPolicy="no-referrer"
                    />
                    <span>Perfil</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event('open-support')); }}
                  className="flex-1 min-w-[90px] h-8 bg-[#121212] border border-[#1ED760]/15 hover:border-[#1ED760]/30 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                >
                  <Headphones className="w-3 h-3 stroke-[2.5px]" />
                  <span>Soporte</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); window.dispatchEvent(new Event('open-admin-panel')); }}
                    className="flex-1 min-w-[90px] h-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <Shield className="w-3 h-3 stroke-[2.5px]" />
                    <span>Admin</span>
                  </button>
                )}
                {user ? (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                    className="flex-1 min-w-[90px] h-8 bg-emerald-950/25 border border-[#1ED760]/20 hover:border-[#1ED760]/30 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <LogOut className="w-3 h-3 stroke-[2.5px]" />
                    <span>Salir</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true); }}
                    className="flex-1 min-w-[90px] h-8 bg-[#121212] border border-[#1ED760]/20 hover:border-[#1ED760]/30 text-[#1ED760] font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
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
              {user && (
                <button
                  type="button"
                  onClick={() => { setIsDesktopMenuOpen(false); window.dispatchEvent(new Event('open-profile-modal')); }}
                  className="h-8 bg-[#121212] border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 font-extrabold uppercase text-[9px] tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.uid || 'flux')}`} 
                    alt="Perfil" 
                    className="w-4.5 h-4.5 rounded-full object-cover border border-[#1ED760]/30 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <span>Mi Perfil</span>
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
                <div className="mb-8 shrink-0">
                  <FluxLogoLarge className="w-20 h-20" />
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

      {/* PREMIUM COMPACT NOTIFICATIONS DIALOG */}
      <NotificationsModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        isAdmin={isAdmin}
      />
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
