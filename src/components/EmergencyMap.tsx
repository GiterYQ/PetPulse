import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { MatchedPet } from '../types';

interface Props {
  phase: number;
  matches: MatchedPet[];
  showResults: boolean;
}

export default function EmergencyMap({ phase, matches, showResults }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      const t = (Date.now() - startTime.current) / 1000;
      const globalT = Date.now() / 1000;

      ctx.clearRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(42, 52, 84, 0.4)';
      ctx.lineWidth = 0.5;
      const gridSize = 30;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const cx = w * 0.5;
      const cy = h * 0.5;

      // Center emergency point
      if (phase >= 1) {
        // Pulse rings
        for (let i = 0; i < 3; i++) {
          const pulseT = (globalT * 0.8 + i * 0.33) % 1;
          const radius = pulseT * Math.min(w, h) * 0.4;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 51, 102, ${0.4 * (1 - pulseT)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ff3366';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 51, 102, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#ff3366';
        ctx.textAlign = 'center';
        ctx.fillText('EMERGENCY', cx, cy - 18);
      }

      // Radar sweep for search phase
      if (phase === 2) {
        const angle = t * 2;
        const radius = Math.min(w, h) * 0.35;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + 0.5);
        ctx.closePath();
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
        grad.addColorStop(1, 'rgba(0, 212, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Draw pet dots
      matches.forEach((pet) => {
        const px = pet.x * w;
        const py = pet.y * h;

        // Determine visibility and color based on phase
        let alpha = 0.2;
        let dotSize = 4;

        if (phase >= 2) alpha = 0.5;
        if (phase >= 3 && pet.bloodMatch) {
          alpha = 1;
          dotSize = 6;
        }
        if (phase >= 3 && !pet.bloodMatch) {
          alpha = 0.15;
        }

        // Show dot
        if (phase >= 2) {
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = pet.bloodMatch ? '#00e676' : '#5a6478';
          ctx.fill();

          // Pet name label
          if (phase >= 4 && pet.bloodMatch) {
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillStyle = '#00e676';
            ctx.textAlign = 'center';
            ctx.fillText(pet.name, px, py - 12);
          }
          ctx.globalAlpha = 1;
        }

        // Connection lines for matched and ranked
        if (phase >= 5 && pet.bloodMatch && showResults) {
          const lineAlpha = 0.3 + Math.sin(globalT * 2) * 0.15;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Animated dot along line
          const dotPos = (globalT * 0.5) % 1;
          const dx = cx + (px - cx) * dotPos;
          const dy = cy + (py - cy) * dotPos;
          ctx.beginPath();
          ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#00d4ff';
          ctx.fill();
        }

        // Alert sent animation
        if (pet.status === 'alerted' || pet.status === 'responding') {
          for (let i = 0; i < 2; i++) {
            const aT = (globalT + i * 0.5) % 1;
            ctx.beginPath();
            ctx.arc(px, py, aT * 20, 0, Math.PI * 2);
            ctx.strokeStyle = pet.status === 'responding'
              ? `rgba(0, 230, 118, ${0.5 * (1 - aT)})`
              : `rgba(255, 171, 0, ${0.5 * (1 - aT)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      });

      // Top-left info
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(136, 146, 168, 0.6)';
      ctx.textAlign = 'left';
      if (phase >= 1) {
        ctx.fillText(`PHASE ${phase}/5`, 12, 20);
        ctx.fillText(`NETWORK: ${matches.length} NODES`, 12, 34);
      } else {
        ctx.fillText('NETWORK IDLE', 12, 20);
      }

      animFrame.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener('resize', resize);
    };
  }, [phase, matches, showResults]);

  return (
    <motion.div
      style={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={canvasRef} style={styles.canvas} />
    </motion.div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    position: 'relative',
  },
  canvas: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
};
