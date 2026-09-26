/* Read-along engine. A short book, page by page: a picture and the book's
   sentence. Recognition only (no score). Three modes, chosen on the home page:
     listen  "Read to Me": the narrator reads each page; words light up in turn
     self    "Read by Myself": nothing is read automatically; tap any word to hear it
     hunt    "Word Hunt": on each page, find one word ("Can you find the word go?")
   Any word can be tapped to hear it; tapping the picture reads the page again.
   Content: { pages: [ { art: [keys], text, bold: [words], glossary } ],
              glossary: { word, meaning, art }, levels: [ { name, art, mode } ] }
   ES5 only. Needs Shell and Art. */
var ReadAlong = (function () {
  var T = {};
  var C, mode, idx, pages, hunted, timer = null, lit = [], stars;

  T.LINES = ["Tap a word to hear it.", "Tap the arrow to turn the page.", "Can you find the word", "The end!",
    "Oops! Try again.", "Look carefully."];

  function words(text) { return text.split(" "); }
  function bare(w) { return w.replace(/[^A-Za-z']/g, "").toLowerCase(); }
  /* rough length of each word when read aloud: syllables, plus a pause at . , ? ! */
  function weight(w) {
    var v = (bare(w).match(/[aeiouy]+/g) || [""]).length;
    return Math.max(1, v) + (/[.,;!?]$/.test(w) ? 1.2 : 0.25);
  }

  function lock(v) {
    var st = Shell.$("stage");
    if (st) { st.setAttribute("data-ready", v ? "0" : "1"); }
  }

  /* ---------- highlight words while the page is read ---------- */
  function stopLight() {
    if (timer) { window.clearInterval(timer); timer = null; }
    var i;
    for (i = 0; i < lit.length; i++) { lit[i].className = lit[i].className.replace(" on", ""); }
    lit = [];
  }
  function light(spans, player, est) {
    stopLight();
    var total = 0, w = [], i;
    for (i = 0; i < spans.length; i++) { w.push(weight(spans[i].textContent)); total += w[i]; }
    var t0 = new Date().getTime();
    timer = window.setInterval(function () {
      var dur = player && player.duration && isFinite(player.duration) ? player.duration - 0.2 : est;
      var now = player && player.duration ? player.currentTime : (new Date().getTime() - t0) / 1000;
      var at = Math.min(1, now / Math.max(0.3, dur)) * total, acc = 0, k = 0;
      for (k = 0; k < spans.length; k++) { acc += w[k]; if (at < acc) { break; } }
      for (i = 0; i < spans.length; i++) {
        var on = i === k;
        if (on && spans[i].className.indexOf(" on") < 0) { spans[i].className += " on"; lit.push(spans[i]); }
        if (!on) { spans[i].className = spans[i].className.replace(" on", ""); }
      }
    }, 50);
  }

  function readPage(done) {
    var p = pages[idx], spans = Shell.$("stage").querySelectorAll(".ra-text .w");
    var once = true;
    var off = function (info) {
      if (!once || info.text !== p.text) { return; }
      once = false;
      Shell.off("speakstart", off);
      light(spans, info.player, info.est || spans.length * 0.5);
    };
    Shell.on("speakstart", off);
    Shell.say(p.heading ? [p.heading, p.text] : p.text, Shell.guard(function () {
      once = false;
      Shell.off("speakstart", off);
      stopLight();
      if (done) { done(); }
    }));
  }

  /* ---------- a page ---------- */
  function render() {
    var st = Shell.$("stage"), p = pages[idx], i, ws = words(p.text);
    stopLight();
    st.innerHTML = "";
    lock(true);

    var book = Shell.el("div", "ra-book");
    var pic = Shell.el("div", "ra-pic" + (p.cover ? " cover" : ""));
    var arts = "";
    for (i = 0; i < p.art.length; i++) { arts += '<div class="ra-art">' + Art.get(p.art[i]) + "</div>"; }
    pic.innerHTML = arts;
    pic.onclick = function () { if (!busy()) { readPage(); } };
    book.appendChild(pic);

    var col = Shell.el("div", "ra-words");
    if (p.heading) {
      var hd = Shell.el("div", "ra-heading", p.heading);
      hd.onclick = function () { Shell.say(p.heading); };
      col.appendChild(hd);
    }
    var line = Shell.el("div", "ra-text" + (p.cover ? " cover" : ""));
    for (i = 0; i < ws.length; i++) {
      (function (w) {
        var bold = p.bold && p.bold.indexOf(bare(w)) > -1;
        var sp = Shell.el("span", "w" + (bold ? " bold" : ""), w);
        sp.setAttribute("role", "button");
        sp.setAttribute("data-word", bare(w));
        sp.onclick = function () { tapWord(sp, w); };
        line.appendChild(sp);
        line.appendChild(document.createTextNode(" "));
      })(ws[i]);
    }
    col.appendChild(line);
    book.appendChild(col);
    if (p.glossary) {
      var g = Shell.el("div", "ra-gloss", '<b>' + C.glossary.word + "</b> " + C.glossary.meaning);
      g.onclick = function () { Shell.say([C.glossary.word, C.glossary.meaning]); };
      book.appendChild(g);
    }
    st.appendChild(book);

    var nav = Shell.el("div", "ra-nav");
    var back = Shell.el("button", "icon-btn ra-back", "&#9664;");
    back.setAttribute("aria-label", "Back");
    back.onclick = function () { if (idx > 0) { Shell.hush(); idx--; render(); } };
    if (idx === 0) { back.style.visibility = "hidden"; }
    var next = Shell.el("button", "icon-btn ra-next", "&#9654;");
    next.setAttribute("aria-label", "Next page");
    next.id = "ra-next";
    next.onclick = function () { turn(); };
    nav.appendChild(back);
    nav.appendChild(next);
    st.appendChild(nav);
    Shell.progress(pages.length, idx);
    if (/[?&]qa=1/.test(window.location.search)) { window.__qa = { hunt: mode === "hunt" ? p.hunt : null, page: idx }; } /* test hook only */

    var go = Shell.guard(function () {
      lock(false);
      if (mode === "listen") {
        readPage(Shell.guard(function () { pulse(next); }));
      } else if (mode === "hunt" && p.hunt) {
        hunted = false;
        Shell.say(["Can you find the word", p.hunt]);
      } else if (idx === 0) {
        Shell.say(["Tap a word to hear it.", "Tap the arrow to turn the page."], Shell.guard(function () { pulse(next); }));
      } else {
        pulse(next);
      }
    });
    go();
  }
  function busy() { return false; }
  function pulse(el) { if (el && el.parentNode) { el.className = el.className.replace(" pulse", "") + " pulse"; } }

  function tapWord(sp, w) {
    var p = pages[idx];
    if (mode === "hunt" && p.hunt && !hunted) {
      if (bare(w) === p.hunt) {
        hunted = true;
        sp.className += " found";
        stars++; Shell.setStars(stars);
        var praise = Shell.right(sp);
        Shell.say([praise, p.hunt], Shell.guard(function () { pulse(Shell.$("ra-next")); }));
      } else {
        Shell.wrong(sp);
        Shell.say(["Oops! Try again.", "Can you find the word", p.hunt]);
      }
      return;
    }
    sp.className = sp.className.replace(" tap", "") + " tap";
    Shell.say(bare(w));
  }

  function turn() {
    Shell.hush();
    stopLight();
    Shell.sfx.whoosh();
    if (idx < pages.length - 1) { idx++; render(); return; }
    Shell.progress(pages.length, pages.length);
    Shell.say("The end!", Shell.guard(function () { Shell.finish(stars, pages.length); }));
  }

  T.start = function (levelIndex) {
    var L = C.levels[levelIndex || 0];
    mode = L.mode;
    pages = C.pages;
    idx = 0; stars = 0; hunted = false;
    T.score = 0;
    Shell.banner(L.name, L.bannerSay, Shell.guard(render));
  };
  T.resume = function () { if (pages) { render(); } };
  T.max = function () { return pages ? pages.length : 0; };
  /* every line the read-along can speak (tools/voice_lines.js) */
  T.linesFor = function () { return []; };
  T.allLines = function () {
    var out = [], i, ws, j;
    for (i = 0; i < C.pages.length; i++) {
      out.push(C.pages[i].text);
      if (C.pages[i].heading) { out.push(C.pages[i].heading); }
      ws = words(C.pages[i].text);
      for (j = 0; j < ws.length; j++) { out.push(bare(ws[j])); }
      if (C.pages[i].hunt) { out.push(["Can you find the word", C.pages[i].hunt]); }
    }
    if (C.glossary) { out.push(C.glossary.word, C.glossary.meaning); }
    for (i = 0; i < C.levels.length; i++) { out.push(C.levels[i].bannerSay); }
    return out;
  };
  T.init = function (content) { C = content; T.score = 0; };
  return T;
})();
