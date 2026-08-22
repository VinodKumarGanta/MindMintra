import React, { useEffect, useRef } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Star & Constellation Nodes
    interface Star {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      speed: number;
      pulseSpeed: number;
      pulseVal: number;
    }

    interface OrbitRing {
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      angle: number;
      speed: number;
    }

    let stars: Star[] = [];
    const numStars = Math.min(80, Math.floor((width * height) / 16000));

    const rings: OrbitRing[] = [
      { cx: width * 0.85, cy: height * 0.25, rx: 220, ry: 90, angle: 0.2, speed: 0.0003 },
      { cx: width * 0.15, cy: height * 0.75, rx: 320, ry: 130, angle: -0.3, speed: 0.0002 },
    ];

    function initStars() {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        const radius = Math.random() * 1.5 + 0.5;
        const baseAlpha = Math.random() * 0.6 + 0.2;
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          speed: (Math.random() * 0.15 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseVal: Math.random() * Math.PI * 2,
        });
      }
    }

    initStars();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep space base gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#040714');
      bgGrad.addColorStop(0.4, '#080e28');
      bgGrad.addColorStop(0.7, '#070b1e');
      bgGrad.addColorStop(1, '#03050e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Faint nebula soft glows
      const nebula1 = ctx.createRadialGradient(width * 0.75, height * 0.2, 50, width * 0.75, height * 0.2, 450);
      nebula1.addColorStop(0, 'rgba(79, 70, 229, 0.09)');
      nebula1.addColorStop(0.5, 'rgba(147, 51, 234, 0.04)');
      nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, width, height);

      const nebula2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 50, width * 0.2, height * 0.8, 500);
      nebula2.addColorStop(0, 'rgba(14, 165, 233, 0.08)');
      nebula2.addColorStop(0.6, 'rgba(37, 99, 235, 0.03)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, width, height);

      // Subtle celestial orbit paths
      ctx.lineWidth = 1;
      rings.forEach(r => {
        ctx.save();
        ctx.translate(r.cx, r.cy);
        ctx.rotate(r.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.04)';
        ctx.stroke();
        ctx.restore();
        if (!prefersReducedMotion) {
          r.angle += r.speed;
        }
      });

      // Constellation connection lines between nearby stars
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.12;
            ctx.strokeStyle = `rgba(165, 180, 252, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and animate stars
      stars.forEach(star => {
        if (!prefersReducedMotion) {
          star.pulseVal += star.pulseSpeed;
          star.alpha = star.baseAlpha + Math.sin(star.pulseVal) * 0.2;
          star.y += star.speed * 0.2;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 231, 255, ${Math.max(0.1, star.alpha)})`;
        ctx.fill();

        // Soft glow for slightly larger stars
        if (star.radius > 1.3) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(199, 210, 254, ${star.alpha * 0.2})`;
          ctx.fill();
        }
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
}
