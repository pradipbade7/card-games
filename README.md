# 17 or Nothing - Card Game

A React-based card game where players draw cards aiming to get closest to 17 without going over.

## Overview

"17 or Nothing" is an interactive card game where you compete against AI players. The objective is to get as close to 17 as possible without exceeding it. The player with exactly 17 or closest to it wins.

## Features

- **Interactive Card Game**: Draw cards and compete against 2-6 AI opponents
- **3D Card Effects**: Beautiful card animations and interactions
- **Responsive Design**: Play on desktop or mobile devices
- **Sound Effects**: Immersive audio feedback for game actions
- **Multiple Card Back Styles**: Choose from 6 different card back designs
- **Persistent Settings**: Game remembers your preferences
- **Celebration Effects**: Special effects when you win

## How to Play

1. **Setup**: Select the number of players (2-6) and your preferred card back design
2. **Gameplay**: 
   - Each player starts with one card
   - On your turn, choose to either "Draw" or "Hold"
   - You must draw until you have at least 11 points
   - Try to get as close to 17 as possible without going over
   - If you exceed 17, you're eliminated
3. **Winning**: The player closest to 17 (or with exactly 17) wins the game

## Game Rules

- All players start with one card
- Must draw until reaching at least 11 points
- Can hold at any point after reaching 11
- Face cards (J, Q, K) are worth 10 points
- Ace is worth 1 point
- If you exceed 17, you're eliminated
- Getting exactly 17 is an instant win

## Project Structure
react-3d-card-game/ ├── public/ # Static assets │ ├── assets/ │ │ ├── cards/ # Card images │ │ │ ├── backs/ # Card back designs │ │ │ └── faces/ # Card face images by suit │ │ ├── sounds/ # Sound effects │ │ └── images/ # Other game images │ ├── index.html # Main HTML entry │ └── favicon.ico # Website icon │ ├── src/ # Source code │ ├── components/ # Reusable UI components │ │ └── ui/ │ │ ├── Confetti.js # Win celebration effect │ │ └── ... │ │ │ ├── games/ # Game implementations │ │ └── gameOf17/ # 17 or Nothing card game │ │ ├── GameBoard.js # Main game board component │ │ ├── PlayerHand.js # Player's cards display │ │ ├── GameSetup.js # Game configuration screen │ │ ├── GameLog.js # Game action history │ │ ├── useBotAI.js # AI logic for computer players │ │ ├── gameLogic.js # Core game rules and state management │ │ └── ... │ │ │ ├── services/ # Utility services │ │ ├── audioService.js # Sound management │ │ ├── cardUtils.js # Card manipulation utilities │ │ └── ... │ │ │ ├── styles/ # CSS styles │ │ ├── games.css # Game-specific styles │ │ ├── confetti.css # Animation styles │ │ └── ... │ │ │ ├── App.js # Main application component │ ├── Home.js # Home/landing page │ └── index.js # Application entry point │ ├── package.json # Project dependencies and scripts ├── .gitignore # Git ignore configuration └── README.md # Project documentation


## Technologies Used

- React.js
- CSS3 with animations
- Local Storage for persistence
- Custom hooks for game logic
- React Router for navigation

## Installation and Running Locally


1. Clone the repository:

   git clone https://github.com/pradipbade7/card-games.git

2. Navigate to the project directory:
   cd card-games

3. Install dependencies:
   npm install

4. Start the development server:
   npm start

5. Open your browser and visit:
   http://localhost:3000


## Gameplay Screenshots

![Game Setup](screenshots/game-setup.png)
*Player selects the number of opponents and card back design*

![Gameplay](screenshots/gameplay.png)
*In-game screen with cards and player controls*

![Victory Screen](screenshots/victory.png)
*Celebration screen when player wins*

## Future Enhancements

- Multiplayer support
- Additional card games
- Customizable difficulty levels
- Player statistics and achievements
- Additional visual themes

## Credits

- Card assets: [Playing Cards by Byron Knoll](https://code.google.com/archive/p/vector-playing-cards/)
- Sound effects: Various free sources including [Freesound](https://freesound.org/)
- Game concept inspired by various card games with a unique twist

## License

MIT License - See LICENSE file for details.