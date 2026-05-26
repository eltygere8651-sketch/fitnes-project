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
  BookOpen 
} from "lucide-react";
import AIPersonalizedRoutine from "./components/AIPersonalizedRoutine";
import TechGuide from "./components/TechGuide";
import AICoachChat from "./components/AICoachChat";
import ProgressTracker from "./components/ProgressTracker";
import GymMusicPlayer from "./components/GymMusicPlayer";
import MotivationalNotifications from "./components/MotivationalNotifications";

type TabType = "routine" | "guide" | "chat" | "progress" | "notifications" | "music";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("routine");
  const [activeStreak, setActiveStreak] = useState(4); // Default to encouraging start
  const [caloriesBurned, setCaloriesBurned] = useState(300);
  const [exercisesCount, setExercisesCount] = useState(8);
  const [chatPrefilledExercise, setChatPrefilledExercise] = useState<string | null>(null);
  const [todayCompleted, setTodayCompleted] = useState<string[]>([]);

  // Synchronize on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem("gym_streak_count");
    if (savedStreak) {
      setActiveStreak(parseInt(savedStreak));
    } else {
      localStorage.setItem("gym_streak_count", "4");
    }
    const savedCal = localStorage.getItem("gym_calories_burned");
    if (savedCal) {
      setCaloriesBurned(parseInt(savedCal));
    } else {
      localStorage.setItem("gym_calories_burned", "300");
    }
    const savedExCount = localStorage.getItem("gym_exercises_count");
    if (savedExCount) {
      setExercisesCount(parseInt(savedExCount));
    } else {
      localStorage.setItem("gym_exercises_count", "8");
    }
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
      
      {/* 1. Clean Minimalism Top Navigation Bar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs gap-4">
        {/* Brand Logo Group */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-800 flex items-center gap-1">
              AI.TRAIN <span className="text-indigo-600 font-semibold text-xs tracking-wider bg-indigo-50 px-2 py-0.5 rounded">BETA</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Asistencia Antilesiones & Rutinas a Medida</p>
          </div>
        </div>

        {/* Desktop Central Menu Tabs Integration */}
        <div className="flex bg-slate-100 p-1 rounded-xl items-center gap-1 border border-slate-200/40">
          {[
            { id: "routine", label: "Rutinas IA", icon: <Layers className="w-3.5 h-3.5" /> },
            { id: "guide", label: "Videoguías", icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: "chat", label: "Coach Técnico", icon: <MessageSquare className="w-3.5 h-3.5" /> },
            { id: "progress", label: "Mi Log", icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: "notifications", label: "Postural IA", icon: <Bell className="w-3.5 h-3.5" /> },
            { id: "music", label: "Música Sintonía", icon: <Music className="w-3.5 h-3.5" /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-btn-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  // Sound interactive feedback click behavior
                  try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const g = ctx.createGain();
                    osc.connect(g);
                    g.connect(ctx.destination);
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(600, ctx.currentTime);
                    g.gain.setValueAtTime(0.01, ctx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                  } catch (e) {}
                }}
                className={`py-2 px-3 sm:px-4 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-white text-indigo-600 shadow-xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-900 bg-transparent border border-transparent"
                }`}
              >
                {tab.icon}
                <span className="hidden leading-none md:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Corner Profile Segment */}
        <div className="flex items-center gap-4 pl-4 border-t sm:border-t-0 sm:border-l border-slate-200">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AMATEUR LVL 4</p>
            <p className="text-sm font-bold text-slate-800">Carlos Mendez</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-inner">
            CM
          </div>
        </div>
      </nav>

      {/* 2. Main High-Contrast Dynamic Clean Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hand Column: Playlist and Quick Weekly Progress */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Progress Card widget */}
          <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 mb-3 flex items-center justify-between">
              <span>Constancia Semanal</span>
              <span className="text-xs text-indigo-600 font-mono font-bold font-semibold">4 / 7 Días</span>
            </h3>

            <div className="flex flex-col gap-4">
              {/* Daily Streak visual graphic bars */}
              <div className="flex justify-between items-end bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                {[
                  { tag: "L", h: "h-12" },
                  { tag: "M", h: "h-16" },
                  { tag: "M", h: "h-10" },
                  { tag: "J", h: "h-20", active: true },
                  { tag: "V", h: "h-3" },
                  { tag: "S", h: "h-3" },
                  { tag: "D", h: "h-3" },
                ].map((bar, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-20 w-3.5 bg-slate-100 rounded-full overflow-hidden flex flex-col justify-end">
                      <div className={`w-full ${bar.h} ${bar.active ? "bg-indigo-600" : "bg-indigo-400 opacity-60"}`} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400">{bar.tag}</span>
                  </div>
                ))}
              </div>

              {/* Weekly text details */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Racha de Hoy:</span>
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  ⚡ {activeStreak} Días Seguidos
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Block */}
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

          {/* Quick Embedded Music list from design mockup */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl flex-1 flex flex-col justify-between shadow-lg relative overflow-hidden group">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-white">
              <Music className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Training Mix</h3>
              <span className="text-[10px] font-mono bg-indigo-650 px-2 py-0.5 rounded text-indigo-300">PHONK</span>
            </div>

            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center gap-3 bg-slate-850/60 p-2 rounded-xl">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs">🎧</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Endurance Phonk</p>
                  <p className="text-[10px] text-slate-500">Aesthetic Beats</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              </div>

              <div className="flex items-center gap-3 opacity-60 p-1">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs">💪</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Push It Limit</p>
                  <p className="text-[10px] text-slate-550">Electronic Mix</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between font-mono text-slate-400 text-[10px] mb-1.5">
                <span>02:45</span>
                <span>-01:15</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full w-full mb-3 overflow-hidden">
                <div className="h-full bg-indigo-500 w-2/3" />
              </div>
              
              <button 
                onClick={() => setActiveTab("music")}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Abrir Sintonizador Completo →
              </button>
            </div>
          </div>

        </aside>

        {/* Center: Dynamic Workout Canvas */}
        <section className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Active Tab render frame inside standard high quality white card container */}
          <div className="bg-white rounded-[32px] overflow-hidden flex-1 shadow-xs border border-slate-200 p-6 flex flex-col justify-between">
            <div className="flex-1">
              {activeTab === "routine" && (
                <AIPersonalizedRoutine 
                  onAskCoachExercise={handleAskCoachForExerciseName} 
                  onWorkoutSuccess={handleExerciseCompletedSimulated} 
                />
              )}

              {activeTab === "guide" && (
                <TechGuide 
                  onAskCoach={handleAskCoachForExerciseName} 
                />
              )}

              {activeTab === "chat" && (
                <AICoachChat 
                  prefilledExercise={chatPrefilledExercise} 
                  onClosePrefill={() => setChatPrefilledExercise(null)} 
                />
              )}

              {activeTab === "progress" && (
                <ProgressTracker 
                  onStreakUpdate={handleStreakUpdate} 
                  onWorkoutLogged={() => handleExerciseCompletedSimulated(75)} 
                />
              )}

              {activeTab === "notifications" && (
                <MotivationalNotifications 
                  activeStreak={activeStreak} 
                />
              )}

              {activeTab === "music" && (
                <GymMusicPlayer />
              )}
            </div>
          </div>

          {/* Assistant Action Advice Notification Box */}
          <div className="bg-indigo-50 border border-indigo-150 p-4.5 rounded-3xl flex items-center gap-4 shadow-3xs.">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                <strong>Coach AI:</strong> &quot;¡Gran rutina planada para ti Carlos! Mantén los talones firmes en las sentadillas y cuida el ángulo de flexión a 45 grados. ¡Tu seguridad biomecánica hace al campeón!&quot;
              </p>
            </div>
          </div>

        </section>

        {/* Right Hand Column: Today's Interactive Exercise Checkpoints List */}
        <aside className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hoy Entrenas:</h3>
                <span className="text-[10px] font-mono leading-none py-1 px-2 rounded-full bg-slate-100 text-slate-500 font-semibold border border-slate-150">
                  Fullbody
                </span>
              </div>

              {/* Dynamic exercise completion checkboxes list */}
              <div className="space-y-4">
                {[
                  { id: "ex1", name: "Calentamiento Pro", desc: "Movilidad articular • 5 min" },
                  { id: "ex2", name: "Sentadilla Copa", desc: "Forma vertical • 3 sets x 12" },
                  { id: "ex3", name: "Flexiones Soporte", desc: "Codos adentro • 3 sets x 10" },
                  { id: "ex4", name: "Bicho Muerto Core", desc: "Ombligo adentro • 3 sets x 8" },
                  { id: "ex5", name: "Plancha Apoyos", desc: "Espalda paralela • 2 sets x 45s" },
                ].map((item) => {
                  const isChecked = todayCompleted.includes(item.id);
                  return (
                    <div 
                      key={item.id} 
                      className={`relative pl-8 border-l-2 transition-all ${
                        isChecked ? "border-indigo-600 opacity-60" : "border-slate-200"
                      }`}
                    >
                      {/* Checkbox connector indicator */}
                      <button
                        id={`btn-sidebar-check-${item.id}`}
                        onClick={() => toggleTodayExercise(item.id)}
                        className={`absolute -left-[9px] top-0 w-4.5 h-4.5 rounded-full ring-4 ring-white transition flex items-center justify-center ${
                          isChecked ? "bg-indigo-600 text-white" : "bg-slate-200 text-transparent"
                        }`}
                      >
                        <span className="text-[8px] font-bold">✓</span>
                      </button>

                      <div className="cursor-pointer select-none" onClick={() => toggleTodayExercise(item.id)}>
                        <p className={`text-[11px] font-bold ${isChecked ? "text-indigo-600" : "text-slate-400"}`}>
                          {isChecked ? "COMPLETADO" : "PENDIENTE"}
                        </p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{item.name}</p>
                        <p className="text-[10px] text-slate-550">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50">
                <p className="text-[9px] font-bold text-slate-450 uppercase mb-1.5 tracking-wider">Cita de Hoy</p>
                <p className="text-xs italic text-slate-600 leading-relaxed font-serif">
                  &quot;El éxito no es más que la suma de pequeños esfuerzos repetidos día tras día.&quot;
                </p>
              </div>
            </div>
          </div>
        </aside>

      </main>

      {/* 3. High Fidelity Clean Minimalism Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center mt-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-2 text-[11px] text-slate-450">
          <p className="font-medium text-slate-500">
            © 2026 AI.TRAIN - Entrenamiento Profesional & Ergonomía Inteligente.
          </p>
          <div className="flex items-center gap-3 font-mono">
            <span className="flex items-center gap-1 text-slate-600">
              Powered by Gemini & Antigravity
            </span>
            <span className="text-slate-350">|</span>
            <span className="text-indigo-600 font-semibold uppercase">Clean Minimalism Theme</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
