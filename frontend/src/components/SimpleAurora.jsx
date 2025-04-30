import { useState, useEffect } from 'react';

const SimpleAurora = ({ 
  colorStops = ["#3A29FF", "#FF94B4", "#FF3232"],
  speed = 0.5 
}) => {
  const [gradientPosition, setGradientPosition] = useState({ x: 20, y: 30 });
  
  useEffect(() => {
    // Smooth background animation
    let animationFrameId;
    let startTime = Date.now();
    
    const animate = () => {
      const time = (Date.now() - startTime) * speed * 0.001;
      
      const x = 20 + 20 * Math.sin(time * 0.4);
      const y = 30 + 10 * Math.cos(time * 0.3);
      
      setGradientPosition({ x, y });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [speed]);
  
  // Create gradient style
  const gradientStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -20,
    background: `radial-gradient(
      circle at ${gradientPosition.x}% ${gradientPosition.y}%, 
      ${colorStops[0]} 0%, 
      ${colorStops[1]} 40%, 
      ${colorStops[2]} 80%, 
      #000000 100%
    )`,
    opacity: 0.5,
    transition: 'background 0.2s ease-out'
  };
  
  return (
    <>
      <div style={gradientStyle} />
      <div 
        className="fixed inset-0 w-full h-full -z-15 backdrop-blur-[100px] bg-black bg-opacity-30"
        style={{ mixBlendMode: 'normal' }}
      />
    </>
  );
};

export default SimpleAurora;