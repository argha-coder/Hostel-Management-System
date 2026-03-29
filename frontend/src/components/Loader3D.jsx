import React from 'react';
import { motion } from 'framer-motion';

const Loader3D = () => {
  return (
    <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
      <motion.div
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
        }}
        transition={{
          duration: 4,
          ease: "linear",
          repeat: Infinity
        }}
        style={{
          width: '60px',
          height: '60px',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)', transform: 'translateZ(30px)' }} />
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)', transform: 'rotateY(180deg) translateZ(30px)' }} />
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)', transform: 'rotateY(90deg) translateZ(30px)' }} />
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)', transform: 'rotateY(-90deg) translateZ(30px)' }} />
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)', transform: 'rotateX(90deg) translateZ(30px)' }} />
        <div style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid #38BDF8', boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)', transform: 'rotateX(-90deg) translateZ(30px)' }} />
      </motion.div>
    </div>
  );
};

export default Loader3D;
