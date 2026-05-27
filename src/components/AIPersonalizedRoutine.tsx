import { useState, useEffect } from "react";
import {
  Dumbbell,
  Calendar,
  RotateCcw,
  Sparkles,
  CheckSquare,
  ChevronRight,
  PlayCircle,
  Star,
  Info,
  HelpCircle,
  X,
  CheckCircle2,
  XCircle,
  MessageCircle,
} from "lucide-react";
import { AIRoutineResponse, Exercise, ExerciseGuideDetails } from "../types";
import BiomechanicalSimulator from "./BiomechanicalSimulator";

const EXERCISE_GUIDES: ExerciseGuideDetails[] = [
  {
    id: "squat",
    name: "Sentadilla Copa (Goblet Squat)",
    category: "Piernas",
    difficulty: "Principiante",
    unsplashUrl:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Talones completamente pegados al suelo empujando el peso",
      "Rodillas alineadas con el segundo dedo del pie (sin colapso interno)",
      "Torso erguido para proteger la columna y cargar con el core",
      "Profundidad por debajo o al nivel paralelo de las articulaciones",
    ],
    incorrectKeypoints: [
      "Levantar los talones del suelo (sobrecarga en las rodillas)",
      "Colapso de rodillas metiéndose hacia adentro (Riesgo en meniscos)",
      "Espalda redondeada o postura jorobada al descender el peso",
    ],
    tipsForAmateurs:
      "Usa este estilo sosteniendo una mancuerna frente a tu pecho. Es mucho más sencillo de balancear e infinitamente más seguro para tu espalda baja que una sentadilla trasera con barra convencional.",
    cueAnglePoints: [
      { x: 50, y: 35, label: "Torso rígido y recto" },
      { x: 45, y: 65, label: "Caderas atrás" },
      { x: 55, y: 80, label: "Talón firme" },
    ],
    stepByStep: [
      "De pie, sostén una mancuerna pegada verticalmente a tu pecho, tomándola como una copa.",
      "Separa tus pies al ancho de tus hombros con las puntas giradas levemente hacia afuera.",
      "Inicia el movimiento empujando la cadera hacia atrás como si fueras a sentarte.",
      "Baja controladamente manteniendo la columna alineada.",
      "Empuja fuertemente contra el suelo para subir, exhalando arriba.",
    ],
  },
  {
    id: "pushup",
    name: "Flexión de Brazos Estándar (Push-Up)",
    category: "Pecho",
    difficulty: "Principiante",
    unsplashUrl:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Codos formando un ángulo de 45 grados con respecto al torso",
      "Cuerpo rígido y alineado como una tabla desde la cabeza a los talones",
      "Rango completo de movimiento, bajando la nariz y el pecho cerca del suelo",
    ],
    incorrectKeypoints: [
      "Dejar caer la cadera hacia abajo (sobrecarga espinal)",
      "Abrir los codos perpendicularmente a 90 grados (lesión de manguito rotador)",
      "Rango parcial o cortado, sin activar fibras profundas del pecho",
    ],
    tipsForAmateurs:
      "Como amateur, si te resulta difícil ejecutarlas en el suelo con técnica estable, apoya las rodillas o apoya las manos en una superficie elevada.",
    cueAnglePoints: [
      { x: 30, y: 50, label: "Codos a 45°" },
      { x: 55, y: 60, label: "Core firme" },
      { x: 80, y: 70, label: "Tobillos estables" },
    ],
    stepByStep: [
      "Coloca tus manos en el suelo ligeramente más separadas que el ancho de hombros.",
      "Extiende tus piernas hacia atrás para quedar en posición de plancha alta.",
      "Bloquea y tensa tus glúteos e infla el pecho para ganar estabilidad.",
      "Desciende doblando los codos hacia atrás formando una flecha (nunca una T).",
      "Empuja el suelo firmemente para regresar a la posición inicial.",
    ],
  },
  {
    id: "row",
    name: "Remo Unilateral con Mancuerna",
    category: "Espalda",
    difficulty: "Principiante",
    unsplashUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Columna neutra y plana paralela al suelo durante la tracción",
      "Traccionar jalando con el codo apuntando en dirección a la cadera",
      "Hombro se retrae hacia el centro de la espalda antes del tirón",
    ],
    incorrectKeypoints: [
      "Curvar o encorvar la espalda alta como una cúpula",
      "Girar o rotar drásticamente el torso para compensar el exceso de peso",
      "Jalar el peso con la fuerza exclusiva del bíceps sin activar escápulas",
    ],
    tipsForAmateurs:
      "Imagina que tu mano es un simple gancho que sostiene el peso. La fuerza de verdad nace desde tu codo jalando hacia atrás. Esto activa instantáneamente las dorsales.",
    cueAnglePoints: [
      { x: 55, y: 45, label: "Espalda plana" },
      { x: 45, y: 55, label: "Codo a cadera" },
      { x: 30, y: 50, label: "Apoyo estable" },
    ],
    stepByStep: [
      "Apoya una rodilla y la mano correspondiente en una banca horizontal.",
      "Sostén la mancuerna con el otro brazo estirado, manteniendo la espalda recta.",
      "Retrae la escápula para preparar la tracción.",
      "Levanta el codo hacia arriba y atrás, llevando la mancuerna en curva a la cadera.",
      "Desciende controladamente sintiendo el estiramiento completo.",
    ],
  },
  {
    id: "deadlift",
    name: "Peso Muerto Rumano (RDL)",
    category: "Piernas",
    difficulty: "Intermedio",
    unsplashUrl:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Empujar la cadera excesivamente hacia atrás como si quisieras cerrar una puerta",
      "Sentir un estiramiento marcado detrás de los muslos (isquiotibiales)",
      "Mantener las mancuernas o barra pegadas a tus muslos y pantorrillas",
    ],
    incorrectKeypoints: [
      "Doblar las rodillas excesivamente simulando una sentadilla",
      "Curvar la zona baja de la columna al inclinarse hacia el suelo",
      "Mirar fijamente hacia arriba tensionando crónicamente las cervicales",
    ],
    tipsForAmateurs:
      "Tu flexión debe ser exclusivamente de cadera hacia atrás. Imagina una cuerda tirando de tu trasero horizontalmente. Tus rodillas solo se desbloquean mínimamente para dar holgura.",
    cueAnglePoints: [
      { x: 40, y: 45, label: "Caderas atrás" },
      { x: 50, y: 35, label: "Espalda firme" },
      { x: 48, y: 70, label: "Rodilla semi-flexionada" },
    ],
    stepByStep: [
      "Párate con pies al ancho de cadera, sosteniendo las mancuernas frente a tus muslos.",
      "Desbloquea tus rodillas ligeramente y bloquea tu abdomen.",
      "Comienza a llevar tus glúteos hacia atrás inclinando el torso al frente.",
      "Baja el peso deslizándolo por tus piernas hasta sentir el estiramiento detrás.",
      "Aprieta tus glúteos fuertemente para jalar la cadera al frente y volver a erguirte.",
    ],
  },
  {
    id: "arnold",
    name: "Press Arnold de Hombros",
    category: "Hombros",
    difficulty: "Principiante",
    unsplashUrl:
      "https://images.unsplash.com/photo-1581009146145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Apoyo de espalda total en el respaldo del asiento",
      "Rotación coordinada de muñecas de 180 grados durante el recorrido",
      "Codos cerrados hacia el frente al inicio para aliviar articulaciones",
    ],
    incorrectKeypoints: [
      "Curvar exageradamente la zona lumbar despegando la espalda",
      "Bajar demasiado rápido perdiendo tensión en los hombros",
      "Extender los codos perpendicularmente al torso lateral",
    ],
    tipsForAmateurs:
      "Sostener las mancuernas al inicio frente a tus ojos te ayuda a tener un rango de movimiento mucho más natural que el convencional.",
    cueAnglePoints: [
      { x: 50, y: 30, label: "Extensión recta vertical" },
      { x: 50, y: 45, label: "Giro 180° muñeca" },
      { x: 50, y: 65, label: "Espalda apoyada" },
    ],
    stepByStep: [
      "Siéntate con respaldo firme, mancuernas frente a tu barbilla.",
      "Las palmas deben apuntar hacia tu pecho al inicio del ejercicio.",
      "A medida que empujas las mancuernas hacia el techo, rota tus muñecas suavemente.",
      "En el punto más alto, tus palmas deben apuntar hacia afuera.",
      "Desciende invirtiendo la rotación lenta y simétricamente.",
    ],
  },
  {
    id: "deadbug",
    name: "Bicho Muerto (Dead Bug)",
    category: "Core",
    difficulty: "Principiante",
    unsplashUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Espalda baja presionando activamente el suelo sin que pase nada por debajo",
      "Coordinación lenta cruzada del brazo y pierna contraria",
      "Mantener la respiración controlada metiendo el abdomen",
    ],
    incorrectKeypoints: [
      "Dejar que la zona lumbar se levante y curve del suelo",
      "Mover apresuradamente las extremidades sin control muscular",
      "Dejar caer las piernas flojas o desinfladas",
    ],
    tipsForAmateurs:
      "Para comprobar tu técnica, pon una toalla delgada bajo tu espalda baja e intenta que alguien tire de ella; no debe salir.",
    cueAnglePoints: [
      { x: 50, y: 55, label: "Lumbar pegada" },
      { x: 35, y: 35, label: "Brazo extendido" },
      { x: 65, y: 65, label: "Pierna rozando el suelo" },
    ],
    stepByStep: [
      "Acuéstate boca arriba, brazos elevados, rodillas a 90 grados.",
      "Presiona firmemente tu columna contra el suelo.",
      "Extiende simultáneamente brazo derecho y pierna izquierda sin tocar el piso.",
      "Tensa 1 segundo el núcleo en el punto máximo de estiramiento.",
      "Regresa al centro de forma controlada y repite con el par opuesto.",
    ],
  },
];

const getMatchingGuide = (name: string): ExerciseGuideDetails => {
  const norm = name.toLowerCase();
  if (norm.includes("sentadilla") || norm.includes("squat") || norm.includes("zancada") || norm.includes("pierna")) {
    return EXERCISE_GUIDES[0]; // squat
  }
  if (norm.includes("flexi") || norm.includes("push") || norm.includes("lagartija") || norm.includes("pecho") || norm.includes("mancuerna pecho")) {
    return EXERCISE_GUIDES[1]; // pushup
  }
  if (norm.includes("remo") || norm.includes("row") || norm.includes("espalda") || norm.includes("jalón") || norm.includes("pull")) {
    return EXERCISE_GUIDES[2]; // row
  }
  if (norm.includes("peso muerto") || norm.includes("deadlift") || norm.includes("rdl") || norm.includes("isquio")) {
    return EXERCISE_GUIDES[3]; // deadlift
  }
  if (norm.includes("press") || norm.includes("arnold") || norm.includes("hombro") || norm.includes("militar") || norm.includes("deltoid")) {
    return EXERCISE_GUIDES[4]; // arnold
  }
  if (norm.includes("bicho") || norm.includes("bug") || norm.includes("plancha") || norm.includes("core") || norm.includes("abdominal") || norm.includes("crunch")) {
    return EXERCISE_GUIDES[5]; // deadbug
  }
  // Custom generated dynamic guide fallback to match the specified name nicely!
  return {
    id: "pushup",
    name: name,
    category: "Pecho",
    difficulty: "Principiante",
    unsplashUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Ejecuta un movimiento suave y controlado en ambas fases",
      "Mantén el core tensionado como un bloque protector",
      "Inhala al descender, exhala con fuerza al empujar/levantar",
    ],
    incorrectKeypoints: [
      "Hacer movimientos rápidos con tirones bruscos",
      "Perder el control y la tensión corporal al bajar",
    ],
    tipsForAmateurs: "Calienta de manera óptima tus articulaciones antes de cargar.",
    cueAnglePoints: [
      { x: 50, y: 50, label: "Core firme" }
    ],
    stepByStep: [
      "Adopta una posición cómoda, segura y balanceada.",
      "Inicia la fase de bajada lenta reteniendo la respiración.",
      "Empuja fuertemente contrayendo el músculo principal de trabajo.",
    ],
  };
};

export default function AIPersonalizedRoutine({
  onAskCoachExercise,
  onWorkoutSuccess,
}: {
  onAskCoachExercise: (name: string) => void;
  onWorkoutSuccess: (calories: number) => void;
}) {
  const [objective, setObjective] = useState("Hipertrofia / Ganar Músculo");
  const [experience, setExperience] = useState("Amateur / Principiante");
  const [equipment, setEquipment] = useState("Mancuernas y Peso Corporal");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [muscleGroups, setMuscleGroups] = useState(
    "Cuerpo Completo (Fullbody)",
  );
  const [bodyweight, setBodyweight] = useState("75");
  const [age, setAge] = useState("25");

  const [routine, setRoutine] = useState<AIRoutineResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // Integrated Technique Modal state
  const [selectedGuide, setSelectedGuide] = useState<ExerciseGuideDetails | null>(null);
  const [postureTab, setPostureTab] = useState<"correct" | "incorrect">("correct");

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
          age,
        }),
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
    if (
      window.confirm(
        "¿Seguro que deseas borrar tu plan actual y configurar uno nuevo con la IA?",
      )
    ) {
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
      onWorkoutSuccess(75); // 75 calories computed per exercise finished
    } else {
      next = completedExercises.filter((e) => e !== exName);
    }
    setCompletedExercises(next);
    localStorage.setItem("gym_completed_exercises", JSON.stringify(next));
  };

  const handleOpenGuide = (exName: string) => {
    const match = getMatchingGuide(exName);
    setSelectedGuide(match);
    setPostureTab("correct");
  };

  return (
    <div
      id="ai-personalized-routine-container"
      className="space-y-6 animate-fadeIn"
    >
      {/* 1. Generator Settings Form */}
      {!routine && (
        <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-sans font-black text-white">
                Generador de Rutinas
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                Postura perfecta y biomecánica segura
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* Objective selection */}
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tu Objetivo Físico
              </label>
              <select
                value={objective}
                id="select-objective"
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-[#080808] text-white border border-white/5 focus:border-emerald-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Hipertrofia / Ganar Músculo">
                  💪 Hipertrofia (Ganar Masa y Fuerza)
                </option>
                <option value="Pérdida de Grasa / Quemar Calorías">
                  🔥 Pérdida de Grasa (Acondicionamiento)
                </option>
                <option value="Tonificación y Resistencia">
                  ⚡ Tonificación y Resistencia Muscular
                </option>
                <option value="Fuerza y Rendimiento Funcional">
                  🏋️‍♂️ Fuerza Básica y Resistencia Core
                </option>
              </select>
            </div>

            {/* Level Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Tu Diferencial de Fuerza / Nivel
              </label>
              <select
                value={experience}
                id="select-experience"
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#111] text-white border border-white/5 focus:border-indigo-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Amateur / Principiante">
                  Amateur / Principiante (Técnicas sencillas y seguras)
                </option>
                <option value="Médio / Intermedio">
                  Medio / Intermedio (Manejas peso libre estable)
                </option>
                <option value="Avanzado">
                  Avanzado / Conductor (Rango completo y altas cargas)
                </option>
              </select>
            </div>

            {/* Equipment selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Equipamiento Disponible
              </label>
              <select
                value={equipment}
                id="select-equipment"
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-[#080808] text-white border border-white/5 focus:border-emerald-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Mancuernas y Peso Corporal">
                  Mancuernas, Bandas y Peso Corporal (Casa / Gym Ligero)
                </option>
                <option value="Gimnasio Completo">
                  Gimnasio Completo (Máquinas, poleas y barras olímpicas)
                </option>
                <option value="Solo Peso Corporal / Calistenia">
                  Solo Peso Corporal / Calistenia (Sin pesas)
                </option>
              </select>
            </div>

            {/* Days selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Frecuencia Semanal Deseada
              </label>
              <select
                value={daysPerWeek}
                id="select-days"
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-[#080808] text-white border border-white/5 focus:border-emerald-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value={2}>
                  2 días a la semana (Full-body)
                </option>
                <option value={3}>
                  3 días a la semana (Balanceado - RECOMENDADO)
                </option>
                <option value={4}>
                  4 días a la semana (Rutina dividida Torso/Pierna)
                </option>
                <option value={5}>
                  5 días a la semana (Frecuencia avanzada)
                </option>
              </select>
            </div>

            {/* Target muscular selection */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Grupos Musculares Priorizados
              </label>
              <select
                value={muscleGroups}
                id="select-muscles"
                onChange={(e) => setMuscleGroups(e.target.value)}
                className="w-full bg-[#080808] text-white border border-white/5 focus:border-emerald-500 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
              >
                <option value="Cuerpo Completo (Fullbody)">
                  Todo el Cuerpo (Fullbody - Balanceado)
                </option>
                <option value="Brazos y Pectorales">
                  Tren Superior (Pecho, Espalda, Hombros, Brazos)
                </option>
                <option value="Glúteos y Piernas Inferior">
                  Tren Inferior (Cuádriceps, Glúteos, Femorales)
                </option>
                <option value="Abdominales e Híbrido">
                  Fuerza Core y Quema Abdominal
                </option>
              </select>
            </div>

            {/* Extra profile properties */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tu Peso (kg)
                </label>
                <input
                  type="number"
                  value={bodyweight}
                  onChange={(e) => setBodyweight(e.target.value)}
                  className="w-full bg-[#080808] text-white border border-white/5 focus:border-emerald-500 text-xs px-3.5 py-3 rounded-xl outline-none text-center font-mono shadow-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tu Edad (Años)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-[#080808] text-white border border-white/5 focus:border-emerald-500 text-xs px-3.5 py-3 rounded-xl outline-none text-center font-mono shadow-sm"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateRoutine}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#111] font-bold font-sans text-sm py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Sparkles className="w-5 h-5 animate-pulse" /> Generar Mi Rutina Inteligente con IA
          </button>
        </div>
      )}

      {isLoading && (
        <div className="bg-[#111] border border-white/5 rounded-3xl p-10 shadow-sm flex flex-col justify-center items-center text-center gap-4 py-16">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <h3 className="text-sm font-bold text-white mt-1 uppercase tracking-widest leading-none">
            Generando Plan Óptimo
          </h3>
          <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
            Analizando biomecánica y descansos para un entrenamiento seguro.
          </p>
        </div>
      )}

      {/* 2. Display Generated Routine Details */}
      {routine && (
        <div className="space-y-5 animate-fadeIn">
          {/* Routine Header Card */}
          <div className="bg-[#111] border border-white/5 rounded-[24px] p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-emerald-500/5 pointer-events-none">
              <Dumbbell className="w-40 h-40 shrink-0" />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono tracking-widest font-black px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase">
                  Plan Activo de Entrenamiento IA
                </span>
                <h2 className="text-xl font-sans font-bold text-white mt-1.5">
                  {routine.routineName}
                </h2>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed max-w-xl">
                  {routine.objectiveSummary}
                </p>
              </div>

              <button
                onClick={handleReset}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Cambiar Plan
              </button>
            </div>
          </div>

          {/* Schedule Week Loop Split Screen - Styled Ultra Clean & Compact */}
          <div className="grid grid-cols-1 gap-4">
            {routine.schedule.map((day, dIdx) => (
              <div
                key={dIdx}
                className="bg-[#111] border border-white/5 rounded-[24px] p-4.5 shadow-sm space-y-3"
              >
                {/* Day Header banner */}
                <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-3.5 py-2.5 rounded-xl">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      {day.dayName}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Foco: <strong className="text-emerald-500">{day.focus}</strong>
                    </p>
                  </div>
                  <span className="bg-[#050505] border border-white/5 text-[9px] font-mono text-slate-400 px-2.5 py-0.5 rounded-full shrink-0">
                    {day.exercises.length} Ejercicios
                  </span>
                </div>

                {/* Exercises list */}
                <div className="grid grid-cols-1 gap-2">
                  {day.exercises.map((ex, eIdx) => {
                    const isCompleted = completedExercises.includes(ex.name);
                    return (
                      <div
                        key={eIdx}
                        onClick={() => handleOpenGuide(ex.name)}
                        className={`p-3 rounded-xl border transition-all duration-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 cursor-pointer group ${
                          isCompleted
                            ? "bg-white/[0.02] border-white/5 opacity-55"
                            : "bg-[#09090a] border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02] shadow-sm"
                        }`}
                      >
                        {/* Checkbox and text info left side */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            id={`btn-toggle-ex-${eIdx}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid opening the visual guide when checking it off
                              handleToggleExercise(ex.name);
                            }}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                              isCompleted
                                ? "bg-emerald-500 border-white text-black shadow-md shadow-emerald-500/10"
                                : "hover:border-emerald-500 border-white/20"
                            }`}
                          >
                            {isCompleted && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                className="w-3 h-3"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                            )}
                          </button>

                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h4
                                className={`text-[12px] md:text-xs font-black text-white truncate ${
                                  isCompleted ? "line-through text-slate-500" : "group-hover:text-emerald-400 transition-colors"
                                }`}
                              >
                                {ex.name}
                              </h4>
                              <span className="bg-white/5 text-slate-500 text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/5 uppercase">
                                {ex.targetMuscle}
                              </span>
                              <span
                                className={`text-[8px] font-mono px-1 rounded ${
                                  ex.difficulty.toLowerCase().includes("bajo") ||
                                  ex.difficulty.toLowerCase().includes("amateur") ||
                                  ex.difficulty.toLowerCase().includes("fácil") ||
                                  ex.difficulty.toLowerCase().includes("principiante")
                                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/15"
                                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                                }`}
                              >
                                {ex.difficulty}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-normal max-w-md truncate md:max-w-none">
                              {ex.mechanics}
                            </p>

                            {/* Safety cues highlighted in a super-clean format */}
                            <div className="flex items-center gap-1.5 bg-amber-500/5 px-2 py-1 rounded-md border border-amber-500/15 w-fit">
                              <Info className="w-3 h-3 text-amber-500 shrink-0" />
                              <p className="text-[9px] text-amber-200/60 font-medium italic truncate max-w-[240px] md:max-w-[400px]">
                                {ex.safetyCue}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Config sets reps rest right side with play tutorial integration */}
                        <div className="flex items-center justify-between md:justify-end gap-3 md:border-l md:border-white/5 md:pl-3">
                          <div className="flex items-center gap-2 text-center bg-[#050505] border border-white/5 py-1 px-2.5 rounded-lg shrink-0">
                            <div>
                              <span className="text-[7.5px] text-slate-500 block leading-none font-bold">SERIES</span>
                              <span className="text-[10px] font-mono font-black text-white mt-0.5 block">{ex.sets}</span>
                            </div>
                            <div className="w-px h-10 bg-white/5" />
                            <div>
                              <span className="text-[7.5px] text-slate-500 block leading-none font-bold">REPS</span>
                              <span className="text-[10px] font-mono font-black text-white mt-0.5 block">{ex.reps}</span>
                            </div>
                            <div className="w-px h-10 bg-white/5" />
                            <div>
                              <span className="text-[7.5px] text-slate-500 block leading-none font-bold">REST</span>
                              <span className="text-[10px] font-mono font-black text-emerald-500 mt-0.5 block">{ex.rest}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Ask coach button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAskCoachExercise(ex.name);
                              }}
                              className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white p-2 rounded-lg transition-all"
                              title="Consultar al Entrenador por IA"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>

                            {/* Play Guide Button */}
                            <button
                              className="bg-emerald-500 text-black font-black uppercase tracking-wider text-[8px] rounded-lg p-2 flex items-center justify-center gap-1.5 scale-95 group-hover:scale-100 transition-all duration-300 pointer-events-none"
                              title="Ver Guía de Técnica Directo"
                            >
                              <PlayCircle className="w-3.5 h-3.5 stroke-[2.5px]" />
                            </button>
                          </div>
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
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[24px] p-5 shadow-sm space-y-2.5">
              <h4 className="text-[11px] font-black font-sans text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4" /> Consejos del Especialista:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {routine.generalTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="bg-white/[0.02] p-3 border border-white/5 rounded-2xl text-[10px] text-slate-400 leading-normal flex items-start gap-2 shadowing-sm"
                  >
                    <div className="w-4 h-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md flex items-center justify-center font-black text-[9px] shrink-0 mt-0.5">
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

      {/* --- INTEGRATED CLINICAL TECHNIQUE GUIDE POPUP OVERLAY MODAL --- */}
      {selectedGuide && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
          {/* Backdrop Click Dismiss */}
          <div className="absolute inset-0" onClick={() => setSelectedGuide(null)} />

          {/* Main Modal Card */}
          <div className="w-full max-w-2xl bg-[#0c0c0d] border border-white/10 rounded-[28px] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] relative z-10 flex flex-col max-h-[90vh]">
            <div className="h-1 bg-gradient-to-r from-emerald-500/40 via-emerald-500 to-emerald-500/40" />

            {/* Header */}
            <div className="p-4 bg-[#0e0e10]/60 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-md">
                  <PlayCircle className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-[13px] font-black uppercase text-white tracking-wider max-w-[280px] sm:max-w-md truncate">
                    {selectedGuide.name}
                  </h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                    Guía Bioquímica Interactiva • {selectedGuide.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Correct vs Incorrect state switcher */}
                <div className="flex bg-[#050505] p-0.5 rounded-lg border border-white/5 shadow-inner">
                  <button
                    onClick={() => setPostureTab("correct")}
                    className={`text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-md transition flex items-center gap-1 ${
                      postureTab === "correct"
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/10"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" /> OK
                  </button>
                  <button
                    onClick={() => setPostureTab("incorrect")}
                    className={`text-[9px] font-black tracking-wider uppercase px-2 py-1 rounded-md transition flex items-center gap-1 ${
                      postureTab === "incorrect"
                        ? "bg-red-500 text-black shadow-md shadow-red-500/10"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    <XCircle className="w-3 h-3" /> Error
                  </button>
                </div>

                <button
                  onClick={() => setSelectedGuide(null)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body - Scrollable */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Dynamic Interactive Biomechanical Simulator */}
              <div className="rounded-2xl overflow-hidden border border-white/5 shadow-md">
                <BiomechanicalSimulator
                  exerciseId={selectedGuide.id}
                  isCorrect={postureTab === "correct"}
                />
              </div>

              {/* Guidelines lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* DO */}
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-[10px] font-black text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correcto (Postura Óptima)
                  </h4>
                  <ul className="space-y-1 text-[9.5px] text-slate-350 leading-relaxed">
                    {selectedGuide.correctKeypoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">&#8226;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AVOID */}
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3.5 space-y-1.5">
                  <h4 className="text-[10px] font-black text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <XCircle className="w-3.5 h-3.5" /> Evitar (Lesiones Latentes)
                  </h4>
                  <ul className="space-y-1 text-[9.5px] text-slate-350 leading-relaxed">
                    {selectedGuide.incorrectKeypoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-500 font-bold">&#8226;</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Step by Step Execution guide */}
              <div className="bg-[#050505] border border-white/5 rounded-xl p-3.5 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Ejecución de Biomecánica Paso a Paso
                </h4>
                <div className="space-y-1.5">
                  {selectedGuide.stepByStep.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-[9.5px] text-slate-400">
                      <span className="w-4 h-4 bg-white/5 border border-white/10 text-[8.5px] font-mono font-black text-emerald-400 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deep Tip & Coach Action Trigger */}
              <div className="bg-[#09090a] border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="space-y-0.5">
                  <p className="text-[9.5px] text-slate-400 font-medium">
                    ¿Deseas saber más especificaciones táctiles o dolores en la zona?
                  </p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">
                    Sugerencia: {selectedGuide.tipsForAmateurs}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onAskCoachExercise(selectedGuide.name);
                    setSelectedGuide(null);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase tracking-wider px-3.5 py-2 rounded-lg transition shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Preguntar al Coach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
