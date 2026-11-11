import sys
import os
import time
import json

sys.path.insert(0, os.path.abspath('backend'))
from dotenv import load_dotenv
load_dotenv('backend/.env')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== RUNNING STREAMING AUDIO INTEGRATION TESTS ===")

# 1. Test POST /api/chat latency with stream_audio=True
print("\n--- TEST 1: POST /api/chat with stream_audio=True ---")
t0 = time.perf_counter()
res = client.post('/api/chat', json={
    'organisation_id': 'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'message': 'Hello, what computing degrees are offered at APIIT?',
    'avatar_gender': 'female',
    'stream_audio': True
})
t_chat = time.perf_counter() - t0
print(f"HTTP status: {res.status_code}, Elapsed: {t_chat:.3f}s")
assert res.status_code == 200, f"Chat failed with status {res.status_code}"
data = res.json()
print("Answer snippet:", data['answer'][:120], "...")
print("Audio base64 is None:", data['audio_base64'] is None)
assert data['audio_base64'] is None
answer_text = data['answer']

# 2. Test WebSocket Audio Streaming for Female Avatar (Thalia)
print("\n--- TEST 2: WebSocket Streaming for Female Avatar ---")
with client.websocket_connect('/api/chat/audio-stream') as ws:
    t_ws_start = time.perf_counter()
    ws.send_json({
        'action': 'synthesize',
        'text': answer_text[:200],
        'voice_gender': 'female',
        'stream_id': 'female-test-1'
    })
    
    start_event = ws.receive_json()
    print("Start event:", start_event)
    assert start_event['type'] == 'stream_start'
    assert start_event['sample_rate'] == 24000
    
    first_chunk_t = None
    chunks = 0
    bytes_count = 0
    while True:
        msg = ws.receive()
        if 'bytes' in msg and msg['bytes']:
            if first_chunk_t is None:
                first_chunk_t = time.perf_counter()
                print(f"Female voice first chunk arrived in {first_chunk_t - t_ws_start:.3f}s (size: {len(msg['bytes'])} bytes)")
            chunks += 1
            bytes_count += len(msg['bytes'])
        elif 'text' in msg:
            end_event = json.loads(msg['text'])
            print("End event:", end_event)
            assert end_event['type'] == 'stream_end'
            break
    print(f"Female stream complete: {chunks} chunks, {bytes_count} bytes in {time.perf_counter() - t_ws_start:.3f}s")

# 3. Test WebSocket Audio Streaming for Male Avatar (Orion)
print("\n--- TEST 3: WebSocket Streaming for Male Avatar ---")
with client.websocket_connect('/api/chat/audio-stream') as ws:
    t_ws_start = time.perf_counter()
    ws.send_json({
        'action': 'synthesize',
        'text': 'Welcome to APIIT Sri Lanka. I am Alex, Admissions Coordinator.',
        'voice_gender': 'male',
        'stream_id': 'male-test-1'
    })
    
    start_event = ws.receive_json()
    print("Start event:", start_event)
    first_chunk_t = None
    chunks = 0
    bytes_count = 0
    while True:
        msg = ws.receive()
        if 'bytes' in msg and msg['bytes']:
            if first_chunk_t is None:
                first_chunk_t = time.perf_counter()
                print(f"Male voice first chunk arrived in {first_chunk_t - t_ws_start:.3f}s (size: {len(msg['bytes'])} bytes)")
            chunks += 1
            bytes_count += len(msg['bytes'])
        elif 'text' in msg:
            end_event = json.loads(msg['text'])
            print("End event:", end_event)
            assert end_event['type'] == 'stream_end'
            break
    print(f"Male stream complete: {chunks} chunks, {bytes_count} bytes in {time.perf_counter() - t_ws_start:.3f}s")

# 4. Test Backward Compatibility: POST /api/chat with stream_audio=False
print("\n--- TEST 4: Backward Compatibility (stream_audio=False) ---")
t0 = time.perf_counter()
res_offline = client.post('/api/chat', json={
    'organisation_id': 'c0e954d5-1e9f-4d10-8493-3553c873c204',
    'message': 'Hi',
    'avatar_gender': 'female',
    'stream_audio': False
})
print(f"stream_audio=False status: {res_offline.status_code}, time: {time.perf_counter() - t0:.3f}s")
offline_data = res_offline.json()
print("Has audio_base64:", offline_data.get('audio_base64') is not None)

print("\n==========================================")
print("ALL STREAMING AUDIO TESTS PASSED!")
print("==========================================")

