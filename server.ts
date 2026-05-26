import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini SDK securely on the server
let aiClient: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY not found in environment. Fallback mode will be active.");
  }
} catch (error) {
  console.error("Error initializing Gemini API Client:", error);
}

// 1. ENDPOINT: Generate Personalized Routine with AI Gym Coach
app.post("/api/ai/routine", async (req, res) => {
  const { objective, experience, equipment, daysPerWeek, muscleGroups, bodyweight, age } = req.body;

  try {
    if (!aiClient) {
      throw new Error("CLIENT_OFFLINE");
    }

    const prompt = `Actúa como un Entrenador Personal de Élite y Kinesiólogo experto. Crea una rutina semanal personalizada y detallada en ESPAÑOL.
La rutina debe responder exactamente a este perfil:
- Objetivo: ${objective || "Fitness general"}
- Nivel de Experiencia: ${experience || "Amateur (Principiante)"}
- Equipo disponible: ${equipment || "Gimnasio completo"}
- Días de entrenamiento a la semana: ${daysPerWeek || 3} días
- Grupos musculares deseados: ${muscleGroups || "Cuerpo completo"}
- Peso corporal aproximado: ${bodyweight || "no especificado"} kg
- Edad o nota: ${age || "no especificada"} años

Queremos la respuesta estrictamente en un formato JSON estructurado que siga exactamente esta estructura:
{
  "routineName": "Nombre motivador de la rutina",
  "objectiveSummary": "Breve fundamentación fisiológica de por qué esta rutina le sirve según su nivel de amateur",
  "schedule": [
    {
      "dayName": "Día 1: Fuerza y Estabilidad (Ejemplo)",
      "focus": "Músculos entrenados hoy",
      "exercises": [
        {
          "name": "Ejemplo: Sentadilla Copa (Goblet Squat)",
          "sets": 3,
          "reps": "10-12",
          "rest": "90s",
          "targetMuscle": "Cuádriceps, Glúteos y Core",
          "mechanics": "Explicación breve de la técnica perfecta para amateurs",
          "safetyCue": "Mantén el pecho erguido y no dejes que las rodillas colapsen hacia adentro.",
          "difficulty": "Bajo-Medio",
          "videoTutorialUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600"
        }
      ]
    }
  ],
  "generalTips": [
    "Consejo de recuperación o alimentación adaptado al novato",
    "Consejo de incremento gradual de cargas"
  ]
}

Ten en cuenta que el usuario es ${experience || "Amateur"}, por lo que debes priorizar ejercicios seguros de ejecutar, con peso guiado, peso libre controlado o corporal. No generes respuestas genéricas. Da detalles excelentes explicados paso a paso. Mantenlo en JSON puro, válido y amigable.`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["routineName", "objectiveSummary", "schedule", "generalTips"],
          properties: {
            routineName: { type: Type.STRING },
            objectiveSummary: { type: Type.STRING },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["dayName", "focus", "exercises"],
                properties: {
                  dayName: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ["name", "sets", "reps", "rest", "targetMuscle", "mechanics", "safetyCue", "difficulty"],
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.INTEGER },
                        reps: { type: Type.STRING },
                        rest: { type: Type.STRING },
                        targetMuscle: { type: Type.STRING },
                        mechanics: { type: Type.STRING },
                        safetyCue: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                        videoTutorialUrl: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            },
            generalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se pudo obtener una respuesta legible de la IA");
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);

  } catch (error: any) {
    console.error("Error generating routine with AI:", error);

    // Provide a beautiful fallback routine if the API key is not configured, API error, etc.
    // This allows the application to remain perfectly interactive and complete.
    const fallbackRoutineName = objective === "Fuerza / Hipertrofia" 
      ? "Plan de Fuerza Básica Adaptativa (Amateur)" 
      : "Rutina Quema-Calorías y Acondicionamiento (Cuerpo Completo)";

    return res.json({
      routineName: fallbackRoutineName + " [Modo Local Activo]",
      objectiveSummary: `Esta rutina adaptativa en modo local ha sido optimizada para un perfil de nivel ${experience || "Amateur"}, de forma segura y eficaz para un plan semanal de ${daysPerWeek || 3} días enfocado en ${objective || "Tonificación"}.`,
      schedule: [
        {
          dayName: "Día 1: Empuje de Tren Superior & Core",
          focus: "Pecho, Hombros, Tríceps, Core",
          exercises: [
            {
              name: "Flexiones de Brazos Cruzadas (Inclinadas o en Rodillas)",
              sets: 3,
              reps: "8-12 repeticiones",
              rest: "60-90 segundos",
              targetMuscle: "Pectorales, Tríceps, Deltoides Frontal",
              mechanics: "Apoya las manos a una distancia ligeramente superior al ancho de hombros. Mantén el abdomen tenso como una tabla y desciende el pecho de forma controlada.",
              safetyCue: "Si sientes molestia en hombros, hazlas con inclinación (manos elevadas en un banco o mesa firme) y enfócate en apuntar los codos a 45 grados de tu torso.",
              difficulty: "Amateur",
              videoTutorialUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600"
            },
            {
              name: "Press Arnold de Hombro Sentado",
              sets: 3,
              reps: "10-12 repeticiones",
              rest: "90 segundos",
              targetMuscle: "Hombros (Deltoides completo) y Tríceps",
              mechanics: "Comienza con las mancuernas a la altura del pecho con las palmas mirando hacia ti. A medida que empujas hacia arriba, rota las muñecas 180° de forma que las palmas miren hacia el frente.",
              safetyCue: "Mantén la espalda bien apoyada en el respaldo de la silla para evitar curvar excesivamente la zona lumbar durante el empuje.",
              difficulty: "Amateur",
              videoTutorialUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600"
            },
            {
              name: "Bicho Muerto (Dead Bug) Controlado",
              sets: 3,
              reps: "12 alternados",
              rest: "60 segundos",
              targetMuscle: "Recto abdominal, transverso del abdomen",
              mechanics: "Acuéstate boca arriba, brazos al techo y rodillas dobladas a 90°. Extiende el brazo izquierdo hacia atrás y la pierna derecha al frente de manera coordinada, rozando el suelo, y regresa lentamente.",
              safetyCue: "Lo más importante de este ejercicio es mantener la espalda baja completamente pegada y apretada contra el suelo durante todo el movimiento.",
              difficulty: "Bajo",
              videoTutorialUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600"
            }
          ]
        },
        {
          dayName: "Día 2: Tracción de Tren Superior & Piernas",
          focus: "Espalda, Bíceps, Piernas Posterior, Glúteo",
          exercises: [
            {
              name: "Sentadilla Copa con Pausa (Goblet Squat)",
              sets: 3,
              reps: "10-12 repeticiones",
              rest: "90 segundos",
              targetMuscle: "Cuádriceps, Glúteo mayor, Core",
              mechanics: "Sujeta una mancuerna o un objeto pesado como una copa pegada a tu pecho. Desciende controladamente como si te sentaras en una silla, empujando con los talones.",
              safetyCue: "Mantén el pecho erguido y las rodillas apuntando en la misma dirección que la punta de tus pies. Aguanta 1 segundo abajo.",
              difficulty: "Amateur",
              videoTutorialUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=600"
            },
            {
              name: "Remo Unilateral con Mancuerna o Mochila",
              sets: 3,
              reps: "12 por brazo",
              rest: "60 segundos",
              targetMuscle: "Dorsal Ancho, Redondo Mayor, Bíceps",
              mechanics: "Apoya la rodilla y mano contraria en una silla, con la espalda recta. Lleva el codo hacia tu cadera, sintiendo como la escápula de la espalda se aprieta hacia el centro.",
              safetyCue: "Evita rotar el torso para subir el peso. Imagina que tiras con el codo, no con la fuerza de la mano.",
              difficulty: "Fácil",
              videoTutorialUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
            },
            {
              name: "Puente de Glúteo Unilateral en Suelo",
              sets: 3,
              reps: "12 por pierna",
              rest: "60 segundos",
              targetMuscle: "Glúteos medio/mayor, Isquiotibiales",
              mechanics: "Estirado boca arriba con rodillas dobladas. Levanta una pierna recta. Empuja el suelo firmemente con el talón apoyado de la otra pierna para elevar la cadera de forma alineada, apretando el glúteo arriba.",
              safetyCue: "No hiper-extiendas la espalda al elevar. La fuerza debe nacer de la cadera y tus glúteos, no de los riñones.",
              difficulty: "Amateur",
              videoTutorialUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600"
            }
          ]
        },
        ...((daysPerWeek && daysPerWeek > 2) ? [
          {
            dayName: "Día 3: Trabajo de Cardio, Cadena Posterior & Core",
            focus: "Isquiotibiales, Espalda baja, Hombro, Resistencia",
            exercises: [
              {
                name: "Peso Muerto Rumano con Mancuernas (RDL)",
                sets: 3,
                reps: "12 repeticiones",
                rest: "90 segundos",
                targetMuscle: "Bíceps femoral, Glúteos, Erectores de la columna",
                mechanics: "De pie, dobla levemente tus rodillas. Empuja tus caderas hacia atrás como si quisieras cerrar una puerta con tus glúteos, bajando el peso cerca de tus piernas con la columna recta.",
                safetyCue: "Baja solo hasta donde puedas mantener la espalda completamente alineada. Sentirás un estiramiento profundo detrás de tus piernas.",
                difficulty: "Medio-Bajo",
                videoTutorialUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
              },
              {
                name: "Zancadas Hacia Atrás (Step-backs) Alternadas",
                sets: 3,
                reps: "10 por pierna",
                rest: "90 segundos",
                targetMuscle: "Cuádriceps, Glúteos, Aductores",
                mechanics: "Da un gran paso hacia atrás bajando la rodilla trasera hasta quedar casi rozando el suelo. Mantén el peso en el talón de la pierna delantera.",
                safetyCue: "Hacer el paso hacia atrás es mucho más seguro para la rodilla del amateur que las zancadas frontales comunes.",
                difficulty: "Amateur",
                videoTutorialUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600"
              },
              {
                name: "Plancha Abdominal de Antebrazos Activa",
                sets: 3,
                reps: "30-45 segundos",
                rest: "60 segundos",
                targetMuscle: "Core completo, Serrato anterior",
                mechanics: "Apoya antebrazos paralelos, empuja el suelo para redondear ligeramente la zona escapular y mantén las caderas alineadas con las piernas activas.",
                safetyCue: "Si la espalda baja empieza a doler, apoya inmediatamente las rodillas para seguir trabajando de manera segura.",
                difficulty: "Bajo",
                videoTutorialUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600"
              }
            ]
          }
        ] : [])
      ],
      generalTips: [
        "Bebe al menos 2.5 litros de agua al día para mantener los músculos hidratados.",
        "El descanso es parte del entrenamiento: duerme entre 7 y 8 horas diarias.",
        "Como principiante, prioriza la calidad técnica y la velocidad controlada de ejecución antes de intentar subir de peso.",
        "Usa las listas de reproducción dinámicas integradas en la pestaña Música para motivarte."
      ]
    });
  }
});

// 2. ENDPOINT: Interactive AI Gym Coach for questions and correct technique advice
app.post("/api/ai/coach", async (req, res) => {
  const { messages, selectedExercise } = req.body;

  try {
    if (!aiClient) {
      throw new Error("CLIENT_OFFLINE");
    }

    // Prepare message history
    const gymContext = `Eres el Coach de Gimnasio con IA de élite, un especialista en biomecánica, fisioterapia y kinesiología deportiva en español. Su especialidad es guiar a atletas principalmente AMATEURS y novatos de manera interactiva, muy motivadora, amigable, clara, didáctica y sobre todo SEGURA.
Si el usuario pregunta por un ejercicio específico (${selectedExercise || "General"}), enfócate en dar consejos de postura milimétricos, señales de seguridad ("safety cues"), qué sentir (conexión mente-músculo) y qué evitar para no lesionarse.
Usa viñetas limpias para estructurar tus consejos y da alternativas fáciles. Si te reportan algún pinchazo, molestia o dolor, indica amablemente que detengan el ejercicio y recomiéndales una variante segura o estiramiento.`;

    const chatHistory = (messages || []).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Add general background info to the first message if needed, or simply append
    const lastUserMessage = chatHistory[chatHistory.length - 1];
    if (lastUserMessage) {
      lastUserMessage.parts[0].text = `[Foco: ${selectedExercise || "Técnica general"}] ${lastUserMessage.parts[0].text}`;
    }

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatHistory,
      config: {
        systemInstruction: gymContext,
        temperature: 0.7,
      }
    });

    const reply = response.text || "¡Perdona! Tuve un pestañeo técnico. Como coach de IA te digo: mantén una buena postura y haz tus series con control de movimiento.";
    return res.json({ reply });

  } catch (error: any) {
    console.error("Error in AI Coach Assistant:", error);
    
    // Fallback response generator so the coach remains highly functional and replies instantly
    const query = messages && messages.length > 0 ? messages[messages.length - 1].content.toLowerCase() : "";
    let fallbackReply = "¡Hola! Como tu Coach de IA en modo local, te recuerdo que la clave está en el control. ";
    
    if (query.includes("duele") || query.includes("dolor") || query.includes("molesti")) {
      fallbackReply += `\n\n🚨 **¡Escucha a tu cuerpo primero!** Si sientes molestias en las articulaciones, detén el movimiento de inmediato. Como amateur, te sugiero cambiar a una variante de menor impacto o reducir el peso en un 50%. Por ejemplo, si te duele el hombro entrenando pecho, cambia las flexiones planas por flexiones con las manos elevadas en la pared o banco o haz aperturas con mancuernas muy ligeras enfocadas en juntar las escápulas.`;
    } else if (query.includes("sentadilla") || query.includes("pierna") || query.includes("squat")) {
      fallbackReply += `\n\n🏋️‍♂️ **Técnica de Sentadillas Correcta:**
• **Ancho:** Pies al ancho de hombros, puntas rotadas ligeramente hacia afuera (15 grados).
• **Talón pegado:** Empuja la fuerza desde los talones, nunca levantes el talón.
• **Rodillas afuera:** Que no se cierren hacia adentro ("valgo de rodilla"). Dirígelas hacia el dedo pequeño del pie.
• **Espalda:** Pecho inflado y sacando cadera hacia atrás. ¡Tu columna debe estar firme y neutra!`;
    } else if (query.includes("espalda") || query.includes("pesomuerte") || query.includes("remo")) {
      fallbackReply += `\n\n💪 **Técnica de Espalda / Tracción:**
• **Activa escápulas:** Antes de tirar del peso, retrae tus hombros hacia atrás y abajo.
• **Tracciona con los codos:** No pienses en subir la mancuerna con tus manos, sino en empujar tus codos hacia las costillas traseras.
• **Espalda neutra:** En remos o peso muerto, no curvas la columna; mantén el abdomen bloqueado para proteger la zona lumbar.`;
    } else {
      fallbackReply += `\n\nPara perfeccionar tu técnica de la mejor manera como amateur:
1. Realiza el ejercicio a una velocidad lenta (3 segundos de bajada, 1 de subida). This increases mind-muscle connection.
2. Evita aguantar la respiración: exhala en la fase de máximo esfuerzo (concéntrica) e inhala al bajar de forma controlada.
3. Mantén registros de tus series en nuestra pestaña 'Seguimiento' para observar tu progreso constante.
¿De qué otro ejercicio te gustaría que profundicemos su biomecánica para entrenar de forma óptima?`;
    }

    return res.json({ reply: fallbackReply });
  }
});


// 3. Mount Vite middleware for development vs Serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server attached to Express.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static server enabled, serving:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Workout AI Coach running on port ${PORT}`);
  });
}

startServer();
