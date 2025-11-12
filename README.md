# Kokoro TTS Add-on

> 🧠 Local Neural Text-to-Speech for Firefox — fast, private, offline.

> **Tested on a Xeon E3-1265L v3 (2013)** — Ran multiple TTS jobs in parallel with barely perceptible lag.  
> If it works on this, it'll fly on your machine.

---

## 🔍 What is This?

Kokoro TTS is a browser extension that lets you convert selected or pasted text into natural-sounding speech — without needing an internet connection.  
It supports **two modes**:
1. **API Mode**: Uses a lightweight Flask server with the Kokoro model running locally on your system
2. **Embedded Mode**: Runs 100% in your browser using WebGPU/WASM (no server needed!)

- ✅ No accounts or logins
- ✅ No cloud APIs or telemetry
- ✅ No GPU required but helps a lot, if no usable GPU falls to using the CPU
- ✅ NEW: Browser-based mode with no server setup required!

---

## 🚀 Features

- 🎙️ **Neural TTS** with multiple voice options (American, British, Spanish, French, Italian, Portuguese, Hindi, Japanese, Chinese)
- 🔒 **Offline-first** & privacy-respecting — no cloud APIs or telemetry
- 🧊 **Lightweight**: Only 82M parameters
- 🥔 **Works on low-end CPUs** — tested on hardware from 2013
- 🌍 **Cross-platform**: Linux, macOS, and Windows support
- 🔌 **OpenAI-compatible API** endpoint for seamless integration with VibeVoice and other services
- 📡 **Real-time streaming** support with SSE (Server-Sent Events)
- ⚙️ **Configurable endpoints** — use local server or connect to remote TTS services
- 🎯 **Drop-in replacement** for OpenAI TTS API
- 🌐 **NEW: Embedded Browser Mode** — Run TTS 100% in your browser using kokoro-js with WebGPU/WASM acceleration (no server required!)

---

## ✨ What's New in v3.2

**Embedded Browser-Based TTS Mode**

- 🆕 **Embedded Mode**: Run Kokoro TTS 100% in your browser using kokoro-js
- 🆕 **No Server Required**: Choose between API mode (server-based) or Embedded mode (browser-based)
- 🆕 **WebGPU/WASM Acceleration**: Fast inference directly in the browser
- 🆕 **Easy Mode Selection**: Switch between API and Embedded modes in the extension popup
- 🆕 **Automatic Model Download**: First-time use downloads the model (~86MB with q8 quantization)
- 🆕 **Privacy-First**: In Embedded mode, everything runs locally in your browser—no server, no network requests

**Previous (v3.1): OpenAI API Compatibility & Enhanced Integration**

- Full OpenAI-compatible API at `/v1/audio/speech`
- VibeVoice integration support with SSE streaming
- Configurable API endpoints in extension UI
- API key authentication for remote services
- Voice mapping for OpenAI voice names (alloy, echo, fable, onyx, nova, shimmer)
- Comprehensive testing suite with web interface and Python scripts

See [CHANGELOG.md](CHANGELOG.md) for complete details.

---

## ⚙️ Installation

> 🚀 **Quick start in 5 minutes**: See [QUICKSTART.md](QUICKSTART.md)  
> 📖 **Detailed instructions**: See [INSTALL.md](INSTALL.md)
> 🌐 **NEW: No setup needed!** Just install the extension and use Embedded mode

### 1. Download from Releases

Head to the [Releases Page](https://github.com/groxaxo/kokoro-tts-addon/releases) and grab:

- `kokoro-tts-addon-v3.2.xpi` (the Firefox extension)
- `server.py` (the local TTS server - **optional**, only needed for API mode)

**Alternative: Build from Source**

```bash
# Linux/macOS
./build-xpi.sh

# Windows
build-xpi.bat
```

This will create `kokoro-tts-addon-v3.2.xpi` in the current directory.

### 2. Install the Add-on in Firefox

- Go to `about:addons`
- Click the gear icon → `Install Add-on From File...`
- Select the `.xpi` you downloaded

**That's it for Embedded mode!** You can start using it right away.

### 3. Start the Local Server (Optional - Only for API Mode)

#### macOS / Linux:
```bash
nohup python3 /path/to/server.py &
```

#### Windows:
Create a `.bat` file like this:
```bat
cd C:\path\to\server
start python server.py
```
Drop a shortcut to it in the Startup folder (`Win + R → shell:startup`).

To install espeak-ng on Windows:
1. Go to [espeak-ng releases](https://github.com/espeak-ng/espeak-ng/releases)
2. Click on **Latest release**
3. Download the appropriate `*.msi` file (e.g. **espeak-ng-20191129-b702b03-x64.msi**)
4. Run the downloaded installer

For advanced configuration and usage on Windows, see the [official espeak-ng Windows guide](https://github.com/espeak-ng/espeak-ng/blob/master/docs/guide.md)

---

## 🌐 Using Embedded Browser Mode (No Server Required!)

**New in v3.2!** You can now use Kokoro TTS without any server setup:

1. Open the extension popup
2. Select **"Embedded (Browser)"** from the **TTS Mode** dropdown
3. Enter or select text to speak
4. Click **"Generate Speech"**
5. On first use, the model will be downloaded (~86MB) - this is cached for future use
6. Speech generation happens entirely in your browser using WebGPU/WASM!

**Benefits of Embedded Mode:**
- ✅ No Python server required
- ✅ No installation needed beyond the browser extension
- ✅ WebGPU acceleration for fast inference
- ✅ 100% privacy - everything runs locally in your browser
- ✅ Works offline after initial model download

**When to use API Mode vs Embedded Mode:**
- **API Mode**: Better for batch processing, server integration, or when you already have a server running
- **Embedded Mode**: Perfect for casual use, no setup required, maximum privacy

---

## 🧪 How to Test

**For Embedded Mode:**
1. Install the extension
2. Select "Embedded (Browser)" mode in the popup
3. Enter text and generate speech - that's it!

**For API Mode:**

1. Visit `http://localhost:8000/health`  
2. You should see a simple “healthy” JSON response
3. Use the extension: paste text, pick a voice, click “Generate Speech” 🎉

---

## 🔌 OpenAI API Integration & VibeVoice Support

The server now supports OpenAI-compatible API endpoints, allowing integration with services like VibeVoice!

### OpenAI-Compatible Endpoint

The server exposes `/v1/audio/speech` endpoint that accepts OpenAI-style requests:

```bash
curl -X POST "http://localhost:8000/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kokoro",
    "voice": "af_heart",
    "input": "Hello, this is a test!",
    "response_format": "wav",
    "speed": 1.0
  }' \
  --output speech.wav
```

### Streaming with SSE

For real-time streaming, add `stream_format: "sse"` to your request:

```bash
curl -X POST "http://localhost:8000/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kokoro",
    "voice": "af_heart",
    "input": "Hello, streaming audio!",
    "response_format": "pcm",
    "stream_format": "sse"
  }'
```

### Using with VibeVoice

To use an external VibeVoice API server:

1. Open the extension popup
2. Set the **API Endpoint** to your VibeVoice server URL (e.g., `http://127.0.0.1:8000`)
3. Enter your **API Key** if required
4. Check the **"Use OpenAI-compatible format"** checkbox
5. Select your text and generate speech!

The extension will automatically use the VibeVoice streaming format and handle SSE responses.

### Voice Mapping

The following OpenAI voice names are automatically mapped to Kokoro voices:
- `alloy` → `af_alloy`
- `echo` → `am_echo`
- `fable` → `bm_fable`
- `onyx` → `am_onyx`
- `nova` → `af_nova`
- `shimmer` → `af_sky`

### Testing the API

We provide several ways to test the OpenAI-compatible endpoint:

**Option 1: Web Interface**
Open `test_openai_endpoint.html` in your browser to test the API endpoint with a user-friendly interface.

**Option 2: Python Test Script**
```bash
python3 test_api.py
# Or with custom endpoint and API key:
python3 test_api.py http://your-server:8000 your-api-key
```

**Option 3: OpenAI Python Client Examples**
```bash
pip install openai
python3 example_openai_client.py
```

---

## 📌 Notes

- First-time run will download the model
- Make sure Python 3.8+ is installed and in PATH
- All processing is local — nothing leaves your machine (unless using external API endpoint)

---

## 🧩 Dependencies

You’ll need Python 3.8+ and `pip` installed. Most systems already have them.  
To install all required Python packages (including some optional extras for extended model usage), run:

```bash
python3 -m pip install --upgrade pip
pip install --upgrade pip setuptools
cat requirements.txt | xargs -n 1 pip3 install
pip3 install -U flask-cors
```

---

## 📄 License

Licensed under the [Apache License 2.0](LICENSE)

---

## ❤️ Credits

Powered by the Kokoro TTS model

---

| Feature                                                          | Preview                                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Popup UI**: Select text, and this pops up.              | [![UI Preview](https://i.imgur.com/zXvETFV.png)](https://i.imgur.com/zXvETFV.png)       |
| **Playback in Action**: After clicking "Generate Speech"         | [![Playback Preview](https://i.imgur.com/STeXJ78.png)](https://i.imgur.com/STeXJ78.png) |
| **System Notifications**: Get notified when playback starts      | *(not pictured)*                                             |
| **Settings Panel**: configuration options         | [![Settings](https://i.imgur.com/wNOgrnZ.png)](https://i.imgur.com/wNOgrnZ.png)         |
| **Voice List**: Browse the models available                      | [![Voices](https://i.imgur.com/3fTutUR.png)](https://i.imgur.com/3fTutUR.png)           |
| **Accents Supported**: 🇺🇸 American English, 🇬🇧 British English, 🇪🇸 Spanish, 🇫🇷 French, 🇮🇹 Italian, 🇧🇷 Portuguese (BR), 🇮🇳 Hindi, 🇯🇵 Japanese,  🇨🇳 Mandarin Chines | [![Accents](https://i.imgur.com/lc7qgYN.png)](https://i.imgur.com/lc7qgYN.png)          |

---

# Video - Kokoro Text-to-Speech - Local on a Potato Vs Hugging Face 

[![Watch the video](https://img.youtube.com/vi/6AVZFwWllgU/hqdefault.jpg)](https://www.youtube.com/watch?v=6AVZFwWllgU)

*Comparison of offline using MKLDNN vs online generation using WASM/WebGPU.*

---
