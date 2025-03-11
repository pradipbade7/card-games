import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Card mesh component for Three.js rendering
function CardMesh({ suit, value, flipped, position, rotation, scale, cardBackStyle = 'cardback' }) {
    // Load textures
    const frontTexture = useLoader(THREE.TextureLoader, `/assets/cards/faces/${suit}/${value}.svg`);
    const backTexture = useLoader(THREE.TextureLoader, `/assets/cards/backs/${cardBackStyle}.png`);
    
    // Apply texture filters for better rendering
    useEffect(() => {
        [frontTexture, backTexture].forEach(texture => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
        });
    }, [frontTexture, backTexture]);
    
    return (
        <mesh position={position} rotation={rotation} scale={scale}>
            <planeGeometry args={[1, 1.39]} />
            <meshBasicMaterial 
                map={flipped ? backTexture : frontTexture}
                side={THREE.DoubleSide}
                transparent={false}
            />
        </mesh>
    );
}

export default function CardScene({ cards = [], cardBackStyle = 'cardback' }) {
    // Log the cards being rendered
    // console.log("CardScene rendering cards:", cards.length);
    
    return (
        <>
            {cards.map((card) => (
                <CardMesh
                    key={card.id}
                    suit={card.suit}
                    value={card.value}
                    flipped={card.flipped}
                    position={card.position}
                    rotation={card.rotation}
                    scale={card.scale}
                    cardBackStyle={cardBackStyle}
                />
            ))}
        </>
    );
}