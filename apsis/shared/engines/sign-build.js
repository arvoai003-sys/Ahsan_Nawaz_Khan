/* Sign-build engine (drag-assemble). The child builds a sign: drag (or tap)
   a picture and the words onto an empty sign board. Content:
   { levels: [ { name, art, ribbon, make() } ] }   make() -> [ round ]
   round: { banner, bannerSay, shuffle, items: [ item ] }
   item:  { text, say,                       the question, on screen / spoken
            sign: { tone, shape },           tone: red | yellow | blue | white | green; shape: "oct" for STOP
            slots: [ { id, kind: "pic" | "word", fill } ]   fill: art key / text already on the sign
            tiles: [ { id, art | text, say, goes } ]        goes: the slot id it belongs in (none = a trap)
            hint: [ lines ] (said after a wrong tile), done: [ lines ] (said when the sign is built) }
   A tapped tile goes to the first empty slot of its kind; a dragged tile to the
   slot it is dropped on. Slots are filled in order, so word order matters.
   ES5 only. Needs Shell and Art. */
var SignBuild = (function () {
  var T = {};
  var C, flat, idx, item, attempts, locked, firstTry, starTotal, tutorialDone, drag = null;

  T.LINES = ["Oops! Try again.", "Tap a picture or a word, or drag it onto the sign.", "Tap here to hear it again."];

  function lock(v) {
    locked = v;
    var st = Shell.$("stage");
    if (st) { st.setAttribute("data-ready", v ? "0" : "1"); }
  }
  function instruction() { return item.say || item.text; }
  /* every line a screen can speak (tools/voice_lines.js) */
  T.linesFor = function (it) {
    var out = [it.say || it.text], i;
    if (it.hint) { out.push(it.hint); }
    if (it.done) { out.push(it.done); }
    for (i = 0; i < it.tiles.length; i++) { if (it.tiles[i].say) { out.push(it.tiles[i].say); } }
    return out;
  };

  function slotEls() { return Shell.$("stage").querySelectorAll(".sb-slot"); }
  function firstEmpty(kind) {
    var s = slotEls(), i;
    for (i = 0; i < s.length; i++) { if (s[i].data.kind === kind && !s[i].filled) { return s[i]; } }
    return null;
  }
  function contentHtml(x) { return x.art ? '<div class="sb-art">' + Art.get(x.art) + "</div>" : '<span class="sb-word">' + x.text + "</span>"; }

  function render() {
    var st = Shell.$("stage"), i;
    st.innerHTML = "";
    attempts = 0; firstTry = true; lock(true);

    var prompt = Shell.el("div", "prompt");
    var sayBtn = Shell.speakerBtn("say", "Hear it again");
    sayBtn.onclick = function () { Shell.say(instruction()); };
    prompt.appendChild(sayBtn);
    prompt.appendChild(Shell.el("div", "prompt-text", item.text));
    st.appendChild(prompt);

    var board = Shell.el("div", "sb");
    var wrap = Shell.el("div", "sb-wrap");
    var sign = Shell.el("div", "sb-sign " + (item.sign.tone || "white") + (item.sign.shape ? " " + item.sign.shape : ""));
    var picRow = Shell.el("div", "sb-row pics"), wordRow = Shell.el("div", "sb-row words");
    for (i = 0; i < item.slots.length; i++) {
      (function (s) {
        var el = Shell.el("div", "sb-slot " + s.kind + (s.fill ? " given" : ""));
        el.data = s;
        el.filled = !!s.fill;
        if (s.fill) { el.innerHTML = contentHtml(s.kind === "pic" ? { art: s.fill } : { text: s.fill }); }
        (s.kind === "pic" ? picRow : wordRow).appendChild(el);
      })(item.slots[i]);
    }
    if (picRow.children.length) { sign.appendChild(picRow); }
    if (wordRow.children.length) { sign.appendChild(wordRow); }
    wrap.appendChild(sign);
    wrap.appendChild(Shell.el("div", "sb-post"));
    board.appendChild(wrap);

    var tray = Shell.el("div", "tray sb-tray");
    var tiles = Shell.shuffle(item.tiles), tint = Math.floor(Math.random() * 6);
    for (i = 0; i < tiles.length; i++) {
      (function (tl, k) {
        var el = Shell.el("div", "sb-tile k" + ((tint + k) % 6) + (tl.art ? " pic" : " word"), contentHtml(tl));
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", tl.say || tl.text || tl.art);
        el.setAttribute("data-id", tl.id);
        el.data = tl;
        bindTile(el);
        el.onkeydown = function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); tapTile(el); } };
        tray.appendChild(el);
      })(tiles[i], i);
    }
    board.appendChild(tray);
    st.appendChild(board);
    Shell.progress(flat.length, idx);
    if (/[?&]qa=1/.test(window.location.search)) { /* test hook only: tile ids in the order they fill the slots */
      var order = [], j, q;
      for (j = 0; j < item.slots.length; j++) {
        if (item.slots[j].fill) { continue; }
        for (q = 0; q < item.tiles.length; q++) { if (item.tiles[q].goes === item.slots[j].id) { order.push(item.tiles[q].id); } }
      }
      window.__qa = { order: order };
    }

    var go = Shell.guard(function () {
      if (!tutorialDone) {
        tutorialDone = true;
        Shell.say(instruction(), Shell.guard(function () {
          Shell.tutorial([
            { node: sayBtn, say: "Tap here to hear it again." },
            { node: tray.children[0], say: "Tap a picture or a word, or drag it onto the sign." }
          ], Shell.guard(function () { lock(false); }));
        }));
      } else {
        lock(false);
        Shell.say(instruction());
      }
    });
    go();
  }

  /* ---------- tap / drag ---------- */
  function tapTile(el) {
    if (locked || el.className.indexOf("used") > -1) { return; }
    var slot = firstEmpty(el.data.art ? "pic" : "word");
    if (slot) { tryPlace(el, slot); }
  }
  function slotAt(x, y) {
    var s = slotEls(), i, r;
    for (i = 0; i < s.length; i++) {
      if (s[i].filled) { continue; }
      r = s[i].getBoundingClientRect();
      if (x > r.left - 24 && x < r.right + 24 && y > r.top - 24 && y < r.bottom + 24) { return s[i]; }
    }
    return null;
  }
  function bindTile(el) {
    function down(e) {
      if (locked || drag || el.className.indexOf("used") > -1) { return; }
      var p = e.touches ? e.touches[0] : e, r = el.getBoundingClientRect();
      drag = { el: el, x0: p.clientX, y0: p.clientY, dx: p.clientX - r.left, dy: p.clientY - r.top, moved: false, clone: null, hot: null };
      if (e.cancelable && e.touches) { e.preventDefault(); }
    }
    el.addEventListener("mousedown", down);
    el.addEventListener("touchstart", down, { passive: false });
  }
  function move(e) {
    if (!drag) { return; }
    var p = e.touches ? e.touches[0] : e;
    if (!drag.moved && Math.abs(p.clientX - drag.x0) + Math.abs(p.clientY - drag.y0) > 10) {
      drag.moved = true;
      var c = drag.el.cloneNode(true);
      c.className = drag.el.className + " dragging";
      document.body.appendChild(c);
      drag.clone = c;
      drag.el.className += " ghost";
    }
    if (drag.moved) {
      drag.clone.style.left = (p.clientX - drag.dx) + "px";
      drag.clone.style.top = (p.clientY - drag.dy) + "px";
      var s = slotAt(p.clientX, p.clientY);
      if (drag.hot && drag.hot !== s) { drag.hot.className = drag.hot.className.replace(" hot", ""); }
      if (s && s !== drag.hot) { s.className += " hot"; }
      drag.hot = s;
      if (e.cancelable) { e.preventDefault(); }
    }
  }
  function up(e) {
    if (!drag) { return; }
    var d = drag, p = e.changedTouches ? e.changedTouches[0] : e;
    drag = null;
    if (d.hot) { d.hot.className = d.hot.className.replace(" hot", ""); }
    if (d.clone) { d.clone.parentNode.removeChild(d.clone); }
    d.el.className = d.el.className.replace(" ghost", "");
    if (!d.moved) { tapTile(d.el); return; }
    var s = slotAt(p.clientX, p.clientY);
    if (s && !locked) { tryPlace(d.el, s); }
  }
  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move, { passive: false });
  document.addEventListener("mouseup", up);
  document.addEventListener("touchend", up);

  function tryPlace(el, slot) {
    var kind = el.data.art ? "pic" : "word";
    /* words go in order: a word dropped on a later slot is checked against the first empty one */
    var want = firstEmpty(kind);
    if (el.data.goes && slot.data.kind === kind && slot === want && el.data.goes === slot.data.id) {
      slot.filled = true;
      slot.className += " filled";
      slot.innerHTML = contentHtml(el.data);
      el.className += " used";
      if (firstEmpty("pic") || firstEmpty("word")) {
        Shell.sfx.pop();
        if (el.data.say) { Shell.say(el.data.say); }
        return;
      }
      lock(true);
      if (firstTry) { T.score++; }
      starTotal++; Shell.setStars(starTotal);
      var sign = Shell.$("stage").querySelector(".sb-sign");
      sign.className += " built";
      var praise = Shell.right(sign);
      Shell.say([praise].concat(item.done || []), Shell.guard(function () { Shell.wait(Shell.guard(next), 600); }));
      return;
    }
    firstTry = false;
    attempts++;
    Shell.wrong(el);
    var right = null, tl = Shell.$("stage").querySelectorAll(".sb-tile"), i, empty = firstEmpty("pic") || firstEmpty("word");
    if (attempts > 1 && empty) {
      for (i = 0; i < tl.length; i++) { if (tl[i].data.goes === empty.data.id && tl[i].className.indexOf("used") < 0) { right = tl[i]; } }
      if (right) { Shell.flash(right, "glow", 2600); }
      Shell.flash(empty, "glow", 2600);
    }
    Shell.say(["Oops! Try again."].concat(item.hint || instruction()));
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
  T.init = function (content) { C = content; tutorialDone = false; T.score = 0; };
  return T;
})();
