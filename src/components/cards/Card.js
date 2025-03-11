import React, { useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';

// The 3D Card mesh component
export function CardMesh({ suit, value, flipped, position, scale }) {
  // Load textures only once and cache them
  const frontTexture = useLoader(THREE.TextureLoader, `/assets/cards/faces/${suit}/${value}.png`);
  const backTexture = useLoader(THREE.TextureLoader, '/assets/cards/backs/cardback.png');
  
  // Optimize texture rendering
  useEffect(() => {
    [frontTexture, backTexture].forEach(texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
    });
  }, [frontTexture, backTexture]);
  
  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1.4]} />
      <meshBasicMaterial 
        map={flipped ? backTexture : frontTexture}
        side={THREE.DoubleSide}
        transparent={true}
      />
    </mesh>
  );
}

// The Card component that wraps the 3D mesh in a Canvas
export default function Cardzz({ suit, value, flipped, position, scale }) {
  const canvasRef = useRef();

  // Clean up WebGL context when unmounting
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        const gl = canvasRef.current.__r3f?.gl;
        if (gl) {
          gl.dispose();
        }
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas ref={canvasRef} shadows camera={{ position: [0, 0, 2] }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} />
        <CardMesh 
          suit={suit}
          value={value}
          flipped={flipped}
          position={position}
          scale={scale}
        />
      </Canvas>
    </div>
  );
}