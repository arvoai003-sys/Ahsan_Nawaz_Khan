# APSIS Grade 1 · Chapter 2 "Show me, tell me" · Interactive Build Brief V1

What we build from `source/ENG-APSIS-G1-C02-Show_Me_Tell_Me-Asset_Plan_V1.docx`,
checked against the book scan (`English-APSIS-G1-C2.pdf`, printed pp.26–41).
The item content, with a page reference for every item, is in
`content/g1c02_content.json`. How to build is in
`.claude/skills/apsis-g1-interactive-build/`.

## 1. Interactive assets in the plan

The plan has 22 assets. Four are videos (ML scripts: A1, A9, A12, A16) and
one is the Excel Mastery Test (A22); those are not interactive builds. The
other 17 are:

| # | Asset | Plan type | Engine | File task name | Ready? |
|---|---|---|---|---|---|
| A2 | Read-along: Signs | Interactive read-along | Read-along | `SIGNSREAD` | Ready |
| A3 | What Does the Sign Say? | Tap-to-identify | Tap-to-identify | `SIGNSAY` | Needs D1 |
| A4 | Label It | Matching | Drag-to-target | `LABELIT` | Needs D2 |
| A5 | Gate 1: Signs check | Formative check | Gate runner | `GATE1` | After practice games (D9) |
| A6 | Same First Sound | Tap-to-identify | Tap-to-identify | `SAMESOUND` | **Built v-01** |
| A7 | Finish the Sign Word | Drag-to-complete (cloze) | Letter-fill | `SIGNLETTER` | Ready |
| A8 | Capital at the Start | Tap-to-identify | Letter-fill (capital mode) | `CAPITAL` | Needs D3 |
| A10 | Build a Sign | Drag-assemble | Drag-assemble | `BUILDSIGN` | Needs D4 |
| A11 | Gate 2: Sign words check | Formative check | Gate runner | `GATE2` | After practice games |
| A13 | Read-along: Our Senses | Interactive read-along | Read-along | `SENSESREAD` | Ready |
| A14 | Sense and Body Part | Matching | Drag-to-target | `SENSEMATCH` | Ready (+ D6 round) |
| A15 | Gate 3: Senses check | Formative check | Gate runner | `GATE3` | After practice games |
| A17 | ch Sound Hunt | Tap-to-identify | Tap-to-identify | `CHHUNT` | Needs D5 |
| A18 | Rhyme Time | Matching | Tap-to-identify (sentence mode) | `RHYME` | Needs D7 |
| A19 | Name the Body Part | Tap-to-identify | Tap-to-identify + Letter-fill round | `BODYPARTS` | Ready (+ D6 round) |
| A20 | Doing Words | Tap-to-identify | Tap-to-identify | `DOINGWORDS` | Needs D8 |
| A21 | Gate 4: Words check | Formative check | Gate runner | `GATE4` | After practice games |

File names: `ENG01CH02<TASK>_v-01.html` in `builds/` (see D10).

Seven engines cover all 17: tap-to-identify (6 assets), drag-to-target (2),
letter-fill (2 plus a round in A19), read-along (2), drag-assemble (1),
word-builder (only if D6 adds Mixed-up Senses), gate runner (4).

## 2. What checking the plan against the book found

Items are listed by how much they change a build. None of them blocks the
whole chapter.

**Content the plan gets wrong**

- **F1 · A3 wrong sign.** The plan says the 2C A signs are "EXIT, slippery,
  no skating". The third sign on p.29 is a crossed-out **tap** (no drinking
  water). Nothing about skating appears on the page.
- **F2 · 2C A1 has no clear answer.** "Which sign tells you to do
  something?" The three signs are EXIT (shows where to go), slippery road (a
  warning) and the crossed-out tap (tells you *not* to do something). None of
  them clearly fits, so the item is withheld. 2C A2 (EXIT) is fine.
- **F3 · A8 format.** The book (2D C, p.31) prints `_ook corner`, `_anger`,
  `_top` and asks the child to *add* the capital letter. The plan's "tap the
  sign written correctly" doesn't test that. There is also no picture cue for
  `_anger` on p.31 (Danger is on p.28), and `_anger` could be Hanger, Ranger
  or Manger.
- **F4 · Full-stop rule conflict.** The p.31 tip says "Signs don't have a
  full stop at the end." The p.32 tip, on the sign-writing page, says "start
  each sentence with a capital letter and add a full stop at the end." The
  plan cites the p.32 tip as the no-full-stop rule (A9, A10). Its Section 1
  also lists a "capital I" tip, which isn't in the chapter.
- **F5 · The ch sound.** 2H A (p.36) asks for the word on p.33 with "the
  same end spelling as **lunch**". The answer is **touch**, so this is an
  *end* sound, and the plan's Section 10 flag ("ch words not fully listed")
  can be closed. There is no ch Language tip on p.36 (that tip is about
  rhyme). "Cheese" (A16) isn't in the book. The book's ch words are lunch
  and touch (end) and chin and chest (start, pp.37–38). O9 says "start with
  the ch sound", which only half fits.
- **F6 · A14/A15 source and overlap.** The sense and body-part pairs come
  from the 2F reading text (p.34), not from 2G A. 2G A2 ("What can you do
  with your hands?" → touch) is a Gate 3 item but is also the touch/hands
  pair practised in A14. That breaks the non-pervasive rule.
- **F7 · A18 format.** 2H D asks the child to point to the two rhyming words
  *inside* each sentence. The first sentence ("I hear with my ears.") is
  the worked example, printed underlined. That leaves three scored items:
  see/tree, bright/light and treat/sweet. A tap-in-sentence board matches the
  book better than a matching game. Also, hear/ears is a near rhyme, which is
  fine as the example.
- **F8 · A20 has "→ ML-05" on a game row.** Either a "Doing Words"
  animation row is missing, or the tag is stray. The ML list would be
  wrong in either case.
- **F9 · Gate sizes don't match their pass marks.** Gate 1 lists four items
  (2C A1–A2 + two new) but its pass mark is 4/5. With A1 withheld there are
  three. Gate 3 lists three items at a 75% pass mark, which means 3/3 in
  practice.

**Closed book exercises the plan leaves out**

All of these can be auto-graded and are printed in the book:

| Book | Content | Suggested home |
|---|---|---|
| 2C B, p.29 | "Which sign tells you where you can read a book?" → BOOKS | Gate 1 item (verbatim) |
| 2H B–C, p.36 | Unscramble l m e s l → smell; areh → hear; staet → taste; cuhot → touch; tighs → sight | New word-builder asset "Mixed-up Senses" in Cluster 4, or a round in A14 |
| 2I B2, p.38 | ch_n, e_r, n_ck, ha_r → chin, ear, neck, hair | Round 2 of A19 (letter-fill); chin also feeds A17 |
| 2I B4, p.38 | stroke a pet → touch; sniff a flower → smell; eat an ice cream → taste | Round 2 of A14. Withhold "play in the playground" (several senses fit) |
| 2I C2, p.39 | "we see things with our eyes we see light and colour" → two capitals, two full stops | A8 challenge round "Sign or sentence?", which also settles F4 |
| 2E Part 1, p.32 | SLOW, wash hands, no diving, no drinking water: do or don't? | A3 round 2 (sign meanings are authored, needs approval) |
| 2A C / 2C C, pp.27, 30 | Story book or real-life book (9 titles) | Optional sort. Published covers can't be reproduced, so titles only |

**Build-side notes**

- **F10 · Anagrams with two answers.** *staet* also makes "state" and *areh*
  also makes "hare". The word-builder must answer "That is a word, but not
  a sense."
- **F11 · QR codes.** Both codes (p.32 and p.33) decode to the same link,
  `https://oupqr.pk/9789697340187_DR`. The build environment's network
  blocks it, so someone with a browser needs to open it and check for
  existing resources before A9 and A12 are commissioned.
- **F12 · Phonics audio.** Browser TTS can't say a single /s/ or /ch/. A6
  and A17 speak whole words only. A sound-level version needs recorded
  clips.
- **F13 · Photos and covers.** The book's real sign photos (including the
  Abu Dhabi sign with Arabic text) and published book covers are not
  reproduced. Signs are redrawn as simple vectors.

## 3. Decisions needed (for Champ / the user)

| # | Decision | Recommendation |
|---|---|---|
| D1 | A3 content, given F1–F2 | Round 1: the four 2B statements ("Signs show us where to go in." → ENTRANCE, and so on) verbatim. Round 2: the 2E Part 1 do/don't signs. Drop 2C A1. |
| D2 | A4 targets | ENTRANCE, BOOKS, TOYS from the p.28 pictures, as planned. Keep 2C B (BOOKS) for Gate 1, not A4. |
| D3 | A8 format | Letter-fill: drag B, D or S (lower-case b, d, s as distractors) onto `_ook corner`, `_anger`, `_top`, with a picture cue for each. Add the 2I C2 round. |
| D4 | Full-stop rule for A9/A10 | Signs: capital letter, no full stop (p.31). Sentences: capital letter and full stop (p.32, p.39). Teach the contrast in A8 and A10. |
| D5 | A16/A17 ch words | Use the book's own: lunch, touch, chin, chest. Approve any extras (the plan's "cheese") separately. Reword O9 to "I can find words with the ch sound." |
| D6 | Add the closed exercises the plan left out | Yes: A14 round 2 (2I B4), A19 round 2 (2I B2), A8 round 3 (2I C2), and a new "Mixed-up Senses" word-builder (2H B–C). This means an Asset Plan V2. |
| D7 | A18 format | Tap-in-sentence. hear/ears is the tutorial; three scored items. |
| D8 | A20 "→ ML-05" | Confirm whether a Doing Words animation is wanted. If not, remove the tag. |
| D9 | Gate sizes and items | Four or five items per gate, none reusing a practice-game proposition (e.g. Gate 3 takes 2G A1 "five" plus new items; 2G A2 moves out if A14 keeps touch/hands). |
| D10 | Game file names | `ENG01CH02<TASK>_v-01.html`. Confirm that this can't collide with an ARVO G1 C02 file, or add `APSIS` to the name. |
| D11 | How gates run | As the HTML gate runner, or as items in the LMS's own quiz tool? Also: what completion/score protocol does the LMS expect (postMessage, SCORM, xAPI)? |
| D12 | Engine source | Upload `ENG04CH10WORDSORT_v-01.html` (Pack It Right!) to reuse its shell. Otherwise the shared Grade 1 shell is built fresh. |

## 4. Way forward

1. **Close the decisions.** D12 unblocks all building. D1–D8 each unblock one
   asset. If D6 is accepted, issue Asset Plan V2 through the ARVO builder and
   log what changed.
2. **Build the shared Grade 1 shell** (`apsis/shared/g1-shell.html`): start
   panel, tutorial hand, audio and TTS, feedback, pause menu, result contract.
3. **Wave 1: ready now, all verbatim.** A6 Same First Sound, A7 Finish the
   Sign Word, A14 Sense and Body Part, A19 Name the Body Part, then the
   read-alongs A2 and A13. This proves the tap-to-identify, letter-fill,
   drag-to-target and read-along engines.
4. **Wave 2: after the decisions.** A3, A4, A8, A17, A18 and A20, plus
   Mixed-up Senses if it's approved.
5. **Wave 3.** A10 Build a Sign (drag-assemble). Then the four gates, once
   the practice games have fixed which propositions they use, so the gates
   can use different ones.
6. **After the interactives.** The A22 Mastery Test item bank (ARVO skill,
   item-bank path) and the five ML scripts. Neither is part of this build
   track.

Each build goes through `.claude/skills/apsis-g1-interactive-build/references/qa-checklist.md`
and is delivered as a new version in `builds/`.

## 5. Build log

| Date | Asset | File | Notes |
|---|---|---|---|
| 2026-09-25 | A6 Same First Sound | `builds/ENG01CH02SAMESOUND_v-01.html` | 7 items in 3 rounds, all from the 2D A word box (p.31): starts-like (3), find two (3), the book's six-word task (1). Whole words spoken only. QA passed at 360×640, 740×360 and 1280×720. First build of the shared shell and the tap-to-identify engine. |
