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
import { collection, onSnapshot, query, orderBy, limit, doc, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Compiled App Updates to ensure update history is always populated
export const COMPILED_UPDATES: Announcement[] = [
  {
    id: "update-v1.5.0",
    title: "✨ Actualización Flux v1.5.0 - Nuevas Playlists y Playlist 'Alborán/De Luna' Activadas",
    category: "actualizacion",
    createdAt: new Date("2026-06-11T16:00:00Z"),
    content: "• ¡Soporte Unificado de Playlists Resolucionado! Corregido el motor híbrido de carga que impedía ver ciertas playlists de YouTube o YouTube Music.\n• Playlist Añadida y Corregida: Integrada perfectamente la lista 'Pablo Alborán and Álvaro De Luna' (PLiomXdAuOA97jjwoT8YXFpbMF4ixQ22n4) con extracción automática de tracks, portadas y metadatos.\n• Solución a fallos de carga en listas vacías o restringidas: La app intentará automáticamente métodos secundarios silenciosos para que no pierdas tu música favorita."
  },
  {
    id: "update-v1.4.6",
    title: "✨ Actualización Flux v1.4.6 - Últimos Ajustes del Sistema",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T23:45:00Z"),
    content: "• Ajustados finalmente los indicadores de alerta en la campana de notificaciones. Ya se marcan y sincronizan todas las actualizaciones directamente con tu sesión sin problemas.\n• Revisión global para garantizar el Historial Completo de actualizaciones para todos los usuarios."
  },
  {
    id: "update-v1.4.5",
    title: "✨ Actualización Flux v1.4.5 - Notificaciones e Historial",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T23:35:00Z"),
    content: "• Reparado el indicador de alertas de Notificaciones (Campanita) para que detecte correctamente las actualizaciones sin leer, integrando todo el sistema global.\n• El historial ahora muestra la totalidad de las actualizaciones de forma continua."
  },
  {
    id: "update-v1.4.4",
    title: "✨ Actualización Flux v1.4.4 - Motor y Favoritos",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T22:15:00Z"),
    content: "• Solución contundente al fallo de los Me Gusta (Favoritos) sin afectar visuales.\n• Corregidos los errores que causaban que la pista saltara temporalmente de estado al guardar un track en listas, manteniendo el flujo sin problemas.\n• Optimización de estado interno y estabilización de variables críticas (playingPlaylist, userPlaylists)."
  },
  {
    id: "update-v1.4.3",
    title: "⚡ Actualización Flux v1.4.3 - Estabilidad",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T19:45:00Z"),
    content: "• Pulido del Ecosistema de control y re-renderizado React.\n• Evita el refresco no deseado de playlists enteras durante interacciones aisladas en la app."
  },
  {
    id: "update-v1.4.2",
    title: "✨ Actualización Flux v1.4.2",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T13:25:00Z"),
    content: "• Ajustes de visibilidad de perfil personal: Hemos arreglado un comportamiento donde los administradores y ciertos perfiles no mostraban su nombre de perfil correctamente al crear playlists personalizadas. A partir de ahora el tag exclusivo #fluxmusicoficial sólo aplicará cuando se especifique así."
  },
  {
    id: "update-v1.4.1",
    title: "✨ Actualización Flux v1.4.1",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T13:16:00Z"),
    content: "• Solución óptima aplicada al funcionamiento de Playlists: Restaurada y optimizada la visibilidad de tu biblioteca y canciones guardadas.\n• Corrección de autoría en canales de contenido: Etiquetas de 'Socio Premium' y validación especial '#fluxmusicoficial' para contenido curado por administradores.\n• Notificaciones en tiempo real integradas optimizadas sin afectar módulos dependientes."
  },
  {
    id: "update-v1.4.0",
    title: "✨ Actualización Flux v1.4.0",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T11:00:00Z"),
    content: "• Rediseño premium de la cabecera e íconos a blanco puro con neón.\n• PDF Comercial optimizado: Detalles del ecosistema Flux, miles de playlists actualizadas y potente buscador global.\n• Experiencia de pantalla invertida con prevención automática de bloqueo del dispositivo.\n• Valores fundamentales del ecosistema destacados y depurados en el PDF."
  },
  {
    id: "update-v1.3.1",
    title: "⚡ Actualización Flux v1.3.1",
    category: "actualizacion",
    createdAt: new Date("2026-06-08T01:15:00Z"),
    content: "• ¡Hemos integrado de forma unificada el Centro de Notificaciones y Avisos Directos! Se han eliminado las ventanas emergentes (popups) molestas. Ahora el historial es continuo en tiempo real en español.",
  },
  {
    id: "update-v1.3.0",
    title: "✨ Actualización Flux v1.3.0 - Modo Eco y Lock Screen",
    category: "actualizacion",
    createdAt: new Date("2026-06-07T18:00:00Z"),
    content: "• Implementación del Sistema de Media Session: Ahora puedes controlar la música desde la pantalla de bloqueo (Lock Screen) de tu dispositivo móvil y auriculares.\n• Nuevo 'Modo Eco': Optimización extrema del perfil de rendimiento. Reduce el consumo de batería y datos ocultando visualizaciones complejas cuando buscas ahorro de energía.\n• Prevención de saltos de estado y sincronización mejorada del reproductor.",
  },
  {
    id: "update-v1.2.5",
    title: "✨ Actualización Flux v1.2.5 - Playlists del Ecosistema",
    category: "actualizacion",
    createdAt: new Date("2026-06-06T15:30:00Z"),
    content: "• Integración de Playlists Públicas de la Comunidad: Ahora puedes compartir tus playlists con todo el mundo y explorar las creaciones de otros usuarios.\n• Funcionalidad de 'Añadir a mi Biblioteca' para copiar canales públicos a tu colección personal.\n• Nuevo contador de listados (veces listado) en las playlists de la comunidad.",
  },
  {
    id: "update-v1.2.0",
    title: "✨ Actualización Flux v1.2.0 - Autenticación y Cuentas",
    category: "actualizacion",
    createdAt: new Date("2026-06-05T12:00:00Z"),
    content: "• Perfiles Integrados: Se añadió soporte completo de inicio de sesión de perfiles para sincronizar tu progreso y música guardada en la nube.\n• Playlist inteligente 'Favoritos' anclada en la parte superior para fácil acceso y guardado rápido (Corazón activo).\n• Gestión de cuentas de Administrador centralizada y validación estricta de códigos de seguridad.",
  },
  {
    id: "update-v1.1.0",
    title: "⚡ Actualización Flux v1.1.0 - El Nuevo Reproductor",
    category: "actualizacion",
    createdAt: new Date("2026-06-03T10:00:00Z"),
    content: "• Nuevo motor de reproducción ReactPlayer enlazado de forma oculta para lograr reproducción continua sin interrupciones.\n• Transiciones de desvanecimiento automáticas. Eliminación del iframe nativo en favor de un sistema de audio directo.\n• Panel lateral desplegable, búsqueda inteligente por canal, artistas o tracks de Base de Datos Base.",
  },
  {
    id: "update-v1.0.0",
    title: "🚀 Lanzamiento Oficial Flux Music v1.0",
    category: "noticia",
    createdAt: new Date("2026-06-01T08:00:00Z"),
    content: "• ¡Bienvenido a Flux Music! La plataforma definitiva de streaming musical y fitness centrada en diseño elitista, colores cósmicos e inmersión absoluta sin cortes.\n• Base de datos original musical añadida. Que disfrutes de esta nueva dimensión de sonido ininterrumpido.",
  }
];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: "mantenimiento" | "noticia" | "actualizacion" | "urgente";
  createdAt: any;
  active?: boolean;
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

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(20));
    
    const unsubscribe = onSnapshot(q, (querySnap) => {
      const firebaseList: Announcement[] = [];
      querySnap.forEach((docSnap) => {
        const data = docSnap.data();
        const ca = data.createdAt;
        const parsedDate = ca ? (typeof ca.toDate === 'function' ? ca.toDate() : new Date(ca)) : new Date();
        firebaseList.push({
          id: docSnap.id,
          title: data.title || "Aviso",
          content: data.content || "",
          category: data.category || "noticia",
          createdAt: parsedDate
        });
      });

      // Merge realtime database announcements with compiled app updates
      const combined = [...firebaseList, ...COMPILED_UPDATES];
      combined.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      setAnnouncements(combined);
      
      if (isOpen && combined.length > 0) {
        localStorage.setItem("flux_last_viewed_announcement_id", combined[0].id);
        window.dispatchEvent(new Event("notifications-read"));
      }
      setLoading(false);
    }, (err) => {
      console.error("Error al cargar comunicados:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const handleDeleteAnnouncement = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Seguro que deseas eliminar este anuncio permanentemente?")) return;
    try {
      await deleteDoc(doc(db, "announcements", id));
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
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
      case "mantenimiento":
        return <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case "actualizacion":
        return <Sparkles className="w-3.5 h-3.5 text-[#1ED760] shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <div className="absolute inset-0 z-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[85vh]"
        >
          <div className="absolute top-0 inset-x-0 h-[2px] bg-[#1ED760]" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-4 border-b border-white/5 bg-gradient-to-b from-[#1ED760]/5 to-transparent text-left">
            <h2 className="text-white text-[15px] font-black tracking-tight flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1ED760]" />
              <span>Historial y Novedades</span>
            </h2>
            <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest mt-1">
              Actualizaciones Generales de Flux
            </p>
          </div>

          <div className="p-3 overflow-y-auto premium-scrollbar flex-1 space-y-2.5 max-h-[50vh] text-left">
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 font-semibold animate-pulse">
                Sincronizando Firebase...
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-semibold">
                Sin novedades recientes.
              </div>
            ) : (
              announcements.map((item) => {
                const isSelected = selectedNoticeId === item.id;
                const formattedTime = item.createdAt instanceof Date 
                  ? item.createdAt.toLocaleDateString("es-ES", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                  : "";

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedNoticeId(isSelected ? null : item.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group flex flex-col ${
                      isSelected 
                        ? "bg-[#111114] border-[#1ED760]/30 shadow-lg" 
                        : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {getCategoryIcon(item.category)}
                        <span className={`text-[8.5px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 rounded border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] text-slate-500 font-bold whitespace-nowrap">
                          {formattedTime}
                        </span>
                        {isAdmin && !item.id.startsWith("update-") && (
                          <button
                            onClick={(e) => handleDeleteAnnouncement(item.id, e)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-white text-[11px] font-bold tracking-tight leading-snug group-hover:text-[#1ED760] transition-colors line-clamp-1 pr-6">
                      {item.title}
                    </h4>

                    {isSelected && (
                      <div className="text-[10px] leading-relaxed text-slate-300 font-medium mt-2 pt-2 border-t border-white/5 whitespace-pre-wrap">
                        {item.content}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

