import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

export function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Stars
    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.3 + 0.2 * Math.sin(Date.now() / 1000 + star.x))})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Starfield canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60"
      />

      {/* Gradient Orb */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(263, 70%, 50%, 0.4) 0%, hsl(280, 80%, 40%, 0.2) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Secondary orb */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(280, 80%, 60%, 0.3) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Scanline overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none" />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
