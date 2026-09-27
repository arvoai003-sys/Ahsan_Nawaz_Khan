// @asset ENG01CH02GATE3
// @version v-01
// @title Senses Check
// @engine tap-identify match
// @name Gate 3 Senses Check
/* A15 · Gate 3: Senses check · Formative check (MCQ + match) · O8

   Plan: 2G A1-A2 verbatim, plus one new sense-and-body-part item.
   One try per question (the match screen scores only if matched without a
   mistake). Ends with "You got N out of 4!"; passed = 3 of 4.
   Book, verbatim:
   - p.35 2G A1: "How many senses are there?" -> five (p.34 "We have five senses.")
   - p.35 2G A2: "What can you do with your hands?" see hear smell taste touch -> touch
   New: which sense do you use to listen to music? (hear), and a match of three
   senses to their body parts (see-eyes, smell-nose, taste-tongue). */
(function () {
  function word(w) { return { text: w }; }
  var TAP = [
    { text: "How many senses are there?", say: "How many senses are there?",
      options: [word("three"), word("five"), word("ten")], answer: ["five"], done: ["We have five senses."] },
    { text: "What can you do with your hands?", say: "What can you do with your hands?",
      options: [word("see"), word("hear"), word("smell"), word("taste"), word("touch")], answer: ["touch"], done: ["We touch and feel things with our hands."] },
    { text: "Which sense do you use to listen to music?", say: "Which sense do you use to listen to music?",
      options: [word("hear"), word("taste"), word("smell")], answer: ["hear"], done: ["We hear music with our ears."] }
  ];
  var MATCH = {
    text: "Match each sense to its body part.", say: "Can you match each sense to its body part?",
    targets: [
      { id: "eyes", art: "eyes", cap: "eyes", say: "eyes", done: "We see with our eyes." },
      { id: "nose", art: "nose", cap: "nose", say: "nose", done: "We smell with our nose." },
      { id: "tongue", art: "tongue", cap: "tongue", say: "tongue", done: "We taste with our tongue." }
    ],
    chips: [{ text: "see", say: "see", goes: "eyes" }, { text: "smell", say: "smell", goes: "nose" }, { text: "taste", say: "taste", goes: "tongue" }]
  };
  var MAX = TAP.length + 1, lines = [], i;
  for (i = 0; i <= MAX; i++) { lines.push(Shell.gateLine(i, MAX)); }

  var CONTENT = {
    gate: true,
    levels: [
      { make: function () { return [{ banner: "Senses Check", bannerSay: "Let's check what you know about our senses!", shuffle: false, items: TAP.slice() }]; } },
      { engine: "match", make: function () { return [{ items: [MATCH] }]; } }
    ]
  };
  TapIdentify.init(CONTENT);
  Match.init(CONTENT);
  var run = Shell.chain([{ engine: TapIdentify, level: 0, count: TAP.length }, { engine: Match, level: 1, count: 1 }]);
  Shell.boot({
    asset: "ENG01CH02GATE3",
    version: "v-01",
    title: "Senses Check",
    intro: "Let's check what you know about our senses!",
    theme: "sunrise",
    buddy: "kid",
    heroArt: "eyes",
    gate: { pass: 0.75 },
    lines: lines,
    levels: [{ name: "Let's Check!", art: "eyes", ribbon: "Book" }],
    start: run.start,
    resume: run.resume,
    score: run.score,
    max: run.max
  });
})();
