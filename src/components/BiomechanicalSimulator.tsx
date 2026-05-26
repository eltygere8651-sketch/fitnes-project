import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, RefreshCw, AlertCircle, ShieldCheck, ZapOff, Activity, Dumbbell, Sparkles } from "lucide-react";

// Safe polyfill for older browsers and sandboxed environments
const safeRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
};

// Generates highly realistic human facial features, determined expressions, athletic hair and DJ headphones
const drawHumanCharacterHead = (
  ctx: CanvasRenderingContext2D,
  center: { x: number; y: number },
  skinColor: string,
  isCorrect: boolean,
  facingLeft: boolean = true
) => {
  ctx.save();
  
  // Real skin tone gradient with 3D volume
  const faceGrad = ctx.createRadialGradient(center.x, center.y, 2, center.x, center.y, 11);
  faceGrad.addColorStop(0, skinColor);
  faceGrad.addColorStop(0.7, skinColor);
  faceGrad.addColorStop(1, isCorrect ? "#d49b72" : "#f87171");
  
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 11, 0, Math.PI * 2);
  ctx.fill();

  // Hair styling with charcoal color depth
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(center.x, center.y - 4, 11, Math.PI, Math.PI * 2);
  ctx.fill();
  
  // Dynamic swinging athletic ponytail/cap details for human hair realism
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  const dir = facingLeft ? 1 : -1;
  ctx.moveTo(center.x + dir * 6, center.y - 6);
  ctx.quadraticCurveTo(center.x + dir * 16, center.y + 3, center.x + dir * 18, center.y + 1);
  ctx.quadraticCurveTo(center.x + dir * 10, center.y - 4, center.x + dir * 4, center.y - 8);
  ctx.fill();

  // Focused determined eye line
  ctx.fillStyle = "#0f172a";
  const eyeX = center.x + (facingLeft ? -4 : 4);
  const eyeY = center.y - 2;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Energetic determined eyebrow
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(eyeX - 2, eyeY - 2);
  ctx.lineTo(eyeX + 2, eyeY - 2);
  ctx.stroke();

  // Human nose definition
  ctx.strokeStyle = "rgba(100, 50, 50, 0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(center.x + (facingLeft ? -8 : 8), center.y);
  ctx.lineTo(center.x + (facingLeft ? -11 : 11), center.y + 2);
  ctx.lineTo(center.x + (facingLeft ? -8 : 8), center.y + 4);
  ctx.stroke();

  // Determined / exhaling mouth
  ctx.strokeStyle = isCorrect ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(center.x + (facingLeft ? -3 : 3), center.y + 4, 3, 0.2, Math.PI - 0.2, false);
  ctx.stroke();

  // Stylish DJ Gym headphones
  ctx.strokeStyle = "rgba(79, 70, 229, 0.95)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 11.5, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();

  // Ear cushions
  ctx.fillStyle = "#0f172a";
  ctx.strokeStyle = "rgba(110, 231, 183, 0.9)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(center.x + (facingLeft ? 2 : -2), center.y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
};

interface BiomechanicalSimulatorProps {
  exerciseId: string;
  isCorrect: boolean;
}

export default function BiomechanicalSimulator({ exerciseId, isCorrect }: BiomechanicalSimulatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubValue, setScrubValue] = useState(0); // 0 to 100
  const [speed, setSpeed] = useState(1); // 0.5 or 1
  const [showSkeleton, setShowSkeleton] = useState(false); // Default to gorgeous realistic body
  const [showAngles, setShowAngles] = useState(true);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0); // 0 to 1 path
  
  // High energy particle emitters array for contraction peaks
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number; life: number }>>([]);

  useEffect(() => {
    progressRef.current = 0;
    setScrubValue(0);
  }, [exerciseId, isCorrect]);

  useEffect(() => {
    const handleAnimationFrame = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (isPlaying) {
        const cycleSpeed = (0.0004 * speed);
        progressRef.current = (progressRef.current + delta * cycleSpeed) % 1;
        setScrubValue(Math.round(progressRef.current * 100));
      }

      drawFrame();
      requestRef.current = requestAnimationFrame(handleAnimationFrame);
    };

    requestRef.current = requestAnimationFrame(handleAnimationFrame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, speed, exerciseId, isCorrect, showSkeleton, showAngles]);

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
    progressRef.current = val / 100;
    setIsPlaying(false);
    drawFrame();
  };

  // Helper utility to draw organic human muscles and limbs with gradients
  const drawMuscleLimb = (
    ctx: CanvasRenderingContext2D,
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    baseWidth: number,
    muscleGirth: number,
    skinColor: string,
    gearColor: string | null,
    highlightColor: string | null
  ) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return;

    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;

    ctx.save();
    
    // Draw thick muscle body shape with bulging midsection
    ctx.beginPath();
    
    // Joint start rounded curve
    const startLeftX = p1.x + nx * baseWidth;
    const startLeftY = p1.y + ny * baseWidth;
    const startRightX = p1.x - nx * baseWidth;
    const startRightY = p1.y - ny * baseWidth;

    // Muscular bulge mid-sections points
    const midX = p1.x + dx * 0.5;
    const midY = p1.y + dy * 0.5;
    const midLeftX = midX + nx * (baseWidth + muscleGirth);
    const midLeftY = midY + ny * (baseWidth + muscleGirth);
    const midRightX = midX - nx * (baseWidth + muscleGirth);
    const midRightY = midY - ny * (baseWidth + muscleGirth);

    // End points
    const endLeftX = p2.x + nx * (baseWidth * 0.85);
    const endLeftY = p2.y + ny * (baseWidth * 0.85);
    const endRightX = p2.x - nx * (baseWidth * 0.85);
    const endRightY = p2.y - ny * (baseWidth * 0.85);

    // Draw the anatomical curved paths representing quadriceps / biceps
    ctx.moveTo(startLeftX, startLeftY);
    ctx.quadraticCurveTo(midLeftX, midLeftY, endLeftX, endLeftY);
    ctx.lineTo(endRightX, endRightY);
    ctx.quadraticCurveTo(midRightX, midRightY, startRightX, startRightY);
    ctx.closePath();

    // Create 3D skin tone lighting gradient
    const grad = ctx.createLinearGradient(p1.x - nx * baseWidth, p1.y - ny * baseWidth, p1.x + nx * baseWidth, p1.y + ny * baseWidth);
    grad.addColorStop(0, "rgba(30, 41, 59, 0.95)"); // Deep athletic shadow
    grad.addColorStop(0.3, skinColor);
    grad.addColorStop(0.7, skinColor);
    grad.addColorStop(1, "rgba(15, 23, 42, 0.9)");

    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Gym sportswear apparel if gearColor is provided (shorts, sleeve, shirt segments)
    if (gearColor) {
      ctx.fillStyle = gearColor;
      ctx.beginPath();
      ctx.moveTo(startLeftX, startLeftY);
      // Cover half leg/arm with sporty wear
      const apparelMidLeftX = p1.x + dx * 0.45 + nx * (baseWidth + muscleGirth * 0.9);
      const apparelMidLeftY = p1.y + dy * 0.45 + ny * (baseWidth + muscleGirth * 0.9);
      const apparelMidRightX = p1.x + dx * 0.45 - nx * (baseWidth + muscleGirth * 0.9);
      const apparelMidRightY = p1.y + dy * 0.45 - ny * (baseWidth + muscleGirth * 0.9);
      
      ctx.quadraticCurveTo(apparelMidLeftX, apparelMidLeftY, p1.x + dx * 0.45, p1.y + dy * 0.45);
      ctx.lineTo(p1.x + dx * 0.45, p1.y + dy * 0.45);
      ctx.quadraticCurveTo(apparelMidRightX, apparelMidRightY, startRightX, startRightY);
      ctx.closePath();
      ctx.fill();
    }

    // Active muscle overlay heat-map showing physical contraction
    if (highlightColor) {
      const activeGrad = ctx.createRadialGradient(midX, midY, 1, midX, midY, baseWidth + muscleGirth * 1.5);
      activeGrad.addColorStop(0, highlightColor);
      activeGrad.addColorStop(0.5, highlightColor.replace("1)", "0.55)"));
      activeGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
      
      ctx.fillStyle = activeGrad;
      ctx.beginPath();
      ctx.moveTo(startLeftX, startLeftY);
      ctx.quadraticCurveTo(midLeftX, midLeftY, endLeftX, endLeftY);
      ctx.lineTo(endRightX, endRightY);
      ctx.quadraticCurveTo(midRightX, midRightY, startRightX, startRightY);
      ctx.closePath();
      ctx.fill();
    }

    // High quality musculature contour outline
    ctx.strokeStyle = highlightColor ? highlightColor : "rgba(168, 85, 247, 0.25)";
    ctx.lineWidth = highlightColor ? 2 : 1;
    ctx.stroke();

    ctx.restore();
  };

  // Particle updates
  const updateParticles = (ctx: CanvasRenderingContext2D) => {
    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      p.size *= 0.96;
      p.life--;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.life <= 0 || p.alpha <= 0) {
        list.splice(i, 1);
      }
    }
  };

  const spawnSparkShower = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.7) * 4 - 1,
        color,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1,
        life: Math.floor(Math.random() * 25 + 20),
      });
    }
  };

  // Main high fidelity drawing engine
  const drawFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Cinematic Neon Cyber Gym Background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, "#0e1322"); // Ultra premium deep charcoal athletic night blue
    skyGrad.addColorStop(1, "#06080e");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Dynamic grid floor
    ctx.strokeStyle = "rgba(79, 70, 229, 0.06)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let j = 0; j < height; j += 25) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
      ctx.stroke();
    }

    // DRAW RECTANGULAR GYM MIRROR WITH NEON LED GLOW LIMITS
    ctx.save();
    ctx.shadowBlur = 12;
    // Glow depends on correctness (Green Motivation vs Hot Red Danger Warning)
    ctx.shadowColor = isCorrect ? "#10b981" : "#ef4444";
    ctx.strokeStyle = isCorrect ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 30, width - 80, height - 75);

    // Gym Dumbbler Rack outlines behind the athlete (adds absolute realism)
    ctx.fillStyle = "rgba(30, 41, 59, 0.15)";
    ctx.fillRect(50, 150, 45, 45);
    ctx.strokeStyle = "rgba(100, 116, 139, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(50, 150, 45, 45);
    // Draw micro dumbbells on rack
    ctx.fillStyle = "rgba(148, 163, 184, 0.2)";
    ctx.fillRect(54, 158, 10, 5);
    ctx.fillRect(72, 158, 10, 5);
    ctx.fillRect(54, 175, 12, 6);
    ctx.fillRect(72, 175, 12, 6);
    ctx.restore();

    // Floor platform
    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.fillRect(0, 215, width, height - 215);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, 215);
    ctx.lineTo(width - 10, 215);
    ctx.stroke();

    // Dynamic ground halo under athlete
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(200, 215, 65, 15, 0, 0, Math.PI * 2);
    const floorGlow = ctx.createRadialGradient(200, 215, 5, 200, 215, 70);
    floorGlow.addColorStop(0, isCorrect ? "rgba(52, 211, 153, 0.22)" : "rgba(248, 113, 113, 0.18)");
    floorGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = floorGlow;
    ctx.fill();
    ctx.restore();

    // 2. Cycle Calculation (Ping-pong animation)
    const t = progressRef.current;
    const cycle = (Math.sin(t * Math.PI * 2 - Math.PI / 2) + 1) / 2;

    // Coordinates mapping
    interface Point { x: number; y: number }
    let joints: { [key: string]: Point } = {};
    let angleVal = 0;
    let angleLabel = "";
    let forceMeter = 0;
    let safetyStatus = isCorrect ? 98 : 34;

    // Body skins color & Gear visual styles selection
    const skinColor = isCorrect ? "#fbcfe8" : "#fca5a5"; // Healthy glowing tone vs strained flushed red tone
    const shortsColor = "rgba(59, 130, 246, 0.9)"; // Sports rich blue spandex shorts
    const shirtColor = isCorrect ? "rgba(99, 102, 241, 0.85)" : "rgba(127, 29, 29, 0.85)"; // High tech compression armor blue vs red
    const muscleGlow = isCorrect ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.8)"; // Green optimal effort vs bad strain
    const skeletonLineColor = isCorrect ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.5)";

    // SPECIFIC SENSORS AND COORDINATES FOR ALL EXERCISES
    if (exerciseId === "squat") {
      const ankleX = 200;
      const ankleY = 210;
      let kneeX = 200;
      let kneeY = 160;
      let hipX = 200;
      let hipY = 110;
      let shoulderX = 200;
      let shoulderY = 60;
      let headX = 200;
      let headY = 40;

      if (isCorrect) {
        // Flat heels, glutes sit back, knees check with ankles
        kneeX = 180 + (200 - 180) * (1 - cycle);
        kneeY = 182 - (182 - 160) * (1 - cycle);
        hipX = 236 - (236 - 200) * (1 - cycle);
        hipY = 180 - (180 - 110) * (1 - cycle);
        shoulderX = 210 - (210 - 200) * (1 - cycle);
        shoulderY = 125 - (125 - 60) * (1 - cycle);
        headX = 214 - (214 - 200) * (1 - cycle);
        headY = 105 - (105 - 40) * (1 - cycle);
        
        angleVal = Math.round(75 + cycle * 105);
        angleLabel = "Ángulo Rodilla";
        forceMeter = Math.round(25 + cycle * 60);

        // At maximum contraction (apex cycle near 1), spawn motivating spark showers once in a while
        if (cycle > 0.95 && isPlaying && Math.random() < 0.25) {
          spawnSparkShower(kneeX, kneeY, "#34d399");
          spawnSparkShower(hipX, hipY, "#60a5fa");
        }
      } else {
        // Heel lifts up (faulty posture!), knees shoot forward too far, lower spine rounds heavily
        const heelYOffset = cycle * 14; 
        kneeX = 165 + (200 - 165) * (1 - cycle); 
        kneeY = 184 - (184 - 160) * (1 - cycle) - heelYOffset;
        hipX = 210 - (210 - 200) * (1 - cycle); 
        hipY = 175 - (175 - 110) * (1 - cycle) - heelYOffset;
        shoulderX = 172 + (200 - 172) * (1 - cycle); 
        shoulderY = 142 - (142 - 60) * (1 - cycle) - heelYOffset;
        headX = 178 + (200 - 178) * (1 - cycle);
        headY = 122 - (122 - 40) * (1 - cycle) - heelYOffset;

        angleVal = Math.round(65 + cycle * 115);
        angleLabel = "Estrés Articular y Talón Levantado";
        forceMeter = Math.round(55 + cycle * 45);
        safetyStatus = Math.round(45 - cycle * 20);

        if (cycle > 0.9 && isPlaying && Math.random() < 0.15) {
          // Spark red warning flares
          spawnSparkShower(kneeX, kneeY + 10, "#ef4444");
        }
      }

      joints = { ankle: { x: ankleX, y: isCorrect ? ankleY : ankleY - cycle * 14 }, knee: { x: kneeX, y: kneeY }, hip: { x: hipX, y: hipY }, shoulder: { x: shoulderX, y: shoulderY }, head: { x: headX, y: headY } };
    } 
    else if (exerciseId === "pushup") {
      const feetX = 295;
      const feetY = 205;
      let wristX = 120;
      let wristY = 210;
      let shoulderX = 145;
      let shoulderY = 130;
      let elbowX = 120;
      let elbowY = 165;
      let hipX = 225;
      let hipY = 165;
      let headX = 110;
      let headY = 115;

      if (isCorrect) {
        // Perfect core rigid rod lowering together
        const descent = cycle * 45;
        shoulderX = 145;
        shoulderY = 130 + descent;
        elbowX = 180 - cycle * 15;
        elbowY = 160 + descent * 0.45;
        hipX = 225;
        hipY = 165 + descent * 0.85;
        headX = 110;
        headY = 115 + descent;

        angleVal = Math.round(180 - descent * 0.4);
        angleLabel = "Alineación Torso";
        forceMeter = Math.round(30 + cycle * 65);

        if (cycle > 0.95 && isPlaying && Math.random() < 0.2) {
          spawnSparkShower(shoulderX, shoulderY, "#a78bfa");
        }
      } else {
        // Sagging back core, hips touch the ground too early, putting heavy load list
        const descent = cycle * 45;
        shoulderX = 145;
        shoulderY = 130 + descent * 0.7; 
        elbowX = 100 - cycle * 10; 
        elbowY = 150 + descent * 0.4;
        hipX = 220;
        hipY = 165 + descent * 1.38; // dips too fast
        headX = 115;
        headY = 115 + descent * 0.7;

        angleVal = Math.round(145 - cycle * 35);
        angleLabel = "Hiperextensión Lumbar Genuina";
        forceMeter = Math.round(65 + cycle * 30);
        safetyStatus = Math.round(48 - cycle * 28);
      }

      joints = { feet: { x: feetX, y: feetY }, hip: { x: hipX, y: hipY }, shoulder: { x: shoulderX, y: shoulderY }, elbow: { x: elbowX, y: elbowY }, wrist: { x: wristX, y: wristY }, head: { x: headX, y: headY } };
    } 
    else if (exerciseId === "row") {
      // Horizontal row support details
      const handBenchX = 130;
      const handBenchY = 160;
      const footFloorX = 260;
      const footFloorY = 212;
      const hipX = 225;
      const hipY = 115;
      let shoulderX = 140;
      let shoulderY = 110;
      let headX = 110;
      let headY = 95;
      
      let weightX = 175;
      let weightY = 185;
      let elbowX = 175;
      let elbowY = 150;

      // Draw Supporting bench Shape
      ctx.fillStyle = "rgba(40, 50, 70, 0.45)";
      ctx.fillRect(110, 155, 130, 15);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.6)";
      ctx.strokeRect(110, 155, 130, 15);
      // Bench feet
      ctx.beginPath();
      ctx.moveTo(125, 170); ctx.lineTo(125, 215);
      ctx.moveTo(225, 170); ctx.lineTo(225, 215);
      ctx.stroke();

      if (isCorrect) {
        // Pull lats close to ribs, flat table back
        shoulderY = 110;
        weightX = 175 + cycle * 45;
        weightY = 185 - cycle * 65;
        elbowX = 175 + cycle * 55;
        elbowY = 135 - cycle * 55;

        angleVal = Math.round(180 - cycle * 10);
        angleLabel = "Alineación Dorsal Lats";
        forceMeter = Math.round(20 + cycle * 75);

        if (cycle > 0.95 && isPlaying && Math.random() < 0.2) {
          spawnSparkShower(elbowX, elbowY, "#f59e0b");
        }
      } else {
        // Hump spine, shoulder hunching, pulling too vertical with arms
        weightX = 175 + cycle * 10; 
        weightY = 185 - cycle * 55;
        elbowX = 175;
        elbowY = 135 - cycle * 35;

        angleVal = Math.round(130 - cycle * 15);
        angleLabel = "Cifosis Espinal Severa";
        forceMeter = Math.round(60 + cycle * 25);
        safetyStatus = Math.round(38 - cycle * 15);
      }

      joints = { 
        handBench: { x: handBenchX, y: handBenchY }, 
        footFloor: { x: footFloorX, y: footFloorY },
        hip: { x: hipX, y: hipY },
        shoulder: { x: shoulderX, y: shoulderY },
        head: { x: headX, y: headY },
        weight: { x: weightX, y: weightY },
        elbow: { x: elbowX, y: elbowY }
      };
    } 
    else if (exerciseId === "deadlift") {
      // RDL Romanian deadlift coordinates
      const ankleX = 180;
      const ankleY = 210;
      let kneeX = 180;
      let kneeY = 165;
      let hipX = 180;
      let hipY = 110;
      let shoulderX = 180;
      let shoulderY = 60;
      let headX = 180;
      let headY = 40;

      let barlX = 170;
      let barY = 120;

      if (isCorrect) {
        // Flat back, barbell scrapes thighs, hip hinge pushed backward
        kneeX = 192 - cycle * 8;
        kneeY = 165;
        hipX = 240 - (240 - 180) * (1 - cycle); 
        hipY = 145 - (145 - 110) * (1 - cycle); 
        shoulderX = 160 + (180 - 160) * (1 - cycle); 
        shoulderY = 125 - (125 - 60) * (1 - cycle);
        headX = 145 + (180 - 145) * (1 - cycle); 
        headY = 108 - (108 - 40) * (1 - cycle);

        barlX = shoulderX; 
        barY = shoulderY + 55;

        angleVal = Math.round(175 - cycle * 95); 
        angleLabel = "Bisagra Cadera";
        forceMeter = Math.round(25 + cycle * 70);

        if (cycle > 0.95 && isPlaying && Math.random() < 0.22) {
          spawnSparkShower(hipX, hipY, "#fbbf24");
        }
      } else {
        // Spine rounded horribly like a dome, bar drops far out away from shins
        kneeX = 180;
        kneeY = 165;
        hipX = 212 - (212 - 180) * (1 - cycle); 
        hipY = 135 - (135 - 110) * (1 - cycle);
        shoulderX = 158 + (180 - 158) * (1 - cycle); 
        shoulderY = 138 - (138 - 60) * (1 - cycle);
        headX = 160 + (180 - 160) * (1 - cycle); 
        headY = 115 - (115 - 40) * (1 - cycle);

        barlX = shoulderX - 25 * cycle; 
        barY = shoulderY + 50;

        angleVal = Math.round(135 - cycle * 30);
        angleLabel = "Presión L5-S1 Discal Crítica";
        forceMeter = Math.round(75 + cycle * 25);
        safetyStatus = Math.round(40 - cycle * 28);
      }

      joints = { ankle: { x: ankleX, y: ankleY }, knee: { x: kneeX, y: kneeY }, hip: { x: hipX, y: hipY }, shoulder: { x: shoulderX, y: shoulderY }, head: { x: headX, y: headY }, bar: { x: barlX, y: barY } };
    } 
    else if (exerciseId === "arnold") {
      // Seated overhead shoulder press
      const seatBottomY = 180;
      const seatLeft = 140;
      const seatRight = 260;

      // Bench shape
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(71, 85, 105, 0.4)";
      ctx.beginPath();
      ctx.moveTo(seatLeft, seatBottomY);
      ctx.lineTo(seatRight, seatBottomY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(170, seatBottomY);
      ctx.lineTo(170, 70);
      ctx.stroke();

      const hipX = 180;
      const hipY = 175;
      let shoulderX = 180;
      let shoulderY = 100;
      let headX = 180;
      let headY = 75;

      let wristRX = 150;
      let wristRY = 120;
      let wristLX = 210;
      let wristLY = 120;

      let elbowRX = 145;
      let elbowRY = 150;
      let elbowLX = 215;
      let elbowLY = 150;

      if (isCorrect) {
        // Back glued to upright, smooth vertical line
        shoulderX = 180;
        shoulderY = 100;
        
        wristRX = 160 - cycle * 20; 
        wristRY = 105 - cycle * 65; 
        elbowRX = 160 - cycle * 20;
        elbowRY = 135 - cycle * 35;

        wristLX = 200 + cycle * 20;
        wristLY = 105 - cycle * 65;
        elbowLX = 200 + cycle * 20;
        elbowLY = 135 - cycle * 35;

        angleVal = Math.round(90 + cycle * 85);
        angleLabel = "Extensión Deltoides";
        forceMeter = Math.round(15 + cycle * 70);

        if (cycle > 0.95 && isPlaying && Math.random() < 0.25) {
          spawnSparkShower(wristRX, wristRY, "#ec4899");
          spawnSparkShower(wristLX, wristLY, "#ec4899");
        }
      } else {
        // Slump far forward on hips, lower spine curves in massive hyperlordosis
        const slideForward = cycle * 28;
        
        wristRX = 150 - cycle * 12;
        wristRY = 110 - cycle * 45;
        elbowRX = 130 - cycle * 5;
        elbowRY = 135 - cycle * 10;

        wristLX = 220 + cycle * 22;
        wristLY = 105 - cycle * 50;
        elbowLX = 225 + cycle * 10;
        elbowLY = 130 - cycle * 15;

        angleVal = Math.round(135 - cycle * 35);
        angleLabel = "Arqueo Lumbar Dañino";
        forceMeter = Math.round(50 + cycle * 45);
        safetyStatus = Math.round(38 - cycle * 18);
      }

      joints = { 
        hip: { x: isCorrect ? hipX : hipX - cycle * 25, y: hipY }, 
        shoulder: { x: shoulderX, y: shoulderY }, 
        head: { x: headX, y: headY },
        wristR: { x: wristRX, y: wristRY },
        wristL: { x: wristLX, y: wristLY },
        elbowR: { x: elbowRX, y: elbowRY },
        elbowL: { x: elbowLX, y: elbowLY }
      };
    } 
    else if (exerciseId === "deadbug") {
      // Horizontal floor bug exercise
      const bodyY = 175;
      const headX = 120;
      const hipX = 250;
      let shoulderX = 165;
      let shoulderY = bodyY - 5;

      let armRX = 165;
      let armRY = bodyY - 60;
      let legLX = 250;
      let legLY = bodyY - 70;
      let footLX = 295;
      let footLY = bodyY - 70;

      if (isCorrect) {
        armRX = 165 - cycle * 65; 
        armRY = (bodyY - 60) + cycle * 55; 
        
        legLX = 250 + cycle * 55; 
        legLY = (bodyY - 70) + cycle * 55; 
        footLX = 295 + cycle * 60;
        footLY = (bodyY - 70) + cycle * 62;

        angleVal = Math.round(180);
        angleLabel = "Estabilización Core";
        forceMeter = Math.round(20 + cycle * 75);

        if (cycle > 0.95 && isPlaying && Math.random() < 0.25) {
          spawnSparkShower(hipX - 30, bodyY, "#3b82f6");
        }
      } else {
        // High core lumbar arching gap
        armRX = 165 - cycle * 55;
        armRY = (bodyY - 60) + cycle * 35;
        
        legLX = 250 + cycle * 45;
        legLY = (bodyY - 70) + cycle * 35;
        footLX = 290 + cycle * 50;
        footLY = (bodyY - 70) + cycle * 40;

        angleVal = Math.round(180 - cycle * 42);
        angleLabel = "Separación Lumbar Peligrosa";
        forceMeter = Math.round(30 + cycle * 15);
        safetyStatus = Math.round(48 - cycle * 25);
      }

      joints = { 
        head: { x: headX, y: bodyY - 5 }, 
        hip: { x: hipX, y: bodyY - 5 }, 
        shoulder: { x: shoulderX, y: shoulderY },
        wrist: { x: armRX, y: armRY },
        knee: { x: legLX, y: legLY },
        foot: { x: footLX, y: footLY }
      };
    }

    // 3. DRAW HIGH FIDELITY REAL ATHLETE BODY LAYERS
    // Hide the plain wireframe stick figure! Build real muscles.
    if (!showSkeleton) {
      
      // Determine what muscles are contracting to trigger active color highlights
      const contractingLegs = (exerciseId === "squat" || exerciseId === "deadlift") ? muscleGlow : null;
      const contractingChest = (exerciseId === "pushup") ? muscleGlow : null;
      const contractingLats = (exerciseId === "row") ? muscleGlow : null;
      const contractingShoulders = (exerciseId === "arnold") ? muscleGlow : null;
      const contractingCore = (exerciseId === "deadbug") ? muscleGlow : null;

      if (exerciseId === "squat" || exerciseId === "deadlift") {
        // Athlete Head and Neck with human characteristics
        drawHumanCharacterHead(ctx, joints.head, skinColor, isCorrect, true);

        // Neck
        ctx.lineWidth = 6;
        ctx.strokeStyle = skinColor;
        ctx.beginPath();
        ctx.moveTo(joints.head.x, joints.head.y + 7);
        ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        ctx.stroke();

        // Draw upper leg (Thigh with powerful contracting quads)
        drawMuscleLimb(ctx, joints.hip, joints.knee, 12, 11, skinColor, shortsColor, contractingLegs);

        // Draw lower leg (defined calves)
        drawMuscleLimb(ctx, joints.knee, joints.ankle, 9, 7, skinColor, null, contractingLegs);

        // Shoes
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        safeRoundRect(ctx, joints.ankle.x - 12, joints.ankle.y, 25, 10, 3);
        ctx.fill();
        ctx.stroke();

        // Torso & Core Chest Vest segment
        const chestWidth = 15;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(joints.shoulder.x - chestWidth, joints.shoulder.y);
        ctx.lineTo(joints.shoulder.x + chestWidth, joints.shoulder.y);
        ctx.lineTo(joints.hip.x + chestWidth * 0.8, joints.hip.y);
        ctx.lineTo(joints.hip.x - chestWidth * 0.8, joints.hip.y);
        ctx.closePath();
        
        const vestGrad = ctx.createLinearGradient(joints.shoulder.x, joints.shoulder.y, joints.hip.x, joints.hip.y);
        vestGrad.addColorStop(0, shirtColor);
        vestGrad.addColorStop(1, "rgba(30, 41, 59, 0.95)");
        ctx.fillStyle = vestGrad;
        ctx.fill();

        // If core rounded/unstable, show critical warning red aura in back L5-S1 section
        if (!isCorrect) {
          ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
          ctx.lineWidth = 4 + Math.sin(t * 15) * 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(joints.hip.x - 5, joints.hip.y);
          // show rounded hump line
          const midX = (joints.hip.x + joints.shoulder.x) / 2 - 12;
          const midY = (joints.hip.y + joints.shoulder.y) / 2 - 6;
          ctx.quadraticCurveTo(midX, midY, joints.shoulder.x - 5, joints.shoulder.y);
          ctx.stroke();
        }
        ctx.restore();

        // Arms holding weights
        if (exerciseId === "squat") {
          // Copa goblet press hold
          const dumbbellX = joints.shoulder.x - 12;
          const dumbbellY = joints.shoulder.y + 12;
          
          ctx.fillStyle = skinColor;
          ctx.beginPath();
          ctx.arc(dumbbellX, dumbbellY, 4, 0, Math.PI * 2);
          ctx.fill();

          // Hand arms limbs
          drawMuscleLimb(ctx, joints.shoulder, { x: dumbbellX, y: dumbbellY }, 6, 3, skinColor, shirtColor, null);

          // Render high level goblet dumbbell plate model
          ctx.fillStyle = "#4b5563";
          ctx.fillRect(dumbbellX - 10, dumbbellY - 14, 20, 7);
          ctx.fillRect(dumbbellX - 10, dumbbellY + 7, 20, 7);
          ctx.fillStyle = "#9ca3af";
          ctx.fillRect(dumbbellX - 3, dumbbellY - 9, 6, 17);
        } else {
          // Deadlift Barbell heavy metal
          const bX = joints.bar.x;
          const bY = joints.bar.y;

          // Arms pulling bar standard vertical
          drawMuscleLimb(ctx, joints.shoulder, { x: bX, y: bY }, 7, 4, skinColor, shirtColor, contractingLegs);

          // Bar and Heavy weight disks
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#4b5563";
          ctx.beginPath();
          ctx.moveTo(bX - 58, bY);
          ctx.lineTo(bX + 58, bY);
          ctx.stroke();

          // Plates (with realistic thickness & color branding)
          ctx.fillStyle = isCorrect ? "#10b981" : "#475569"; // Green bumpers for nice vibe or gray
          ctx.beginPath();
          safeRoundRect(ctx, bX - 63, bY - 18, 10, 36, 3);
          safeRoundRect(ctx, bX + 53, bY - 18, 10, 36, 3);
          ctx.fill();

          ctx.fillStyle = "#111827";
          ctx.fillRect(bX - 70, bY - 22, 7, 44);
          ctx.fillRect(bX + 63, bY - 22, 7, 44);
        }
      } 
      else if (exerciseId === "pushup") {
        // Horizontal pushup athlete body
        // Feet
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(joints.feet.x - 6, joints.feet.y - 4, 12, 8);

        // Lower Leg and Upper leg combined (thick tight sports pants)
        drawMuscleLimb(ctx, joints.feet, joints.hip, 11, 8, skinColor, shortsColor, contractingChest);

        // Trunk
        ctx.save();
        ctx.lineWidth = 26;
        ctx.strokeStyle = shirtColor;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(joints.hip.x, joints.hip.y);
        ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        ctx.stroke();
        ctx.restore();

        // Arms: Shoulder -> Elbow -> Wrist
        drawMuscleLimb(ctx, joints.shoulder, joints.elbow, 8, 6, skinColor, shirtColor, contractingChest);
        drawMuscleLimb(ctx, joints.elbow, joints.wrist, 7, 5, skinColor, null, contractingChest);

        // Head looking down slightly forward with human characteristics
        drawHumanCharacterHead(ctx, joints.head, skinColor, isCorrect, true);
      } 
      else if (exerciseId === "row") {
        // Feet
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(joints.footFloor.x - 5, joints.footFloor.y - 3, 10, 6);

        // Bench support leg
        ctx.fillStyle = skinColor;
        drawMuscleLimb(ctx, joints.hip, joints.footFloor, 9, 6, skinColor, shortsColor, null);

        // Torso
        ctx.save();
        ctx.lineWidth = 25;
        ctx.strokeStyle = shirtColor;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(joints.hip.x, joints.hip.y);
        ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        ctx.stroke();
        ctx.restore();

        // Passive forearm holding bench down
        drawMuscleLimb(ctx, joints.shoulder, joints.handBench, 7, 4, skinColor, null, null);

        // Active arm pulling barbell: Shoulder -> Elbow -> Weight
        drawMuscleLimb(ctx, joints.shoulder, joints.elbow, 9, 7, skinColor, shirtColor, contractingLats);
        drawMuscleLimb(ctx, joints.elbow, joints.weight, 7, 5, skinColor, null, contractingLats);

        // Head in horizontal alignment with human characteristics
        drawHumanCharacterHead(ctx, joints.head, skinColor, isCorrect, true);

        // Heavy dumbbell plates in row pull
        const wX = joints.weight.x;
        const wY = joints.weight.y;
        ctx.fillStyle = "#334155";
        ctx.fillRect(wX - 16, wY - 14, 32, 28);
        ctx.fillStyle = "#fbbf24"; // gold heavy plates highlights
        ctx.fillRect(wX - 22, wY - 10, 6, 20);
        ctx.fillRect(wX + 16, wY - 10, 6, 20);
      } 
      else if (exerciseId === "arnold") {
        // Seated deltoids exercise upright
        // Torso
        ctx.save();
        ctx.lineWidth = 28;
        ctx.strokeStyle = shirtColor;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(joints.hip.x, joints.hip.y);
        ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        ctx.stroke();
        ctx.restore();

        // Head with human characteristics
        drawHumanCharacterHead(ctx, joints.head, skinColor, isCorrect, true);

        // Active Arms - Right and Left (symmetrical overhead press)
        drawMuscleLimb(ctx, joints.shoulder, joints.elbowR, 10, 8, skinColor, shirtColor, contractingShoulders);
        drawMuscleLimb(ctx, joints.elbowR, joints.wristR, 8, 6, skinColor, null, contractingShoulders);

        drawMuscleLimb(ctx, joints.shoulder, joints.elbowL, 10, 8, skinColor, shirtColor, contractingShoulders);
        drawMuscleLimb(ctx, joints.elbowL, joints.wristL, 8, 6, skinColor, null, contractingShoulders);

        // High contrast dumbbells at wrists
        const dR_X = joints.wristR.x;
        const dR_Y = joints.wristR.y;
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(dR_X - 16, dR_Y - 9, 32, 18);
        ctx.fillStyle = "#ec4899"; // pink premium bumper code
        ctx.fillRect(dR_X - 22, dR_Y - 14, 6, 28);
        ctx.fillRect(dR_X + 16, dR_Y - 14, 6, 28);

        const dL_X = joints.wristL.x;
        const dL_Y = joints.wristL.y;
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(dL_X - 16, dL_Y - 9, 32, 18);
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(dL_X - 22, dL_Y - 14, 6, 28);
        ctx.fillRect(dL_X + 16, dL_Y - 14, 6, 28);
      } 
      else if (exerciseId === "deadbug") {
        // Horizontal abdominal core focus
        // Head with human characteristics
        drawHumanCharacterHead(ctx, joints.head, skinColor, isCorrect, false); // facing right up

        // Spine body slab with glowing core stomach heatmap contour
        ctx.save();
        ctx.lineWidth = 22;
        ctx.strokeStyle = shirtColor;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(joints.head.x + 10, joints.head.y - 2);
        ctx.lineTo(joints.hip.x, joints.hip.y);
        ctx.stroke();
        
        // Dynamic CORE ab contraction workout heatmap!
        if (contractingCore) {
          ctx.strokeStyle = "rgba(59, 130, 246, 0.85)"; // active core neon blue energy
          ctx.lineWidth = 14 + Math.sin(t * 12) * 5;
          ctx.beginPath();
          ctx.moveTo((joints.head.x + joints.hip.x) / 2 + 10, joints.hip.y - 5);
          ctx.lineTo(joints.hip.x - 20, joints.hip.y - 5);
          ctx.stroke();
        }
        ctx.restore();

        // Active arm
        drawMuscleLimb(ctx, joints.shoulder, joints.wrist, 7, 5, skinColor, shirtColor, null);

        // Active leg
        drawMuscleLimb(ctx, joints.hip, joints.knee, 10, 8, skinColor, shortsColor, contractingCore);
        drawMuscleLimb(ctx, joints.knee, joints.foot, 8, 6, skinColor, null, contractingCore);

        // Foot
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(joints.foot.x - 4, joints.foot.y - 4, 11, 8);
      }

    } else {
      // 4. FALLBACK ORIGINAL DETAILED BIOMECHANICAL SKELETON
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.strokeStyle = skeletonLineColor;

      // Draw original thin joints wireframes
      if (exerciseId === "squat" || exerciseId === "deadlift") {
        ctx.beginPath();
        ctx.moveTo(joints.ankle.x, joints.ankle.y);
        ctx.lineTo(joints.knee.x, joints.knee.y);
        ctx.lineTo(joints.hip.x, joints.hip.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(joints.hip.x, joints.hip.y);
        if (!isCorrect) {
          const midX = (joints.hip.x + joints.shoulder.x) / 2 - 18;
          const midY = (joints.hip.y + joints.shoulder.y) / 2 - 12;
          ctx.quadraticCurveTo(midX, midY, joints.shoulder.x, joints.shoulder.y);
        } else {
          ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(joints.shoulder.x, joints.shoulder.y);
        ctx.lineTo(joints.head.x, joints.head.y);
        ctx.stroke();
      } 
      else if (exerciseId === "pushup") {
        ctx.beginPath();
        ctx.moveTo(joints.head.x, joints.head.y);
        ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        
        if (!isCorrect) {
          const midX = (joints.shoulder.x + joints.hip.x) / 2;
          const midY = (joints.shoulder.y + joints.hip.y) / 2 + 10;
          ctx.quadraticCurveTo(midX, midY, joints.hip.x, joints.hip.y);
        } else {
          ctx.lineTo(joints.hip.x, joints.hip.y);
        }
        ctx.lineTo(joints.feet.x, joints.feet.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(joints.shoulder.x, joints.shoulder.y);
        ctx.lineTo(joints.elbow.x, joints.elbow.y);
        ctx.lineTo(joints.wrist.x, joints.wrist.y);
        ctx.stroke();
      } 
      else if (exerciseId === "row") {
        ctx.beginPath();
        ctx.moveTo(joints.hip.x, joints.hip.y);
        if (!isCorrect) {
          const midX = (joints.hip.x + joints.shoulder.x) / 2 - 10;
          const midY = (joints.hip.y + joints.shoulder.y) / 2 - 25 * cycle;
          ctx.quadraticCurveTo(midX, midY, joints.shoulder.x, joints.shoulder.y);
        } else {
          ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(joints.shoulder.x, joints.shoulder.y);
        ctx.lineTo(joints.head.x, joints.head.y);
        ctx.stroke();
      } 
      else if (exerciseId === "arnold") {
        ctx.beginPath();
        ctx.moveTo(joints.hip.x, joints.hip.y);
        if (!isCorrect) {
          const midX = joints.shoulder.x - 24 * cycle;
          const midY = (joints.hip.y + joints.shoulder.y) / 2;
          ctx.quadraticCurveTo(midX, midY, joints.shoulder.x, joints.shoulder.y);
        } else {
          ctx.lineTo(joints.shoulder.x, joints.shoulder.y);
        }
        ctx.stroke();
      }
    }

    // UPDATE AND RENDERS CINEMATIC SPARKLE SHADY ENVIRONMENT PARTICLES
    updateParticles(ctx);

    // 5. Digital HUD overlays
    if (showAngles) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 9px monospace";
      
      let angX = 280;
      let angY = 70;
      if (exerciseId === "squat") { angX = joints.knee.x + 18; angY = joints.knee.y + 4; }
      else if (exerciseId === "pushup") { angX = joints.hip.x - 12; angY = joints.hip.y - 14; }
      else if (exerciseId === "row") { angX = joints.hip.x - 22; angY = joints.hip.y - 18; }
      else if (exerciseId === "deadlift") { angX = joints.hip.x - 30; angY = joints.hip.y - 12; }
      else if (exerciseId === "arnold") { angX = joints.shoulder.x + 22; angY = joints.shoulder.y - 10; }
      else if (exerciseId === "deadbug") { angX = (joints.head.x + joints.hip.x) / 2 - 10; angY = joints.hip.y - 25; }

      ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
      ctx.strokeStyle = isCorrect ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)";
      ctx.lineWidth = 1.5;
      
      const tagText = `${angleLabel}: ${angleVal}°`;
      const textWidth = ctx.measureText(tagText).width;

      ctx.beginPath();
      safeRoundRect(ctx, angX - 6, angY - 11, textWidth + 12, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isCorrect ? "#10b981" : "#ef4444";
      ctx.fillText(tagText, angX, angY);
    }

    // 6. Sidebar Sensor Telemetry Box (Inside the canvas)
    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.strokeStyle = isCorrect ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    safeRoundRect(ctx, 15, 15, 132, 75, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "8px monospace";
    ctx.fillText("VIDEO METRÍA REAL", 22, 28);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText(`ESTADO: ${isCorrect ? "POSTURA PERFECTA" : "RANGO LESIVO!"}`, 22, 43);

    ctx.fillStyle = "#64748b";
    ctx.fillText("Fuerza Muscular:", 22, 57);
    ctx.fillStyle = isCorrect ? "#10b981" : "#f87171";
    ctx.fillText(`${safetyStatus}%`, 110, 57);

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(22, 65, 118, 4);
    ctx.fillStyle = isCorrect ? "#4ade80" : "#ef4444";
    ctx.fillRect(22, 65, 118 * (forceMeter / 100), 4);

    // 7. HIGH ENERGY MOTIVATION OVERLAYS (Floating text near athlete at top contraction)
    if (cycle > 0.82 && !showSkeleton) {
      let motText = "";
      if (isCorrect) {
        if (exerciseId === "squat") motText = "¡TÉCNICA PERFECTA! 🔥";
        else if (exerciseId === "deadlift") motText = "¡FUEGO EN GLÚTEOS! 💪";
        else if (exerciseId === "pushup") motText = "¡PECTORAL DE ACERO! ⚡";
        else if (exerciseId === "row") motText = "¡ESPALDA DE PIEDRA! 👑";
        else if (exerciseId === "arnold") motText = "¡HOMBROS EN FUEGO! 💥";
        else if (exerciseId === "deadbug") motText = "¡CORE DE HIERRO! 🛡️";
      } else {
        if (exerciseId === "squat") motText = "¡CUIDADO TALONES! ⚠️";
        else if (exerciseId === "deadlift") motText = "¡ALINEA LA ESPALDA! 🛑";
        else if (exerciseId === "pushup") motText = "¡SUBE LA CADERA! ⚠️";
        else if (exerciseId === "row") motText = "¡ESPALDA RECTA! 🛑";
        else if (exerciseId === "arnold") motText = "¡EVITA BALANCEAR! ⚠️";
        else if (exerciseId === "deadbug") motText = "¡LUMBAR AL SUELO! 🛑";
      }

      if (motText) {
        ctx.save();
        ctx.fillStyle = isCorrect ? "rgba(52, 211, 153, 0.95)" : "rgba(248, 113, 113, 0.95)";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        
        // Add dynamic text drop shadow for maximum retro arcade look
        ctx.shadowColor = isCorrect ? "#10b981" : "#ef4444";
        ctx.shadowBlur = 8;

        // Floating up slightly with the progress
        const textY = 65 - (cycle - 0.8) * 45;
        ctx.fillText(motText, 200, textY);
        ctx.restore();
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      
      {/* 2D Canvas Area */}
      <div className="relative border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-950 flex justify-center items-center shadow-inner">
        <canvas
          ref={canvasRef}
          width={400}
          height={240}
          className="w-full max-w-[500px] aspect-[5/3] block bg-slate-950"
        />

        {/* Real-time State Badge floating */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 backdrop-blur px-2.5 py-1.5 rounded-xl shadow-md">
          <span className={`w-2.5 h-2.5 rounded-full ${isCorrect ? "bg-emerald-500 animate-pulse" : "bg-red-500 animate-ping"}`} />
          <span className="text-[9px] font-mono tracking-wider font-bold uppercase text-white">
            {isCorrect ? "VIDEO: MODELO REAL" : "ZOOM: CORRECCIÓN"}
          </span>
        </div>

        {/* Telemetry Icon float */}
        <div className="absolute bottom-4 right-4 z-20 bg-slate-900/60 border border-slate-750/50 backdrop-blur-xs p-1.5 rounded-lg flex items-center gap-1 text-[9px] text-slate-400 font-mono">
          <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Frec: 60 FPS • ATLETA_OK</span>
        </div>
      </div>

      {/* Control Navigation Rail under canvas */}
      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Play / pause buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shrink-0 flex items-center justify-center cursor-pointer shadow-xs"
            title={isPlaying ? "Pausar Clip" : "Reproducir Clip"}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          <button
            onClick={() => {
              progressRef.current = 0;
              setScrubValue(0);
              drawFrame();
            }}
            className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer"
            title="Reiniciar secuencia"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Speed switch button */}
          <button
            onClick={() => setSpeed(speed === 1 ? 0.4 : 1)}
            className="px-2 py-1.5 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-650 text-slate-600 rounded-lg font-mono text-[9px] font-bold transition cursor-pointer"
            title="Velocidad del ejercicio"
          >
            CAM: {speed === 1 ? "1.0x (REAL)" : "0.4x (LENTO)"}
          </button>
        </div>

        {/* Dynamic Scrub Slider element representing user clip control */}
        <div className="flex-1 w-full flex items-center gap-2.5">
          <span className="text-[10px] text-slate-400 font-mono">0.00s</span>
          <input
            type="range"
            min="0"
            max="100"
            value={scrubValue}
            onChange={handleScrubChange}
            className="flex-1 accent-indigo-600 h-1 bg-slate-200 rounded-full appearance-none cursor-ew-resize transition"
          />
          <span className="text-[10px] text-slate-400 font-mono">3.00s</span>
        </div>

        {/* Visibility filters switches */}
        <div className="flex items-center gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition ${
              !showSkeleton ? "bg-indigo-50 text-indigo-700 border border-indigo-150" : "bg-transparent text-slate-400 border border-transparent"
            }`}
          >
            {showSkeleton ? "Ver Persona" : "Ver Esqueleto"}
          </button>
          <button
            onClick={() => setShowAngles(!showAngles)}
            className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition ${
              showAngles ? "bg-indigo-50 text-indigo-700 border border-indigo-150" : "bg-transparent text-slate-400 border border-transparent"
            }`}
          >
            Ángulos
          </button>
        </div>

      </div>

      {/* Clinical warning context descriptive text */}
      <div className="flex gap-2 items-start bg-slate-500/5 border border-slate-200/50 p-3 rounded-xl text-slate-650">
        {isCorrect ? (
          <>
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed">
              <strong>Simulador Postura Atleta:</strong> Resalta el recorrido muscular del atleta en verde con palancas biomecánicas perfectas y auras de contracción óptima.
            </p>
          </>
        ) : (
          <>
            <ZapOff className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed">
              <strong>Zonas de Stress Alto en Persona:</strong> Permite ver cómo el cuerpo de la persona sufre un colapso mecánico (como el talón despegado o espina dorsal encorvada en rojo) para prevenir desgarros severos.
            </p>
          </>
        )}
      </div>

    </div>
  );
}
