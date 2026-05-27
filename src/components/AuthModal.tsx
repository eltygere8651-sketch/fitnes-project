import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { loginWithGoogle, loginWithEmail, signupWithEmail } from "../lib/firebase";
import { X, LogIn, Mail, Lock, Shield, Sparkles, Check, AlertCircle, Eye, EyeOff } from "lucide-react";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen } = useFirebase();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
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
      setErrorMsg(err?.message || "Error al iniciar sesión con Google.");
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
    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (activeTab === "login") {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg("¡Sesión iniciada con éxito!");
        setTimeout(() => {
          setAuthModalOpen(false);
        }, 1200);
      } else {
        await signupWithEmail(email.trim(), password);
        setSuccessMsg("¡Cuenta creada y sesión iniciada con éxito!");
        setTimeout(() => {
          setAuthModalOpen(false);
        }, 1200);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const code = err?.code || "";
      let friendlyMessage = "Error de autenticación.";

      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        friendlyMessage = "Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta.";
      } else if (code === "auth/email-already-in-use") {
        friendlyMessage = "Este correo ya está registrado. Intenta iniciar sesión en su lugar.";
      } else if (code === "auth/weak-password") {
        friendlyMessage = "Contraseña muy débil. Debe tener al menos 6 caracteres.";
      } else if (code === "auth/invalid-email") {
        friendlyMessage = "Formato de correo electrónico no válido.";
      } else if (code === "auth/operation-not-allowed") {
        friendlyMessage = "El inicio de sesión por Correo/Contraseña no está habilitado en tu consola de Firebase. Debes activarlo en Authentication -> Sign-in Method.";
      } else {
        friendlyMessage = err?.message || String(err);
      }
      setErrorMsg(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth-selection-modal" className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col">
        {/* Glow decoration */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

        {/* Modal Close */}
        <div className="absolute top-5 right-5 z-10 animate-pulse-slow">
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Header content */}
        <div className="p-8 pb-4 text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider text-white">
            Conectar Cuenta
          </h2>
          <p className="text-xs text-slate-400 mt-1.5 px-4">
            Inicia sesión para gestionar todas tus playlists y sincronizar tu música en cualquier dispositivo.
          </p>
        </div>

        {/* Tabs picker */}
        <div className="px-8 pb-1">
          <div className="flex bg-white/5 p-1 rounded-xl gap-1 border border-white/[0.03]">
            <button
              onClick={() => {
                setActiveTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setActiveTab("register");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="p-8 pt-4 space-y-6">
          <form onSubmit={handleEmailAction} className="space-y-4">
            {/* Target alerts */}
            {errorMsg && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-start gap-2.5">
                <Check className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
                <span className="leading-tight">{successMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-black tracking-widest text-slate-500 uppercase block pl-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#131315] border border-white/5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[9px] font-black tracking-widest text-slate-500 uppercase block">
                  Contraseña
                </label>
                {activeTab === "register" && (
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">
                    Mín. 6 chars
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#131315] border border-white/5 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-500 text-black font-black uppercase tracking-wider text-[11px] rounded-xl hover:bg-white hover:text-black transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {activeTab === "login" ? "Iniciar Sesión" : "Registrarse y Conectar"}
                </>
              )}
            </button>
          </form>

          {/* Separator bar */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/5" />
            <span className="flex-shrink mx-4 text-[9px] font-black uppercase text-slate-500 tracking-widest">
              O conéctate con
            </span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          {/* Google Sign-in trigger */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
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
            Google Identity
          </button>

          <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encriptación segura certificada SSL de extremo a extremo.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
