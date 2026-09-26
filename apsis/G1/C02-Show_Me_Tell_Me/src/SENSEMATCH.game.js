// @asset ENG01CH02SENSEMATCH
// @version v-03
// @title Sense and Body Part
// @engine match
/* A14 · Sense and Body Part · Reading and Comprehension > Our Senses(Reading and Comprehension) · O8

   Book, verbatim:
   - p.34 2F (reading text): We see things with our eyes. We hear with our ears.
     We smell with our nose. We taste with our tongue. We touch and feel things
     with our hands. (Level 2 gaps the last word; every correct match in every
     level says the book sentence.)
   - p.38 2I B4: stroke a pet -> touch, sniff a flower -> smell, eat an ice cream
     -> taste. "play in the playground" is withheld: several senses fit.
   Beyond the book (authored, needs Champ's approval): look at the moon (see),
   listen to a drum (hear), eat a banana (taste), hug a teddy (touch),
   sniff the soap (smell). Each uses one sense most clearly. */
(function () {
  var SENSES = [
    { sense: "see", part: "eyes", art: "eyes", book: "We see things with our eyes." },
    { sense: "hear", part: "ears", art: "ears", book: "We hear with our ears." },
    { sense: "smell", part: "nose", art: "nose", book: "We smell with our nose." },
    { sense: "taste", part: "tongue", art: "tongue", book: "We taste with our tongue." },
    { sense: "touch", part: "hands", art: "hand", book: "We touch and feel things with our hands." }
  ];
  var BY = {};
  var i;
  for (i = 0; i < SENSES.length; i++) { BY[SENSES[i].sense] = SENSES[i]; }

  var BOOK_ACTS = [
    { act: "stroke a pet", art: "pet", sense: "touch" },
    { act: "sniff a flower", art: "flower", sense: "smell" },
    { act: "eat an ice cream", art: "icecream", sense: "taste" }
  ];
  var NEW_ACTS = [
    { act: "look at the moon", art: "moon", sense: "see" },
    { act: "listen to a drum", art: "drum", sense: "hear" },
    { act: "eat a banana", art: "banana", sense: "taste" },
    { act: "hug a teddy", art: "toys", sense: "touch" },
    { act: "sniff the soap", art: "soap", sense: "smell" }
  ];

  /* withArt: a small body-part picture on the chip (a clue for activities; never on
     sense-to-body-part screens, where it would give the answer away) */
  function senseChip(s, goes, withArt) { return { text: s.sense, art: withArt ? s.art : null, goes: goes }; }
  function partTarget(s) { return { id: s.sense, art: s.art, cap: s.part, done: s.book }; }
  function otherSenses(not, n) {
    var list = [], k;
    for (k = 0; k < SENSES.length; k++) { if (SENSES[k].sense !== not) { list.push(SENSES[k]); } }
    return Shell.shuffle(list).slice(0, n);
  }

  /* n senses: drag each sense word to its body part */
  function pairsScreen(list) {
    var s = { text: "Match each sense to its body part.", say: "Can you match each sense to its body part?", targets: [], chips: [] }, k;
    for (k = 0; k < list.length; k++) { s.targets.push(partTarget(list[k])); s.chips.push(senseChip(list[k], list[k].sense)); }
    return s;
  }
  /* book sentence with a gap: pick the body part */
  function sentenceScreen(s) {
    var gap = s.book.replace(new RegExp(s.part + "\\.$"), "___."), others = otherSenses(s.sense, 2), k;
    var scr = { text: "Which body part?", say: ["Listen.", gap.replace("___", "..."), "Which body part?"],
      targets: [{ id: "gap", cap: gap, say: gap.replace("___", "..."), done: s.book }],
      chips: [{ text: s.part, art: s.art, goes: "gap" }] };
    for (k = 0; k < others.length; k++) { scr.chips.push({ text: others[k].part, art: others[k].art }); }
    return scr;
  }
  /* one activity: which sense does it use? */
  function actScreen(a) {
    var s = BY[a.sense], others = otherSenses(a.sense, 2), k;
    var scr = { text: "Which sense do we use?", say: ["Which sense do we use to", a.act],
      targets: [{ id: "act", art: a.art, cap: a.act, done: [capital(a.act) + "!", s.book] }],
      chips: [senseChip(s, "act", true)] };
    for (k = 0; k < others.length; k++) { scr.chips.push(senseChip(others[k], null, true)); }
    return scr;
  }
  /* several activities at once, each with a different sense */
  function actsScreen(list) {
    var scr = { text: "Match each sense to what we do.", say: "Can you match each sense to what we do?", targets: [], chips: [] }, k;
    for (k = 0; k < list.length; k++) {
      scr.targets.push({ id: list[k].sense, art: list[k].art, cap: list[k].act, done: [capital(list[k].act) + "!", BY[list[k].sense].book] });
      scr.chips.push(senseChip(BY[list[k].sense], list[k].sense, true));
    }
    return scr;
  }
  function capital(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function distinctActs(n) {
    var all = Shell.shuffle(BOOK_ACTS.concat(NEW_ACTS)), used = {}, out = [], k;
    for (k = 0; k < all.length && out.length < n; k++) { if (!used[all[k].sense]) { used[all[k].sense] = 1; out.push(all[k]); } }
    return out;
  }

  var CONTENT = {
    levels: [
      { name: "Warm Up", art: "eyes",
        make: function () {
          var s = Shell.shuffle(SENSES);
          return [{ banner: "Level 1", bannerSay: "Level one! Let's warm up!",
            items: [pairsScreen([s[0], s[1]]), pairsScreen([s[2], s[3]]), pairsScreen([s[4], s[0]])] }];
        } },
      { name: "Our Senses", art: "ears", ribbon: "Book",
        make: function () {
          var out = [], k;
          for (k = 0; k < SENSES.length; k++) { out.push(sentenceScreen(SENSES[k])); }
          return [{ banner: "Level 2", bannerSay: "Level two! Our senses, from your book!", items: out }];
        } },
      { name: "Which Sense?", art: "flower", ribbon: "Book",
        make: function () {
          var acts = BOOK_ACTS.concat(Shell.shuffle(NEW_ACTS).slice(0, 2)), out = [], k;
          for (k = 0; k < acts.length; k++) { out.push(actScreen(acts[k])); }
          return [{ banner: "Level 3", bannerSay: "Level three! Which sense do we use?", items: out }];
        } },
      { name: "Match Three", art: "nose",
        make: function () {
          var s = Shell.shuffle(SENSES);
          return [{ banner: "Level 4", bannerSay: "Level four! Match three!", items: [pairsScreen(s.slice(0, 3)), pairsScreen([s[3], s[4], s[0]])] }];
        } },
      { name: "Mix It Up", art: "icecream",
        make: function () {
          return [{ banner: "Level 5", bannerSay: "Level five! Mix it up!", items: [actsScreen(distinctActs(3)), actsScreen(distinctActs(3))] }];
        } },
      { name: "Super Senses", art: "trophy",
        make: function () {
          return [{ banner: "Level 6", bannerSay: "Level six! All five senses!", shuffle: false,
            items: [pairsScreen(SENSES.slice()), actsScreen(distinctActs(3))] }];
        } }
    ]
  };

  Match.init(CONTENT);
  Shell.boot({
    asset: "ENG01CH02SENSEMATCH",
    version: "v-03",
    title: "Sense and Body Part",
    intro: "Match each sense to its body part.",
    theme: "garden",
    buddy: "kid",
    heroArt: "flower",
    levels: CONTENT.levels,
    start: Match.start,
    resume: Match.resume,
    score: function () { return Match.score || 0; },
    max: Match.max
  });
})();
