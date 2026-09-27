// @asset ENG01CH02GATE4
// @version v-01
// @title Words Check
// @engine tap-identify match
// @name Gate 4 Words Check
/* A21 · Gate 4: Words check · Formative check (MCQ + tap + match) · O9-O12

   Plan: ch sound, rhyme, body-part nouns and doing-word verbs; each
   proposition once. One try per question (the match screen scores only if
   matched without a mistake). Ends with "You got N out of 4!"; passed = 3 of 4.
   Items are new (not asked in the practice games):
   - O9 ch: which word starts like chin? chocolate (new picture) / sock / cake.
   - O11 naming word (noun): tree / jump / happy.
   - O12 doing word (verb): tap the doing word in "The cat can jump."
   - O10 rhyme: match ball-wall, bug-rug, pig-wig.
   The voice never says "ch" on its own. */
(function () {
  function word(w) { return { text: w }; }
  var TAP = [
    { text: "Which one starts with <b>ch</b>, like <b>chin</b>?", say: ["Which one starts like", "chin"], target: { text: "chin", art: "chin" },
      options: [{ text: "chocolate", art: "chocolate" }, { text: "sock", art: "sock" }, { text: "cake", art: "cake" }], answer: ["chocolate"],
      done: ["Chocolate starts like chin!"] },
    { text: "Which word is a <b>naming word</b>?", say: "Which word is a naming word?",
      options: [word("tree"), word("jump"), word("happy")], answer: ["tree"], done: ["Tree is a naming word!"] },
    { text: "Tap the <b>doing word</b>.", say: ["Listen.", "The cat can jump.", "Tap the doing word."], keepOrder: true,
      options: [word("The"), word("cat"), word("can"), word("jump")], answer: ["jump"], done: ["Jump is a doing word!"] }
  ];
  var MATCH = {
    text: "Match the words that rhyme.", say: "Can you match the words that rhyme?",
    targets: [
      { id: "ball", cap: "ball", say: "ball", done: "Ball and wall rhyme!" },
      { id: "bug", cap: "bug", say: "bug", done: "Bug and rug rhyme!" },
      { id: "pig", cap: "pig", say: "pig", done: "Pig and wig rhyme!" }
    ],
    chips: [{ text: "wall", say: "wall", goes: "ball" }, { text: "rug", say: "rug", goes: "bug" }, { text: "wig", say: "wig", goes: "pig" }]
  };
  var MAX = TAP.length + 1, lines = [], i;
  for (i = 0; i <= MAX; i++) { lines.push(Shell.gateLine(i, MAX)); }

  var CONTENT = {
    gate: true,
    levels: [
      { make: function () { return [{ banner: "Words Check", bannerSay: "Let's check what you know about words!", shuffle: false, items: TAP.slice() }]; } },
      { engine: "match", make: function () { return [{ items: [MATCH] }]; } }
    ]
  };
  TapIdentify.init(CONTENT);
  Match.init(CONTENT);
  var run = Shell.chain([{ engine: TapIdentify, level: 0, count: TAP.length }, { engine: Match, level: 1, count: 1 }]);
  Shell.boot({
    asset: "ENG01CH02GATE4",
    version: "v-01",
    title: "Words Check",
    intro: "Let's check what you know about words!",
    theme: "aurora",
    buddy: "kid",
    heroArt: "chocolate",
    gate: { pass: 0.75 },
    lines: lines,
    levels: [{ name: "Let's Check!", art: "chocolate", ribbon: "Book" }],
    start: run.start,
    resume: run.resume,
    score: run.score,
    max: run.max
  });
})();
