import { cardUtils } from '../../services/cardUtils'; // Update path
import { playSoundEffect } from '../../services/audioService'; // Import audio service

// Initialize game with specified number of players
export function setupInitialGame(numPlayers, cardBackStyle = 'cardback') {
    let deck = cardUtils.shuffle(cardUtils.generateDeck());
    const players = [];
    const initialLog = ['Game started!'];

    // Randomly determine the first player (0 to numPlayers-1)
    const firstPlayerIndex = Math.floor(Math.random() * numPlayers);

    // // Play game start sound
    playSoundEffect('gameStart');

    const botNames = [
        "Alex", "Morgan", "Jordan", "Taylor", "Casey"
    ];

    // Create all players
    for (let i = 0; i < numPlayers; i++) {
        // const playerName = i === 0 ? 'You' : `Bot ${i}`;
        const playerName = i === 0 ? 'You' : botNames[i-1];
        
        const { drawn, remaining } = cardUtils.drawCards(deck, 1);
        const drawnCard = drawn[0];
        deck = remaining;


        const player = {
            id: i,
            name: playerName,
            isHuman: i === 0,
            cards: [...drawn],
            hiddenCards: i === 0 ? [] : [...drawn],
            visibleCards: i === 0 ? [...drawn] : [],
            total: cardUtils.calculateTotal(drawn),
            status: 'active' // active, holding, eliminated, winner
        };

        players.push(player);

        if (i === 0) {
            initialLog.push(`You drew ${cardUtils.getCardName(drawnCard)}. Total: ${player.total}`);
        } else {
            initialLog.push(`${playerName} drew a card.`);
        }
    }

    // Log who goes first
    const firstPlayerName = players[firstPlayerIndex].isHuman ? 'You' : players[firstPlayerIndex].name;
    initialLog.push(`${firstPlayerName} will go first.`);

    return {
        phase: 'playing',
        players,
        deck,
        currentPlayerIndex: firstPlayerIndex,
        winner: null,
        gameLog: initialLog,
        gameId: Date.now(),
        cardBackStyle: cardBackStyle
    };
}

// Handle drawing a card
export function handleDrawCard(gameState, currentPlayer, playerIndex) {
    // Draw a card from the deck
    const { drawn, remaining } = cardUtils.drawCards(gameState.deck, 1);
    const drawnCard = drawn[0];

    // Play card draw sound
    playSoundEffect('cardDraw');

    // Update player's cards and total
    const updatedPlayers = [...gameState.players];
    const player = updatedPlayers[playerIndex];

    player.cards = [...player.cards, drawnCard];
    player.visibleCards = [...player.visibleCards, drawnCard];
    player.total = cardUtils.calculateTotal(player.cards);

    // Log the action
    const actionLog = `${player.name} drew ${cardUtils.getCardName(drawnCard)}. Total: ${player.total}`;

    // Check if player reached exactly 17
    if (player.total === 17) {

        player.status = 'winner';
        if (player.isHuman) {
            playSoundEffect('win');
        } else {
            // Play game over sound
            playSoundEffect('gameOver');
        }


        return {
            ...gameState,
            players: updatedPlayers,
            deck: remaining,
            phase: 'gameOver',
            winner: playerIndex,
            gameLog: [...gameState.gameLog, actionLog, `${player.name} won with exactly 17!`]
        };
    }

    // Check if player exceeded 17
    if (player.total > 17) {
        player.status = 'eliminated';

        // Check if all players are eliminated or if the game is over
        const gameEndCheck = checkGameEnd(
            updatedPlayers,
            `${player.name} exceeded 17 and is eliminated!`
        );

        if (gameEndCheck.gameOver) {
            return {
                ...gameState,
                players: gameEndCheck.players,
                deck: remaining,
                phase: 'revealing',
                revealPhase: true,
                pendingWinner: gameEndCheck.winner,
                pendingWinnerMessage: gameEndCheck.winnerMessage,
                gameLog: [...gameState.gameLog, actionLog, ...gameEndCheck.message]
            };
        }

        // Find next active player
        let nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
        while (
            nextPlayerIndex !== playerIndex &&
            (updatedPlayers[nextPlayerIndex].status === 'eliminated' ||
                updatedPlayers[nextPlayerIndex].status === 'holding')
        ) {
            nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
        }

        return {
            ...gameState,
            players: updatedPlayers,
            deck: remaining,
            currentPlayerIndex: nextPlayerIndex,
            gameLog: [
                ...gameState.gameLog,
                actionLog,
                `${player.name} exceeded 17 and is eliminated!`,
                `${updatedPlayers[nextPlayerIndex].name}'s turn.`
            ]
        };
    }

    // Standard case - continue game
    return {
        ...gameState,
        players: updatedPlayers,
        deck: remaining,
        gameLog: [...gameState.gameLog, actionLog]
    };
}

// Handle player holding
export function handleHold(gameState, currentPlayer, playerIndex) {
    // Check if player has at least 2 cards (initial card + at least one drawn card)
    if (currentPlayer.cards.length < 2) {
        return gameState; // Cannot hold until drawing at least one more card
    }

    // Check if player has reached at least 11 points
    if (currentPlayer.total < 11) {
        return gameState; // Cannot hold below 11
    }

    // Play hold sound
    playSoundEffect('hold');

    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex].status = 'holding';

    // Find next active player
    let nextPlayerIndex = (playerIndex + 1) % gameState.players.length;
    while (
        nextPlayerIndex !== playerIndex &&
        (updatedPlayers[nextPlayerIndex].status === 'eliminated' ||
            updatedPlayers[nextPlayerIndex].status === 'holding')
    ) {
        nextPlayerIndex = (nextPlayerIndex + 1) % gameState.players.length;
    }

    const allDone = updatedPlayers.every((p) => p.status !== 'active');

    if (allDone) {
        const gameEndCheck = checkGameEnd(
            updatedPlayers,
            `${currentPlayer.name} decided to hold with a total of ${currentPlayer.total}.`
        );

        if (gameEndCheck.gameOver) {

            return {
                ...gameState,
                players: gameEndCheck.players,
                phase: 'revealing',
                revealPhase: true,
                pendingWinner: gameEndCheck.winner,
                pendingWinnerMessage: gameEndCheck.winnerMessage,
                gameLog: [...gameState.gameLog, ...gameEndCheck.message]
            };
        }
    }

    return {
        ...gameState,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        gameLog: [
            ...gameState.gameLog,
            `${currentPlayer.name} decided to hold with a total of ${currentPlayer.total}.`,
            `${updatedPlayers[nextPlayerIndex].name}'s turn.`
        ]
    };
}

// Check if the game has ended
export function checkGameEnd(players, currentAction = '') {
    const allDone = players.every((p) => p.status !== 'active');

    if (allDone) {
        const { winnerIndex, winMessage } = determineWinner(players);

        players.forEach((player) => {
            if (player.status !== 'eliminated') {
                player.status = 'revealing';
            }
        });

        return {
            gameOver: true,
            revealPhase: true,
            players,
            winner: winnerIndex,
            winnerMessage: winMessage,
            message: [currentAction].filter(Boolean)
        };
    }

    return { gameOver: false };
}

// Determine the winner based on game rules
export function determineWinner(players) {
    const exactWinner = players.findIndex((p) => p.total === 17);
    if (exactWinner !== -1) {

        return {
            winnerIndex: exactWinner,
            winMessage: `${players[exactWinner].name} won with exactly 17!`,
        };
    }

    const allEliminated = players.every((p) => p.status === 'eliminated');
    if (allEliminated) {
        return {
            winnerIndex: -1,
            winMessage: 'All players exceeded 17. Game is void.',
        };
    }

    let maxTotal = 0;
    let winnerIndex = -1;

    players.forEach((player, idx) => {
        if (player.status !== 'eliminated' && player.total <= 17 && player.total > maxTotal) {
            maxTotal = player.total;
            winnerIndex = idx;
        }
    });

    if (winnerIndex !== -1) {
        if (players[winnerIndex].isHuman) {
            playSoundEffect('win');
        } else {
            // Play game over sound
            playSoundEffect('gameOver');
        }
        return {
            winnerIndex,
            winMessage: `${players[winnerIndex].name} wins with a total of ${maxTotal}!`,
        };
    }

    return {
        winnerIndex: -1,
        winMessage: 'No winner could be determined.',
    };
}