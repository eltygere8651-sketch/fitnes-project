import React, { useState, useEffect } from "react";
import { X, Sparkles, Trophy, Music, UserCheck, Flame, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Current app update version
const CURRENT_APP_VERSION = "1.3.0";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isManual?: boolean;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose, isManual = false }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldShow(true);
      return;
    }

    if (!isManual) {
      const lastSeenVersion = localStorage.getItem("flux_last_viewed_version");
      if (lastSeenVersion !== CURRENT_APP_VERSION) {
        setShouldShow(true);
      }
    }
  }, [isOpen, isManual]);

  const handleDismiss = () => {
    localStorage.setItem("flux_last_viewed_version", CURRENT_APP_VERSION);
    setShouldShow(false);
    onClose();
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="changelog-custom-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
      >
        {/* Background Click dismiss */}
        <div className="absolute inset-0 z-0" onClick={handleDismiss} />

        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(30,215,96,0.15)] flex flex-col z-10 max-h-[90vh]"
        >
          {/* Decorative neon top ribbon */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#1ED760] to-cyan-500" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal header */}
          <div className="p-6 pb-4 border-b border-white/5 bg-gradient-to-b from-[#1ED760]/5 to-transparent text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#1ED760]/10 text-[#1ED760] text-[10px] font-black px-2.5 py-1 rounded-full border border-[#1ED760]/20 tracking-wider">
                NUEVA ACTUALIZACIÓN V{CURRENT_APP_VERSION}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instalada</span>
              </span>
            </div>
            <h2 className="text-white text-xl sm:text-2xl font-black tracking-tight leading-none">
              ¿Qué hay de nuevo en FLUX Music?
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 font-semibold">
              Echa un vistazo a las últimas mejoras integradas para potenciar tus entrenamientos.
            </p>
          </div>

          {/* Change log notes list */}
          <div className="p-6 overflow-y-auto premium-scrollbar space-y-5 text-left max-h-[50vh]">
            
            {/* Item 1: Avatar system */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-[#1ED760]" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black tracking-tight flex items-center gap-1.5">
                  🎨 Selector de Avatares Caricaturescos
                </h3>
                <p className="text-slate-400 text-[11.5px] leading-relaxed mt-1 font-semibold">
                  ¿No tienes foto en tu cuenta o quieres cambiarla? Ahora puedes seleccionar entre una colección de divertidos personajes caricaturescos de diseño premium para dar personalidad a tu perfil sin ralentizar tu navegación.
                </p>
              </div>
            </div>

            {/* Item 2: Custom upload */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black tracking-tight">
                  📸 Sube tu Propio Avatar o Imagen
                </h3>
                <p className="text-slate-400 text-[11.5px] leading-relaxed mt-1 font-semibold">
                  Ahora puedes subir directamente cualquier foto o imagen desde tu teléfono o computadora. La app integra un compresor inteligente que optimiza y reduce el tamaño de la imagen en segundos, disminuyendo el consumo de batería y datos móviles de forma ecológica.
                </p>
              </div>
            </div>

            {/* Item 3: Bug fix description */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black tracking-tight">
                  ⚡ Rendimiento Optimizado y Corrección de Bucles
                </h3>
                <p className="text-slate-400 text-[11.5px] leading-relaxed mt-1 font-semibold">
                  Corregimos un error donde dar "Me gusta" o actualizar datos del perfil saltaba y reiniciaba la reproducción actual a la primera pista. Tu experiencia musical de fondo para el gimnasio ahora es totalmente continua y fluida de principio a fin.
                </p>
              </div>
            </div>

            {/* Item 4: Changlog panel */}
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white text-sm font-black tracking-tight">
                  📢 Diario Dinámico de Actualizaciones
                </h3>
                <p className="text-slate-400 text-[11.5px] leading-relaxed mt-1 font-semibold">
                  Añadimos este popup automático que te informará siempre en español sobre las mejoras técnicas implementadas, manteniendo la transparencia técnica de la aplicación sin sobrecargar los recursos.
                </p>
              </div>
            </div>

          </div>

          {/* Modal Action CTA */}
          <div className="p-6 border-t border-white/5 bg-[#0e0e11] flex items-center justify-between gap-4">
            <span className="text-[10px] text-slate-500 font-bold font-mono uppercase hidden sm:inline">
              Flux Music Build 2026.1
            </span>
            <button
              onClick={handleDismiss}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-black uppercase text-[10px] tracking-wider rounded-xl shadow-[0_4px_20px_rgba(30,215,96,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 ml-auto"
            >
              <span>¡Entendido, a Entrenar!</span>
              <ChevronRight className="w-4 h-4 stroke-[3px]" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
