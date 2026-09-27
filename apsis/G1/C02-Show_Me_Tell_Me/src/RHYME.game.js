// @asset ENG01CH02RHYME
// @version v-01
// @title Rhyme Time
// @engine tap-identify match
/* A18 · Rhyme Time · Phonics > Rhyming Words · O10

   Book, verbatim:
   - p.36 Language tip: "Words that rhyme sound the same, like fun and run."
     (said in the Level 1 banner).
   - p.36 2H D: "Read the sentence below. Point to the words that rhyme in each
     sentence." I hear with my ears. (the worked example, always first) /
     I can see a tree. / I spot a bright light. / Honey is a treat; it tastes
     sweet. (Level 2: the sentence's words stay in order; tap the two that rhyme.)
   Beyond the book (authored): rhyming picture pairs (hat/cat, tree/bee, fan/van,
   moon/spoon, fish/dish, sock/clock, bag/flag, hen/pen, star/car, cake/snake,
   frog/log), picture-pair matching (the plan's "match words that rhyme"),
   short rhyming sentences with a gap, and odd one out.
   Every word can be heard (speaker on each card; matching chips speak when
   tapped), since rhyme is about sound. */
(function () {
  var PAIRS = [["hat", "cat"], ["tree", "bee"], ["fan", "van"], ["moon", "spoon"], ["fish", "dish"], ["sock", "clock"],
    ["bag", "flag"], ["hen", "pen"], ["star", "car"], ["cake", "snake"], ["frog", "log"]];
  /* pictures that rhyme with none of the pair words */
  var OTHERS = ["sun", "bus", "ball", "egg", "drum", "duck", "leaf", "lion", "nest", "house", "milk", "book", "bell", "hand"];
  var TIP = "Words that rhyme sound the same, like fun and run.";

  function some(list, n) { return Shell.shuffle(list).slice(0, n); }
  function many(fn, list) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }
  function pic(w) { return { text: w, art: w }; }
  function both(p) { return Math.random() < 0.5 ? p : [p[1], p[0]]; }
  function rhymeLine(a, b) { return a.charAt(0).toUpperCase() + a.slice(1) + " and " + b + " rhyme!"; }

  /* which picture rhymes with this one? */
  function whichItem(pair, n) {
    var p = both(pair);
    return { text: "Which one rhymes with <b>" + p[0] + "</b>?", say: ["Which one rhymes with", p[0]],
      target: pic(p[0]), options: [pic(p[1])].concat(many(pic, some(OTHERS, n - 1))), answer: [p[1]],
      done: [rhymeLine(p[0], p[1])], hint2: ["Listen.", p[0], p[0]] };
  }

  /* book p.36 2H D: tap the two words that rhyme; the words keep their order */
  var BOOK = [
    { s: "I hear with my ears.", r: ["hear", "ears"] },
    { s: "I can see a tree.", r: ["see", "tree"] },
    { s: "I spot a bright light.", r: ["bright", "light"] },
    { s: "Honey is a treat; it tastes sweet.", r: ["treat", "sweet"] }
  ];
  function bookItem(b) {
    var ws = b.s.replace(/[.;]/g, "").split(" ");
    return { text: b.s, say: ["Listen.", b.s, "Find the two words that rhyme."], keepOrder: true,
      options: many(function (w) { return { text: w }; }, ws), answer: b.r.slice(),
      done: [b.s, rhymeLine(b.r[0], b.r[1])], hint2: ["Listen.", b.s] };
  }

  /* match each word to the picture it rhymes with */
  function matchScreen(pairs) {
    var s = { text: "Match the words that rhyme.", say: "Can you match the words that rhyme?", targets: [], chips: [] }, i, p;
    for (i = 0; i < pairs.length; i++) {
      p = both(pairs[i]);
      s.targets.push({ id: p[0], art: p[0], cap: p[0], say: p[0], done: rhymeLine(p[0], p[1]) });
      s.chips.push({ text: p[1], say: p[1], goes: p[0] });
    }
    return s;
  }

  /* finish the rhyme: a short sentence with a gap */
  var GAPS = [
    { s: "The cat sat on a mat.", gap: "mat", rh: "cat", no: ["bed", "box"] },
    { s: "A bee is in the tree.", gap: "tree", rh: "bee", no: ["house", "box"] },
    { s: "The frog sat on a log.", gap: "log", rh: "frog", no: ["rock", "leaf"] },
    { s: "The hen has a pen.", gap: "pen", rh: "hen", no: ["cup", "book"] },
    { s: "I see a star from the car.", gap: "car", rh: "star", no: ["bus", "house"] },
    { s: "The snake ate the cake.", gap: "cake", rh: "snake", no: ["egg", "leaf"] },
    { s: "My sock is on the clock.", gap: "clock", rh: "sock", no: ["bed", "bag"] },
    { s: "I have fun in the sun.", gap: "sun", rh: "fun", no: ["rain", "house"] }
  ];
  function gapItem(g) {
    var shown = g.s.replace(new RegExp(g.gap + "\\.$"), "____.");
    return { text: shown, say: ["Listen.", g.s.replace(new RegExp(" " + g.gap + "\\.$"), "..."), "Which word rhymes with " + g.rh + "?"],
      options: [{ text: g.gap }, { text: g.no[0] }, { text: g.no[1] }], answer: [g.gap],
      done: [g.s, rhymeLine(g.rh, g.gap)], hint2: ["Listen.", g.rh, g.rh] };
  }

  /* odd one out: two pictures rhyme, one does not */
  function oddItem(pair) {
    var o = some(OTHERS, 1)[0];
    return { text: "Which one does <b>not</b> rhyme?", say: "Which one does not rhyme?",
      options: [pic(pair[0]), pic(pair[1]), pic(o)], answer: [o],
      done: [rhymeLine(pair[0], pair[1]), capital(o) + " is the odd one out!"], hint2: ["Listen to each word."] };
  }
  function capital(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "hat",
        make: function () { return [{ banner: "Level 1", bannerSay: "Level one! " + TIP, items: many(function (p) { return whichItem(p, 2); }, some(PAIRS, 5)) }]; } },
      { name: "Book Rhymes", art: "tree", ribbon: "Book",
        make: function () { return [{ banner: "Level 2", bannerSay: "Level two! Rhymes from your book!", shuffle: false, items: many(bookItem, BOOK) }]; } },
      { name: "Rhyme Match", art: "cat", engine: "match",
        make: function () {
          var s = Shell.shuffle(PAIRS);
          return [{ banner: "Level 3", bannerSay: "Level three! Match the words that rhyme!", items: [matchScreen(s.slice(0, 2)), matchScreen(s.slice(2, 5)), matchScreen(s.slice(5, 8))] }];
        } },
      { name: "Finish the Rhyme", art: "frog",
        make: function () { return [{ banner: "Level 4", bannerSay: "Level four! Finish the rhyme!", items: many(gapItem, some(GAPS, 5)) }]; } },
      { name: "Odd One Out", art: "snake",
        make: function () { return [{ banner: "Level 5", bannerSay: "Level five! Which one does not rhyme?", items: many(oddItem, some(PAIRS, 5)) }]; } },
      { name: "Super Star", art: "trophy",
        make: function () {
          var s = Shell.shuffle(PAIRS);
          return [{ banner: "Level 6", bannerSay: "Level six! Super star challenge!",
            items: [whichItem(s[0], 3), whichItem(s[1], 3), bookItem(some(BOOK, 1)[0]), gapItem(some(GAPS, 1)[0]), oddItem(s[2]), oddItem(s[3])] }];
        } }
    ]
  };

  /* two engines: each level says which one runs it */
  var cur = TapIdentify;
  TapIdentify.init(CONTENT);
  Match.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02RHYME",
    version: "v-01",
    title: "Rhyme Time",
    intro: TIP,
    theme: "candy",
    buddy: "kid",
    heroArt: "cat",
    levels: CONTENT.levels,
    start: function (n) { cur = CONTENT.levels[n].engine === "match" ? Match : TapIdentify; cur.start(n); },
    resume: function () { cur.resume(); },
    score: function () { return cur.score || 0; },
    max: function () { return cur.max(); }
  });
})();
