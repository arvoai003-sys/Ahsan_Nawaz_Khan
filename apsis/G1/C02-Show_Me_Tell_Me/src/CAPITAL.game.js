// @asset ENG01CH02CAPITAL
// @version v-01
// @title Capital at the Start
// @engine letter-fill
/* A8 · Capital at the Start · Writing > Sign Writing · O6

   Book, verbatim:
   - p.31 2D C: "Signs start with capital letters. Copy the words and add capital
     letters." _ook corner, _anger, _top -> Book corner, Danger, Stop (Level 2).
   - p.31 Language tip: "Signs don't have a full stop at the end." (said in the
     Level 1 and Level 6 banners; signs are always shown without one).
   - p.39 2I C2: "Copy these sentences. Add two full stops and two capital
     letters." we see things with our eyes we see light and colour (Levels 4, 5),
     with the other p.34 sentences for more practice.
   Beyond the book (authored): more sign words from the chapter and everyday
   signs (Exit, Entrance, Slow, Toys, Books, Push, Open, Closed, Wash your hands,
   Staff only). "No entry" is left out: almost any capital there makes a word.
   Every wrong capital offered on a sign was checked with tools/letter_options.py:
   it never makes another real word. Sentences all start with "We", and every
   other capital makes a word there (He, Me, Be), so they offer W or w only. */
(function () {
  /* sign -> [pattern, safe wrong capitals, look] */
  var SIGNS = {
    "Book corner": ["_ook corner", "DFP", { shape: "rect", tone: "white hang" }],
    "Danger": ["_anger", "CFNPT", { shape: "rect", tone: "danger", post: true }],
    "Stop": ["_top", "BCDFHLM", { shape: "octagon", post: true }],
    "Exit": ["_xit", "BCDFHLM", { shape: "rect", tone: "green" }],
    "Entrance": ["_ntrance", "BCDFHLM", { shape: "rect", tone: "white hang" }],
    "Slow": ["_low", "CDHLMNT", { shape: "diamond", post: true }],
    "Toys": ["_oys", "CDFHLMN", { shape: "rect", tone: "white hang" }],
    "Books": ["_ooks", "DFMPST", { shape: "rect", tone: "white hang" }],
    "Push": ["_ush", "CDFNST", { shape: "rect", tone: "blue" }],
    "Open": ["_pen", "BCDFHLM", { shape: "rect", tone: "green hang" }],
    "Closed": ["_losed", "BDFHLMN", { shape: "rect", tone: "white hang" }],
    "Wash your hands": ["_ash your hands", "FP", { shape: "diamond" }],
    "Staff only": ["_taff only", "BCDFHLM", { shape: "diamond" }]
  };
  var BOOK_SIGNS = ["Book corner", "Danger", "Stop"];
  var MORE_SIGNS = ["Exit", "Entrance", "Slow", "Toys", "Books", "Push", "Open", "Closed", "Wash your hands", "Staff only"];
  /* sentences: the p.39 two, and the other p.34 lines */
  var P39 = ["We see things with our eyes.", "We see light and colour."];
  var P34 = ["We hear with our ears.", "We smell with our nose.", "We taste with our tongue.", "We touch and feel things with our hands.", "We have five senses."];
  var SIGN_RULE = "Signs start with a capital letter.";
  var START_RULE = "A sentence starts with a capital letter.";
  var END_RULE = "A sentence ends with a full stop.";

  function pickOne(str) { return str.charAt(Math.floor(Math.random() * str.length)); }
  function copy(o) { var k, r = {}; for (k in o) { if (o.hasOwnProperty(k)) { r[k] = o[k]; } } return r; }
  function signItem(name, choices) {
    var s = SIGNS[name], cap = name.charAt(0), it = copy(s[2]);
    it.kind = "sign"; it.full = name; it.pattern = s[0]; it.answer = cap;
    it.choices = choices === 2 ? [cap, cap.toLowerCase()] : [cap, cap.toLowerCase(), pickOne(s[1])];
    it.prompt = "Which letter starts the sign?";
    it.say = ["This sign says", name, "Which letter starts the sign?"];
    it.hint = [SIGN_RULE];
    it.done = [name + "!", SIGN_RULE];
    return it;
  }
  function startItem(sentence) {
    return { kind: "sign", shape: "rect", tone: "line", full: sentence, pattern: "_" + sentence.slice(1), answer: "W",
      choices: ["W", "w"], prompt: "Which letter starts the sentence?",
      say: ["Listen.", sentence, "Which letter starts the sentence?"], hint: [START_RULE], done: [sentence] };
  }
  function endItem(sentence) {
    return { kind: "sign", shape: "rect", tone: "line", full: sentence, pattern: sentence.slice(0, -1) + "_", answer: ".",
      choices: [".", "?", ","], prompt: "What goes at the end?", marks: true,
      say: ["Listen.", sentence, "What goes at the end of the sentence?"], hint: [END_RULE], done: [END_RULE] };
  }
  function many(fn, list) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }
  function some(list, n) { return Shell.shuffle(list).slice(0, n); }

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "stop",
        make: function () {
          return [{ banner: "Level 1", bannerSay: "Level one! Signs start with a capital letter. Signs don't have a full stop at the end.",
            items: many(function (n) { return signItem(n, 2); }, some(MORE_SIGNS, 5)) }];
        } },
      { name: "Book Signs", art: "danger", ribbon: "Book",
        make: function () {
          return [{ banner: "Level 2", bannerSay: "Level two! Signs from your book!", shuffle: false,
            items: many(function (n) { return signItem(n, 3); }, BOOK_SIGNS) }];
        } },
      { name: "More Signs", art: "exit",
        make: function () {
          return [{ banner: "Level 3", bannerSay: "Level three! More signs!", items: many(function (n) { return signItem(n, 3); }, some(MORE_SIGNS, 6)) }];
        } },
      { name: "Sentence Starts", art: "storybook", ribbon: "Book",
        make: function () {
          return [{ banner: "Level 4", bannerSay: "Level four! A sentence starts with a capital letter.",
            items: many(startItem, P39.concat(some(P34, 3))) }];
        } },
      { name: "Full Stops", art: "book", ribbon: "Book",
        make: function () {
          return [{ banner: "Level 5", bannerSay: "Level five! A sentence ends with a full stop.",
            items: many(endItem, P39.concat(some(P34, 3))) }];
        } },
      { name: "Super Star", art: "trophy",
        make: function () {
          return [{ banner: "Level 6", bannerSay: "Level six! Signs start with a capital letter and have no full stop. Sentences start with a capital letter and end with a full stop.",
            items: many(function (n) { return signItem(n, 3); }, some(BOOK_SIGNS.concat(MORE_SIGNS), 2)).concat(
              many(startItem, some(P39.concat(P34), 2)), many(endItem, some(P39.concat(P34), 2))) }];
        } }
    ]
  };

  LetterFill.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02CAPITAL",
    version: "v-01",
    title: "Capital at the Start",
    intro: "Signs start with a capital letter.",
    theme: "seaside",
    buddy: "kid",
    heroArt: "stop",
    levels: CONTENT.levels,
    start: LetterFill.start,
    resume: LetterFill.resume,
    score: function () { return LetterFill.score || 0; },
    max: LetterFill.max
  });
})();
