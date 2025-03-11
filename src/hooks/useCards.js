import { useState, useEffect } from 'react';

const useCards = () => {
    const [deck, setDeck] = useState([]);
    const [selectedCards, setSelectedCards] = useState([]);

    useEffect(() => {
        const createDeck = () => {
            const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
            const values = Array.from({ length: 13 }, (_, i) => i + 1);
            const newDeck = [];

            suits.forEach(suit => {
                values.forEach(value => {
                    newDeck.push({ suit, value });
                });
            });

            setDeck(newDeck);
        };

        createDeck();
    }, []);

    const randomizeCards = () => {
        const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
        const threeRandomCards = shuffledDeck.slice(0, 3);
        setSelectedCards(threeRandomCards);
    };

    return { deck, selectedCards, randomizeCards };
};

export default useCards;