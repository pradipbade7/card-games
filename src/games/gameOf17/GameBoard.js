import React, { useState, useEffect, useRef } from 'react';
import PlayerHand from './PlayerHand';
// import GameLog from './GameLog';
import Confetti from '../../components/ui/Confetti';
import audioService from '../../services/audioService'; // Import audio service
import { GiSpeaker,GiSpeakerOff } from "react-icons/gi";
import { GoHome } from "react-icons/go";

// Add at the top of your file, outside the component
let soundsInitialized = false;

export default function GameBoard({ gameState, onDrawCard, onHold, onReset, onReturnHome }) {
    const {
        players,
        currentPlayerIndex,
        phase,
        winner: winningPlayerId,
        // gameLog
    } = gameState;

    const humanWon = winningPlayerId !== null && players[winningPlayerId]?.isHuman;
    const humanPlayerIndex = players.findIndex(player => player.isHuman);
    const humanPlayer = players[humanPlayerIndex];
    const [showControls, setShowControls] = useState(false);
    const [soundsLoading, setSoundsLoading] = useState(true);

    // Add sound state to your component
    const [soundOn, setSoundOn] = useState(() => {
        const savedPreference = localStorage.getItem('soundEnabled');
        return savedPreference !== null ? savedPreference === 'true' : true;
    });
    const initRef = useRef(false);
    const soundPlayed = useRef(false);
    useEffect(() => {
        // Skip if already initialized globally
    if (soundsInitialized) {
        setSoundsLoading(false);
        
        // Make sure game start sound plays even when skipping initialization
        if (soundOn && gameState.phase === 'playing' && !soundPlayed.current) {
            audioService.play('gameStart');
            soundPlayed.current = true;
        }
        return;
    }

        // Skip if already initialized in this component instance
        if (initRef.current) return;

        // Mark as initialized for this component instance
        initRef.current = true;

        let isMounted = true; // Flag to prevent state updates after unmount

        // Initialize and preload all sounds when the component mounts
        const initAudio = async () => {
            if (!isMounted) return; // Safety check

            try {
                await audioService.initialize();
                if (!isMounted) return;

                audioService.setEnabled(soundOn);
                console.log('Audio initialized successfully');

                // Add timeout to ensure we don't get stuck
                const timeoutPromise = new Promise(resolve => setTimeout(() => {
                    console.log('Audio loading timed out - continuing anyway');
                    resolve();
                }, 5000)); // 5 second timeout

                // Race between normal loading and timeout
                await Promise.race([
                    audioService.preloadAllSounds(),
                    timeoutPromise
                ]);

                if (!isMounted) return;
                console.log('Audio loading complete');

                // Mark sounds as initialized globally
                soundsInitialized = true;

                // All sounds are loaded, game can start
                setSoundsLoading(false);

                // Play game start sound if enabled
                if (soundOn && gameState.phase === 'playing') {
                    audioService.play('gameStart');
                    soundPlayed.current = true;
                }
            } catch (error) {
                console.error('Error initializing audio:', error);
                if (!isMounted) return;

                // Even if there's an error, allow the game to start
                setSoundsLoading(false);
            }
        };

        // Start audio initialization
        initAudio();

        // Set up event listeners for mobile browsers
        const handleInteraction = () => {
            audioService.resumeAudioContext();
        };

        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });

        return () => {
            isMounted = false;
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, [gameState.phase, soundOn]);

    // Add a safety timeout to exit loading screen regardless
    useEffect(() => {
        if (!soundsLoading) return;

        const safetyTimeout = setTimeout(() => {
            console.log("Safety timeout triggered - forcing game to start");
            setSoundsLoading(false);
            soundsInitialized = true; // Mark as initialized anyway
        }, 8000);

        return () => clearTimeout(safetyTimeout);
    }, [soundsLoading]);

    // Function to handle sound toggle
    const handleToggleSound = () => {
        const newSoundState = !soundOn;
        audioService.setEnabled(newSoundState);
        setSoundOn(newSoundState);
        localStorage.setItem('soundEnabled', newSoundState.toString());

        if (newSoundState) {
            audioService.play('gameStart');
        }
    };

    // Function to arrange players for display based on human player position
    const arrangePlayersForDisplay = () => {
        const arrangedPlayers = [...players];

        if (humanPlayerIndex !== -1) {
            // Set human player at bottom position
            arrangedPlayers[humanPlayerIndex] = {
                ...players[humanPlayerIndex],
                position: 'bottom'
            };

            // Arrange other players around the table
            if (players.length === 2) {
                // Two players - human at bottom, other at top
                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        arrangedPlayers[i] = {
                            ...players[i],
                            position: 'top'
                        };
                    }
                }
            }
            else if (players.length === 3) {
                // 3-4 players
                const positions = ['top-left', 'top-right'];
                let posIdx = 0;

                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        if (posIdx < positions.length) {
                            arrangedPlayers[i] = {
                                ...players[i],
                                position: positions[posIdx]
                            };
                            posIdx++;
                        }
                    }
                }
            }
             else if (players.length === 4) {
                // 3-4 players
                const positions = ['left', 'top', 'right'];
                let posIdx = 0;

                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        if (posIdx < positions.length) {
                            arrangedPlayers[i] = {
                                ...players[i],
                                position: positions[posIdx]
                            };
                            posIdx++;
                        }
                    }
                }
            }
            else if (players.length === 5) {
                // 3-4 players
                const positions = ['left', 'top-left', 'top-right', 'right'];
                let posIdx = 0;

                for (let i = 0; i < players.length; i++) {
                    if (i !== humanPlayerIndex) {
                        if (posIdx < positions.length) {
                            arrangedPlayers[i] = {
                                ...players[i],
                                position: positions[posIdx]
                            };
                            posIdx++;
                        }
                    }
                }
            }
            else {
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
        }

        return arrangedPlayers;
    };

    const arrangedPlayers = arrangePlayersForDisplay();

    // Show loading screen while sounds are loading
    if (soundsLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading game sounds...</p>
                <button
                    className="skip-loading-btn"
                    onClick={() => setSoundsLoading(false)}
                >
                    Skip Loading
                </button>
            </div>
        );
    }

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
                            <GiSpeaker/>
                            :
                            // Simple volume-off icon with standard viewBox
                            <GiSpeakerOff />

                        }
                    </button>

                    {/* Home button - returns to main menu */}
                    <button
                        className="control-button home-button"
                        onClick={onReturnHome}
                        title="Return to Main Menu"
                    >
                        <GoHome />

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