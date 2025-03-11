import { useCallback } from 'react';
import { cardUtils } from '../../services/cardUtils'; // Update path
import { handleDrawCard, handleHold } from './gameLogic';
export default function useBotAI(gameState, setGameState) {
    // Game of 17 specific bot decision-making logic
    const shouldBotDraw = (botCards, otherPlayers) => {
        // If bot has only 1 card, must draw (game rule requires at least 2 cards)
        if (botCards.length < 2) return true;
        const botTotal = cardUtils.calculateTotal(botCards);

        // Base probabilities - never draw if at or over 17
        if (botTotal >= 17) return false;

        // Must draw if under 11 (game rule)
        if (botTotal < 11) return true;

        // Count number of other players still in the game
        const activeOtherPlayers = otherPlayers.filter(p => p.status !== 'eliminated').length;
        if (activeOtherPlayers == 0) return false;  // No other players and have more than 10, don't draw

        // Default probability based on bot's current total
        let drawProbability;


        // Check if any holding players are likely ahead
        const holdingPlayersAhead = otherPlayers.some(playerData => {
            if (playerData.status !== 'holding') return false;

            // Calculate visible total - for human player exclude first card, for bots include all visible cards
            const visibleTotal = playerData.isHuman
                ? cardUtils.calculateTotal(playerData.visibleCards.slice(1))
                : cardUtils.calculateTotal(playerData.visibleCards);

            // Consider a player ahead if their visible cards suggest they're close to 17
            // (remember we can't see their hidden card)
            return visibleTotal >= botTotal;
        });

        if (holdingPlayersAhead) {
            drawProbability = 1; // Definetely draw
        }

        // Count holding players directly with filter
        const holdingPlayersCount = otherPlayers.filter(player => player.status === 'holding').length;

        // Factor in both holding and remaining active players
        const holdingFactor = 0.02 * holdingPlayersCount;
        const remainingActiveFactor = 0.01 * (activeOtherPlayers-holdingPlayersCount); // Adjust the weight as needed

        switch (botTotal) {
            case 11:
                drawProbability = 0.3 + holdingFactor + remainingActiveFactor; break;
            case 12:
                drawProbability = 0.25 + holdingFactor + remainingActiveFactor; break;
            case 13:
                drawProbability = 0.15 + holdingFactor + remainingActiveFactor; break;
            case 14:
                drawProbability = 0.1 + holdingFactor + remainingActiveFactor; break;
            case 15:
                drawProbability = 0.05 + holdingFactor ; break;
            case 16:
                drawProbability = 0.05; break;
            default:
                drawProbability = 0;
        }



        // Adjust strategy based on number of opponents
        if (activeOtherPlayers <= 1) {
            // More conservative with fewer opponents
            drawProbability *= 0.8;
        }



        // Ensure probability is within bounds
        drawProbability = Math.max(0, Math.min(1, drawProbability));
        console.log(`Bot decision (Total: ${botTotal}): Draw probability ${drawProbability.toFixed(2)}, Active: ${activeOtherPlayers}, Holding: ${holdingPlayersCount}, Will draw: ${Math.random() < drawProbability}`);
        return Math.random() < drawProbability;
    };

    const processBotTurn = useCallback(() => {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];

        // Get data from all other players
        const otherPlayersData = gameState.players
            .filter((player, index) => index !== gameState.currentPlayerIndex);

        // Bot decision based on visible information
        let updatedGameState;

        if (shouldBotDraw(currentPlayer.cards, otherPlayersData)) {
            updatedGameState = handleDrawCard(gameState, currentPlayer, gameState.currentPlayerIndex);
        } else {
            updatedGameState = handleHold(gameState, currentPlayer, gameState.currentPlayerIndex);
        }

        setGameState(updatedGameState);
    }, [gameState, setGameState]);

    return { processBotTurn };
}