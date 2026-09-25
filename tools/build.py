#!/usr/bin/env python3
"""Build one single-file game from the shared shell, an engine and a game source.

    python3 tools/build.py apsis/G1/C02-Show_Me_Tell_Me/src/SAMESOUND.game.js

The game source starts with a header comment naming what it needs:

    // @asset ENG01CH02SAMESOUND
    // @version v-01
    // @title Same First Sound
    // @engine tap-identify

Output: <chapter>/builds/<asset>_<version>.html. A version that is already
committed to git is never overwritten; bump @version instead.
"""
import base64
import csv
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHARED = os.path.join(ROOT, "apsis", "shared")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def header(src):
    meta = dict(re.findall(r"^//\s*@(\w+)\s+(.+?)\s*$", src, flags=re.M))
    for key in ("asset", "version", "title", "engine"):
        if key not in meta:
            sys.exit("missing // @%s in game source" % key)
    return meta


def committed(path):
    rel = os.path.relpath(path, ROOT)
    r = subprocess.run(["git", "-C", ROOT, "ls-files", "--error-unmatch", rel],
                       capture_output=True)
    return r.returncode == 0


def check_es5(name, js):
    bad = []
    # ignore comments (keep line count so reported line numbers stay right)
    js = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group(0)), js, flags=re.S)
    js = re.sub(r"(^|[^:\\])//[^\n]*", lambda m: m.group(1), js)
    for pat, label in ((r"=>", "arrow function"), (r"\blet\s", "let"), (r"\bconst\s", "const"),
                       (r"`", "template literal"), (r"\bclass\s+\w", "class")):
        for m in re.finditer(pat, js):
            line = js.count("\n", 0, m.start()) + 1
            bad.append("%s:%d %s" % (name, line, label))
    return bad


MIME = {".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav"}


def voice_clips(chapter, asset):
    """Recorded clips for this game: voice/clips/<key>.<ext> for every key in
    voice/<asset>_voice_script.csv (made by tools/voice_lines.js)."""
    script = os.path.join(chapter, "voice", asset + "_voice_script.csv")
    clip_dir = os.path.join(chapter, "voice", "clips")
    if not (os.path.exists(script) and os.path.isdir(clip_dir)):
        return "", 0
    keys = [row["key"] for row in csv.DictReader(open(script, encoding="utf-8"))]
    found = {}
    for key in keys:
        for ext, mime in MIME.items():
            f = os.path.join(clip_dir, key + ext)
            if os.path.exists(f):
                found[key] = "data:%s;base64,%s" % (mime, base64.b64encode(open(f, "rb").read()).decode())
                break
    if not found:
        return "", 0
    body = ",\n".join('  "%s": "%s"' % (k, v) for k, v in sorted(found.items()))
    return "/* ---- recorded voice clips ---- */\nwindow.VOICE_CLIPS = {\n%s\n};" % body, len(found)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    game_path = os.path.abspath(sys.argv[1])
    game = read(game_path)
    meta = header(game)
    engine = meta["engine"]

    parts_js = [("g1-shell.js", read(os.path.join(SHARED, "g1-shell.js"))),
                ("g1-art.js", read(os.path.join(SHARED, "g1-art.js"))),
                (engine + ".js", read(os.path.join(SHARED, "engines", engine + ".js"))),
                (os.path.basename(game_path), game)]
    problems = []
    for name, js in parts_js:
        problems += check_es5(name, js)
    if problems:
        sys.exit("ES5 check failed:\n  " + "\n  ".join(problems))

    css = read(os.path.join(SHARED, "g1-shell.css")) + "\n" + \
        read(os.path.join(SHARED, "engines", engine + ".css"))
    js = "\n".join("/* ---- %s ---- */\n%s" % (n, s) for n, s in parts_js)

    chapter = os.path.dirname(os.path.dirname(game_path))
    clips_js, n_clips = voice_clips(chapter, meta["asset"])
    if n_clips:
        js = clips_js + "\n" + js

    html = read(os.path.join(SHARED, "g1-frame.html"))
    for key, val in (("{{ASSET}}", meta["asset"]), ("{{VERSION}}", meta["version"]),
                     ("{{TITLE}}", meta["title"]), ("{{CSS}}", css), ("{{JS}}", js)):
        html = html.replace(key, val)

    out = os.path.join(chapter, "builds", "%s_%s.html" % (meta["asset"], meta["version"]))
    if os.path.exists(out) and committed(out):
        sys.exit("%s is already committed; bump @version instead of overwriting" % os.path.relpath(out, ROOT))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("built", os.path.relpath(out, ROOT), "(%d KB)" % (len(html.encode("utf-8")) // 1024),
          "with %d recorded clips" % n_clips if n_clips else "(device voice only; no recorded clips yet)")


if __name__ == "__main__":
    main()
