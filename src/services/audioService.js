const audioFiles = {
    cardDraw: "../../assets/sounds/card_deal.ogg",
    cardDeal: "../../assets/sounds/card_deal.ogg",
    turnChange: "../../assets/sounds/turn-change.mp3",
    hold: "../../assets/sounds/game_hold.mp3",
    bust: "../../assets/sounds/bust.mp3",
    win: "../../assets/sounds/game_win.mp3",
    gameOver: "../../assets/sounds/game_lose.wav",
    gameStart: "../../assets/sounds/game_start.mp3"
};

// Cache audio objects for better performance
const audioCache = {};

// Sound enabled state - stored in localStorage for persistence
let soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to true

// Check if sound is enabled
export function isSoundEnabled() {
    return soundEnabled;
}

// Toggle sound on/off
export function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled);
    return soundEnabled;
}

// Set sound state explicitly
export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
    localStorage.setItem('soundEnabled', enabled);
    return soundEnabled;
}

export function playSoundEffect(soundName) {
    // Don't play if sound is disabled
    if (!soundEnabled) {
        return;
    }

    if (!audioFiles[soundName]) {
        console.warn(`Sound effect "${soundName}" not found.`);
        return;
    }
    
    try {
        // Create or use cached audio object
        if (!audioCache[soundName]) {
            audioCache[soundName] = new Audio(audioFiles[soundName]);
        }
        
        const audio = audioCache[soundName];
        
        // Reset audio to beginning if it's already playing
        audio.currentTime = 0;
        audio.play().catch(error => {
            console.warn(`Failed to play sound "${soundName}": ${error.message}`);
        });
    } catch (error) {
        console.error(`Error playing sound "${soundName}":`, error);
    }
}

// Optional: Preload all audio files for instant playback
export function preloadAudioFiles() {
    Object.keys(audioFiles).forEach(key => {
        try {
            audioCache[key] = new Audio(audioFiles[key]);
            // Load file without playing
            audioCache[key].load();
        } catch (error) {
            console.warn(`Failed to preload audio "${key}":`, error);
        }
    });
    console.log("Audio files preloaded");
}