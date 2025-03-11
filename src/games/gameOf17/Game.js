import React from 'react';
import GameSetup from './GameSetup';
import GameBoard from './GameBoard';
import useGameState from './useGameState';

export default function GameOf17() {
    const {
        gameState,
        actions: {
            handleDrawCard,
            handleHold,
            setupGame,
            resetGame,
            returnToHome
        }
    } = useGameState();

    // Handle setup completion with options
    const handleSetupComplete = (options) => {
        setupGame(options.numPlayers, options.cardBackStyle);
    };

    return (
        <div className="game-container">
            {gameState.phase === 'setup' ? (
                <GameSetup onSetupComplete={handleSetupComplete} />
            ) : (
                <GameBoard
                    gameState={gameState}
                    onDrawCard={handleDrawCard}
                    onHold={handleHold}
                    onReset={resetGame}
                    onReturnHome={returnToHome}
                />
            )}
        </div>
    );
}