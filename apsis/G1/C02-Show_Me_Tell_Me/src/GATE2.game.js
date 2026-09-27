// @asset ENG01CH02GATE2
// @version v-01
// @title Sign Words Check
// @engine tap-identify letter-fill
// @name Gate 2 Sign Words Check
/* A11 · Gate 2: Sign words check · Formative check (MCQ + cloze) · O4, O5, O6

   Plan: same-first-sound, letter-fill and capital-letter items; one
   proposition per item. One try per question; a wrong answer shows the right
   one. Ends with "You got N out of 5!"; the LMS result includes passed (4 of 5).
   Items are new (not asked in the practice games):
   - O4 same first sound: staff -> sock (2D A word, new partner); hand -> hat.
   - O5 missing letter: L_BRARY (I), SCH_OL (O). Wrong letters checked with
     tools/letter_options.py: none makes a real word.
   - O6 capital letter: _LASSROOM (C, c or D; p.31 "Signs start with capital letters").
   Signs are written the house way (one word: all capitals). */
(function () {
  function pic(w) { return { text: w, art: w }; }
  var SOUND = [
    { text: "Which word starts like <b>staff</b>?", say: ["Which word starts like", "staff"], target: pic("staff"),
      options: [pic("sock"), pic("book"), pic("hand")], answer: ["sock"], done: ["Sock starts like staff!"] },
    { text: "Which word starts like <b>hand</b>?", say: ["Which word starts like", "hand"], target: pic("hand"),
      options: [pic("hat"), pic("egg"), pic("bus")], answer: ["hat"], done: ["Hat starts like hand!"] }
  ];
  var FILL = [
    { kind: "sign", shape: "rect", tone: "blue", full: "Library", pattern: "L_brary", answer: "i", choices: ["i", "a", "o"] },
    { kind: "sign", shape: "rect", tone: "green", full: "School", pattern: "Sch_ol", answer: "o", choices: ["o", "e", "u"] },
    { kind: "sign", shape: "rect", tone: "white hang", full: "Classroom", pattern: "_lassroom", answer: "C", choices: ["C", "c", "D"], fixedChoices: true,
      prompt: "Which letter starts the sign?", say: ["This sign says", "Classroom", "Which letter starts the sign?"] }
  ];
  var MAX = SOUND.length + FILL.length, lines = [], i;
  for (i = 0; i <= MAX; i++) { lines.push(Shell.gateLine(i, MAX)); }

  var CONTENT = {
    gate: true,
    levels: [
      { make: function () { return [{ banner: "Sign Words Check", bannerSay: "Let's check what you know about sign words!", shuffle: false, items: SOUND.slice() }]; } },
      { engine: "letter-fill", make: function () { return [{ shuffle: false, items: FILL.slice() }]; } }
    ]
  };
  TapIdentify.init(CONTENT);
  LetterFill.init(CONTENT);
  var run = Shell.chain([{ engine: TapIdentify, level: 0, count: SOUND.length }, { engine: LetterFill, level: 1, count: FILL.length }]);
  Shell.boot({
    asset: "ENG01CH02GATE2",
    version: "v-01",
    title: "Sign Words Check",
    intro: "Let's check what you know about sign words!",
    theme: "comet",
    buddy: "kid",
    heroArt: "staff",
    gate: { pass: 0.75 },
    lines: lines,
    levels: [{ name: "Let's Check!", art: "staff", ribbon: "Book" }],
    start: run.start,
    resume: run.resume,
    score: run.score,
    max: run.max
  });
})();
