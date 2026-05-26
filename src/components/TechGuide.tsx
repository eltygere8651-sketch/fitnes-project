import { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Sparkles, MessageCircle, RefreshCw, Layers, Zap } from "lucide-react";
import { ExerciseGuideDetails } from "../types";
import BiomechanicalSimulator from "./BiomechanicalSimulator";

const EXERCISE_GUIDES: ExerciseGuideDetails[] = [
  {
    id: "squat",
    name: "Sentadilla Copa (Goblet Squat)",
    category: "Piernas",
    difficulty: "Principiante",
    unsplashUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Talones completamente pegados al suelo empujando el peso",
      "Rodillas alineadas con el segundo dedo del pie (sin colapso interno)",
      "Torso erguido para proteger la columna y cargar con el core",
      "Profundidad por debajo o al nivel paralelo de las articulaciones"
    ],
    incorrectKeypoints: [
      "Levantar los talones del suelo (sobrecarga en las rodillas)",
      "Colapso de rodillas metiéndose hacia adentro (Riesgo en meniscos)",
      "Espalda redondeada o postura jorobada al descender el peso"
    ],
    tipsForAmateurs: "Usa este estilo sosteniendo una mancuerna frente a tu pecho. Es mucho más sencillo de balancear e infinitamente más seguro para tu espalda baja que una sentadilla trasera con barra convencional.",
    cueAnglePoints: [
      { x: 50, y: 35, label: "Torso rígido y recto" },
      { x: 45, y: 65, label: "Caderas atrás" },
      { x: 55, y: 80, label: "Talón firme" }
    ],
    stepByStep: [
      "De pie, sostén una mancuerna pegada verticalmente a tu pecho, tomándola como una copa.",
      "Separa tus pies al ancho de tus hombros con las puntas giradas levemente hacia afuera (15-30 grados).",
      "Inicia el movimiento empujando la cadera hacia atrás como si fueras a sentarte en un taburete bajo.",
      "Baja controladamente manteniendo la columna alineada. El peso debe recaer en el centro y talones de tus pies.",
      "Empuja fuertemente contra el suelo para subir, exhalando durante el movimiento de ascenso."
    ]
  },
  {
    id: "pushup",
    name: "Flexión de Brazos Estándar (Push-Up)",
    category: "Pecho",
    difficulty: "Principiante",
    unsplashUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Codos formando un ángulo de 45 grados con respecto al torso",
      "Cuerpo rígido y alineado como una tabla desde la cabeza a los talones",
      "Rango completo de movimiento, bajando la nariz y el pecho cerca del suelo"
    ],
    incorrectKeypoints: [
      "Dejar caer la cadera hacia abajo (sobrecarga espinal)",
      "Abrir los codos perpendicularmente a 90 grados (lesión del manguito rotador)",
      "Rango parcial o cortado, sin activar fibras profundas del pecho"
    ],
    tipsForAmateurs: "Como amateur, si te resulta difícil ejecutarlas en el suelo con técnica estable, por favor apoya las rodillas o apoya las manos en una superficie elevada (banco o pared) para reducir la carga de forma amigable.",
    cueAnglePoints: [
      { x: 30, y: 50, label: "Codos a 45°" },
      { x: 55, y: 60, label: "Core firme" },
      { x: 80, y: 70, label: "Tobillos estables" }
    ],
    stepByStep: [
      "Coloca tus manos en el suelo ligeramente más separadas que el ancho de hombros, alineadas con el pecho.",
      "Extiende tus piernas hacia atrás para quedar en posición de plancha alta activa.",
      "Bloquea y tensa tus glúteos e inflo el pecho para ganar estabilidad corporal.",
      "Desciende doblando los codos hacia atrás formando una flecha (nunca una T).",
      "Empuja el suelo firmemente para regresar a la posición inicial sin desconectar la cadera."
    ]
  },
  {
    id: "row",
    name: "Remo Unilateral con Mancuerna",
    category: "Espalda",
    difficulty: "Principiante",
    unsplashUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Columna neutra y plana paralela al suelo durante la tracción",
      "Traccionar jalando con el codo apuntando en dirección a la cadera",
      "Hombro se retrae hacia el centro de la espalda antes del tirón"
    ],
    incorrectKeypoints: [
      "Curvar o encorvar la espalda alta como una cúpula",
      "Girar o rotar drásticamente el torso para compensar el exceso de peso",
      "Jalar el peso con la fuerza exclusiva del bíceps sin activar escápulas"
    ],
    tipsForAmateurs: "Imagina que tu mano es un simple gancho que sostiene el peso. La fuerza de verdad nace desde tu codo jalando hacia atrás. Esto activa instantáneamente las dorsales.",
    cueAnglePoints: [
      { x: 55, y: 45, label: "Espalda plana" },
      { x: 45, y: 55, label: "Codo a cadera" },
      { x: 30, y: 50, label: "Apoyo estable" }
    ],
    stepByStep: [
      "Apoya una rodilla y la mano correspondiente en una banca horizontal o silla firme.",
      "Sostén la mancuerna con el otro brazo estirado, manteniendo la espalda recta.",
      "Retrae la escápula (lleva el hombro hacia atrás) para preparar la tracción.",
      "Lleva el codo hacia arriba y atrás, llevando la mancuerna en una trayectoria curva hacia tu cadera.",
      "Desciende controladamente sintiendo el estiramiento completo en la espalda."
    ]
  },
  {
    id: "deadlift",
    name: "Peso Muerto Rumano (RDL)",
    category: "Piernas",
    difficulty: "Intermedio",
    unsplashUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Empujar la cadera excesivamente hacia atrás como si quisieras cerrar una puerta",
      "Sentir un estiramiento marcado detrás de los muslos (isquiotibiales y glúteos)",
      "Mantener las mancuernas o barra pegadas a tus muslos y pantorrillas todo el tiempo"
    ],
    incorrectKeypoints: [
      "Doblar las rodillas excesivamente simulando una sentadilla",
      "Curvar la zona baja de la columna al inclinarse hacia el suelo",
      "Mirar fijamente hacia arriba tensionando crónicamente las cervicales"
    ],
    tipsForAmateurs: "Tu flexión debe ser exclusivamente de cadera hacia atrás. Imagina una cuerda tirando de tu trasero horizontalmente. Tus rodillas solo se desbloquean mínimamente para dar holgura.",
    cueAnglePoints: [
      { x: 40, y: 45, label: "Caderas atrás" },
      { x: 50, y: 35, label: "Espalda firme" },
      { x: 48, y: 70, label: "Rodilla semi-flexionada" }
    ],
    stepByStep: [
      "Párate con pies al ancho de cadera, sosteniendo las mancuernas frente a tus muslos.",
      "Desbloquea (dobla milimétricamente) tus rodillas y bloquea tu abdomen.",
      "Comienza a llevar tus glúteos hacia atrás mientras dejas que el torso se incline hacia adelante.",
      "Baja el peso deslizándolo por tus piernas hasta sentir un estiramiento denso detrás de ellas.",
      "Aprieta tus glúteos fuertemente para jalar la cadera al frente y volver a erguirte."
    ]
  },
  {
    id: "arnold",
    name: "Press Arnold de Hombros",
    category: "Hombros",
    difficulty: "Principiante",
    unsplashUrl: "https://images.unsplash.com/photo-1581009146145-d05b474e2155?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Apoyo de espalda total en el respaldo del asiento",
      "Rotación coordinada de muñecas de 180 grados durante el recorrido",
      "Codos cerrados hacia el frente al inicio para aliviar articulaciones"
    ],
    incorrectKeypoints: [
      "Curvar exageradamente la zona lumbar despegando la espalda del asiento",
      "Bajar demasiado rápido perdiendo tensión y control en el hombro",
      "Extender los codos perpendicularmente al torso lateral, forzando cartílagos"
    ],
    tipsForAmateurs: "Sostener las mancuernas al inicio del movimiento frente a tus ojos te ayuda a tener un rango de movimiento mucho más natural y fluido que el clásico press de hombros.",
    cueAnglePoints: [
      { x: 50, y: 30, label: "Extensión recta vertical" },
      { x: 50, y: 45, label: "Giro 180° muñeca" },
      { x: 50, y: 65, label: "Espalda apoyada" }
    ],
    stepByStep: [
      "Siéntate en un banco con respaldo firme con una mancuerna en cada mano frente a tu barbilla.",
      "Las palmas de tus manos deben apuntar hacia tu pecho al inicio del ejercicio.",
      "A medida que empujas las mancuernas hacia el techo, rota tus muñecas suavemente.",
      "En el punto más alto, tus palmas deben apuntar hacia el frente completamente.",
      "Desciende invirtiendo la rotación lenta y simétricamente para volver a la posición inicial."
    ]
  },
  {
    id: "deadbug",
    name: "Bicho Muerto (Dead Bug)",
    category: "Core",
    difficulty: "Principiante",
    unsplashUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600",
    correctKeypoints: [
      "Espalda baja presionando activamente el suelo sin que pase una hoja de papel",
      "Coordinación lenta cruzada del brazo brazo y pierna contraria",
      "Mantener la respiración controlada metiendo el ombligo"
    ],
    incorrectKeypoints: [
      "Dejar que la zona lumbar se fatigue levantándose y curvándose del suelo",
      "Mover apresuradamente las piernas sin contraer voluntariamente el core",
      "Dejar caer las piernas pesadas sin control mecánico"
    ],
    tipsForAmateurs: "Para comprobar tu técnica, pon una toalla delgada bajo tu espalda baja e intenta que alguien tire de ella. Si logran sacarla, significa que debes empujar tu ombligo más hacia adentro.",
    cueAnglePoints: [
      { x: 50, y: 55, label: "Lumbar pegada" },
      { x: 35, y: 35, label: "Brazo extendido" },
      { x: 65, y: 65, label: "Pierna rozando el suelo" }
    ],
    stepByStep: [
      "Acuéstate boca arriba en una colchoneta, con tus brazos elevados y tus rodillas dobladas a 90 grados.",
      "Presiona tu columna contra el suelo. Esto es lo más crucial del ejercicio.",
      "Lentamente desciende y extiende tu brazo izquierdo hacia atrás y tu pierna derecha al frente.",
      "Detente antes de que toquen el suelo y mantén la tensión 1 segundo.",
      "Regresa lentamente a la posición neutra e inicia con el brazo y pierna alternada."
    ]
  }
];

export default function TechGuide({ onAskCoach }: { onAskCoach: (exerciseName: string) => void }) {
  const [selectedGuide, setSelectedGuide] = useState<ExerciseGuideDetails>(EXERCISE_GUIDES[0]);
  const [postureTab, setPostureTab] = useState<"correct" | "incorrect">("correct");
  const [showIndicators, setShowIndicators] = useState(true);

  // Switch exercise selection
  const handleSelectId = (id: string) => {
    const found = EXERCISE_GUIDES.find(g => g.id === id);
    if (found) {
      setSelectedGuide(found);
      setPostureTab("correct");
    }
  };

  return (
    <div id="tech-guide-container" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      
      {/* 1. Left Side Sidebar: Exercise List picker */}
      <div className="col-span-1 lg:col-span-4 space-y-3">
        <h3 className="text-xs font-bold font-sans text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
          <Layers className="w-4 h-4 text-indigo-600" /> Videoguías Correctivas
        </h3>

        <div className="space-y-2 lg:max-h-[500px] lg:overflow-y-auto pr-1">
          {EXERCISE_GUIDES.map((ex) => {
            const isSelected = ex.id === selectedGuide.id;
            return (
              <button
                key={ex.id}
                id={`tech-selector-btn-${ex.id}`}
                onClick={() => handleSelectId(ex.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition duration-150 flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-white border-indigo-500 shadow-md shadow-indigo-100 text-slate-800"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 shadow-sm"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase bg-slate-50 text-slate-500 px-1.5 rounded border border-slate-200">
                      {ex.category}
                    </span>
                    <span className={`text-[9px] font-semibold font-mono px-1.5 rounded ${
                      ex.difficulty === "Principiante" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
                    }`}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="font-bold text-sm truncate mt-1.5 text-slate-800">{ex.name}</p>
                </div>
                
                <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg w-7 h-7 flex items-center justify-center shrink-0 font-bold">
                  ⚡
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tips Alert */}
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3 shadow-sm">
          <Zap className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-600 leading-normal">
            <strong className="text-indigo-900 block font-bold uppercase tracking-wider">Consejo para Novatos:</strong>
            Filtrar los errores comunes te ayuda a prevenir el 90% de lesiones y sobrecargas articulares típicas en amateurs.
          </p>
        </div>
      </div>

      {/* 2. Right Side: Video Simulator and Technique Splitter */}
      <div className="col-span-1 lg:col-span-8 space-y-5">
        
        {/* Visual Mock-Iframe Simulator Card */}
        <div id="visual-simulator-card" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-850 font-sans">{selectedGuide.name}</h2>
              <p className="text-xs text-slate-450">Guía de Postura Bioquímica • {selectedGuide.category}</p>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setPostureTab("correct")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
                  postureTab === "correct"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Correcto
              </button>
              <button
                onClick={() => setPostureTab("incorrect")}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition duration-150 flex items-center gap-1 cursor-pointer ${
                  postureTab === "incorrect"
                    ? "bg-red-500 text-white shadow-md shadow-red-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Incorrecto
              </button>
            </div>
          </div>

          {/* Interactive Dynamic Biomechanical Video Simulator Clip Loop */}
          <BiomechanicalSimulator 
            exerciseId={selectedGuide.id} 
            isCorrect={postureTab === "correct"} 
          />

          {/* Guidelines under visual screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Success list */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" /> Lo que DEBES HACER (Postura)
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-650">
                {selectedGuide.correctKeypoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Danger list */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-red-650 flex items-center gap-1.5 uppercase tracking-wide">
                <XCircle className="w-4 h-4" /> Lo que DEBES EVITAR (Lesiones)
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-650">
                {selectedGuide.incorrectKeypoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Step by Step list */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Guía de Ejecución Paso a Paso:</h4>
            <div className="space-y-2">
              {selectedGuide.stepByStep.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-[11px] text-slate-600">
                  <span className="w-5 h-5 bg-white border border-slate-200 text-[10px] font-mono font-bold text-indigo-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Trigger for support AI coach */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-600 text-center sm:text-left">
              ¿Tienes molestias musculares o dudas sobre cuánto peso iniciar en el <strong className="text-slate-800">{selectedGuide.name}</strong>?
            </p>
            
            <button
              onClick={() => onAskCoach(selectedGuide.name)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition duration-200 flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-100 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> Preguntar al Coach Técnico de IA
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
