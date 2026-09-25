#!/usr/bin/env python3
"""Validate letter-fill items from check_letterfill.js (stdin)."""
import json, sys
from wordfreq import zipf_frequency
items = json.load(sys.stdin)
bad = []
for key in items:
    lvl, pattern, full, answer, choices = key.split("|")
    gap = pattern.index("_")
    if pattern.replace("_", answer) != full:
        bad.append("answer does not complete: " + key)
    if answer not in choices or len(set(choices)) != len(choices):
        bad.append("choices wrong: " + key)
    s = pattern.rfind(" ", 0, gap) + 1
    e = pattern.find(" ", gap); e = len(pattern) if e < 0 else e
    for ch in choices:
        if ch == answer:
            continue
        w = (pattern[s:gap] + ch + pattern[gap + 1:e]).lower()
        if zipf_frequency(w, "en") >= 2.5:
            bad.append("wrong letter makes a real word %r: %s" % (w, key))
print("distinct items:", len(items))
print("\n".join(bad) if bad else "no problems")
