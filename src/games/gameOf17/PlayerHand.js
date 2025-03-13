import React, { useState, useEffect } from 'react';

export default function PlayerHand({
    player,
    isCurrentTurn,
    gamePhase,
    showTotal,
    isWinner,
    gameId,
    position = 'bottom',
    cardBackStyle = 'cardback',
}) {
    const { name, visibleCards, hiddenCards, total, status } = player;
    // New: Track if we should use 3D or 2D cards and loading state
    const [isLoading, setIsLoading] = useState(true);
    const [animatingNewCard, setAnimatingNewCard] = useState(false);
    const [previousVisibleCount, setPreviousVisibleCount] = useState(visibleCards.length);
    const [flippingCards, setFlippingCards] = useState({});

    const showAllCards = status === 'eliminated' || status === 'winner' || gamePhase === 'gameOver' || gamePhase === 'revealing';

    // Combine hidden and visible cards for eliminated players
    const displayedHiddenCards = showAllCards ? hiddenCards : hiddenCards.map(card => ({ ...card, hidden: true }));

    // Track when new cards are added and trigger animation
    useEffect(() => {
        if (visibleCards.length > previousVisibleCount) {
            setAnimatingNewCard(true);
            // Reset animation state after animation completes
            const timer = setTimeout(() => {
                setAnimatingNewCard(false);
            }, 500); // Match this time with the CSS transition duration
            return () => clearTimeout(timer);
        }
        setPreviousVisibleCount(visibleCards.length);
    }, [visibleCards.length, previousVisibleCount]);

    // Add an effect to detect when hidden cards become visible
    useEffect(() => {
        if (showAllCards) {
            // Mark all hidden cards as flipping
            const newFlippingState = {};
            hiddenCards.forEach((card, index) => {
                const cardId = `${card.suit}-${card.value}-${index}`;
                newFlippingState[cardId] = true;
            });

            setFlippingCards(newFlippingState);

            // Clear flipping state after animation completes
            const timer = setTimeout(() => {
                setFlippingCards({});
            }, 800); // Animation duration

            return () => clearTimeout(timer);
        }
    }, [showAllCards, hiddenCards]);

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

    // Show all cards for eliminated players or game over



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


            <div className="cards-2d-container">
                {/* Show visible cards */}
                {/* Show visible cards */}
                {visibleCards.map((card, index) => {
                    // Calculate positions for visible cards, starting after the hidden cards
                    const totalWidth = (totalCardCount - 1) * spacing;
                    const visibleCardsWidth = (visibleCards.length - 1) * spacing;
                    const hiddenCardsWidth = displayedHiddenCards.length > 0 ?
                        displayedHiddenCards.length * spacing * 0.3 : 0; // Calculate space occupied by hidden cards

                    // Start after hidden cards, leaving some overlap
                    let startOffset = -totalWidth / 2 + hiddenCardsWidth * 0.7;
                    let cardOffset = startOffset + ((index + 1) * spacing);
                    if (position === 'bottom') {
                        // Start after hidden cards, leaving some overlap
                        startOffset = -totalWidth / 2 + hiddenCardsWidth * 0.7;
                        cardOffset = startOffset + ((index) * spacing);
                    }
                    let cardRotation;
                    if (position === 'bottom' && index === 0) {
                        cardRotation = -5; // -3 degrees for the first card at bottom position
                    } else {
                        cardRotation = index * 3 - (visibleCards.length * 1.5) + 5; // Normal rotation for other cards
                    }

                    // Determine if this is the newest card for animation
                    const isNewestCard = index === visibleCards.length - 1 && animatingNewCard;

                    return (
                        <div
                            key={`visible-${card.value}-${card.suit}-${index}-${gameId}`}
                            className={`card-2d ${isNewestCard ? 'new-card' : ''}`}
                            style={{
                                backgroundImage: `url(assets/cards/faces/${card.suit.toLowerCase()}/${card.value.toLowerCase()}.svg)`,
                                transform: `translateX(${cardOffset}px) rotate(${cardRotation}deg)`,
                                zIndex: index + 10, // Ensure visible cards are above hidden cards
                                transition: 'transform 0.4s ease-out'
                            }}
                        />
                    );
                })}

                {/* Show hidden cards - either as backs or faces depending on game state */}
                {displayedHiddenCards.map((card, index) => {
                    // Position hidden cards on the left side, partially overlapping
                    const hiddenCardSpacing = spacing * 0.3; // Tighter spacing for hidden cards
                    const hiddenOffset = -(totalCardCount - 1) * spacing / 2; // Start from far left
                    const cardOffset = hiddenOffset + (index * hiddenCardSpacing); // Place cards with overlap
                    const cardRotation = -5 + (index * 2);

                    // Determine if this card is currently flipping
                    const cardId = `${card.suit}-${card.value}-${index}`;
                    const isFlipping = flippingCards[cardId] === true;

                    return (
                        <div
                            key={`hidden-${card.suit}-${card.value}-${index}-${gameId}`}
                            className={`card-2d card-back ${!card.hidden ? 'flipped' : ''} ${isFlipping ? 'flipping' : ''}`}
                            style={{
                                '--x-offset': `${cardOffset}px`,
                                '--rotation': `${cardRotation}deg`,
                                backgroundImage: card.hidden ?
                                    `url(assets/cards/backs/${cardBackStyle}.png)` :
                                    `url(assets/cards/faces/${card.suit.toLowerCase()}/${card.value.toLowerCase()}.svg)`,
                                transform: card.hidden ?
                                    `translateX(${cardOffset}px) rotate(${cardRotation}deg)` :
                                    `translateX(${cardOffset}px) rotate(${cardRotation}deg) rotateY(180deg)`,
                                zIndex: displayedHiddenCards.length - index,
                                transition: 'transform 0.4s ease-out'
                            }}
                        >
                            {/* Create front and back faces for the card */}
                            {!card.hidden && (
                                <>
                                    <div className="card-face card-back-face"
                                        style={{ backgroundImage: `url(assets/cards/backs/${cardBackStyle}.png)` }} />
                                    <div className="card-face card-front-face"
                                        style={{ backgroundImage: `url(assets/cards/faces/${card.suit.toLowerCase()}/${card.value.toLowerCase()}.svg)` }} />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
