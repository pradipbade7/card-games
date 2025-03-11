export const cardUtils = {
    suits: ['clubs', 'diamonds', 'hearts', 'spades'],
    values: ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'],
    
    generateDeck: () => {
      const deck = [];
      for (const suit of cardUtils.suits) {
        for (const value of cardUtils.values) {
          deck.push({ suit, value });
        }
      }
      return deck;
    },
    
    shuffle: (deck) => {
      const newDeck = [...deck];
      for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
      }
      return newDeck;
    },
    
    drawCards: (deck, count) => {
      const shuffled = [...deck];
      const drawn = shuffled.splice(0, count);
      return { drawn, remaining: shuffled };
    },
    
    getCardValue: (card) => {
      switch(card.value) {
        case 'ace': return 1;
        case 'jack': return 11;
        case 'queen': return 12;
        case 'king': return 13;
        default: return parseInt(card.value);
      }
    },
    
    calculateTotal: (cards) => {
      return cards.reduce((total, card) => total + cardUtils.getCardValue(card), 0);
    },
    
    getCardName: (card) => {
      return `${card.value} of ${card.suit}`;
    },
    
  };