/* Buddy: an unnamed, happy, lively child drawn in code (fair skin, rosy
   cheeks, fluffy brown hair, sunny yellow T-shirt, blue shorts, red trainers).
   The child never speaks (the narrator does); it reacts:
     idle (bounces, blinks) · talk (mouth moves while the narrator speaks)
     cheer (jumps, arms up) · think (head tilt after a wrong answer) · wave (home)
   ES5 only. Needs Shell. */
var Buddy = (function () {
  var B = {};
  var INK = "#2E2A4F", SKIN = "#FBD9C4", HAIR = "#7A4A2A", SHIRT = "#FFD23F", SHORTS = "#2EA7FF";
  var O = ' stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  var KID =
    '<svg class="kid" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="60" cy="195" rx="34" ry="5" fill="' + INK + '" opacity=".15"/>' +
    '<g class="b-all">' +
    /* legs, socks, trainers */
    '<path d="M45 148h11v30H45zM64 148h11v30H64z" fill="' + SKIN + '"' + O + "/>" +
    '<path d="M44 174h13v7H44zM63 174h13v7H63z" fill="#fff"' + O.replace("3", "2.5") + "/>" +
    '<path d="M40 181h19v10H38c0-5 1-8 2-10zM61 181h19c1 2 2 5 2 10H61z" fill="#FF3B3B"' + O + "/>" +
    '<path d="M38 191h21M61 191h21" stroke="#fff" stroke-width="2.5"/>' +
    /* arms (behind the body) */
    '<g class="b-arm b-arm-l"><path d="M36 100c-8 10-12 24-12 36" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M36 100c-8 10-12 24-12 36" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' +
    '<circle cx="24" cy="138" r="6.5" fill="' + SKIN + '"' + O.replace("3", "2.5") + "/></g>" +
    '<g class="b-arm b-arm-r"><path d="M84 100c8 10 12 24 12 36" fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M84 100c8 10 12 24 12 36" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' +
    '<circle cx="96" cy="138" r="6.5" fill="' + SKIN + '"' + O.replace("3", "2.5") + "/></g>" +
    /* shorts, T-shirt with a star */
    '<path d="M40 132h40l3 20H64l-4-8-4 8H37z" fill="' + SHORTS + '"' + O + "/>" +
    '<path d="M38 94c6-4 14-6 22-6s16 2 22 6l12 12-8 8-6-4 2 26H38l2-26-6 4-8-8z" fill="' + SHIRT + '"' + O + "/>" +
    '<path d="M60 104l3.5 7.5 8 1-6 5.5 1.6 8-7.1-4-7.1 4 1.6-8-6-5.5 8-1z" fill="#FF7BAC" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M52 90q8 6 16 0" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
    /* head */
    '<g class="b-head">' +
    '<rect x="54" y="80" width="12" height="12" fill="' + SKIN + '"' + O.replace("3", "2.5") + "/>" +
    '<circle cx="33" cy="58" r="7" fill="' + SKIN + '"' + O + '/><circle cx="87" cy="58" r="7" fill="' + SKIN + '"' + O + "/>" +
    '<circle cx="60" cy="56" r="28" fill="' + SKIN + '"' + O + "/>" +
    '<path d="M31 52c-2-18 12-32 29-32 18 0 32 12 30 32-4-8-10-12-16-14 2 4 1 8-2 10-4-6-10-9-18-9-10 0-18 5-23 13z" fill="' + HAIR + '"' + O + "/>" +
    '<path d="M58 21c-2-8 4-14 12-12-6 2-8 6-6 12" fill="' + HAIR + '"' + O.replace("3", "2.5") + "/>" +
    '<path d="M43 47q6-4 11 0M66 47q6-4 11 0" fill="none" stroke="' + HAIR + '" stroke-width="2.6" stroke-linecap="round"/>' +
    '<g class="b-eyes">' +
    '<ellipse cx="49" cy="57" rx="6" ry="7" fill="#fff"' + O.replace("3", "2") + '/><ellipse cx="71" cy="57" rx="6" ry="7" fill="#fff"' + O.replace("3", "2") + "/>" +
    '<circle cx="50" cy="58" r="4.4" fill="#4C7BD9"/><circle cx="72" cy="58" r="4.4" fill="#4C7BD9"/>' +
    '<circle cx="50" cy="58" r="2.2" fill="' + INK + '"/><circle cx="72" cy="58" r="2.2" fill="' + INK + '"/>' +
    '<circle cx="48.4" cy="55.6" r="1.6" fill="#fff"/><circle cx="70.4" cy="55.6" r="1.6" fill="#fff"/></g>' +
    '<circle cx="40" cy="68" r="5" fill="#FF8FA3" opacity=".6"/><circle cx="80" cy="68" r="5" fill="#FF8FA3" opacity=".6"/>' +
    '<path d="M57 63q3 2 6 0" fill="none" stroke="#E0906A" stroke-width="2.2" stroke-linecap="round"/>' +
    '<path class="b-smile" d="M49 69q11 12 22 0z" fill="#fff" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<ellipse class="b-talk" cx="60" cy="73" rx="6.5" ry="5.5" fill="#7A1F3D"' + O.replace("3", "2.4") + "/>" +
    "</g></g></svg>";

  var el = null, mood = "idle", moodTimer = null;

  function setMood(m, ms) {
    if (!el) { return; }
    if (moodTimer) { window.clearTimeout(moodTimer); moodTimer = null; }
    el.className = "buddy " + m + (talking ? " talk" : "");
    mood = m;
    if (ms) { moodTimer = window.setTimeout(function () { setMood("idle"); }, ms); }
  }
  var talking = false;
  function setTalk(on) {
    talking = on;
    if (!el) { return; }
    if (on) { if (el.className.indexOf(" talk") < 0) { el.className += " talk"; } }
    else { el.className = el.className.replace(" talk", ""); }
  }

  /* where the buddy stands on each screen */
  function place(screen) {
    if (!el) { return; }
    var slot = Shell.$(screen === "home" ? "home-mascot" : (screen === "end" ? "end-mascot" : "game-buddy"));
    if (slot && el.parentNode !== slot) { slot.appendChild(el); }
    if (screen === "home") { setMood("wave", 2600); }
    else if (screen === "end") { setMood("cheer", 3200); }
    else { setMood("idle"); }
  }

  /* the buddy never covers the game: after each screen is drawn, if anything
     the child needs sits under its corner, it steps out of view */
  /* where an element will sit once its pop-in animation is over (transforms ignored) */
  function layoutRect(node) {
    var x = 0, y = 0, n = node;
    while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { left: x, top: y, right: x + node.offsetWidth, bottom: y + node.offsetHeight, width: node.offsetWidth };
  }
  var roomTimer = null, fresh = true;
  function checkRoom() {
    var box = Shell.$("game-buddy");
    if (!box) { return; }
    if (box.className.indexOf("away") > -1 && !fresh) { return; }
    fresh = false;
    box.className = "game-buddy";
    var g = box.getBoundingClientRect(), list = document.querySelectorAll(
      "#stage .card, #stage .tile, #stage .chip, #stage .target, #stage .prompt, #stage .lf-word, #stage .lf-pic, #stage .sign"), i, b;
    for (i = 0; i < list.length; i++) {
      b = layoutRect(list[i]);
      if (b.width && b.left < g.right - 4 && b.right > g.left + 4 && b.top < g.bottom - 4 && b.bottom > g.top + 4) {
        box.className = "game-buddy away";
        return;
      }
    }
  }
  var roomTimer2 = null;
  function soon() {
    if (roomTimer) { window.clearTimeout(roomTimer); }
    if (roomTimer2) { window.clearTimeout(roomTimer2); }
    /* once early, and again after every card has finished popping in */
    fresh = true;
    roomTimer = window.setTimeout(checkRoom, 30);
    roomTimer2 = window.setTimeout(checkRoom, 700);
  }

  /* the child's drawing, for games that use it as a picture (e.g. body parts) */
  B.kidInner = function () {
    return KID.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<ellipse class="b-talk"[^>]*\/>/, "");
  };

  B.mount = function (who) {
    if (who !== "kid") { return; }
    el = Shell.el("div", "buddy idle", KID);
    document.body.className += " has-buddy";
    Shell.on("talk", setTalk);
    Shell.on("right", function () { setMood("cheer", 1400); });
    Shell.on("wrong", function () { setMood("think", 1600); });
    Shell.on("screen", place);
    Shell.on("layout", soon);
    window.addEventListener("resize", soon);
  };
  return B;
})();
