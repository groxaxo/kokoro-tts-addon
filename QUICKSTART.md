# Quick Start Guide

Get up and running with Kokoro TTS in 5 minutes!

## Prerequisites

- Firefox browser
- Python 3.8 or higher
- 500MB free disk space (for model)

## Step 1: Install Extension (2 minutes)

1. Download `kokoro-tts-addon-v3.1.xpi` from [Releases](https://github.com/groxaxo/kokoro-tts-addon/releases)
2. Open Firefox and go to `about:addons`
3. Click the gear icon (⚙️) → "Install Add-on From File..."
4. Select the `.xpi` file and click "Add"

✅ Extension installed!

## Step 2: Install Dependencies (2 minutes)

Open terminal/command prompt:

```bash
# Install Python packages
pip3 install torch kokoro-onnx flask flask-cors phonemizer

# Install espeak-ng
# Linux:
sudo apt-get install espeak-ng

# macOS:
brew install espeak-ng

# Windows: Download from https://github.com/espeak-ng/espeak-ng/releases
```

✅ Dependencies installed!

## Step 3: Start Server (30 seconds)

```bash
# Download server.py from releases
# Then run:
python3 server.py
```

You should see:
```
* Running on http://127.0.0.1:8000
```

✅ Server running!

## Step 4: Test It! (30 seconds)

1. Visit http://localhost:8000/health
   - Should show: `{"status": "healthy"}`

2. On any webpage, select some text

3. Right-click → "Generate Speech with Kokoro TTS"

4. Listen! 🎉

✅ **You're done!**

---

## Basic Usage

### Context Menu (Right-Click)

1. Select text on any webpage
2. Right-click → "Generate Speech with Kokoro TTS"
3. Audio plays automatically

### Extension Popup

1. Click the Kokoro TTS icon in toolbar
2. Paste or type text
3. Choose voice and settings
4. Click "Generate Speech"

### Keyboard Shortcut

Select text and use the context menu (no built-in keyboard shortcut yet).

---

## Common Settings

Click the Kokoro TTS icon to access settings:

- **Voice**: Choose from 12+ voices in different accents
- **Language**: Match your text language (auto-detected)
- **Speed**: 0.5 (slow) to 2.0 (fast), default 1.0
- **API Endpoint**: Default `http://localhost:8000`

---

## Troubleshooting

### "Server not responding"
- Check if server is running: `curl http://localhost:8000/health`
- Restart the server: Stop with Ctrl+C, run `python3 server.py` again

### "No audio plays"
- Check browser volume settings
- Try a different voice
- Check browser console (F12) for errors

### "Model downloading is slow"
- First run downloads ~300MB model - be patient!
- Subsequent runs use cached model (fast)

### "espeak-ng not found"
- Verify installation: `espeak-ng --version`
- Linux: Make sure package is installed
- Windows: Add to PATH environment variable

---

## Next Steps

### Use with VibeVoice

1. Open extension popup
2. Change API Endpoint to your VibeVoice URL
3. Enable "Use OpenAI-compatible format"
4. Add API key if needed

### Advanced Configuration

See [INSTALL.md](INSTALL.md) for:
- Running server as background service
- Auto-start on boot
- Custom configurations
- Network access setup

### API Integration

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for:
- Using the OpenAI-compatible API
- Python and JavaScript examples
- Streaming audio with SSE
- Integration with other services

---

## Getting Help

- 📖 [Full Installation Guide](INSTALL.md)
- 🔌 [API Integration Guide](INTEGRATION_GUIDE.md)
- 📋 [Changelog](CHANGELOG.md)
- 🐛 [Report Issues](https://github.com/groxaxo/kokoro-tts-addon/issues)

---

## Tips

💡 **First-time use**: Model downloads on first speech generation (~300MB). This is normal and only happens once.

💡 **Performance**: Works great on older hardware. Tested on 2013 CPU with excellent results!

💡 **Privacy**: Everything runs locally. No internet required after initial model download.

💡 **Voices**: Try different voices! Each has unique characteristics:
- `af_heart` - American female (warm)
- `af_sky` - American female (clear)
- `am_echo` - American male (deep)
- `bf_emma` - British female
- And more!

💡 **Languages**: Supports 9 languages:
- 🇺🇸 English (American)
- 🇬🇧 English (British)
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇮🇹 Italian
- 🇧🇷 Portuguese
- 🇮🇳 Hindi
- 🇯🇵 Japanese
- 🇨🇳 Chinese

---

**Enjoy natural, local text-to-speech with Kokoro TTS! 🎙️**
