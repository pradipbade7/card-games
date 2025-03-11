import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { setupInitialGame, handleDrawCard, handleHold } from './gameLogic';
import useBotAI from './useBotAI'; // Remove curly braces

export default function useGameState() {
    const [gameState, setGameState] = useState({
        phase: 'setup',
        players: [],
        deck: [],
        currentPlayerIndex: 0,
        winner: null,
        gameLog: [],
        gameId: Date.now(),
    });

    // Bot AI hook
    const { processBotTurn } = useBotAI(gameState, setGameState);

    // Handle player drawing a card
    const handlePlayerDrawCard = () => {
        if (gameState.phase !== 'playing') return;
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.status !== 'active') return;

        const newState = handleDrawCard(gameState, currentPlayer, gameState.currentPlayerIndex);
        setGameState(newState);
    };

    // Handle player holding
    const handlePlayerHold = () => {
        if (gameState.phase !== 'playing') return;
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer || !currentPlayer.isHuman || currentPlayer.status !== 'active') return;

        if (currentPlayer.total < 11) {
            setGameState({
                ...gameState,
                gameLog: [...gameState.gameLog, 'You must draw until you reach at least 11.']
            });
            return;
        }

        const newState = handleHold(gameState, currentPlayer, gameState.currentPlayerIndex);
        setGameState(newState);
    };

    // Initialize a new game
    const setupGame = (numPlayers, cardBackStyle = 'cardback') => {
        const newGameState = setupInitialGame(numPlayers, cardBackStyle);
        setGameState(newGameState);
    };

    // Reset the current game
    const resetGame = () => {
        const numPlayers = gameState.players.length;
        // Clear Three.js cache to prevent memory leaks
        THREE.Cache.clear();
        
        setTimeout(() => {
            setupGame(numPlayers);
        }, 50);
    };

    // Return to home screen
    const returnToHome = () => {
        setGameState({
            phase: 'setup',
            players: [],
            deck: [],
            currentPlayerIndex: 0,
            winner: null,
            gameLog: [],
        });
    };

    // Bot turn effect
    useEffect(() => {
        if (gameState.phase !== 'playing') return;

        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.isHuman || currentPlayer.status !== 'active') return;

        const botTurn = setTimeout(() => {
            processBotTurn();
        }, 1000);

        return () => clearTimeout(botTurn);
    }, [gameState, processBotTurn]);

    // Reveal phase effect
    useEffect(() => {
        if (gameState.phase === 'revealing' && gameState.revealPhase) {
            const revealTimer = setTimeout(() => {
                const updatedPlayers = [...gameState.players];

                if (gameState.pendingWinner !== -1) {
                    updatedPlayers[gameState.pendingWinner].status = 'winner';
                }

                setGameState({
                    ...gameState,
                    players: updatedPlayers,
                    phase: 'gameOver',
                    revealPhase: false,
                    winner: gameState.pendingWinner,
                    gameLog: [...gameState.gameLog, gameState.pendingWinnerMessage],
                });
            }, 500);

            return () => clearTimeout(revealTimer);
        }
    }, [gameState.phase, gameState.revealPhase, gameState.pendingWinner, gameState.pendingWinnerMessage]);

    return {
        gameState,
        actions: {
            handleDrawCard: handlePlayerDrawCard,
            handleHold: handlePlayerHold,
            setupGame,
            resetGame,
            returnToHome
        }
    };
}