/* ARVO Grade 1 shell: audio, speech, feedback, pause menu, tutorial hand,
   progress, stars and the LMS result contract. ES5 only. */
var Shell = (function () {
  var S = {};
  var soundOn = true;
  var ctx = null;
  var voice = null;
  var cfg = {};
  var wrongTaps = 0;
  var resultSent = false;

  function $(id) { return document.getElementById(id); }
  S.$ = $;

  /* ---------- helpers ---------- */
  S.shuffle = function (arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  S.el = function (tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (html !== undefined) { e.innerHTML = html; }
    return e;
  };
  S.later = function (fn, ms) { return window.setTimeout(fn, ms); };

  /* ---------- Web Audio ---------- */
  var musicOn = true;
  function audio() {
    if (!ctx) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) { ctx = new AC(); }
      } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch (e2) {} }
    return ctx;
  }
  S.audio = audio;
  /* one soft mallet note (marimba-like: sine + quiet octave, fast decay) */
  function note(freq, start, dur, vol, type, dest) {
    var c = audio();
    if (!c || !soundOn) { return; }
    var t = c.currentTime + start, o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o.type = type || "sine"; o.frequency.value = freq;
    o2.type = "sine"; o2.frequency.value = freq * 4;
    var g2 = c.createGain(); g2.gain.value = 0.12;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(dest || c.destination);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function slide(f1, f2, start, dur, vol) {
    var c = audio();
    if (!c || !soundOn) { return; }
    var t = c.currentTime + start, o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(f1, t);
    o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.14, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  S.sfx = {
    /* xylophone run up + sparkle */
    right: function () {
      note(784, 0, 0.25, 0.18); note(988, 0.07, 0.25, 0.18); note(1175, 0.14, 0.3, 0.18); note(1568, 0.21, 0.5, 0.16);
      note(2093, 0.3, 0.35, 0.06); note(2637, 0.36, 0.3, 0.05);
    },
    /* soft "boing": friendly, never harsh */
    wrong: function () { slide(420, 180, 0, 0.35, 0.12); slide(300, 150, 0.12, 0.3, 0.06); },
    pop: function () { slide(500, 900, 0, 0.09, 0.12); },
    whoosh: function () { slide(300, 1200, 0, 0.25, 0.05); },
    star: function () { note(1319, 0, 0.3, 0.1); note(1760, 0.08, 0.4, 0.08); },
    /* level-complete jingle */
    fanfare: function () {
      var m = [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.4], [988, 0.62], [1047, 0.74], [1319, 0.9]], i;
      for (i = 0; i < m.length; i++) { note(m[i][0], m[i][1], 0.4, 0.16, "triangle"); }
      note(523, 0.9, 0.9, 0.1); note(659, 0.9, 0.9, 0.08); note(784, 0.9, 0.9, 0.08);
    }
  };

  /* ---------- background tune: a short, bouncy loop, quiet under the voice ---------- */
  var music = { gain: null, timer: null, step: 0 };
  /* C  G  Am  F, two bars each; melody in C major pentatonic */
  var CHORDS = [[262, 330, 392], [196, 247, 294], [220, 262, 330], [175, 220, 262]];
  var MELODY = [659, 784, 880, 784, 659, 523, 587, 659, 587, 523, 440, 523, 587, 659, 523, 0,
                659, 784, 880, 1047, 880, 784, 659, 587, 523, 587, 659, 784, 659, 587, 523, 0];
  function musicTick() {
    var c = audio();
    if (!c || !music.gain) { return; }
    var i = music.step % 32, bar = Math.floor(i / 4) % 4, beat = 0.27;
    if (i % 4 === 0) {
      var ch = CHORDS[bar], k;
      for (k = 0; k < ch.length; k++) { note(ch[k], 0, 0.9, 0.09, "sine", music.gain); }
      note(ch[0] / 2, 0, 0.5, 0.12, "sine", music.gain);
    }
    if (i % 2 === 1) { note(CHORDS[bar][2] * 2, 0, 0.12, 0.03, "square", music.gain); }
    if (MELODY[i]) { note(MELODY[i], 0, 0.35, 0.12, "triangle", music.gain); }
    music.step++;
    music.timer = window.setTimeout(musicTick, beat * 1000);
  }
  S.musicStart = function () {
    var c = audio();
    if (!c || !musicOn || !soundOn || music.timer) { return; }
    music.gain = c.createGain();
    music.gain.gain.value = 0.35;
    music.gain.connect(c.destination);
    music.step = 0;
    musicTick();
  };
  S.musicStop = function () {
    if (music.timer) { window.clearTimeout(music.timer); music.timer = null; }
    if (music.gain) { try { music.gain.disconnect(); } catch (e) {} music.gain = null; }
  };
  function duck(down) {
    var c = audio();
    if (!c || !music.gain) { return; }
    try {
      music.gain.gain.cancelScheduledValues(c.currentTime);
      music.gain.gain.setTargetAtTime(down ? 0.1 : 0.35, c.currentTime, 0.15);
    } catch (e) {}
  }
  S.setMusic = function (on) { musicOn = on; if (on) { S.musicStart(); } else { S.musicStop(); } };
  S.musicIsOn = function () { return musicOn; };

  /* ---------- voice ----------
     1. Recorded clips win: VOICE_CLIPS[key] (data URI), key = S.clipKey(text).
        Record these with a Pakistani voice; tools/voice_lines.js lists them.
     2. Otherwise the device voice: English (Pakistan) first, then English (India),
        preferring female and natural/neural voices; softer pitch, warm pace. */
  var VOICE_SCORE = [
    [/en[-_]PK/i, 100], [/en[-_]IN/i, 70], [/en[-_]GB/i, 20], [/^en/i, 10]
  ];
  var FEMALE = /female|woman|girl|heera|neerja|swara|kajal|aditi|raveena|uzma|zira|sonia|libby|hazel|susan|samantha|karen|moira|tessa|veena|fiona|jenny|aria|emma|ava|salli|joanna|kimberly|ivy/i;
  var MALE = /\bmale\b|ravi|prabhat|hemant|asad|david|george|daniel|mark|james|alex|fred|ryan|guy|thomas|oliver|arthur|rishi/i;
  var NATURAL = /natural|neural|online|enhanced|premium|wavenet/i;
  function pickVoice() {
    if (!window.speechSynthesis) { return; }
    var vs = window.speechSynthesis.getVoices() || [], best = null, bestScore = -1, i, j, v, sc, lang;
    for (i = 0; i < vs.length; i++) {
      v = vs[i]; lang = (v.lang || "").replace("_", "-"); sc = 0;
      for (j = 0; j < VOICE_SCORE.length; j++) { if (VOICE_SCORE[j][0].test(lang)) { sc = VOICE_SCORE[j][1]; break; } }
      if (!sc) { continue; }
      if (FEMALE.test(v.name)) { sc += 25; } else if (MALE.test(v.name)) { sc -= 15; }
      if (NATURAL.test(v.name)) { sc += 20; }
      if (/google/i.test(v.name)) { sc += 5; }
      if (sc > bestScore) { bestScore = sc; best = v; }
    }
    voice = best || vs[0] || null;
  }
  if (window.speechSynthesis) {
    pickVoice();
    try { window.speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}
  }
  /* every fixed line the shell can say (tools/voice_lines.js reads this) */
  S.LINES = ["Yay! Three stars! You are a star!", "Well done!", "Choose a level!",
    "You finished level 1!", "You finished level 2!", "You finished level 3!",
    "You finished level 4!", "You finished level 5!", "You finished level 6!"];
  S.voiceName = function () { return voice ? voice.name + " (" + voice.lang + ")" : "none"; };

  S.clipKey = function (text) {
    return String(text).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };
  var clipPlayer = null;
  function playClip(uri, done) {
    try {
      if (!clipPlayer) { clipPlayer = new window.Audio(); }
      clipPlayer.onended = done; clipPlayer.onerror = done;
      clipPlayer.src = uri;
      var p = clipPlayer.play();
      if (p && p["catch"]) { p["catch"](done); }
    } catch (e) { done(); }
  }
  function speakOne(text, done) {
    if (!text) { done(); return; }
    var clips = window.VOICE_CLIPS || {}, key = S.clipKey(text);
    if (clips[key]) { playClip(clips[key], done); return; }
    var guess = 700 + String(text).split(" ").length * 420;
    if (!window.speechSynthesis) { S.later(done, guess); return; }
    try {
      var u = new window.SpeechSynthesisUtterance(String(text).replace(/<[^>]+>/g, ""));
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-IN"; }
      u.rate = 0.88; u.pitch = 1.2; u.volume = 0.9;
      u.onend = done; u.onerror = done;
      window.speechSynthesis.speak(u);
      S.later(done, guess + 2500); /* safety net: some engines never fire onend */
    } catch (e) { S.later(done, guess); }
  }
  /* say(text or [parts], done): speaks in order; cancels anything already speaking.
     Parts let a line be built from recorded pieces, e.g. ["Which word starts like", "sun"].
     done() always runs once. */
  var sayId = 0;
  S.say = function (text, done) {
    var parts = (Object.prototype.toString.call(text) === "[object Array]") ? text : [text];
    var my = ++sayId, i = 0, finished = false;
    function end() { if (!finished) { finished = true; duck(false); if (done) { done(); } } }
    S.hush(true);
    if (!soundOn) { S.later(end, 300); return; }
    duck(true);
    function next() {
      if (my !== sayId) { end(); return; }
      if (i >= parts.length) { end(); return; }
      var once = false;
      speakOne(parts[i++], function () { if (!once) { once = true; next(); } });
    }
    next();
  };
  S.hush = function (keepId) {
    if (!keepId) { sayId++; }
    try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); } } catch (e) {}
    try { if (clipPlayer) { clipPlayer.pause(); } } catch (e2) {}
  };

  /* ---------- icons ---------- */
  S.icon = {
    speaker: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="#213547"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC845" stroke="#2E2A4F" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    starOff: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFFFFF" stroke="#2E2A4F" stroke-width="1.6" opacity=".7" stroke-linejoin="round"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M9 18V6l11-2v12" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="18" r="3" fill="#fff"/><circle cx="17.5" cy="16" r="3" fill="#fff"/></svg>',
    homeDark: '<svg viewBox="0 0 100 100"><path d="M16 48L50 18l34 30" fill="none" stroke="#2E2A4F" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M26 44v36h48V44" fill="none" stroke="#2E2A4F" stroke-width="10" stroke-linejoin="round"/></svg>',
    hand: '<svg viewBox="0 0 64 64"><path d="M26 6c3 0 5 2 5 5v18l2-1c2-1 5 0 6 2l1 1c2-1 5 0 6 2 2-1 5 0 6 3l2 12c1 7-4 14-11 14H33c-5 0-9-3-11-7l-8-15c-1-3 0-5 3-6 2-1 4 0 6 2l3 4V11c0-3 0-5 0-5z" fill="#FFE0C2" stroke="#2E2A4F" stroke-width="3" stroke-linejoin="round"/></svg>',
  };
  S.speakerBtn = function (cls, label) {
    var b = S.el("button", "icon-btn talk " + (cls || ""), S.icon.speaker);
    b.setAttribute("aria-label", label || "Listen");
    b.setAttribute("type", "button");
    return b;
  };

  /* ---------- confetti ---------- */
  var cv, cx2, bits = [], running = false;
  function confettiLoop() {
    var i, b, alive = 0;
    cx2.clearRect(0, 0, cv.width, cv.height);
    for (i = 0; i < bits.length; i++) {
      b = bits[i];
      if (b.life <= 0) { continue; }
      alive++;
      b.x += b.vx; b.y += b.vy; b.vy += 0.35; b.vx *= 0.99; b.r += b.vr; b.life--;
      cx2.save(); cx2.translate(b.x, b.y); cx2.rotate(b.r);
      cx2.fillStyle = b.c; cx2.fillRect(-b.s / 2, -b.s / 3, b.s, b.s / 1.6);
      cx2.restore();
    }
    if (alive) { window.requestAnimationFrame(confettiLoop); } else { running = false; bits = []; cx2.clearRect(0, 0, cv.width, cv.height); }
  }
  S.confetti = function (x, y, n) {
    if (!cv) { return; }
    cv.width = window.innerWidth; cv.height = window.innerHeight;
    var cols = ["#FFD23F", "#FF4F6D", "#2EA7FF", "#23C16B", "#FF9F1C", "#9B5DE5"], i, a, sp;
    for (i = 0; i < (n || 40); i++) {
      a = Math.random() * Math.PI * 2; sp = 4 + Math.random() * 8;
      bits.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4, s: 8 + Math.random() * 8, c: cols[i % cols.length], life: 70 + Math.random() * 30 });
    }
    if (!running) { running = true; window.requestAnimationFrame(confettiLoop); }
  };

  /* ---------- praise ---------- */
  var praises = ["Yay!", "Super!", "Well done!", "Wow!", "You got it!", "Hooray!", "Great job!"];
  S.LINES = (S.LINES || []).concat(praises);
  S.praise = function () {
    var p = $("praise"), w = praises[Math.floor(Math.random() * praises.length)];
    p.innerHTML = w; p.className = "praise"; void p.offsetWidth; p.className = "praise on";
    S.later(function () { p.className = "praise"; }, 1000);
    return w;
  };

  /* ---------- feedback on an element ---------- */
  S.flash = function (node, cls, ms) {
    node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls);
    S.later(function () { node.classList.remove(cls); }, ms || 1000);
  };
  S.centre = function (node) {
    var r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  S.right = function (node) {
    S.sfx.right();
    var c = S.centre(node);
    S.confetti(c.x, c.y, 36);
    return S.praise();
  };
  S.wrong = function (node) {
    wrongTaps++;
    S.sfx.wrong();
    if (node) { S.flash(node, "shake", 500); }
  };
  S.wrongCount = function () { return wrongTaps; };

  /* ---------- tutorial hand ---------- */
  /* points: [{node, say}] ; moves the hand from one to the next, tapping at each. */
  S.tutorial = function (points, done) {
    var h = $("hand"), i = 0;
    h.className = "hand on";
    var first = S.centre(points[0].node);
    h.style.left = (first.x - 10) + "px"; h.style.top = (window.innerHeight + 20) + "px";
    var step = S.guard(function () {
      if (i >= points.length) { S.later(function () { h.className = "hand"; if (done) { done(); } }, 300); return; }
      var p = points[i], c = S.centre(p.node);
      h.className = "hand on";
      h.style.left = (c.x - 14) + "px"; h.style.top = (c.y - 6) + "px";
      S.later(function () {
        h.className = "hand on tap";
        S.say(p.say, function () { i++; S.later(step, 250); });
      }, 950);
    });
    S.later(step, 60);
  };

  /* ---------- progress dots ---------- */
  S.progress = function (total, doneCount) {
    var box = $("progress"), i, h = "";
    for (i = 0; i < total; i++) {
      h += '<i class="' + (i < doneCount ? "done" : (i === doneCount ? "now" : "")) + '"></i>';
    }
    box.innerHTML = h;
  };
  S.setStars = function (n) { $("star-num").innerHTML = String(n); };

  /* ---------- banner ---------- */
  S.banner = function (text, spoken, done) {
    var b = $("banner");
    b.innerHTML = "<div>" + text + "</div>";
    b.className = "banner on";
    S.say(spoken || text, function () {
      S.later(function () { b.className = "banner"; if (done) { done(); } }, 250);
    });
  };

  /* ---------- screens ---------- */
  S.show = function (id) {
    var list = document.querySelectorAll(".screen"), i;
    for (i = 0; i < list.length; i++) { list[i].className = "screen" + (list[i].id === id ? " on" : ""); }
  };

  /* ---------- stars + result contract ---------- */
  var level = 0;
  function storeKey(i) { return "arvo:" + cfg.asset + ":L" + (i + 1); }
  S.level = function () { return level; };
  S.starsFor = function (wrong) { return wrong === 0 ? 3 : (wrong <= 2 ? 2 : 1); };
  S.sendResult = function (r) {
    if (resultSent) { return; }
    resultSent = true;
    r.asset = cfg.asset; r.version = cfg.version; r.level = level + 1;
    try { window.parent.postMessage({ type: "arvo-asset-result", result: r }, "*"); } catch (e) {}
    try {
      if (r.completed) {
        var key = storeKey(level), old = JSON.parse(window.localStorage.getItem(key) || "{}");
        if (!old.stars || r.stars > old.stars) { window.localStorage.setItem(key, JSON.stringify({ stars: r.stars })); }
      }
    } catch (e2) {}
    S.lastResult = r;
  };
  S.bestStars = function (i) {
    try { return (JSON.parse(window.localStorage.getItem(storeKey(i)) || "{}").stars) || 0; } catch (e) { return 0; }
  };

  function starRow(n, lit) {
    var h = "", i;
    for (i = 0; i < n; i++) { h += i < lit ? S.icon.star : S.icon.starOff; }
    return h;
  }

  S.finish = function (score, max) {
    var stars = S.starsFor(wrongTaps), i, h = "";
    S.sendResult({ completed: true, score: score, max: max, stars: stars });
    for (i = 0; i < 3; i++) { h += i < stars ? S.icon.star.replace("<svg", '<svg class="lit"') : S.icon.starOff; }
    $("end-stars").innerHTML = h;
    $("end-title").innerHTML = stars === 3 ? "Amazing!" : "Well done!";
    $("end-sub").innerHTML = "Level " + (level + 1) + ": " + cfg.levels[level].name;
    $("next-btn").style.display = level < cfg.levels.length - 1 ? "" : "none";
    S.show("end");
    S.sfx.fanfare();
    S.confetti(window.innerWidth / 2, window.innerHeight / 3, 140);
    S.say(stars === 3 ? "Yay! Three stars! You are a star!" : ["Well done!", "You finished level " + (level + 1) + "!"]);
  };

  /* ---------- home: level picker ---------- */
  function renderHome() {
    var box = $("levels"), i, L, tile;
    box.innerHTML = "";
    for (i = 0; i < cfg.levels.length; i++) {
      L = cfg.levels[i];
      tile = S.el("div", "level c" + (i % 6));
      tile.setAttribute("role", "button");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("aria-label", "Level " + (i + 1) + ": " + L.name);
      tile.innerHTML = '<span class="num">' + (i + 1) + "</span>" +
        (L.ribbon ? '<span class="ribbon">' + L.ribbon + "</span>" : "") +
        '<div class="art">' + Art.get(L.art) + '</div><div class="name">' + L.name + "</div>" +
        '<div class="lstars">' + starRow(3, S.bestStars(i)) + "</div>";
      (function (n) {
        tile.onclick = function () { begin(n); };
        tile.onkeydown = function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); begin(n); } };
      })(i);
      box.appendChild(tile);
    }
  }
  function goHome(speak) {
    S.gen++; $("hand").className = "hand"; S.hush(); S.cancelTimers();
    $("pause").className = "overlay"; S.paused = false;
    renderHome();
    S.show("home");
    if (speak) { S.say("Choose a level!"); }
  }
  S.home = goHome;

  function begin(n) {
    audio(); S.sfx.pop();
    S.hush(); S.cancelTimers();
    S.gen++;
    $("hand").className = "hand";
    level = n;
    S.musicStart();
    wrongTaps = 0; resultSent = false;
    S.setStars(0);
    $("level-tag").innerHTML = "Level " + (n + 1);
    S.show("game");
    cfg.start(n);
  }

  /* ---------- boot ---------- */
  /* config: { asset, version, title, kicker, levels: [{name, art, ribbon}], start(levelIndex), resume, score, max } */
  S.boot = function (config) {
    cfg = config;
    document.title = config.title;
    cv = $("confetti"); cx2 = cv.getContext("2d");
    $("hand").innerHTML = S.icon.hand;
    $("home-mascot").innerHTML = Art.get("chick");
    $("end-mascot").innerHTML = Art.get("chick");
    $("home-title").innerHTML = config.title;
    $("home-kicker").innerHTML = config.kicker;
    $("home-say").innerHTML = S.icon.speaker;
    $("star-icon").innerHTML = S.icon.star;
    $("pause-btn").innerHTML = S.icon.pause;
    $("home-btn").innerHTML = Art.get("home");
    $("end-home-ic").innerHTML = S.icon.homeDark;

    $("home-say").onclick = function () { audio(); S.musicStart(); S.say([config.title, config.intro || "", "Choose a level!"]); };
    $("again-btn").onclick = function () { begin(level); };
    $("next-btn").onclick = function () {
      try { window.parent.postMessage({ type: "arvo-asset-next", asset: cfg.asset, level: level + 1 }, "*"); } catch (e) {}
      begin(Math.min(level + 1, cfg.levels.length - 1));
    };
    $("end-home-btn").onclick = function () { goHome(true); };
    $("home-btn").onclick = function () {
      S.sendResult({ completed: false, score: config.score ? config.score() : 0, max: config.max ? config.max() : 0, stars: 0 });
      goHome(true);
    };
    $("pause-btn").onclick = function () { S.hush(); S.musicStop(); S.sfx.pop(); $("pause").className = "overlay on"; S.paused = true; };
    $("resume-btn").onclick = function () { $("pause").className = "overlay"; S.paused = false; S.musicStart(); if (config.resume) { config.resume(); } };
    function musicLabel() {
      $("music-btn").innerHTML = "Music: " + (S.musicIsOn() ? "on" : "off");
      $("home-music").className = "icon-btn music" + (S.musicIsOn() ? "" : " off");
    }
    $("music-btn").onclick = function () { S.setMusic(!S.musicIsOn()); if (S.paused) { S.musicStop(); } musicLabel(); };
    $("home-music").onclick = function () { audio(); S.setMusic(!S.musicIsOn()); musicLabel(); };
    $("home-music").innerHTML = S.icon.note;
    musicLabel();
    $("sound-btn").onclick = function () {
      soundOn = !soundOn;
      $("sound-btn").innerHTML = "Sound: " + (soundOn ? "on" : "off");
      if (!soundOn) { S.hush(); S.musicStop(); }
    };
    $("restart-btn").onclick = function () { $("pause").className = "overlay"; S.paused = false; begin(level); };
    $("menu-home-btn").onclick = function () {
      S.sendResult({ completed: false, score: config.score ? config.score() : 0, max: config.max ? config.max() : 0, stars: 0 });
      goHome(true);
    };
    renderHome();
    S.show("home");
  };

  /* play generation: callbacks from an earlier play (after Restart/Exit) are ignored */
  S.gen = 0;
  S.guard = function (fn) {
    var g = S.gen;
    return function () { if (g === S.gen) { return fn.apply(this, arguments); } };
  };

  /* timers that a restart must clear */
  var timers = [];
  S.wait = function (fn, ms) { var t = window.setTimeout(fn, ms); timers.push(t); return t; };
  S.cancelTimers = function () { var i; for (i = 0; i < timers.length; i++) { window.clearTimeout(timers[i]); } timers = []; };

  return S;
})();
