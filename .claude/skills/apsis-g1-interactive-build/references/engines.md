# Engine families for Grade 1 interactive assets

All games share one **shell** and differ only in the **board**. Build the
shell once, then each asset is a board plus a content block.

## The shell (shared by every asset)

- Start panel: title, `GRADE 1 · ENGLISH · CHAPTER 2`, big Play button, the
  mascot. Tapping Play also unlocks audio (browsers block sound until a tap).
- Top bar: instruction replay (speaker), progress dots per round, stars,
  pause (Resume, Sound on/off, Restart, Exit).
- Tutorial: an animated pointing hand shows the first move along a dotted
  path, with the instruction spoken. Shown once per play.
- Feedback module: right/wrong effects, praise words, hint ladder
  (replay instruction → glow target → glow target and wobble), confetti.
- Audio module: Web Audio chimes; TTS queue with voice order
  `en-PK → en-IN → en-GB → any en → first`; cancels speech on a new tap.
- Round flow: rounds in order (easy → medium → challenge); items shuffled
  within a round, options shuffled per item; retry reshuffles.
- End panel: stars (3 = no wrong taps, 2 = up to 2, 1 = finished), Play
  again, Next.
- Result contract (below).

## Content block

Each game carries its items inline as one JSON-like `var CONTENT = {…}`
object, copied from the chapter content file. Item fields:

```js
{
  id: "A6-r1-1",           // asset-round-item
  prompt: "Tap the words that start with the same sound.",
  say: "Tap the three words that start with the same sound.", // spoken; defaults to prompt
  options: [{ text: "stop", art: "sign-stop" }, ...],
  answer: ["stop", "staff", "sign"],  // one or more
  source: "p.31 2D A",
  status: "verbatim"        // verbatim | authored (never ship withheld items)
}
```

## The seven boards

| Engine | Child does | Chapter 2 assets | Notes |
|---|---|---|---|
| **Tap-to-identify** | hears a prompt, taps the right card (one or several) | A3, A6, A17, A19, A20; A18 in sentence mode | Multi-answer items show a "found 1 of 3" counter; sentence mode lays a sentence out as word cards and the child taps the two rhyming words. |
| **Drag-to-target (matching / labelling)** | drags a word label onto a picture spot or a partner card | A4, A14 | Targets snap; a wrong drop springs back. Labels are also tappable to hear. |
| **Letter-fill (cloze)** | drags a letter tile into the gap in a word or sign | A7, A8, A19 round 2 | Letter tiles are large; after a right fill the whole word is spoken. Capital-letter mode offers `B b` style pairs so case is tested. |
| **Word-builder (unscramble)** | drags scrambled letter tiles into slots to make a word | new: Mixed-up Senses (2H B–C) | Check against the target word, not a dictionary. A real but wrong word (e.g. "state" for *staet*) gets a gentle "That is a word, but not a sense" hint. |
| **Drag-assemble** | builds a sign from a word tile and a picture tile onto a blank sign board | A10 | Checks the rules (capital first letter, no full stop, picture matches words), not one fixed wording. |
| **Read-along** | listens; words highlight; taps any word to hear it again | A2, A13 | Recognition only, no score; completion = reached the last page. Word highlighting uses TTS `boundary` events when they fire and falls back to timing by word length (Chrome on Android often sends none). |
| **Gate runner** | mixed items from the other boards in one run with a pass mark | A5, A11, A15, A21 | Uses the other boards' item types; no hints beyond instruction replay; score shown as stars and a "You passed" / "Let's practise and try again" panel; unlimited retries, reshuffled. |

Build order that gets the most assets per engine: shell → tap-to-identify →
drag-to-target → letter-fill → read-along → word-builder → drag-assemble →
gate runner.

## Result contract

On finishing (or on Exit), every asset:

```js
var result = {
  asset: "ENG01CH02SAMESOUND", version: "v-01",
  completed: true, score: 7, max: 8, stars: 2,
  passed: true            // gates only: score/max >= pass mark
};
try { window.parent.postMessage({ type: "arvo-asset-result", result: result }, "*"); } catch (e) {}
try { localStorage.setItem("arvo:" + result.asset, JSON.stringify({ stars: result.stars })); } catch (e) {}
```

Confirm the real LMS protocol with the LMS team before the first gate ships;
change only this function when it is known.
