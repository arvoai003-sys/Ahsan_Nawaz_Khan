// @asset ENG01CH02SIGNSAY
// @version v-01
// @title What Does the Sign Say?
// @engine tap-identify
/* A3 · What Does the Sign Say? · Grammar and Vocabulary > Signs · O2

   Book, verbatim:
   - p.28 2B (reading): Signs show us where to go in. / Signs tell us what to do. /
     In the classroom, signs help us to find things. / Signs tell us where we must
     not go. (Level 2)
   - p.29 2C A2: "Which sign shows you where to go?" -> EXIT (Level 3).
     2C A1 ("Which sign tells you to do something?") stays withheld (brief F2);
     each p.29 sign is asked about by its own meaning instead. The crossed-out
     tap means "Don't waste water" (Champ, 2026-09-26).
   - p.32 2E Part 1: "Tell a partner what each sign is telling you to do, or not
     to do." SLOW, wash hands, no diving, no drinking water (Level 4). The words
     for the picture-only signs are ours.
   - p.27 2A C and p.30 2C C: which books are stories and which are about real
     life (Level 5). Titles as printed; the covers are drawn by us, never the
     publishers' art. "How to draw cartoons" (p.26) shows how to do something:
     real life. */
(function () {
  /* sign pictures: the words are in the picture, so no label and no speaker */
  function S(art, label) { return { text: art, art: art, label: label, hideWord: true, noBadge: true }; }
  var SIGN = {
    stop: S("stop", "Stop sign"), slow: S("slow", "Slow sign"), exit: S("exit", "Exit sign"),
    entrance: S("entrance", "Entrance sign"), books: S("bookslabel", "Books sign"), toys: S("toyslabel", "Toys sign"),
    danger: S("danger", "Danger Deep Water sign"), wash: S("washsign", "Wash your hands sign"),
    slippery: S("slippery", "Slippery road sign"), nowaste: S("nowaste", "Don't waste water sign"),
    nodive: S("nodive", "No diving sign"), nodrink: S("nodrink", "Don't drink this water sign")
  };
  var DO = { text: "Do", art: "dosign", say: "Do" };
  var DONT = { text: "Don't", art: "dontsign", say: "Don't" };
  var STORY = { text: "Story", art: "storybook", say: "Story" };
  var REAL = { text: "Real life", art: "reallife", say: "Real life" };

  /* Level 1: signs with printed words */
  var PRINTED = [
    ["stop", "Stop"], ["slow", "Slow"], ["exit", "Exit"], ["entrance", "Entrance"],
    ["books", "Books"], ["toys", "Toys"], ["danger", "Danger"], ["wash", "Wash your hands"]
  ];
  function saysItems(n) {
    var list = Shell.shuffle(PRINTED), out = [], k, other;
    for (k = 0; k < n; k++) {
      other = list[(k + 1 + Math.floor(Math.random() * (list.length - 2))) % list.length];
      if (other[0] === list[k][0]) { other = list[(k + 1) % list.length]; }
      out.push({ text: "Which sign says <b>" + list[k][1] + "</b>?", say: ["Which sign says", list[k][1]],
        options: [SIGN[list[k][0]], SIGN[other[0]]], answer: [id(list[k][0])],
        done: ["This sign says", list[k][1]] });
    }
    return out;
  }
  function id(key) { return SIGN[key].text; }

  /* Level 2: book p.28 sentences */
  var READ = [
    { say: "Signs show us where to go in.", ans: "entrance", others: ["wash", "danger"] },
    { say: "Signs tell us what to do.", ans: "wash", others: ["entrance", "books"] },
    { say: "In the classroom, signs help us to find things.", ans: "books", others: ["danger", "entrance"] },
    { say: "Signs tell us where we must not go.", ans: "danger", others: ["wash", "books"] }
  ];
  function readItems() {
    var out = [], k, r;
    for (k = 0; k < READ.length; k++) {
      r = READ[k];
      out.push({ text: r.say, say: ["Listen.", r.say, "Which sign is it?"],
        options: [SIGN[r.ans], SIGN[r.others[0]], SIGN[r.others[1]]], answer: [id(r.ans)], done: [r.say] });
    }
    return out;
  }

  /* Level 3: what does it mean? (p.29 trio always; two from p.32) */
  var BOOK_TRIO = ["exit", "slippery", "nowaste"];
  var MEAN = [
    { q: "Which sign shows you where to go?", ans: "exit", pool: BOOK_TRIO, done: "Exit! This way out." },
    { q: "Which sign tells you: don't waste water?", ans: "nowaste", pool: BOOK_TRIO, done: "Don't waste water! Close the tap." },
    { q: "Which sign tells you: be careful, the road is slippery?", ans: "slippery", pool: BOOK_TRIO, done: "Be careful! The road is slippery." }
  ];
  var MEAN_2E = [
    { q: "Which sign tells you to go slowly?", ans: "slow", pool: ["slow", "nodive", "wash"], done: "Slow! Go slowly." },
    { q: "Which sign tells you to wash your hands?", ans: "wash", pool: ["wash", "nodrink", "slow"], done: "Wash your hands!" },
    { q: "Which sign tells you not to dive?", ans: "nodive", pool: ["nodive", "slow", "wash"], done: "No diving here!" },
    { q: "Which sign tells you not to drink this water?", ans: "nodrink", pool: ["nodrink", "nodive", "slow"], done: "Don't drink this water!" }
  ];
  function meanItem(m) {
    var opts = [], k;
    for (k = 0; k < m.pool.length; k++) { opts.push(SIGN[m.pool[k]]); }
    return { text: m.q, say: m.q, options: opts, answer: [id(m.ans)], done: [m.done] };
  }

  /* Level 4: do or don't? (p.32 four always, plus others) */
  var DODONT = [
    { sign: "slow", ans: "Do", done: "Slow means: go slowly." },
    { sign: "wash", ans: "Do", done: "Wash your hands." },
    { sign: "nodive", ans: "Don't", done: "Don't dive here." },
    { sign: "nodrink", ans: "Don't", done: "Don't drink this water." }
  ];
  var DODONT_MORE = [
    { sign: "exit", ans: "Do", done: "Exit means: go out this way." },
    { sign: "nowaste", ans: "Don't", done: "Don't waste water." },
    { sign: "danger", ans: "Don't", done: "Don't go near the deep water." }
  ];
  function doItem(d) {
    var t = SIGN[d.sign];
    return { text: "Does this sign say <b>do</b> or <b>don't</b>?", say: "Is this sign telling you to do something, or not to do something?",
      target: { text: t.text, art: t.art, label: t.label, hideWord: true, noBadge: true },
      options: [DO, DONT], answer: [d.ans], done: [d.done], hint2: ["Look at the sign.", "Is there a red line across it?"] };
  }

  /* Level 5: story or real life? (pp.26-30) */
  var BOOKS = [
    { art: "cov_redhood", title: "The Tale of Little Red Riding Hood", kind: "Story" },
    { art: "cov_pippi", title: "Pippi Longstocking", kind: "Story" },
    { art: "cov_monkey", title: "Monkey's Magic Pipe", kind: "Story" },
    { art: "cov_hero", title: "Hero Academy", kind: "Story" },
    { art: "cov_atlas", title: "First Atlas", kind: "Real life" },
    { art: "cov_bugs", title: "Bugs", kind: "Real life" },
    { art: "cov_oceans", title: "Our Oceans", kind: "Real life" },
    { art: "cov_guitar", title: "How to Play Guitar", kind: "Real life" },
    { art: "cov_body", title: "The Human Body", kind: "Real life" },
    { art: "cov_cartoons", title: "How to Draw Cartoons", kind: "Real life" }
  ];
  function bookItem(b) {
    return { text: "Is this book a <b>story</b> or about <b>real life</b>?", say: ["This book is", b.title, "Is it a story, or about real life?"],
      target: { text: b.art, art: b.art, label: b.title, say: b.title, hideWord: true },
      options: [STORY, REAL], answer: [b.kind],
      done: [b.title + (b.kind === "Story" ? " is a story book!" : " is about real life!")],
      hint2: ["Think.", "Is it made up, like a fairy tale?", "Or does it tell us true things?"] };
  }
  function bookItems(n) {
    var st = [], rl = [], k, out = [];
    for (k = 0; k < BOOKS.length; k++) { (BOOKS[k].kind === "Story" ? st : rl).push(BOOKS[k]); }
    st = Shell.shuffle(st); rl = Shell.shuffle(rl);
    for (k = 0; k < n; k++) { out.push(bookItem(k % 2 ? st[k >> 1] : rl[k >> 1])); }
    return out;
  }
  function pick(list, n) { return Shell.shuffle(list).slice(0, n); }
  function mapAll(list, fn) { var out = [], k; for (k = 0; k < list.length; k++) { out.push(fn(list[k])); } return out; }

  var CONTENT = {
    levels: [
      { name: "Sign Hunt", art: "stop",
        make: function () { return [{ banner: "Level 1", bannerSay: "Level one! Let's go on a sign hunt!", items: saysItems(5) }]; } },
      { name: "Read the Signs", art: "entrance", ribbon: "Book",
        make: function () { return [{ banner: "Level 2", bannerSay: "Level two! Signs from your book!", items: readItems() }]; } },
      { name: "What Does It Mean?", art: "slippery", ribbon: "Book",
        make: function () { return [{ banner: "Level 3", bannerSay: "Level three! What does the sign mean?", items: mapAll(MEAN.concat(pick(MEAN_2E, 2)), meanItem) }]; } },
      { name: "Do or Don't?", art: "dosign", ribbon: "Book",
        make: function () { return [{ banner: "Level 4", bannerSay: "Level four! Do, or don't?", items: mapAll(DODONT.concat(pick(DODONT_MORE, 2)), doItem) }]; } },
      { name: "Story or Real Life?", art: "storybook", ribbon: "Book",
        make: function () { return [{ banner: "Level 5", bannerSay: "Level five! Story, or real life?", items: bookItems(6) }]; } },
      { name: "Super Star", art: "trophy",
        make: function () {
          return [{ banner: "Level 6", bannerSay: "Level six! Super star challenge!",
            items: mapAll(pick(MEAN.concat(MEAN_2E), 2), meanItem).concat(mapAll(pick(DODONT.concat(DODONT_MORE), 2), doItem), bookItems(2)) }];
        } }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02SIGNSAY",
    version: "v-01",
    title: "What Does the Sign Say?",
    intro: "Let's read signs and books!",
    theme: "school",
    buddy: "asma",
    heroArt: "slow",
    levels: CONTENT.levels,
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: TapIdentify.max
  });
})();
