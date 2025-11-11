# Architecture Overview

This document provides a visual overview of the Kokoro TTS system architecture with OpenAI API integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Firefox Browser                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Popup UI    │    │  Background  │    │   Content    │          │
│  │  (popup.js)  │◄──►│   Script     │◄──►│   Script     │          │
│  │              │    │(background.js)│    │ (content.js) │          │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘          │
│         │                   │                    │                   │
│         │  Settings         │  API Calls         │  Stream Audio    │
│         │  Storage          │  (Fetch)           │  (Web Audio)     │
│         │                   │                    │                   │
└─────────┼───────────────────┼────────────────────┼───────────────────┘
          │                   │                    │
          │                   │                    │
          │                   ▼                    │
          │         ┌───────────────────┐         │
          │         │   Network Layer   │         │
          │         └─────────┬─────────┘         │
          │                   │                    │
          │                   │                    │
          └───────────────────┼────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────────┐
              │    TTS Server (Flask)             │
              │    Port 8000                      │
              ├───────────────────────────────────┤
              │                                   │
              │  ┌─────────────────────────────┐ │
              │  │  Kokoro Format Endpoints    │ │
              │  ├─────────────────────────────┤ │
              │  │  /health                    │ │
              │  │  /generate (non-streaming)  │ │
              │  │  /stream (PCM streaming)    │ │
              │  │  /system-info               │ │
              │  └─────────────────────────────┘ │
              │                                   │
              │  ┌─────────────────────────────┐ │
              │  │  OpenAI Compatible Endpoints│ │
              │  ├─────────────────────────────┤ │
              │  │  /v1/audio/speech           │ │
              │  │  /v1/models                 │ │
              │  │  (SSE streaming support)    │ │
              │  └─────────────────────────────┘ │
              │                                   │
              │  ┌─────────────────────────────┐ │
              │  │  Kokoro TTS Engine          │ │
              │  ├─────────────────────────────┤ │
              │  │  - Voice synthesis          │ │
              │  │  - Multiple languages       │ │
              │  │  - Speed control            │ │
              │  │  - GPU/CPU optimization     │ │
              │  └─────────────────────────────┘ │
              └───────────────────────────────────┘
                              │
                              │ Can also connect to
                              ▼
              ┌───────────────────────────────────┐
              │    External Services              │
              │    (e.g., VibeVoice)              │
              ├───────────────────────────────────┤
              │  - OpenAI-compatible API          │
              │  - SSE streaming support          │
              │  - Custom voices/models           │
              └───────────────────────────────────┘
```

## Data Flow

### Standard Speech Generation (Non-Streaming)

```
User Action (Select text → Context menu)
    │
    ▼
Content Script (content.js)
    │ Detect selection
    ▼
Background Script (background.js)
    │ Get settings (endpoint, API key, format)
    ▼
Fetch API Request
    │ POST /generate OR /v1/audio/speech
    ▼
Server (server.py)
    │ Validate parameters
    │ Get/create pipeline
    ▼
Kokoro TTS Engine
    │ Generate audio segments
    │ Concatenate segments
    ▼
Server Response
    │ Return complete WAV/MP3 file
    ▼
Background Script
    │ Receive audio blob
    ▼
Content Script
    │ Create audio element
    │ Play audio
    ▼
User hears speech
```

### Streaming Speech Generation (SSE)

```
User Action (Select text → Context menu)
    │
    ▼
Content Script (content.js)
    │ Detect selection
    ▼
Background Script (background.js)
    │ Get settings
    │ Set stream_format: "sse"
    ▼
Fetch API Request (SSE)
    │ POST /stream OR /v1/audio/speech
    ▼
Server (server.py)
    │ Start streaming response
    ▼
┌───────────── Kokoro TTS Engine Loop ────────────────┐
│                                                      │
│  Generate audio chunk                               │
│    │                                                 │
│    ▼                                                 │
│  Encode as base64 (for SSE) or raw PCM             │
│    │                                                 │
│    ▼                                                 │
│  Send via SSE: data: {"audio": "...", "index": n}  │
│    │                                                 │
│    ▼                                                 │
│  Background Script                                  │
│    │ Parse SSE event                                │
│    │ Decode audio chunk                             │
│    ▼                                                 │
│  Content Script                                     │
│    │ Queue audio chunk                              │
│    │ Play via Web Audio API                         │
│    │                                                 │
│    └────────────── Loop ──────────────┐            │
│                                         │            │
└─────────────────────────────────────────┼────────────┘
                                          │
                                          ▼
                              User hears speech in real-time
```

## Component Responsibilities

### Frontend Components

#### Popup UI (`popup.html` + `popup.js`)
**Responsibilities:**
- User interface for text input and settings
- Voice/language selection
- Speed control
- API endpoint configuration
- API key management
- Settings persistence (browser.storage.local)
- Direct speech generation via UI button

**Key Functions:**
- `loadSettings()` - Load saved preferences
- `saveSettings()` - Persist user configuration
- `generateSpeech()` - Trigger TTS from popup
- `checkServerStatus()` - Verify server availability

#### Background Script (`background.js`)
**Responsibilities:**
- Context menu management
- Listen for user actions (right-click menu)
- Orchestrate speech generation requests
- Handle both Kokoro and OpenAI formats
- Parse SSE streaming responses
- Route audio chunks to content script

**Key Functions:**
- `speakText(text, tabId)` - Main TTS orchestration
- SSE parser for streaming audio
- Format selection (Kokoro vs OpenAI)
- API authentication handling

#### Content Script (`content.js`)
**Responsibilities:**
- Inject into every webpage
- Detect text selection
- Show floating TTS button
- Stream audio playback
- Handle audio chunks from background script
- Provide in-page notifications

**Key Functions:**
- `initAudioContext()` - Setup Web Audio API
- `processAudioChunk()` - Handle streaming audio
- `processQueue()` - Manage playback queue
- `showNotification()` - User feedback

### Backend Components

#### Flask Server (`server.py`)
**Responsibilities:**
- HTTP server for TTS requests
- Dual API format support
- Device detection (GPU/CPU)
- Pipeline management
- Audio generation
- Streaming orchestration

**Endpoints:**

| Endpoint | Method | Format | Purpose |
|----------|--------|--------|---------|
| `/health` | GET | Both | Server health check |
| `/generate` | POST | Kokoro | Non-streaming generation |
| `/stream` | POST | Kokoro | PCM streaming |
| `/v1/audio/speech` | POST | OpenAI | TTS (streaming/non-streaming) |
| `/v1/models` | GET | OpenAI | List available models |
| `/system-info` | GET | Both | System diagnostics |
| `/force-cpu` | POST | Both | Force CPU mode |

**Key Functions:**
- `detect_optimal_device()` - GPU/CPU selection
- `get_pipeline(lang_code)` - Pipeline management
- `openai_compatible_speech()` - OpenAI endpoint handler
- SSE generator for streaming

#### Kokoro TTS Engine (external library)
**Responsibilities:**
- Neural TTS synthesis
- Multi-language support
- Voice selection
- Speed modulation
- Audio segment generation

## Configuration Flow

```
User opens popup
    │
    ▼
Load settings from browser.storage.local
    │
    ├─► apiEndpoint: "http://localhost:8000"
    ├─► apiKey: "" (optional)
    ├─► useOpenAIFormat: false/true
    ├─► voice: "af_heart"
    ├─► speed: 1.0
    └─► language: "a"
    │
    ▼
User modifies settings
    │
    ▼
Auto-save on change
    │
    ▼
Settings persisted
    │
    ▼
Background script reads settings on next request
```

## API Format Comparison

### Kokoro Format

**Request:**
```json
{
  "text": "Hello world",
  "voice": "af_heart",
  "speed": 1.0,
  "language": "a"
}
```

**Response:** Binary audio data (WAV)

**Streaming:** Raw PCM chunks

### OpenAI Format

**Request:**
```json
{
  "model": "kokoro",
  "voice": "af_heart",
  "input": "Hello world",
  "response_format": "wav",
  "speed": 1.0,
  "language": "a",
  "stream_format": "sse" // optional
}
```

**Response:** Binary audio data (WAV/MP3)

**Streaming:** SSE events with base64 PCM
```
data: {"audio": "base64_data", "index": 0}
data: {"audio": "base64_data", "index": 1}
data: {"done": true}
```

## Security Model

```
┌─────────────────────────────────────────┐
│  User Input                             │
│  - Text to speak                        │
│  - API key (optional)                   │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Storage Layer                          │
│  - browser.storage.local (encrypted)    │
│  - API key stored as password field     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Network Layer                          │
│  - HTTPS recommended for remote servers │
│  - Authorization: Bearer {api_key}      │
│  - CORS enabled for flexibility         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Server Validation                      │
│  - Input sanitization                   │
│  - Parameter validation                 │
│  - Voice name validation                │
│  - Language code validation             │
└─────────────────────────────────────────┘
```

## Error Handling Flow

```
Request Initiated
    │
    ▼
Try to fetch from configured endpoint
    │
    ├─► Success
    │   └─► Parse response
    │       ├─► Valid audio ──► Play
    │       └─► Invalid ──► Show error
    │
    └─► Failure
        ├─► Network error ──► "Cannot connect to server"
        ├─► 400 error ──► "Invalid request: {details}"
        ├─► 401 error ──► "Authentication failed"
        ├─► 500 error ──► "Server error: {details}"
        └─► Timeout ──► "Request timed out"
                │
                ▼
        Show notification in content script
        Log error to console
```

## Performance Considerations

### Streaming Benefits
- **Lower latency**: Audio starts playing immediately
- **Better UX**: Progressive feedback for long text
- **Memory efficient**: Chunks processed incrementally
- **Responsive**: User gets immediate feedback

### Optimization Strategies
1. **Pipeline caching**: Reuse loaded models
2. **Device selection**: GPU when available
3. **Thread optimization**: CPU thread tuning
4. **Chunk size**: Balanced for latency vs throughput

## Integration Points

### Local Kokoro
- Default configuration
- No API key required
- Fastest response time
- Full privacy (offline)

### VibeVoice
- Configure external endpoint
- Add API key if required
- SSE streaming support
- Access to VibeVoice models

### Other OpenAI Services
- Any compatible endpoint
- Standard OpenAI format
- Flexible voice options
- Easy switching via UI

## File Organization

```
kokoro-tts-addon/
├── Frontend
│   ├── popup.html          # Extension popup UI
│   ├── popup.js            # Popup logic
│   ├── background.js       # Background service worker
│   ├── content.js          # Content script for pages
│   ├── player.html         # Audio player iframe
│   ├── player.js           # Audio player logic
│   ├── styles.css          # Styling
│   └── manifest.json       # Extension manifest
│
├── Backend
│   ├── server.py           # Flask TTS server
│   └── requirements.txt    # Python dependencies
│
├── Testing
│   ├── test_openai_endpoint.html  # Interactive tester
│   ├── test_api.py                # Automated tests
│   └── example_openai_client.py   # Usage examples
│
├── Documentation
│   ├── README.md                  # Main documentation
│   ├── INTEGRATION_GUIDE.md       # Developer guide
│   ├── CHANGELOG.md               # Version history
│   ├── IMPLEMENTATION_SUMMARY.md  # Implementation details
│   ├── ARCHITECTURE.md            # This file
│   └── AMD_RADEON.md             # GPU-specific notes
│
└── Configuration
    └── .gitignore          # Git ignore rules
```

## Summary

The architecture provides:
- ✅ **Flexibility**: Local or remote TTS services
- ✅ **Compatibility**: OpenAI-standard API format
- ✅ **Performance**: Streaming for real-time audio
- ✅ **Security**: Secure credential storage
- ✅ **Usability**: Simple configuration UI
- ✅ **Extensibility**: Easy to add new services
- ✅ **Reliability**: Robust error handling

The system seamlessly integrates local Kokoro TTS with external services like VibeVoice while maintaining backward compatibility and providing a smooth user experience.
