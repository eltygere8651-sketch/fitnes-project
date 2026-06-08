import React, { useState, useEffect } from "react";
import { 
  X, 
  Bell, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Check, 
  Megaphone, 
  Clock, 
  Server,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, getDocs, query, orderBy, limit, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Static premium fallback notices to show instantly (zero database strain + beautiful populating)
const STATIC_SYSTEM_NOTICES = [
  {
    id: "system-update-130",
    title: "⚡ Actualización Flux v1.3.0",
    category: "actualizacion",
    createdAt: new Date("2026-06-07T12:00:00Z"),
    content: "Hemos lanzado avatares premium y solucionado errores en bucles del reproductor. Ahora la reproducción es fluida, continua y de la mejor calidad premium.",
    isStatic: true
  },
  {
    id: "system-server-status",
    title: "🟢 Servidores en Línea (CDN Optimizado)",
    category: "noticia",
    createdAt: new Date("2026-06-06T18:00:00Z"),
    content: "La infraestructura global está en perfecto estado. Se ha activado la compresión ecológica de imágenes que reduce el consumo de batería y datos un 40% en móviles.",
    isStatic: true
  },
  {
    id: "system-install-tip",
    title: "💡 Instalación Premium (PWA)",
    category: "noticia",
    createdAt: new Date("2026-06-05T09:00:00Z"),
    content: "Para una experiencia sin barras de navegación, pulsa 'Instalar App' e instálala en tu pantalla de inicio como una aplicación nativa de pantalla completa.",
    isStatic: true
  }
];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "mantenimiento" | "noticia" | "actualizacion" | "urgente";
  createdAt: any;
  active?: boolean;
  isStatic?: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, isAdmin }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  // Load announcements from Firestore & blend them with static premium defaults
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(12));
      const querySnap = await getDocs(q);
      
      const firebaseList: Announcement[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        firebaseList.push({
          id: docSnap.id,
          title: data.title || "Aviso sin título",
          content: data.content || "",
          category: data.category || "noticia",
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });

      // Combine dynamic admin announcements with our static ones
      const combined = [...firebaseList, ...STATIC_SYSTEM_NOTICES];
      
      // Sort combined by date descending
      combined.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setAnnouncements(combined);

      // Once opened and announcements loaded, mark the latest one as read!
      if (combined.length > 0) {
        const newestId = combined[0].id;
        localStorage.setItem("flux_last_viewed_announcement_id", newestId);
        // Dispatch event so the header bell badge knows to turn grey immediately!
        window.dispatchEvent(new Event("notifications-read"));
      }
    } catch (err) {
      console.error("Error cargando comunicados:", err);
      // On error, populate with at least our gorgeous static data
      setAnnouncements(STATIC_SYSTEM_NOTICES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnnouncements();
    }
  }, [isOpen]);

  const handleDeleteAnnouncement = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que deseas eliminar este anuncio permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
      setAnnouncements(prev => prev.filter(item => item.id !== id));
      window.dispatchEvent(new Event("notifications-read"));
    } catch (err) {
      alert("No se pudo eliminar el anuncio: " + err);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "urgente":
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
      case "mantenimiento":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "actualizacion":
        return "bg-[#1ED760]/10 text-[#1ED760] border-[#1ED760]/20";
      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "urgente":
        return <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />;
      case "mantenimiento":
        return <Server className="w-4 h-4 text-amber-400 shrink-0" />;
      case "actualizacion":
        return <Sparkles className="w-4 h-4 text-[#1ED760] shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      >
        {/* Background Click dismiss */}
        <div className="absolute inset-0 z-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(30,215,96,0.1)] flex flex-col z-10 max-h-[85vh]"
        >
          {/* Neon Top Line Accent */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#1ED760] via-emerald-500 to-amber-500" />

          {/* Close Header Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Title */}
          <div className="p-5 pb-3 border-b border-white/5 bg-gradient-to-b from-[#1ED760]/5 to-transparent text-left">
            <h2 className="text-white text-lg font-black tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1ED760] animate-swing" />
              <span>Centro de Avisos y Comunicados</span>
            </h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">
              Optimizado para carga rápida y bajo consumo movil
            </p>
          </div>

          {/* Body List of items */}
          <div className="p-5 overflow-y-auto premium-scrollbar flex-1 space-y-3.5 max-h-[50vh] text-left">
            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 font-semibold animate-pulse flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <span>Sincronizando avisos...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-semibold">
                No hay comunicados del administrador activos.
              </div>
            ) : (
              announcements.map((item) => {
                const isSelected = selectedNoticeId === item.id;
                const formattedTime = item.createdAt instanceof Date 
                  ? item.createdAt.toLocaleDateString("es-ES", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                  : "Reciente";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNoticeId(isSelected ? null : item.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col ${
                      isSelected 
                        ? "bg-[#111114] border-white/10 shadow-lg" 
                        : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5"
                    }`}
                  >
                    {/* Badge y categoría */}
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-md border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        {item.isStatic && (
                          <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">
                            Sistema
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-slate-500 font-bold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-slate-600" />
                          {formattedTime}
                        </span>
                        {isAdmin && !item.isStatic && (
                          <button
                            onClick={(e) => handleDeleteAnnouncement(item.id, e)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded-md hover:bg-red-500/10 cursor-pointer transition-colors"
                            title="Eliminar comunicado"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{getCategoryIcon(item.category)}</span>
                      <h4 className="text-white text-xs font-black tracking-tight leading-snug group-hover:text-[#1ED760] transition-colors flex-1">
                        {item.title}
                      </h4>
                    </div>

                    {/* Expandable/Compact Content view */}
                    <div 
                      className={`text-[11px] leading-relaxed text-slate-400 font-semibold mt-1.5 transition-all duration-300 overflow-hidden ${
                        isSelected ? "max-h-[300px] opacity-100 mt-2.5 pt-2 border-t border-white/[0.03]" : "max-h-12 opacity-80"
                      }`}
                    >
                      {item.content}
                    </div>

                    {/* Indicator line */}
                    {!isSelected && (
                      <div className="text-[8px] text-[#1ED760]/70 font-black uppercase tracking-widest text-right mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Detalles con 1-Click +
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer view action */}
          <div className="p-4 border-t border-white/5 bg-[#0d0d10] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-black uppercase tracking-widest">
              <Megaphone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Flux Music Comunicados</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
