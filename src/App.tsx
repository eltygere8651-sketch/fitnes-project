import { useState, useEffect, useRef, useMemo } from "react";
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
  Bell,
  MessageSquare,
  MessageCircle,
  Send,
  Loader2,
  Trash2
} from "lucide-react";
import GymMusicPlayer from "./components/GymMusicPlayer";
import { FluxLogo, FluxLogoLarge } from "./components/FluxLogo";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { logout, db } from "./lib/firebase";
import { collection, getDocs, query, orderBy, limit, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
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
  const [globalBanner, setGlobalBanner] = useState<{title: string, content: string, category?: string} | null>(null);

  // States for Live Premium Support
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [supportChatMessages, setSupportChatMessages] = useState<any[]>([]);
  const [unreadRepliesCount, setUnreadRepliesCount] = useState(0);
  const supportChatEndRef = useRef<HTMLDivElement>(null);

  // States for Admin Support
  const [allSupportMessages, setAllSupportMessages] = useState<any[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSendingReply, setIsSendingReply] = useState(false);
  const adminChatEndRef = useRef<HTMLDivElement>(null);

  const isInitialAdminLoad = useRef(true);
  const isInitialUserLoad = useRef(true);
  const adminMessageIdsRef = useRef<Set<string>>(new Set());
  const userMessageIdsRef = useRef<Set<string>>(new Set());

  const playNotificationSound = async () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      
      // Tone 1: principal chime tone
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Tone 2: secondary harmonious tone
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.50, now);
      gain2.gain.setValueAtTime(0.08, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now);
      osc2.stop(now + 0.45);
    } catch (err) {
      console.warn("Audio notification failed:", err);
    }
  };

  const computedThreads = useMemo(() => {
    if (!isAdmin) return [];
    const threadsMap: Record<string, any> = {};

    allSupportMessages.forEach((m) => {
      const uId = m.userId || "unknown";
      if (!threadsMap[uId]) {
        threadsMap[uId] = {
          userId: uId,
          userEmail: m.userEmail || "Anónimo",
          userName: m.userName || "Socio Flux",
          messages: [],
          lastMessage: null,
          unreadCount: 0,
        };
      }
      threadsMap[uId].messages.push(m);
      threadsMap[uId].lastMessage = m;

      if (!m.isAdminReply && !m.readByAdmin) {
        threadsMap[uId].unreadCount += 1;
      }
    });

    return Object.values(threadsMap).sort((a: any, b: any) => {
      const timeA = a.lastMessage?.createdAt || 0;
      const timeB = b.lastMessage?.createdAt || 0;
      return timeB - timeA;
    });
  }, [allSupportMessages, isAdmin]);

  useEffect(() => {
    if (isSupportModalOpen && supportChatEndRef.current) {
      setTimeout(() => {
        supportChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [supportChatMessages, isSupportModalOpen]);

  useEffect(() => {
    const handleOpenSupport = () => setIsSupportModalOpen(true);
    window.addEventListener("open-support", handleOpenSupport);
    return () => window.removeEventListener("open-support", handleOpenSupport);
  }, []);

  const [guestId, setGuestId] = useState<string>(() => {
    const saved = localStorage.getItem("flux_guest_id");
    if (saved) return saved;
    const newId = "guest_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("flux_guest_id", newId);
    return newId;
  });

  const currentUserId = user?.uid || guestId;
  
  useEffect(() => {
    isInitialAdminLoad.current = true;
    isInitialUserLoad.current = true;
    adminMessageIdsRef.current.clear();
    userMessageIdsRef.current.clear();

    if (isAdmin) {
      const q = query(
        collection(db, "support_messages"),
        orderBy("createdAt", "asc")
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }));

          // Check if there is any new message sent by a user (not admin reply)
          const hasNewIncoming = msgs.some(
            (m: any) => !m.isAdminReply && !adminMessageIdsRef.current.has(m.id)
          );

          // Update cache of seen IDs
          msgs.forEach((m: any) => adminMessageIdsRef.current.add(m.id));

          // If it is not the initial snapshot load, play the notification sound
          if (hasNewIncoming && !isInitialAdminLoad.current) {
            playNotificationSound();
          }
          isInitialAdminLoad.current = false;

          setAllSupportMessages(msgs);

          const unreadCount = msgs.filter(
            (m: any) => !m.isAdminReply && !m.readByAdmin
          ).length;
          setUnreadRepliesCount(unreadCount);
        },
        (error) => {
          console.warn("Error in admin support messages listener:", error);
        }
      );
      return () => unsubscribe();
    } else {
      const q = query(
        collection(db, "support_messages"),
        where("userId", "==", currentUserId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          })).sort((a: any, b: any) => a.createdAt - b.createdAt);

          // Check if there is any new message sent by support/admin
          const hasNewIncoming = msgs.some(
            (m: any) => m.isAdminReply && !userMessageIdsRef.current.has(m.id)
          );

          // Update cache of seen IDs
          msgs.forEach((m: any) => userMessageIdsRef.current.add(m.id));

          // If it is not the initial snapshot load, play the notification sound
          if (hasNewIncoming && !isInitialUserLoad.current) {
            playNotificationSound();
          }
          isInitialUserLoad.current = false;

          setSupportChatMessages(msgs);

          const unreadCount = msgs.filter(
            (m: any) => m.isAdminReply && !m.readByUser
          ).length;
          setUnreadRepliesCount(unreadCount);
        },
        (error) => {
          console.warn("Error in support messages listener:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [isAdmin, currentUserId]);

  useEffect(() => {
    if (!isAdmin && isSupportModalOpen && supportChatMessages.length > 0) {
      const unreadReplies = supportChatMessages.filter(
        (m) => m.isAdminReply && !m.readByUser
      );
      unreadReplies.forEach(async (m) => {
        try {
          await updateDoc(doc(db, "support_messages", m.id), {
            readByUser: true,
          });
        } catch (e) {
          console.warn("Could not mark support message as read:", e);
        }
      });
    }
  }, [isSupportModalOpen, supportChatMessages, isAdmin]);

  useEffect(() => {
    if (isAdmin && selectedThreadId && allSupportMessages.length > 0) {
      const threadMsgs = allSupportMessages.filter(
        (m) => m.userId === selectedThreadId
      );
      const unreadUserMsgs = threadMsgs.filter(
        (m) => !m.isAdminReply && !m.readByAdmin
      );

      unreadUserMsgs.forEach(async (m) => {
        try {
          await updateDoc(doc(db, "support_messages", m.id), {
            readByAdmin: true,
          });
        } catch (e) {
          console.warn("Could not mark support message as read by admin:", e);
        }
      });
    }
  }, [isAdmin, selectedThreadId, allSupportMessages]);

  useEffect(() => {
    if (isAdmin && isSupportModalOpen && adminChatEndRef.current) {
      setTimeout(() => {
        adminChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [selectedThreadId, allSupportMessages, isSupportModalOpen, isAdmin]);

  const handleSendSupportMessage = async () => {
    if (!supportMessage || !supportMessage.trim()) {
      return;
    }

    try {
      setIsSendingSupport(true);
      const emailVal = user?.email || "Anónimo";
      const nameVal = user?.displayName || "Socio Contigo";
      const msgText = supportMessage.trim();
      const currentUserId = user?.uid || "guest_uid";

      const newMsgObj = {
        userId: currentUserId,
        userEmail: emailVal,
        userName: nameVal,
        message: msgText,
        createdAt: Date.now(),
        isAdminReply: false,
        readByAdmin: false,
        readByUser: true,
      };
      
      const lastMsg = supportChatMessages[supportChatMessages.length - 1];
      const isFirstContact = supportChatMessages.length === 0 || (lastMsg && lastMsg.isAdminReply);
      
      const isFirstMessageEver = supportChatMessages.length === 0;
      
      await addDoc(collection(db, "support_messages"), newMsgObj);

      // 1. Enviar respuesta automática SOLO en el primer mensaje absoluto (cuando no hay historial)
      if (isFirstMessageEver) {
        setTimeout(async () => {
          try {
            const autoReplyMsg = {
              userId: currentUserId,
              userEmail: emailVal,
              userName: "Soporte Automático",
              message: "¡Hola! Hemos recibido tu mensaje. Nuestro equipo de soporte lo revisará y se pondrá en contacto contigo lo antes posible. Gracias por escribirnos.",
              createdAt: Date.now(),
              isAdminReply: true,
              readByAdmin: true,
              readByUser: false,
            };
            await addDoc(collection(db, "support_messages"), autoReplyMsg);
          } catch (e) {
            console.warn("Failed to send auto-reply:", e);
          }
        }, 1500);
      }

      // 2. Notificar a Telegram en el primer contacto O si el usuario responde después del admin (evitar spam)
      if (isFirstContact) {
        try {
          // Fetch telegram config directly from Firestore to support Vercel static hosting
          const tgDoc = await getDocs(query(collection(db, "system_settings"), limit(1)));
          let botToken = "";
          let chatId = "";
          tgDoc.forEach(doc => {
            if (doc.id === "telegram") {
              botToken = doc.data().botToken;
              chatId = doc.data().chatId;
            }
          });

          if (botToken && chatId) {
            const title = `🚨 Nuevo Mensaje de Soporte 🚨`;
            const userLine = `👤 Usuario: ${nameVal || "Anónimo"} (${emailVal || "Sin email"})`;
            const messageLine = `💬 Mensaje:\n[SOPORTE PREMIUM]\n\n${msgText}`;
            const text = `${title}\n\n${userLine}\n\n${messageLine}`;

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: text }),
            });
          }
        } catch (telegramErr) {
          console.warn("Failed to notify Telegram:", telegramErr);
        }
      }

      setSupportMessage("");
    } catch (err) {
      console.error("Error sending support message:", err);
    } finally {
      setIsSendingSupport(false);
    }
  };

  const handleCloseCase = async () => {
    if (!selectedThreadId) return;
    
    // Optional: confirm before closing
    if (!window.confirm("¿Estás seguro de que quieres cerrar y eliminar este caso? Todo el historial de chat con este usuario se borrará.")) {
      return;
    }

    try {
      const msgsToDelete = allSupportMessages.filter(m => m.userId === selectedThreadId);
      
      for (const msg of msgsToDelete) {
        if (msg.id) {
          await deleteDoc(doc(db, "support_messages", msg.id));
        }
      }
      
      setSelectedThreadId(null);
    } catch (e) {
      console.error("Error closing case:", e);
      alert("No se pudo cerrar el caso. Inténtalo de nuevo.");
    }
  };

  const handleSendAdminReply = async () => {
    if (!replyText.trim() || !selectedThreadId) return;

    try {
      setIsSendingReply(true);
      const textToMsg = replyText.trim();
      setReplyText("");

      // Find user info from existing messages in the thread
      const threadMsgs = allSupportMessages.filter(
        (m) => m.userId === selectedThreadId
      );
      const firstUserMsg = threadMsgs.find((m) => !m.isAdminReply && m.userId && m.userId !== "unknown_user");
      const userIdVal = firstUserMsg?.userId || threadMsgs[0]?.userId || "unknown_user";
      const userEmailVal = firstUserMsg?.userEmail || threadMsgs[0]?.userEmail || "Anónimo";

      const newReply = {
        userId: userIdVal,
        userEmail: userEmailVal,
        userName: "Soporte FLUX",
        message: textToMsg,
        createdAt: Date.now(),
        isAdminReply: true,
        readByAdmin: true,
        readByUser: false,
      };

      await addDoc(collection(db, "support_messages"), newReply);
    } catch (e) {
      console.error("Error sending admin reply:", e);
      alert("No se pudo enviar la respuesta: " + e);
    } finally {
      setIsSendingReply(false);
    }
  };

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
    // Check for unread announcements using getDocs (replaces onSnapshot for scale)
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(1));
    const checkUnread = () => {
      getDocs(q).then((snapshot) => {
        try {
          const lastViewed = localStorage.getItem("flux_last_viewed_announcement_id");
          let hasUnreadDb = false;

          let newestId = COMPILED_UPDATES.length > 0 ? COMPILED_UPDATES[0].id : null;
          let staticDate = COMPILED_UPDATES.length > 0 ? COMPILED_UPDATES[0].createdAt : new Date(0);

          if (!snapshot.empty) {
            const newestDoc = snapshot.docs[0];
            const data = newestDoc.data();
            const createdAt = data.createdAt;
            const dbDate = createdAt ? (typeof createdAt.toDate === 'function' ? createdAt.toDate() : new Date(createdAt)) : new Date(0);
            
            if (dbDate > staticDate) {
              newestId = newestDoc.id;
            }

            // Check for active global banner (within last 24h)
            if (Date.now() - dbDate.getTime() < 86400000 && data.active !== false) {
               setGlobalBanner({ title: data.title, content: data.content, category: data.category });
            } else {
               setGlobalBanner(null);
            }
          } else {
             setGlobalBanner(null);
          }

          if (newestId && newestId !== lastViewed) {
            hasUnreadDb = true;
          }

          setHasUnread(hasUnreadDb);
        } catch (err) {
          console.warn("No se pudo revisar anuncios de Firebase en tiempo real:", err);
        }
      }).catch((error) => {
        console.warn("Error en getDocs de anuncios:", error);
      });
    };

    checkUnread();
    const interval = setInterval(checkUnread, 15 * 60 * 1000);

    const handleRead = () => {
      setHasUnread(false);
    };
    window.addEventListener("notifications-read", handleRead);
    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-read", handleRead);
    };
  }, []);

  // Removed unused visibility state

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

        {/* GLOBAL ANNOUNCEMENT BANNER */}
        {globalBanner && (
          <div className="w-full mt-2 overflow-hidden bg-gradient-to-r from-emerald-500/10 via-emerald-400/20 to-emerald-500/10 border-y border-emerald-500/20 py-2 shrink-0 flex items-center relative shadow-[0_0_15px_rgba(16,185,129,0.1)]">
             <div className="flex items-center gap-6 text-emerald-400 font-extrabold uppercase text-[10px] tracking-widest px-4 animate-marquee whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-white drop-shadow-md">{globalBanner.title}:</span> 
                <span className="opacity-90">{globalBanner.content}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)] ml-12" />
             </div>
          </div>
        )}
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
              <GymMusicPlayer unreadRepliesCount={unreadRepliesCount} />
            </div>
          </div>
        </section>
      </main>

      {/* --- PWA ONE-CLICK INSTALL FLOAT --- */}
      <AnimatePresence>
        {canShowInstallHelper && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 right-4 z-[90] flex justify-end"
          >
            <button
              onClick={handleInstallPress}
              className="bg-[#1ED760] hover:bg-emerald-400 text-black px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-black uppercase text-[9px] sm:text-[11px] tracking-widest shadow-[0_8px_20px_rgba(30,215,96,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Instalar</span>
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

      {/* SUPPORT DIALOG MODAL */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full ${
                isAdmin ? "max-w-4xl h-[600px]" : "max-w-md h-[520px]"
              } bg-[#0d0d0f] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col`}
            >
              {/* Header */}
              <div className="p-4.5 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent text-left shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-[#1ED760]/10 to-emerald-500/5 rounded-xl border border-[#1ED760]/15 relative">
                    <MessageSquare className="w-4 h-4 text-[#1ED760]" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#1ED760]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-white tracking-[0.15em]">
                      {isAdmin ? "Soporte Premium (Modo Admin)" : "Soporte Premium Flux"}
                    </h3>
                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                      {isAdmin ? "Responder Consultas en Directo" : "Canal de Asistencia en Directo"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSupportModalOpen(false);
                    if (!isAdmin) {
                      setSupportMessage("");
                    }
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              {isAdmin ? (
                /* ADMIN MULTI-THREAD DASHBOARD */
                <div className="flex-1 flex flex-col md:flex-row min-h-0 text-left bg-black/10">
                  {/* Left Column: Conversation Thread List */}
                  <div className={`w-full md:w-1/3 border-r border-white/5 flex flex-col h-full bg-[#0a0a0c] ${selectedThreadId ? "hidden md:flex" : "flex"}`}>
                    <div className="p-3 border-b border-white/5 shrink-0 bg-white/[0.01]">
                      <h4 className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Hilos de Conversación</h4>
                      <p className="text-[7.5px] text-slate-500 uppercase font-bold mt-0.5">Soporte en tiempo real</p>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/5">
                      {computedThreads.length === 0 ? (
                        <div className="text-center py-12 px-4 space-y-2">
                          <MessageSquare className="w-5 h-5 text-slate-600 mx-auto" />
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">No hay mensajes aún</p>
                        </div>
                      ) : (
                        computedThreads.map((thread: any) => {
                          const isActive = selectedThreadId === thread.userId;
                          const hasUnread = thread.unreadCount > 0;
                          return (
                            <button
                              key={thread.userId}
                              onClick={() => setSelectedThreadId(thread.userId)}
                              className={`w-full text-left p-3.5 transition-all hover:bg-white/[0.02] flex items-start gap-2.5 select-none cursor-pointer ${
                                isActive ? "bg-white/[0.04]" : ""
                              }`}
                            >
                              <div className="relative shrink-0 mt-0.5">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1ED760]/10 to-emerald-500/10 border border-white/10 flex items-center justify-center font-black text-[9px] uppercase text-white">
                                  {thread.userName.substring(0, 2)}
                                </div>
                                {hasUnread && (
                                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                                    {thread.unreadCount}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[10px] font-black truncate text-white leading-none">
                                    {thread.userName}
                                  </h5>
                                  <span className="text-[7px] font-bold text-slate-600 uppercase shrink-0">
                                    {thread.lastMessage?.createdAt
                                      ? new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                      : ""}
                                  </span>
                                </div>
                                <p className="text-[7.5px] font-bold text-slate-500 truncate mt-0.5">
                                  {thread.userEmail}
                                </p>
                                <p className={`text-[9.5px] truncate mt-1 ${hasUnread ? "text-slate-200 font-bold" : "text-slate-400 font-medium"}`}>
                                  {thread.lastMessage?.isAdminReply ? "Tú: " : ""}{thread.lastMessage?.message}
                                </p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Chat Content View */}
                  <div className={`flex-1 flex flex-col h-full bg-[#0d0d0f] ${!selectedThreadId ? "hidden md:flex" : "flex"}`}>
                    {selectedThreadId ? (
                      <>
                        {/* Active Thread Header */}
                        <div className="p-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between shrink-0">
                          <div className="min-w-0 text-left">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-[10px] font-black text-white leading-none">
                                {allSupportMessages.find(m => m.userId === selectedThreadId)?.userName || "Socio Flux"}
                              </h4>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                            </div>
                            <p className="text-[8px] font-bold text-slate-500 mt-0.5 truncate">{allSupportMessages.find(m => m.userId === selectedThreadId)?.userEmail || "Anónimo"}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCloseCase}
                              className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-[8px] font-black uppercase text-rose-400 rounded-lg transition-all cursor-pointer select-none flex items-center gap-1"
                              title="Cerrar y eliminar caso"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Cerrar Caso</span>
                            </button>
                            {/* Mobile Back Button to return to thread list */}
                            <button
                              onClick={() => setSelectedThreadId(null)}
                              className="md:hidden px-2.5 py-1 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase text-slate-300 rounded-lg transition-all cursor-pointer select-none"
                            >
                              Ver Lista
                            </button>
                            <span className="hidden md:inline px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[8px] font-black uppercase tracking-widest rounded-full">
                              Canal Sincronizado
                            </span>
                          </div>
                        </div>

                        {/* Chat Messages Log */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent bg-black/10">
                          {allSupportMessages
                            .filter((m) => m.userId === selectedThreadId)
                            .map((msg) => {
                              const isRep = msg.isAdminReply;
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col max-w-[80%] ${isRep ? "self-end items-end" : "self-start items-start"}`}
                                >
                                  {!isRep && (
                                    <span className="text-[7.5px] font-black uppercase text-slate-500 tracking-widest mb-0.5 pl-1">
                                      {msg.category ? `[${msg.category.toUpperCase()}]` : "[USUARIO]"}
                                    </span>
                                  )}
                                  <div
                                    className={`p-3 rounded-[16px] text-[11px] font-semibold leading-relaxed text-left ${
                                      isRep
                                        ? "bg-gradient-to-r from-emerald-600 to-[#1ED760] text-black rounded-tr-none shadow-[0_4px_12px_rgba(30,215,96,0.15)]"
                                        : "bg-white/[0.04] border border-white/5 text-slate-200 rounded-tl-none"
                                    }`}
                                  >
                                    {msg.message}
                                  </div>
                                  <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest mt-0.5 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                              );
                            })}
                          <div ref={adminChatEndRef} />
                        </div>

                        {/* Chat Input Area */}
                        <div className="p-3 border-t border-white/5 bg-[#121214] shrink-0">
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !isSendingReply && replyText.trim()) {
                                  handleSendAdminReply();
                                }
                              }}
                              placeholder="Escribe una respuesta para el cliente..."
                              disabled={isSendingReply}
                              className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2.5 text-[11px] text-white placeholder-slate-600 outline-none focus:border-[#1ED760]/30 focus:bg-white/[0.04] transition-all font-semibold"
                            />
                            <button
                              disabled={isSendingReply || !replyText.trim()}
                              onClick={handleSendAdminReply}
                              className="p-2.5 bg-[#1ED760] disabled:opacity-30 text-black hover:bg-emerald-400 transition-all rounded-xl cursor-pointer flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(30,215,96,0.2)]"
                            >
                              {isSendingReply ? (
                                <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                              ) : (
                                <Send className="w-4 h-4 stroke-[2.5px]" />
                              )}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                        <div className="p-4 bg-[#1ED760]/5 rounded-full border border-[#1ED760]/10 animate-pulse">
                          <MessageSquare className="w-8 h-8 text-[#1ED760]" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Flux Live Support</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Panel de Control</p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed max-w-[280px]">
                          Selecciona una conversación de la lista de la izquierda para responder en tiempo real al usuario.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* USER SINGLE-THREAD SUPPORT */
                <>
                  {/* Chat Message Area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col bg-black/10 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                    {!user ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                        <div className="p-4 bg-emerald-500/5 rounded-full border border-emerald-500/10 animate-pulse">
                          <MessageSquare className="w-8 h-8 text-[#1ED760]" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Soporte Premium</p>
                          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Identificación Requerida</p>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-[260px]">
                          Para garantizar un canal de soporte premium en tiempo real y poder dar seguimiento a tus consultas, por favor inicia sesión.
                        </p>
                        <button
                          onClick={() => {
                            setIsSupportModalOpen(false);
                            setAuthModalOpen(true);
                          }}
                          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-[#1ED760] text-black font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(30,215,96,0.2)] cursor-pointer select-none"
                        >
                          Iniciar Sesión
                        </button>
                      </div>
                    ) : supportChatMessages.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3.5">
                        <div className="p-4 bg-emerald-500/5 rounded-full border border-emerald-500/10 animate-pulse">
                          <MessageSquare className="w-8 h-8 text-[#1ED760]" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-[0.2em]">Soporte Premium en Vivo</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Canal Sincronizado</p>
                        </div>
                        <p className="text-[10.5px] text-slate-400 font-semibold leading-relaxed max-w-[280px]">
                          👋 ¡Hola! Escribe tu consulta o duda abajo. El equipo administrativo te responderá directamente aquí en tiempo real.
                        </p>
                      </div>
                    ) : (
                      supportChatMessages.map((msg: any) => {
                        const isReply = msg.isAdminReply;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[82%] ${isReply ? "self-start items-start" : "self-end items-end"}`}
                          >
                            {isReply && (
                              <div className="flex items-center gap-1.5 mb-1 pl-1">
                                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-widest">Soporte Flux</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#1ED760]" />
                              </div>
                            )}
                            <div
                              className={`p-3.5 rounded-[20px] text-xs font-semibold leading-relaxed ${
                                isReply
                                  ? "bg-white/[0.04] border border-white/5 text-slate-200 rounded-tl-none text-left"
                                  : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-tr-none text-left shadow-[0_4px_15px_rgba(16,185,129,0.1)]"
                              }`}
                            >
                              {msg.message}
                            </div>
                            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1 px-1">
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div ref={supportChatEndRef} />
                  </div>

                  {/* Chat Input Footer */}
                  {user && (
                    <div className="p-4.5 border-t border-white/5 bg-[#121214] shrink-0">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !isSendingSupport && supportMessage.trim()) {
                              handleSendSupportMessage();
                            }
                          }}
                          placeholder="Escribe tu consulta para soporte..."
                          maxLength={1000}
                          disabled={isSendingSupport}
                          className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-slate-600 outline-none focus:border-[#1ED760]/30 focus:bg-white/[0.04] transition-all font-semibold"
                        />
                        <button
                          disabled={isSendingSupport || !supportMessage.trim()}
                          onClick={handleSendSupportMessage}
                          className="p-3 bg-[#1ED760] disabled:opacity-30 text-black hover:bg-emerald-400 transition-all rounded-2xl cursor-pointer flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 shadow-[0_4px_10px_rgba(30,215,96,0.2)]"
                        >
                          {isSendingSupport ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 stroke-[2.5px]" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
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
