import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Aurora from './Aurora';

const SpotlightCard = ({ 
  children, 
  className = '', 
  spotlightColor = 'rgba(0, 229, 255, 0.2)',
  borderRadius = 12,
  auroraColors = ["#3A29FF", "#FF94B4", "#FF3232"],
  ...props 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setPosition({ x, y });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ 
        borderRadius: borderRadius,
        background: 'rgba(10, 10, 20, 0.7)',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      {...props}
    >
      {/* Aurora background */}
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ borderRadius: borderRadius - 1 }}>
        <Aurora colorStops={auroraColors} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>
      
      {/* Dark overlay for better contrast */}
      <div 
        className="absolute inset-0 z-0 bg-black/50" 
        style={{ borderRadius: borderRadius - 1 }}
      />
      
      {/* Spotlight gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px z-10"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
          opacity: opacity,
          borderRadius: borderRadius - 1
        }}
        animate={{ opacity }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
      />
      
      {/* Content container */}
      <div className="relative z-20">
        {children}
      </div>
    </motion.div>
  );
};

export default SpotlightCard; 