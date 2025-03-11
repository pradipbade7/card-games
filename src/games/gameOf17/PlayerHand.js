import React, { useState, useEffect } from 'react';

export default function PlayerHand({
    player,
    isCurrentTurn,
    gamePhase,
    showTotal,
    isWinner,
    gameId,
    position = 'bottom',
    cardBackStyle = 'cardback'
}) {
    const { name, visibleCards, hiddenCards, total, status } = player;


  
    // New: Track if we should use 3D or 2D cards and loading state
    const [isLoading, setIsLoading] = useState(true);

   // Preload card images for faster rendering
   useEffect(() => {
    const preloadImages = async () => {
        setIsLoading(true);
        
        try {
            // Preload only the necessary card images
            const preloadPromises = visibleCards.map(card => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = `assets/cards/faces/${card.suit.toLowerCase()}/${card.value.toLowerCase()}.svg`;
                });
            });
            
            // Preload card back
            preloadPromises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = `assets/cards/backs/${cardBackStyle}.png`;
            }));
            
            await Promise.all(preloadPromises);
        } catch (error) {
            console.error('Error preloading card images:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    preloadImages();
}, [visibleCards, cardBackStyle]);


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


    // Calculate appropriate spacing based on screen width and card count
    const totalCardCount = visibleCards.length + hiddenCards.length;
    const screenWidthPx = window.innerWidth;
    const cardWidth = 70; // width of each card in pixels
    const maxWidth = Math.min(350, screenWidthPx * 0.8); // use 80% of screen width, max 350px
    
    // Calculate spacing that will fit all cards within maxWidth
    // Ensure minimum spacing of 15px between card centers
    const spacing = Math.max(15, Math.min(30, (maxWidth - cardWidth) / (totalCardCount > 1 ? totalCardCount - 1 : 1)));
    
    // Show all cards for eliminated players or game over
    const showAllCards = status === 'eliminated' || status === 'winner' || gamePhase === 'gameOver' || gamePhase === 'revealing';
    
    // Combine hidden and visible cards for eliminated players
    const displayedHiddenCards = showAllCards ? hiddenCards : hiddenCards.map(card => ({ ...card, hidden: true }));
    
    return (
        <div className={getContainerClass()}>
            <div className="player-info">
                <h3>{name}
                    {isWinner && gamePhase === 'gameOver' && <span className="winner-badge">👑</span>}
                </h3>
                <div className="player-status">
                    <span>{getStatusText()}</span>
                    {showTotal && <span>Total: {total}</span>}
                </div>
            </div>

            {isLoading ? (
                <div className="loading-cards">Loading cards...</div>
            ) : (
                <div className="cards-2d-container">
                    {/* Show visible cards */}
                    {visibleCards.map((card, index) => (
                        <div
                            key={`visible-${card.value}-${card.suit}-${index}-${gameId}`}
                            className="card-2d"
                            style={{
                                backgroundImage: `url(assets/cards/faces/${card.suit.toLowerCase()}/${card.value.toLowerCase()}.svg)`,
                                transform: `translateX(${index * spacing}px) rotate(${index * 3 - (totalCardCount * 1.5) + 3}deg)`,
                                zIndex: index + 1
                            }}
                        />
                    ))}
                    
                    {/* Show hidden cards - either as backs or faces depending on game state */}
                    {displayedHiddenCards.map((card, index) => (
                        <div
                            key={`hidden-${card.suit}-${card.value}-${index}-${gameId}`}
                            className="card-2d card-back"
                            style={{
                                backgroundImage: card.hidden ? 
                                    `url(assets/cards/backs/${cardBackStyle}.png)` : 
                                    `url(assets/cards/faces/${card.suit.toLowerCase()}/${card.value.toLowerCase()}.svg)`,
                                transform: `translateX(${(index + visibleCards.length) * spacing}px) rotate(${(index + visibleCards.length) * 3 - (totalCardCount * 1.5) + 3}deg)`,
                                zIndex: index + visibleCards.length + 1
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}