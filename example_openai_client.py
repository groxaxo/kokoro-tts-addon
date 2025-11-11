#!/usr/bin/env python3
"""
Example: Using Kokoro TTS with OpenAI Python client library.

This demonstrates how to use the OpenAI-compatible endpoint with
the official OpenAI Python library, making it easy to switch between
Kokoro TTS and other OpenAI-compatible services like VibeVoice.

Installation:
    pip install openai

Usage:
    python example_openai_client.py
"""

from openai import OpenAI
import sys

def example_basic_usage():
    """Basic example of generating speech with the OpenAI client."""
    print("\n" + "="*60)
    print("Example 1: Basic Speech Generation")
    print("="*60)
    
    # Initialize client pointing to local Kokoro server
    client = OpenAI(
        base_url="http://localhost:8000/v1",
        api_key="not-needed"  # API key not required for local server
    )
    
    # Generate speech
    print("Generating speech...")
    response = client.audio.speech.create(
        model="kokoro",
        voice="af_heart",
        input="Hello! This is an example of using Kokoro TTS with the OpenAI Python client library.",
        response_format="wav"
    )
    
    # Save to file
    output_file = "example_basic.wav"
    with open(output_file, "wb") as f:
        f.write(response.content)
    
    print(f"✓ Speech saved to: {output_file}")
    return output_file

def example_with_options():
    """Example with various options."""
    print("\n" + "="*60)
    print("Example 2: Speech Generation with Options")
    print("="*60)
    
    client = OpenAI(
        base_url="http://localhost:8000/v1",
        api_key="not-needed"
    )
    
    # Generate speech with custom speed
    print("Generating speech with speed 1.3x...")
    response = client.audio.speech.create(
        model="kokoro",
        voice="am_adam",  # Male voice
        input="This speech is generated at 1.3x speed for faster playback.",
        response_format="wav",
        speed=1.3
    )
    
    output_file = "example_fast.wav"
    with open(output_file, "wb") as f:
        f.write(response.content)
    
    print(f"✓ Speech saved to: {output_file}")
    return output_file

def example_with_vibevoice():
    """Example showing how to switch to VibeVoice."""
    print("\n" + "="*60)
    print("Example 3: Using with VibeVoice (if available)")
    print("="*60)
    
    # To use with VibeVoice, just change the base_url and add your API key
    print("To use with VibeVoice, configure as follows:")
    print("""
    client = OpenAI(
        base_url="http://your-vibevoice-server:8000/v1",
        api_key="your-api-key-here"  # Add your VibeVoice API key
    )
    
    response = client.audio.speech.create(
        model="vibevoice/VibeVoice-1.5B",
        voice="Andrew",  # VibeVoice voice
        input="Hello from VibeVoice!",
        response_format="mp3"
    )
    """)

def example_list_models():
    """Example of listing available models."""
    print("\n" + "="*60)
    print("Example 4: Listing Available Models")
    print("="*60)
    
    client = OpenAI(
        base_url="http://localhost:8000/v1",
        api_key="not-needed"
    )
    
    try:
        print("Fetching available models...")
        models = client.models.list()
        
        print("\nAvailable models:")
        for model in models.data:
            print(f"  - {model.id}")
            print(f"    Owner: {model.owned_by}")
            print(f"    Created: {model.created}")
    except Exception as e:
        print(f"Note: Model listing may not be fully supported. Error: {e}")

def example_error_handling():
    """Example with error handling."""
    print("\n" + "="*60)
    print("Example 5: Error Handling")
    print("="*60)
    
    client = OpenAI(
        base_url="http://localhost:8000/v1",
        api_key="not-needed"
    )
    
    try:
        print("Attempting to generate speech with empty input...")
        response = client.audio.speech.create(
            model="kokoro",
            voice="af_heart",
            input="",  # Empty input should fail
            response_format="wav"
        )
    except Exception as e:
        print(f"✓ Expected error caught: {type(e).__name__}")
        print(f"  Message: {str(e)[:100]}...")

def main():
    """Run all examples."""
    print("\n" + "="*60)
    print("  Kokoro TTS - OpenAI Client Examples")
    print("="*60)
    print("\nThese examples demonstrate using Kokoro TTS with the")
    print("official OpenAI Python client library.\n")
    
    try:
        # Run examples
        example_basic_usage()
        example_with_options()
        example_with_vibevoice()
        example_list_models()
        example_error_handling()
        
        print("\n" + "="*60)
        print("✓ All examples completed!")
        print("="*60)
        print("\nGenerated audio files:")
        print("  - example_basic.wav (basic speech)")
        print("  - example_fast.wav (1.3x speed)")
        print("\nYou can now play these files to hear the results.")
        
        return 0
        
    except Exception as e:
        print("\n" + "="*60)
        print(f"✗ Error running examples: {e}")
        print("="*60)
        print("\nMake sure the Kokoro TTS server is running:")
        print("  python3 server.py")
        return 1

if __name__ == "__main__":
    sys.exit(main())
