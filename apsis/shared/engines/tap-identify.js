/* Tap-to-identify engine. The child hears a prompt and taps one or more
   cards. Content shape:
   { rounds: [ { banner, bannerSay, markFirst, items: [
       { say, text, target: {text, art}, options: [{text, art}], answer: ["..."], hint2 } ] } ] }
   ES5 only. Needs Shell and Art. */
var TapIdentify = (function () {
  var T = {};
  var C, flat, idx, item, got, attempts, locked, firstTry, starTotal, tutorialDone;

  function wordHtml(text, markFirst) {
    if (!markFirst) { return text; }
    return '<span class="first">' + text.charAt(0) + "</span>" + text.slice(1);
  }

  /* opt: { text, art, say, hideWord, noBadge }. hideWord: the picture carries the
     words (signs, book covers), so no label under it; noBadge: no speaker, when
     hearing the option would give the answer away. */
  function makeCard(opt, markFirst, isTarget) {
    var card = Shell.el("div", "card" + (isTarget ? " target" : "") + (opt.hideWord ? " picture" : ""));
    card.setAttribute("role", isTarget ? "img" : "button");
    card.setAttribute("aria-label", opt.label || opt.text);
    if (!isTarget) { card.setAttribute("tabindex", "0"); }
    card.innerHTML = '<div class="art">' + Art.get(opt.art) + "</div>" +
      (opt.hideWord ? "" : '<div class="word' + (opt.text.length >= 7 ? " long" : "") + '">' + wordHtml(opt.text, markFirst) + "</div>");
    if (!opt.noBadge) {
      var badge = Shell.speakerBtn("badge", "Listen to " + (opt.label || opt.text));
      badge.onclick = function (e) {
        e.stopPropagation();
        Shell.say(opt.say || opt.text);
      };
      card.appendChild(badge);
    }
    card.optText = opt.text;
    card.setAttribute("data-id", opt.text);
    return card;
  }

  /* the spoken instruction, always as an array of recordable parts */
  function instruction() {
    var x = item.say || item.text;
    return Object.prototype.toString.call(x) === "[object Array]" ? x : [x];
  }
  /* locked: taps are ignored (speech or tutorial running). data-ready mirrors it for tests. */
  function lock(v) {
    locked = v;
    var st = Shell.$("stage");
    if (st) { st.setAttribute("data-ready", v ? "0" : "1"); }
  }

  function render() {
    var st = Shell.$("stage"), i, round = item.round;
    st.innerHTML = "";
    got = {}; attempts = 0; lock(true); firstTry = true;

    var prompt = Shell.el("div", "prompt");
    var sayBtn = Shell.speakerBtn("say", "Hear the question again");
    sayBtn.onclick = function () { Shell.say(instruction()); };
    prompt.appendChild(sayBtn);
    prompt.appendChild(Shell.el("div", "prompt-text", item.text));
    if (item.answer.length > 1) {
      var ctr = Shell.el("div", "counter"), h = "";
      for (i = 0; i < item.answer.length; i++) { h += "<b></b>"; }
      ctr.innerHTML = h; ctr.id = "counter";
      prompt.appendChild(ctr);
    }
    st.appendChild(prompt);

    var board = Shell.el("div", "board");
    if (item.target) {
      var tr = Shell.el("div", "target-row");
      tr.appendChild(makeCard(item.target, round.markFirst, true));
      board.appendChild(tr);
    }
    var opts = Shell.shuffle(item.options);
    var cards = Shell.el("div", "cards" + (opts.length > 3 ? " six" : ""));
    var tint = Math.floor(Math.random() * 6);
    for (i = 0; i < opts.length; i++) {
      (function (card) {
        card.className += " k" + ((tint + i) % 6);
        card.onclick = function () { tap(card); };
        card.onkeydown = function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); tap(card); } };
        cards.appendChild(card);
      })(makeCard(opts[i], round.markFirst, false));
    }
    board.appendChild(cards);
    st.appendChild(board);
    fitWords(st);
    Shell.progress(flat.length, idx);
    if (/[?&]qa=1/.test(window.location.search)) { window.__qa = { answer: item.answer }; } /* test hook only */

    var go = Shell.guard(function () {
      if (!tutorialDone && T.tutorial !== false) {
        tutorialDone = true;
        var badge = cards.querySelector(".badge") || cards.querySelector(".card");
        Shell.say(instruction(), Shell.guard(function () {
          Shell.tutorial([
            { node: sayBtn, say: "Tap here to hear the question again." },
            { node: badge, say: badge.className.indexOf("badge") > -1 ? "Tap a speaker to hear a word. Then tap the word you choose." : "Tap the picture you choose." }
          ], Shell.guard(function () { lock(false); }));
        }));
      } else {
        lock(false);
        Shell.say(instruction());
      }
    });
    go();
  }

  /* shrink any word that is wider than its card until it fits */
  function fitWords(root) {
    var words = root.querySelectorAll(".card .word"), i, w, size, room;
    for (i = 0; i < words.length; i++) {
      w = words[i];
      w.style.fontSize = "";
      room = w.parentNode.clientWidth - 12;
      size = parseFloat(window.getComputedStyle(w).fontSize);
      while (w.scrollWidth > room && size > 14) {
        size -= 1;
        w.style.fontSize = size + "px";
      }
    }
  }
  T.refit = function () { var st = Shell.$("stage"); if (st) { fitWords(st); } };

  function allCards() { return Shell.$("stage").querySelectorAll(".cards .card"); }

  function tap(card) {
    if (locked || card.className.indexOf("got") > -1) { return; }
    var ok = false, i;
    for (i = 0; i < item.answer.length; i++) { if (item.answer[i] === card.optText) { ok = true; } }
    if (ok) {
      got[card.optText] = true;
      card.className += " got";
      var n = 0, k;
      for (k in got) { if (got.hasOwnProperty(k)) { n++; } }
      var ctr = Shell.$("counter");
      if (ctr) { ctr.children[n - 1].className = "got"; }
      var praise = Shell.right(card);
      if (n === item.answer.length) {
        lock(true);
        if (firstTry) { T.score++; }
        starTotal++; Shell.setStars(starTotal);
        Shell.say(item.done ? [praise].concat(item.done) : [card.optText, praise], Shell.guard(function () {
          Shell.wait(Shell.guard(next), 500);
        }));
      } else {
        Shell.say([card.optText, praise, "Find one more!"]);
      }
    } else {
      firstTry = false;
      attempts++;
      Shell.wrong(card);
      hint();
    }
  }

  function hint() {
    var cards = allCards(), i;
    if (attempts === 1) {
      Shell.say(["Oops! Try again."].concat(instruction()));
    } else if (attempts === 2) {
      if (item.target) {
        var t = Shell.$("stage").querySelector(".card.target .first");
        if (t) { Shell.flash(t, "mark", 2600); }
        lock(true);
        Shell.say(item.hint2 || ["Listen.", item.target.text, item.target.text],
          Shell.guard(function () { listenAll(cards); }));
      } else {
        listenAll(cards);
      }
    } else {
      /* third and later: mark every first letter the same way (reveals nothing) and model listening */
      for (i = 0; i < cards.length; i++) {
        var f = cards[i].querySelector(".first");
        if (f) { Shell.flash(f, "mark", 4000); }
      }
      listenAll(cards);
    }
  }

  /* speak each option in turn while its card pulses */
  function listenAll(cards) {
    var list = [], i;
    for (i = 0; i < cards.length; i++) { if (cards[i].className.indexOf("got") < 0 && cards[i].querySelector(".badge")) { list.push(cards[i]); } }
    if (!list.length) {
      /* picture cards (signs, covers): reading them out would give the answer away */
      Shell.say(["Look carefully."].concat(instruction()));
      return;
    }
    lock(true);
    var j = 0;
    var step = Shell.guard(function () {
      if (j >= list.length) { lock(false); Shell.say(instruction()); return; }
      var c = list[j]; j++;
      Shell.flash(c, "pulse", 800);
      Shell.say(c.optText, function () { Shell.wait(step, 200); });
    });
    Shell.say("Let's listen to each word.", step);
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
    if (item.round.banner) {
      Shell.banner(item.round.banner, item.round.bannerSay, Shell.guard(render));
    } else {
      render();
    }
  };
  T.resume = function () { if (item) { Shell.say(instruction()); } };
  T.total = function () { return flat ? flat.length : 0; };
  T.max = function () { return flat ? flat.length : 0; };

  T.LINES = ["Look carefully.", "Tap the picture you choose.", "Tap here to hear the question again.", "Tap a speaker to hear a word. Then tap the word you choose.", "Find one more!", "Oops! Try again.", "Listen.", "Let's listen to each word."];
  T.init = function (content) {
    C = content;
    window.addEventListener("resize", function () { T.refit(); });
    tutorialDone = false;
    T.score = 0;
  };
  return T;
})();
