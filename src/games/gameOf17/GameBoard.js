import React, { useState } from 'react';
import PlayerHand from './PlayerHand';
// import GameLog from './GameLog';
import Confetti from '../../components/ui/Confetti';

import { isSoundEnabled, toggleSound } from '../../services/audioService';


export default function GameBoard({ gameState, onDrawCard, onHold, onReset, onReturnHome }) {
    const {
        players,
        currentPlayerIndex,
        phase,
        winner: winningPlayerId,
        // gameLog
    } = gameState;





    const humanWon = winningPlayerId !== null && players[winningPlayerId]?.isHuman;

    // Add state for sound toggle
    const [soundOn, setSoundOn] = useState(isSoundEnabled());

    // Handle sound toggle
    const handleToggleSound = () => {
        const newState = toggleSound();
        setSoundOn(newState);
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

            {/* Sound toggle button */}
            <button
                className={`sound-toggle ${soundOn ? 'sound-on' : 'sound-off'}`}
                onClick={handleToggleSound}
                title={soundOn ? "Mute Sound" : "Enable Sound"}
            >
                {/* Font Awesome or similar icon, or use Unicode characters */}
                {soundOn ? <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z" /></svg>}
            </button>
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