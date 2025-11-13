# Installation Guide

This guide provides step-by-step instructions for installing and configuring the Kokoro TTS Firefox addon.

## Quick Start

1. **Download the extension** - Get `kokoro-tts-addon-v3.1.xpi` from the [Releases Page](https://github.com/groxaxo/kokoro-tts-addon/releases)
2. **Install in Firefox** - Go to `about:addons`, click gear icon → "Install Add-on From File...", select the `.xpi`
3. **Download server** - Get `server.py` from the same releases page
4. **Start the server** - Run `python3 server.py`
5. **Test it** - Select text on any webpage, right-click, choose "Generate Speech with Kokoro TTS"

---

## Detailed Installation

### Step 1: Install Firefox Extension

#### Option A: Install from Release (Recommended)

1. Go to the [Releases Page](https://github.com/groxaxo/kokoro-tts-addon/releases)
2. Download `kokoro-tts-addon-v3.1.xpi`
3. Open Firefox and navigate to `about:addons`
4. Click the gear icon (⚙️) in the top-right
5. Select "Install Add-on From File..."
6. Browse to and select the downloaded `.xpi` file
7. Click "Add" when Firefox prompts for permissions

#### Option B: Build from Source

Building from source requires Node.js and npm to be installed.

```bash
# Clone the repository
git clone https://github.com/groxaxo/kokoro-tts-addon.git
cd kokoro-tts-addon

# Install npm dependencies (required for bundling)
npm install

# Build the XPI
./build-xpi.sh  # On Linux/macOS
# or
build-xpi.bat   # On Windows

# Install the generated kokoro-tts-addon-v3.1.xpi in Firefox
```

### Step 2: Install Python Dependencies

The TTS server requires Python 3.8 or higher.

```bash
# Upgrade pip
python3 -m pip install --upgrade pip setuptools

# Install dependencies
pip3 install torch kokoro-onnx flask flask-cors phonemizer
```

### Step 3: Install espeak-ng (Required for phonemization)

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install espeak-ng
```

#### macOS
```bash
brew install espeak-ng
```

#### Windows
1. Go to [espeak-ng releases](https://github.com/espeak-ng/espeak-ng/releases)
2. Download the latest `.msi` installer (e.g., `espeak-ng-20191129-b702b03-x64.msi`)
3. Run the installer
4. Add espeak-ng to your PATH if not done automatically

### Step 4: Start the TTS Server

#### Linux/macOS

**Option 1: Run in terminal**
```bash
python3 server.py
```

**Option 2: Run in background**
```bash
nohup python3 /path/to/server.py > /tmp/kokoro-tts.log 2>&1 &
```

**Option 3: Create a systemd service** (Linux only)

Create `/etc/systemd/system/kokoro-tts.service`:
```ini
[Unit]
Description=Kokoro TTS Server
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/kokoro-tts-addon
ExecStart=/usr/bin/python3 /path/to/kokoro-tts-addon/server.py
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable kokoro-tts
sudo systemctl start kokoro-tts
```

#### Windows

**Option 1: Create a startup script**

Create `start-kokoro-tts.bat`:
```bat
@echo off
cd C:\path\to\kokoro-tts-addon
start pythonw server.py
```

Place a shortcut to this file in:
- Press `Win + R`
- Type `shell:startup`
- Press Enter
- Copy the shortcut there

**Option 2: Run as a Windows Service**

Install NSSM (Non-Sucking Service Manager):
```bat
# Download from https://nssm.cc/download
nssm install KokoroTTS "C:\Python39\python.exe" "C:\path\to\server.py"
nssm start KokoroTTS
```

### Step 5: Verify Installation

1. Open Firefox and navigate to http://localhost:8000/health
2. You should see: `{"status": "healthy"}`
3. Select some text on any webpage
4. Right-click and choose "Generate Speech with Kokoro TTS"
5. Click the extension icon to open the popup and test from there

---

## Configuration

### Extension Settings

Click the Kokoro TTS icon in Firefox toolbar to access settings:

- **Voice**: Choose from available voices (American, British, Spanish, French, etc.)
- **Language**: Select language code
- **Speed**: Adjust speech rate (0.5 - 2.0)
- **API Endpoint**: Server URL (default: `http://localhost:8000`)
- **API Key**: Optional, for authentication with remote services
- **Use OpenAI-compatible format**: Enable for OpenAI API compatibility

### Server Configuration

Edit `server.py` to customize:

```python
# Change port (default: 8000)
app.run(host='0.0.0.0', port=8000)

# Enable CORS for specific origins
CORS(app, origins=["http://your-domain.com"])
```

---

## Using with Remote Services

### VibeVoice Integration

1. Open extension settings
2. Set **API Endpoint** to your VibeVoice server URL
3. Enter **API Key** if required
4. Enable **"Use OpenAI-compatible format"**
5. Test with any text

### Custom TTS Services

Any OpenAI-compatible TTS API can be used:

1. Ensure the service supports `/v1/audio/speech` endpoint
2. Configure the endpoint URL in extension settings
3. Add API key if required
4. Enable OpenAI format toggle

---

## Troubleshooting

### Extension doesn't work

- Verify server is running: `curl http://localhost:8000/health`
- Check Firefox console for errors (F12)
- Ensure permissions are granted to the extension

### Server fails to start

- Check Python version: `python3 --version` (must be 3.8+)
- Verify dependencies: `pip3 list | grep -E "torch|kokoro|flask"`
- Check if port 8000 is available: `netstat -an | grep 8000`

### No audio output

- Check browser audio settings
- Verify audio format is supported (try different voice)
- Test with popup interface first

### espeak-ng not found

**Linux:**
```bash
sudo apt-get install espeak-ng
export PHONEMIZER_ESPEAK_LIBRARY=/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1
```

**Windows:**
Add espeak-ng installation directory to PATH

### Performance issues

- First run downloads the model (~300MB)
- Subsequent runs use cached model
- For better performance, use a GPU-enabled PyTorch build
- Close other resource-intensive applications

---

## Uninstallation

### Remove Extension
1. Go to `about:addons`
2. Find "Kokoro TTS"
3. Click "Remove"

### Stop Server

**Linux/macOS:**
```bash
# If running in terminal, press Ctrl+C
# If running as background process
pkill -f server.py

# If using systemd
sudo systemctl stop kokoro-tts
sudo systemctl disable kokoro-tts
```

**Windows:**
```bat
# Task Manager → find python.exe running server.py → End Task
# Or if using NSSM
nssm stop KokoroTTS
nssm remove KokoroTTS
```

### Remove Dependencies (Optional)
```bash
pip3 uninstall torch kokoro-onnx flask flask-cors phonemizer
```

---

## Security Considerations

- The server runs locally by default (localhost:8000)
- No data is sent to external services unless configured
- API keys are stored in browser's secure storage
- For public deployments, consider:
  - Adding authentication
  - Using HTTPS
  - Implementing rate limiting
  - Restricting CORS origins

---

## Support

- **Documentation**: [README.md](README.md)
- **Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/groxaxo/kokoro-tts-addon/issues)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

## Next Steps

- Explore [OpenAI API Integration](INTEGRATION_GUIDE.md)
- Check out the [Architecture Documentation](ARCHITECTURE.md)
- Review [available voices and languages](README.md#features)
- Test the API with included testing tools
