import React, { useRef, useEffect, useCallback } from 'react';

/**
 * CometShower
 * Cinematic streaks of light that travel diagonally across the screen with fading trails.
 * V3: Transparent background, refined trails, and varied stardust.
 */
export const CometShower = ({
  cometColor = '#ffffff',
  speed = 1,
  density = 25,
  opacity = 0.6,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const comets = useRef([]);
  const stars = useRef([]);
  const requestRef = useRef();

  const initScene = useCallback((width, height) => {
    // Background stardust (more varied)
    stars.current = [...Array(150)].map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8,
      alpha: 0.05 + Math.random() * 0.3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.02
    }));

    // Comets
    comets.current = [...Array(density)].map(() => ({
      x: Math.random() * width * 1.5,
      y: -Math.random() * height,
      len: 150 + Math.random() * 350,
      v: (4 + Math.random() * 10) * speed,
      opacity: (0.1 + Math.random() * 0.4) * opacity,
      width: 0.6 + Math.random() * 1.2,
      isSuper: Math.random() > 0.92
    }));
  }, [density, speed, opacity]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // NO SOLID BACKGROUND - Transparent for better layering
    ctx.clearRect(0, 0, width, height);

    // Draw stardust with subtle twinkling
    stars.current.forEach(s => {
      s.pulse += s.pulseSpeed;
      const currentAlpha = s.alpha * (0.6 + Math.sin(s.pulse) * 0.4);
      
      ctx.fillStyle = cometColor;
      ctx.globalAlpha = currentAlpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    comets.current.forEach(c => {
      // Diagonal movement
      const curV = c.isSuper ? c.v * 1.4 : c.v;
      c.x -= curV;
      c.y += curV * 0.45;

      // Wrap
      if (c.x < -c.len || c.y > height + c.len) {
        c.x = width + Math.random() * width * 0.5;
        c.y = -Math.random() * height * 0.5;
        c.v = (4 + Math.random() * 10) * speed;
        c.isSuper = Math.random() > 0.92;
      }

      // Draw trail (Motion blur effect)
      const grad = ctx.createLinearGradient(c.x, c.y, c.x + c.len, c.y - c.len * 0.45);
      grad.addColorStop(0, cometColor);
      grad.addColorStop(0.2, cometColor + 'aa');
      grad.addColorStop(0.5, cometColor + '33');
      grad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalAlpha = c.isSuper ? c.opacity * 1.4 : c.opacity;
      ctx.strokeStyle = grad;
      ctx.lineWidth = c.isSuper ? c.width * 2.2 : c.width;
      ctx.lineCap = 'round';
      
      if (c.isSuper) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = cometColor;
      }

      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + c.len, c.y - c.len * 0.45);
      ctx.stroke();

      // Sharp head
      ctx.beginPath();
      ctx.fillStyle = cometColor;
      ctx.arc(c.x, c.y, c.isSuper ? c.width * 1.6 : c.width * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestRef.current = requestAnimationFrame(draw);
  }, [cometColor, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      initScene(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [initScene, draw]);

  return (
    <div className={`comet-shower-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default CometShower;
