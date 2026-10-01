"use client";

import { useEffect, useRef } from "react";

type WeatherCondition = "sunny" | "rain" | "snow" | "storm";

interface Props {
  currentLevel: number;
  weather?: WeatherCondition;
}

export default function InteractiveBackground({
  currentLevel,
  weather = "sunny",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const ieNodes = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height + height * 0.3,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 3 + 2,
    }));

    const laserBars = Array.from({ length: 28 }, (_, i) => ({
      x: (i / 28) * width,
      heightFactor: Math.random() * 0.6 + 0.3,
    }));

    const cyberGridLines = Array.from({ length: 20 }, (_, i) => i * 100);

    const psychoNodes = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 25 + 10,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.03 + 0.01,
      emoji: ["🌀", "🍄", "👁️‍‍🗨️", "💫", "🌿", "🍷", "🌀", "🔮"][
        Math.floor(Math.random() * 8)
      ],
    }));

    const rainParticles = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: Math.random() * 10 + 6,
      speedX: (Math.random() - 0.5) * 1.8 - 1,
      length: Math.random() * 20 + 10,
    }));

    const snowParticles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: Math.random() * 1.0 + 0.3,
      speedX: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 5 + 3,
      isCrystal: Math.random() < 0.25,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    }));

    let lightningTimer = 0;
    let activeBolts: { segments: { x: number; y: number }[]; alpha: number }[] =
      [];
    let screenFlashAlpha = 0;

    const triggerLightningBolt = () => {
      const startX = Math.random() * width;
      let currX = startX;
      let currY = 0;
      const segments = [{ x: currX, y: currY }];

      while (currY < height) {
        currX += (Math.random() - 0.5) * 160;
        currY += Math.random() * 60 + 20;
        segments.push({ x: currX, y: currY });
      }
      activeBolts.push({ segments, alpha: 1.0 });
      screenFlashAlpha = 0.5;
    };

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.03;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.save();

      if (currentLevel === 5) {
        const shakeX = (Math.random() - 0.5) * 12;
        const shakeY = (Math.random() - 0.5) * 12;
        ctx.translate(shakeX, shakeY);
      }

      if (currentLevel === 3) {
        const thump = Math.sin(time * 6) * 0.015 + 1.0;
        ctx.translate(width / 2, height / 2);
        ctx.scale(thump, thump);
        ctx.translate(-width / 2, -height / 2);
      }

      if (currentLevel === 1) {
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(203, 213, 225, 0.4)";
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      } else if (currentLevel === 2) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#001435");
        bgGrad.addColorStop(0.4, "#002B5C");
        bgGrad.addColorStop(1, "#001B3A");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(0, 158, 227, 0.25)";
        ctx.lineWidth = 1;

        for (let i = 0; i < ieNodes.length; i++) {
          const p = ieNodes[i];
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < height * 0.2 || p.y > height) p.vy *= -1;

          ctx.fillStyle = "#009EE3";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          for (let j = i + 1; j < ieNodes.length; j++) {
            const p2 = ieNodes[j];
            const dist = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
            if (dist < 180) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      } else if (currentLevel === 3) {
        ctx.fillStyle = "rgba(15, 5, 25, 0.88)";
        ctx.fillRect(0, 0, width, height);

        const bassBeat = Math.sin(time * 6) * 0.5 + 0.5;
        const ambientGlow = ctx.createRadialGradient(
          width / 2,
          height / 2,
          50,
          width / 2,
          height / 2,
          width * 0.6,
        );
        ambientGlow.addColorStop(
          0,
          `rgba(236, 72, 153, ${0.15 + bassBeat * 0.25})`,
        );
        ambientGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, width, height);

        laserBars.forEach((bar, index) => {
          const currentHeight =
            (Math.sin(time * 6 + index * 0.5) * 0.5 + 0.5) *
            height *
            0.35 *
            bar.heightFactor;
          const barWidth = width / laserBars.length - 6;
          const x = index * (width / laserBars.length) + 3;

          const topGrad = ctx.createLinearGradient(x, 0, x, currentHeight);
          topGrad.addColorStop(0, index % 2 === 0 ? "#ec4899" : "#06b6d4");
          topGrad.addColorStop(1, "rgba(236, 72, 153, 0.1)");
          ctx.fillStyle = topGrad;
          ctx.fillRect(x, 0, barWidth, currentHeight);

          const bottomY = height - currentHeight;
          const bottomGrad = ctx.createLinearGradient(x, bottomY, x, height);
          bottomGrad.addColorStop(0, "rgba(236, 72, 153, 0.1)");
          bottomGrad.addColorStop(1, index % 2 === 0 ? "#ec4899" : "#06b6d4");
          ctx.fillStyle = bottomGrad;
          ctx.fillRect(x, bottomY, barWidth, currentHeight);
        });
      } else if (currentLevel === 4) {
        ctx.fillStyle = "#030712";
        ctx.fillRect(0, 0, width, height);

        const gridOffset = (time * 25) % 100;
        ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
        ctx.lineWidth = 1;

        cyberGridLines.forEach((yOffset) => {
          const currentY = (yOffset + gridOffset) % height;
          ctx.beginPath();
          ctx.moveTo(0, currentY);
          ctx.lineTo(width, currentY);
          ctx.stroke();
        });
      } else if (currentLevel === 5) {
        const psychoHue = (time * 25) % 360;
        const psychoBg = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          50,
          width / 2,
          height / 2,
          Math.max(width, height),
        );
        psychoBg.addColorStop(0, `hsla(${psychoHue}, 100%, 60%, 0.85)`);
        psychoBg.addColorStop(
          0.5,
          `hsla(${(psychoHue + 120) % 360}, 100%, 50%, 0.7)`,
        );
        psychoBg.addColorStop(
          1,
          `hsla(${(psychoHue + 240) % 360}, 100%, 30%, 0.9)`,
        );
        ctx.fillStyle = psychoBg;
        ctx.fillRect(0, 0, width, height);

        for (let r = 50; r < Math.max(width, height); r += 80) {
          const waveRadius = r + ((time * 60) % 80);
          ctx.strokeStyle = `hsla(${(psychoHue + r) % 360}, 100%, 70%, 0.25)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(mouse.x, mouse.y, waveRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        psychoNodes.forEach((node) => {
          node.angle += node.speed;
          const driftX = node.x + Math.sin(node.angle) * 40;
          const driftY = node.y + Math.cos(node.angle) * 40;

          ctx.font = `${node.size}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(node.emoji, driftX, driftY);
        });
      }

      // --- RAIN EFFECT (Red in Level 5) ---
      if (weather === "rain") {
        ctx.strokeStyle =
          currentLevel === 5
            ? "rgba(239, 68, 68, 0.9)"
            : currentLevel === 1
              ? "rgba(100, 116, 139, 0.6)"
              : "rgba(148, 163, 184, 0.75)";
        ctx.lineWidth = 1.5;
        rainParticles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX, p.y + p.length);
          ctx.stroke();
        });
      }
      // --- SNOW EFFECT (Green in Level 5) ---
      else if (weather === "snow") {
        snowParticles.forEach((p) => {
          p.y += p.speedY * 0.35;
          p.x += Math.sin(p.y * 0.015) * 0.5;
          p.rotation += p.rotSpeed;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }

          if (p.isCrystal) {
            ctx.strokeStyle =
              currentLevel === 5
                ? "#22c55e"
                : currentLevel === 1
                  ? "#64748b"
                  : "#FFFFFF";
            ctx.lineWidth = 1.2;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            for (let i = 0; i < 6; i++) {
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, p.size);
              ctx.stroke();

              ctx.beginPath();
              ctx.moveTo(0, p.size * 0.6);
              ctx.lineTo(p.size * 0.3, p.size * 0.8);
              ctx.moveTo(0, p.size * 0.6);
              ctx.lineTo(-p.size * 0.3, p.size * 0.8);
              ctx.stroke();

              ctx.rotate(Math.PI / 3);
            }
            ctx.restore();
          } else {
            ctx.fillStyle =
              currentLevel === 5
                ? "rgba(34, 197, 94, 0.9)"
                : currentLevel === 1
                  ? "#94a3b8"
                  : "rgba(255, 255, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
      // --- STORM EFFECT (Red rain + bright lightning in Level 5) ---
      else if (weather === "storm") {
        lightningTimer++;
        if (lightningTimer > 90 && Math.random() > 0.3) {
          triggerLightningBolt();
          lightningTimer = 0;
        }

        if (screenFlashAlpha > 0) {
          ctx.fillStyle =
            currentLevel === 5
              ? `rgba(239, 68, 68, ${screenFlashAlpha})`
              : currentLevel === 1
                ? `rgba(203, 213, 225, ${screenFlashAlpha})`
                : `rgba(255, 255, 255, ${screenFlashAlpha})`;
          ctx.fillRect(0, 0, width, height);
          screenFlashAlpha -= 0.06;
        }

        ctx.strokeStyle =
          currentLevel === 5
            ? "rgba(239, 68, 68, 0.9)"
            : currentLevel === 1
              ? "rgba(71, 85, 105, 0.85)"
              : "rgba(186, 230, 253, 0.85)";
        ctx.lineWidth = 1.8;
        rainParticles.forEach((p) => {
          p.y += p.speedY * 1.2;
          p.x += p.speedX * 1.3;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.speedX * 1.5, p.y + p.length * 1.1);
          ctx.stroke();
        });

        ctx.strokeStyle =
          currentLevel === 5
            ? "#ef4444"
            : currentLevel === 1
              ? "#334155"
              : "#e0f2fe";
        ctx.lineWidth = 2.5;

        activeBolts.forEach((bolt, idx) => {
          ctx.globalAlpha = bolt.alpha;
          ctx.beginPath();
          bolt.segments.forEach((seg, i) => {
            if (i === 0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
          });
          ctx.stroke();
          bolt.alpha -= 0.08;
          if (bolt.alpha <= 0) activeBolts.splice(idx, 1);
        });

        ctx.globalAlpha = 1.0;
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentLevel, weather]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 w-screen h-screen pointer-events-none"
    />
  );
}
