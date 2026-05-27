import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { loginWithGoogle, loginWithEmail } from "../lib/firebase";
import { X, LogIn, Mail, Lock, Shield, Sparkles, Check, AlertCircle, Eye, EyeOff, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useFirebase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await loginWithGoogle();
      setAuthModalOpen(false);
    } catch (err: any) {
      console.error(err);
      const code = err?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setErrorMsg("Google cerró la ventana.");
        setIsLoading(false);
        return;
      }
      
      if (code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname;
        setErrorMsg(
          `DOMINIO NO AUTORIZADO: Debes añadir "${currentDomain}" a la lista de "Dominios Autorizados" en tu Consola de Firebase (Authentication -> Settings).`
        );
      } else {
        setErrorMsg(err?.message || "Error al iniciar sesión.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor, rellena todos los campos.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await loginWithEmail(email.trim(), password);
      setSuccessMsg("¡Sesión iniciada con éxito!");
      setTimeout(() => {
        setAuthModalOpen(false);
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err?.code || "";
      let friendlyMessage = "Error de autenticación.";

      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        friendlyMessage = "Correo o contraseña incorrectos.";
      } else if (code === "auth/invalid-email") {
        friendlyMessage = "Formato de correo electrónico no válido.";
      } else {
        friendlyMessage = err?.message || String(err);
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        id="auth-selection-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
      >
        {/* Backdrop transparent click area */}
        <div className="absolute inset-0" onClick={() => setAuthModalOpen(false)} />

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-[28px] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col z-10 max-h-[92vh]"
        >
          {/* Glow decoration */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

          {/* Modal Close */}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Header content (Static) */}
          <div className="p-6 pb-4 text-center shrink-0 border-b border-white/5">
            <h2 className="text-xl font-black uppercase tracking-wider text-emerald-400">
              ACCESO ADMINISTRADOR
            </h2>
            <p className="text-[11px] text-slate-400 mt-1 px-4 leading-relaxed font-bold">
              Introduce tus credenciales para gestionar el sistema.
            </p>
          </div>

          {/* Scrollable content container for perfect mobile/iOS viewport support */}
          <div className="overflow-y-auto px-6 pb-6 pt-4 space-y-4 max-h-[62vh] scrollbar-thin scrollbar-thumb-white/5 flex flex-col items-center">
            
            {/* Login Tab Display Only */}
            <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/[0.03] w-full mb-2">
              <div
                className="flex-1 py-2 px-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all text-center flex items-center justify-center gap-1 bg-emerald-500 text-black shadow-lg"
              >
                <Shield className="w-3.5 h-3.5 shrink-0" />
                <span>Iniciar Sesión</span>
              </div>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleEmailAction} className="space-y-4 pt-1 w-full">
              {/* Target alerts */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2">
                  <Check className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              {/* Form Fields: EMAIL */}
              <div className="space-y-1">
                <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase block pl-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#121214] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Form Fields: PASSWORD */}
              <div className="space-y-1">
                <div className="flex justify-between items-center pl-1">
                  <label className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#121214] border border-white/5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-all cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-emerald-500 text-black font-black uppercase tracking-wider text-[10px] rounded-xl hover:bg-white hover:text-black transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar al Sistema
                  </>
                )}
              </button>
            </form>

            {/* Separator bar */}
            <div className="relative flex py-1 items-center w-full">
              <div className="flex-grow border-t border-white/5" />
              <span className="flex-shrink mx-3 text-[8px] font-black uppercase text-slate-500 tracking-widest">
                O también con
              </span>
              <div className="flex-grow border-t border-white/5" />
            </div>

            {/* Google Sign-in trigger */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1 shrink-0 text-[#10b981]" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="text-[9px] text-slate-500 text-center flex items-center justify-center gap-1.5 bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Conexión segura SSL. Datos protegidos.</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
