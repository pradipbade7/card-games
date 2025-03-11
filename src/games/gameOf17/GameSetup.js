import React, { useState, useEffect } from 'react';

export default function GameSetup({ onSetupComplete }) {
  const [numPlayers, setNumPlayers] = useState(4); // Default: 1 human + 3 bots
  // const [selectedCardBack, setSelectedCardBack] = useState('cardback'); // Default card back
  const [maxPlayers, setMaxPlayers] = useState(6); // Default max players


    // Load saved card back from localStorage or use default
    const [selectedCardBack, setSelectedCardBack] = useState(() => {
      const savedCardBack = localStorage.getItem('preferredCardBack');
      return savedCardBack || 'cardback'; // Default to 'cardback' if nothing is saved
    });

  const [cardBacks, setCardBacks] = useState([
    { id: 'cardback', name: 'Red' },
    { id: 'cardback_blue', name: 'Blue' },
    { id: 'cardback_green', name: 'Green' },
    { id: 'cardback_black', name: 'Black' },
    { id: 'cardback_orange', name: 'Orange' },
    { id: 'cardback_purple', name: 'Purple' }
  ]);

    // Save to localStorage whenever the selected card back changes
    useEffect(() => {
      localStorage.setItem('preferredCardBack', selectedCardBack);
    }, [selectedCardBack]);
    
    // Custom handler to update card back and save to localStorage
    const handleCardBackSelect = (cardBackId) => {
      setSelectedCardBack(cardBackId);
    };
  
    // Detect screen size and set maximum players accordingly
    useEffect(() => {
      const handleResize = () => {
        // For mobile and tablet (width < 1024px), limit to 4 players
        // For larger screens, allow up to 6 players
        const newMaxPlayers = window.innerWidth < 1024 ? 4 : 6;
        setMaxPlayers(newMaxPlayers);
        
        // Adjust current selection if it exceeds the new maximum
        if (numPlayers > newMaxPlayers) {
          setNumPlayers(newMaxPlayers);
        }
      };
      
      // Set initial value
      handleResize();
      
      // Add event listener for window resize
      window.addEventListener('resize', handleResize);
      
      // Clean up event listener
      return () => window.removeEventListener('resize', handleResize);
    }, [numPlayers]);

  // Start the game with selected options
  const handleStartGame = () => {
    onSetupComplete({
      numPlayers,
      cardBackStyle: selectedCardBack
    });
  };
  
  return (
    <div className="game-setup">
            <img src="../../logo/logo.png" alt="17 or Nothing" className="game-logo" />

      
      <div className="setup-section">
        <h3>Number of Players</h3>
        
        <div className="player-selector">
          <button 
            className="selector-button"
            disabled={numPlayers <= 2}
            onClick={() => setNumPlayers(num => Math.max(2, num - 1))}
          >
            -
          </button>
          <span>{numPlayers} Players</span>
          <button 
            className="selector-button"
            disabled={numPlayers >= maxPlayers}
            onClick={() => setNumPlayers(num => Math.min(maxPlayers, num + 1))}
          >
            +
          </button>
        </div>
        {window.innerWidth < 1024 && (
          <p className="player-limit-note">
            For optimal experience: max 4 players in smaller screens.
          </p>
        )}
      </div>
      
      <div className="setup-section">
        <h3>Card Back Style</h3>
        {/* <p>Choose your preferred card back design:</p> */}
        
        <div className="card-back-selector">
          {cardBacks.map(back => (
            <div 
              key={back.id} 
              className={`card-back-option ${selectedCardBack === back.id ? 'selected' : ''}`}
              onClick={() => handleCardBackSelect(back.id)}
            >
              <img 
                src={`/assets/cards/backs/${back.id}.png`} 
                alt={back.name} 
                title={back.name}
              />
              <span>{back.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="start-button"
        onClick={handleStartGame}
      >
        Start Game
      </button>
      
      <div className="game-rules">
        <h3>Game Rules:</h3>
        <p>- Each player starts with one card</p>
        <p>- Take turns drawing cards</p>
        <p>- Must draw until you reach at least 11</p>
        <p>- After 11, you may "hold" or continue drawing</p>
        <p>- Closest to 17 without exceeding wins</p>
        <p>- Exactly 17 is an instant win</p>
      </div>
    </div>
  );
}