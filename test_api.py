#!/usr/bin/env python3
"""
Simple test script for the OpenAI-compatible API endpoint.
This can be used to verify the endpoint works correctly.
"""

import requests
import json
import sys

def test_health(base_url):
    """Test the health endpoint."""
    print(f"\n🏥 Testing health endpoint: {base_url}/health")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.ok:
            data = response.json()
            print("✓ Health check passed!")
            print(f"  Status: {data.get('status')}")
            print(f"  Device: {data.get('device_info', 'Unknown')}")
            print(f"  Available voices: {len(data.get('available_voices', []))}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Failed to connect: {e}")
        return False

def test_openai_endpoint(base_url, api_key=None):
    """Test the OpenAI-compatible endpoint."""
    print(f"\n🎙️ Testing OpenAI endpoint: {base_url}/v1/audio/speech")
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    payload = {
        'model': 'kokoro',
        'voice': 'af_heart',
        'input': 'This is a test of the OpenAI-compatible API endpoint.',
        'response_format': 'wav',
        'speed': 1.0,
        'language': 'a'
    }
    
    print(f"Request payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{base_url}/v1/audio/speech",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.ok:
            print("✓ Speech generation successful!")
            print(f"  Content type: {response.headers.get('Content-Type')}")
            print(f"  Content length: {len(response.content)} bytes")
            
            # Save to file
            output_file = 'test_output.wav'
            with open(output_file, 'wb') as f:
                f.write(response.content)
            print(f"  Saved to: {output_file}")
            return True
        else:
            print(f"✗ Request failed: {response.status_code}")
            print(f"  Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_models_endpoint(base_url):
    """Test the models listing endpoint."""
    print(f"\n📋 Testing models endpoint: {base_url}/v1/models")
    try:
        response = requests.get(f"{base_url}/v1/models", timeout=5)
        if response.ok:
            data = response.json()
            print("✓ Models endpoint working!")
            print(f"  Available models: {len(data.get('data', []))}")
            for model in data.get('data', []):
                print(f"    - {model.get('id')}")
            return True
        else:
            print(f"✗ Request failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Failed to connect: {e}")
        return False

def main():
    """Run all tests."""
    base_url = 'http://localhost:8000'
    api_key = None
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    if len(sys.argv) > 2:
        api_key = sys.argv[2]
    
    print("=" * 60)
    print("  Kokoro TTS - OpenAI API Endpoint Test")
    print("=" * 60)
    print(f"Base URL: {base_url}")
    if api_key:
        print(f"API Key: {'*' * len(api_key)}")
    else:
        print("API Key: Not provided")
    
    results = {
        'health': test_health(base_url),
        'models': test_models_endpoint(base_url),
        'speech': test_openai_endpoint(base_url, api_key)
    }
    
    print("\n" + "=" * 60)
    print("  Test Results")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name.ljust(20)}: {status}")
    
    all_passed = all(results.values())
    print("=" * 60)
    if all_passed:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the server is running.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
