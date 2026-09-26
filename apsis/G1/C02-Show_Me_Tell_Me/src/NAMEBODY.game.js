// @asset ENG01CH02NAMEBODY
// @version v-02
// @title Name the Body Part
// @engine tap-identify
/* A19 · Name the Body Part · Grammar and Vocabulary > Labels · O11

   Book, verbatim:
   - p.37 (and p.38) 2I word box: head arm leg eyes nose mouth face chest foot hand.
   - p.37 Language tip: "Words that name things are called nouns." (Level 4)
   - p.37 2I A2 "Take turns to point to a body part and ask a partner to name
     it" -> Level 3 points at parts of Asma (ARVO character) for the child to name.
   Not repeated here: p.38 2I B2 (ch_n, e_r, n_ck, ha_r) is already in
   Finish the Sign Word, Level 5.
   Beyond the book (authored, needs Champ's approval): Level 4 non-naming
   words (happy, big, soft, tall, small, funny) and Level 5 questions
   (where do you wear a hat / socks, what do you wave with, ...). */
(function () {
  var WORDS = ["head", "arm", "leg", "eyes", "nose", "mouth", "face", "chest", "foot", "hand"];

  /* Asma with a red arrow pointing at one part (her drawing is 120 x 200) */
  function arrow(tx, ty, fx, fy) {
    var dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
    var bx = tx - ux * 12, by = ty - uy * 12, px = -uy * 8, py = ux * 8;
    return '<path d="M' + fx + " " + fy + "L" + bx.toFixed(1) + " " + by.toFixed(1) + '" stroke="#FF3B3B" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M' + tx + " " + ty + "L" + (bx + px).toFixed(1) + " " + (by + py).toFixed(1) + "L" + (bx - px).toFixed(1) + " " + (by - py).toFixed(1) + 'z" fill="#FF3B3B" stroke="#FF3B3B" stroke-width="2" stroke-linejoin="round"/>';
  }
  /* points in Asma's own drawing (120 x 200): [arrow tip x, y, arrow tail x, y] */
  var POINT = {
    head: [64, 18, 116, 4], eyes: [72, 60, 118, 36], mouth: [64, 74, 116, 92], chest: [70, 110, 118, 116],
    arm: [98, 122, 118, 96], hand: [102, 140, 118, 164], leg: [74, 168, 118, 176], foot: [76, 188, 118, 196]
  };
  var k;
  for (k in POINT) {
    if (POINT.hasOwnProperty(k)) { Art.addBox("asma_" + k, "0 0 120 200", Buddy.asmaInner() + arrow(POINT[k][0], POINT[k][1], POINT[k][2], POINT[k][3])); }
  }
  /* one picture per word: body-part icons, and Asma with an arrow where there is no icon */
  var PIC = { head: "asma_head", arm: "asma_arm", chest: "asma_chest", leg: "leg", eyes: "eyes", nose: "nose",
    mouth: "mouth", face: "face", foot: "foot", hand: "hand" };
  /* pictures that contain each other never share a screen */
  var CLASH = { face: ["eyes", "nose", "mouth"], eyes: ["face"], nose: ["face"], mouth: ["face"], leg: ["foot"], foot: ["leg"] };

  function pic(w) { return { text: w, art: PIC[w], label: w, hideWord: true, noBadge: true }; }
  function word(w) { return { text: w }; }
  function others(ans, n, pool) {
    var bad = CLASH[ans] || [], list = [], i;
    pool = pool || WORDS;
    for (i = 0; i < pool.length; i++) { if (pool[i] !== ans && bad.indexOf(pool[i]) < 0) { list.push(pool[i]); } }
    return Shell.shuffle(list).slice(0, n);
  }
  function mapAll(list, fn) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }

  /* word -> picture */
  function findItem(w, choices) {
    return { text: "Tap the <b>" + w + "</b>.", say: ["Can you find the", w],
      options: [pic(w)].concat(mapAll(others(w, choices - 1), pic)), answer: [w], done: [capital(w) + "!"] };
  }
  /* Asma with an arrow -> word */
  function pointItem(w) {
    return { text: "What is the arrow pointing to?", say: "Look at Asma. What is the arrow pointing to?",
      target: { text: "asma_" + w, art: "asma_" + w, label: "Asma", hideWord: true, noBadge: true, tall: true },
      options: [word(w)].concat(mapAll(others(w, 2, ["head", "eyes", "mouth", "chest", "arm", "hand", "leg", "foot"]), word)),
      answer: [w], done: ["That is Asma's " + w + "!"], hint2: ["Look at the red arrow."] };
  }
  /* Language tip: naming words */
  var NOT_NAMING = ["happy", "big", "soft", "tall", "small", "funny"];
  function nounItem(w) {
    var o = Shell.shuffle(NOT_NAMING).slice(0, 2);
    return { text: "Which word is a <b>naming word</b>?", say: "Words that name things are called nouns. Which word is a naming word?",
      options: [word(w), word(o[0]), word(o[1])], answer: [w], done: [capital(w) + " is a naming word!"],
      hint2: ["Which word names a part of your body?"] };
  }
  /* where does it go? */
  var WHERE = [
    { q: "Where do you wear a hat?", a: "head", pool: ["head", "foot", "hand"], done: "We wear a hat on our head." },
    { q: "Where do you wear socks?", a: "foot", pool: ["foot", "head", "eyes"], done: "We wear socks on our feet." },
    { q: "What do you wave hello with?", a: "hand", pool: ["hand", "nose", "leg"], done: "We wave with our hand." },
    { q: "Which part has your teeth?", a: "mouth", pool: ["mouth", "arm", "foot"], done: "Our teeth are in our mouth." },
    { q: "What do you look through your glasses with?", a: "eyes", pool: ["eyes", "leg", "hand"], done: "We look with our eyes." }
  ];
  function whereItem(x) {
    return { text: x.q, say: x.q, options: mapAll(x.pool, function (w) { return { text: w, art: PIC[w] }; }), answer: [x.a], done: [x.done] };
  }
  function capital(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function some(list, n) { return Shell.shuffle(list).slice(0, n); }

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "hand",
        make: function () { return [{ banner: "Level 1", bannerSay: "Level one! Let's warm up!", items: mapAll(some(WORDS, 5), function (w) { return findItem(w, 2); }) }]; } },
      { name: "Body Words", art: "face", ribbon: "Book",
        make: function () { return [{ banner: "Level 2", bannerSay: "Level two! Body words from your book!", items: mapAll(some(WORDS, 6), function (w) { return findItem(w, 3); }) }]; } },
      { name: "Point to Asma", art: "asma_arm", ribbon: "Book",
        make: function () { return [{ banner: "Level 3", bannerSay: "Level three! Asma is pointing. Can you name it?", items: mapAll(some(["head", "eyes", "mouth", "chest", "arm", "hand", "leg", "foot"], 5), pointItem) }]; } },
      { name: "Naming Words", art: "book", ribbon: "Book",
        make: function () { return [{ banner: "Level 4", bannerSay: "Level four! Naming words!", items: mapAll(some(WORDS, 5), nounItem) }]; } },
      { name: "Where Does It Go?", art: "hat",
        make: function () { return [{ banner: "Level 5", bannerSay: "Level five! Where does it go?", items: mapAll(WHERE, whereItem) }]; } },
      { name: "Super Star", art: "trophy",
        make: function () {
          return [{ banner: "Level 6", bannerSay: "Level six! Super star challenge!",
            items: mapAll(some(WORDS, 2), function (w) { return findItem(w, 3); }).concat(
              mapAll(some(["head", "eyes", "mouth", "chest", "arm", "hand", "leg", "foot"], 2), pointItem),
              mapAll(some(WORDS, 2), nounItem)) }];
        } }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02NAMEBODY",
    version: "v-02",
    title: "Name the Body Part",
    intro: "Let's name the parts of the body!",
    theme: "rainbow",
    buddy: "asma",
    heroArt: "hand",
    levels: CONTENT.levels,
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: TapIdentify.max
  });
})();
