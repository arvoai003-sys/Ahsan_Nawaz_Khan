# QA before a build is delivered

Run all of these; report any that fail rather than delivering quietly.

## Content
- [ ] Every item's answer matches the book page cited in the content file,
      word for word for `verbatim` items (case, spelling, punctuation).
- [ ] No `withheld` item is in the build.
- [ ] `authored` items are listed in the delivery note for approval.
- [ ] Signs show a capital first letter and no full stop; sentences show
      both.
- [ ] No answer can also be reached by a second reading the child could
      reasonably make (e.g. anagram "staet" → state/taste): either the
      prompt rules it out or the game accepts both.

## Grade 1 experience
- [ ] Every screen speaks its instruction on entry; the replay button works.
- [ ] Every option can be heard through its speaker badge without counting
      as an answer.
- [ ] No screen shows more than three choices.
- [ ] Targets are at least 64 px; nothing overlaps at 360 × 640 portrait
      and 1280 × 720 landscape.
- [ ] Hints never reveal the answer; retry always works; Restart clears
      progress.
- [ ] The whole asset can be finished by a child who cannot read (audio and
      pictures alone).
- [ ] Phonics games speak whole words only, never isolated letters as
      sounds.

## Technical
- [ ] Single file; opens from disk with no network except Google Fonts, and
      still works (system fonts) when offline.
- [ ] No ES6: search the file for `=>`, `let `, `const `, backticks,
      `class `.
- [ ] No console errors in Chromium (Playwright) on load, full play-through
      and restart.
- [ ] Touch drag works (test with Playwright touch emulation or `hasTouch`).
- [ ] Result contract fires once on finish with the right score.
- [ ] `localStorage` blocked (private mode) does not break the game.
