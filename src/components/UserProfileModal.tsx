import React, { useState } from "react";
import { useFirebase } from "./FirebaseProvider";
import { auth, db } from "../lib/firebase";
import { 
  updateProfile, 
  updateEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  Calendar, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserProfileModalProps {
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const { user, accessData } = useFirebase();

  // Basic form states
  const [nickname, setNickname] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  
  // Re-auth requirements
  const [showReauth, setShowReauth] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [reauthError, setReauthError] = useState<string | null>(null);

  // Layout states
  const [showPass, setShowPass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!user) return null;

  // Check if provider is Google
  const isGoogleProvider = user.providerData?.some(
    (provider) => provider.providerId === "google.com"
  );

  const getTrialOrPlanName = () => {
    if (user.email === "eltygere8651@gmail.com") return "Administrador Supremo";
    if (accessData?.plan === "free") return "Prueba de 7 Días";
    if (accessData?.plan === "1mo") return "Plan Mensual Premium";
    if (accessData?.plan === "3mo") return "Plan Trimestral Premium";
    if (accessData?.plan === "6mo") return "Plan Semestral Premium";
    if (accessData?.plan === "12mo") return "Plan Anual Premium";
    return "Socio Premium";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setErrorMsg("El nombre de usuario no puede estar vacío");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // 1. Update nickname (DisplayName)
      if (nickname.trim() !== (user.displayName || "")) {
        await updateProfile(user, { displayName: nickname.trim() });
        
        // Also update the Firestore user doc
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          displayName: nickname.trim()
        });
      }

      // Check if critical credentials (email or password) are being updated
      const isEmailChanged = email.trim().toLowerCase() !== (user.email || "").toLowerCase() && !isGoogleProvider;
      const isPasswordChanged = newPassword.trim().length > 0 && !isGoogleProvider;

      if (isEmailChanged || isPasswordChanged) {
        // These can trigger auth/requires-recent-login
        try {
          if (isEmailChanged) {
            await updateEmail(user, email.trim());
            // Update Firestore doc email representation
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              email: email.trim()
            });
          }

          if (isPasswordChanged) {
            if (newPassword.trim().length < 6) {
              throw new Error("weak-password");
            }
            await updatePassword(user, newPassword.trim());
          }
        } catch (authError: any) {
          console.warn("Critical change auth error", authError);
          const errorCode = authError?.code || "";
          
          if (errorCode === "auth/requires-recent-login" || authError?.message?.includes("recent-login")) {
            // Need re-authentication
            setShowReauth(true);
            setIsLoading(false);
            return;
          } else if (errorCode === "auth/weak-password" || authError?.message === "weak-password") {
            setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
            setIsLoading(false);
            return;
          } else if (errorCode === "auth/invalid-email") {
            setErrorMsg("La dirección de correo electrónico es inválida.");
            setIsLoading(false);
            return;
          } else if (errorCode === "auth/email-already-in-use") {
            setErrorMsg("Esta dirección de correo ya se encuentra registrada por otro usuario.");
            setIsLoading(false);
            return;
          } else {
            throw authError;
          }
        }
      }

      setSuccessMsg("¡Tu perfil ha sido actualizado con éxito!");
      setNewPassword("");
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      console.error("Profile change failed:", err);
      setErrorMsg(err?.message || "Ocurrió un error al actualizar tus datos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReauthenticateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setReauthError("Por favor ingresa tu contraseña de seguridad actual.");
      return;
    }

    setIsLoading(true);
    setReauthError(null);

    try {
      const emailCredential = EmailAuthProvider.credential(user.email || "", currentPassword);
      await reauthenticateWithCredential(user, emailCredential);
      
      // Successfully re-authenticated, continue changes!
      const isEmailChanged = email.trim().toLowerCase() !== (user.email || "").toLowerCase();
      const isPasswordChanged = newPassword.trim().length > 0;

      if (isEmailChanged) {
        await updateEmail(user, email.trim());
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          email: email.trim()
        });
      }

      if (isPasswordChanged) {
        await updatePassword(user, newPassword.trim());
      }

      if (nickname.trim() !== (user.displayName || "")) {
        await updateProfile(user, { displayName: nickname.trim() });
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          displayName: nickname.trim()
        });
      }

      setSuccessMsg("¡Credenciales re-verificadas y perfil actualizado con éxito!");
      setShowReauth(false);
      setCurrentPassword("");
      setNewPassword("");

      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (e: any) {
      console.error("Re-authentication failed:", e);
      const code = e?.code || "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setReauthError("Contraseña incorrecta. Por favor vuelve a intentarlo.");
      } else {
        setReauthError(e?.message || "Error al verificar la seguridad.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        id="profile-custom-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md"
      >
        <div className="absolute inset-0 z-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-[30px] overflow-hidden shadow-[0_0_80px_rgba(30,215,96,0.12)] flex flex-col z-10 max-h-[92vh]"
        >
          {/* Top aesthetic green ribbon */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-emerald-500 via-[#1ED760] to-teal-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main Content Area */}
          <div className="p-6 overflow-y-auto premium-scrollbar flex-1">
            {!showReauth ? (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Visual Avatar Header */}
                <div className="flex flex-col items-center text-center pb-4 pt-1 border-b border-white/5">
                  <div className="relative w-18 h-18 bg-gradient-to-tr from-emerald-500 to-[#1ED760] rounded-full flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-black/40 mb-3 select-none">
                    <span>
                      {nickname.trim() ? nickname.trim().substring(0, 2).toUpperCase() : "U"}
                    </span>
                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-black border border-white/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-[#1ED760]" />
                    </span>
                  </div>
                  <h2 className="text-white text-base font-black tracking-tight">{nickname || "Usuario Premium"}</h2>
                  <p className="text-[10px] uppercase font-bold text-slate-500 mt-0.5 tracking-wider truncate max-w-xs">{user.email}</p>
                </div>

                {/* Subscription Status Panel */}
                <div className="bg-[#121214] border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tipo de Membresía</p>
                      <p className="text-xs font-black text-emerald-400 mt-0.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#1ED760]" />
                        {getTrialOrPlanName()}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-[#1ED760]/10 text-[#1ED760] border border-[#1ED760]/20 rounded-full">
                      PREMIO ACTIVO
                    </span>
                  </div>

                  <div className="border-t border-white/[0.03] pt-3 flex items-center gap-3">
                    <Calendar className="w-4.5 h-4.5 text-slate-500" />
                    <div className="text-left">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tiempo disponible</p>
                      <p className="text-xs font-bold text-white mt-0.5">
                        {accessData?.daysRemaining !== undefined 
                          ? `${accessData.daysRemaining} días restantes` 
                          : "Calculando..."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  {/* Nickname / Display Name */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[#1ED760] px-1">
                      Nombre / Nickname
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Ingresa tu nickname..."
                        className="w-full pl-11 pr-4 py-2.5 bg-[#121214] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1 flex justify-between items-center">
                      <span>Correo Electrónico</span>
                      {isGoogleProvider && (
                        <span className="text-[9px] text-[#1ED760] normal-case font-bold bg-[#1ED760]/5 border border-[#1ED760]/10 px-2 py-0.5 rounded">
                          Cuenta Google
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full pl-11 pr-4 py-2.5 bg-[#121214] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isGoogleProvider}
                      />
                    </div>
                    {isGoogleProvider && (
                      <p className="text-[9.5px] text-slate-500 leading-relaxed font-semibold px-1 pt-1">
                        Las cuentas de Google requieren cambiar el correo en su panel correspondiente de Google.
                      </p>
                    )}
                  </div>

                  {/* Password Modification (Not for Google accounts) */}
                  {!isGoogleProvider && (
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-1">
                        Nueva Contraseña (Opcional)
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                        <input
                          type={showPass ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres (Dejar vacío para mantener)"
                          className="w-full pl-11 pr-11 py-2.5 bg-[#121214] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 transition-all font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3.5 top-3 hover:text-white text-slate-500 transition-colors"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4 cursor-pointer" />
                          ) : (
                            <Eye className="w-4 h-4 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Alerts / Error messages */}
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 bg-[#1ED760]/10 border border-[#1ED760]/20 text-[#1ED760] text-[10px] font-bold rounded-xl flex items-start gap-2 text-left">
                    <Check className="w-4 h-4 text-[#1ED760] shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 font-black uppercase text-[10px] rounded-xl tracking-wider transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2.5 bg-[#1ED760] hover:bg-[#1fdf64] disabled:bg-opacity-50 text-black font-black uppercase text-[10px] rounded-xl tracking-wider shadow-[0_5px_15px_rgba(30,215,96,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    ) : (
                      <span>Guardar</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Re-Authentication Required Form */
              <form onSubmit={handleReauthenticateAndSave} className="space-y-4 pt-2">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-400 border border-amber-500/20 mx-auto select-none">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <h3 className="text-white text-sm font-black uppercase tracking-wider">Confirmar Seguridad</h3>
                  <p className="text-slate-400 text-[10.5px] leading-relaxed font-semibold">
                    Para realizar cambios de seguridad críticos (como modificar tu contraseña o tu correo), 
                    es necesario confirmar tu identidad volviendo a ingresar tu contraseña actual.
                  </p>
                </div>

                <div className="space-y-1.5 text-left pt-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#1ED760] px-1">
                    Tu contraseña actual
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Ingrese su contraseña actual..."
                      className="w-full pl-11 pr-11 py-2.5 bg-[#121214] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 transition-all font-semibold"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-3 hover:text-white text-slate-500 transition-colors"
                    >
                      {showCurrentPass ? (
                        <EyeOff className="w-4 h-4 cursor-pointer" />
                      ) : (
                        <Eye className="w-4 h-4 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>

                {reauthError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{reauthError}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReauth(false);
                      setCurrentPassword("");
                      setReauthError(null);
                    }}
                    className="flex-1 py-1.5 border border-white/10 hover:bg-white/5 text-slate-300 font-extrabold uppercase text-[10px] rounded-xl tracking-wider transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-1.5 bg-[#1ED760] hover:bg-[#1fdf64] disabled:bg-opacity-50 text-black font-extrabold uppercase text-[10px] rounded-xl tracking-wider shadow-[0_5px_15px_rgba(30,215,96,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 animate-spin" />
                    ) : (
                      <span>Verificar y Guardar</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
