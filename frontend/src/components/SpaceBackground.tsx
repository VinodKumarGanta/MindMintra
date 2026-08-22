import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      render();
    };

    window.addEventListener('resize', handleResize);

    const isLight = resolvedTheme === 'light';

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (isLight) {
        // Light mode: Clean, minimal healthcare mist background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#f8fafc');
        bgGrad.addColorStop(0.5, '#f1f5f9');
        bgGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      } else {
        // Dark mode: Clean, minimal deep navy background
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#040714');
        bgGrad.addColorStop(0.4, '#080e28');
        bgGrad.addColorStop(0.7, '#070b1e');
        bgGrad.addColorStop(1, '#03050e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{ opacity: 0.95 }}
      aria-hidden="true"
    />
  );
}


