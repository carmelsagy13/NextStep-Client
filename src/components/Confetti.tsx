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

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  tilt: number;
}

const COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#a855f7", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
];

/**
 * Lightweight, dependency-free confetti overlay rendered on a full-screen
 * canvas. Mainly intended to celebrate the user advancing to the next
 * roadmap stage, but reusable anywhere a quick celebration is needed.
 */
export default function Confetti({
  fire,
  onComplete,
  pieceCount = 160,
  durationMs = 2800,
}: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!fire) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Seed pieces from two bottom corners + the top, drifting downward.
    const pieces: Piece[] = Array.from({ length: pieceCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * -height * 0.5,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 3,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      tilt: Math.random() * 2 * Math.PI,
    }));

    const start = performance.now();
    const gravity = 0.12;

    const render = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, width, height);

      // Fade out over the final 600ms.
      const fade = Math.max(0, Math.min(1, (durationMs - elapsed) / 600));
      ctx.globalAlpha = fade;

      for (const p of pieces) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.tilt += 0.05;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        const wobble = Math.cos(p.tilt) * (p.size / 2);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size + wobble, p.size);
        ctx.restore();
      }

      ctx.globalAlpha = 1;

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
      window.removeEventListener("resize", handleResize);
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
