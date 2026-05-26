import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, User, Sparkles, AlertCircle, Dumbbell, ShieldAlert } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: string;
}

const QUICK_QUESTIONS = [
  "Me duele el hombro al hacer flexiones, ¿qué hago?",
  "¿Cómo puedo bajar en sentadilla sin levantar los talones?",
  "Como novato total, ¿cómo sé cuánto peso levantar?",
  "Técnica correcta de respirar: ¿cuándo inhalar y exhalar?"
];

export default function AICoachChat({ 
  prefilledExercise, 
  onClosePrefill 
}: { 
  prefilledExercise: string | null; 
  onClosePrefill: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "coach",
      content: "¡Hola! Soy tu Coach de Gimnasio con IA. Estoy aquí para guiarte en cada paso de tu entrenamiento. Como eres amateur, mi prioridad número uno es tu técnica perfecta, seguridad y motivación constante.\n\nPregúntame sobre cualquier ejercicio de tu rutina, si sientes alguna molestia, o de qué forma respirar para dar tu 100%. ¿En qué te asesoro hoy?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-fill and scroll on pre-filled triggers from the Video/Tech Guide
  useEffect(() => {
    if (prefilledExercise) {
      const text = `Tengo dudas sobre cómo hacer correctamente el ejercicio "${prefilledExercise}". ¿Qué recomendaciones de alineación y seguridad de élite me das para mi nivel amateur?`;
      setInputText(text);
      onClosePrefill();
    }
  }, [prefilledExercise]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));
      // Append newest
      history.push({ role: "user", content: textToSend });

      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          selectedExercise: prefilledExercise || "General"
        })
      });

      const data = await response.json();
      const coachMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, coachMsg]);

    } catch (err) {
      console.error("Error communicating with AI coach endpoint:", err);
      // Fallback
      const coachMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: "🚨 ¡Disculpa! No pude contactar con el servidor. Pero te aconsejo: baja la velocidad de ejecución, reduce el peso y bloquea tu abdomen fuerte. ¡La calidad de movimiento es lo más importante!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-coach-chat-container" className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm h-[485px] flex flex-col justify-between overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Coach IA</h3>
          </div>
        </div>

        <span className="text-[10px] bg-slate-50 text-slate-400 border border-slate-200 px-2.5 py-1 rounded-lg font-bold uppercase tracking-tight">
          Asesoría Técnica
        </span>
      </div>

      {/* Quick Questions suggestion */}
      {messages.length < 3 && (
        <div className="bg-slate-50 p-3.5 border border-slate-100 rounded-2xl my-2">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Consejos rápidos que puedes preguntar:</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[11px] bg-white hover:bg-slate-50 hover:text-indigo-600 border border-slate-200 text-slate-600 py-1.5 px-3 rounded-xl transition duration-155 text-left shadow-xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Box */}
      <div className="flex-1 overflow-y-auto space-y-3.5 my-3 pr-1 py-1">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                isUser ? "bg-slate-100 text-slate-600 border-slate-200" : "bg-indigo-50 text-indigo-600 border-indigo-100"
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                isUser 
                  ? "bg-indigo-600 text-white rounded-tr-none shadow-sm" 
                  : "bg-slate-50 text-slate-700 border border-slate-200 rounded-tl-none shadow-xs"
              }`}>
                {m.content}
                <span className={`text-[9px] font-mono block text-right mt-1.5 leading-none ${
                  isUser ? "text-indigo-200" : "text-slate-400"
                }`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2.5 mr-auto max-w-[80%]">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-[10px] text-slate-400 font-medium ml-1">Evaluando biomecánica...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex gap-2 border-t border-slate-100 pt-3 self-end w-full"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Escribe tus dudas técnicos (Ej: Dolor de muñeca)..."
          className="flex-1 bg-white text-slate-800 border border-slate-200 focus:border-indigo-500 hover:border-slate-300 text-xs px-3.5 py-3 rounded-xl outline-none shadow-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-350 text-white font-bold px-4 py-3 rounded-xl transition flex items-center justify-center shadow-md shadow-indigo-100 cursor-pointer"
          title="Enviar Pregunta"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
