#!/usr/bin/env python3
"""Record every line of a game in the house voice (Kokoro "Sarah", American).

    python3 tools/make_voice.py apsis/G1/C02-Show_Me_Tell_Me/voice/ENG01CH02FINISHSIGN_voice_script.csv

Reads a voice script (tools/voice_lines.js), gives each line a mood, and writes
voice/clips/<key>.mp3. Clips already made with the same text and settings are
kept (voice/clips/manifest.json), so games in a chapter share them and a re-run
only records what is new. Then rebuild the game with tools/build.py.

One-time setup:  npm install --prefix tools/voice   and
                 pip install librosa soundfile lameenc

Moods (how a loving parent / big sister would say it to a six-year-old):
  instruction  slow and warm            speed 0.80
  word         a single word, clearly   speed 0.78
  gentle       after a wrong answer     speed 0.82
  cheer        level banners            speed 0.95
  excited      right answers, praise    speed 1.05, stretched "Yaaay!"
"""
import csv
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile

import lameenc
import librosa
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = {"name": "sarah", "sid": 3}          # Kokoro v0.19 speaker 3 = af_sarah (chosen 2026-09-26)
OUT_RATE = 22050
BITRATE = 40

EXCITED = re.compile(r"^(yay|super|well done|wow|you got it|hooray|great job|amazing|find one more)", re.I)
GENTLE = re.compile(r"^(oops|try again|listen carefully|let's listen|let us listen)", re.I)
CHEER = re.compile(r"^(level \w+!|now find|book challenge)", re.I)
SPEED = {"instruction": 0.80, "word": 0.78, "gentle": 0.82, "cheer": 0.95, "excited": 1.05}
# how some lines are said (the on-screen text stays as it is)
SAY_AS = {"yay!": "Yaaay!", "hooray!": "Hoo-ray!", "you got it!": "Yes! You got it!"}
# how names are said, if a game ever uses one ({"Name": "how to say it"});
# the on-screen spelling never changes. No named characters are used (2026-09-26).
NAMES = {}


def mood(text):
    if EXCITED.match(text):
        return "excited"
    if GENTLE.match(text):
        return "gentle"
    if CHEER.match(text):
        return "cheer"
    if len(text.split()) <= 2 and not re.search(r"[.!?]$", text):
        return "word"
    return "instruction"


def spoken(text):
    t = SAY_AS.get(text.lower(), text)
    for name, say in NAMES.items():
        t = re.sub(r"\b%s\b" % name, say, t)
    if t.lower().startswith(("which ", "what ", "can you ")) and not t.endswith("?"):
        t = t.rstrip(".") + "?"
    if mood(text) == "word" and not re.search(r"[.!?]$", t):
        t += "."
    # "This sign says Stop" -> a small pause before the sign
    t = re.sub(r"^(This sign says) (.+)$", r"\1: \2.", t)
    return t


def encode(y, sr):
    y, _ = librosa.effects.trim(y, top_db=38)
    y = librosa.resample(y, orig_sr=sr, target_sr=OUT_RATE)
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
    fade = int(OUT_RATE * 0.012)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    y = np.concatenate([np.zeros(int(OUT_RATE * 0.03)), y, np.zeros(int(OUT_RATE * 0.16))])
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE); enc.set_in_sample_rate(OUT_RATE); enc.set_channels(1); enc.set_quality(2)
    return enc.encode((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()) + enc.flush()


def main():
    script = sys.argv[1]
    clip_dir = os.path.join(os.path.dirname(script), "clips")
    os.makedirs(clip_dir, exist_ok=True)
    man_path = os.path.join(clip_dir, "manifest.json")
    manifest = json.load(open(man_path)) if os.path.exists(man_path) else {}
    rows = list(csv.DictReader(open(script, encoding="utf-8")))
    todo = []
    for r in rows:
        m = mood(r["text"])
        say = spoken(r["text"])
        sig = hashlib.sha1(json.dumps([VOICE, say, SPEED[m], OUT_RATE, BITRATE]).encode()).hexdigest()[:12]
        mp3 = os.path.join(clip_dir, r["key"] + ".mp3")
        if manifest.get(r["key"], {}).get("sig") == sig and os.path.exists(mp3):
            continue
        todo.append({"key": r["key"], "text": r["text"], "say": say, "mood": m, "sig": sig})
    print("%s: %d lines, %d to record" % (os.path.basename(script), len(rows), len(todo)))
    if not todo:
        return
    tmp = tempfile.mkdtemp()
    jobs = [{"text": t["say"], "sid": VOICE["sid"], "speed": SPEED[t["mood"]], "out": os.path.join(tmp, t["key"] + ".wav")} for t in todo]
    json.dump(jobs, open(os.path.join(tmp, "jobs.json"), "w"))
    subprocess.run(["node", os.path.join(HERE, "voice", "kokoro.js"), os.path.join(tmp, "jobs.json")], check=True)
    for t in todo:
        y, sr = sf.read(os.path.join(tmp, t["key"] + ".wav"))
        open(os.path.join(clip_dir, t["key"] + ".mp3"), "wb").write(encode(y.astype(np.float32), sr))
        manifest[t["key"]] = {"text": t["text"], "said_as": t["say"], "mood": t["mood"], "voice": VOICE["name"], "sig": t["sig"]}
    json.dump(manifest, open(man_path, "w"), indent=1, sort_keys=True)
    size = sum(os.path.getsize(os.path.join(clip_dir, f)) for f in os.listdir(clip_dir) if f.endswith(".mp3"))
    print("recorded %d clips; clips folder now %d KB" % (len(todo), size // 1024))


if __name__ == "__main__":
    main()
