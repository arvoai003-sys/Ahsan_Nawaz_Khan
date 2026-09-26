// @asset ENG01CH02LABELIT
// @version v-01
// @title Label It
// @engine match
/* A4 · Label It · Grammar and Vocabulary > Labels · O3

   Book, verbatim:
   - p.28 2B: the classroom labels BOOKS and TOYS and the ENTRANCE sign (Level 2).
   - p.29 2C B: "Which sign tells you where you can read a book? Point to it and
     read it aloud." -> BOOKS (Level 2).
   Beyond the book (Champ, 2026-09-26: "you can use labels other than book"):
   classroom labels BAGS, SHOES, PENCILS, BIN and school labels CANTEEN,
   PLAYGROUND, WASHROOM, WATER, OFFICE.
   The pictures carry no words, so the child has to read the label. Labels are in
   capitals, as on the book's signs; each one is read aloud when tapped. */
(function () {
  function L(word, art, say) { return { word: word, art: art, say: say }; }
  var BOOK = [L("BOOKS", "shelf", "Books"), L("TOYS", "toybox", "Toys"), L("ENTRANCE", "door", "Entrance")];
  var CLASS = [L("BOOKS", "shelf", "Books"), L("TOYS", "toybox", "Toys"), L("BAGS", "baghooks", "Bags"),
    L("SHOES", "shoerack", "Shoes"), L("PENCILS", "pencilpot", "Pencils"), L("BIN", "bin", "Bin")];
  var SCHOOL = [L("ENTRANCE", "door", "Entrance"), L("CANTEEN", "canteen", "Canteen"), L("PLAYGROUND", "swing", "Playground"),
    L("WASHROOM", "washroom", "Washroom"), L("WATER", "cooler", "Water"), L("OFFICE", "office", "Office")];
  var ALL = CLASS.concat(SCHOOL.slice(1));
  /* pictures too alike to share a screen */
  var CLASH = { WATER: "WASHROOM", WASHROOM: "WATER" };

  function pickSet(pool, n) {
    var list = Shell.shuffle(pool), out = [], used = {}, i;
    for (i = 0; i < list.length && out.length < n; i++) {
      if (used[list[i].word] || (CLASH[list[i].word] && used[CLASH[list[i].word]])) { continue; }
      used[list[i].word] = 1; out.push(list[i]);
    }
    return out;
  }
  function target(l) { return { id: l.word, art: l.art, label: "picture", done: "This label says " + l.say + "." }; }
  function chip(l, goes) { return { text: l.word, say: l.say, label: true, goes: goes }; }

  /* put each label in the right place */
  function placeScreen(list) {
    var s = { text: "Put each label in the right place.", say: "Can you put each label in the right place?", targets: [], chips: [] }, i;
    for (i = 0; i < list.length; i++) { s.targets.push(target(list[i])); s.chips.push(chip(list[i], list[i].word)); }
    return s;
  }
  /* one picture, three labels */
  function whichScreen(l, pool) {
    var others = pickSet(filterOut(pool, l), 2), s, i;
    s = { text: "Which label goes here?", say: "Which label goes here?", targets: [{ id: "here", art: l.art, label: "picture", done: "This label says " + l.say + "." }],
      chips: [chip(l, "here")] };
    for (i = 0; i < others.length; i++) { s.chips.push(chip(others[i])); }
    return s;
  }
  function filterOut(pool, l) {
    var out = [], i;
    for (i = 0; i < pool.length; i++) { if (pool[i].word !== l.word && pool[i].word !== CLASH[l.word]) { out.push(pool[i]); } }
    return out;
  }
  var READ_A_BOOK = {
    text: "Which sign tells you where you can read a book?",
    say: "Which sign tells you where you can read a book?",
    targets: [{ id: "here", art: "shelf", label: "picture", done: "Books! You can read a book here." }],
    chips: [chip(BOOK[0], "here"), chip(BOOK[1]), chip(BOOK[2])]
  };
  function many(fn, list) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "toybox",
        make: function () {
          return [{ banner: "Level 1", bannerSay: "Level one! Let's warm up!",
            items: [placeScreen(pickSet(CLASS, 2)), placeScreen(pickSet(CLASS, 2)), placeScreen(pickSet(SCHOOL, 2))] }];
        } },
      { name: "Classroom Signs", art: "shelf", ribbon: "Book",
        make: function () {
          return [{ banner: "Level 2", bannerSay: "Level two! Signs from your book!", shuffle: false,
            items: [placeScreen(BOOK.slice()), READ_A_BOOK] }];
        } },
      { name: "Our Classroom", art: "pencilpot",
        make: function () {
          var s = Shell.shuffle(CLASS);
          return [{ banner: "Level 3", bannerSay: "Level three! Label our classroom!", items: [placeScreen(s.slice(0, 3)), placeScreen(s.slice(3, 6))] }];
        } },
      { name: "Our School", art: "swing",
        make: function () {
          return [{ banner: "Level 4", bannerSay: "Level four! Label our school!", items: [placeScreen(pickSet(SCHOOL, 3)), placeScreen(pickSet(SCHOOL, 3))] }];
        } },
      { name: "Which Label?", art: "door",
        make: function () {
          var list = pickSet(ALL, 5);
          return [{ banner: "Level 5", bannerSay: "Level five! Which label goes here?", items: many(function (l) { return whichScreen(l, ALL); }, list) }];
        } },
      { name: "Super Labels", art: "trophy",
        make: function () {
          return [{ banner: "Level 6", bannerSay: "Level six! Super labels!", items: [placeScreen(pickSet(ALL, 4)), placeScreen(pickSet(ALL, 4))] }];
        } }
    ]
  };

  Match.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02LABELIT",
    version: "v-01",
    title: "Label It",
    intro: "Put each label in the right place.",
    theme: "classroom",
    buddy: "kid",
    heroArt: "shelf",
    levels: CONTENT.levels,
    start: Match.start,
    resume: Match.resume,
    score: function () { return Match.score || 0; },
    max: Match.max
  });
})();
