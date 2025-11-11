# Kokoro TTS Add-on

> 🧠 Local Neural Text-to-Speech for Firefox — fast, private, offline.

> **Tested on a Xeon E3-1265L v3 (2013)** — Ran multiple TTS jobs in parallel with barely perceptible lag.  
> If it works on this, it'll fly on your machine.

---

## 🔍 What is This?

Kokoro TTS is a browser extension that lets you convert selected or pasted text into natural-sounding speech — without needing an internet connection.  
It uses a lightweight Flask server and the Kokoro model running locally on your system.

- ✅ No accounts or logins
- ✅ No cloud APIs or telemetry
- ✅ No GPU required but helps a lot, if no usable GPU falls to using the CPU.

---

## 🚀 Features

- 🎙️ Neural TTS with multiple voice options
- 🔒 Offline-first & privacy-respecting
- 🧊 Lightweight: Small 82M parameters
- 🥔 Works on low-end CPUs
- 🌍 Linux, macOS, and Windows support
- 🔌 OpenAI-compatible API endpoint for integration with VibeVoice and other services
- 📡 Real-time streaming support with SSE (Server-Sent Events)
- ⚙️ Configurable API endpoint for local or remote TTS services

---

## ⚙️ Installation

### 1. Download from Releases

Head to the [Releases Page](https://github.com/pinguy/kokoro-tts-addon/releases) and grab:

- `latest kokoro-tts-addon.xpi`
- `server.py`

### 2. Install the Add-on in Firefox

- Go to `about:addons`
- Click the gear icon → `Install Add-on From File...`
- Select the `.xpi` you downloaded

### 3. Start the Local Server

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

## 🧪 How to Test

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
