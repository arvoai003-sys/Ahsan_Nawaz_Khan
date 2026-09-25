#!/usr/bin/env python3
"""Safe distractor letters for letter-fill items.

A distractor is safe when putting it in the gap does NOT make another real
English word (wordfreq zipf >= 2.5, which also catches common names and
abbreviations, so it errs on the safe side).

    python3 tools/letter_options.py "_un" sun        # prints safe letters
    python3 tools/letter_options.py --json spec.json  # batch: [[pattern, answer, pool], ...]
"""
import json
import sys
from wordfreq import zipf_frequency

REAL = 2.5
CONSONANTS = list("bdfhlmnprst")
VOWELS = list("aeiou")


def safe(pattern, answer, pool=None):
    """Letters from pool that fill the gap without making a real word.
    Only the word that holds the gap is checked (signs can have several words)."""
    gap = pattern.index("_")
    right = answer[gap]
    if pool is None:
        pool = VOWELS if right.lower() in VOWELS else CONSONANTS
    start = pattern.rfind(" ", 0, gap) + 1
    end = pattern.find(" ", gap)
    end = len(pattern) if end < 0 else end
    out = []
    for ch in pool:
        if ch.lower() == right.lower():
            continue
        word = (pattern[start:gap] + ch + pattern[gap + 1:end]).lower()
        if zipf_frequency(word, "en") < REAL:
            out.append(ch)
    return out


if __name__ == "__main__":
    if sys.argv[1] == "--json":
        spec = json.load(open(sys.argv[2]))
        print(json.dumps({"%s|%s" % (p, a): safe(p, a, pool) for p, a, pool in spec}, indent=1))
    else:
        print(safe(sys.argv[1], sys.argv[2]))
