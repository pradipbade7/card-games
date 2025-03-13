class AudioService {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.audioBuffers = {};
        this.soundsLoaded = false;
        this.volume = 0.7; // 70% volume by default
        this.initialized = false;
        this.loadingPromises = {}; // Track loading promises to avoid duplicate loads

        // Fix paths for better asset loading - use absolute paths
        this.audioFiles = {
            cardDraw: "/assets/sounds/card_deal.mp3",
            cardDeal: "/assets/sounds/card_deal.mp3",
            hold: "/assets/sounds/game_hold.mp3", 
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

                return Promise.resolve();
            } else {
                console.warn('Web Audio API not supported in this browser');
                return Promise.resolve();
            }
        } catch (error) {
            console.error('Error initializing audio:', error);
            return Promise.resolve();
        }
    }

    // Method to specifically resume audio context (useful for mobile)
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume()
                .then(() => console.log('AudioContext resumed successfully'))
                .catch(error => console.error('Error resuming AudioContext:', error));
        }
        return Promise.resolve();
    }

    // Preload a specific sound
    preloadSound(soundName) {
        if (!this.audioContext || !this.audioFiles[soundName]) {
            return Promise.resolve();
        }
        
        // Skip if already loaded
        if (this.audioBuffers[soundName]) {
            return Promise.resolve(this.audioBuffers[soundName]);
        }
        
        // Skip if already loading
        if (this.loadingPromises[soundName]) {
            return this.loadingPromises[soundName];
        }
        
        // Start loading process
        this.loadingPromises[soundName] = fetch(this.audioFiles[soundName])
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load sound: ${this.audioFiles[soundName]}`);
                }
                return response.arrayBuffer();
            })
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.audioBuffers[soundName] = audioBuffer;
                console.log(`Sound ${soundName} preloaded`);
                delete this.loadingPromises[soundName]; // Clear the promise once loaded
                return audioBuffer;
            })
            .catch(error => {
                console.error(`Error preloading sound ${soundName}:`, error);
                delete this.loadingPromises[soundName]; // Clear the promise on error too
                return null;
            });
        
        return this.loadingPromises[soundName];
    }

    // Preload all game sounds
    preloadAllSounds() {
        if (!this.audioContext) return Promise.resolve();
        
        console.log('Preloading all game sounds...');
        const soundNames = Object.keys(this.audioFiles);
        
        // Load sounds one by one to not overload the browser
        const loadSequentially = async () => {
            for (const soundName of soundNames) {
                try {
                    await this.preloadSound(soundName);
                } catch (error) {
                    console.error(`Error loading sound ${soundName}:`, error);
                }
            }
            this.soundsLoaded = true;
            console.log('All sounds preloaded successfully');
        };
        
        return loadSequentially();
    }

    // Play a sound with optimized mobile handling
    play(soundName, options = {}) {
        if (!this.enabled || !this.audioContext) return null;
        
        try {
            // Try to resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                this.resumeAudioContext();
            }
            
            // Use an already loaded buffer if available
            if (this.audioBuffers[soundName]) {
                return this.playSound(soundName, options);
            }
            
            // Load on demand if not preloaded
            console.log(`Sound ${soundName} not preloaded, loading now...`);
            this.preloadSound(soundName)
                .then((buffer) => {
                    if (buffer) this.playSound(soundName, options);
                })
                .catch(error => console.error(`Error loading sound ${soundName}:`, error));
            
            return null;
        } catch (error) {
            console.error(`Error playing sound ${soundName}:`, error);
            return null;
        }
    }
    
    // Internal method to play a loaded sound
    playSound(soundName, options = {}) {
        const buffer = this.audioBuffers[soundName];
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return null;
        }

        // Stop the same sound if it's already playing and we don't want overlaps
        if (this.playingSounds[soundName] && options.preventOverlap !== false) {
            this.playingSounds[soundName].stop();
            this.playingSounds[soundName] = null;
        }

        try {
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
                if (this.playingSounds[soundName] === source) {
                    this.playingSounds[soundName] = null;
                }
            };
            
            return source;
        } catch (error) {
            console.error(`Error playing sound buffer ${soundName}:`, error);
            return null;
        }
    }
    
    // Play with delay - returns a promise that resolves after the specified delay
    playWithDelay(soundName, delayMs = 100, options = {}) {
        return new Promise((resolve) => {
            try {
                this.play(soundName, options);
                setTimeout(resolve, delayMs);
            } catch (error) {
                console.error(`Error playing ${soundName} with delay:`, error);
                resolve(); // Resolve anyway to not block game flow
            }
        });
    }
    
    // Stop a specific sound
    stop(soundName) {
        if (this.playingSounds[soundName]) {
            try {
                this.playingSounds[soundName].stop();
                this.playingSounds[soundName] = null;
            } catch (error) {
                console.error(`Error stopping sound ${soundName}:`, error);
            }
        }
    }
    
    // Stop all sounds
    stopAll() {
        Object.entries(this.playingSounds).forEach(([name, source]) => {
            if (source) {
                try {
                    source.stop();
                } catch (error) {
                    console.error(`Error stopping sound ${name}:`, error);
                }
            }
        });
        this.playingSounds = {};
    }
    
    // Enable or disable all sounds
    setEnabled(enabled) {
        this.enabled = enabled;
        
        // Stop all currently playing sounds if disabled
        if (!enabled) {
            this.stopAll();
        }
        
        return this.enabled;
    }
    
    // Set master volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        return this.volume;
    }
    
    // Check if a sound is currently playing
    isPlaying(soundName) {
        return !!this.playingSounds[soundName];
    }
    
    // Get the names of all available sounds
    getSoundNames() {
        return Object.keys(this.audioFiles);
    }
    
    // Check if a specific sound has been loaded
    isSoundLoaded(soundName) {
        return !!this.audioBuffers[soundName];
    }
    
    // Check if all sounds have been loaded
    areSoundsLoaded() {
        return Object.keys(this.audioFiles).every(name => this.isSoundLoaded(name));
    }
}

const audioService = new AudioService();
export default audioService;