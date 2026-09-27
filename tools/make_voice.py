#!/usr/bin/env python3
"""Record every line of a game in the house voice (Kokoro "Sarah", American).

    python3 tools/make_voice.py apsis/G1/C02-Show_Me_Tell_Me/voice/ENG01CH02FINISHSIGN_voice_script.csv

Reads a voice script (tools/voice_lines.js), gives each line a mood, and writes
voice/clips/<key>.mp3. Clips already made with the same text and settings are
kept (voice/clips/manifest.json), so games in a chapter share them and a re-run
only records what is new. Then rebuild the game with tools/build.py.

One-time setup:  npm install --prefix tools/voice   and
                 pip install librosa soundfile lameenc wordfreq espeakng-loader phonemizer

Moods (how a loving parent / big sister would say it to a six-year-old):
  instruction  slow and warm            speed 0.80
  word         a single word, clearly   speed 0.80
  gentle       after a wrong answer     speed 0.82
  cheer        level banners            speed 0.95
  excited      right answers, praise    speed 1.05, stretched "Yaaay!"
  read         read-along sentences (speed 0.70): read like a Grade 1 teacher reads aloud,
               phrase by phrase ("In the classroom, / signs help us / to find
               things."), each phrase at a natural speed with a pause after it.
               Nothing is slowed down or stretched, so every word keeps its
               natural sound. Pauses: 0.7 s between phrases, 0.8 s after a comma,
               1 s after a sentence, so a page is read at about 100 words a
               minute. The time of every word is saved for highlighting.

Quality: the voice's own 24 kHz audio (no resampling), 64 kbps mono MP3, every
clip brought to the same loudness. Short lines are checked with espeak: a word
that would be spelled out as letters (e.g. "US") is reported.
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
BITRATE = 64
TARGET_RMS = 0.075                           # same loudness for every clip
PHRASE_PAUSE = 0.70                          # seconds between phrases when reading aloud
COMMA_PAUSE = 0.80                           # seconds after a comma
SENTENCE_PAUSE = 1.00                        # seconds after . ! ?
QUALITY = "q2"                               # bump to re-record everything

EXCITED = re.compile(r"^(yay|super|well done|wow|you got it|hooray|great job|amazing|find one more)", re.I)
GENTLE = re.compile(r"^(oops|try again|listen carefully|let's listen|let us listen|look carefully)", re.I)
CHEER = re.compile(r"^(level \w+!|now find|book challenge)", re.I)
SPEED = {"instruction": 0.80, "word": 0.80, "gentle": 0.82, "cheer": 0.95, "excited": 1.05, "read": 0.70}
SAY_AS = {"yay!": "Yaaay!", "hooray!": "Hoo-ray!", "you got it!": "Yes! You got it!"}
# how names are said, if a game ever uses one ({"Name": "how to say it"});
# the on-screen spelling never changes. No named characters are used (2026-09-26).
NAMES = {}
# words a phrase may start with when a sentence is read slowly
BREAK_BEFORE = {"with", "to", "where", "what", "that", "in", "on", "at"}


def mood(text, style=""):
    if style == "read":
        return "read"
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
    t = re.sub(r"^(This sign says) (.+)$", r"\1: \2.", t)
    return t


def phrases(sentence):
    """Split a sentence into short phrases a Grade 1 child can follow:
    at punctuation, and before words like "with", "to", "where" once a phrase
    has two or more words; four words at most, or five when that lets the
    phrase end just before such a word ("We touch and feel things / with our
    hands.")."""
    words = sentence.split()
    if not re.search(r"[.,;:!?]", sentence):
        return words  # a list of words ("see hear smell taste touch"): one at a time
    out, cur = [], []
    for i, w in enumerate(words):
        bare = re.sub(r"[^a-z']", "", w.lower())
        if cur and len(cur) >= 2 and bare in BREAK_BEFORE and i < len(words) - 1:
            out.append(cur); cur = []
        cur.append(w)
        nxt2 = re.sub(r"[^a-z']", "", words[i + 2].lower()) if i + 2 < len(words) else ""
        if re.search(r"[,.;:!?]$", w) or len(cur) >= 5 or (len(cur) == 4 and nxt2 not in BREAK_BEFORE):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    # never leave a one-word phrase dangling at the end
    if len(out) > 1 and len(out[-1]) == 1 and not re.search(r"[.!?]$", out[-2][-1]):
        last = out.pop()
        out[-1] = out[-1] + last
    return [" ".join(p) for p in out]


def syllables(w):
    return max(1, len(re.findall(r"[aeiouy]+", w.lower())))


def loud(y):
    """same loudness for every clip (RMS over the voiced part), no clipping"""
    voiced = y[np.abs(y) > 0.02]
    rms = np.sqrt(np.mean(voiced ** 2)) if voiced.size else 1e-3
    y = y * (TARGET_RMS / max(rms, 1e-4))
    peak = np.max(np.abs(y))
    return y * (0.95 / peak) if peak > 0.95 else y


def trim(y, sr):
    y, _ = librosa.effects.trim(y, top_db=40)
    fade = int(sr * 0.008)
    if len(y) > 2 * fade:
        y[:fade] *= np.linspace(0, 1, fade)
        y[-fade:] *= np.linspace(1, 0, fade)
    return y


def mp3(y, sr):
    y = np.concatenate([np.zeros(int(sr * 0.03)), y, np.zeros(int(sr * 0.18))])
    enc = lameenc.Encoder()
    enc.set_bit_rate(BITRATE); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    return enc.encode((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()) + enc.flush()


def check_pronunciation(rows):
    """Words said on their own: warn if espeak would spell them out as letters."""
    try:
        import espeakng_loader
        from phonemizer.backend.espeak.wrapper import EspeakWrapper
        EspeakWrapper.set_library(espeakng_loader.get_library_path())
        EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
        from phonemizer import phonemize
    except Exception:
        print("(pronunciation check skipped: pip install espeakng-loader phonemizer)")
        return
    short = [r for r in rows if len(r["say"].split()) <= 2]
    if not short:
        return
    ipa = phonemize([r["say"].strip(".!?") for r in short], language="en-us", backend="espeak", strip=True)
    ipa_low = phonemize([r["say"].strip(".!?").lower() for r in short], language="en-us", backend="espeak", strip=True)
    warn = [(r["text"], a) for r, a, b in zip(short, ipa, ipa_low) if a != b and re.search(r"[A-Z]{2,}", r["say"])]
    for text, a in warn:
        print("  PRONUNCIATION: %r would be said /%s/ (letters?)" % (text, a))
    print("pronunciation check: %d short lines, %d warnings" % (len(short), len(warn)))


def signature(parts, m):
    extra = [PHRASE_PAUSE, COMMA_PAUSE, SENTENCE_PAUSE] if m == "read" else []
    return hashlib.sha1(json.dumps([VOICE, parts, SPEED[m], BITRATE, QUALITY] + extra).encode()).hexdigest()[:12]


def main():
    script = sys.argv[1]
    clip_dir = os.path.join(os.path.dirname(script), "clips")
    os.makedirs(clip_dir, exist_ok=True)
    man_path = os.path.join(clip_dir, "manifest.json")
    manifest = json.load(open(man_path)) if os.path.exists(man_path) else {}
    rows = list(csv.DictReader(open(script, encoding="utf-8")))
    todo, jobs = [], []
    tmp = tempfile.mkdtemp()
    for r in rows:
        m = mood(r["text"], r.get("style", "") or "")
        say = spoken(r["text"]) if m != "read" else r["text"]
        r["say"] = say
        parts = phrases(say) if m == "read" else [say]
        sig = signature(parts, m)
        mp3_path = os.path.join(clip_dir, r["key"] + ".mp3")
        if manifest.get(r["key"], {}).get("sig") == sig and os.path.exists(mp3_path):
            continue
        t = {"key": r["key"], "text": r["text"], "say": say, "mood": m, "sig": sig, "parts": []}
        for i, ptxt in enumerate(parts):
            out = os.path.join(tmp, "%s__%d.wav" % (r["key"], i))
            jobs.append({"text": ptxt, "sid": VOICE["sid"], "speed": SPEED[m], "out": out})
            t["parts"].append((ptxt, out))
        todo.append(t)
    check_pronunciation(rows)
    print("%s: %d lines, %d to record" % (os.path.basename(script), len(rows), len(todo)))
    if not todo:
        return
    json.dump(jobs, open(os.path.join(tmp, "jobs.json"), "w"))
    subprocess.run(["node", os.path.join(HERE, "voice", "kokoro.js"), os.path.join(tmp, "jobs.json")], check=True)
    for t in todo:
        pieces, times, clock, sr = [], [], 0.03, 24000
        for i, (ptxt, wav) in enumerate(t["parts"]):
            y, sr = sf.read(wav)
            y = trim(y.astype(np.float32), sr)
            pieces.append(y)
            # word start times inside this phrase, shared out by syllables
            ws = ptxt.split(); total = sum(syllables(w) for w in ws); dur = len(y) / sr; acc = 0
            for w in ws:
                times.append(round(clock + dur * acc / total, 3)); acc += syllables(w)
            clock += dur
            if i < len(t["parts"]) - 1:
                gap = SENTENCE_PAUSE if re.search(r"[.!?:]$", ptxt) else COMMA_PAUSE if ptxt.endswith(",") else PHRASE_PAUSE
                pieces.append(np.zeros(int(sr * gap))); clock += gap
        y = loud(np.concatenate(pieces))
        open(os.path.join(clip_dir, t["key"] + ".mp3"), "wb").write(mp3(y, sr))
        entry = {"text": t["text"], "said_as": t["say"], "mood": t["mood"], "voice": VOICE["name"], "sig": t["sig"]}
        if t["mood"] == "read":
            entry["phrases"] = [p for p, _ in t["parts"]]
            entry["times"] = times
        manifest[t["key"]] = entry
    json.dump(manifest, open(man_path, "w"), indent=1, sort_keys=True)
    size = sum(os.path.getsize(os.path.join(clip_dir, f)) for f in os.listdir(clip_dir) if f.endswith(".mp3"))
    print("recorded %d clips; clips folder now %d KB" % (len(todo), size // 1024))


if __name__ == "__main__":
    main()
