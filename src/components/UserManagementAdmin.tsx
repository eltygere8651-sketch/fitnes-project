import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { X, UserX, Shield } from "lucide-react";

export const UserManagementAdmin = ({ onClose }: { onClose: () => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

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

        <div className="overflow-y-auto p-6 flex-1 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
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
        </div>
      </div>
    </div>
  );
};
