import React, { useRef, useEffect, useCallback } from 'react';

/**
 * SmokeFogDrift
 * High-fidelity smoke effect with improved depth, wispy textures, and optimized rendering.
 */
export const SmokeFogDrift = ({
  smokeColor = '#ffffff',
  density = 45,
  speed = 0.6,
  opacity = 0.2,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const offscreenCanvasRef = useRef(null);
  const particles = useRef([]);
  const requestRef = useRef();

  // Create a more organic smoke texture
  const createTexture = useCallback(() => {
    const size = 256; // Smaller size for more density without memory bloat
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2;

    const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    
    // Multi-stage falloff for wispy look
    grad.addColorStop(0, smokeColor);
    grad.addColorStop(0.2, smokeColor);
    grad.addColorStop(0.4, smokeColor + '66');
    grad.addColorStop(0.7, smokeColor + '22');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    offscreenCanvasRef.current = canvas;
  }, [smokeColor]);

  const initParticles = useCallback((width, height) => {
    particles.current = [...Array(density)].map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 200 + Math.random() * 400,
      vx: (Math.random() - 0.5) * 0.4 * speed,
      vy: -(0.1 + Math.random() * 0.3) * speed,
      life: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.005,
      alpha: 0.1 + Math.random() * 0.5, // Individual alpha for depth
      pulse: Math.random() * 100,
      pulseSpeed: 0.01 + Math.random() * 0.02
    }));
  }, [density, speed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !offscreenCanvasRef.current) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    
    // Use 'screen' or 'lighter' for a more ethereal smoke feel, 
    // but source-over is more predictable for fog.
    ctx.globalCompositeOperation = 'source-over';

    particles.current.forEach(p => {
      // Update physics
      p.x += p.vx + Math.sin(p.life) * 0.2;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life += 0.002;
      p.pulse += p.pulseSpeed;

      // Wrap around smoothly with padding
      const pad = p.size;
      if (p.y < -pad) p.y = height + pad;
      if (p.x < -pad) p.x = width + pad;
      if (p.x > width + pad) p.x = -pad;

      // Draw
      ctx.save();
      ctx.globalAlpha = p.alpha * opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      
      // Dynamic scale pulsing
      const s = 1 + Math.sin(p.pulse) * 0.1;
      ctx.scale(s * 1.5, s); // Slight horizontal bias for drift look
      
      ctx.drawImage(
        offscreenCanvasRef.current, 
        -p.size/2, -p.size/2, 
        p.size, p.size
      );
      
      ctx.restore();
    });

    requestRef.current = requestAnimationFrame(draw);
  }, [opacity]);

  useEffect(() => {
    createTexture();
    const canvas = canvasRef.current;
    
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initParticles(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [initParticles, draw, createTexture]);

  return (
    <div 
      className={`smoke-fog-container ${className}`} 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'absolute', 
        inset: 0, 
        overflow: 'hidden', 
        pointerEvents: 'none',
        zIndex: 0 
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

export default SmokeFogDrift;
