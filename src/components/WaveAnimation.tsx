import React, { useEffect, useRef } from 'react';

const WaveAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 192, 203, 0.35)'; // Subtle pink

      const waveCount = 8; // A reasonable number of waves
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const amplitude = 60 + i * 30;
        const frequency = 0.003 + i * 0.0003;
        const yOffset = (i - (waveCount - 1) / 2) * 100;

        for (let x = -canvas.width * 1.5; x < canvas.width * 2.5; x++) {
          const y = Math.sin(x * frequency + frame * 0.002 + i * 0.4) * amplitude;

          const diagonalX = x + y - yOffset;
          const diagonalY = (x - y + yOffset) / 2;

          ctx.lineTo(diagonalX, diagonalY);
        }
        ctx.stroke();
      }
    };

    const animate = () => {
      frame++;
      drawWaves();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default WaveAnimation;
