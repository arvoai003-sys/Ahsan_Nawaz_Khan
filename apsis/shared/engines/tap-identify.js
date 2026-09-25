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

  function makeCard(opt, markFirst, isTarget) {
    var card = Shell.el("div", "card" + (isTarget ? " target" : ""));
    card.setAttribute("role", isTarget ? "img" : "button");
    card.setAttribute("aria-label", opt.text);
    if (!isTarget) { card.setAttribute("tabindex", "0"); }
    card.innerHTML = '<div class="art">' + Art.get(opt.art) + '</div><div class="word">' + wordHtml(opt.text, markFirst) + "</div>";
    var badge = Shell.speakerBtn("badge", "Listen to " + opt.text);
    badge.onclick = function (e) {
      e.stopPropagation();
      Shell.say(opt.say || opt.text);
    };
    card.appendChild(badge);
    card.optText = opt.text;
    return card;
  }

  function instruction() { return item.say || item.text; }

  function render() {
    var st = Shell.$("stage"), i, round = item.round;
    st.innerHTML = "";
    got = {}; attempts = 0; locked = true; firstTry = true;

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
    for (i = 0; i < opts.length; i++) {
      (function (card) {
        card.onclick = function () { tap(card); };
        card.onkeydown = function (e) { if (e.keyCode === 13 || e.keyCode === 32) { e.preventDefault(); tap(card); } };
        cards.appendChild(card);
      })(makeCard(opts[i], round.markFirst, false));
    }
    board.appendChild(cards);
    st.appendChild(board);
    Shell.progress(flat.length, idx);

    var go = Shell.guard(function () {
      if (!tutorialDone && T.tutorial !== false) {
        tutorialDone = true;
        var badge = cards.querySelector(".badge");
        Shell.say(instruction(), Shell.guard(function () {
          Shell.tutorial([
            { node: sayBtn, say: "Tap here to hear the question again." },
            { node: badge, say: "Tap a speaker to hear a word. Then tap the word you choose." }
          ], Shell.guard(function () { locked = false; }));
        }));
      } else {
        locked = false;
        Shell.say(instruction());
      }
    });
    go();
  }

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
        locked = true;
        if (firstTry) { T.score++; }
        starTotal++; Shell.setStars(starTotal);
        Shell.say(card.optText + ". " + praise, Shell.guard(function () {
          Shell.wait(Shell.guard(next), 500);
        }));
      } else {
        Shell.say(card.optText + ". " + praise + " Find one more.");
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
      Shell.say("Try again. " + instruction());
    } else if (attempts === 2) {
      if (item.target) {
        var t = Shell.$("stage").querySelector(".card.target .first");
        if (t) { Shell.flash(t, "mark", 2600); }
        locked = true;
        Shell.say(item.hint2 || ("Listen. " + item.target.text + ". " + item.target.text + "."),
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
    for (i = 0; i < cards.length; i++) { if (cards[i].className.indexOf("got") < 0) { list.push(cards[i]); } }
    locked = true;
    var j = 0;
    var step = Shell.guard(function () {
      if (j >= list.length) { locked = false; Shell.say(instruction()); return; }
      var c = list[j]; j++;
      Shell.flash(c, "pulse", 800);
      Shell.say(c.optText, function () { Shell.wait(step, 200); });
    });
    Shell.say("Listen to each word.", step);
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

  T.start = function () {
    var r, i;
    flat = [];
    for (r = 0; r < C.rounds.length; r++) {
      var its = C.rounds[r].shuffle === false ? C.rounds[r].items : Shell.shuffle(C.rounds[r].items);
      for (i = 0; i < its.length; i++) { its[i].round = C.rounds[r]; flat.push(its[i]); }
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

  T.init = function (content) {
    C = content;
    tutorialDone = false;
    T.score = 0;
  };
  return T;
})();
