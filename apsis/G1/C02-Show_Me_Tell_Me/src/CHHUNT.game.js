// @asset ENG01CH02CHHUNT
// @version v-01
// @title ch Sound Hunt
// @engine tap-identify
/* A17 · ch Sound Hunt · Phonics > ch Words · O9

   Book, verbatim:
   - ch words in the children's pages: chin (p.38), chest (p.37, p.38) at the
     start; lunch (p.36) and touch (p.33, p.34) at the end.
   - p.36 2H A: "On page 33, find a word that has the same end spelling as
     lunch." -> touch, from the p.33 sense words (Level 4, first item).
   Beyond the book (the plan's "short Grade 1 ch word list", authored): chick,
   cheese, chair, cherries, chips; end words peach, beach, bench, watch, catch.
   The voice never says "ch" on its own (it would read the letters "see
   aitch"): it asks "Which one starts like chin?" and the screen shows ch. */
(function () {
  /* chest: the child with a red arrow, as in Name the Body Part */
  function arrow(tx, ty, fx, fy) {
    var dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
    var bx = tx - ux * 12, by = ty - uy * 12, px = -uy * 8, py = ux * 8;
    return '<path d="M' + fx + " " + fy + "L" + bx.toFixed(1) + " " + by.toFixed(1) + '" stroke="#FF3B3B" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M' + tx + " " + ty + "L" + (bx + px).toFixed(1) + " " + (by + py).toFixed(1) + "L" + (bx - px).toFixed(1) + " " + (by - py).toFixed(1) + 'z" fill="#FF3B3B" stroke="#FF3B3B" stroke-width="2" stroke-linejoin="round"/>';
  }
  Art.addBox("kid_chest", "-40 0 200 200", Buddy.kidInner() + arrow(70, 110, 130, 116));

  var CH = ["chin", "chest", "chick", "cheese", "chair", "cherries", "chips"];
  var ART = { chest: "kid_chest" };
  /* pictures that start with other sounds (one c word per screen at most: cat, cake, car, clock start like "k") */
  var NOT = ["sock", "sun", "fish", "duck", "hat", "bag", "tree", "bee", "moon", "leg", "egg", "drum", "house", "lion"];
  var C_WORDS = ["cat", "cake", "car", "clock"];
  var END_CH = ["touch", "peach", "beach", "bench", "watch", "catch"];
  var END_NOT = ["taste", "smell", "hear", "see", "hand", "book", "milk", "sun", "leg", "tree"];

  function some(list, n) { return Shell.shuffle(list).slice(0, n); }
  function many(fn, list) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }
  function but(list, x) { var out = [], i; for (i = 0; i < list.length; i++) { if (list[i] !== x) { out.push(list[i]); } } return out; }
  function pic(w) { return { text: w, art: ART[w] || w }; }
  function word(w) { return { text: w }; }
  function capital(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  /* distractors with different first letters, at most one c word */
  function nots(n, withC) {
    var out = some(NOT, withC ? n - 1 : n), used = {}, i;
    if (withC) { out.push(some(C_WORDS, 1)[0]); }
    for (i = 0; i < out.length; i++) { used[out[i].charAt(0)] = (used[out[i].charAt(0)] || 0) + 1; }
    for (i = 0; i < out.length; i++) { if (used[out[i].charAt(0)] > 1) { return nots(n, withC); } }
    return out;
  }

  /* which one starts like chin? */
  function likeItem(key, n, withC) {
    var ans = some(but(CH, key), 1)[0];
    return { text: "Which one starts with <b>ch</b>, like <b>" + key + "</b>?", say: ["Which one starts like", key],
      target: pic(key), options: [pic(ans)].concat(many(pic, nots(n - 1, withC))), answer: [ans],
      done: [capital(ans) + " starts like " + key + "!"], hint2: ["Listen.", key, key] };
  }
  /* book: chin and chest */
  function bookItem() {
    var o = some(["head", "leg", "hand", "nose", "foot"], 2), BODY = { head: "face" };
    return { text: "Tap the two words that start with <b>ch</b>.", say: "Tap the two words that start with the same sound.",
      options: [pic("chin"), pic("chest"), { text: o[0], art: BODY[o[0]] || o[0] }, { text: o[1], art: BODY[o[1]] || o[1] }],
      answer: ["chin", "chest"], done: ["Chin and chest start the same way!"] };
  }
  /* hunt: three ch words among six */
  function huntItem(withC) {
    var ch = some(CH, 3);
    return { text: "Find the three words that start with <b>ch</b>.", say: "Find the three words that start with the same sound.",
      options: many(pic, ch).concat(many(pic, nots(3, withC))), answer: ch.slice(),
      done: ["You found all three!"] };
  }
  /* 2H A: same end spelling as lunch */
  function endItem(ans) {
    return { text: "Which word ends with <b>ch</b>, like <b>lunch</b>?", say: ["Which word ends like", "lunch"],
      options: [word(ans)].concat(many(word, some(END_NOT, 2))), answer: [ans],
      done: [capital(ans) + " ends like lunch!"], hint2: ["Listen.", "lunch", "lunch"] };
  }
  var BOOK_END = endItem("touch");
  BOOK_END.options = [word("touch"), word("taste"), word("smell")];
  /* start or end? */
  function whereItem(w) {
    var start = w.indexOf("ch") === 0;
    return { text: "Where is <b>ch</b> in this word?", say: ["Listen.", w, "Is the sound at the start, or at the end?"],
      target: { text: w, art: ART[w] || (CH.indexOf(w) > -1 ? w : null) }, options: [word("start"), word("end")],
      answer: [start ? "start" : "end"], done: [capital(w) + (start ? "! The sound is at the start." : "! The sound is at the end.")] };
  }
  var WHERE = ["chin", "chick", "cheese", "chair", "lunch", "touch", "peach", "bench"];

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "chick",
        make: function () { return [{ banner: "Level 1", bannerSay: "Level one! Let's go on a sound hunt!", items: many(function (k) { return likeItem(k, 2, false); }, some(CH, 5)) }]; } },
      { name: "Book Words", art: "chin", ribbon: "Book",
        make: function () { return [{ banner: "Level 2", bannerSay: "Level two! Chin and chest, from your book!", items: [bookItem(), likeItem("chin", 3, false), likeItem("chest", 3, false)] }]; } },
      { name: "Sound Hunt", art: "cheese",
        make: function () { return [{ banner: "Level 3", bannerSay: "Level three! Find the three words that start the same way!", items: [huntItem(false), huntItem(true), huntItem(true)] }]; } },
      { name: "Ends Like Lunch", art: "chips", ribbon: "Book",
        make: function () {
          return [{ banner: "Level 4", bannerSay: "Level four! Which word ends like lunch?", shuffle: false,
            items: [BOOK_END].concat(many(endItem, some(but(END_CH, "touch"), 4))) }];
        } },
      { name: "Start or End?", art: "chair",
        make: function () { return [{ banner: "Level 5", bannerSay: "Level five! Start, or end?", items: many(whereItem, some(WHERE, 6)) }]; } },
      { name: "Super Star", art: "trophy",
        make: function () {
          var w2 = some(WHERE, 2);
          return [{ banner: "Level 6", bannerSay: "Level six! Super star challenge!",
            items: [likeItem(some(CH, 1)[0], 3, true), huntItem(true), endItem(some(END_CH, 1)[0]), whereItem(w2[0]), whereItem(w2[1])] }];
        } }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02CHHUNT",
    version: "v-01",
    title: "ch Sound Hunt",
    intro: "Let's hunt for words like chin and chick!",
    theme: "farm",
    buddy: "kid",
    heroArt: "chick",
    levels: CONTENT.levels,
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: TapIdentify.max
  });
})();
