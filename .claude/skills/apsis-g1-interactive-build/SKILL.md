---
name: apsis-g1-interactive-build
description: Build the interactive HTML assets (tap-to-identify, matching, letter-fill, drag-assemble, word-builder, read-along, gate runner) named in an APSIS Grade 1 English Asset Plan. Use when asked to build, spec, verify or QA a game or read-along for an APSIS G1 chapter (e.g. "build A6", "make the sign games for Chapter 2", "next interactive asset"), or to check an Asset Plan row against the book scan before building.
---

# APSIS Grade 1: interactive asset builds

This skill turns rows of an approved APSIS Grade 1 Asset Plan into
self-contained HTML games for six-year-olds. It extends the ARVO
self-paced LMS skill (`anthropic-skills:arvo-self-paced-lms`, especially
`references/game-build.md` and `references/standards.md`); where the two
differ, this file wins for Grade 1 APSIS.

The plan row is the brief. The **book scan is the authority**: every item is
checked against the printed page before it is built, and anything the plan
gets wrong is flagged, not silently used.

## Pipeline for one asset

1. **Read the plan row** (`apsis/G#/C##-*/source/*Asset_Plan_V#.docx`):
   type, description, objectives served, FET tag.
2. **Read the chapter's build brief** (`apsis/G#/C##-*/*Interactive_Build_Brief_V#.md`).
   It records the decisions already taken and the open flags. Do not build
   an asset whose flags are still open unless the user says to go ahead.
3. **Take items from the content file** (`apsis/G#/C##-*/content/*_content.json`),
   never from memory. Each item carries its page and a `status`:
   `verbatim` (use as printed), `authored` (needs approval before it ships),
   `withheld` (do not build). If an item is missing, go back to the scan
   (see "Reading the book scan" below), add it with its page, then build.
4. **Pick the engine** from `references/engines.md`. Write the game source
   `apsis/G#/C##-*/src/<TASK>.game.js` (header lines `// @asset`,
   `// @version`, `// @title`, `// @engine`, then the content and
   `Shell.boot`; copy `src/SAMESOUND.game.js` for the shape). The shared
   parts are in `apsis/shared/`: `g1-frame.html`, `g1-shell.css/js`,
   `g1-art.js` (add new pictures here) and `engines/<engine>.css/js`.
5. **Build** the single file:
   `python3 tools/build.py apsis/G1/C02-Show_Me_Tell_Me/src/<TASK>.game.js`
   (it inlines everything, rejects ES6 syntax, and refuses to overwrite a
   version already committed).
6. **QA** with `references/qa-checklist.md`. For tap games:
   `node tools/qa_tap.js <build.html> <answer-key.json> <outdir>` plays the
   game's levels from the home page at 360×640, 740×360 and 1280×720 with a
   speech stub, taps wrong to exercise hints, checks layout, errors, stars,
   Home and Pause > Home, and writes screenshots plus everything spoken.
   Letter-fill games: `node tools/qa_fill.js <build.html> <outdir>` (also
   drags a tile). Match games: `node tools/qa_match.js <build.html> <outdir>`
   (its own answer key checks the content). Generated content: `node tools/check_tap_content.js <src>`.
   Chromium is pre-installed; never run `playwright install`.
7. **Commit** the build in `builds/`. A committed version is never
   overwritten; a fix is `v-02`.

## Grade 1 rules (on top of the ARVO game-build conventions)

- **Children, not pupils**, in every pupil-facing and teacher-facing line.
- **Audio-first.** Every instruction plays on its own when a screen opens and
  has a replay button. Every word, option and sentence can be heard. A child
  who cannot read yet must still be able to finish the asset.
- **Hearing is not answering.** Each option card has its own speaker badge
  (it only plays the word). Tapping the card body is the answer. A child
  must never get a "wrong" by trying to listen.
- **At most three choices on a screen.** Longer book lists become several
  screens of three. One exception: a book box printed as one task (e.g. 2D A's
  six words) may appear once, as printed, as the final "Book challenge"
  round.
- **Big targets.** At least 64 px for cards and tiles (ARVO's 44 px is the
  floor for older pupils), with 12 px or more between targets.
- **Pictures on every screen.** Signs, body parts, senses and actions are
  drawn in code as flat, friendly vectors. Do not copy the book's photos or
  published book covers.
- **Short.** 2 to 3 minutes: two or three rounds of three to five items.
  No timers, no lives, no penalties.
- **Feedback.** Right: green ring, tick, a spoken praise word, chime, star.
  Wrong: soft tone, the card wobbles back, the instruction is replayed, then
  a hint (the target glows). Never show or speak the answer.
- **Voice (house voice: Kokoro "Sarah", American, natural — chosen 2026-09-26).**
  Every line is pre-recorded and packed into the game; the device voice is
  only a fallback. Lines are short, warm and loving for instructions, gentle
  after a wrong answer, and excited for right answers. Pass speech as arrays of
  short parts (["Which word starts like", word]); the lister records a lead-in
  plus its word as one natural sentence. After any content change:
  `node tools/voice_lines.js <src>` → `python3 tools/make_voice.py <chapter>/voice/<ASSET>_voice_script.csv`
  → `python3 tools/build.py <src>`. make_voice gives each line a mood and pace
  (instruction 0.80, word 0.78, gentle 0.82, cheer 0.95, excited 1.05) and only
  records new or changed lines. One-time setup: `npm install --prefix tools/voice`
  and `pip install librosa soundfile lameenc wordfreq`. QA drivers report any
  line that fell back to the device voice; it must be none.
- **Sound.** A quiet, bouncy background tune (dips under the voice; Music
  on/off on the home page and in Pause), xylophone for right answers, a soft
  "boing" for wrong ones, a fanfare at the end. No harsh buzzers.
- **Letter choices never make another word.** For letter-fill games, run
  `python3 tools/letter_options.py "<pattern>" <word>` to get safe wrong
  letters (wordfreq), and check a game with
  `node tools/check_letterfill.js <src> | python3 tools/check_letterfill.py`.
- **Phonics audio.** Browser TTS cannot say a single sound such as /s/ or
  /ch/; it reads letters by name ("see aitch"). Phonics games speak **whole
  words only** until recorded phoneme clips exist. Never make a child match
  a TTS-spoken letter name to a sound.
- **Letters are shown, not spoken, as symbols.** In letter-fill games show
  the letter tile large; speak the completed word after a right answer.
- **Signs rule.** Signs appear with a capital first letter and no full
  stop (book Language tip, p.31 in C02). Sentences have both.

- **One look per game.** `Shell.boot({ theme })`: `meadow`, `sunset`,
  `garden`, `school` (add new ones in `THEMES` in `g1-shell.js` and the
  `theme-*` rules in `g1-shell.css`). Never reuse a sibling game's theme in the
  same chapter. The home page shows a big title with `heroArt`, and no
  grade/chapter label.
- **ARVO characters.** `buddy: "asma"` puts Asma (Grade 1 look from the ARVO
  character bible: navy hijab, patterned light-blue shalwar kameez, pink
  sandals, sparkling brown eyes) and her dog Fluffy on screen (`g1-buddy.js`).
  She never speaks (the narrator voice is Sarah); she reacts: waves on the home
  page, mouth moves while the narrator talks, cheers on right answers, tilts
  her head on wrong ones; Fluffy runs across when a level ends. She steps out
  of view on any screen where she would cover a game piece. Amir (glasses,
  curly hair, beige kurta, "Amir Airlines") is the other Grade 1 character
  available if a game suits him better (e.g. planes, pranks, "I planned it
  that way!").
- **Picture cards.** Signs and book covers carry their own words: use
  `hideWord` and, when hearing the option would give the answer away,
  `noBadge`. The hint then says "Look carefully." instead of reading cards out.

## Technical conventions (from ARVO game-build, unchanged)

One HTML file, no external files except Google Fonts (Baloo 2, Manrope)
with system fallbacks. ES5 only (`var`, `function`, IIFE; no `let`,
`const`, `=>`, classes, template literals). Canvas 2D or inline SVG art
drawn in code. Procedural Web Audio with a sound toggle. TTS voice order
`en-PK → en-IN → en-GB → any en → first voice`, rate about 0.85 for Grade 1.
Hand-written pointer and touch drag (not HTML5 drag and drop). Portrait and
landscape. `localStorage` only for best stars, inside `try/catch`.

## LMS hand-off

Every game reports completion and score the same way so the LMS can gate on
it (see `references/engines.md`, "Result contract"). Until the LMS team
confirms its protocol, fire the result as a `postMessage` to the parent
frame and also store it locally; do not invent a SCORM/xAPI layer.

## Reading the book scan

APSIS chapter uploads are image-only PDFs and may be upside down.

```bash
pip install pymupdf opencv-python-headless
python3 - <<'EOF'
import pymupdf as fitz
d = fitz.open("BOOK.pdf")
for i, p in enumerate(d):
    p.set_rotation(180)            # only if the scan is upside down
    p.get_pixmap(dpi=120).save(f"p{i+1:02d}.png")
EOF
```

Read each PNG with the Read tool; re-render at 300 dpi to read small print
or decode QR codes with `cv2.QRCodeDetector().detectAndDecode(img)`.
Do not commit the book scan to the repository (it is the publisher's
copyright); commit the page-cited content file instead.

## Naming and versions

- **Delivered file:** `apsis/G#/C##-*/games/ENG-APSIS-G1-C02-<Asset_Name>.html`,
  named after the asset (the game's `@title`, spaces as underscores, e.g.
  `ENG-APSIS-G1-C02-What_Does_the_Sign_Say.html`). Only the current release
  lives there; `tools/build.py` writes it on every build. Always hand the user
  these files, never the archive.
- **Version history:** `builds/archive/<ASSET-CODE>_v-NN.html`. A committed
  version is never overwritten; a change is a new `@version`, and the named
  release file is replaced.
- Documents: `ENG-APSIS-G1-C02-…_V1`. Bump to `V2` after a correction and
  say what changed.

## Approval points

Before building, the brief's open decisions that touch the asset must be
closed (the user says "go ahead" or answers them). Authored items (new
distractors, sign wordings, extra word lists) go to Champ for approval
before the asset ships; build them but label the file as a draft in the
reply.

## Files

| Path | Use |
|---|---|
| `references/engines.md` | the seven engine families, item schema, result contract |
| `references/qa-checklist.md` | pre-delivery checks for every build |
