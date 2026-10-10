"""Word-level Arabic timestamps for one episode.
Setup: pip install faster-whisper
Usage: python scripts/transcribe.py <episode-id> [audio-file-name]
Reads  public/episodes/<id>/<audio>  (default voice.mp3)
Writes src/episodes/<id>/words.json and prints numbered words (handy for "at" anchors).
"""
import json
import sys

from faster_whisper import WhisperModel

episode = sys.argv[1]
audio = sys.argv[2] if len(sys.argv) > 2 else "voice.mp3"

model = WhisperModel("large-v3", compute_type="int8")
# The prompt nudges Whisper to write English terms in Latin letters instead of Arabic transliteration.
PROMPT = "key, value, hash, Map, Array, Stack, Queue, loop, function, user, O(1), O(n)"
segments, _ = model.transcribe(
    f"public/episodes/{episode}/{audio}", language="ar", word_timestamps=True, initial_prompt=PROMPT
)

words = [
    {"text": w.word.strip(), "start": round(w.start, 2), "end": round(w.end, 2)}
    for s in segments
    for w in s.words
]

with open(f"src/episodes/{episode}/words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=1)

for i, w in enumerate(words):
    print(f"{i:>3}  {w['start']:>6.2f}  {w['text']}")
print(f"\n{len(words)} words written")
