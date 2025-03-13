import React, { useState, useEffect } from 'react';
import PlayerHand from './PlayerHand';
// import GameLog from './GameLog';
import Confetti from '../../components/ui/Confetti';
import audioService from '../../services/audioService'; // Import audio service

export default function GameBoard({ gameState, onDrawCard, onHold, onReset, onReturnHome }) {
    const {
        players,
        currentPlayerIndex,
        phase,
        winner: winningPlayerId,
        // gameLog
    } = gameState;





    const humanWon = winningPlayerId !== null && players[winningPlayerId]?.isHuman;
    const [showControls, setShowControls] = useState(false);

    // Add sound state to your component
    const [soundOn, setSoundOn] = useState(() => {
        // Try to load the user's preference from localStorage
        const savedPreference = localStorage.getItem('soundEnabled');
        // Default to true if no saved preference
        return savedPreference !== null ? savedPreference === 'true' : true;
    });

    // Initialize audio
    useEffect(() => {
        const initAudio = () => {
            audioService.initialize().then(() => {
                // Set initial state based on audio service
                audioService.setEnabled(soundOn);
            });
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);

        return () => {
            document.removeEventListener('click', initAudio);
            document.removeEventListener('touchstart', initAudio);
        };
    }, [soundOn]);

    // Function to toggle sound
    const handleToggleSound = () => {
        const newSoundState = !soundOn;
        audioService.setEnabled(newSoundState);
        setSoundOn(newSoundState);

        // Save preference to localStorage
        localStorage.setItem('soundEnabled', newSoundState.toString());

        // Play a test sound if turning on
        if (newSoundState) {
            audioService.play('turnChange');
        }
    };
    // Find the human player
    const humanPlayerIndex = players.findIndex(player => player.isHuman);
    const humanPlayer = players[humanPlayerIndex];

    // Arrange players around the table
    const arrangePlayersForDisplay = () => {
        if (players.length <= 1) return players;

        // Clone players for manipulation
        const arrangedPlayers = [...players];

        // Assign positions based on number of players
        switch (players.length) {
            case 2:
                arrangedPlayers[humanPlayerIndex] = {
                    ...humanPlayer,
                    position: 'bottom'
                };

                // Find the other player
                const otherPlayerIdx = humanPlayerIndex === 0 ? 1 : 0;
                arrangedPlayers[otherPlayerIdx] = {
                    ...players[otherPlayerIdx],
                    position: 'top'
                };
                break;

            case 3:
                // 3 players: human at bottom, others at top-left and top-right
                arrangedPlayers[humanPlayerIndex] = {
                    ...humanPlayer,
                    position: 'bottom'
                };

                // Position the other players
                let position3p = 0;
                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        arrangedPlayers[i] = {
                            ...players[i],
                            position: position3p === 0 ? 'top-left' : 'top-right'
                        };
                        position3p++;
                    }
                }
                break;

            case 4:
                // 4 players: human at bottom, opponents at top, left, and right
                arrangedPlayers[humanPlayerIndex] = {
                    ...humanPlayer,
                    position: 'bottom'
                };

                // Positions for 4 players (excluding human)
                const positions4p = ['left', 'top', 'right'];
                let posIdx = 0;

                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        arrangedPlayers[i] = {
                            ...players[i],
                            position: positions4p[posIdx]
                        };
                        posIdx++;
                    }
                }
                break;

            case 5:
                // 4 players: human at bottom, opponents at top, left, and right
                arrangedPlayers[humanPlayerIndex] = {
                    ...humanPlayer,
                    position: 'bottom'
                };

                // Positions for 4 players (excluding human)
                const positions5p = ['bottom-left', 'top-left', 'top-right', 'bottom-right'];
                let posIdx4 = 0;

                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        arrangedPlayers[i] = {
                            ...players[i],
                            position: positions5p[posIdx4]
                        };
                        posIdx4++;
                    }
                }
                break;

            default:
                // 5+ players: distribute around the table
                arrangedPlayers[humanPlayerIndex] = {
                    ...humanPlayer,
                    position: 'bottom'
                };

                // More positions for additional players
                const positionsMany = ['bottom-left', 'top-left', 'top', 'top-right', 'bottom-right'];
                let posIdxMany = 0;

                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        if (posIdxMany < positionsMany.length) {
                            arrangedPlayers[i] = {
                                ...players[i],
                                position: positionsMany[posIdxMany]
                            };
                            posIdxMany++;
                        } else {
                            // If more players than positions, double up on some positions
                            arrangedPlayers[i] = {
                                ...players[i],
                                position: positionsMany[posIdxMany % positionsMany.length]
                            };
                            posIdxMany++;
                        }
                    }
                }
        }

        return arrangedPlayers;
    };
    // // Dynamically arrange players in a circular layout
    // const arrangePlayersForDisplay = () => {
    //     if (players.length <= 1) return players;

    //     const arrangedPlayers = [...players];
    //     const totalPlayers = players.length;
    //     const radius = 200; // Adjust as needed
    //     const centerX = window.innerWidth / 2;
    //     const centerY = window.innerHeight / 2;

    //     arrangedPlayers.forEach((player, i) => {
    //         if (i === humanPlayerIndex) {
    //             arrangedPlayers[i] = { ...player, x: centerX, y: centerY + radius, position: 'bottom' };
    //         } else {
    //             const angle = ((i - (i > humanPlayerIndex ? 1 : 0)) * (360 / (totalPlayers - 1))) * (Math.PI / 180);
    //             arrangedPlayers[i] = {
    //                 ...player,
    //                 x: centerX + radius * Math.cos(angle),
    //                 y: centerY + radius * Math.sin(angle),
    //                 position: 'auto'
    //             };
    //         }
    //     });
    //     return arrangedPlayers;
    // };
    const arrangedPlayers = arrangePlayersForDisplay();

    return (
        <div className="game-board">
            {/* Show confetti only when human player wins */}
            <Confetti show={humanWon} />
            {/* Game controls menu */}
            <div className="game-controls-container">
                {/* Info button to toggle controls */}
                <button
                    className={`info-button ${showControls ? 'active' : ''}`}
                    onClick={() => setShowControls(!showControls)}
                    title="Game Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                </button>

                {/* Controls menu - only shown when showControls is true */}
                <div className={`game-controls-menu ${showControls ? 'visible' : ''}`}>
                    {/* Sound toggle button */}
                    <button
                        className={`control-button sound-toggle ${soundOn ? 'sound-on' : 'sound-off'}`}
                        onClick={handleToggleSound}
                        title={soundOn ? "Mute Sound" : "Enable Sound"}
                    >
                        {soundOn ?
                            // Simple volume-up icon with standard viewBox
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="#e3e3e3">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                            :
                            // Simple volume-off icon with standard viewBox
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="#e3e3e3">
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                        }
                    </button>

                    {/* Home button - returns to main menu */}
                    <button
                        className="control-button home-button"
                        onClick={onReturnHome}
                        title="Return to Main Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="#e3e3e3">
                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="game-table">
                <div className="players-container">
                    {arrangedPlayers.map((player) => (
                        <PlayerHand
                            key={`player-${player.id}-${gameState.gameId || Date.now()}`}
                            player={player}
                            isCurrentTurn={player.id === currentPlayerIndex && phase === 'playing'}
                            isHumanPlayer={player.isHuman}
                            gamePhase={phase}
                            showTotal={player.isHuman || phase === 'gameOver' || phase === 'revealing' || player.status === 'eliminated' || player.status === 'winner'}
                            isWinner={player.id === winningPlayerId}
                            gameId={gameState.gameId}
                            position={player.position}
                            cardBackStyle={gameState.cardBackStyle || 'cardback'}
                        />
                    ))}
                </div>

                {humanPlayer && phase === 'playing' && humanPlayer.id === currentPlayerIndex && (
                    <div className="player-controls">
                        <button
                            className="action-button"
                            onClick={onDrawCard}
                            disabled={humanPlayer.status !== 'active'}
                        >
                            Draw Card
                        </button>
                        <button
                            className="action-button"
                            onClick={onHold}
                            disabled={humanPlayer.status !== 'active' || humanPlayer.total < 11 || humanPlayer.cards.length < 2}
                        >
                            Hold
                        </button>
                    </div>
                )}
                {/* <GameLog messages={gameLog || []} /> */}
                {phase === 'gameOver' && (
                    <div className="game-info">
                        <h2 className='item-center'>
                            {winningPlayerId !== null && players[winningPlayerId] && players[winningPlayerId].isHuman
                                ? '🎉 You Win! 🎉'
                                : 'Game Over!'}
                        </h2>

                        {winningPlayerId !== null && players[winningPlayerId] && (
                            <p className="winner-announcement">
                                {!players[winningPlayerId].isHuman && `${players[winningPlayerId].name} Wins!`}
                            </p>
                        )}

                        <div className="game-over-controls">
                            <button className="action-button" onClick={onReset}>Play Again</button>
                            <button className="action-button" onClick={onReturnHome}>Main Menu</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}