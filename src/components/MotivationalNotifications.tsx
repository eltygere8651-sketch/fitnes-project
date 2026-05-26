import { useState, useEffect } from "react";
import { Bell, Sparkles, Send, Award, Flame, Heart, Zap, CheckCircle2, Volume2, ShieldAlert } from "lucide-react";
import { DailyMotivation } from "../types";

const STANDARD_MOTIVATIONS: DailyMotivation[] = [
  { id: "mot1", text: "El verdadero fracaso es no intentarlo. Si hoy solo puedes hacer el 50%, ve y haz el 50% pero no te detengas.", author: "Arnold Schwarzenegger", category: "Disciplina" },
  { id: "mot2", text: "La constancia siempre supera al talento natural. Como amateur, cada repetición técnica que haces es una base indestructible para el futuro.", author: "Entrenador IA", category: "Enfoque" },
  { id: "mot3", text: "No tienes que ser excelente para empezar, pero tienes que empezar para poder llegar a ser excelente.", author: "Zig Ziglar", category: "Energía" },
  { id: "mot4", text: "El dolor de la disciplina es temporal, el dolor del arrepentimiento dura para siempre. Respira hondo y haz tu mejor esfuerzo hoy.", author: "Leyenda del Deporte", category: "Disciplina" },
  { id: "mot5", text: "Tus músculos crecen durante el descanso y la nutrición correcta, no solo levantando. Trata tu fase de recuperación con el mismo respeto que tu entrenamiento.", author: "Fisioterapeuta del Equipo", category: "Recuperación" },
];

export default function MotivationalNotifications({ activeStreak }: { activeStreak: number }) {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [frequencyMinutes, setFrequencyMinutes] = useState(15);
  const [quoteOfTheDay, setQuoteOfTheDay] = useState<DailyMotivation>(STANDARD_MOTIVATIONS[0]);
  const [customGoal, setCustomGoal] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsQueue, setNotificationsQueue] = useState<{ id: string; msg: string; timestamp: string }[]>([
    { id: "init1", msg: "🎯 ¡Lista de reproducción cargada! Recuerda activar el reproductor Phonk en la pestaña de música.", timestamp: "Hace un momento" },
    { id: "init2", msg: "🔥 ¡Tu racha actual de entrenamiento es de " + activeStreak + " días deportivos! Sigue así.", timestamp: "Hace 5 min" }
  ]);
  const [loadingAI, setLoadingAI] = useState(false);

  // Rotate custom standard quote on mount or randomized click
  const rotateQuote = () => {
    const randomIdx = Math.floor(Math.random() * STANDARD_MOTIVATIONS.length);
    setQuoteOfTheDay(STANDARD_MOTIVATIONS[randomIdx]);
  };

  // Generate customized AI motivation based on user goal and streak
  const generateAIMotivation = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Por favor, genera una frase de motivación e inspiración sumamente épica y estimulante en ESPAÑOL.
Mide mi estado: Mi racha deportiva actual es de ${activeStreak} días continuos.
Mi metas declaradas recientemente: "${customGoal || "quiero ser constante y entrenar técnica de sentadilla y sentir fuerza"}".
Usa máximo 2 líneas. Ofrece un tono empático, firme y profesional de Coach Deportivo de Elite, que impulse mi disciplina hoy.`
            }
          ]
        })
      });
      const data = await response.json();
      if (data && data.reply) {
        setQuoteOfTheDay({
          id: "ai-generated",
          text: data.reply.replace(/["'“”]/g, ""),
          author: "Tu Coach de IA en Vivo",
          category: "Energía"
        });
        
        // Add to active notifications feed
        pushNotification("🌟 Nueva motivación generada: " + data.reply.substring(0, 45) + "...");
      }
    } catch (err) {
      console.error("Error generating static AI quotes:", err);
      // Fallback
      rotateQuote();
    } finally {
      setLoadingAI(false);
    }
  };

  const pushNotification = (msg: string) => {
    const id = Date.now().toString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotificationsQueue(prev => [{ id, msg, timestamp: `Hoy, ${timeStr}` }, ...prev.slice(0, 5)]);

    if (soundEnabled) {
      try {
        // Simple client-side audio indicator synth context
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (e) {
        // Safe play
      }
    }
  };

  return (
    <div id="motivational-notifications-container" className="grid grid-cols-1 md:grid-cols-12 gap-6">
      
      {/* Configuration & Preferences Side */}
      <div className="col-span-1 md:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-5 animate-fadeIn">
        <div>
          <span className="bg-indigo-50 text-indigo-650 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-100 flex items-center gap-1.5 w-fit">
            <Bell className="w-3.5 h-3.5 text-indigo-600 animate-pulse" /> Sistema Sensorial y Alertas
          </span>
          <h2 className="text-xl font-sans font-bold text-slate-800 mt-2">Recordatorios Diarios</h2>
          <p className="text-xs text-slate-400 mt-1">Configura alertas de hidratación, respiración, postura e incentivos durante todo tu entrenamiento.</p>
        </div>

        {/* Custom Notifications form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-800">Notificaciones Interactivas</p>
              <p className="text-[10px] text-slate-400 font-medium">Incentivos motivacionales y sonidos en intervalos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={() => setRemindersEnabled(!remindersEnabled)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl shadow-xs">
            <div>
              <p className="text-xs font-bold text-slate-800">Efectos de Audio de Logros</p>
              <p className="text-[10px] text-slate-400 font-medium">Genera tonos sintéticos al entrenar</p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border cursor-pointer transition ${
                soundEnabled 
                  ? "bg-indigo-55 bg-indigo-50 text-indigo-600 border-indigo-150" 
                  : "bg-slate-200 text-slate-400 border-slate-300"
              }`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-405 uppercase tracking-wide">¿Cuál es tu meta deportiva?</label>
            <div className="relative">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Ej: Terminar mis rutinas y mejorar sentadilla"
                className="w-full bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 text-xs px-3.5 py-2.5 rounded-xl outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Triggers simulator */}
        <div className="flex gap-2">
          <button
            onClick={() => pushNotification("💧 Recordatorio: ¡Hora de tomar 250ml de agua de inmediato!")}
            className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-bold py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            Simular Alerta de Hidratación
          </button>
          <button
            onClick={() => pushNotification("🧘 Postura: Reajusta tus hombros hacia atrás y relaja el cuello hoy.")}
            className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-bold py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            Simular Alerta Posture
          </button>
        </div>

      </div>

      {/* Main Quote & Notification logs Side */}
      <div className="col-span-1 md:col-span-7 space-y-4 animate-fadeIn">
        
        {/* Quote of the Day container */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-indigo-600/5 pointer-events-none select-none">
            <Flame className="w-44 h-44 shrink-0" />
          </div>

          <div className="flex items-center justify-between mb-4 relative z-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono tracking-wider font-bold px-2.5 py-1 rounded uppercase ${
                quoteOfTheDay.id === "ai-generated" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
              }`}>
                {quoteOfTheDay.category}
              </span>
              {quoteOfTheDay.id === "ai-generated" && (
                <span className="text-[10px] text-amber-600 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> IA Dinámica
                </span>
              )}
            </div>
            
            <button 
              onClick={rotateQuote}
              className="text-[11px] text-slate-550 hover:text-slate-800 transition bg-white border border-slate-200 hover:border-slate-350 px-3 py-1 rounded-lg cursor-pointer shadow-xs"
            >
              Cita Siguiente
            </button>
          </div>

          <div className="space-y-4 relative z-1">
            <p className="text-sm font-sans italic text-slate-700 font-semibold leading-relaxed">
              &ldquo;{quoteOfTheDay.text}&rdquo;
            </p>
            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <p className="text-xs text-slate-450 block font-bold font-sans">— {quoteOfTheDay.author}</p>
              
              <button
                onClick={generateAIMotivation}
                disabled={loadingAI}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition duration-200 flex items-center gap-1 shadow-sm cursor-pointer"
              >
                {loadingAI ? (
                  <>Generando...</>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Motivación IA Personalizada
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications logger */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-150 pb-2">
            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Registro Reciente de Consejos de Hoy
            </h4>
            <button
              onClick={() => setNotificationsQueue([])}
              className="text-[9px] text-slate-400 hover:text-slate-700 font-bold uppercase tracking-wider cursor-pointer"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {notificationsQueue.length === 0 ? (
              <p className="text-[11px] text-slate-450 text-center py-4">No hay alertas. Se activarán en base a tus entrenamientos.</p>
            ) : (
              notificationsQueue.map(item => (
                <div key={item.id} className="flex items-start gap-2.5 bg-white hover:bg-slate-50/60 transition p-2.5 rounded-xl border border-slate-150 shadow-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-700 leading-normal font-medium">{item.msg}</p>
                    <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{item.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
