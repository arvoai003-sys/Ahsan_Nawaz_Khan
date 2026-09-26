// @asset ENG01CH02SAMESOUND
// @version v-05
// @title Same First Sound
// @engine tap-identify
/* A6 · Same First Sound · Phonics and Spelling > Sounds at the Start of Word · O4

   Book words (verbatim, p.31 2D A): book stop exit staff hand sign; answer set
   stop, staff, sign. Level 2 and the first item of Level 6 use only these.

   Beyond the book (authored, needs Champ's approval): a Grade 1 word bank on
   the chapter's topics (signs and school, the body and senses, home, food and
   animals a Pakistani child knows). Every bank word starts with a sound that
   matches its first letter, so no letter-sound trap (no "eyes", "ear", "knee",
   "phone"). Only whole words are spoken: TTS cannot say a single sound. */
(function () {
  /* sound -> words. Book words are included so they come back in new company. */
  var BANK = {
    s: ["sun", "sock", "soap", "stop", "sign"],
    b: ["book", "bus", "ball", "bag", "bell", "banana"],
    h: ["hand", "hat", "house", "hen"],
    e: ["exit", "egg", "elephant"],
    m: ["mouth", "moon", "milk", "mango"],
    f: ["face", "foot", "fish", "fan"],
    t: ["tap", "tree", "teeth", "toys"],
    n: ["nose", "nest", "nine"],
    d: ["door", "duck", "drum"],
    l: ["leg", "leaf", "lion", "lollipop"]
  };
  var SOUNDS = [];
  var k;
  for (k in BANK) { if (BANK.hasOwnProperty(k)) { SOUNDS.push(k); } }

  function W(text) { return { text: text, art: text }; }
  function pick(list, n, avoid) {
    var out = [], pool = Shell.shuffle(list), i;
    for (i = 0; i < pool.length && out.length < n; i++) {
      if (!avoid || !avoid[pool[i]]) { out.push(pool[i]); }
    }
    return out;
  }
  /* sounds for one level, spread so the same sound is not used back to back */
  function soundQueue(n, minWords) {
    var ok = [], i, q = [];
    for (i = 0; i < SOUNDS.length; i++) { if (BANK[SOUNDS[i]].length >= minWords) { ok.push(SOUNDS[i]); } }
    while (q.length < n) { q = q.concat(Shell.shuffle(ok)); }
    return q.slice(0, n);
  }
  function otherSounds(not, n) {
    var list = [], i;
    for (i = 0; i < SOUNDS.length; i++) { if (SOUNDS[i] !== not) { list.push(SOUNDS[i]); } }
    return pick(list, n);
  }
  function oneWord(sound, used) {
    var w = pick(BANK[sound], 1, used)[0] || pick(BANK[sound], 1)[0];
    used[w] = true;
    return w;
  }

  /* ---------- item makers ---------- */
  function startsLike(sound, choices, used) {
    var pair = pick(BANK[sound], 2, used);
    if (pair.length < 2) { pair = pick(BANK[sound], 2); }
    used[pair[0]] = true; used[pair[1]] = true;
    var opts = [W(pair[1])], others = otherSounds(sound, choices - 1), i;
    for (i = 0; i < others.length; i++) { opts.push(W(oneWord(others[i], used))); }
    return {
      text: "Which word starts like <b>" + pair[0] + "</b>?",
      say: ["Which word starts like", pair[0]],
      target: W(pair[0]), options: opts, answer: [pair[1]],
      hint2: ["Listen.", pair[0], pair[0]]
    };
  }
  function findTwo(sound, used) {
    var pair = pick(BANK[sound], 2, used);
    if (pair.length < 2) { pair = pick(BANK[sound], 2); }
    used[pair[0]] = true; used[pair[1]] = true;
    var odd = oneWord(otherSounds(sound, 1)[0], used);
    return {
      text: "Two words start the same. Tap them both.",
      say: "Two words start the same. Can you tap them both?",
      options: [W(pair[0]), W(pair[1]), W(odd)], answer: pair
    };
  }
  function oddOneOut(sound, used) {
    var pair = pick(BANK[sound], 2, used);
    if (pair.length < 2) { pair = pick(BANK[sound], 2); }
    used[pair[0]] = true; used[pair[1]] = true;
    var odd = oneWord(otherSounds(sound, 1)[0], used);
    return {
      text: "Which word starts with a <b>different</b> sound?",
      say: "One word starts with a different sound. Can you find it?",
      options: [W(pair[0]), W(pair[1]), W(odd)], answer: [odd]
    };
  }
  function findThree(sound, used) {
    var three = pick(BANK[sound], 3, used);
    if (three.length < 3) { three = pick(BANK[sound], 3); }
    var others = otherSounds(sound, 3), opts = [], i;
    for (i = 0; i < 3; i++) { used[three[i]] = true; opts.push(W(three[i])); }
    for (i = 0; i < others.length; i++) { opts.push(W(oneWord(others[i], used))); }
    return {
      text: "Find three words that start with the same sound.",
      say: "Can you find three words that start the same?",
      options: opts, answer: three
    };
  }
  function many(maker, n, minWords) {
    var q = soundQueue(n, minWords), used = {}, out = [], i;
    for (i = 0; i < n; i++) { out.push(maker(q[i], used)); }
    return out;
  }
  /* starts-like items with a given number of choices (2 or 3) */
  function manyStarts(n, choices) {
    var q = soundQueue(n, 2), used = {}, out = [], i;
    for (i = 0; i < n; i++) { out.push(startsLike(q[i], choices, used)); }
    return out;
  }

  /* ---------- the book's own items (verbatim words, p.31) ---------- */
  var B = { book: W("book"), stop: W("stop"), exit: W("exit"), staff: W("staff"), hand: W("hand"), sign: W("sign") };
  function bookSame(target, a, b, c, answer) {
    return {
      text: "Which word starts like <b>" + target + "</b>?",
      say: ["Which word starts like", target],
      target: B[target], options: [B[a], B[b], B[c]], answer: [answer],
      hint2: ["Listen.", target, target]
    };
  }
  function bookTwo(a, b, c, answers) {
    return {
      text: "Two words start the same. Tap them both.",
      say: "Two words start the same. Can you tap them both?",
      options: [B[a], B[b], B[c]], answer: answers
    };
  }
  var BOOK_SIX = {
    text: "Find three words that start with the same sound.",
    say: "Read the words. Can you find three words that start the same?",
    options: [B.book, B.stop, B.exit, B.staff, B.hand, B.sign],
    answer: ["stop", "staff", "sign"]
  };

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "sun",
        make: function () {
          return [{ banner: "Level 1", bannerSay: "Level one! Let's warm up!", markFirst: true,
            items: manyStarts(5, 2) }];
        } },
      { name: "Sign Words", art: "stop", ribbon: "Book",
        rounds: [
          { banner: "Level 2", bannerSay: "Level two! Sign words from your book!", markFirst: true,
            items: [bookSame("stop", "staff", "book", "hand", "staff"),
                    bookSame("sign", "exit", "stop", "hand", "stop"),
                    bookSame("staff", "book", "sign", "exit", "sign")] },
          { banner: "Find two", bannerSay: "Now find two!", markFirst: true,
            items: [bookTwo("stop", "hand", "sign", ["stop", "sign"]),
                    bookTwo("book", "staff", "stop", ["staff", "stop"]),
                    bookTwo("exit", "sign", "staff", ["sign", "staff"])] }
        ] },
      { name: "Same Start", art: "ball",
        make: function () {
          return [{ banner: "Level 3", bannerSay: "Level three! Same start!", markFirst: true,
            items: manyStarts(6, 3) }];
        } },
      { name: "Find Two", art: "fish",
        make: function () {
          return [{ banner: "Level 4", bannerSay: "Level four! Find two!", markFirst: true,
            items: many(findTwo, 5, 2) }];
        } },
      { name: "Odd One Out", art: "duck",
        make: function () {
          return [{ banner: "Level 5", bannerSay: "Level five! Odd one out!", markFirst: true,
            items: many(oddOneOut, 5, 2) }];
        } },
      { name: "Super Star", art: "lion",
        make: function () {
          return [{ banner: "Level 6", bannerSay: "Level six! Super star challenge!", markFirst: true,
            shuffle: false,
            items: [BOOK_SIX].concat(many(findThree, 2, 3)) }];
        } }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02SAMESOUND",
    version: "v-05",
    title: "Same First Sound",
    intro: "Find words that start with the same sound.",
    theme: "meadow",
    buddy: "asma",
    heroArt: "ball",
    levels: CONTENT.levels,
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: TapIdentify.max
  });
})();
