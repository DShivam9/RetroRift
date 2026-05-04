import React, { useRef, useEffect, useCallback } from 'react';

/**
 * CyberTunnel
 * Retro-futuristic wireframe tunnel effect.
 */
export const CyberTunnel = ({
  color = '#8b5cf6',
  speed = 1,
  opacity = 0.5,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();

  const draw = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    const time = t * 0.001 * speed;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity;

    const centerX = width / 2;
    const centerY = height / 2;
    const ringCount = 15;
    const lineCount = 12;

    // Rings moving towards viewer
    for (let i = 0; i < ringCount; i++) {
      const z = (i / ringCount + time * 0.2) % 1;
      const radius = Math.pow(z, 2) * (width > height ? width : height) * 0.8;
      
      if (radius < 5) continue;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Perspective lines
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2;
      const x2 = centerX + Math.cos(angle) * width;
      const y2 = centerY + Math.sin(angle) * height;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    requestRef.current = requestAnimationFrame(draw);
  }, [color, speed, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [draw]);

  return (
    <div className={`cyber-tunnel-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', pointerEvents: 'none' }} />
    </div>
  );
};

export default CyberTunnel;
