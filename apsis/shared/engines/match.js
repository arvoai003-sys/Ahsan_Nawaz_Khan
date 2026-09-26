/* Match engine. The child drags a word chip onto the right target (a picture
   card or a sentence with a gap), or taps a chip and then a target. With a
   single target, tapping a chip answers straight away.
   Content: { levels: [ { name, art, ribbon, make() | rounds } ] }
   round:   { banner, bannerSay, items: [ screen ] }
   screen:  { text, say, targets: [ { id, art, cap, sentence, say, done } ],
              chips: [ { text, art, say, goes } ] }
     cap       text on the card; in a sentence "___" marks the gap
     done      what to say when the target is matched (e.g. the book sentence)
     goes      id of the chip's target; chips with no "goes" are distractors
   ES5 only. Needs Shell and Art. */
var Match = (function () {
  var T = {};
  var C, flat, idx, item, attempts, locked, firstTry, starTotal, tutorialDone, picked, drag = null, left;

  T.LINES = ["Oops! Try again.", "Tap a word, or drag it to its picture.", "Tap here to hear it again.", "Listen carefully."];

  function lock(v) {
    locked = v;
    var st = Shell.$("stage");
    if (st) { st.setAttribute("data-ready", v ? "0" : "1"); }
  }
  function instructionFor(it) { return it.say || it.text; }
  function instruction() { return instructionFor(item); }
  /* every line a screen can speak (tools/voice_lines.js) */
  T.linesFor = function (it) {
    var out = [instructionFor(it)], i;
    for (i = 0; i < it.targets.length; i++) { out.push(it.targets[i].say || it.targets[i].cap); if (it.targets[i].done) { out.push(it.targets[i].done); } }
    for (i = 0; i < it.chips.length; i++) { out.push(it.chips[i].say || it.chips[i].text); }
    return out;
  };

  function capHtml(t) {
    if (!t.cap) { return ""; }
    return '<div class="cap">' + t.cap.replace("___", '<span class="drop"></span>') + "</div>";
  }

  function render() {
    var st = Shell.$("stage"), i, tint = Math.floor(Math.random() * 6);
    st.innerHTML = "";
    attempts = 0; firstTry = true; picked = null; lock(true);
    left = 0;

    var prompt = Shell.el("div", "prompt");
    var sayBtn = Shell.speakerBtn("say", "Hear it again");
    sayBtn.onclick = function () { Shell.say(instruction()); };
    prompt.appendChild(sayBtn);
    prompt.appendChild(Shell.el("div", "prompt-text", item.text));
    st.appendChild(prompt);

    var board = Shell.el("div", "mt" + (item.targets.length >= 5 ? " five" : ""));
    var tbox = Shell.el("div", "targets");
    var targets = Shell.shuffle(item.targets);
    for (i = 0; i < targets.length; i++) {
      (function (t, k) {
        var sentence = t.cap && t.cap.indexOf("___") > -1;
        var el = Shell.el("div", "target k" + ((tint + k) % 6) + (sentence ? " sentence" : ""));
        el.innerHTML = (t.art ? '<div class="art">' + Art.get(t.art) + "</div>" : "") + capHtml(t) + (sentence ? "" : '<div class="drop"></div>');
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", (t.say || t.cap || t.id).replace("___", "blank"));
        el.data = t;
        el.onclick = function () {
          if (picked && !locked) { tryDrop(picked, el); return; }
          if (el.className.indexOf("done") < 0) { Shell.say(t.say || t.cap.replace("___", "...")); }
        };
        tbox.appendChild(el);
        left++;
      })(targets[i], i);
    }
    board.appendChild(tbox);

    var cbox = Shell.el("div", "chips");
    var chips = Shell.shuffle(item.chips);
    for (i = 0; i < chips.length; i++) {
      (function (c, k) {
        var el = Shell.el("div", "chip k" + ((tint + k + 2) % 6), (c.art ? '<span class="dot">' + Art.get(c.art) + "</span>" : "") + "<span>" + c.text + "</span>");
        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", c.text);
        el.data = c;
        bindChip(el);
        el.onkeydown = function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); tapChip(el); } };
        cbox.appendChild(el);
      })(chips[i], i);
    }
    board.appendChild(cbox);
    st.appendChild(board);
    Shell.progress(flat.length, idx);

    var go = Shell.guard(function () {
      if (!tutorialDone) {
        tutorialDone = true;
        Shell.say(instruction(), Shell.guard(function () {
          Shell.tutorial([
            { node: sayBtn, say: "Tap here to hear it again." },
            { node: cbox.children[0], say: "Tap a word, or drag it to its picture." }
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
  function targetEls() { return Shell.$("stage").querySelectorAll(".target"); }
  function targetAt(x, y) {
    var ts = targetEls(), i, r;
    for (i = 0; i < ts.length; i++) {
      if (ts[i].className.indexOf("done") > -1) { continue; }
      r = ts[i].getBoundingClientRect();
      if (x > r.left - 12 && x < r.right + 12 && y > r.top - 12 && y < r.bottom + 12) { return ts[i]; }
    }
    return null;
  }
  function tapChip(el) {
    if (locked || el.className.indexOf("placed") > -1) { return; }
    var open = [], ts = targetEls(), i;
    for (i = 0; i < ts.length; i++) { if (ts[i].className.indexOf("done") < 0) { open.push(ts[i]); } }
    if (open.length === 1) { tryDrop(el, open[0]); return; }
    if (picked) { picked.className = picked.className.replace(" picked", ""); }
    picked = el;
    el.className += " picked";
    Shell.sfx.pop();
    Shell.say(el.data.say || el.data.text);
  }
  function bindChip(el) {
    function down(e) {
      if (locked || drag || el.className.indexOf("placed") > -1) { return; }
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
      c.className = drag.el.className.replace(" picked", "") + " dragging";
      c.style.width = drag.el.offsetWidth + "px";
      document.body.appendChild(c);
      drag.clone = c;
      drag.el.className += " ghost";
    }
    if (drag.moved) {
      drag.clone.style.left = (p.clientX - drag.dx) + "px";
      drag.clone.style.top = (p.clientY - drag.dy) + "px";
      var t = targetAt(p.clientX, p.clientY);
      if (drag.hot && drag.hot !== t) { drag.hot.className = drag.hot.className.replace(" hot", ""); }
      if (t && t !== drag.hot) { t.className += " hot"; }
      drag.hot = t;
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
    if (!d.moved) { tapChip(d.el); return; }
    var t = targetAt(p.clientX, p.clientY);
    if (t) { tryDrop(d.el, t); }
  }
  document.addEventListener("mousemove", move);
  document.addEventListener("touchmove", move, { passive: false });
  document.addEventListener("mouseup", up);
  document.addEventListener("touchend", up);

  function tryDrop(chip, target) {
    if (locked || chip.className.indexOf("placed") > -1 || target.className.indexOf("done") > -1) { return; }
    if (picked) { picked.className = picked.className.replace(" picked", ""); picked = null; }
    var c = chip.data, t = target.data;
    if (c.goes === t.id) {
      lock(true);
      chip.className = chip.className.replace(" picked", "") + " placed";
      target.querySelector(".drop").appendChild(chip);
      target.className += " done";
      left--;
      var praise = Shell.right(target);
      var after = Shell.guard(function () {
        if (left === 0) {
          if (firstTry) { T.score++; }
          starTotal++; Shell.setStars(starTotal);
          Shell.wait(Shell.guard(next), 500);
        } else {
          lock(false);
        }
      });
      Shell.say([praise].concat(t.done || c.text), after);
    } else {
      firstTry = false;
      attempts++;
      Shell.wrong(chip);
      if (attempts === 1) {
        Shell.say(["Oops! Try again.", t.say || (t.cap || "").replace("___", "...")]);
      } else {
        /* show where it belongs? never. Glow the open targets and read them out */
        var ts = targetEls(), i;
        for (i = 0; i < ts.length; i++) { if (ts[i].className.indexOf("done") < 0) { Shell.flash(ts[i], "glow", 2600); } }
        Shell.say(["Listen carefully.", instruction()]);
      }
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
  T.init = function (content) { C = content; tutorialDone = false; T.score = 0; };
  return T;
})();
