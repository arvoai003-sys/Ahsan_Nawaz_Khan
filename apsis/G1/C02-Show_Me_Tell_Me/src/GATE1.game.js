// @asset ENG01CH02GATE1
// @version v-01
// @title Signs Check
// @engine tap-identify
// @name Gate 1 Signs Check
/* A5 · Gate 1: Signs check · Formative check (MCQ + tap) · O1, O2, O3

   A short check after the sign games: one try per question. A wrong answer
   shows the right one, and the game moves on. The end screen says "You got
   4 out of 5!"; the result sent to the LMS includes passed (4 or more of 5).

   Book, verbatim:
   - p.29 2C A2: "Which sign shows you where to go?" -> EXIT, from the page's
     three signs (EXIT, slippery road, crossed-out tap).
   - p.29 2C A1: "Which sign tells you to do something?" -> the crossed-out tap
     ("Don't waste water: close the tap", as Champ explained the sign).
   New (the plan's "one new sign-meaning item and one new label item"):
   - What does the STOP sign tell you to do? stop / run / jump.
   - Which label goes on the hat box? HATS / BAGS / BOOKS (not used in Label It).
   - Which sign says Danger Deep Water? (reading a sign, O1).
   Signs and labels are written the house way (one or two words in capitals). */
(function () {
  function S(art, label) { return { text: art, art: art, label: label, hideWord: true, noBadge: true }; }
  var EXIT = S("exit", "Exit sign"), SLIP = S("slippery", "Slippery road sign"), TAP = S("nowaste", "Don't waste water sign");

  var ITEMS = [
    { text: "Which sign shows you where to go?", say: "Which sign shows you where to go?",
      options: [EXIT, SLIP, TAP], answer: ["exit"], done: ["Exit! This way out."] },
    { text: "Which sign tells you to do something?", say: "Which sign tells you to do something?",
      options: [EXIT, SLIP, TAP], answer: ["nowaste"], done: ["Don't waste water! Close the tap."] },
    { text: "What does this sign tell you to do?", say: "What does this sign tell you to do?",
      target: S("stop", "Stop sign"), options: [{ text: "stop" }, { text: "run" }, { text: "jump" }], answer: ["stop"], done: ["Stop!"] },
    { text: "Which label goes on the hat box?", say: "Which label goes on the hat box?",
      target: { text: "hat", art: "hat", label: "hat box", hideWord: true, noBadge: true },
      options: [{ text: "HATS", say: "Hats" }, { text: "BAGS", say: "Bags" }, { text: "BOOKS", say: "Books" }], answer: ["HATS"], done: ["Hats!"] },
    { text: "Which sign says <b>Danger Deep Water</b>?", say: ["Which sign says", "Danger Deep Water"],
      options: [S("danger", "Danger Deep Water sign"), S("stop", "Stop sign"), S("entrance", "Entrance sign")], answer: ["danger"],
      done: ["This sign says", "Danger Deep Water"] }
  ];
  var MAX = ITEMS.length, lines = [], i;
  for (i = 0; i <= MAX; i++) { lines.push(Shell.gateLine(i, MAX)); }

  var CONTENT = {
    gate: true,
    levels: [
      { name: "Let's Check!", art: "exit", ribbon: "Book",
        make: function () { return [{ banner: "Signs Check", bannerSay: "Let's check what you know about signs!", shuffle: false, items: ITEMS.slice() }]; } }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02GATE1",
    version: "v-01",
    title: "Signs Check",
    intro: "Let's check what you know about signs!",
    theme: "starry",
    buddy: "kid",
    heroArt: "exit",
    gate: { pass: 0.75 },
    lines: lines,
    levels: CONTENT.levels,
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: TapIdentify.max
  });
})();
