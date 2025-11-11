# Kokoro TTS v3.1 Release Notes

## 🎉 What's New

Version 3.1 brings full **OpenAI API compatibility** and **VibeVoice integration** to Kokoro TTS!

### Key Features

- ✨ **OpenAI-compatible API endpoint** (`/v1/audio/speech`)
- 🔄 **Server-Sent Events streaming** for real-time audio
- 🔗 **VibeVoice integration** support
- ⚙️ **Configurable API endpoints** in extension UI
- 🔐 **API key authentication** for remote services
- 🎙️ **Voice mapping** for OpenAI names (alloy, echo, fable, nova, onyx, shimmer)
- 🧪 **Comprehensive test suite** included

### Download Files

For this release, you need:

1. **`kokoro-tts-addon-v3.1.xpi`** - The Firefox extension
2. **`server.py`** - The local TTS server

### Installation

#### Quick Start

1. Install the `.xpi` file in Firefox:
   - Go to `about:addons`
   - Click gear icon → "Install Add-on From File..."
   - Select `kokoro-tts-addon-v3.1.xpi`

2. Install Python dependencies:
   ```bash
   pip3 install torch kokoro-onnx flask flask-cors phonemizer
   ```

3. Install espeak-ng:
   - **Linux:** `sudo apt-get install espeak-ng`
   - **macOS:** `brew install espeak-ng`
   - **Windows:** Download from [espeak-ng releases](https://github.com/espeak-ng/espeak-ng/releases)

4. Run the server:
   ```bash
   python3 server.py
   ```

5. Test it! Select text on any webpage and right-click → "Generate Speech with Kokoro TTS"

📖 **Detailed instructions:** See [INSTALL.md](INSTALL.md) in the repository

### Upgrading from v3.0

If you're upgrading from version 3.0:

1. Remove the old extension from `about:addons`
2. Install the new `kokoro-tts-addon-v3.1.xpi`
3. Replace `server.py` with the new version
4. Restart the server

Your settings will be preserved.

### Using with VibeVoice

To use with an external VibeVoice server:

1. Open the extension popup
2. Set **API Endpoint** to your VibeVoice URL
3. Enter your **API Key** (if required)
4. Enable **"Use OpenAI-compatible format"**
5. Done! The extension now uses VibeVoice

### Documentation

- 📖 [README.md](README.md) - Overview and basic usage
- 🔧 [INSTALL.md](INSTALL.md) - Detailed installation guide
- 🔌 [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - API integration examples
- 📋 [CHANGELOG.md](CHANGELOG.md) - Complete list of changes
- 🏗️ [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- 📊 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details

### Testing

Test the OpenAI API endpoint:

```bash
# Health check
curl http://localhost:8000/health

# Generate speech
curl -X POST "http://localhost:8000/v1/audio/speech" \
  -H "Content-Type: application/json" \
  -d '{"model":"kokoro","voice":"af_heart","input":"Hello!"}' \
  --output test.wav
```

Or use the included test tools:
- `test_openai_endpoint.html` - Web interface
- `test_api.py` - Python test script
- `example_openai_client.py` - OpenAI library examples

### Known Issues

- First run downloads the model (~300MB) - this is normal
- MP3 format currently returns WAV with MP3 mimetype (functional but not true MP3)
- Windows users may need to add espeak-ng to PATH manually

### Support

- 🐛 [Report Issues](https://github.com/groxaxo/kokoro-tts-addon/issues)
- 💬 [Discussions](https://github.com/groxaxo/kokoro-tts-addon/discussions)
- 📧 Check the repository for contact information

### Credits

- Powered by the [Kokoro TTS model](https://github.com/thewh1teagle/kokoro-onnx)
- Built with Flask, PyTorch, and the Firefox WebExtensions API
- Thanks to all contributors and testers!

---

**Full Changelog**: [CHANGELOG.md](CHANGELOG.md)
