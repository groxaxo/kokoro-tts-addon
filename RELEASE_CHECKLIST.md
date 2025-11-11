# Release Checklist for v3.1

This document outlines the steps needed to publish the Kokoro TTS v3.1 release on GitHub.

## Pre-Release Verification ✅

- [x] Version bumped in manifest.json (3.0 → 3.1)
- [x] CHANGELOG.md finalized with release date
- [x] README.md updated with new features
- [x] XPI file built and tested
- [x] Build scripts created and tested
- [x] Documentation complete (INSTALL.md, RELEASE_NOTES.md)
- [x] All changes committed and pushed

## Publishing the Release

### Step 1: Build the Release Artifacts

The XPI file should already be built, but if you need to rebuild:

```bash
./build-xpi.sh
```

This will create:
- `kokoro-tts-addon-v3.1.xpi`
- `kokoro-tts-addon-v3.1.xpi.sha256`

### Step 2: Create GitHub Release

1. Go to https://github.com/groxaxo/kokoro-tts-addon/releases
2. Click "Draft a new release"
3. Create a new tag: `v3.1`
4. Set release title: `Kokoro TTS v3.1 - OpenAI API Compatible`
5. Copy content from `RELEASE_NOTES.md` into the release description
6. Attach the following files:
   - `kokoro-tts-addon-v3.1.xpi` (from current directory)
   - `server.py` (from current directory)
   - `kokoro-tts-addon-v3.1.xpi.sha256` (checksum file)

### Step 3: Verify the Release

After publishing:
1. Download the XPI from the release page
2. Verify the checksum matches:
   ```bash
   sha256sum kokoro-tts-addon-v3.1.xpi
   # Should match the value in .sha256 file
   ```
3. Test installation in a clean Firefox profile:
   - `about:addons` → gear icon → "Install Add-on From File..."
   - Select the downloaded XPI
   - Verify it installs and runs correctly

## Files to Include in Release

### Required Files
- ✅ `kokoro-tts-addon-v3.1.xpi` - The Firefox extension
- ✅ `server.py` - The TTS server script
- ✅ `kokoro-tts-addon-v3.1.xpi.sha256` - Checksum for verification

### Optional Files
- `requirements.txt` - Python dependencies (useful for users)

## Release Description Template

Use this template or the content from RELEASE_NOTES.md:

```markdown
# Kokoro TTS v3.1 - OpenAI API Compatible

## 🎉 What's New

Full OpenAI API compatibility and VibeVoice integration!

### Key Features
- OpenAI-compatible API endpoint (`/v1/audio/speech`)
- Server-Sent Events streaming for real-time audio
- VibeVoice integration support
- Configurable API endpoints in extension UI
- API key authentication for remote services
- Voice mapping for OpenAI names
- Comprehensive test suite

### Download & Install

1. Download `kokoro-tts-addon-v3.1.xpi`
2. Install in Firefox: `about:addons` → gear icon → "Install Add-on From File..."
3. Download `server.py` and run: `python3 server.py`

📖 Full installation guide: [INSTALL.md](https://github.com/groxaxo/kokoro-tts-addon/blob/main/INSTALL.md)

### Checksums

Verify your download:
```
SHA256: [checksum from .sha256 file]
```

### Documentation
- [Installation Guide](INSTALL.md)
- [Integration Guide](INTEGRATION_GUIDE.md)
- [Changelog](CHANGELOG.md)

**Full Changelog**: https://github.com/groxaxo/kokoro-tts-addon/blob/main/CHANGELOG.md
```

## Post-Release Tasks

After publishing the release:

- [ ] Update any pinned issues or announcements
- [ ] Share release announcement (if applicable)
- [ ] Monitor issues for any installation problems
- [ ] Update project documentation if needed

## Rollback Plan

If issues are discovered after release:

1. Mark the release as "Pre-release" in GitHub
2. Add a warning banner to the release description
3. Create a hotfix branch and prepare v3.1.1
4. Follow this checklist again for the hotfix release

## Support Resources

Users can get help from:
- GitHub Issues: https://github.com/groxaxo/kokoro-tts-addon/issues
- Documentation: All .md files in repository
- Test tools included in repository

---

## Current Status

✅ **Ready for release!** All artifacts are built and tested.

The XPI file (`kokoro-tts-addon-v3.1.xpi`) is in the current directory and ready to upload to GitHub releases.
