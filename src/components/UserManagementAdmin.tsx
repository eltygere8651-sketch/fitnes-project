import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { X, UserX, Shield, CheckCircle, AlertTriangle, Trash, Send, Save, Key, MessageSquare } from "lucide-react";

export const UserManagementAdmin = ({ onClose }: { onClose: () => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  const [activeTab, setActiveTab] = useState<"users" | "support" | "notifications">("users");

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchTelegramConfig();
    fetchSupportMessages();
  }, []);

  const fetchSupportMessages = async () => {
    try {
      setLoadingMessages(true);
      const snap = await getDocs(collection(db, "support_messages"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setSupportMessages(list);
    } catch (e) {
      console.error("Error loaded support messages:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteSupportMessage = async (msgId: string) => {
    try {
      if (!window.confirm("¿Eliminar este mensaje de soporte?")) return;
      await deleteDoc(doc(db, "support_messages", msgId));
      fetchSupportMessages();
    } catch (err) {
      console.error("Error deleting support message:", err);
    }
  };

  const fetchTelegramConfig = async () => {
    try {
      const docRef = doc(db, "system_settings", "telegram");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const bToken = data.botToken || "";
        const cId = data.chatId || "";
        setTelegramToken(bToken);
        setTelegramChatId(cId);

        // Warm up backend cache with these credentials
        if (bToken && cId) {
          fetch("/api/support/register-telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              botToken: bToken.trim(),
              chatId: cId.trim(),
              adminEmail: "eltygere8651@gmail.com"
            })
          }).catch(err => console.error("Error warming up backend Telegram parameters:", err));
        }
      }
    } catch (e) {
      console.error("Error loading Telegram config:", e);
    }
  };

  const saveTelegramConfig = async () => {
    try {
      setIsSavingTelegram(true);
      const bToken = telegramToken.trim();
      const cId = telegramChatId.trim();

      const docRef = doc(db, "system_settings", "telegram");
      await setDoc(docRef, {
        botToken: bToken,
        chatId: cId,
        updatedAt: Date.now()
      });

      // Synchronize directly with the backend server as well
      await fetch("/api/support/register-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: bToken,
          chatId: cId,
          adminEmail: "eltygere8651@gmail.com"
        })
      });

      alert("¡Configuración de Telegram guardada y sincronizada correctamente!");
    } catch (e) {
      console.error(e);
      alert("Error al guardar la configuración.");
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const testTelegramConfig = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      alert("Por favor, llena los campos de Token y Chat ID antes de probar.");
      return;
    }
    try {
      setIsTestingTelegram(true);
      const testText = "🔔 *¡Conexión Exitosa!*\nEste es un mensaje de prueba desde tu aplicación *Flux Player*. Las solicitudes de acceso de 7 días te llegarán aquí.";
      
      const response = await fetch(`https://api.telegram.org/bot${telegramToken.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: testText,
          parse_mode: "Markdown"
        })
      });

      if (response.ok) {
        alert("¡Mensaje de prueba enviado con éxito a tu Telegram! Revisa tu chat.");
      } else {
        const errJson = await response.json();
        alert(`Error de Telegram: ${errJson.description || "Desconocido"}`);
      }
    } catch (err: any) {
      alert(`Error al enviar mensaje de prueba: ${err.message || err}`);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const snap = await getDocs(collection(db, "trial_requests"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(list);
    } catch (e) {
      console.error("Error loaded trial requests:", e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (req: any) => {
    try {
      if (!window.confirm(`¿Aprobar prueba de 7 días para ${req.email}?`)) return;
      
      await updateDoc(doc(db, "users", req.uid), {
        plan: "free",
        trialStart: Date.now(),
        subscriptionEnd: null
      });

      await updateDoc(doc(db, "trial_requests", req.id), {
        status: "approved"
      });

      alert("Acceso de prueba activado y solicitud aprobada con éxito!");
      fetchUsers();
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Error al aprobar la solicitud. Revisa si el usuario existe.");
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      if (!window.confirm("¿Rechazar esta solicitud de prueba?")) return;
      await updateDoc(doc(db, "trial_requests", reqId), {
        status: "rejected"
      });
      alert("Solicitud rechazada.");
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequestRecord = async (reqId: string) => {
    try {
      if (!window.confirm("¿Eliminar registro de esta solicitud?")) return;
      await deleteDoc(doc(db, "trial_requests", reqId));
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (e) {
      console.error(e);
      alert("Error al cargar usuarios. Verifica las reglas de Firestore.");
    } finally {
      setLoading(false);
    }
  };

  const grantTrial = async (userId: string) => {
    try {
      if (!window.confirm("¿Activar prueba de 7 días para este usuario?")) return;
      await updateDoc(doc(db, "users", userId), {
        plan: "free",
        trialStart: Date.now(),
        subscriptionEnd: null
      });
      alert("Prueba activada!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Error al activar prueba.");
    }
  };

  const updateSub = async (userId: string, plan: string, durationDays: number) => {
    try {
      if (!window.confirm(`Confirmar plan ${plan} para usuario?`)) return;
      const msPerDay = 1000 * 60 * 60 * 24;
      const subEnd = Date.now() + (durationDays * msPerDay);
      await updateDoc(doc(db, "users", userId), {
        plan,
        subscriptionEnd: subEnd
      });
      alert("Suscripción actualizada!");
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert("Error al actualizar la suscripción.");
    }
  };

  const removeSub = async (userId: string) => {
    try {
      if (!window.confirm("¿Remover suscripción y prueba de este usuario?")) return;
      await updateDoc(doc(db, "users", userId), {
        plan: "free",
        subscriptionEnd: null,
        trialStart: 0 // trial expired forever
      });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md font-sans">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-[#0d0d0f] border border-white/10 rounded-[28px] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col z-10 h-[85vh]">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400" />

        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-purple-400 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Panel Maestro de Suscripciones
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Gestiona el acceso y planes de los usuarios
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="flex border-b border-white/5 bg-white/[0.01] px-3 sm:px-6 py-2 gap-1 sm:gap-2 shrink-0 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
          <button
            onClick={() => setActiveTab("users")}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "users"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Usuarios <span className="hidden sm:inline">y Solicitudes</span></span>
            {requests.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                {requests.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "support"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Soporte</span>
            {supportMessages.length > 0 && (
              <span className="ml-1 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {supportMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "notifications"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Notificaciones</span>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
          {activeTab === "users" && (
            <>
              {/* SECCIÓN 1: SOLICITUDES DE PRUEBA PENDIENTES */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 mb-2 space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Solicitudes de Prueba de 7 Días ({requests.filter(r => r.status === "pending").length})
            </h3>
            
            {loadingRequests ? (
              <div className="text-xs text-slate-500 animate-pulse">Cargando solicitudes...</div>
            ) : requests.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No hay ninguna solicitud registrada actualmente.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r: any) => {
                  const duplicateFp = requests.filter(req => req.fingerprint === r.fingerprint && req.uid !== r.uid).length > 0;
                  const duplicateIp = requests.filter(req => req.ip === r.ip && req.uid !== r.uid && r.ip !== "N/A" && r.ip !== "IP_DETECTOR_FAILED").length > 0;
                  const isFlagged = duplicateFp || duplicateIp;

                  return (
                    <div key={r.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      r.status === "pending" 
                        ? isFlagged 
                          ? "bg-red-500/5 border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.05)]"
                          : "bg-emerald-500/5 border-emerald-500/10"
                        : "bg-white/[0.02] border-white/5 opacity-60"
                    }`}>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-black text-xs uppercase tracking-wide">{r.displayName || "Socio Premium"}</span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate">({r.email})</span>
                          
                          {r.status === "approved" && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[8.5px] font-black uppercase tracking-wider border border-emerald-500/10">Aprobado</span>
                          )}
                          {r.status === "rejected" && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[8.5px] font-black uppercase tracking-wider border border-red-500/10">Rechazado</span>
                          )}
                          {r.status === "pending" && (
                            <span className="px-2 py-0.5 bg-amber-500/25 text-amber-300 rounded-md text-[8.5px] font-black uppercase tracking-wider border border-amber-500/20 animate-pulse">Pendiente</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-mono text-slate-500">
                          <span>IP: <strong className={duplicateIp && r.status === "pending" ? "text-red-400 font-black animate-pulse" : "text-white/40"}>{r.ip || "N/A"}</strong></span>
                          <span>FINGERPRINT: <strong className={duplicateFp && r.status === "pending" ? "text-red-400 font-black" : "text-white/40"}>{r.fingerprint ? r.fingerprint.substring(0, 10) + "..." : "N/A"}</strong></span>
                          <span>SOLICITADO: <span className="text-white/20">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "N/A"}</span></span>
                        </div>

                        {isFlagged && r.status === "pending" && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5 animate-shake">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Alerta: ¡Posible Multicuenta o VPN con el mismo dispositivo detectado!</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(r)}
                              className="px-3 py-1.5 bg-[#1ED760] hover:bg-[#1fdf64] text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectRequest(r.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-red-500/20 cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRequestRecord(r.id)}
                          className="p-1.5 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all border border-white/5 cursor-pointer flex items-center justify-center"
                          title="Eliminar Registro"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </>
          )}

          {activeTab === "notifications" && (
            /* SECCIÓN NUEVA: CONFIGURACIÓN DE TELEGRAM */
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 mb-2 space-y-4">
            <h3 className="text-xs font-black uppercase text-[#1ED760] tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-[#1ED760]" /> Configurar Notificaciones en Telegram
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Conecta tu Bot de Telegram para recibir alertas en tiempo real cuando un nuevo usuario registre su cuenta de prueba de 7 días. Puedes aprobar el acceso directamente con un botón desde este panel.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                  Telegram Bot Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="Ej. 123456789:ABCdefGhIJKlmNoPQRsT"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 focus:border-[#1ED760] transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                  Telegram Chat ID
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">ID</span>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="Ej. -100123456789 o tu ID personal"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 focus:border-[#1ED760] transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={saveTelegramConfig}
                disabled={isSavingTelegram}
                className="px-4 py-2.5 bg-[#1ED760] hover:bg-[#1fdf64] text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4 animate-pulse hover:animate-none" />
                {isSavingTelegram ? "Guardando..." : "Guardar Configuración"}
              </button>
              
              <button
                onClick={testTelegramConfig}
                disabled={isTestingTelegram}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isTestingTelegram ? "Enviando..." : "Enviar Mensaje de Prueba"}
              </button>
            </div>
            
            <div className="bg-black/40 border border-white/5 p-3 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
              💡 <span className="text-slate-300 font-bold">Guía de Configuración Súper Rápida:</span><br/>
              1. Abre Telegram y escribe a <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#1ED760] hover:underline font-bold">@BotFather</a> para crear tu bot enviando <code className="text-[#1ED760] select-all font-mono">/newbot</code>. Copia el token que te dé.<br/>
              2. Obtén tu Chat ID escribiendo a <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-[#1ED760] hover:underline font-bold">@userinfobot</a>. Te dará tu ID personal numérico.<br/>
              3. ¡Asegúrate de pulsar <strong className="text-white">INICIAR</strong> en tu bot creado antes para que pueda enviarte mensajes!<br/>
              4. Introduce ambos datos arriba, pulsa <strong className="text-emerald-400">Guardar</strong> y luego <strong className="text-white">Enviar Mensaje de Prueba</strong>.
            </div>
          </div>
          )}

          {activeTab === "support" && (
            /* SECCIÓN NUEVA: MENSAJES DE SOPORTE */
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 mb-2 space-y-4">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-2">
              <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" /> Mensajes de Soporte Recibidos ({supportMessages.length})
              </h3>
              <button
                onClick={fetchSupportMessages}
                className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg text-slate-300 font-bold border border-white/5 cursor-pointer transition-all uppercase tracking-wider"
              >
                Actualizar
              </button>
            </div>

            {loadingMessages ? (
              <div className="text-xs text-slate-500 animate-pulse">Cargando mensajes de soporte...</div>
            ) : supportMessages.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No hay mensajes de soporte guardados en la base de datos.</p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/5">
                {supportMessages.map((msg: any) => (
                  <div key={msg.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-purple-500/20 transition-all">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-black text-xs uppercase tracking-wide">{msg.userName || "Anónimo"}</span>
                        <span className="text-[10px] text-slate-400 font-semibold truncate">({msg.userEmail || "Sin email"})</span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "N/A"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 bg-black/30 p-3 rounded-xl border border-white/[0.03] whitespace-pre-wrap leading-relaxed font-medium">
                        {msg.message}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSupportMessage(msg.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer shrink-0 self-end sm:self-start flex items-center justify-center animate-pulse hover:animate-none"
                      title="Eliminar Mensaje"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {activeTab === "users" && (
            <>
              <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2 pt-2 border-t border-white/5">
            <Shield className="w-4 h-4 text-purple-400" /> Todos los Usuarios Registrados ({users.length})
          </h3>

          {loading ? (
             <div className="text-center py-12 text-slate-500 text-sm font-medium animate-pulse">Cargando usuarios...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(u => {
                const now = Date.now();
                const msPerDay = 1000 * 60 * 60 * 24;
                let isActive = false;
                let statusText = "Sin acceso";
                
                if (u.email === "eltygere8651@gmail.com") {
                   isActive = true;
                   statusText = "Admin Maestro";
                } else if (u.subscriptionEnd && u.subscriptionEnd > now) {
                   isActive = true;
                   statusText = `Plan ${u.plan} activo (${Math.ceil((u.subscriptionEnd - now)/msPerDay)} días)`;
                } else if (u.plan === "free" && u.trialStart) {
                   const trialEnd = u.trialStart + 7 * msPerDay;
                   if (trialEnd > now) {
                     isActive = true;
                     statusText = `Prueba 7 días (${Math.ceil((trialEnd - now)/msPerDay)} días)`;
                   } else {
                     statusText = "Prueba finalizada";
                   }
                } else if (u.subscriptionEnd && u.subscriptionEnd < now) {
                   statusText = "Suscripción expirada";
                }

                return (
                  <div key={u.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                           <p className="text-white font-bold text-sm">{u.displayName || "Sin Nombre"}</p>
                           <p className="text-slate-400 text-xs">{u.email}</p>
                           <p className="text-[10px] text-slate-500 mt-1">ID: {u.id}</p>
                           
                           {/* Spotify-type allowed concurrent users/devices permission config */}
                           {u.email !== "eltygere8651@gmail.com" && (
                             <div className="mt-3 bg-black/40 border border-white/5 p-2 rounded-xl space-y-1.5">
                               <p className="text-[9px] font-black uppercase tracking-wider text-purple-400">Licencia de Usuarios:</p>
                               <div className="flex gap-1">
                                 {[1, 2, 6].map(num => (
                                   <button
                                     key={num}
                                     onClick={async () => {
                                       try {
                                         await updateDoc(doc(db, "users", u.id), { maxUsers: num });
                                         fetchUsers();
                                       } catch (e) {
                                         console.error(e);
                                       }
                                     }}
                                     className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all cursor-pointer ${
                                       (u.maxUsers || 1) === num
                                         ? "bg-purple-600 text-white shadow-md font-extrabold"
                                         : "bg-white/5 text-slate-400 hover:bg-white/10"
                                     }`}
                                   >
                                     {num === 1 ? "1 Usu." : num === 2 ? "2 Usu." : "Familiar (6)"}
                                   </button>
                                 ))}
                               </div>
                             </div>
                           )}
                        </div>
                        <div className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                           {statusText}
                        </div>
                     </div>

                     {u.email !== "eltygere8651@gmail.com" && (
                       <div className="flex flex-wrap gap-2 mt-auto">
                          <button onClick={() => grantTrial(u.id)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition-colors border border-emerald-500/20 cursor-pointer text-center">
                            Prueba 7 Días
                          </button>
                          <button onClick={() => updateSub(u.id, "1mo", 31)} className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold rounded-lg transition-colors border border-purple-500/20 cursor-pointer text-center">
                            31 Días
                          </button>
                          <button onClick={() => updateSub(u.id, "3mo", 90)} className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold rounded-lg transition-colors border border-blue-500/20 cursor-pointer text-center">
                            3 Meses
                          </button>
                          <button onClick={() => updateSub(u.id, "6mo", 180)} className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/30 text-green-300 text-[10px] font-bold rounded-lg transition-colors border border-green-500/20 cursor-pointer text-center">
                            6 Meses
                          </button>
                          <button onClick={() => updateSub(u.id, "12mo", 365)} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg transition-colors border border-amber-500/20 cursor-pointer text-center">
                            12 Meses
                          </button>
                          <button onClick={() => removeSub(u.id)} className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/30 text-red-300 text-[10px] font-bold rounded-lg transition-colors border border-red-500/20 ml-auto cursor-pointer">
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                       </div>
                     )}
                  </div>
                )
              })}
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
};
