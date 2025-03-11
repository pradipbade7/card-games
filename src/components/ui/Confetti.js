import React, { useEffect, useState } from 'react';
import '../../styles/confetti.css';

const Confetti = ({ show, duration = 5000, count = 200 }) => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    if (show) {
      // Create confetti pieces when shown
      const newPieces = [];
      
      for (let i = 0; i < count; i++) {
        const isMetallic = Math.random() < 0.3; // 30% chance for metallic effect
        const angle = Math.random() * Math.PI * 2; // Random angle in radians (0 to 2π)
        const distance = 30 + Math.random() * 70; // Random distance from center (30-100%)
        
        // Convert polar coordinates to cartesian for final position
        const finalX = Math.cos(angle) * distance;
        const finalY = Math.sin(angle) * distance;
        
        newPieces.push({
          id: i,
          finalX: finalX,
          finalY: finalY,
          finalRotation: Math.random() * 720 - 360, // -360 to 360 degrees
          size: 5 + Math.random() * 10, // Random size (5-15px)
          color: getRandomColor(),
          shape: getRandomShape(),
          isMetallic: isMetallic,
          animationDuration: 1.5 + Math.random() * 3.5, // 1.5 to 5 seconds
          animationDelay: Math.random() * 0.5, // 0 to 0.5 seconds
        });
      }
      
      setPieces(newPieces);
      
      // Clean up confetti after duration
      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, count, duration]);
  // Get random color for confetti
const getRandomColor = () => {
  const colors = [
    '#FFD700', // Gold
    '#FFC0CB', // Pink
    '#87CEFA', // Light Sky Blue
    '#00FFFF', // Cyan
    '#7FFFD4', // Aquamarine
    '#FF1493', // Deep Pink
    '#00FA9A', // Medium Spring Green
    '#FF7F50', // Coral
    '#E6E6FA', // Lavender
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#F0E68C', // Khaki
    '#B0E0E6', // Powder Blue
    '#32CD32', // Lime Green
    '#FF4500', // Orange Red
    '#C0C0C0', // Silver
    '#FFFFFF', // White
    '#D8BFD8', // Thistle
    '#40E0D0', // Turquoise
    '#EE82EE'  // Violet
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
  
  // Get random shape for confetti
  const getRandomShape = () => {
    const shapes = ['rectangle', 'rectangle-h', 'rectangle-v', 'circle', 'square', 'strip'];
    return shapes[Math.floor(Math.random() * shapes.length)];
  };
  
  if (!show || pieces.length === 0) {
    return null;
  }
  
  return (
    <div className="confetti-container">
      {pieces.map((piece) => {
        const style = {
          '--final-x': `${piece.finalX}vw`,
          '--final-y': `${piece.finalY}vh`,
          '--final-rotation': `${piece.finalRotation}deg`,
          width: piece.shape.includes('rectangle') ? `${piece.size * 3}px` : `${piece.size}px`,
          height: piece.shape.includes('rectangle') ? `${piece.size * 0.5}px` : `${piece.size}px`,
          backgroundColor: piece.color,
          animation: `${piece.isMetallic ? 'confetti-burst-shine' : 'confetti-burst'} ${piece.animationDuration}s cubic-bezier(0.21, 0.98, 0.6, 0.99) forwards`,
          animationDelay: `${piece.animationDelay}s`,
          borderRadius: piece.shape === 'circle' ? '50%' : '',
        };
        
        return (
          <div 
            key={piece.id} 
            className={`confetti-piece ${piece.isMetallic ? 'metallic' : ''}`}
            style={style} 
          />
        );
      })}
    </div>
  );
};

export default Confetti;