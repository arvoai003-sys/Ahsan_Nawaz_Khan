// @asset ENG01CH02DOING
// @version v-01
// @title Doing Words
// @engine tap-identify
/* A20 · Doing Words · Grammar and Vocabulary > Verbs · O12

   Book, verbatim:
   - p.40 2J word box: run, jump, sing, dance, skip, play football.
   - p.40 Language tip: "Doing words are called verbs." (Level 4 and banners)
   Beyond the book (authored): more doing words a six-year-old does every day
   (clap, wave, read, sleep, eat, drink), naming words (nouns from this
   chapter) as the "not a doing word" choices, and "What is she/he doing?"
   written as "What is the child doing?" so no name or gender is needed.
   Pictures: the same happy child as the game buddy, posed for each action. */
(function () {
  /* ---------- the child, posed (drawing is 120 x 200; pictures are square) ---------- */
  var INK = "#2E2A4F", SKIN = "#FBD9C4";
  var KID = Buddy.kidInner();
  var SHADOW = KID.slice(0, KID.indexOf('<g class="b-all">'));
  var BODY = KID.slice(KID.indexOf('<g class="b-all">'));
  var ARM_L = BODY.match(/<g class="b-arm b-arm-l">[\s\S]*?<\/g>/)[0];
  var ARM_R = BODY.match(/<g class="b-arm b-arm-r">[\s\S]*?<\/g>/)[0];
  var LEGS = BODY.slice(BODY.indexOf('<path d="M45 148'), BODY.indexOf('<g class="b-arm b-arm-l">'));
  var EYES = BODY.match(/<g class="b-eyes">[\s\S]*?<\/g>/)[0];
  var SMILE = BODY.match(/<path class="b-smile"[^>]*\/>/)[0];

  function leg(h, k, a, flip) {
    var d = "M" + h + "L" + k + "L" + a;
    var ax = +a.split(" ")[0], ay = +a.split(" ")[1];
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + SKIN + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="' + (ax + (flip ? -4 : 4)) + '" cy="' + (ay + 5) + '" rx="11" ry="6" fill="#FF3B3B" stroke="' + INK + '" stroke-width="3"/>';
  }
  var STAND = [["50 148", "50 166", "50 182"], ["70 148", "70 166", "70 182", 1]];
  function arm(g, deg, cx) { return deg ? g.replace('">', '" transform="rotate(' + deg + " " + cx + ' 100)">') : g; }

  /* o: { armL, armR (degrees), front (arms over the T-shirt), legs, tilt, lift,
          eyes: "closed", mouth: "open", back, over (extra drawing behind / in front) } */
  function pose(o) {
    var legs = o.legs ? leg.apply(null, o.legs[0]) + leg.apply(null, o.legs[1]) : leg.apply(null, STAND[0]) + leg.apply(null, STAND[1]);
    var aL = arm(ARM_L, o.armL, 36), aR = arm(ARM_R, o.armR, 84);
    var body = BODY.replace(LEGS, legs).replace(ARM_L, o.front ? "" : aL).replace(ARM_R, o.front ? "" : aR);
    if (o.front) { body = body.replace('<g class="b-head">', aL + aR + '<g class="b-head">'); }
    if (o.eyes === "closed") {
      body = body.replace(EYES, '<path d="M43 58q6 5 12 0M65 58q6 5 12 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>');
    }
    if (o.mouth === "open") {
      body = body.replace(SMILE, '<ellipse cx="60" cy="73" rx="6.5" ry="6" fill="#7A1F3D" stroke="' + INK + '" stroke-width="2.4"/>');
    }
    var t = "translate(0 " + (-(o.lift || 0)) + ") rotate(" + (o.tilt || 0) + " 60 190)";
    return (o.back || "") + SHADOW + '<g transform="' + t + '">' + body + "</g>" + (o.over || "");
  }
  function note(x, y, c) {
    return '<g transform="translate(' + x + " " + y + ')"><path d="M8 0v18" stroke="' + INK + '" stroke-width="3"/><path d="M8 0l10 4v6L8 6z" fill="' + INK + '"/>' +
      '<ellipse cx="4" cy="19" rx="6" ry="4.5" fill="' + c + '" stroke="' + INK + '" stroke-width="2.5"/></g>';
  }
  function lines(d) { return '<path d="' + d + '" fill="none" stroke="#2EA7FF" stroke-width="4" stroke-linecap="round"/>'; }
  function spark(x, y, c) { return '<path d="M' + x + " " + (y - 8) + "l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" + '" fill="' + c + '"/>'; }
  var BALL = function (x, y) {
    return '<circle cx="' + x + '" cy="' + y + '" r="12" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M' + x + " " + (y - 5) + "l5 3.5-2 6h-6l-2-6z" + '" fill="' + INK + '"/>';
  };

  var POSES = {
    run: pose({ armL: 55, armR: 35, tilt: 8, legs: [["52 148", "38 160", "26 170"], ["68 148", "84 162", "82 182", 1]],
      back: lines("M-10 90h22M-16 110h24M-8 130h18") + '<circle cx="14" cy="186" r="6" fill="#E3D4C4"/><circle cx="4" cy="190" r="4" fill="#E3D4C4"/>' }),
    jump: pose({ armL: 129, armR: -129, lift: 24, legs: [["50 148", "40 162", "48 176"], ["70 148", "80 162", "72 176", 1]],
      over: lines("M36 198q24 8 48 0M44 206q16 5 32 0") }),
    sing: pose({ mouth: "open", armL: 20, armR: -20, over: note(90, 30, "#FF4F6D") + note(8, 44, "#2EA7FF") + note(100, 70, "#FFD23F") }),
    dance: pose({ armL: 118, armR: -95, tilt: -6, legs: [["50 148", "50 166", "50 182"], ["70 148", "86 158", "84 176", 1]],
      over: note(98, 26, "#9B5DE5") + note(0, 36, "#FF4F6D") + spark(104, 120, "#FFD23F") + spark(6, 120, "#FF7BAC") }),
    skip: pose({ armL: 45, armR: -45, lift: 10, legs: [["50 148", "46 164", "50 178"], ["70 148", "74 164", "70 178", 1]],
      back: '<path d="M4 124C-10 60 130 60 116 124" fill="none" stroke="#FF7BAC" stroke-width="4"/>',
      over: '<path d="M4 124C0 220 120 220 116 124" fill="none" stroke="#FF7BAC" stroke-width="4"/>' +
        '<rect x="-2" y="116" width="10" height="16" rx="4" fill="#FFD23F" stroke="' + INK + '" stroke-width="2.5"/><rect x="112" y="116" width="10" height="16" rx="4" fill="#FFD23F" stroke="' + INK + '" stroke-width="2.5"/>' }),
    football: pose({ armL: 50, armR: -60, legs: [["50 148", "48 166", "48 182"], ["70 148", "90 160", "106 164", 1]],
      over: BALL(126, 160) + lines("M144 148h10M146 160h12M144 172h10") }),
    clap: pose({ armL: -74, armR: 74, front: true, over: lines("M60 102v-7M49 106l-6-4M71 106l6-4") }),
    wave: pose({ armR: -128, over: lines("M116 50q8 6 6 16M124 44q12 10 8 26") }),
    read: pose({ armL: -60, armR: 60, front: true,
      over: '<path d="M60 112c-8-4-20-5-28-2v28c8-3 20-2 28 2zM60 112c8-4 20-5 28-2v28c-8-3-20-2-28 2z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M38 118h16M38 124h16M66 118h16M66 124h16" stroke="#9B5DE5" stroke-width="2"/>' }),
    sleep: pose({ eyes: "closed", armL: -60, armR: 60, front: true,
      over: '<ellipse cx="60" cy="126" rx="18" ry="16" fill="#C98A5A" stroke="' + INK + '" stroke-width="3"/><circle cx="48" cy="110" r="7" fill="#C98A5A" stroke="' + INK + '" stroke-width="3"/><circle cx="72" cy="110" r="7" fill="#C98A5A" stroke="' + INK + '" stroke-width="3"/>' +
        '<text x="92" y="30" font-family="Arial Black, Arial" font-weight="900" font-size="20" fill="#9B5DE5">Z</text><text x="108" y="14" font-family="Arial Black, Arial" font-weight="900" font-size="14" fill="#9B5DE5">z</text><text x="120" y="2" font-family="Arial Black, Arial" font-weight="900" font-size="10" fill="#9B5DE5">z</text>' }),
    eat: pose({ mouth: "open", armR: 150, front: true,
      over: '<path d="M68 74c10-14 26-16 34-10-6-2-18 4-26 16z" fill="#FFD23F" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' }),
    drink: pose({ armR: 150, front: true,
      over: '<path d="M64 60h18l-2 26H66z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M65.5 70h15l-1 15h-13z" fill="#CDEBFF"/>' })
  };
  var k;
  for (k in POSES) { if (POSES.hasOwnProperty(k)) { Art.addBox("do_" + k, "-45 -12 210 214", POSES[k]); } }

  var BOOK = ["run", "jump", "sing", "dance", "skip", "play football"];
  var MORE = ["clap", "wave", "read", "sleep", "eat", "drink"];
  var ALL = BOOK.concat(MORE);
  var ART = { "play football": "do_football" };
  function art(v) { return ART[v] || "do_" + v; }
  /* naming words from this chapter: never doing words here */
  var NOUNS = ["book", "sign", "hand", "nose", "tree", "hat", "bag", "leg"];
  var ING = { run: "running", jump: "jumping", sing: "singing", dance: "dancing", skip: "skipping", "play football": "playing football",
    clap: "clapping", wave: "waving", read: "reading", sleep: "sleeping", eat: "eating", drink: "drinking" };
  var TIP = "Doing words are called verbs.";

  function some(list, n) { return Shell.shuffle(list).slice(0, n); }
  function many(fn, list) { var out = [], i; for (i = 0; i < list.length; i++) { out.push(fn(list[i])); } return out; }
  function others(v, n, pool) {
    var out = [], i;
    for (i = 0; i < pool.length; i++) { if (pool[i] !== v) { out.push(pool[i]); } }
    return some(out, n);
  }
  function pic(v) { return { text: v, art: art(v), label: v + " picture", hideWord: true, noBadge: true }; }
  function word(v) { return { text: v }; }
  function capital(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  /* hear a doing word, tap the picture */
  function showItem(v, n, pool) {
    return { text: "Tap: <b>" + v + "</b>", say: ["Can you find", v], options: [pic(v)].concat(many(pic, others(v, n - 1, pool))),
      answer: [v], done: [capital(v) + "!"], hint2: ["Look carefully."] };
  }
  /* see a picture, tap the word */
  function whatItem(v, pool) {
    return { text: "What is the child doing?", say: "What is the child doing?",
      target: { text: art(v), art: art(v), label: v + " picture", hideWord: true, noBadge: true },
      options: [word(v)].concat(many(word, others(v, 2, pool))), answer: [v], done: ["The child is " + ING[v] + "!"] };
  }
  /* the language tip: which word is a doing word? */
  function verbItem(v) {
    var n = some(NOUNS, 2);
    return { text: "Which word is a <b>doing word</b>?", say: [TIP, "Which word is a doing word?"],
      options: [word(v), word(n[0]), word(n[1])], answer: [v], done: [capital(v) + " is a doing word!"],
      hint2: ["Which word tells us what someone does?"] };
  }

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "do_jump",
        make: function () { return [{ banner: "Level 1", bannerSay: "Level one! Let's warm up! " + TIP, items: many(function (v) { return showItem(v, 2, BOOK); }, some(BOOK, 5)) }]; } },
      { name: "Book Words", art: "do_run", ribbon: "Book",
        make: function () { return [{ banner: "Level 2", bannerSay: "Level two! Doing words from your book!", items: many(function (v) { return showItem(v, 3, BOOK); }, BOOK.slice()) }]; } },
      { name: "What Is the Child Doing?", art: "do_dance", ribbon: "Book",
        make: function () { return [{ banner: "Level 3", bannerSay: "Level three! What is the child doing?", items: many(function (v) { return whatItem(v, BOOK); }, some(BOOK, 5)) }]; } },
      { name: "Doing or Naming?", art: "do_skip", ribbon: "Book",
        make: function () { return [{ banner: "Level 4", bannerSay: "Level four! " + TIP, items: many(verbItem, some(BOOK, 5)) }]; } },
      { name: "More Doing Words", art: "do_wave",
        make: function () {
          var list = some(MORE, 6);
          return [{ banner: "Level 5", bannerSay: "Level five! More doing words!",
            items: many(function (v) { return showItem(v, 3, MORE); }, list.slice(0, 3)).concat(many(function (v) { return whatItem(v, MORE); }, list.slice(3))) }];
        } },
      { name: "Super Star", art: "trophy",
        make: function () {
          var s = Shell.shuffle(ALL);
          return [{ banner: "Level 6", bannerSay: "Level six! Super star challenge!",
            items: [showItem(s[0], 3, ALL), showItem(s[1], 3, ALL), whatItem(s[2], ALL), whatItem(s[3], ALL), verbItem(s[4]), verbItem(s[5])] }];
        } }
    ]
  };

  TapIdentify.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02DOING",
    version: "v-01",
    title: "Doing Words",
    intro: TIP,
    theme: "park",
    buddy: "kid",
    heroArt: "do_jump",
    levels: CONTENT.levels,
    start: TapIdentify.start,
    resume: TapIdentify.resume,
    score: function () { return TapIdentify.score || 0; },
    max: TapIdentify.max
  });
})();
