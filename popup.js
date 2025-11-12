// Popup script for Kokoro TTS Firefox addon
let currentAudio = null;
let currentAudioBlob = null;
let currentAudioUrl = null;
let isGenerating = false;

// DOM elements
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const speedInput = document.getElementById('speedInput');
const speedValue = document.getElementById('speedValue');
const langSelect = document.getElementById('langSelect');
const ttsMode = document.getElementById('ttsMode');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const useOpenAIFormat = document.getElementById('useOpenAIFormat');
const speakBtn = document.getElementById('speakBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const audioPlayer = document.getElementById('audioPlayer');
const audioControls = document.getElementById('audioControls');
const downloadBtn = document.getElementById('downloadBtn');
const replayBtn = document.getElementById('replayBtn');

// Quick action buttons
const getSelectionBtn = document.getElementById('getSelection');
const getPageBtn = document.getElementById('getPage');
const clearTextBtn = document.getElementById('clearText');

// API settings groups
const apiSettingsGroup = document.getElementById('apiSettingsGroup');
const apiKeyGroup = document.getElementById('apiKeyGroup');
const openAIFormatGroup = document.getElementById('openAIFormatGroup');

// Embedded Kokoro TTS instance (will be initialized when needed)
let embeddedTTS = null;

// Voice and Language Mappings for display (can be extended)
const VOICE_DISPLAY_NAMES = {
    'af_heart': 'American Female (Heart)',
    'af_alloy': 'American Female (Alloy)',
    'af_aoede': 'American Female (Aoede)',
    'af_bella': 'American Female (Bella)',
    'af_jessica': 'American Female (Jessica)',
    'af_kore': 'American Female (Kore)',
    'af_nicole': 'American Female (Nicole)',
    'af_nova': 'American Female (Nova)',
    'af_river': 'American Female (River)',
    'af_sarah': 'American Female (Sarah)',
    'af_sky': 'American Female (Sky)',
    'am_adam': 'American Male (Adam)',
    'am_echo': 'American Male (Echo)',
    'am_eric': 'American Male (Eric)',
    'am_fenrir': 'American Male (Fenrir)',
    'am_liam': 'American Male (Liam)',
    'am_michael': 'American Male (Michael)',
    'am_onyx': 'American Male (Onyx)',
    'am_puck': 'American Male (Puck)',
    'am_santa': 'American Male (Santa)',
    'bf_alice': 'British Female (Alice)',
    'bf_emma': 'British Female (Emma)',
    'bf_isabella': 'British Female (Isabella)',
    'bf_lily': 'British Female (Lily)',
    'bm_daniel': 'British Male (Daniel)',
    'bm_fable': 'British Male (Fable)',
    'bm_george': 'British Male (George)',
    'bm_lewis': 'British Male (Lewis)'
};

const LANGUAGE_DISPLAY_NAMES = {
    'a': '🇺🇸 American English',
    'b': '🇬🇧 British English',
    'e': '🇪🇸 Spanish',
    'f': '🇫🇷 French',
    'h': '🇮🇳 Hindi',
    'i': '🇮🇹 Italian',
    'j': '🇯🇵 Japanese',
    'p': '🇧🇷 Portuguese (BR)',
    'z': '🇨🇳 Mandarin Chinese'
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', async () => {
    await populateDropdownsFromSever(); // Populate dropdowns first
    await loadSettings(); // Then load user settings
    setupEventListeners();
    checkServerStatus();
});

/**
 * Sets up all event listeners for the popup UI elements.
 */
function setupEventListeners() {
    // Update speed value display when slider moves
    speedInput.addEventListener('input', (e) => {
        speedValue.textContent = e.target.value + 'x';
    });

    // Main speak and stop buttons
    speakBtn.addEventListener('click', generateSpeech);
    stopBtn.addEventListener('click', stopSpeech);

    // Audio control buttons
    downloadBtn.addEventListener('click', downloadAudio);
    replayBtn.addEventListener('click', replayAudio);

    // Quick action buttons
    getSelectionBtn.addEventListener('click', getSelectedText);
    getPageBtn.addEventListener('click', getPageText);
    clearTextBtn.addEventListener('click', () => {
        textInput.value = '';
        hideAudioControls();
    });

    // TTS mode change listener
    ttsMode.addEventListener('change', () => {
        handleTTSModeChange();
        saveSettings();
    });

    // Auto-save settings when voice, speed, language, or API settings change
    [voiceSelect, speedInput, langSelect, apiEndpoint, apiKey, useOpenAIFormat].forEach(element => {
        element.addEventListener('change', saveSettings);
        if (element.type === 'text' || element.type === 'password') {
            element.addEventListener('input', saveSettings);
        }
    });

    // Auto-resize text area as user types
    textInput.addEventListener('input', function() {
        this.style.height = 'auto'; // Reset height to recalculate
        this.style.height = this.scrollHeight + 'px'; // Set height to scroll height
    });

    // Audio player event listeners
    audioPlayer.addEventListener('ended', () => {
        resetUI();
    });

    audioPlayer.addEventListener('loadstart', () => {
        showAudioControls();
    });
}

/**
 * Shows the audio control buttons (download/replay)
 */
function showAudioControls() {
    audioControls.style.display = 'block';
    downloadBtn.disabled = !currentAudioBlob;
}

/**
 * Hides the audio control buttons
 */
function hideAudioControls() {
    audioControls.style.display = 'none';
    cleanupAudioResources();
}

/**
 * Downloads the current audio file
 */
function downloadAudio() {
    if (!currentAudioBlob) {
        showStatus('No audio to download', 'error');
        return;
    }

    try {
        // Create filename with timestamp and voice info
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const voice = voiceSelect.options[voiceSelect.selectedIndex].text.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `kokoro_tts_${voice}_${timestamp}.wav`;

        // Create download link
        const downloadUrl = URL.createObjectURL(currentAudioBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up the download URL
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

        showStatus('Audio downloaded successfully!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showStatus('Failed to download audio', 'error');
    }
}

/**
 * Replays the current audio
 */
function replayAudio() {
    if (audioPlayer.src) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
        showStatus('Replaying audio...', 'success');
    } else {
        showStatus('No audio to replay', 'error');
    }
}

/**
 * Cleans up audio resources (URLs and references)
 */
function cleanupAudioResources() {
    if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
        currentAudioUrl = null;
    }
    currentAudioBlob = null;
    audioPlayer.src = '';
    audioPlayer.style.display = 'none';
}

/**
 * Loads user settings (voice, speed, language, API endpoint) from Firefox local storage
 * and updates the UI elements accordingly.
 */
async function loadSettings() {
    try {
        const result = await browser.storage.local.get({
            voice: 'af_heart',                    // Default voice
            speed: 1.0,                           // Default speed
            language: 'a',                        // Default language (American English)
            ttsMode: 'api',                       // Default TTS mode (API)
            apiEndpoint: 'http://localhost:8000', // Default endpoint
            apiKey: '',                           // Default API key (empty)
            useOpenAIFormat: false                // Default to Kokoro format
        });

        // Only set the value if the option exists, otherwise default will be used
        if (Array.from(voiceSelect.options).some(option => option.value === result.voice)) {
            voiceSelect.value = result.voice;
        } else {
            voiceSelect.value = 'af_heart'; // Fallback to a safe default if saved voice is not available
        }

        speedInput.value = result.speed;
        speedValue.textContent = result.speed + 'x';

        if (Array.from(langSelect.options).some(option => option.value === result.language)) {
            langSelect.value = result.language;
        } else {
            langSelect.value = 'a'; // Fallback to a safe default if saved language is not available
        }
        
        ttsMode.value = result.ttsMode;
        apiEndpoint.value = result.apiEndpoint;
        apiKey.value = result.apiKey;
        useOpenAIFormat.checked = result.useOpenAIFormat;

        // Update UI based on TTS mode
        handleTTSModeChange();

    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

/**
 * Saves current user settings (voice, speed, language, API endpoint) to Firefox local storage.
 */
async function saveSettings() {
    try {
        await browser.storage.local.set({
            voice: voiceSelect.value,
            speed: parseFloat(speedInput.value),
            language: langSelect.value,
            ttsMode: ttsMode.value,
            apiEndpoint: apiEndpoint.value,
            apiKey: apiKey.value,
            useOpenAIFormat: useOpenAIFormat.checked
        });
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
}

/**
 * Handles TTS mode changes to show/hide relevant UI elements
 */
function handleTTSModeChange() {
    const mode = ttsMode.value;
    
    if (mode === 'embedded') {
        // Hide API-related settings for embedded mode
        apiSettingsGroup.style.display = 'none';
        apiKeyGroup.style.display = 'none';
        openAIFormatGroup.style.display = 'none';
    } else {
        // Show API-related settings for API mode
        apiSettingsGroup.style.display = 'flex';
        apiKeyGroup.style.display = 'flex';
        openAIFormatGroup.style.display = 'flex';
    }
}

/**
 * Gets the currently selected text from the active tab and populates the text input.
 * The injected code is wrapped in an IIFE to prevent variable conflicts.
 */
async function getSelectedText() {
    try {
        const tabs = await browser.tabs.query({active: true, currentWindow: true});
        const results = await browser.tabs.executeScript(tabs[0].id, {
            code: `
                // IIFE to create a private scope for injected code
                (function() {
                    const pageSelection = window.getSelection();
                    return pageSelection.toString().trim();
                })(); // Immediately invoke the function
            `
        });

        if (results && results[0]) {
            textInput.value = results[0];
            showStatus('Selected text captured!', 'success');
        } else {
            showStatus('No text selected', 'error');
        }
    } catch (error) {
        console.error('Error getting selected text:', error);
        showStatus('Failed to get selection: ' + error.message, 'error');
    }
}

/**
 * Gets the main visible text content from the active tab and populates the text input.
 * It uses a TreeWalker and is wrapped in an IIFE to prevent variable conflicts.
 */
async function getPageText() {
    try {
        const tabs = await browser.tabs.query({active: true, currentWindow: true});
        const results = await browser.tabs.executeScript(tabs[0].id, {
            code: `
                // IIFE to create a private scope for injected code
                (function() {
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        {
                            acceptNode: function(node) {
                                const parent = node.parentElement;
                                if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
                                    return NodeFilter.FILTER_REJECT;
                                }
                                return NodeFilter.FILTER_ACCEPT;
                            }
                        }
                    );

                    let pageContentText = '';
                    let node;
                    while (node = walker.nextNode()) {
                        const nodeText = node.textContent.trim();
                        if (nodeText) {
                            pageContentText += nodeText + ' ';
                        }
                    }

                    return pageContentText.trim().substring(0, 5000);
                })(); // Immediately invoke the function
            `
        });

        if (results && results[0]) {
            textInput.value = results[0];
            showStatus('Page text captured!', 'success');
        } else {
            showStatus('No text found on page', 'error');
        }
    } catch (error) {
        console.error('Error getting page text:', error);
        showStatus('Failed to get page text: ' + error.message, 'error');
    }
}

/**
 * Checks the status of the configured TTS server by pinging its health endpoint.
 * Also populates the voice and language dropdowns if the server is healthy.
 */
async function checkServerStatus() {
    try {
        const endpoint = apiEndpoint.value || 'http://localhost:8000';
        const response = await fetch(`${endpoint}/health`);
        if (response.ok) {
            showStatus('TTS server connected ✓', 'success');
            // We already populate on DOMContentLoaded, but this can serve as a re-check
            // if needed. For now, it's primarily for status message.
        } else {
            showStatus('TTS server not responding', 'error');
        }
    } catch (error) {
        console.error('Error checking server status:', error);
        showStatus('TTS server not running - Check endpoint and start server', 'error');
    }
}

/**
 * Fetches available voices and languages from the server and populates the dropdowns.
 */
async function populateDropdownsFromSever() {
    try {
        const endpoint = apiEndpoint.value || 'http://localhost:8000';
        const response = await fetch(`${endpoint}/health`);
        if (response.ok) {
            const data = await response.json();

            // Clear existing options
            voiceSelect.innerHTML = '';
            langSelect.innerHTML = '';

            // Populate Voice dropdown
            if (data.available_voices) {
                data.available_voices.forEach(voiceCode => {
                    const option = document.createElement('option');
                    option.value = voiceCode;
                    option.textContent = VOICE_DISPLAY_NAMES[voiceCode] || voiceCode; // Use display name or code
                    voiceSelect.appendChild(option);
                });
            }

            // Populate Language dropdown
            if (data.available_languages) {
                data.available_languages.forEach(langCode => {
                    const option = document.createElement('option');
                    option.value = langCode;
                    option.textContent = LANGUAGE_DISPLAY_NAMES[langCode] || langCode; // Use display name or code
                    langSelect.appendChild(option);
                });
            }

        } else {
            console.error('Failed to fetch server capabilities:', response.statusText);
            showStatus('Failed to load voices/languages from server.', 'error');
            // Optionally, if server is down, you might want to disable speak button
            speakBtn.disabled = true;
        }
    } catch (error) {
        console.error('Error fetching server capabilities:', error);
        showStatus('Could not connect to TTS server to get available options.', 'error');
        speakBtn.disabled = true; // Disable if server isn't reachable
    }
}

/**
 * Generates speech from the text input using the configured TTS method.
 * Supports API endpoint (server-based) and embedded (browser-based) modes.
 * Plays the audio and handles UI state during generation.
 */
async function generateSpeech() {
    const text = textInput.value.trim();
    if (!text) {
        showStatus('Please enter some text', 'error');
        return;
    }

    if (isGenerating) return;

    // Clean up previous audio resources
    cleanupAudioResources();
    hideAudioControls();

    isGenerating = true;
    speakBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    showStatus('Generating speech...', 'loading');

    const mode = ttsMode.value;

    try {
        if (mode === 'embedded') {
            // Use embedded browser-based Kokoro TTS
            await generateSpeechEmbedded(text);
        } else {
            // Use API endpoint
            await generateSpeechAPI(text);
        }
    } catch (error) {
        console.error('TTS Error:', error);
        showStatus('Failed to generate speech: ' + error.message, 'error');
        cleanupAudioResources();
    } finally {
        isGenerating = false;
        if (!currentAudio || currentAudio.paused) {
            resetUI();
        }
    }
}

/**
 * Generates speech using the embedded browser-based Kokoro TTS
 */
async function generateSpeechEmbedded(text) {
    try {
        // Initialize embedded TTS if not already initialized
        if (!embeddedTTS) {
            // Dynamically load the kokoro-embedded.js module
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import('https://cdn.jsdelivr.net/npm/kokoro-js@0.2.1/+esm').then(({ KokoroTTS }) => {
                    window.KokoroTTS = KokoroTTS;
                }).catch(err => {
                    console.error('Failed to load kokoro-js:', err);
                });
            `;
            document.head.appendChild(script);
            
            // Wait for the library to load
            await new Promise((resolve, reject) => {
                const checkInterval = setInterval(() => {
                    if (window.KokoroTTS) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 30 seconds
                setTimeout(() => {
                    clearInterval(checkInterval);
                    if (!window.KokoroTTS) {
                        reject(new Error('Timeout loading kokoro-js library'));
                    }
                }, 30000);
            });
            
            showStatus('Initializing embedded TTS model...', 'loading');
            
            // Initialize the TTS model
            embeddedTTS = await window.KokoroTTS.from_pretrained(
                'onnx-community/Kokoro-82M-ONNX',
                { 
                    dtype: 'q8',
                    progress_callback: (progress) => {
                        if (progress.status === 'progress') {
                            const percent = Math.round((progress.loaded / progress.total) * 100);
                            showStatus(`Downloading model: ${percent}%`, 'loading');
                        }
                    }
                }
            );
        }

        showStatus('Generating speech with embedded TTS...', 'loading');

        const voice = voiceSelect.value;
        const speed = parseFloat(speedInput.value);

        // Generate audio
        const audio = await embeddedTTS.generate(text, { voice: voice, speed: speed });

        // Convert audio data to WAV blob for playback and download
        const audioBlob = await audioToWavBlob(audio);
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store references for download functionality
        currentAudioBlob = audioBlob;
        currentAudioUrl = audioUrl;

        // Play audio
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';
        audioPlayer.play();

        currentAudio = audioPlayer;
        showStatus('Speech generated successfully! 🎉', 'success');
        showAudioControls();

    } catch (error) {
        console.error('Embedded TTS Error:', error);
        throw error;
    }
}

/**
 * Generates speech using API endpoint (server-based)
 */
async function generateSpeechAPI(text) {
    try {
        const endpoint = apiEndpoint.value || 'http://localhost:8000';
        const useOpenAI = useOpenAIFormat.checked;
        
        let url, body, headers;
        
        if (useOpenAI) {
            // OpenAI-compatible format
            url = `${endpoint}/v1/audio/speech`;
            headers = {
                'Content-Type': 'application/json',
            };
            
            // Add API key if provided
            if (apiKey.value) {
                headers['Authorization'] = `Bearer ${apiKey.value}`;
            }
            
            body = JSON.stringify({
                model: 'kokoro',
                voice: voiceSelect.value,
                input: text,
                response_format: 'wav',
                speed: parseFloat(speedInput.value),
                language: langSelect.value
            });
        } else {
            // Original Kokoro format
            url = `${endpoint}/generate`;
            headers = {
                'Content-Type': 'application/json',
            };
            
            body = JSON.stringify({
                text: text,
                voice: voiceSelect.value,
                speed: parseFloat(speedInput.value),
                language: langSelect.value
            });
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Store references for download functionality
        currentAudioBlob = audioBlob;
        currentAudioUrl = audioUrl;

        // Play audio
        audioPlayer.src = audioUrl;
        audioPlayer.style.display = 'block';
        audioPlayer.play();

        currentAudio = audioPlayer;
        showStatus('Speech generated successfully! 🎉', 'success');
        showAudioControls();

    } catch (error) {
        console.error('API TTS Error:', error);
        throw error;
    }
}

/**
 * Helper function to convert kokoro-js audio output to WAV blob
 */
async function audioToWavBlob(audio) {
    // Extract audio data and sample rate
    const audioData = audio.data;
    const sampleRate = audio.rate || 24000;
    const numChannels = 1; // Mono
    const bitsPerSample = 16;

    // Calculate sizes
    const bytesPerSample = bitsPerSample / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioData.length * bytesPerSample;
    const fileSize = 44 + dataSize; // 44 bytes for WAV header

    // Create WAV file buffer
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, fileSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format chunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write audio data (convert Float32 to Int16)
    let offset = 44;
    for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        view.setInt16(offset, sample * 32767, true);
        offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Stops any currently playing speech audio and resets the UI.
 */
function stopSpeech() {
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    resetUI();
    showStatus('Stopped', 'success');
}

/**
 * Resets the UI state of the speak/stop buttons and generation status.
 */
function resetUI() {
    speakBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    isGenerating = false;
}

/**
 * Displays a status message in the popup.
 * @param {string} message - The message to display.
 * @param {string} type - The type of status (e.g., 'success', 'error', 'loading').
 */
function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';

    // Auto-hide success messages after a delay
    if (type === 'success') {
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }
}
