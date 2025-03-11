import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// Fix the import path to use the local CardScene component
import CardScene from '../../components/cards/CardScene';

// Camera controller component to handle camera setup based on position
function CameraController({ position }) {
    const { camera } = useThree();
    
    useEffect(() => {
        // Set a consistent camera position for all players
        // This ensures cards are visible from all angles
        camera.position.set(0, 0, 1);
        camera.lookAt(0, 0, 0);
        
        camera.fov = 45;
        camera.updateProjectionMatrix();
    }, [camera, position]);
    
    return null;
}

export default function PlayerHand({
    player,
    isCurrentTurn,
    isHumanPlayer,
    gamePhase,
    showTotal,
    isWinner,
    gameId,
    position = 'bottom',
    cardBackStyle = 'cardback'
}) {
    const { name, cards, visibleCards, hiddenCards, total, status } = player;
    const canvasRef = useRef();
    
    // Determine container class based on position
    const getContainerClass = () => {
        const baseClass = `player-hand player-hand-container ${position}`;
        const statusClass = status;
        const activeClass = isCurrentTurn ? 'active-turn' : '';
        const winnerClass = isWinner ? 'winning-player' : '';
        
        return `${baseClass} ${statusClass} ${activeClass} ${winnerClass}`;
    };
    
    // Helper function to get status text
    const getStatusText = () => {
        switch (status) {
            case 'active': return isCurrentTurn ? 'Playing...' : 'Waiting';
            case 'holding': return `Holding${showTotal ? ` at ${total}` : ''}`;
            case 'eliminated': return 'Busted!';
            case 'winner': return 'Winner!';
            default: return '';
        }
    };
    
    // Clean up canvas WebGL context
    useEffect(() => {
        return () => {
            if (canvasRef.current) {
                const gl = canvasRef.current.__r3f?.gl;
                if (gl) {
                    gl.dispose();
                    gl.forceContextLoss();
                    const canvas = gl.domElement;
                    if (canvas && canvas.parentElement) {
                        canvas.parentElement.removeChild(canvas);
                    }
                }
            }
        };
    }, [gameId]);

    // Prepare cards data for the scene with appropriate position and rotation
    const prepareCardsForScene = () => {
        const allCards = [];
        
        // Determine whether to show hidden cards
        const showAllCards = gamePhase === 'gameOver' || 
                            status === 'eliminated' || 
                            status === 'winner' || 
                            gamePhase === 'revealing';
        
        // Calculate spacing based on card count
        const totalCards = hiddenCards.length + visibleCards.length;
        
        // Use consistent spacing for all players
        let cardSpacing = totalCards > 5 ? 0.12
                        : totalCards === 5 ? 0.15 
                        : totalCards === 4 ? 0.18
                        : totalCards === 3 ? 0.25 
                        : 0.5;

        
        // Use consistent scale for all players
        const scale = [0.6, 0.6, 1];
        
        // console.log(`Player ${name} has ${hiddenCards.length} hidden and ${visibleCards.length} visible cards`);
        
        // Add hidden cards first
        hiddenCards.forEach((card, index) => {
           // console.log(`Adding hidden card ${index} for ${name}`);
            // Position cards in a fan formation
            const xPos = (index - (totalCards - 1) / 2) * cardSpacing;
            
            allCards.push({
                id: `hidden-${player.id}-${index}-${gameId}`,
                suit: card.suit,
                value: card.value,
                flipped: !showAllCards,
                position: [xPos, 0, 0],
                rotation: [0, 0, 0],
                scale
            });
        });
        
        // Add visible cards after hidden cards
        visibleCards.forEach((card, index) => {
           // console.log(`Adding visible card ${index} for ${name}`);
            const startIndex = hiddenCards.length;
            const xPos = (startIndex + index - (totalCards - 1) / 2) * cardSpacing;
            
            allCards.push({
                id: `visible-${player.id}-${index}-${gameId}`,
                suit: card.suit,
                value: card.value,
                flipped: false,
                position: [xPos, 0, 0],
                rotation: [0, 0, 0],
                scale
            });
        });
        
       // console.log(`Total cards for ${name}:`, allCards.length);
        return allCards;
    };

    return (
        <div className={getContainerClass()}>
            <div className="player-info">
                <h3>{name} 
                    {isWinner && gamePhase === 'gameOver' && <span className="winner-badge">👑</span>}
                </h3>
                <div className="player-status">
                    <span>{getStatusText()}</span>
                    {gamePhase === 'gameOver' && <span>Total: {showTotal ? total : '?'}</span>}
                    
                </div>
            </div>
            
            <div className="player-cards-canvas">
                <Suspense fallback={<div className="loading-cards">Loading cards...</div>}>
                    <Canvas
                        ref={canvasRef}
                        shadows
                        key={`canvas-player-${player.id}-${gameId}`}
                    >
                        <CameraController position={position} />
                        <ambientLight intensity={0.8} />
                        <pointLight position={[5, 10, 5]} intensity={1} />
                        <CardScene 
                            cards={prepareCardsForScene()} 
                            cardBackStyle={cardBackStyle} 
                        />
                    </Canvas>
                </Suspense>
            </div>
        </div>
    );
}