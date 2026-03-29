import React, { useEffect, useState } from 'react';

const GlowOrb = ({ color, size, top, left, delay = 0, floatDuration = 6 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Parallax effect based on mouse movement
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        opacity: 0.6,
        pointerEvents: 'none',
        zIndex: 0,
        transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        transition: 'transform 0.2s ease-out',
        animation: `float ${floatDuration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

export default GlowOrb;
