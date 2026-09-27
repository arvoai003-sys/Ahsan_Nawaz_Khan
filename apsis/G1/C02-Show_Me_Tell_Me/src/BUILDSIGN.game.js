// @asset ENG01CH02BUILDSIGN
// @version v-01
// @title Build a Sign
// @engine sign-build
/* A10 · Build a Sign · Writing > Sign Writing · O7

   Plan: drag words and a picture to build signs (STOP, SLOW, wash hands, no
   drinks); real sign-drawing goes offline (2E Part 2, p.32: "write your own
   sign to put on a door in your school" is said in the Level 3 banner).
   Book rules taught:
   - p.31 Language tip: "Signs don't have a full stop at the end." (Level 4,
     Level 6: a full-stop tile is a trap)
   - p.31 2D C: "Signs start with capital letters." (Level 4)
   - p.32 2E Part 1 signs: slow, wash hands, do not drink this water.
   Beyond the book (authored): BOOKS, TOYS, EXIT, BOOK CORNER from the chapter.
   Signs are written the house way: one or two words in capitals (STOP,
   NO DRINKS), longer signs with a capital on every word (Wash Your Hands). */
(function () {
  var SIGNS = {
    stop: { say: "Stop", words: ["STOP"], pic: "hand", tone: "red", shape: "oct", done: "Stop! This sign tells us to stop." },
    slow: { say: "Slow", words: ["SLOW"], pic: "turtle", tone: "yellow", done: "Slow! This sign tells us to go slowly." },
    wash: { say: "Wash your hands", words: ["Wash", "Your", "Hands"], pic: "soap", tone: "blue", done: "Wash your hands! This sign tells us to wash our hands." },
    nodrinks: { say: "No drinks", words: ["NO", "DRINKS"], pic: "nodrink", tone: "white", done: "No drinks! This sign tells us not to drink here." },
    books: { say: "Books", words: ["BOOKS"], pic: "book", tone: "green", done: "Books! This sign shows us where the books are." },
    toys: { say: "Toys", words: ["TOYS"], pic: "toys", tone: "yellow", done: "Toys! This sign shows us where the toys are." },
    exit: { say: "Exit", words: ["EXIT"], pic: "door", tone: "green", done: "Exit! This sign shows us the way out." },
    corner: { say: "Book corner", words: ["BOOK", "CORNER"], pic: "shelf", tone: "white", done: "Book corner! This sign shows us where to read." }
  };
  var PLAN = ["stop", "slow", "wash", "nodrinks"];
  var ALL = ["stop", "slow", "wash", "nodrinks", "books", "toys", "exit", "corner"];
  var MULTI = ["wash", "nodrinks", "corner"];
  var CAP_RULE = "Signs start with a capital letter.";
  var STOP_RULE = "Signs don't have a full stop at the end.";

  function some(list, n) { return Shell.shuffle(list).slice(0, n); }
  function many(fn, list) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }
  function others(k, n) { var out = [], i; for (i = 0; i < ALL.length; i++) { if (ALL[i] !== k) { out.push(ALL[i]); } } return some(out, n); }
  function text(k) { return SIGNS[k].words.join(" "); }
  function board(k) { return { tone: SIGNS[k].tone, shape: SIGNS[k].shape }; }
  function picTile(k, goes) { return { id: "pic-" + k, art: SIGNS[k].pic, goes: goes }; }
  function wordsTile(k, goes) { return { id: "w-" + k, text: text(k), say: SIGNS[k].say, goes: goes }; }

  /* the words are on the sign: which picture? */
  function pickPic(k) {
    var o = others(k, 2);
    return { text: "Which picture goes on this sign?", say: ["This sign says", SIGNS[k].say, "Which picture goes on it?"], sign: board(k),
      slots: [{ id: "pic", kind: "pic" }, { id: "w", kind: "word", fill: text(k) }],
      tiles: [picTile(k, "pic"), picTile(o[0]), picTile(o[1])], done: [SIGNS[k].done] };
  }
  /* the picture is on the sign: which words? */
  function pickWords(k) {
    var o = others(k, 2);
    return { text: "Which words go on this sign?", say: "Look at the picture. Which words go on this sign?", sign: board(k),
      slots: [{ id: "pic", kind: "pic", fill: SIGNS[k].pic }, { id: "w", kind: "word" }],
      tiles: [wordsTile(k, "w"), wordsTile(o[0]), wordsTile(o[1])], done: [SIGNS[k].done] };
  }
  /* an empty sign: the picture and the words */
  function build(k) {
    var o = others(k, 1)[0];
    return { text: "Build a sign that says <b>" + text(k) + "</b>.", say: ["Build a sign that says", SIGNS[k].say], sign: board(k),
      slots: [{ id: "pic", kind: "pic" }, { id: "w", kind: "word" }],
      tiles: [picTile(k, "pic"), picTile(o), wordsTile(k, "w"), wordsTile(o)], done: [SIGNS[k].done] };
  }
  /* the book's sign rules: a capital letter, and no full stop */
  function rule(k, kind) {
    var right = text(k), trap = kind === "cap" ? right.toLowerCase() : right + ".";
    return { text: "Which is the right way to write this sign?", say: ["This sign says", SIGNS[k].say, "Which is the right way to write it?"],
      sign: board(k), slots: [{ id: "pic", kind: "pic", fill: SIGNS[k].pic }, { id: "w", kind: "word" }],
      tiles: [{ id: "right", text: right, goes: "w" }, { id: "trap", text: trap }],
      hint: [kind === "cap" ? CAP_RULE : STOP_RULE], done: [kind === "cap" ? CAP_RULE : STOP_RULE] };
  }
  /* a sign with two or three words: put them in order */
  function order(k) {
    var ws = SIGNS[k].words, slots = [{ id: "pic", kind: "pic", fill: SIGNS[k].pic }], tiles = [], i;
    for (i = 0; i < ws.length; i++) { slots.push({ id: "w" + i, kind: "word" }); tiles.push({ id: "w" + i, text: ws[i], goes: "w" + i }); }
    return { text: "Put the words in order.", say: ["This sign says", SIGNS[k].say, "Put the words in the right order."], sign: board(k),
      slots: slots, tiles: tiles, done: [SIGNS[k].done] };
  }
  /* everything: picture, words in order, and a full-stop trap */
  function superSign(k) {
    var ws = SIGNS[k].words, o = others(k, 1)[0], slots = [{ id: "pic", kind: "pic" }], tiles = [picTile(k, "pic"), picTile(o)], i;
    for (i = 0; i < ws.length; i++) { slots.push({ id: "w" + i, kind: "word" }); tiles.push({ id: "w" + i, text: ws[i], goes: "w" + i }); }
    tiles.push({ id: "dot", text: "." });
    return { text: "Build a sign that says <b>" + text(k) + "</b>.", say: ["Build a sign that says", SIGNS[k].say], sign: board(k),
      slots: slots, tiles: tiles, hint: [STOP_RULE], done: [SIGNS[k].done] };
  }

  var CONTENT = {
    levels: [
      { name: "Pick the Picture", art: "turtle", ribbon: "Book",
        make: function () { return [{ banner: "Level 1", bannerSay: "Level one! Which picture goes on the sign?", items: many(pickPic, PLAN) }]; } },
      { name: "Pick the Words", art: "soap",
        make: function () { return [{ banner: "Level 2", bannerSay: "Level two! Which words go on the sign?", items: many(pickWords, some(ALL, 4)) }]; } },
      { name: "Build It", art: "hand", ribbon: "Book",
        make: function () { return [{ banner: "Level 3", bannerSay: "Level three! Build the signs! Later, draw your own sign for a door in your school.", items: many(build, PLAN) }]; } },
      { name: "Sign Rules", art: "stop", ribbon: "Book",
        make: function () {
          var s = some(ALL, 4);
          return [{ banner: "Level 4", bannerSay: "Level four! " + CAP_RULE + " " + STOP_RULE, items: [rule(s[0], "cap"), rule(s[1], "cap"), rule(s[2], "dot"), rule(s[3], "dot")] }];
        } },
      { name: "Word Order", art: "shelf",
        make: function () { return [{ banner: "Level 5", bannerSay: "Level five! Put the words in order!", items: many(order, MULTI) }]; } },
      { name: "Super Signs", art: "trophy",
        make: function () { return [{ banner: "Level 6", bannerSay: "Level six! Build the whole sign! " + STOP_RULE, items: many(superSign, some(ALL, 4)) }]; } }
    ]
  };

  SignBuild.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02BUILDSIGN",
    version: "v-01",
    title: "Build a Sign",
    intro: "Let's build some signs!",
    theme: "builder",
    buddy: "kid",
    heroArt: "stop",
    levels: CONTENT.levels,
    start: SignBuild.start,
    resume: SignBuild.resume,
    score: function () { return SignBuild.score || 0; },
    max: SignBuild.max
  });
})();
