import { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Flame, 
  Award, 
  CheckCircle, 
  Music, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Play, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Bell, 
  BookOpen,
  LogOut,
  User as UserIcon,
  LogIn
} from "lucide-react";
import AIPersonalizedRoutine from "./components/AIPersonalizedRoutine";
import TechGuide from "./components/TechGuide";
import AICoachChat from "./components/AICoachChat";
import ProgressTracker from "./components/ProgressTracker";
import GymMusicPlayer from "./components/GymMusicPlayer";
import MotivationalNotifications from "./components/MotivationalNotifications";
import { FirebaseProvider, useFirebase } from "./components/FirebaseProvider";
import { loginWithGoogle, logout } from "./lib/firebase";

type TabType = "routine" | "guide" | "chat" | "progress" | "notifications" | "music";

function AppContent() {
  const { user, loading: authLoading, isOnline } = useFirebase();
  const [activeTab, setActiveTab] = useState<TabType>("routine");
  const [activeStreak, setActiveStreak] = useState(4);
  const [caloriesBurned, setCaloriesBurned] = useState(300);
  const [exercisesCount, setExercisesCount] = useState(8);
  const [chatPrefilledExercise, setChatPrefilledExercise] = useState<string | null>(null);
  const [todayCompleted, setTodayCompleted] = useState<string[]>([]);

  useEffect(() => {
    const savedStreak = localStorage.getItem("gym_streak_count");
    if (savedStreak) setActiveStreak(parseInt(savedStreak));
    const savedCal = localStorage.getItem("gym_calories_burned");
    if (savedCal) setCaloriesBurned(parseInt(savedCal));
    const savedExCount = localStorage.getItem("gym_exercises_count");
    if (savedExCount) setExercisesCount(parseInt(savedExCount));
    const savedTodayComp = localStorage.getItem("gym_today_completed");
    if (savedTodayComp) {
      try {
        setTodayCompleted(JSON.parse(savedTodayComp));
      } catch (e) {}
    }
  }, []);

  const handleStreakUpdate = (count: number) => {
    setActiveStreak(count);
    localStorage.setItem("gym_streak_count", count.toString());
  };

  const handleExerciseCompletedSimulated = (calories: number) => {
    const nextCal = caloriesBurned + calories;
    const nextCount = exercisesCount + 1;
    setCaloriesBurned(nextCal);
    setExercisesCount(nextCount);
    localStorage.setItem("gym_calories_burned", nextCal.toString());
    localStorage.setItem("gym_exercises_count", nextCount.toString());
  };

  const handleAskCoachForExerciseName = (exerciseName: string) => {
    setChatPrefilledExercise(exerciseName);
    setActiveTab("chat");
  };

  const toggleTodayExercise = (exId: string) => {
    let next: string[];
    if (todayCompleted.includes(exId)) {
      next = todayCompleted.filter(e => e !== exId);
    } else {
      next = [...todayCompleted, exId];
      handleExerciseCompletedSimulated(75);
    }
    setTodayCompleted(next);
    localStorage.setItem("gym_today_completed", JSON.stringify(next));
  };

  return (
    <div id="clean-minimalist-app" className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      
      <nav className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              AI.TRAIN
            </span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl items-center gap-1 border border-slate-200/40">
          {[
            { id: "routine", label: "IA Rutinas", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "guide", label: "Guías", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "chat", label: "Coach", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: "progress", label: "Log", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: "notifications", label: "Alertas", icon: <Bell className="w-3.5 h-3.5" /> },
            { id: "music", label: "Bienve Music", icon: <Music className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-3 sm:px-4 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected ? "bg-white text-indigo-600 shadow-xs border border-slate-200" : "text-slate-500 hover:text-slate-900 bg-transparent"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 pl-4 sm:border-l border-slate-200">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black uppercase text-indigo-600 tracking-tighter">Conectado Cloud</p>
                <p className="text-xs font-black text-slate-800">{user.displayName || user.email?.split('@')[0]}</p>
              </div>
              <div className="relative group">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`} 
                  className="w-9 h-9 rounded-full ring-2 ring-indigo-50 shadow-sm object-cover" 
                  alt="avatar"
                />
                <button 
                  onClick={logout}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition shadow-sm opacity-0 group-hover:opacity-100"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={loginWithGoogle}
              disabled={authLoading}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>SYNC CLOUD</span>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {activeTab !== "music" && (
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center justify-between">
                <span>Constancia Semanal</span>
                <span className="text-xs text-indigo-600 font-mono font-bold">4 / 7 Días</span>
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                  {[{ tag: "L", h: "h-12" }, { tag: "M", h: "h-16" }, { tag: "M", h: "h-10" }, { tag: "J", h: "h-20", active: true }, { tag: "V", h: "h-3" }, { tag: "S", h: "h-3" }, { tag: "D", h: "h-3" }].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="h-20 w-3.5 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                        <div className={`w-full ${bar.h} ${bar.active ? "bg-indigo-600" : "bg-indigo-400 opacity-60"}`} />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400">{bar.tag}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 font-bold uppercase">Racha:</span>
                  <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    ⚡ {activeStreak} Días
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4.5 rounded-2xl border border-slate-250/60 shadow-xs text-center flex flex-col justify-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Calorías Totales</span>
                <span className="text-lg font-mono font-black text-slate-800 mt-1">{caloriesBurned} Kcal</span>
              </div>
              <div className="bg-white p-4.5 rounded-2xl border border-slate-250/60 shadow-xs text-center flex flex-col justify-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Ejercicios Hechos</span>
                <span className="text-lg font-mono font-black text-slate-800 mt-1">{exercisesCount} Ejs</span>
              </div>
            </div>
          </aside>
        )}

        <section className={`${activeTab === "music" ? "lg:col-span-12" : "lg:col-span-6"} flex flex-col gap-6 min-h-[500px]`}>
          <div className="bg-white rounded-[32px] overflow-hidden flex-1 shadow-xs border border-slate-200 p-6 flex flex-col">
            <div className="flex-1 relative">
              {activeTab === "routine" && <AIPersonalizedRoutine onAskCoachExercise={handleAskCoachForExerciseName} onWorkoutSuccess={handleExerciseCompletedSimulated} />}
              {activeTab === "guide" && <TechGuide onAskCoach={handleAskCoachForExerciseName} />}
              {activeTab === "chat" && <AICoachChat prefilledExercise={chatPrefilledExercise} onClosePrefill={() => setChatPrefilledExercise(null)} />}
              {activeTab === "progress" && <ProgressTracker onStreakUpdate={handleStreakUpdate} onWorkoutLogged={() => handleExerciseCompletedSimulated(75)} />}
              {activeTab === "notifications" && <MotivationalNotifications activeStreak={activeStreak} />}
              
              <div className={activeTab === "music" ? "h-full" : "pointer-events-none absolute inset-0 opacity-0 -z-10"}>
                <GymMusicPlayer />
              </div>
            </div>
          </div>
          
          {activeTab !== "music" && (
            <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-pulse">
                  <Music className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-emerald-600">Bienve Music Activo</span>
                  <p className="text-[10px] text-emerald-800 font-bold truncate max-w-[150px]">Pulsa en la pestaña Focus para controlar</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("music")}
                className="text-[9px] font-black bg-white border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition"
              >
                ABRIR PLAYER
              </button>
            </div>
          )}
        </section>

        {activeTab !== "music" && (
          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hoy Entrenas:</h3>
                  <span className="text-[10px] font-mono leading-none py-1 px-2 rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-150 text-center">Fullbody</span>
                </div>
                <div className="space-y-4">
                  {[{ id: "ex1", name: "Calentamiento Pro", desc: "Movilidad articular" }, { id: "ex2", name: "Sentadilla Copa", desc: "Forma vertical" }, { id: "ex3", name: "Flexiones Soporte", desc: "Codos adentro" }, { id: "ex4", name: "Bicho Muerto Core", desc: "Ombligo adentro" }, { id: "ex5", name: "Plancha Apoyos", desc: "Espalda paralela" }].map((item) => {
                    const isChecked = todayCompleted.includes(item.id);
                    return (
                      <div key={item.id} className={`relative pl-8 border-l-2 transition-all ${isChecked ? "border-indigo-600 opacity-60" : "border-slate-200"}`}>
                        <button onClick={() => toggleTodayExercise(item.id)} className={`absolute -left-[9px] top-0 w-4.5 h-4.5 rounded-full ring-4 ring-white transition flex items-center justify-center ${isChecked ? "bg-indigo-600 text-white" : "bg-slate-200 text-transparent"}`}><span className="text-[8px] font-bold">✓</span></button>
                        <div className="cursor-pointer select-none" onClick={() => toggleTodayExercise(item.id)}>
                          <p className={`text-[10px] font-black tracking-tight ${isChecked ? "text-indigo-600" : "text-slate-400"}`}>{isChecked ? "COMPLETADO" : "PENDIENTE"}</p>
                          <p className="text-xs font-black text-slate-800 mt-0.5">{item.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 leading-none">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      <footer className="py-8 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          <p>© 2026 AI.TRAIN • BIENVE MUSIC ENGINE</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <span className="text-slate-250">|</span>
            <span className="text-indigo-600">{user ? user.email : "GUEST MODE"}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
