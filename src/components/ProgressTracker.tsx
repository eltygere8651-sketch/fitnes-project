import { useState, useEffect } from "react";
import { Plus, Trash2, Calendar, Flame, Weight, TrendingUp, Sparkles, CheckSquare, Target, Clock, ArrowUpRight } from "lucide-react";
import { WorkoutLog } from "../types";

export default function ProgressTracker({ 
  onStreakUpdate, 
  onWorkoutLogged 
}: { 
  onStreakUpdate: (count: number) => void;
  onWorkoutLogged: (exerciseName: string) => void;
}) {
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [bodyweightLogs, setBodyweightLogs] = useState<{ date: string; weight: number }[]>([
    { date: "May 10", weight: 78.5 },
    { date: "May 13", weight: 77.9 },
    { date: "May 17", weight: 77.4 },
    { date: "May 20", weight: 77.1 },
    { date: "May 24", weight: 76.8 },
  ]);
  const [weightInput, setWeightInput] = useState("");
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  // Add exercise log state
  const [selectedEx, setSelectedEx] = useState("Sentadilla Copa (Goblet)");
  const [repsInput, setRepsInput] = useState("10");
  const [loadInput, setLoadInput] = useState("15");
  const [durationInput, setDurationInput] = useState("45");

  // Load state on mount
  useEffect(() => {
    const savedDays = localStorage.getItem("gym_completed_days");
    if (savedDays) {
      setCompletedDays(JSON.parse(savedDays));
    }
    const savedLogs = localStorage.getItem("gym_workout_logs");
    if (savedLogs) {
      setWorkoutLogs(JSON.parse(savedLogs));
    }
    const savedWeight = localStorage.getItem("gym_weight_logs");
    if (savedWeight) {
      setBodyweightLogs(JSON.parse(savedWeight));
    }
  }, []);

  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Toggle dynamic weekday completion
  const handleToggleDay = (dayId: string) => {
    let next: string[];
    if (completedDays.includes(dayId)) {
      next = completedDays.filter(d => d !== dayId);
    } else {
      next = [...completedDays, dayId];
      // Interactive audio triggers
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } catch (err) {}
    }
    setCompletedDays(next);
    saveToLocalStorage("gym_completed_days", next);
    onStreakUpdate(next.length);
  };

  // Add new bodyweight log point
  const handleAddWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val) || val <= 0) return;

    const today = new Date();
    const dateLabel = today.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
    const updated = [...bodyweightLogs, { date: dateLabel, weight: val }].slice(-8); // Keep last 8 logs for nice graph display

    setBodyweightLogs(updated);
    saveToLocalStorage("gym_weight_logs", updated);
    setWeightInput("");
  };

  // Delete bodyweight log point
  const handleDeleteWeight = (idx: number) => {
    const updated = bodyweightLogs.filter((_, i) => i !== idx);
    setBodyweightLogs(updated);
    saveToLocalStorage("gym_weight_logs", updated);
  };

  // Submit actual workout set logs
  const handleAddWorkoutLog = () => {
    if (!selectedEx) return;

    const r = parseInt(repsInput) || 10;
    const w = parseFloat(loadInput) || 0;
    const d = parseInt(durationInput) || 30;

    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      exerciseName: selectedEx,
      setsLogged: [{ reps: r, weightKg: w }],
      durationMinutes: d
    };

    const updated = [newLog, ...workoutLogs];
    setWorkoutLogs(updated);
    saveToLocalStorage("gym_workout_logs", updated);
    setRepsInput("10");
    setLoadInput("15");

    onWorkoutLogged(selectedEx);

    // Auto-mark current weekday if not checked
    const weekDays = ["dom", "lun", "mar", "mie", "jue", "vie", "sab"];
    const todayIndex = new Date().getDay();
    const todayId = weekDays[todayIndex];
    if (!completedDays.includes(todayId)) {
      handleToggleDay(todayId);
    }
  };

  const handleClearWorkoutLogs = () => {
    setWorkoutLogs([]);
    saveToLocalStorage("gym_workout_logs", []);
  };

  // Safe variables for SVG rendering
  const minWeight = bodyweightLogs.length > 0 ? Math.min(...bodyweightLogs.map(l => l.weight)) - 1 : 60;
  const maxWeight = bodyweightLogs.length > 0 ? Math.max(...bodyweightLogs.map(l => l.weight)) + 1 : 100;
  const weightDiff = maxWeight - minWeight || 1;

  // Render responsive SVG paths coordinates
  const svgWidth = 400;
  const svgHeight = 150;
  const paddingX = 40;
  const paddingY = 20;

  const points = bodyweightLogs.map((log, index) => {
    const x = paddingX + (index * (svgWidth - paddingX * 2)) / (bodyweightLogs.length - 1 || 1);
    const y = svgHeight - paddingY - ((log.weight - minWeight) * (svgHeight - paddingY * 2)) / weightDiff;
    return { x, y, label: log.date, weight: log.weight };
  });

  const pathD = points.length > 1
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  return (
    <div id="progress-tracker-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      
      {/* Upper Grid / Column 1: Consistency Calendar */}
      <div className="col-span-1 lg:col-span-4 flex flex-col gap-5">
        
        {/* Weekly Streaks Grid */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-5 select-none text-orange-450">
            <Flame className="w-24 h-24" />
          </div>

          <div className="flex justify-between items-start">
            <div>
              <span className="bg-orange-50 text-orange-600 text-[10px] font-mono tracking-wider font-semibold px-2.5 py-1 rounded-full border border-orange-100">
                Consistencia Semanal
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">Mi Calendario Racha</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-xl">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span className="text-sm font-bold text-slate-850 font-mono">{completedDays.length}</span>
              <span className="text-[10px] text-slate-400 font-semibold font-mono">días</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">Marca el día en que completaste tu rutina deportiva. ¡Suma hábitos saludables!</p>

          <div className="grid grid-cols-7 gap-1.5 mt-4">
            {[
              { id: "lun", label: "L", fullName: "Lunes" },
              { id: "mar", label: "M", fullName: "Martes" },
              { id: "mie", label: "M", fullName: "Miércoles" },
              { id: "jue", label: "J", fullName: "Jueves" },
              { id: "vie", label: "V", fullName: "Viernes" },
              { id: "sab", label: "S", fullName: "Sábado" },
              { id: "dom", label: "D", fullName: "Domingo" },
            ].map((d) => {
              const isChecked = completedDays.includes(d.id);
              return (
                <button
                  key={d.id}
                  id={`btn-day-${d.id}`}
                  onClick={() => handleToggleDay(d.id)}
                  title={d.fullName}
                  className={`flex flex-col items-center justify-between py-2 rounded-xl transition duration-200 border text-center cursor-pointer ${
                    isChecked
                      ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm shadow-orange-100/50"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-350 text-slate-450 hover:text-slate-800"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase transition">{d.label}</span>
                  <div className={`w-2 h-2 rounded-full mt-2 transition ${
                    isChecked ? "bg-orange-500" : "bg-slate-200 border border-slate-300"
                  }`} />
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Objetivo recomendado:</span>
            <span className="font-bold text-orange-600 text-right uppercase">3+ entrenos a la semana</span>
          </div>
        </div>

        {/* Weight Tracker inputs and log table */}
        <div id="weight-logging-section" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Weight className="w-4 h-4 text-indigo-650" /> Registro de Peso Corporal (kg)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Define tu peso para evaluar tu progreso físico en masa muscular o pérdida de grasa.</p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                step="0.1"
                min="30"
                max="250"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Ej: 76.5 kg"
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3 py-2.5 rounded-xl outline-none font-mono"
              />
              <span className="absolute right-3 top-3.5 text-[9px] font-bold text-slate-400">KG</span>
            </div>
            <button
              onClick={handleAddWeight}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Registrar
            </button>
          </div>

          <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
            {bodyweightLogs.map((log, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150 text-xs text-slate-705 shadow-xs">
                <span className="text-slate-400 font-medium">{log.date}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-750">{log.weight} kg</span>
                  <button
                    onClick={() => handleDeleteWeight(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Column 2: Graph Analysis and Exercise Log */}
      <div className="col-span-1 lg:col-span-8 space-y-5">
        
        {/* SVG Graphic block */}
        <div id="graph-analysis-card" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="bg-indigo-50 text-indigo-650 text-[10px] font-mono tracking-wider font-semibold px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1 w-fit">
                <TrendingUp className="w-3 h-3 text-indigo-600" /> Curva de Peso Corporal
              </span>
              <h3 className="text-lg font-bold text-slate-800 mt-2">Análisis de Progreso Muscular</h3>
            </div>
            {bodyweightLogs.length > 1 && (
              <div className="text-right text-xs">
                <span className="text-slate-400 text-[9px] block font-mono font-bold uppercase">ÚLTIMO CAMBIO</span>
                <span className={`font-mono font-bold flex items-center gap-0.5 ${
                  bodyweightLogs[bodyweightLogs.length - 1].weight <= bodyweightLogs[0].weight ? "text-indigo-600" : "text-amber-500"
                }`}>
                  {bodyweightLogs[bodyweightLogs.length - 1].weight - bodyweightLogs[0].weight < 0 ? "" : "+"}
                  {(bodyweightLogs[bodyweightLogs.length - 1].weight - bodyweightLogs[0].weight).toFixed(1)} kg
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>

          {/* Render the custom vector interactive SVG Graph */}
          {bodyweightLogs.length < 2 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl flex flex-col justify-center items-center text-center gap-1.5">
              <TrendingUp className="w-8 h-8 text-slate-450 animate-pulse" />
              <p className="text-xs text-slate-400 font-medium">Registra al menos 2 pesos diferentes para ver tu gráfica de evolución.</p>
            </div>
          ) : (
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" className="overflow-visible">
                {/* Horizontal guide lines */}
                {[0, 0.5, 1].map((ratio, i) => {
                  const y = paddingY + ratio * (svgHeight - paddingY * 2);
                  const weightVal = maxWeight - ratio * weightDiff;
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 10}
                        y={y + 3}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                        fontWeight="semibold"
                      >
                        {weightVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Main line path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#gradient-line)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Point dots */}
                {points.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="#4f46e5"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    {/* Tooltip with weight labels on top */}
                    <text
                      x={p.x}
                      y={p.y - 10}
                      fill="#0f172a"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {p.weight}k
                    </text>
                    {/* Date label at bottom */}
                    <text
                      x={p.x}
                      y={svgHeight - 4}
                      fill="#64748b"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}

                {/* Definitions gradients */}
                <defs>
                  <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* Workout set logging interface */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-5">
          
          <div className="col-span-1 md:col-span-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckSquare className="w-4 h-4 text-indigo-600" /> Guardar Serie Rápida
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Guarda tus cargas y repeticiones al entrenar para ver tus mejoras históricas.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Ejercicio ejecutado</label>
                <select
                  value={selectedEx}
                  id="select-exercise-log"
                  onChange={(e) => setSelectedEx(e.target.value)}
                  className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 text-xs px-3 py-2.5 rounded-xl outline-none shadow-sm"
                >
                  <option value="Sentadilla Copa (Goblet)">Sentadilla Copa (Goblet)</option>
                  <option value="Flexión de Brazos / Push-up">Flexión de Brazos / Push-up</option>
                  <option value="Remo Unilateral con Mancuerna">Remo Unilateral con Mancuerna</option>
                  <option value="Press Arnold de Hombros">Press Arnold de Hombros</option>
                  <option value="Bicho Muerto (Dead Bug) Core">Bicho Muerto (Dead Bug) Core</option>
                  <option value="Peso Muerto Rumano RDL">Peso Muerto Rumano RDL</option>
                  <option value="Zancadas Hacia Atrás">Zancadas Hacia Atrás</option>
                  <option value="Plancha de Antebrazos">Plancha de Antebrazos</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 text-center block">Reps</label>
                  <input
                    type="number"
                    value={repsInput}
                    onChange={(e) => setRepsInput(e.target.value)}
                    className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs text-center py-2 rounded-xl outline-none font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 text-center block">Peso (kg)</label>
                  <input
                    type="number"
                    value={loadInput}
                    onChange={(e) => setLoadInput(e.target.value)}
                    className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs text-center py-2 rounded-xl outline-none font-mono shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 text-center block">Minutos</label>
                  <input
                    type="number"
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value)}
                    className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs text-center py-2 rounded-xl outline-none font-mono shadow-sm"
                  />
                </div>
              </div>

              <button
                onClick={handleAddWorkoutLog}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Registrar Entrenamiento
              </button>
            </div>
          </div>

          <div className="col-span-1 md:col-span-7 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-sans font-bold tracking-wider text-slate-450 uppercase">HISTORIAL DE SESIONES:</span>
              {workoutLogs.length > 0 && (
                <button
                  onClick={handleClearWorkoutLogs}
                  className="text-[9px] text-slate-400 hover:text-red-500 font-bold uppercase cursor-pointer"
                >
                  Restaurar
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 flex-1">
              {workoutLogs.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center py-8 text-center text-slate-400">
                  <Calendar className="w-8 h-8 text-slate-300 mb-1" />
                  <p className="text-xs">No hay entrenamientos guardados hoy.</p>
                  <p className="text-[10px] text-slate-455">Completa una serie arriba para generar tu primer registro.</p>
                </div>
              ) : (
                workoutLogs.map((log) => (
                  <div key={log.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition shadow-xs text-slate-800">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{log.exerciseName}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-505 mt-1">
                        <span className="flex items-center gap-1 font-mono font-bold"><Target className="w-3 h-3 text-indigo-600" /> {log.setsLogged[0]?.reps} reps x {log.setsLogged[0]?.weightKg}kg</span>
                        <span className="flex items-center gap-1 font-mono"><Clock className="w-3 h-3 text-indigo-500" /> {log.durationMinutes} min</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 bg-white border border-slate-150 px-2 py-1 rounded-md text-right whitespace-nowrap shadow-xs">
                      {log.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
