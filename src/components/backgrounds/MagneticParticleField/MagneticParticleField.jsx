import React, { useRef, useEffect, useCallback } from 'react';

/**
 * MagneticParticleField
 * A visually stunning background of particles that repel away from the mouse
 * and spring back to their original positions.
 */
export const MagneticParticleField = ({
  particleCount = 200,
  repelStrength = 100,
  springStrength = 0.05,
  friction = 0.9,
  particleColor = '#ffffff',
  particleSize = 1.5,
  opacity = 0.5,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const requestRef = useRef();

  const initParticles = useCallback((width, height) => {
    const newParticles = [];
    const cols = Math.sqrt(particleCount * (width / height));
    const rows = particleCount / cols;
    
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      newParticles.push({
        x, y,
        originX: x,
        originY: y,
        vx: 0,
        vy: 0,
        size: Math.random() * particleSize + 0.5
      });
    }
    particles.current = newParticles;
  }, [particleCount, particleSize]);

  const update = useCallback((t) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = particleColor;
    ctx.globalAlpha = opacity;

    particles.current.forEach(p => {
      // Distance to mouse
      const dx = mouse.current.x - p.x;
      const dy = mouse.current.y - p.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Repel force
      if (distance < repelStrength) {
        const angle = Math.atan2(dy, dx);
        const force = (repelStrength - distance) / repelStrength;
        p.vx -= Math.cos(angle) * force * 10;
        p.vy -= Math.sin(angle) * force * 10;
      }

      // Spring back to origin
      const sx = (p.originX - p.x) * springStrength;
      const sy = (p.originY - p.y) * springStrength;
      
      p.vx += sx;
      p.vy += sy;
      
      // Apply velocity and friction
      p.vx *= friction;
      p.vy *= friction;
      p.x += p.vx;
      p.y += p.vy;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestRef.current = requestAnimationFrame(update);
  }, [particleColor, opacity, repelStrength, springStrength, friction]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initParticles(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(update);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas) canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(requestRef.current);
    };
  }, [initParticles, update]);

  return (
    <div className={`magnetic-particle-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas 
        ref={canvasRef} 
        style={{ display: 'block', pointerEvents: 'none' }}
      />
    </div>
  );
};

export default MagneticParticleField;
