# Changelog

All notable changes to this project will be documented in this file.

## [3.1] - 2025-11-11

### Added
- OpenAI-compatible API endpoint at `/v1/audio/speech` for integration with external services
- `/v1/models` endpoint for listing available models
- SSE (Server-Sent Events) streaming support for real-time audio generation
- Configurable API endpoint field in extension popup UI
- API key field for authentication with external services
- "Use OpenAI-compatible format" toggle in extension settings
- Voice mapping for common OpenAI voice names (alloy, echo, fable, onyx, nova, shimmer)
- Comprehensive test suite:
  - `test_openai_endpoint.html` - Interactive web-based API tester
  - `test_api.py` - Automated Python test script
  - `example_openai_client.py` - Examples using OpenAI Python library
- Full VibeVoice integration support
- `.gitignore` file for Python and development artifacts
- Extensive documentation for OpenAI API usage

### Changed
- Extended `popup.js` to support both Kokoro and OpenAI-compatible formats
- Updated `background.js` to handle SSE streaming from OpenAI-compatible endpoints
- Enhanced `server.py` with OpenAI API compatibility layer
- Updated README with OpenAI API integration guide and testing instructions
- Settings persistence now includes API endpoint and authentication preferences

### Technical Details
- Base64-encoded PCM audio chunks for SSE streaming
- Backward compatibility maintained with original Kokoro format
- Support for both streaming and non-streaming responses
- Proper error handling for both API formats
- Authorization header support for API key authentication

### Security
- API keys stored securely in browser's local storage
- Password input field for API key entry in UI
- No credentials hardcoded in source code

## [3.0] - Previous Release
- Initial release with local Kokoro TTS support
- Multiple voice options
- Offline-first architecture
- Firefox extension with context menu integration
