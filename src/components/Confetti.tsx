import { useEffect, useRef } from "react";

interface ConfettiProps {
  /**
   * When this flips to `true`, a confetti burst plays once. Flip it back to
   * `false` (and to `true` again) to replay.
   */
  fire: boolean;
  /** Called once the burst animation has finished and cleared. */
  onComplete?: () => void;
  /** Number of confetti pieces. */
  pieceCount?: number;
  /** How long the burst lasts, in milliseconds. */
  durationMs?: number;
}

type Shape = "rect" | "circle" | "ribbon";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  shape: Shape;
  tilt: number;
  tiltSpeed: number;
  swayPhase: number;
  swayAmp: number;
}

// A softer, more festive palette with a couple of gold accents.
const COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#fbbf24", // gold
  "#f87171", // coral
  "#c084fc", // violet
  "#f472b6", // pink
  "#2dd4bf", // teal
  "#facc15", // yellow
  "#fb923c", // orange
];

const SHAPES: Shape[] = ["rect", "circle", "ribbon"];

/**
 * Lightweight, dependency-free confetti overlay rendered on a full-screen
 * canvas. Mainly intended to celebrate the user advancing to the next
 * roadmap stage, but reusable anywhere a quick celebration is needed.
 *
 * The motion is intentionally slow and gentle: pieces drift down with light
 * gravity, sway side to side, and tumble while fading out near the end.
 */
export default function Confetti({
  fire,
  onComplete,
  pieceCount = 200,
  durationMs = 5200,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!fire) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const sizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    // Seed pieces above the viewport so they drift gently into view.
    const pieces: Piece[] = Array.from({ length: pieceCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: Math.random() * 1.1 + 0.7,
      size: Math.random() * 7 + 5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      tilt: Math.random() * Math.PI * 2,
      tiltSpeed: Math.random() * 0.04 + 0.02,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: Math.random() * 1.1 + 0.4,
    }));

    const start = performance.now();
    let last = start;
    const gravity = 0.018;
    const terminalVy = 2.4;

    const render = (now: number) => {
      const elapsed = now - start;
      // Normalize movement to ~60fps so speed is frame-rate independent.
      const dt = Math.min(2, (now - last) / 16.6667);
      last = now;

      ctx.clearRect(0, 0, width, height);

      // Gentle fade over the final 1200ms.
      const fade = Math.max(0, Math.min(1, (durationMs - elapsed) / 1200));

      for (const p of pieces) {
        p.vy = Math.min(terminalVy, p.vy + gravity * dt);
        p.swayPhase += p.tiltSpeed * dt;
        p.x += (p.vx + Math.sin(p.swayPhase) * p.swayAmp) * dt;
        p.y += p.vy * dt;
        p.rotation += p.rotationSpeed * dt;
        p.tilt += p.tiltSpeed * dt;

        // Wrap horizontally so the field stays full.
        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        // `flutter` squashes the piece on one axis to fake 3D tumbling.
        const flutter = Math.cos(p.tilt);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            p.size / 2,
            (p.size / 2) * Math.max(0.25, Math.abs(flutter)),
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (p.shape === "ribbon") {
          const w = p.size * 0.5;
          const h = p.size * 1.8 * Math.max(0.25, Math.abs(flutter));
          ctx.fillRect(-w / 2, -h / 2, w, h);
        } else {
          const h = p.size * Math.max(0.25, Math.abs(flutter));
          ctx.fillRect(-p.size / 2, -h / 2, p.size, h);
        }

        ctx.restore();
      }

      if (elapsed < durationMs) {
        frameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", sizeCanvas);
      ctx.clearRect(0, 0, width, height);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fire]);

  if (!fire) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      aria-hidden="true"
    />
  );
}
