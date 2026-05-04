import React, { useRef, useEffect, useCallback } from 'react';

/**
 * DNAHelixLattice
 * Optimized rotating double-helix structure with seamless vertical movement.
 * Replaced expensive shadowBlur with efficient rendering.
 */
export const DNAHelixLattice = ({
  helixColor = 'rgba(34, 211, 238, 0.2)',
  nodeColor = '#22d3ee',
  speed = 1.2,
  rotationSpeed = 0.012,
  nodeCount = 45,
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

    const centerX = width / 2;
    const amplitude = 140;
    const frequency = 0.006; 

    // Calculate step and seamless y positions
    const totalStep = height / (nodeCount - 1);
    
    for (let i = -2; i < nodeCount + 2; i++) {
      // Calculate seamless y with scroll
      const yBase = i * totalStep;
      const yScroll = (time * 80) % totalStep;
      const y = yBase + yScroll;
      
      if (y < -40 || y > height + 40) continue;

      const angle = (y * frequency) + (time * rotationSpeed * 12);
      
      // Strand 1
      const x1 = centerX + Math.sin(angle) * amplitude;
      const z1 = Math.cos(angle); 
      
      // Strand 2
      const x2 = centerX + Math.sin(angle + Math.PI) * amplitude;
      const z2 = Math.cos(angle + Math.PI);

      // Connecting line
      ctx.beginPath();
      ctx.strokeStyle = helixColor;
      ctx.lineWidth = 1;
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();

      // Nodes
      const drawNode = (x, z) => {
        const scale = (z + 2) / 3;
        const alpha = (z + 1.5) / 2.5;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = nodeColor;
        
        ctx.beginPath();
        ctx.arc(x, y, 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // Bloom effect (Simulated without shadowBlur for performance)
        if (alpha > 0.7) {
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.arc(x, y, 8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      drawNode(x1, z1);
      drawNode(x2, z2);
    }

    ctx.globalAlpha = 1;
    requestRef.current = requestAnimationFrame(draw);
  }, [helixColor, nodeColor, speed, rotationSpeed, nodeCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const handleResize = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
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
    <div className={`dna-helix-container ${className}`} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
};

export default DNAHelixLattice;
