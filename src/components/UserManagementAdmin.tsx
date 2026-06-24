import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { X, UserX, Shield, CheckCircle, AlertTriangle, Trash, Send, Save, Key, MessageSquare, Download, ChevronDown, ChevronUp, Sparkles, Bug } from "lucide-react";
import { jsPDF } from "jspdf";
import { FluxLogoMini } from "./FluxLogo";

export const UserManagementAdmin = ({ onClose }: { onClose: () => void }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);

  const [activeTab, setActiveTab] = useState<"users" | "support" | "notifications" | "monitor">("users");
  const [supportFilter, setSupportFilter] = useState<"todos" | "soporte" | "fallo" | "feedback">("todos");
  const [isTelegramConfigExpanded, setIsTelegramConfigExpanded] = useState(false);

  // Announcement composition states
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annCategory, setAnnCategory] = useState<"noticia" | "urgente" | "mantenimiento" | "actualizacion">("noticia");
  const [isPublishing, setIsPublishing] = useState(false);
  const [annSuccessMsg, setAnnSuccessMsg] = useState("");

  // System Monitor States
  const [systemHealth, setSystemHealth] = useState<{mainLibrary: string, planB: string, timestamp: number} | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const checkSystemHealth = async () => {
    try {
      setIsCheckingHealth(true);
      const res = await fetch("/api/system/health");
      const data = await res.json();
      setSystemHealth(data);
    } catch (err) {
      console.error("Health check error:", err);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const publishAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) {
      alert("Por favor completa el título y el contenido del comunicado.");
      return;
    }
    try {
      setIsPublishing(true);
      setAnnSuccessMsg("");
      const randId = "ann_" + Math.random().toString(36).substring(2, 11);
      const docRef = doc(db, "announcements", randId);
      await setDoc(docRef, {
        title: annTitle.trim(),
        content: annContent.trim(),
        category: annCategory,
        createdAt: new Date(),
        active: true
      });
      setAnnTitle("");
      setAnnContent("");
      setAnnCategory("noticia");
      setAnnSuccessMsg("¡Comunicado global publicado con éxito en la base de datos de FLUX!");
      // Trigger update badge event
      window.dispatchEvent(new Event("notifications-read"));
      setTimeout(() => setAnnSuccessMsg(""), 4500);
    } catch (err) {
      console.error("Error publicando anuncio:", err);
      alert("Error al publicar el anuncio: " + err);
    } finally {
      setIsPublishing(false);
    }
  };

  const deleteActiveAnnouncement = async () => {
    try {
      const { query, collection, orderBy, limit, getDocs, updateDoc } = await import("firebase/firestore");
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, { active: false });
        alert("El comunicado activo ha sido eliminado y ocultado de los usuarios (Refresca la app para ver los cambios).");
      } else {
        alert("No hay ningún comunicado activo reciente para eliminar.");
      }
    } catch(err) {
      console.error(err);
      alert("Error eliminando comunicado");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRequests();
    fetchTelegramConfig();
    fetchSupportMessages();
    adjustYesterdayTrials();
    checkSystemHealth();
  }, []);

  const downloadPresentation = () => {
    try {
      const doc = new jsPDF();
      
      // PAGE 1: PORTADA PRINCIPAL (Estilo Blanco Minimalista con Banda Verde)
      // 1. Banda verde en la parte superior
      doc.setFillColor(30, 215, 96); 
      doc.rect(0, 0, 210, 12, "F");

      // 2. LOGO OFICIAL VECTORIAL FLUX MUSIC (Diseño doble círculo concéntrico con dos puntos internos)
      const logoX = 105;
      const logoY = 75;
      // Círculo exterior verde
      doc.setDrawColor(30, 215, 96);
      doc.setLineWidth(0.8);
      doc.circle(logoX, logoY, 18, "S");
      // Círculo medio gris
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.4);
      doc.circle(logoX, logoY, 15, "S");
      // Círculo interior verde
      doc.setDrawColor(30, 215, 96);
      doc.setLineWidth(0.8);
      doc.circle(logoX, logoY, 12, "S");
      // Dos puntos verdes rellenos
      doc.setFillColor(30, 215, 96);
      doc.circle(logoX - 4.5, logoY, 1.8, "F");
      doc.circle(logoX + 4.5, logoY, 1.8, "F");

      // 3. TÍTULOS DE PORTADA
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.setFont("helvetica", "bold");
      doc.setFontSize(36);
      doc.text("FLUX MUSIC", 105, 122, { align: "center" });

      doc.setTextColor(30, 215, 96); // Verde Flux
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12.5);
      doc.text("STREAMING AUDIO PREMIUM DE ALTO RENDIMIENTO", 105, 133, { align: "center" });

      // 4. TEXTO INTRODUCTORIO CENTRADO
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      const introText = "Un ecosistema de streaming adaptado para una experiencia premium en hogares, oficinas, tiendas, bares y locales comerciales. Conectado de forma dinamica a una potente red de audio optimizada con control total, listas sincronizadas en tiempo real y compatibilidad de reproduccion de alta gama.";
      const splitIntro = doc.splitTextToSize(introText, 160);
      
      // Pintar con interlineado manual de 5.5
      let tempY = 146;
      splitIntro.forEach((line: string) => {
        doc.text(line, 105, tempY, { align: "center" });
        tempY += 5.5;
      });

      // 5. RECUADRO CON VALORES FUNDAMENTALES DU PROYECTO
      doc.setDrawColor(30, 215, 96);
      doc.setLineWidth(0.6);
      doc.setFillColor(255, 255, 255);
      doc.rect(25, 182, 160, 48, "S");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("VALORES FUNDAMENTALES DEL ECOSISTEMA FLUX", 105, 194, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85);
      doc.text("• Catálogo Ilimitado y Vivo: Millones de canciones y miles de playlists 100% optimizadas.", 30, 203);
      doc.text("• Dominio Global de Tendencias: Tops por países actualizados diariamente sin margen de error.", 30, 211);
      doc.text("• Motor de Búsqueda Supremo: Encuentra tracks, artistas, álbumes y remixes en milisegundos.", 30, 219);

      // 6. PIE DE PORTADA
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400
      doc.text("FLUX AUDIO STUDIO LTDA * REGISTRO DE PRODUCTO 2026", 105, 268, { align: "center" });


      // PAGE 2: ¿POR QUÉ ELEGIR FLUX MUSIC?
      doc.addPage();
      
      // Banda verde superior
      doc.setFillColor(30, 215, 96); 
      doc.rect(0, 0, 210, 12, "F");

      // Cabecera superior institucional del PDF
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("FLUX MUSIC • DOSSIER COMERCIAL & PROYECTO B2B", 20, 20);
      doc.text("PAGINA 2", 190, 20, { align: "right" });

      // Línea divisora sutil
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, 22.5, 190, 22.5);

      // TÍTULO EN NEGRO CON PEQUEÑA BARRA ACENTUADA
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("1. ¿Por que elegir FLUX Music?", 20, 35);

      // Barra de acentuación
      doc.setFillColor(30, 215, 96);
      doc.rect(20, 38, 170, 1, "F");

      // Párrafo de justificación
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const textChoose = "La ambientacion musical es un factor critico de conversion y energia, tanto en centros de trabajo donde eleva la productividad un 15% como en locales comerciales (hoteles, bares, tiendas) donde incrementa el tiempo de permanencia. Sin embargo, la oferta legal de la competencia es costosa y carece de dinamismo. FLUX ofrece una alternativa de alto impacto, interactiva y robusta.";
      const splitChoose = doc.splitTextToSize(textChoose, 170);
      let yChoose = 45;
      splitChoose.forEach((line: string) => {
        doc.text(line, 20, yChoose);
        yChoose += 5.2;
      });

      // Subtítulo Características Técnicas
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("CARACTERISTICAS TECNICAS DESTACADAS", 20, 74);

      // Array de características destacadas
      const techSpecs = [
        {
          title: "Sincronización Privada Inmediata",
          desc: "Tus favoritos y listas se respaldan en tiempo real en nuestra infraestructura global segura, garantizando privacidad y disponibilidad inmediata sin dependencias públicas visibles."
        },
        {
          title: "Colección de Avatares Élite Integrada",
          desc: "Ofrece a los usuarios personalización premium con nuevos diseños exclusivos HD, gradientes dinámicos y sellos de rareza que incrementan el valor percibido y el engagement."
        },
        {
          title: "Centro de Notificaciones en Tiempo Real",
          desc: "Comunícate con tu audiencia de manera fluida y profesional desde la cabecera. Un historial de novedades unificado y directo al consumidor, sin interrupciones ni ventanas emergentes."
        },
        {
          title: "Modo Inmersivo Perpetuo y Bajo Consumo",
          desc: "Diseñada como un ecosistema ininterrumpido. Flux neutraliza orgánicamente el bloqueo del dispositivo activando motores de muy bajo consumo. La música brilla y la pantalla se mantiene viva eternamente."
        }
      ];

      let featY = 82;
      techSpecs.forEach((spec) => {
        // Cuadrado verde como viñeta
        doc.setFillColor(30, 215, 96);
        doc.rect(20, featY, 3.5, 3.5, "F");

        // Título de la característica
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(spec.title, 26, featY + 3);

        // Descripción de la característica
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        
        const splitDesc = doc.splitTextToSize(spec.desc, 160);
        doc.text(splitDesc, 26, featY + 8);

        featY += 10 + (splitDesc.length * 4.5);
      });


      // PAGE 3: MODELOS DE LICENCIA, TARIFAS Y COMPARACIÓN
      doc.addPage();

      // Banda verde superior
      doc.setFillColor(30, 215, 96); 
      doc.rect(0, 0, 210, 12, "F");

      // Cabecera superior
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("FLUX MUSIC • DOSSIER COMERCIAL & PROYECTO B2B", 20, 20);
      doc.text("PAGINA 3", 190, 20, { align: "right" });

      // Línea divisora
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, 22.5, 190, 22.5);

      // TÍTULO DE TARIFAS
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("2. Modelos de Licencia y Tarifas", 20, 35);

      // Barra acentuada
      doc.setFillColor(30, 215, 96);
      doc.rect(20, 38, 170, 1, "F");

      // Párrafo introductorio
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const textRates = "Nuestras tarifas estan estructuradas en Euros (EUR) de forma transparente y optimizada, pensada para ofrecer una alternativa legal ultra-accesible y maximizar la conversion frente a los competidores tradicionales.";
      const splitRates = doc.splitTextToSize(textRates, 170);
      let yRates = 45;
      splitRates.forEach((line: string) => {
        doc.text(line, 20, yRates);
        yRates += 5.2;
      });

      // TARJETA DE PLAN 1: PLAN INDIVIDUAL (4,99 EUR)
      const p1X = 20;
      const p1Y = 58;
      const cardHeight = 31;
      
      // Dibujar fondo de tarjeta
      doc.setFillColor(248, 250, 252); // Soft light slate background
      doc.rect(p1X, p1Y, 170, cardHeight, "F");
      // Outline sutil
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(p1X, p1Y, 170, cardHeight, "S");
      // Línea izquierda verde ancha de la tarjeta
      doc.setFillColor(30, 215, 96);
      doc.rect(p1X, p1Y, 2.5, cardHeight, "F");

      // Textos Tarjeta 1
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("PLAN INDIVIDUAL", p1X + 6, p1Y + 6);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 215, 96);
      doc.text("4,99 EUR / mes", 190 - 6, p1Y + 6, { align: "right" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Para 1 Usuario Personal", p1X + 6, p1Y + 11);

      // Viñetas dobles en la tarjeta
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("• Acceso completo personal", p1X + 6, p1Y + 18);
      doc.text("• Listas personalizadas ilimitadas", p1X + 6, p1Y + 24);
      doc.text("• Buscador global integrado", p1X + 85, p1Y + 18);
      doc.text("• Sincronizacion de favoritos", p1X + 85, p1Y + 24);


      // TARJETA DE PLAN 2: PLAN DUO (7,99 EUR)
      const p2X = 20;
      const p2Y = 94;

      // Dibujar fondo de tarjeta
      doc.setFillColor(248, 250, 252); 
      doc.rect(p2X, p2Y, 170, cardHeight, "F");
      // Outline sutil
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.rect(p2X, p2Y, 170, cardHeight, "S");
      // Línea izquierda verde ancha
      doc.setFillColor(30, 215, 96);
      doc.rect(p2X, p2Y, 2.5, cardHeight, "F");

      // Textos Tarjeta 2
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("PLAN DUO (Premium Duo)", p2X + 6, p2Y + 6);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 215, 96);
      doc.text("7,99 EUR / mes", 190 - 6, p2Y + 6, { align: "right" });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Para 2 Usuarios Simultaneos", p2X + 6, p2Y + 11);

      // Viñetas dobles
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text("• Ideal para parejas o amigos", p2X + 6, p2Y + 18);
      doc.text("• Doble stream activo a la vez", p2X + 6, p2Y + 24);
      doc.text("• Perfiles aislados de favoritos", p2X + 85, p2Y + 18);
      doc.text("• Comparticion simplificada", p2X + 85, p2Y + 24);


      // 4. NUESTRAS TARIFAS COMPARADAS (TABLA DE MERCADO PREMIUM)
      let tableY = 135;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("TABLA COMPARATIVA CON OTRAS GRANDES PLATAFORMAS", 20, tableY);

      tableY += 5;
      // Dibujar cabecera de la tabla
      doc.setFillColor(30, 215, 96); // Verde Flux
      doc.rect(20, tableY, 170, 7.5, "F");
      
      doc.setTextColor(15, 23, 42); // Texto oscuro legible en verde
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("PLATAFORMA (STREAMING MUSICA)", 23, tableY + 5);
      doc.text("PLAN DE ACCESO", 93, tableY + 5);
      doc.text("PRECIO MENSUAL", 143, tableY + 5);

      tableY += 7.5;

      const comparisons = [
        { name: "Spotify Premium Individual", plan: "1 Usuario", price: "11,99 e / mes", highlight: false },
        { name: "Apple Music Individual", plan: "1 Usuario", price: "10,99 e / mes", highlight: false },
        { name: "Amazon Music Unlimited", plan: "1 Usuario", price: "10,99 e / mes", highlight: false },
        { name: "Flux Music Premium (1 Usuario)", plan: "1 Usuario", price: "4,99 e / mes (¡Ahorras más del 55%!)", highlight: true },
        { name: "Flux Music Premium (2 Usuarios)", plan: "2 Usuarios", price: "7,99 e / mes (¡Ahorras más del 60%!)", highlight: true }
      ];

      comparisons.forEach((row, i) => {
        // Fondo alternativo claro
        if (row.highlight) {
          doc.setFillColor(240, 253, 244); // Color menta pastel muy suave
        } else {
          doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
        }
        
        doc.rect(20, tableY, 170, 7.5, "F");
        
        // Línea sutil de fila
        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.3);
        doc.line(20, tableY + 7.5, 190, tableY + 7.5);

        // Estilos de texto
        if (row.highlight) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(22, 163, 74); // Verde oscuro brillante
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
        }

        doc.setFontSize(8);
        doc.text(row.name, 23, tableY + 5);
        doc.text(row.plan, 93, tableY + 5);
        doc.text(row.price, 143, tableY + 5);

        tableY += 7.5;
      });

      // Texto de finalización e información útil
      tableY += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("¿Como solicitar la activacion y sincronizacion?", 20, tableY);

      tableY += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const requestText = "Para formalizar el alta de cualquiera de los planes, simplemente registrate y haz clic en probar gratis. Dado el control estricto de recursos y velocidad de stream, las activaciones de slot e invitaciones se gestionan de forma personalizada.";
      const splitRequest = doc.splitTextToSize(requestText, 170);
      splitRequest.forEach((line: string) => {
        doc.text(line, 20, tableY);
        tableY += 4.5;
      });

      // Conclusión en verde al pie
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 215, 96);
      doc.text("PROYECTO COMPLEMENTARIO DESARROLLADO BAJO ESTANDAR COMERCIAL PREMIUM FY26", 105, 275, { align: "center" });

      doc.save("Presentacion_Comercial_Flux_Music.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF de la presentación.");
    }
  };

  const fetchSupportMessages = async () => {
    try {
      setLoadingMessages(true);
      const snap = await getDocs(collection(db, "support_messages"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setSupportMessages(list);
    } catch (e) {
      console.error("Error loaded support messages:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteSupportMessage = async (msgId: string) => {
    try {
      if (!window.confirm("¿Eliminar este mensaje de soporte?")) return;
      setSupportMessages(prev => prev.filter(m => m.id !== msgId));
      await deleteDoc(doc(db, "support_messages", msgId));
    } catch (err) {
      console.error("Error deleting support message:", err);
      fetchSupportMessages();
    }
  };

  const fetchTelegramConfig = async () => {
    try {
      const docRef = doc(db, "system_settings", "telegram");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const bToken = data.botToken || "";
        const cId = data.chatId || "";
        setTelegramToken(bToken);
        setTelegramChatId(cId);

        // Warm up backend cache with these credentials
        if (bToken && cId) {
          fetch("/api/support/register-telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              botToken: bToken.trim(),
              chatId: cId.trim(),
              adminEmail: "eltygere8651@gmail.com"
            })
          }).catch(err => console.error("Error warming up backend Telegram parameters:", err));
        }
      }
    } catch (e) {
      console.error("Error loading Telegram config:", e);
    }
  };

  const saveTelegramConfig = async () => {
    try {
      setIsSavingTelegram(true);
      const bToken = telegramToken.trim();
      const cId = telegramChatId.trim();

      const docRef = doc(db, "system_settings", "telegram");
      await setDoc(docRef, {
        botToken: bToken,
        chatId: cId,
        updatedAt: Date.now()
      });

      // Synchronize directly with the backend server as well
      await fetch("/api/support/register-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: bToken,
          chatId: cId,
          adminEmail: "eltygere8651@gmail.com"
        })
      });

      alert("¡Configuración de Telegram guardada y sincronizada correctamente!");
    } catch (e) {
      console.error(e);
      alert("Error al guardar la configuración.");
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const testTelegramConfig = async () => {
    if (!telegramToken.trim() || !telegramChatId.trim()) {
      alert("Por favor, llena los campos de Token y Chat ID antes de probar.");
      return;
    }
    try {
      setIsTestingTelegram(true);
      const testText = "🔔 *¡Conexión Exitosa!*\nEste es un mensaje de prueba desde tu aplicación *Flux Music*. Las solicitudes de acceso de 7 días te llegarán aquí.";
      
      const response = await fetch(`https://api.telegram.org/bot${telegramToken.trim()}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId.trim(),
          text: testText,
          parse_mode: "Markdown"
        })
      });

      if (response.ok) {
        alert("¡Mensaje de prueba enviado con éxito a tu Telegram! Revisa tu chat.");
      } else {
        const errJson = await response.json();
        alert(`Error de Telegram: ${errJson.description || "Desconocido"}`);
      }
    } catch (err: any) {
      alert(`Error al enviar mensaje de prueba: ${err.message || err}`);
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const snap = await getDocs(collection(db, "trial_requests"));
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      
      // Sort newly arrived requests (pending) first, then by descending chronological order
      list.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      
      setRequests(list);
    } catch (e) {
      console.error("Error loaded trial requests:", e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const adjustYesterdayTrials = async () => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      const msPerDay = 1000 * 60 * 60 * 24;
      const now = Date.now();
      let count = 0;

      for (const u of usersList) {
        if (u.plan === "free" && u.trialStart && u.email !== "eltygere8651@gmail.com") {
          const currentDuration = u.trialDuration || 14; 
          const isRecent = (now - u.trialStart) < (3 * msPerDay);
          
          if (currentDuration === 14 && isRecent) {
            await updateDoc(doc(db, "users", u.id), {
              trialDuration: 7,
              trialStart: now - 1 * msPerDay
            });
            count++;
          }
        }
      }
      if (count > 0) {
        alert(`Se han detectado y corregido ${count} usuario(s) de prueba de ayer a 7 días de prueba (con 6 días restantes hoy).`);
        fetchUsers();
      }
    } catch (err) {
      console.error("Error adjusting yesterday trials:", err);
    }
  };

  const handleApproveRequest = async (req: any) => {
    try {
      if (!window.confirm(`¿Aprobar prueba de 7 días para ${req.email}?`)) return;
      
      await updateDoc(doc(db, "users", req.uid), {
        plan: "free",
        trialStart: Date.now(),
        trialDuration: 7,
        subscriptionEnd: null
      });

      await updateDoc(doc(db, "trial_requests", req.id), {
        status: "approved"
      });

      alert("Acceso de prueba de 7 días activado y solicitud aprobada con éxito!");
      fetchUsers();
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Error al aprobar la solicitud. Revisa si el usuario existe.");
    }
  };

  const handleRejectRequest = async (reqId: string) => {
    try {
      if (!window.confirm("¿Rechazar esta solicitud de prueba?")) return;
      await updateDoc(doc(db, "trial_requests", reqId), {
        status: "rejected"
      });
      alert("Solicitud rechazada.");
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRequestRecord = async (reqId: string) => {
    try {
      if (!window.confirm("¿Eliminar registro de esta solicitud?")) return;
      await deleteDoc(doc(db, "trial_requests", reqId));
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

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

  const grantTrial = async (userId: string, durationDays: number = 7) => {
    try {
      if (!window.confirm(`¿Activar prueba de ${durationDays} días para este usuario?`)) return;
      await updateDoc(doc(db, "users", userId), {
        plan: "free",
        trialStart: Date.now(),
        trialDuration: durationDays,
        subscriptionEnd: null
      });
      alert(`¡Prueba de ${durationDays} días activada con éxito!`);
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
          <div className="flex items-center gap-4">
            <button
              onClick={downloadPresentation}
              className="flex items-center justify-center gap-1.5 bg-[#1ED760]/10 hover:bg-[#1ED760]/20 text-[#1ED760] font-black uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#1ED760]/20 transition-all shadow-[0_0_15px_rgba(30,215,96,0.1)] active:scale-95 cursor-pointer shrink-0"
              title="Descargar Presentación Comercial en PDF"
            >
              <FluxLogoMini className="w-4 h-4 animate-pulse" />
              <span>PDF Comercial</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación del Panel */}
        <div className="flex border-b border-white/5 bg-white/[0.01] px-3 sm:px-6 py-2 gap-1 sm:gap-2 shrink-0 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
          <button
            onClick={() => setActiveTab("users")}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "users"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Usuarios <span className="hidden sm:inline">y Solicitudes</span></span>
            {requests.filter(r => r.status === "pending").length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                {requests.filter(r => r.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "notifications"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Notificaciones</span>
          </button>

          <button
            onClick={() => setActiveTab("support")}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "support"
                ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Soporte</span>
            {supportMessages.length > 0 && (
              <span className="ml-1 bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {supportMessages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab("monitor"); checkSystemHealth(); }}
            className={`shrink-0 flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
              activeTab === "monitor"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
            }`}
          >
            <Bug className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Monitor API</span>
            {systemHealth && (systemHealth.mainLibrary === "error" || systemHealth.mainLibrary === "offline" || systemHealth.planB === "offline") && (
              <span className="ml-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                !
              </span>
            )}
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 space-y-4 scrollbar-thin scrollbar-thumb-white/5">
          {activeTab === "users" && (
            <>
              {/* SECCIÓN 1: SOLICITUDES DE PRUEBA PENDIENTES */}
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 mb-2 space-y-4">
            <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Solicitudes de Prueba de 7 Días ({requests.filter(r => r.status === "pending").length})
            </h3>
            
            {loadingRequests ? (
              <div className="text-xs text-slate-500 animate-pulse">Cargando solicitudes...</div>
            ) : requests.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No hay ninguna solicitud registrada actualmente.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r: any) => {
                  const duplicateFp = requests.filter(req => req.fingerprint === r.fingerprint && req.uid !== r.uid).length > 0;
                  const duplicateIp = requests.filter(req => req.ip === r.ip && req.uid !== r.uid && r.ip !== "N/A" && r.ip !== "IP_DETECTOR_FAILED").length > 0;
                  const isFlagged = duplicateFp || duplicateIp;

                  return (
                    <div key={r.id} className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      r.status === "pending" 
                        ? isFlagged 
                          ? "bg-red-500/5 border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.05)]"
                          : "bg-emerald-500/5 border-emerald-500/10"
                        : "bg-white/[0.02] border-white/5 opacity-60"
                    }`}>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-black text-xs uppercase tracking-wide">{r.displayName || "Socio Premium"}</span>
                          <span className="text-[10px] text-slate-400 font-semibold truncate">({r.email})</span>
                          
                          {r.status === "approved" && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-[8.5px] font-black uppercase tracking-wider border border-emerald-500/10">Aprobado</span>
                          )}
                          {r.status === "rejected" && (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[8.5px] font-black uppercase tracking-wider border border-red-500/10">Rechazado</span>
                          )}
                          {r.status === "pending" && (
                            <span className="px-2 py-0.5 bg-amber-500/25 text-amber-300 rounded-md text-[8.5px] font-black uppercase tracking-wider border border-amber-500/20 animate-pulse">Pendiente</span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-mono text-slate-500">
                          <span>IP: <strong className={duplicateIp && r.status === "pending" ? "text-red-400 font-black animate-pulse" : "text-white/40"}>{r.ip || "N/A"}</strong></span>
                          <span>FINGERPRINT: <strong className={duplicateFp && r.status === "pending" ? "text-red-400 font-black" : "text-white/40"}>{r.fingerprint ? r.fingerprint.substring(0, 10) + "..." : "N/A"}</strong></span>
                          <span>SOLICITADO: <span className="text-white/20">{r.createdAt ? new Date(r.createdAt).toLocaleString() : "N/A"}</span></span>
                        </div>

                        {isFlagged && r.status === "pending" && (
                          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5 animate-shake">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Alerta: ¡Posible Multicuenta o VPN con el mismo dispositivo detectado!</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {r.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(r)}
                              className="px-3 py-1.5 bg-[#1ED760] hover:bg-[#1fdf64] text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectRequest(r.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-red-500/20 cursor-pointer"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeleteRequestRecord(r.id)}
                          className="p-1.5 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-all border border-white/5 cursor-pointer flex items-center justify-center"
                          title="Eliminar Registro"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          </>
          )}

          {activeTab === "notifications" && (
            <>
            {/* SECCIÓN NUEVA: DIFUSION DE COMUNICADOS DEL ADMIN */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 mb-2 space-y-4 text-left">
              <h3 className="text-xs font-black uppercase text-[#1ED760] tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1ED760]" /> Difundir Comunicado Global (Avisos del Admin)
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                Publica notificaciones instantáneas, incidencias de servidores, novedades importantes o parches de actualización. Todos los clientes verán un punto rojo de notificación y el mensaje en su centro de avisos.
              </p>

              <div className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                    Categoría del Comunicado
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["noticia", "urgente", "mantenimiento", "actualizacion"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAnnCategory(cat)}
                        className={`py-2 px-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          annCategory === cat
                            ? "bg-[#1ED760] text-black border-[#1ED760] font-black shadow-[0_0_10px_rgba(30,215,96,0.2)]"
                            : "bg-black/30 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title block */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                    Título del Aviso
                  </label>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Ej. Mantenimiento del Sistema o Se ha caído el servidor de transmisión"
                    className="w-full px-4 py-2.5 bg-[#0d0d0f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 focus:border-[#1ED760] transition-all font-semibold"
                  />
                </div>

                {/* Content block */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                    Mensaje / Contenido / Detalles (Corto y Premium)
                  </label>
                  <textarea
                    rows={3}
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Ej. El servidor CDN maestro está en mantenimiento programado. No debería causar cortes en tu reproductor."
                    className="w-full px-4 py-2.5 bg-[#0d0d0f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 focus:border-[#1ED760] transition-all font-semibold resize-none"
                  />
                </div>

                {/* Success/Action block */}
                {annSuccessMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-bold text-center">
                    {annSuccessMsg}
                  </div>
                )}

                <button
                  onClick={publishAnnouncement}
                  disabled={isPublishing}
                  className="w-full py-3 bg-[#1ED760] hover:bg-[#1fdf64] disabled:opacity-40 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isPublishing ? "Publicando Aviso..." : "Publicar Comunicado para Todos"}
                </button>
                <button
                  onClick={deleteActiveAnnouncement}
                  className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center mt-2"
                >
                  X Eliminar Comunicado Activo de Prueba
                </button>
              </div>
            </div>

            {/* SECCIÓN NUEVA: CONFIGURACIÓN DE TELEGRAM (COLAPSIBLE/DESPLEGABLE PREMIUM) */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden mb-2 transition-all duration-300">
              <button
                type="button"
                onClick={() => setIsTelegramConfigExpanded(!isTelegramConfigExpanded)}
                className="w-full flex items-center justify-between p-5 text-left bg-black/10 hover:bg-black/20 focus:outline-none transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <Send className="w-4 h-4 text-slate-400 group-hover:text-[#1ED760] transition-colors" />
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-300 group-hover:text-[#1ED760] tracking-wider transition-colors">
                      Configurar Notificaciones en Telegram
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Activar bots para recibir avisos de nuevos registros en tiempo real
                    </p>
                  </div>
                </div>
                <div className="p-1.5 rounded-xl bg-white/5 group-hover:bg-white/10 text-slate-400 group-hover:text-white transition-all">
                  {isTelegramConfigExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isTelegramConfigExpanded && (
                <div className="p-5 pt-1 border-t border-white/5 space-y-4 text-left animate-slideDown">
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    Conecta tu Bot de Telegram para recibir alertas en tiempo real cuando un nuevo usuario registre su cuenta de prueba de 7 días. Puedes aprobar el acceso directamente con un botón desde este panel.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                        Telegram Bot Token
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="password"
                          value={telegramToken}
                          onChange={(e) => setTelegramToken(e.target.value)}
                          placeholder="Ej. 123456789:ABCdefGhIJKlmNoPQRsT"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 focus:border-[#1ED760] transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block pl-1">
                        Telegram Chat ID
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">ID</span>
                        <input
                          type="text"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="Ej. -100123456789 o tu ID personal"
                          className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d0f] border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1ED760]/50 focus:border-[#1ED760] transition-all font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={saveTelegramConfig}
                      disabled={isSavingTelegram}
                      className="px-4 py-2.5 bg-[#1ED760] hover:bg-[#1fdf64] text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 animate-pulse hover:animate-none" />
                      {isSavingTelegram ? "Guardando..." : "Guardar Configuración"}
                    </button>
                    
                    <button
                      onClick={testTelegramConfig}
                      disabled={isTestingTelegram}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {isTestingTelegram ? "Enviando..." : "Enviar Mensaje de Prueba"}
                    </button>
                  </div>
                  
                  <div className="bg-black/40 border border-white/5 p-3 rounded-2xl text-[10px] text-slate-500 leading-relaxed font-semibold">
                    💡 <span className="text-slate-300 font-bold">Guía de Configuración Súper Rápida:</span><br/>
                    1. Abre Telegram y escribe a <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-[#1ED760] hover:underline font-bold">@BotFather</a> para crear tu bot enviando <code className="text-[#1ED760] select-all font-mono">/newbot</code>. Copia el token que te dé.<br/>
                    2. Obtén tu Chat ID escribiendo a <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-[#1ED760] hover:underline font-bold">@userinfobot</a>. Te dará tu ID personal numérico.<br/>
                    3. ¡Asegúrate de pulsar <strong className="text-white">INICIAR</strong> en tu bot creado antes para que pueda enviarte mensajes!<br/>
                    4. Introduce ambos datos arriba, pulsa <strong className="text-emerald-400">Guardar</strong> y luego <strong className="text-white">Enviar Mensaje de Prueba</strong>.
                  </div>
                </div>
              )}
            </div>
            </>
          )}

          {activeTab === "support" && (
            /* SECCIÓN NUEVA: MENSAJES DE SOPORTE */
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 mb-2 space-y-5 text-left">
              <div className="flex justify-between items-start sm:flex-row flex-col gap-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" /> Solicitudes, Fallos y Feedback Recibidos
                  </h3>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    Gestiona los reportes recibidos desde la app clasificados por canal de soporte prioritario del socio
                  </p>
                </div>
              </div>

              {/* Filtros de Tipos de Solicitudes */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center p-2 bg-black/40 border border-white/5 rounded-2xl gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {(["todos", "soporte", "fallo", "feedback"] as const).map((filter) => {
                    const labels = {
                      todos: `Todos (${supportMessages.length})`,
                      soporte: `Soporte (${supportMessages.filter(m => m.category === "soporte" || !m.category).length})`,
                      fallo: `Fallos (${supportMessages.filter(m => m.category === "fallo").length})`,
                      feedback: `Feedback (${supportMessages.filter(m => m.category === "feedback").length})`
                    };
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSupportFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          supportFilter === filter
                            ? "bg-purple-600 text-white font-extrabold shadow-[0_2px_10px_rgba(147,51,234,0.1)]"
                            : "text-slate-400 hover:text-white bg-transparent hover:bg-white/5"
                        }`}
                      >
                        {labels[filter]}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={fetchSupportMessages}
                  className="text-[9px] bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-slate-300 font-extrabold border border-white/5 cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center gap-1 shrink-0"
                >
                  Actualizar Lista
                </button>
              </div>

              {loadingMessages ? (
                <div className="text-xs text-slate-500 animate-pulse py-6 text-center">Cargando mensajes de soporte...</div>
              ) : supportMessages.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium py-6 text-center">No hay mensajes de soporte guardados en la base de datos de FLUX.</p>
              ) : supportMessages.filter((msg: any) => {
                  if (supportFilter === "todos") return true;
                  if (supportFilter === "soporte") return msg.category === "soporte" || !msg.category;
                  return msg.category === supportFilter;
                }).length === 0 ? (
                <p className="text-xs text-slate-500 font-medium py-6 text-center">No se encontraron mensajes que coincidan con el filtro seleccionado.</p>
              ) : (
                <div className="max-h-[380px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/5">
                  {supportMessages
                    .filter((msg: any) => {
                      if (supportFilter === "todos") return true;
                      if (supportFilter === "soporte") return msg.category === "soporte" || !msg.category;
                      return msg.category === supportFilter;
                    })
                    .map((msg: any) => {
                      const initial = (msg.userName || "S").charAt(0).toUpperCase();
                      const category = msg.category || "soporte";

                      // Badges customized depending on categorization
                      let badgeColor = "bg-purple-500/10 text-purple-400 border border-purple-500/20";
                      let badgeLabel = "Soporte General";
                      let BadgeIcon = MessageSquare;

                      if (category === "fallo") {
                        badgeColor = "bg-rose-500/10 text-rose-400 border border-rose-500/20";
                        badgeLabel = "Fallo Técnico";
                        BadgeIcon = Bug;
                      } else if (category === "feedback") {
                        badgeColor = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                        badgeLabel = "Feedback App";
                        BadgeIcon = Sparkles;
                      }

                      return (
                        <div key={msg.id} className="p-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col justify-between gap-4 hover:border-purple-500/10 transition-all text-left">
                          <div className="flex items-start gap-3">
                            {/* Circle initial avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-inner">
                              {initial}
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white font-black text-xs uppercase tracking-wide">{msg.userName || "Anónimo"}</span>
                                <span className="text-[9px] text-slate-500 font-semibold truncate hover:text-[#1ED760] transition-colors mr-2">
                                  ({msg.userEmail || "Sin email"})
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono ml-auto">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "N/A"}
                                </span>
                              </div>
                              
                              <div className="flex gap-2 items-center">
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${badgeColor}`}>
                                  <BadgeIcon className="w-2.5 h-2.5" />
                                  {badgeLabel}
                                </span>
                              </div>

                              <p className="text-xs text-slate-200 bg-black/40 p-3.5 rounded-xl border border-white/[0.03] whitespace-pre-wrap leading-relaxed font-semibold mt-2">
                                {msg.message}
                              </p>
                            </div>
                          </div>

                          {/* Reply direct contact & trash can footer toolbar */}
                          <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            {msg.userEmail && msg.userEmail !== "Anónimo" && msg.userEmail !== "Sin email" ? (
                              <a
                                href={`mailto:${msg.userEmail}?subject=Respuesta Prioritaria de Flux Music&body=Hola ${msg.userName || "Socio"},\n\nHemos recibido tu mensaje de ${badgeLabel.toLowerCase()}:\n"${msg.message}"\n\n[Escribe aquí tu respuesta...]`}
                                className="px-3 py-1.5 bg-[#1ED760]/10 hover:bg-[#1ED760]/20 text-[#1ED760] text-[9px] font-black uppercase tracking-wider rounded-lg transition-all border border-[#1ED760]/10 hover:border-[#1ED760]/30 cursor-pointer flex items-center gap-1.5"
                              >
                                <Send className="w-3 h-3" /> Responder por Email
                              </a>
                            ) : (
                              <span className="text-[8px] text-slate-500 font-black uppercase">Socio No Identificado</span>
                            )}

                            <button
                              onClick={() => handleDeleteSupportMessage(msg.id)}
                              className="p-1.5 bg-red-500/5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all border border-transparent hover:border-red-500/20 cursor-pointer flex items-center justify-center animate-pulse hover:animate-none"
                              title="Eliminar Reporte"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <>
              <h3 className="text-xs font-black uppercase text-purple-400 tracking-wider flex items-center gap-2 pt-2 border-t border-white/5">
            <Shield className="w-4 h-4 text-purple-400" /> Todos los Usuarios Registrados ({users.length})
          </h3>

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
                   const trialDuration = u.trialDuration || 7;
                   const trialEnd = u.trialStart + trialDuration * msPerDay;
                   if (trialEnd > now) {
                     isActive = true;
                     statusText = `Prueba ${trialDuration} días (${Math.ceil((trialEnd - now)/msPerDay)} días)`;
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
                          <button onClick={() => grantTrial(u.id, 7)} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold rounded-lg transition-colors border border-emerald-500/20 cursor-pointer text-center">
                            Prueba 7 Días
                          </button>
                          <button onClick={() => grantTrial(u.id, 14)} className="px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/30 text-teal-300 text-[10px] font-bold rounded-lg transition-colors border border-teal-500/20 cursor-pointer text-center">
                            Prueba 14 Días
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
          </>
          )}

          {activeTab === "monitor" && (
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-5 mb-2 space-y-6 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-2">
                  <Bug className="w-4 h-4 text-emerald-400" /> Monitor del Ecosistema de Audio
                </h3>
                <button
                  onClick={checkSystemHealth}
                  disabled={isCheckingHealth}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-wider text-slate-300 rounded-lg transition-all border border-white/5 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isCheckingHealth ? <span className="animate-pulse">Verificando...</span> : "Verificar Ahora"}
                </button>
              </div>

              {!systemHealth && isCheckingHealth ? (
                <div className="text-center py-8 text-xs text-slate-500 animate-pulse font-medium">
                  Realizando ping a los motores de extracción (Librería Principal y Plan B)...
                </div>
              ) : systemHealth ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border flex items-center justify-between ${systemHealth.mainLibrary === "online" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-200">Motor Principal (Librería YouTube)</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Motor principal de la app para extraer audios HQ</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${systemHealth.mainLibrary === "online" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${systemHealth.mainLibrary === "online" ? "text-emerald-400" : "text-red-400"}`}>
                        {systemHealth.mainLibrary === "online" ? "Operativo" : systemHealth.mainLibrary === "error" ? "Bloqueado / Error" : "Caído"}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center justify-between ${systemHealth.planB === "online" ? "bg-blue-500/5 border-blue-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-200">Motor Plan B (Piped/Invidious)</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Nodos de respaldo automático antifatiga</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${systemHealth.planB === "online" ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" : "bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"}`} />
                      <span className={`text-[9px] font-black uppercase tracking-widest ${systemHealth.planB === "online" ? "text-blue-400" : "text-red-400"}`}>
                        {systemHealth.planB === "online" ? "Operativo" : "Nodos Caídos"}
                      </span>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-500 font-mono text-center pt-2">
                    Última comprobación: {new Date(systemHealth.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-medium">
                  Información no disponible. Pulsa Verificar Ahora.
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Fixed Close Button */}
        <div className="sm:hidden flex shrink-0 p-3 bg-[#0a0a0c] border-t border-white/5 mt-auto">
          <button 
            onClick={onClose}
            className="w-full py-2.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 text-slate-300 hover:text-white font-black uppercase tracking-[0.15em] text-[10px] rounded-lg border border-white/5 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.05)]"
          >
            <X className="w-4 h-4 text-purple-400" />
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
};
