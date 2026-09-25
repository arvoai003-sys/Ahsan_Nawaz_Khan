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
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" fill="#FFC845" stroke="#E0A415" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    starOff: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z" fill="#E3EEF3" stroke="#C5D8E0" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    hand: '<svg viewBox="0 0 64 64"><path d="M26 6c3 0 5 2 5 5v18l2-1c2-1 5 0 6 2l1 1c2-1 5 0 6 2 2-1 5 0 6 3l2 12c1 7-4 14-11 14H33c-5 0-9-3-11-7l-8-15c-1-3 0-5 3-6 2-1 4 0 6 2l3 4V11c0-3 0-5 0-5z" fill="#FFE0C2" stroke="#8A5A3C" stroke-width="2.5" stroke-linejoin="round"/></svg>',
    mascot: '<svg viewBox="0 0 120 120"><circle cx="60" cy="64" r="46" fill="#FFC845"/><circle cx="60" cy="64" r="46" fill="none" stroke="#E0A415" stroke-width="4"/><circle cx="44" cy="58" r="7" fill="#213547"/><circle cx="76" cy="58" r="7" fill="#213547"/><circle cx="46" cy="56" r="2.2" fill="#fff"/><circle cx="78" cy="56" r="2.2" fill="#fff"/><path d="M42 76q18 16 36 0" fill="none" stroke="#213547" stroke-width="5" stroke-linecap="round"/><circle cx="34" cy="74" r="6" fill="#F3A184" opacity=".7"/><circle cx="86" cy="74" r="6" fill="#F3A184" opacity=".7"/><path d="M60 18v-8M60 10l-6 -4M60 10l6 -4" stroke="#1E9FB4" stroke-width="4" stroke-linecap="round"/></svg>'
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
    var cols = ["#FFC845", "#1E9FB4", "#F3A184", "#B4A4EC", "#8FD6A8"], i, a, sp;
    for (i = 0; i < (n || 40); i++) {
      a = Math.random() * Math.PI * 2; sp = 4 + Math.random() * 8;
      bits.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 6, r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4, s: 8 + Math.random() * 8, c: cols[i % cols.length], life: 70 + Math.random() * 30 });
    }
    if (!running) { running = true; window.requestAnimationFrame(confettiLoop); }
  };

  /* ---------- praise ---------- */
  var praises = ["Well done!", "Great!", "Super!", "Yes!", "Good job!"];
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
  S.starsFor = function (wrong) { return wrong === 0 ? 3 : (wrong <= 2 ? 2 : 1); };
  S.sendResult = function (r) {
    if (resultSent) { return; }
    resultSent = true;
    r.asset = cfg.asset; r.version = cfg.version;
    try { window.parent.postMessage({ type: "arvo-asset-result", result: r }, "*"); } catch (e) {}
    try {
      var key = "arvo:" + cfg.asset, old = JSON.parse(window.localStorage.getItem(key) || "{}");
      if (!old.stars || r.stars > old.stars) { window.localStorage.setItem(key, JSON.stringify({ stars: r.stars })); }
    } catch (e2) {}
    S.lastResult = r;
  };
  S.bestStars = function () {
    try { return (JSON.parse(window.localStorage.getItem("arvo:" + cfg.asset) || "{}").stars) || 0; } catch (e) { return 0; }
  };

  S.finish = function (score, max) {
    var stars = S.starsFor(wrongTaps), i, h = "";
    S.sendResult({ completed: true, score: score, max: max, stars: stars });
    for (i = 0; i < 3; i++) { h += i < stars ? S.icon.star.replace("<svg", '<svg class="lit"') : S.icon.starOff; }
    $("end-stars").innerHTML = h;
    S.show("end");
    S.sfx.fanfare();
    S.confetti(window.innerWidth / 2, window.innerHeight / 3, 120);
    S.say(stars === 3 ? "Amazing! You got three stars!" : "Well done! You finished the game!");
  };

  /* ---------- boot ---------- */
  /* config: { asset, version, title, kicker, intro, start(fn) , restart(fn) } */
  S.boot = function (config) {
    cfg = config;
    document.title = config.title;
    cv = $("confetti"); cx2 = cv.getContext("2d");
    $("hand").innerHTML = S.icon.hand;
    $("start-mascot").innerHTML = S.icon.mascot;
    $("end-mascot").innerHTML = S.icon.mascot;
    $("start-title").innerHTML = config.title;
    $("start-kicker").innerHTML = config.kicker;
    $("star-icon").innerHTML = S.icon.star;
    $("pause-btn").innerHTML = S.icon.pause;
    var best = S.bestStars();
    $("start-sub").innerHTML = best ? ("Best: " + best + (best === 1 ? " star" : " stars")) : config.sub || "";

    function begin() {
      audio(); S.sfx.pop();
      S.gen++;
      $("hand").className = "hand";
      wrongTaps = 0; resultSent = false;
      S.setStars(0);
      S.show("game");
      config.start();
    }
    $("play-btn").onclick = begin;
    $("again-btn").onclick = function () { S.hush(); begin(); };
    $("next-btn").onclick = function () {
      S.hush();
      try { window.parent.postMessage({ type: "arvo-asset-next", asset: cfg.asset }, "*"); } catch (e) {}
      S.show("start");
    };
    $("pause-btn").onclick = function () { S.hush(); S.sfx.pop(); $("pause").className = "overlay on"; S.paused = true; };
    $("resume-btn").onclick = function () { $("pause").className = "overlay"; S.paused = false; if (config.resume) { config.resume(); } };
    $("sound-btn").onclick = function () {
      soundOn = !soundOn;
      $("sound-btn").innerHTML = "Sound: " + (soundOn ? "on" : "off");
      if (!soundOn) { S.hush(); }
    };
    $("restart-btn").onclick = function () { $("pause").className = "overlay"; S.paused = false; S.hush(); S.cancelTimers(); begin(); };
    $("exit-btn").onclick = function () {
      $("pause").className = "overlay"; S.paused = false; S.gen++; $("hand").className = "hand"; S.hush(); S.cancelTimers();
      S.sendResult({ completed: false, score: config.score ? config.score() : 0, max: config.max || 0, stars: 0 });
      S.show("start");
    };
    S.show("start");
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
