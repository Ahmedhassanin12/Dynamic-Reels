"""Word-level Arabic timestamps for one episode.
Setup: pip install -r requirements.txt
Usage: python scripts/transcribe.py <episode-id> [audio-file-name]
Reads  src/episodes/<id>/<audio>  (default voice.mp3)
Writes src/episodes/<id>/words.json and prints numbered words (handy for "at" anchors).
"""
import json
import os
import sys

# Compatibility shim: PyAV 19+ dropped `metadata_errors`, which faster-whisper 1.2.1 still passes to av.open
import av
_orig_av_open = av.open
def _compat_av_open(*args, **kwargs):
    kwargs.pop("metadata_errors", None)
    return _orig_av_open(*args, **kwargs)
av.open = _compat_av_open

from faster_whisper import WhisperModel

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

args = [a for a in sys.argv[1:] if not a.startswith("--")]
flags = [a for a in sys.argv[1:] if a.startswith("--")]

if len(args) < 1:
    print("Usage: python scripts/transcribe.py <episode-id> [audio-file-name] [--cuda]")
    sys.exit(1)

episode = args[0]
audio = args[1] if len(args) > 1 else "voice.mp3"
audio_path = f"src/episodes/{episode}/{audio}"

if not os.path.exists(audio_path):
    print(f"Error: audio file not found at '{audio_path}'")
    sys.exit(1)

# Dynamically construct initial prompt from glossary.json to encourage Latin spelling of terms
prompt_terms = ["key"]
glossary_file = "src/glossary.json"
if os.path.exists(glossary_file):
    try:
        with open(glossary_file, "r", encoding="utf-8") as f:
            for item in json.load(f):
                term = item.get("show")
                if term and term not in prompt_terms:
                    prompt_terms.append(term)
    except Exception as e:
        print(f"Warning: could not read {glossary_file}: {e}")

PROMPT = ", ".join(prompt_terms)
print(f"Using Whisper prompt terms: {PROMPT}")

device = "cuda" if "--cuda" in flags else "cpu"
print(f"Running WhisperModel (large-v3) on {device.upper()}...")
model = WhisperModel("large-v3", device=device, compute_type="int8")
segments, _ = model.transcribe(
    audio_path, language="ar", word_timestamps=True, initial_prompt=PROMPT
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
