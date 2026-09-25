/* Letter-fill engine. The child hears a word or a sign, then taps or drags
   the missing letter into the gap. Content shape:
   { levels: [ { name, art, ribbon, make() | rounds } ] }
   round: { banner, bannerSay, items: [ item ] }
   item:  { kind: "word" | "sign", pattern: "f_sh", full: "fish", answer: "i",
            choices: ["i", "a", "o"], art: "fish",              (word)
            shape: "diamond" | "octagon" | "rect", tone: "green", post: true,   (sign)
            say: [...] (optional; built from full if absent) }
   ES5 only. Needs Shell and Art. */
var LetterFill = (function () {
  var T = {};
  var C, flat, idx, item, attempts, locked, firstTry, starTotal, tutorialDone;
  var drag = null;

  var SHAPES = {
    diamond: '<svg class="shape" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 3L97 50 50 97 3 50z" fill="#FFD23F" stroke="#2E2A4F" stroke-width="3.2" stroke-linejoin="round"/><path d="M50 10L90 50 50 90 10 50z" fill="none" stroke="#2E2A4F" stroke-width="1.4"/></svg>',
    octagon: '<svg class="shape" viewBox="0 0 100 100"><path d="M30 3h40l27 27v40L70 97H30L3 70V30z" fill="#FF3B3B" stroke="#2E2A4F" stroke-width="3.2" stroke-linejoin="round"/><path d="M32 9h36l23 23v36L68 91H32L9 68V32z" fill="none" stroke="#fff" stroke-width="2.4"/></svg>'
  };

  function lock(v) {
    locked = v;
    var st = Shell.$("stage");
    if (st) { st.setAttribute("data-ready", v ? "0" : "1"); }
  }
  function instruction() {
    if (item.say) { return item.say; }
    if (item.kind === "sign") { return ["This sign says", item.full, "Which letter is missing?"]; }
    return ["Listen.", item.full, "Which letter is missing?"];
  }
  /* words stay whole: the word holding the gap never breaks across lines */
  function patternHtml(p) {
    var words = p.split(" "), out = [], i, w, g;
    for (i = 0; i < words.length; i++) {
      w = words[i]; g = w.indexOf("_");
      out.push('<span class="w">' + (g < 0 ? w : w.slice(0, g) + '<span class="slot" id="slot"></span>' + w.slice(g + 1)) + "</span>");
    }
    return out.join(" ");
  }
  function signHtml(it) {
    var txt = patternHtml(it.pattern);
    if (it.shape === "diamond" || it.shape === "octagon") {
      return '<div class="sign-wrap"><div class="sign ' + it.shape + '">' + SHAPES[it.shape] + '<div class="txt">' + txt + "</div></div>" +
        (it.post ? '<div class="sign-post"></div>' : "") + "</div>";
    }
    return '<div class="sign-wrap"><div class="sign rect ' + (it.tone || "white") + '"><div class="txt">' + txt + "</div></div>" +
      (it.post ? '<div class="sign-post"></div>' : "") + "</div>";
  }

  function render() {
    var st = Shell.$("stage"), i;
    st.innerHTML = "";
    attempts = 0; firstTry = true; lock(true);

    var prompt = Shell.el("div", "prompt");
    var sayBtn = Shell.speakerBtn("say", "Hear it again");
    sayBtn.onclick = function () { Shell.say(instruction()); };
    prompt.appendChild(sayBtn);
    prompt.appendChild(Shell.el("div", "prompt-text", item.kind === "sign" ? "Which letter is missing from the sign?" : "Which letter is missing?"));
    st.appendChild(prompt);

    var board = Shell.el("div", "lf");
    var show = Shell.el("div", "lf-show");
    if (item.kind === "sign") {
      show.innerHTML = signHtml(item);
    } else {
      show.innerHTML = '<div class="lf-pic">' + Art.get(item.art) + '</div><div class="lf-word">' + patternHtml(item.pattern) + "</div>";
    }
    show.onclick = function () { Shell.say(item.full); };
    board.appendChild(show);

    var tray = Shell.el("div", "tray");
    var letters = Shell.shuffle(item.choices), tint = Math.floor(Math.random() * 6);
    for (i = 0; i < letters.length; i++) {
      (function (ch, k) {
        var t = Shell.el("div", "tile k" + ((tint + k) % 6), ch);
        t.setAttribute("role", "button");
        t.setAttribute("tabindex", "0");
        t.setAttribute("aria-label", "letter " + ch);
        t.letter = ch;
        bindTile(t);
        t.onkeydown = function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); place(t); } };
        tray.appendChild(t);
      })(letters[i], i);
    }
    board.appendChild(tray);
    st.appendChild(board);
    Shell.progress(flat.length, idx);

    var go = Shell.guard(function () {
      if (!tutorialDone) {
        tutorialDone = true;
        var first = tray.children[0];
        Shell.say(instruction(), Shell.guard(function () {
          Shell.tutorial([
            { node: sayBtn, say: "Tap here to hear it again." },
            { node: first, say: "Tap a letter, or drag it into the gap." }
          ], Shell.guard(function () { lock(false); }));
        }));
      } else {
        lock(false);
        Shell.say(instruction());
      }
    });
    go();
  }

  /* ---------- tap or drag a tile ---------- */
  function slotRect() { var s = Shell.$("slot"); return s ? s.getBoundingClientRect() : null; }
  function overSlot(x, y) {
    var r = slotRect();
    if (!r) { return false; }
    var pad = 40;
    return x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad;
  }
  function bindTile(t) {
    function down(e) {
      if (locked || drag) { return; }
      var p = e.touches ? e.touches[0] : e;
      var r = t.getBoundingClientRect();
      drag = { t: t, x0: p.clientX, y0: p.clientY, dx: p.clientX - r.left, dy: p.clientY - r.top, moved: false, clone: null };
      if (e.cancelable && e.touches) { e.preventDefault(); }
    }
    t.addEventListener("mousedown", down);
    t.addEventListener("touchstart", down, { passive: false });
  }
  function move(e) {
    if (!drag) { return; }
    var p = e.touches ? e.touches[0] : e;
    if (!drag.moved && Math.abs(p.clientX - drag.x0) + Math.abs(p.clientY - drag.y0) > 10) {
      drag.moved = true;
      var c = drag.t.cloneNode(true);
      c.className = drag.t.className + " dragging";
      document.body.appendChild(c);
      drag.clone = c;
      drag.t.className += " ghost";
    }
    if (drag.moved) {
      drag.clone.style.left = (p.clientX - drag.dx) + "px";
      drag.clone.style.top = (p.clientY - drag.dy) + "px";
      var s = Shell.$("slot");
      if (s) { if (overSlot(p.clientX, p.clientY)) { s.classList.add("hot"); } else { s.classList.remove("hot"); } }
      if (e.cancelable) { e.preventDefault(); }
    }
  }
  function up(e) {
    if (!drag) { return; }
    var d = drag, p = e.changedTouches ? e.changedTouches[0] : e;
    drag = null;
    var s = Shell.$("slot");
    if (s) { s.classList.remove("hot"); }
    if (d.clone) { d.clone.parentNode.removeChild(d.clone); }
    d.t.className = d.t.className.replace(" ghost", "");
    if (!d.moved || overSlot(p.clientX, p.clientY)) { place(d.t); }
  }
  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move, { passive: false });
  document.addEventListener("mouseup", up);
  document.addEventListener("touchend", up);

  function place(t) {
    if (locked || t.className.indexOf("used") > -1) { return; }
    var slot = Shell.$("slot");
    if (t.letter === item.answer) {
      lock(true);
      slot.innerHTML = t.letter;
      slot.className = "slot filled";
      t.className += " used";
      if (firstTry) { T.score++; }
      starTotal++; Shell.setStars(starTotal);
      var praise = Shell.right(slot);
      Shell.say([item.full, praise], Shell.guard(function () { Shell.wait(Shell.guard(next), 450); }));
    } else {
      firstTry = false;
      attempts++;
      Shell.wrong(t);
      hint();
    }
  }

  function hint() {
    var slot = Shell.$("slot"), pic = Shell.$("stage").querySelector(".lf-pic, .sign");
    if (attempts === 1) {
      Shell.say(["Oops! Try again.", "Listen.", item.full]);
    } else {
      if (slot) { Shell.flash(slot, "glow", 2800); }
      if (pic) { Shell.flash(pic, "shake", 500); }
      Shell.say(["Listen carefully.", item.full, item.full, "Which letter goes in the gap?"]);
    }
  }

  function next() {
    idx++;
    if (idx >= flat.length) {
      Shell.progress(flat.length, flat.length);
      Shell.wait(Shell.guard(function () { Shell.finish(T.score, flat.length); }), 400);
      return;
    }
    item = flat[idx];
    if (item.round !== flat[idx - 1].round && item.round.banner) {
      Shell.$("stage").innerHTML = "";
      Shell.banner(item.round.banner, item.round.bannerSay, Shell.guard(render));
    } else {
      render();
    }
  }

  T.start = function (levelIndex) {
    var r, i, L = C.levels[levelIndex || 0];
    var rounds = L.make ? L.make() : L.rounds;
    flat = [];
    for (r = 0; r < rounds.length; r++) {
      var its = rounds[r].shuffle === false ? rounds[r].items : Shell.shuffle(rounds[r].items);
      for (i = 0; i < its.length; i++) { its[i].round = rounds[r]; flat.push(its[i]); }
    }
    idx = 0; T.score = 0; starTotal = 0;
    item = flat[0];
    if (item.round.banner) { Shell.banner(item.round.banner, item.round.bannerSay, Shell.guard(render)); } else { render(); }
  };
  T.resume = function () { if (item) { Shell.say(instruction()); } };
  T.max = function () { return flat ? flat.length : 0; };
  T.LINES = ["Which letter is missing?", "This sign says", "Listen.", "Tap here to hear it again.", "Tap a letter, or drag it into the gap.", "Oops! Try again.", "Listen carefully.", "Which letter goes in the gap?"];
  T.init = function (content) { C = content; tutorialDone = false; T.score = 0; };
  return T;
})();
