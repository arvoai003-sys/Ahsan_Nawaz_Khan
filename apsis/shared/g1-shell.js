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
  function tone(freq, start, dur, type, vol) {
    var c = audio();
    if (!c || !soundOn) { return; }
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + start);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, c.currentTime + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    o.connect(g); g.connect(c.destination);
    o.start(c.currentTime + start);
    o.stop(c.currentTime + start + dur + 0.05);
  }
  S.sfx = {
    right: function () { tone(660, 0, 0.18, "sine"); tone(880, 0.1, 0.22, "sine"); tone(1320, 0.2, 0.3, "triangle", 0.1); },
    wrong: function () { tone(330, 0, 0.22, "sine", 0.12); tone(262, 0.14, 0.3, "sine", 0.1); },
    pop: function () { tone(520, 0, 0.08, "triangle", 0.12); },
    fanfare: function () {
      var n = [523, 659, 784, 1047], i;
      for (i = 0; i < n.length; i++) { tone(n[i], i * 0.14, 0.3, "triangle", 0.14); }
      tone(1047, 0.6, 0.6, "sine", 0.12);
    }
  };

  /* ---------- speech ---------- */
  function pickVoice() {
    if (!window.speechSynthesis) { return; }
    var vs = window.speechSynthesis.getVoices() || [], order = ["en-PK", "en-IN", "en-GB"], i, j;
    if (!vs.length) { return; }
    for (i = 0; i < order.length; i++) {
      for (j = 0; j < vs.length; j++) {
        if ((vs[j].lang || "").replace("_", "-").toLowerCase() === order[i].toLowerCase()) { voice = vs[j]; return; }
      }
    }
    for (j = 0; j < vs.length; j++) {
      if ((vs[j].lang || "").toLowerCase().indexOf("en") === 0) { voice = vs[j]; return; }
    }
    voice = vs[0];
  }
  if (window.speechSynthesis) {
    pickVoice();
    try { window.speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {}
  }
  /* say(text, done): speaks one line; cancels anything already speaking.
     done() always runs, even with no speech engine (estimated time). */
  S.say = function (text, done) {
    var finished = false;
    function end() { if (!finished) { finished = true; if (done) { done(); } } }
    var guess = 700 + String(text).split(" ").length * 420;
    if (!window.speechSynthesis || !soundOn) { S.later(end, soundOn ? guess : 300); return; }
    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-GB"; }
      u.rate = 0.85; u.pitch = 1.05;
      u.onend = end; u.onerror = end;
      window.speechSynthesis.speak(u);
      S.later(end, guess + 2500); /* safety net: some engines never fire onend */
    } catch (e) { S.later(end, guess); }
  };
  S.hush = function () { try { if (window.speechSynthesis) { window.speechSynthesis.cancel(); } } catch (e) {} };

  /* ---------- icons ---------- */
  S.icon = {
    speaker: '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="#213547"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC845" stroke="#2E2A4F" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    starOff: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFFFFF" stroke="#2E2A4F" stroke-width="1.6" opacity=".7" stroke-linejoin="round"/></svg>',
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
  var praises = ["Well done!", "Great!", "Super!", "Yes!", "Good job!", "Wow!", "Brilliant!"];
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
    S.say(stars === 3 ? "Amazing! You got three stars!" : "Well done! You finished level " + (level + 1) + "!");
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

    $("home-say").onclick = function () { audio(); S.say(config.title + ". " + (config.intro || "") + " Choose a level!"); };
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
    $("pause-btn").onclick = function () { S.hush(); S.sfx.pop(); $("pause").className = "overlay on"; S.paused = true; };
    $("resume-btn").onclick = function () { $("pause").className = "overlay"; S.paused = false; if (config.resume) { config.resume(); } };
    $("sound-btn").onclick = function () {
      soundOn = !soundOn;
      $("sound-btn").innerHTML = "Sound: " + (soundOn ? "on" : "off");
      if (!soundOn) { S.hush(); }
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
