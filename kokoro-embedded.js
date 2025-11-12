// Embedded Kokoro TTS module using kokoro-js
// This module handles browser-based TTS without requiring a server

class EmbeddedKokoroTTS {
    constructor() {
        this.tts = null;
        this.isLoading = false;
        this.isInitialized = false;
        this.currentAudio = null;
        this.onStatusChange = null;
        this.onProgress = null;
    }

    /**
     * Initialize the Kokoro TTS model
     * @param {Object} options - Configuration options
     * @returns {Promise<boolean>} - Success status
     */
    async initialize(options = {}) {
        if (this.isInitialized) {
            return true;
        }

        if (this.isLoading) {
            // Wait for current initialization to complete
            while (this.isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return this.isInitialized;
        }

        this.isLoading = true;

        try {
            // Update status
            this._updateStatus('Initializing Kokoro TTS model...', 'loading');

            // Dynamically import kokoro-js from CDN
            // Using a CDN that supports ES modules
            const { KokoroTTS } = await import('https://cdn.jsdelivr.net/npm/kokoro-js@0.2.1/+esm');

            // Load the model with quantization for smaller size
            // Options: "fp32", "fp16", "q8", "q4", "q4f16"
            const dtype = options.dtype || 'q8'; // Default to q8 for balance
            
            this._updateStatus(`Loading model (${dtype})...`, 'loading');
            
            this.tts = await KokoroTTS.from_pretrained(
                'onnx-community/Kokoro-82M-ONNX',
                { 
                    dtype: dtype,
                    progress_callback: (progress) => {
                        if (this.onProgress) {
                            this.onProgress(progress);
                        }
                        if (progress.status === 'progress') {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            this._updateStatus(`Downloading model: ${percent}%`, 'loading');
                        }
                    }
                }
            );

            this.isInitialized = true;
            this._updateStatus('Model loaded successfully!', 'success');
            console.log('Embedded Kokoro TTS initialized successfully');
            return true;

        } catch (error) {
            console.error('Failed to initialize Embedded Kokoro TTS:', error);
            this._updateStatus('Failed to load model: ' + error.message, 'error');
            this.isInitialized = false;
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Generate speech from text
     * @param {string} text - Text to convert to speech
     * @param {Object} options - Generation options (voice, speed, etc.)
     * @returns {Promise<Object>} - Audio data
     */
    async generate(text, options = {}) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize Kokoro TTS');
            }
        }

        try {
            this._updateStatus('Generating speech...', 'loading');

            const voice = options.voice || 'af_sky';
            const speed = options.speed || 1.0;

            // Generate audio
            const audio = await this.tts.generate(text, { voice: voice, speed: speed });

            this._updateStatus('Speech generated successfully!', 'success');

            return {
                audio: audio,
                success: true
            };

        } catch (error) {
            console.error('Failed to generate speech:', error);
            this._updateStatus('Failed to generate speech: ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * Play the generated audio
     * @param {Object} audioData - Audio data from generate()
     */
    async play(audioData) {
        if (!audioData || !audioData.audio) {
            throw new Error('Invalid audio data');
        }

        try {
            // Convert audio data to AudioBuffer and play
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Get the audio data (assuming it's a Float32Array)
            const audioArray = audioData.audio.data;
            const sampleRate = audioData.audio.rate || 24000;

            // Create an AudioBuffer
            const audioBuffer = audioContext.createBuffer(1, audioArray.length, sampleRate);
            audioBuffer.copyToChannel(audioArray, 0);

            // Create a source and play
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            this.currentAudio = source;
            source.start(0);

            return new Promise((resolve, reject) => {
                source.onended = () => {
                    this.currentAudio = null;
                    resolve();
                };
                source.onerror = reject;
            });

        } catch (error) {
            console.error('Failed to play audio:', error);
            throw error;
        }
    }

    /**
     * Stop currently playing audio
     */
    stop() {
        if (this.currentAudio) {
            try {
                this.currentAudio.stop();
                this.currentAudio = null;
            } catch (error) {
                console.error('Error stopping audio:', error);
            }
        }
    }

    /**
     * Get list of available voices
     * @returns {Promise<Array>} - List of voice IDs
     */
    async listVoices() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (this.tts && typeof this.tts.list_voices === 'function') {
            return this.tts.list_voices();
        }
        
        // Fallback to known voices
        return [
            'af_alloy', 'af_aoede', 'af_bella', 'af_heart', 'af_jessica',
            'af_kore', 'af_nicole', 'af_nova', 'af_river', 'af_sarah', 'af_sky',
            'am_adam', 'am_echo', 'am_eric', 'am_fenrir', 'am_liam',
            'am_michael', 'am_onyx', 'am_puck', 'am_santa',
            'bf_alice', 'bf_emma', 'bf_isabella', 'bf_lily',
            'bm_daniel', 'bm_fable', 'bm_george', 'bm_lewis'
        ];
    }

    /**
     * Update status callback
     * @private
     */
    _updateStatus(message, type) {
        if (this.onStatusChange) {
            this.onStatusChange(message, type);
        }
    }

    /**
     * Check if model is ready
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized;
    }
}

// Create a singleton instance
const embeddedKokoroTTS = new EmbeddedKokoroTTS();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = embeddedKokoroTTS;
}
