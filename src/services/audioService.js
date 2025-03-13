// const audioFiles = {
//     cardDraw: "../../assets/sounds/card_deal.ogg",
//     cardDeal: "../../assets/sounds/card_deal.ogg",
//     turnChange: "../../assets/sounds/turn-change.mp3",
//     hold: "../../assets/sounds/game_hold.mp3",
//     bust: "../../assets/sounds/bust.mp3",
//     win: "../../assets/sounds/game_win.mp3",
//     gameOver: "../../assets/sounds/game_lose.mp3",
//     gameStart: "../../assets/sounds/game_start.mp3"
// };
class AudioService {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.audioBuffers = {};
        this.soundsLoaded = false;
        this.volume = 0.7; // 70% volume by default
        this.initialized = false;

        // Fix paths for better asset loading - use absolute paths
        this.audioFiles = {
            cardDraw: "/assets/sounds/card_deal.ogg", // Use mp3 as primary format with ogg as fallback
            cardDeal: "/assets/sounds/card_deal.ogg",
            turnChange: "/assets/sounds/turn-change.mp3",
            hold: "/assets/sounds/game_hold.mp3", 
            bust: "/assets/sounds/bust.mp3",
            win: "/assets/sounds/game_win.mp3",
            gameOver: "/assets/sounds/game_lose.mp3",
            gameStart: "/assets/sounds/game_start.mp3"
        };

        // Track which sounds are currently playing to prevent overlaps
        this.playingSounds = {};
    }

    // Initialize audio context on user gesture (important for iOS/Safari)
    initialize() {
        if (this.initialized) return Promise.resolve();
        
        try {
            // Create audio context with fallbacks for different browsers
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                this.initialized = true;

                // iOS often needs this additional step
                if (this.audioContext.state === 'suspended') {
                    const resumeAudio = async () => {
                        await this.audioContext.resume();
                        
                        // Remove the event listeners once audio is running
                        document.removeEventListener('touchstart', resumeAudio);
                        document.removeEventListener('touchend', resumeAudio);
                        document.removeEventListener('click', resumeAudio);
                    };

                    document.addEventListener('touchstart', resumeAudio);
                    document.addEventListener('touchend', resumeAudio);
                    document.addEventListener('click', resumeAudio);
                }

                return this.preloadSounds();
            } else {
                console.warn('Web Audio API not supported in this browser');
                return Promise.resolve();
            }
        } catch (error) {
            console.error('Error initializing audio:', error);
            return Promise.resolve();
        }
    }

    // Preload all game sounds
    preloadSounds() {
        if (!this.audioContext || this.soundsLoaded) return Promise.resolve();
        
        const loadPromises = Object.entries(this.audioFiles).map(([name, path]) => {
            return fetch(path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load sound: ${path}`);
                    }
                    return response.arrayBuffer();
                })
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    this.audioBuffers[name] = audioBuffer;
                })
                .catch(error => {
                    console.error(`Error loading sound ${name}:`, error);
                });
        });

        return Promise.all(loadPromises)
            .then(() => {
                this.soundsLoaded = true;
                console.log('All sounds preloaded successfully');
            })
            .catch(error => {
                console.error('Error preloading sounds:', error);
            });
    }

    // Play a sound with optimized mobile handling
    play(soundName, options = {}) {
        if (!this.enabled || !this.audioContext || !this.soundsLoaded) return;
        
        try {
            const buffer = this.audioBuffers[soundName];
            if (!buffer) {
                console.warn(`Sound not found: ${soundName}`);
                return;
            }

            // Stop the same sound if it's already playing and we don't want overlaps
            if (this.playingSounds[soundName] && options.preventOverlap !== false) {
                this.playingSounds[soundName].stop();
                this.playingSounds[soundName] = null;
            }

            // Create audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // Create gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume !== undefined ? options.volume : this.volume;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Start playback
            source.start(0);
            
            // Store reference to stop if needed
            this.playingSounds[soundName] = source;
            
            // Remove reference when sound completes
            source.onended = () => {
                this.playingSounds[soundName] = null;
            };
            
            return source;
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
        }
    }
    
    // Enable or disable all sounds
    setEnabled(enabled) {
        this.enabled = enabled;
        
        // Stop all currently playing sounds if disabled
        if (!enabled) {
            Object.values(this.playingSounds).forEach(source => {
                if (source) source.stop();
            });
            this.playingSounds = {};
        }
        
        return this.enabled;
    }
    
    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        return this.volume;
    }
}

const audioService = new AudioService();
export default audioService;