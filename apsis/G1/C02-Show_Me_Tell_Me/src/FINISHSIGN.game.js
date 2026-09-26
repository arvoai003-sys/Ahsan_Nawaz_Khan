// @asset ENG01CH02FINISHSIGN
// @version v-02
// @title Finish the Sign Word
// @engine letter-fill
/* A7 · Finish the Sign Word · Phonics and Spelling > Sounds at the Start of Word · O5

   Book, verbatim:
   - p.31 2D B: "Copy the signs. Add in the missing letters to complete the words."
     Letters e h o; Wash your _ands (h), Staff _nly (o), No _ntry (e). Level 2.
   - p.38 2I B2: ch_n, e_r, n_ck, ha_r (chin, ear, neck, hair). No letters are
     printed in the book; the choices are ours. Level 5.
   Beyond the book (authored, needs Champ's approval): picture words and signs
   the chapter uses (Stop, Slow, Exit, Books, Toys, Danger) plus everyday
   Pakistani shop/door signs (Push, Open, Closed).

   Every wrong letter offered was checked with tools/letter_options.py: putting
   it in the gap never makes another real word (wordfreq zipf < 2.5). The
   "safe" strings below are that tool's output; do not hand-edit them. */
(function () {
  /* first letter missing: word -> safe wrong letters */
  var FIRST = {
    sock: "fnp", soap: "bdfhlmnprt", bus: "dflt", ball: "dlnrs", bell: "lmr", house: "bfnpst",
    moon: "fr", milk: "bdfhlnprt", mango: "bdfhlnprs", mouth: "bdfhnprt", fish: "hlnprs", foot: "dnp",
    face: "bdhnst", tree: "dhlmnprs", teeth: "bdfhlmnprs", nose: "fst", nest: "dhms", nine: "bhr",
    door: "bfhlrst", drum: "bfhlmnprst", leg: "fhst", leaf: "bfhmnprst", lion: "bfhmnpr", book: "dfp",
    hand: "dfmpt", toys: "dfhlmnprs", lollipop: "bdfhmnprst"
  };
  /* middle letter missing: pattern -> [word, safe wrong letters] */
  var MIDDLE = {
    "f_sh": ["fish", "aeou"], "dr_m": ["drum", "eio"], "n_st": ["nest", "ou"], "m_lk": ["milk", "aeou"],
    "l_on": ["lion", "au"], "h_nd": ["hand", "eou"], "l_af": ["leaf", "aiu"], "t_ys": ["toys", "aeiu"]
  };
  /* book p.38 2I B2 */
  var BODY = {
    "ch_n": ["chin", "olm"], "e_r": ["ear", "eio"], "n_ck": ["neck", "aou"], "ha_r": ["hair", "aeo"]
  };
  /* signs: pattern -> [sign text, safe wrong letters, look] */
  var SIGNS = {
    "St_p": ["Stop", "aiu", { shape: "octagon", post: true }],
    "Sl_w": ["Slow", "iu", { shape: "diamond", post: true }],
    "Ex_t": ["Exit", "aeou", { shape: "rect", tone: "green" }],
    "T_ys": ["Toys", "aeiu", { shape: "rect", tone: "white hang" }],
    "B_oks": ["Books", "aeiu", { shape: "rect", tone: "white hang" }],
    "P_sh": ["Push", "aei", { shape: "rect", tone: "blue" }],
    "Dang_r": ["Danger", "aiou", { shape: "rect", tone: "danger", post: true }],
    "Op_n": ["Open", "aiou", { shape: "rect", tone: "green hang" }],
    "Cl_sed": ["Closed", "aeiu", { shape: "rect", tone: "white hang" }]
  };

  function keys(o) { var k, out = []; for (k in o) { if (o.hasOwnProperty(k)) { out.push(k); } } return out; }
  function wrongs(safe, n) { return Shell.shuffle(safe.split("")).slice(0, n); }

  function firstItem(word, choices) {
    return { kind: "word", art: word, full: word, pattern: "_" + word.slice(1), answer: word.charAt(0),
      choices: [word.charAt(0)].concat(wrongs(FIRST[word], choices - 1)) };
  }
  function middleItem(pattern, table) {
    var w = table[pattern][0], gap = pattern.indexOf("_");
    return { kind: "word", art: w, full: w, pattern: pattern, answer: w.charAt(gap),
      choices: [w.charAt(gap)].concat(wrongs(table[pattern][1], 2)) };
  }
  function signItem(pattern) {
    var s = SIGNS[pattern], gap = pattern.indexOf("_"), it = { kind: "sign", full: s[0], pattern: pattern,
      answer: s[0].charAt(gap), choices: [s[0].charAt(gap)].concat(wrongs(s[1], 2)) }, k;
    for (k in s[2]) { if (s[2].hasOwnProperty(k)) { it[k] = s[2][k]; } }
    return it;
  }
  function pickFirst(n, choices) {
    var words = Shell.shuffle(keys(FIRST)).slice(0, n), out = [], i;
    for (i = 0; i < words.length; i++) { out.push(firstItem(words[i], choices)); }
    return out;
  }

  /* the book's three signs, with the book's own letters e h o every time */
  var BOOK_SIGNS = [
    { kind: "sign", shape: "diamond", full: "Wash your hands", pattern: "Wash your _ands", answer: "h", choices: ["e", "h", "o"] },
    { kind: "sign", shape: "diamond", full: "Staff only", pattern: "Staff _nly", answer: "o", choices: ["e", "h", "o"] },
    { kind: "sign", shape: "diamond", full: "No entry", pattern: "No _ntry", answer: "e", choices: ["e", "h", "o"] }
  ];

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "fish",
        make: function () {
          return [{ banner: "Level 1", bannerSay: "Level one! Let's warm up!", items: pickFirst(5, 2) }];
        } },
      { name: "Sign Words", art: "sign", ribbon: "Book",
        make: function () {
          return [{ banner: "Level 2", bannerSay: "Level two! Signs from your book!", items: BOOK_SIGNS.slice() }];
        } },
      { name: "First Letter", art: "ball",
        make: function () {
          return [{ banner: "Level 3", bannerSay: "Level three! First letters!", items: pickFirst(6, 3) }];
        } },
      { name: "Middle Letter", art: "drum",
        make: function () {
          var p = Shell.shuffle(keys(MIDDLE)).slice(0, 5), out = [], i;
          for (i = 0; i < p.length; i++) { out.push(middleItem(p[i], MIDDLE)); }
          return [{ banner: "Level 4", bannerSay: "Level four! Letters in the middle!", items: out }];
        } },
      { name: "Body Words", art: "face", ribbon: "Book",
        make: function () {
          var p = keys(BODY), out = [], i;
          for (i = 0; i < p.length; i++) { out.push(middleItem(p[i], BODY)); }
          return [{ banner: "Level 5", bannerSay: "Level five! Body words from your book!", items: out }];
        } },
      { name: "Super Signs", art: "stop",
        make: function () {
          var p = Shell.shuffle(keys(SIGNS)).slice(0, 6), out = [], i;
          for (i = 0; i < p.length; i++) { out.push(signItem(p[i])); }
          return [{ banner: "Level 6", bannerSay: "Level six! Super signs!", items: out }];
        } }
    ]
  };

  LetterFill.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02FINISHSIGN",
    version: "v-02",
    title: "Finish the Sign Word",
    kicker: "Grade 1 · Chapter 2",
    intro: "Find the missing letter.",
    levels: CONTENT.levels,
    start: LetterFill.start,
    resume: LetterFill.resume,
    score: function () { return LetterFill.score || 0; },
    max: LetterFill.max
  });
})();
