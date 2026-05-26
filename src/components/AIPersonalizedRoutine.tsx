import { useState, useEffect } from "react";
import { Dumbbell, Calendar, RotateCcw, Sparkles, CheckSquare, ChevronRight, PlayCircle, Star, Info, HelpCircle } from "lucide-react";
import { AIRoutineResponse, Exercise } from "../types";

export default function AIPersonalizedRoutine({ 
  onAskCoachExercise, 
  onWorkoutSuccess 
}: { 
  onAskCoachExercise: (name: string) => void;
  onWorkoutSuccess: (calories: number) => void;
}) {
  const [objective, setObjective] = useState("Hipertrofia / Ganar Músculo");
  const [experience, setExperience] = useState("Amateur / Principiante");
  const [equipment, setEquipment] = useState("Mancuernas y Peso Corporal");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [muscleGroups, setMuscleGroups] = useState("Cuerpo Completo (Fullbody)");
  const [bodyweight, setBodyweight] = useState("75");
  const [age, setAge] = useState("25");

  const [routine, setRoutine] = useState<AIRoutineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Load active routine from localStorage if exists
  useEffect(() => {
    const savedRoutine = localStorage.getItem("gym_active_routine");
    if (savedRoutine) {
      try {
        setRoutine(JSON.parse(savedRoutine));
      } catch (e) {}
    }
    const savedCompleted = localStorage.getItem("gym_completed_exercises");
    if (savedCompleted) {
      try {
        setCompletedExercises(JSON.parse(savedCompleted));
      } catch (e) {}
    }
  }, []);

  const handleGenerateRoutine = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ai/routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          experience,
          equipment,
          daysPerWeek,
          muscleGroups,
          bodyweight,
          age
        })
      });

      const data = await response.json();
      setRoutine(data);
      localStorage.setItem("gym_active_routine", JSON.stringify(data));
      
      // Reset checklist
      setCompletedExercises([]);
      localStorage.setItem("gym_completed_exercises", JSON.stringify([]));

    } catch (err) {
      console.error("Error generating routine:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("¿Seguro que deseas borrar tu plan actual y configurar uno nuevo con la IA?")) {
      setRoutine(null);
      localStorage.removeItem("gym_active_routine");
      setCompletedExercises([]);
      localStorage.removeItem("gym_completed_exercises");
    }
  };

  const handleToggleExercise = (exName: string) => {
    let next: string[];
    const isNowCompleted = !completedExercises.includes(exName);
    
    if (isNowCompleted) {
      next = [...completedExercises, exName];
      // Trigger callback with simulated calories burned
      onWorkoutSuccess(75); // 75 calories computed per exercise finished
    } else {
      next = completedExercises.filter(e => e !== exName);
    }
    setCompletedExercises(next);
    localStorage.setItem("gym_completed_exercises", JSON.stringify(next));
  };

  return (
    <div id="ai-personalized-routine-container" className="space-y-6 animate-fadeIn">
      {/* 1. Generator Settings Form */}
      {!routine && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-bold text-slate-800">Generador de Rutinas con Inteligencia Artificial</h2>
              <p className="text-xs text-slate-400">Diseñado idealmente para amateurs. Consigue postura perfecta y distribución saludable.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            
            {/* Objective selection */}
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tu Objetivo Físico</label>
              <select
                value={objective}
                id="select-objective"
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Hipertrofia / Ganar Músculo">💪 Hipertrofia (Ganar Masa y Fuerza)</option>
                <option value="Pérdida de Grasa / Quemar Calorías">🔥 Pérdida de Grasa (Acondicionamiento)</option>
                <option value="Tonificación y Resistencia">⚡ Tonificación y Resistencia Muscular</option>
                <option value="Fuerza y Rendimiento Funcional">🏋️‍♂️ Fuerza Básica y Resistencia Core</option>
              </select>
            </div>

            {/* Level Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tu Diferencial de Fuerza / Nivel</label>
              <select
                value={experience}
                id="select-experience"
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Amateur / Principiante">Amateur / Principiante (Técnicas sencillas y seguras)</option>
                <option value="Médio / Intermedio">Medio / Intermedio (Manejas peso libre estable)</option>
                <option value="Avanzado">Avanzado / Conductor (Rango completo y altas cargas)</option>
              </select>
            </div>

            {/* Equipment selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Equipamiento Disponible</label>
              <select
                value={equipment}
                id="select-equipment"
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Mancuernas y Peso Corporal">Mancuernas, Bandas y Peso Corporal (Casa / Gym Ligero)</option>
                <option value="Gimnasio Completo">Gimnasio Completo (Máquinas, poleas y barras olímpicas)</option>
                <option value="Solo Peso Corporal / Calistenia">Solo Peso Corporal / Calistenia (Sin pesas)</option>
              </select>
            </div>

            {/* Days selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frecuencia Semanal Deseada</label>
              <select
                value={daysPerWeek}
                id="select-days"
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value={2}>2 días a la semana (Full-body simplificado)</option>
                <option value={3}>3 días a la semana (Empuje/Tracción completo - RECOMENDADO)</option>
                <option value={4}>4 días a la semana (Rutina dividida Torso/Pierna)</option>
                <option value={5}>5 días a la semana (Régimen avanzado de alta frecuencia)</option>
              </select>
            </div>

            {/* Target muscular selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grupos Musculares Priorizados</label>
              <select
                value={muscleGroups}
                id="select-muscles"
                onChange={(e) => setMuscleGroups(e.target.value)}
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Cuerpo Completo (Fullbody)">Todo el Cuerpo (Fullbody - Balanceado)</option>
                <option value="Brazos y Pectorales">Tren Superior (Pecho, Espalda, Hombros, Brazos)</option>
                <option value="Glúteos y Piernas Inferior">Tren Inferior (Cuádriceps, Glúteos, Femorales)</option>
                <option value="Abdominales e Híbrido">Fuerza Core y Quema Abdominal</option>
              </select>
            </div>

            {/* Extra profile properties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tu Peso (kg)</label>
                <input
                  type="number"
                  value={bodyweight}
                  onChange={(e) => setBodyweight(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none text-center font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tu Edad (Años)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none text-center font-mono shadow-sm"
                />
              </div>
            </div>

          </div>

          <button
            onClick={handleGenerateRoutine}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-sans text-sm py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
          >
            <Sparkles className="w-5 h-5 animate-pulse" /> Generar Mi Rutina Inteligente con IA
          </button>
        </div>
      )}

      {/* Loading Spinner with reassuring texts */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm flex flex-col justify-center items-center text-center gap-4 py-16 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          <h3 className="text-lg font-bold text-slate-800 mt-1">Nuestra IA está diseñando tu rutina de élite...</h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            Estamos seleccionando los mejores ejercicios biomecánicamente seguros, calculando descansos exactos y adaptándolos a tu nivel amateur.
          </p>
          <div className="text-[10px] bg-indigo-50 text-indigo-600 font-mono px-3 py-1.5 rounded-md mt-2 border border-indigo-100">
            [Fase 1: Analizando perfil corporal y nivel de fuerza de {age} años]
          </div>
        </div>
      )}

      {/* 2. Display Generated Routine Details */}
      {routine && (
        <div className="space-y-6 animate-fadeIn">
          {/* Routine Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-indigo-600/5 pointer-events-none">
              <Dumbbell className="w-48 h-48 shrink-0" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <span className="bg-indigo-50 text-indigo-600 text-[10px] font-mono tracking-widest font-semibold px-2.5 py-1 rounded-full border border-indigo-100 uppercase">
                  Plan Activo de Entrenamiento IA
                </span>
                <h2 className="text-2xl font-sans font-bold text-slate-800 mt-2">{routine.routineName}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">{routine.objectiveSummary}</p>
              </div>

              <button
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reconfigurar Plan
              </button>
            </div>
          </div>

          {/* Schedule Week Loop Split Screen */}
          <div className="grid grid-cols-1 gap-6">
            {routine.schedule.map((day, dIdx) => (
              <div key={dIdx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                
                {/* Day Header banner */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 px-4.5 py-3 rounded-2xl">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800">{day.dayName}</h3>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Foco: <strong className="text-indigo-600 font-bold">{day.focus}</strong></p>
                  </div>
                  <span className="bg-white border border-slate-200 text-[10px] font-mono text-slate-500 px-2.5 py-1 rounded-full shrink-0">
                    {day.exercises.length} Ejercicios
                  </span>
                </div>

                {/* Exercises list */}
                <div className="grid grid-cols-1 gap-3.5">
                  {day.exercises.map((ex, eIdx) => {
                    const isCompleted = completedExercises.includes(ex.name);
                    return (
                      <div 
                        key={eIdx} 
                        className={`p-4 rounded-2xl border transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                          isCompleted 
                            ? "bg-slate-50/60 border-slate-100/80 opacity-60" 
                            : "bg-white border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        {/* Checkbox and text info left side */}
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <button
                            id={`btn-toggle-ex-${eIdx}`}
                            onClick={() => handleToggleExercise(ex.name)}
                            className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isCompleted 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                                : "hover:border-indigo-500 border-slate-300"
                            }`}
                          >
                            {isCompleted && (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </button>

                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className={`text-sm font-sans font-bold text-slate-800 truncate ${isCompleted ? "line-through text-slate-400" : ""}`}>
                                {ex.name}
                              </h4>
                              <span className="bg-slate-50 text-slate-500 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-200">
                                {ex.targetMuscle}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                                ex.difficulty.toLowerCase().includes("bajo") || ex.difficulty.toLowerCase().includes("amateur") || ex.difficulty.toLowerCase().includes("fácil")
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                  : "bg-cyan-50 text-cyan-600 border border-cyan-100"
                              }`}>
                                {ex.difficulty}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-normal">{ex.mechanics}</p>
                            
                            {/* Safety cues highlighted */}
                            <div className="flex items-start gap-1 bg-amber-50 shadow-inner px-2.5 py-1.5 rounded-lg border border-amber-200">
                              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-amber-900 leading-normal italic">
                                <strong>Tip seguridad:</strong> {ex.safetyCue}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Config sets reps rest right side */}
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:border-l md:border-slate-100 md:pl-4">
                          <div className="flex items-center gap-2 text-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
                            <div>
                              <span className="text-[9px] text-slate-450 block leading-none font-bold">SERIES</span>
                              <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">{ex.sets}</span>
                            </div>
                            <div className="w-px h-5 bg-slate-200" />
                            <div>
                              <span className="text-[9px] text-slate-450 block leading-none font-bold">REPS</span>
                              <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">{ex.reps}</span>
                            </div>
                            <div className="w-px h-5 bg-slate-200" />
                            <div>
                              <span className="text-[9px] text-slate-450 block leading-none font-bold">REST</span>
                              <span className="text-xs font-mono font-bold text-indigo-600 mt-0.5 block">{ex.rest}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAskCoachExercise(ex.name)}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-850 text-[10px] font-bold py-2 px-3 rounded-xl transition flex-1 md:flex-none flex items-center justify-center gap-1 shrink-0"
                            title="Preguntar cómo hacerlo"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-600" /> Consultar Postura
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

          {/* General Routine Tips */}
          {routine.generalTips && routine.generalTips.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-bold font-sans text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-indigo-600" /> Consejos del Especialista en Kinesiología de IA:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {routine.generalTips.map((tip, idx) => (
                  <div key={idx} className="bg-white p-3.5 border border-slate-205 rounded-2xl text-[11px] text-slate-600 leading-normal flex items-start gap-2.5 shadow-sm">
                    <div className="w-5 h-5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      ✓
                    </div>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
