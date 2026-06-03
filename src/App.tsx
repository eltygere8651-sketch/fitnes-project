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
  Download
} from "lucide-react";
import GymMusicPlayer from "./components/GymMusicPlayer";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { logout } from "./lib/firebase";
import { AuthErrorModal } from "./components/AuthErrorModal";
import { AuthModal } from "./components/AuthModal";

function AppContent() {
  const { user, loading: authLoading, isOnline, setAuthModalOpen } = useFirebase();

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

  return (
    <div
      id="premium-music-app"
      className="h-[100dvh] overflow-hidden bg-[#080809] text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col justify-between"
    >
      {/* PREMIUM STICKY HEADER & LOGO BRAND */}
      <nav id="main-navigation" className="sticky top-0 z-50 bg-[#080809]/95 backdrop-blur-md border-b border-white/5 flex flex-col shrink-0 pt-4 pb-2 sm:pb-4" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="w-full mb-1 sm:mb-3 px-3 sm:px-6 flex items-center justify-between">
          {/* LEFT: Nativo Optimizado (cleaner, smaller) */}
          <div className="flex-1 flex justify-start items-center gap-2">
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
              className="flex items-center gap-2.5 group cursor-default select-none"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)] group-hover:scale-105 transition-transform duration-300 overflow-hidden relative">
                  {isPageVisible && !isEcoMode && (
                    <>
                      {/* High Intensity Energy Layers */}
                      <div className="absolute inset-0 bg-white energy-glow pointer-events-none mix-blend-overlay z-10" />
                      <div className="absolute inset-0 bg-emerald-400 energy-sweep pointer-events-none mix-blend-screen opacity-30 z-20" />
                      
                      {/* Lightning Arcs */}
                      <div className="absolute left-1/4 top-0 bottom-0 lightning-arc energy-glow z-30" style={{ animationDelay: '0.2s' }} />
                      <div className="absolute left-2/4 top-0 bottom-0 lightning-arc energy-glow z-30" style={{ animationDelay: '0.7s' }} />
                      <div className="absolute left-3/4 top-0 bottom-0 lightning-arc energy-glow z-30" style={{ animationDelay: '1.2s' }} />
                    </>
                  )}

                  <img src="/icon-512.png" alt="Logo" className="w-full h-full object-cover relative z-0" referrerPolicy="no-referrer" />
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20 z-40" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className={`text-2xl font-brand font-black tracking-[-0.02em] uppercase italic leading-none select-none ${isEcoMode ? "text-emerald-400" : "text-premium-gradient drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"}`}>
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
                  {user ? "Cerrar Sesión" : "ENTRAR AL PANEL"}
                </span>
            </button>
          </div>
        </div>
      </nav>

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
                    {isPageVisible && (
                      <>
                        {/* High Intensity Energy Layers */}
                        <div className="absolute inset-0 bg-white energy-glow pointer-events-none mix-blend-overlay z-10" />
                        <div className="absolute inset-0 bg-emerald-400 energy-sweep pointer-events-none mix-blend-screen opacity-40 z-20" />
                        
                        {/* Lightning Arcs */}
                        <div className="absolute left-1/3 top-0 bottom-0 lightning-arc energy-glow z-20" style={{ animationDelay: '0.1s' }} />
                        <div className="absolute left-2/3 top-0 bottom-0 lightning-arc energy-glow z-20" style={{ animationDelay: '0.5s' }} />
                      </>
                    )}

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
                    Flux Player
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
