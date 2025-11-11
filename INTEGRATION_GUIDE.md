# Integration Guide

This guide shows how to integrate Kokoro TTS with various services and frameworks using the OpenAI-compatible API.

## Table of Contents
- [Basic Integration](#basic-integration)
- [VibeVoice Integration](#vibevoice-integration)
- [Python Client](#python-client)
- [JavaScript/Node.js](#javascriptnodejs)
- [cURL Examples](#curl-examples)
- [Streaming Audio](#streaming-audio)

---

## Basic Integration

The server exposes an OpenAI-compatible endpoint at `/v1/audio/speech` that accepts standard OpenAI TTS parameters.

### Endpoint Details

**URL:** `POST http://localhost:8000/v1/audio/speech`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY (optional)
```

**Request Body:**
```json
{
  "model": "kokoro",
  "voice": "af_heart",
  "input": "Text to convert to speech",
  "response_format": "wav",
  "speed": 1.0,
  "language": "a"
}
```

**Response:** Audio file in the requested format

---

## VibeVoice Integration

To use Kokoro TTS as a drop-in replacement or alongside VibeVoice:

### 1. Configure the Extension

1. Open the Kokoro TTS extension popup
2. Set **API Endpoint** to your VibeVoice server URL (e.g., `http://127.0.0.1:8000`)
3. Enter your **API Key** (if required by your VibeVoice instance)
4. Check **"Use OpenAI-compatible format"**
5. Save and test with any text

### 2. Streaming with VibeVoice

For real-time streaming, add `stream_format: "sse"` to your request:

```json
{
  "model": "kokoro",
  "voice": "af_heart",
  "input": "Streaming audio test",
  "response_format": "pcm",
  "stream_format": "sse"
}
```

The server will respond with Server-Sent Events containing base64-encoded audio chunks.

---

## Python Client

### Using the OpenAI Library

```python
from openai import OpenAI

# For local Kokoro server
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed"
)

# For VibeVoice or external service
client = OpenAI(
    base_url="http://your-vibevoice-server:8000/v1",
    api_key="your-api-key"
)

# Generate speech
response = client.audio.speech.create(
    model="kokoro",
    voice="af_heart",
    input="Hello, world!",
    response_format="wav"
)

# Save to file
with open("output.wav", "wb") as f:
    f.write(response.content)
```

### Using Requests

```python
import requests

url = "http://localhost:8000/v1/audio/speech"
headers = {"Content-Type": "application/json"}
data = {
    "model": "kokoro",
    "voice": "af_heart",
    "input": "Hello, world!",
    "response_format": "wav"
}

response = requests.post(url, json=data, headers=headers)

with open("output.wav", "wb") as f:
    f.write(response.content)
```

---

## JavaScript/Node.js

### Browser (Fetch API)

```javascript
async function generateSpeech(text) {
    const response = await fetch('http://localhost:8000/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'kokoro',
            voice: 'af_heart',
            input: text,
            response_format: 'wav'
        })
    });
    
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const audio = new Audio(audioUrl);
    audio.play();
}
```

### Node.js

```javascript
const fetch = require('node-fetch');
const fs = require('fs');

async function generateSpeech(text) {
    const response = await fetch('http://localhost:8000/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'kokoro',
            voice: 'af_heart',
            input: text,
            response_format: 'wav'
        })
    });
    
    const buffer = await response.buffer();
    fs.writeFileSync('output.wav', buffer);
}
```

---

## cURL Examples

### Basic Request

```bash
curl -X POST "http://localhost:8000/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kokoro",
    "voice": "af_heart",
    "input": "Hello from cURL!",
    "response_format": "wav"
  }' \
  --output output.wav
```

### With Authentication

```bash
curl -X POST "http://localhost:8000/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "kokoro",
    "voice": "af_heart",
    "input": "Authenticated request",
    "response_format": "wav"
  }' \
  --output output.wav
```

### Streaming Request

```bash
curl -X POST "http://localhost:8000/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kokoro",
    "voice": "af_heart",
    "input": "Streaming test",
    "response_format": "pcm",
    "stream_format": "sse"
  }'
```

---

## Streaming Audio

### SSE Streaming Format

When `stream_format: "sse"` is specified, the server responds with Server-Sent Events:

```
data: {"audio": "base64_encoded_pcm_data", "index": 0}

data: {"audio": "base64_encoded_pcm_data", "index": 1}

data: {"done": true}
```

### Processing SSE Stream in JavaScript

```javascript
async function streamSpeech(text) {
    const response = await fetch('http://localhost:8000/v1/audio/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'kokoro',
            voice: 'af_heart',
            input: text,
            response_format: 'pcm',
            stream_format: 'sse'
        })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                
                if (data.audio) {
                    // Decode and play audio chunk
                    const audioData = atob(data.audio);
                    // Process PCM data...
                } else if (data.done) {
                    console.log('Stream complete');
                }
            }
        }
    }
}
```

---

## Voice Mapping

When using OpenAI voice names, they are automatically mapped to Kokoro voices:

| OpenAI Voice | Kokoro Voice |
|--------------|--------------|
| alloy        | af_alloy     |
| echo         | am_echo      |
| fable        | bm_fable     |
| onyx         | am_onyx      |
| nova         | af_nova      |
| shimmer      | af_sky       |

You can also use Kokoro voice names directly for more options.

---

## Error Handling

The API returns OpenAI-compatible error responses:

```json
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error"
  }
}
```

Common error types:
- `invalid_request_error` - Missing or invalid parameters
- `server_error` - Internal server error during generation

---

## Additional Resources

- [Main README](README.md) - Installation and basic usage
- [test_openai_endpoint.html](test_openai_endpoint.html) - Interactive API tester
- [example_openai_client.py](example_openai_client.py) - Python examples
- [test_api.py](test_api.py) - Automated test script

---

## Support

For issues or questions:
1. Check the [README](README.md)
2. Review the examples in this guide
3. Run the test suite to verify your setup
4. Open an issue on GitHub
