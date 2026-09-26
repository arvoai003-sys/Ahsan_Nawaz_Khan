/* ARVO buddy: Asma (Grade 1, age 6) and her dog Fluffy, drawn in code from the
   ARVO character bible: sparkling brown eyes, bright smile, patterned
   light-blue shalwar kameez, navy hijab, pink sandals; Fluffy is in nearly
   every Asma scene. She does not speak (the narrator does); she reacts:
     idle (breathes, blinks) · talk (mouth moves while the narrator speaks)
     cheer (jumps, arms up) · think (head tilt after a wrong answer) · wave (home)
   Fluffy wags beside her and runs across the screen when a level is done.
   ES5 only. Needs Shell. */
var Buddy = (function () {
  var B = {};
  var INK = "#2E2A4F", SKIN = "#E3A77E", SKIN_D = "#C98A60", HIJAB = "#1F2A5C", KAMEEZ = "#9FD3F5";
  var O = ' stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

  var ASMA =
    '<svg class="asma" viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="60" cy="194" rx="34" ry="5" fill="' + INK + '" opacity=".15"/>' +
    '<g class="b-all">' +
    /* legs: shalwar and pink sandals */
    '<path d="M46 150l-2 36h12l2-36zM62 150l2 36h12l-2-36z" fill="' + KAMEEZ + '"' + O + "/>" +
    '<path d="M40 184h18v6H38zM62 184h18l2 6H62z" fill="#FF7BAC"' + O + "/>" +
    /* arms (behind the body) */
    '<g class="b-arm b-arm-l"><path d="M34 98c-8 10-12 24-12 36" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
    '<path d="M34 98c-8 10-12 24-12 36" fill="none" stroke="' + KAMEEZ + '" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="22" cy="138" r="6" fill="' + SKIN + '"' + O.replace("3", "2.5") + "/></g>" +
    '<g class="b-arm b-arm-r"><path d="M86 98c8 10 12 24 12 36" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
    '<path d="M86 98c8 10 12 24 12 36" fill="none" stroke="' + KAMEEZ + '" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="98" cy="138" r="6" fill="' + SKIN + '"' + O.replace("3", "2.5") + "/></g>" +
    /* kameez with a little pattern */
    '<path d="M38 92h44l8 64H30z" fill="' + KAMEEZ + '"' + O + "/>" +
    '<g fill="#fff" opacity=".9"><circle cx="46" cy="112" r="2.4"/><circle cx="62" cy="106" r="2.4"/><circle cx="74" cy="118" r="2.4"/><circle cx="52" cy="128" r="2.4"/><circle cx="68" cy="136" r="2.4"/><circle cx="42" cy="144" r="2.4"/><circle cx="80" cy="146" r="2.4"/></g>' +
    '<g fill="' + HIJAB + '"><circle cx="54" cy="118" r="1.4"/><circle cx="70" cy="126" r="1.4"/><circle cx="46" cy="134" r="1.4"/><circle cx="60" cy="146" r="1.4"/></g>' +
    '<path d="M32 150h56" stroke="#fff" stroke-width="3" opacity=".8"/>' +
    /* head */
    '<g class="b-head">' +
    '<path d="M60 14c24 0 36 18 36 40 0 14-4 24-10 32l8 14c-10 6-22 8-34 8s-24-2-34-8l8-14c-6-8-10-18-10-32 0-22 12-40 36-40z" fill="' + HIJAB + '"' + O + "/>" +
    '<ellipse cx="60" cy="60" rx="23" ry="25" fill="' + SKIN + '"' + O + "/>" +
    '<path d="M37 52c4-14 14-22 23-22s19 8 23 22c-6-6-14-9-23-9s-17 3-23 9z" fill="' + HIJAB + '"/>' +
    '<path d="M44 50q5-4 10 0M66 50q5-4 10 0" fill="none" stroke="#5A3420" stroke-width="2.4" stroke-linecap="round"/>' +
    '<g class="b-eyes">' +
    '<ellipse cx="50" cy="59" rx="6" ry="7" fill="#fff"' + O.replace("3", "2") + '/><ellipse cx="70" cy="59" rx="6" ry="7" fill="#fff"' + O.replace("3", "2") + "/>" +
    '<circle cx="51" cy="60" r="4.4" fill="#6B3E1E"/><circle cx="71" cy="60" r="4.4" fill="#6B3E1E"/>' +
    '<circle cx="51" cy="60" r="2.2" fill="' + INK + '"/><circle cx="71" cy="60" r="2.2" fill="' + INK + '"/>' +
    '<circle cx="49.4" cy="57.6" r="1.6" fill="#fff"/><circle cx="69.4" cy="57.6" r="1.6" fill="#fff"/></g>' +
    '<circle cx="42" cy="70" r="4" fill="#FF7BAC" opacity=".55"/><circle cx="78" cy="70" r="4" fill="#FF7BAC" opacity=".55"/>' +
    '<path class="b-smile" d="M51 71q9 9 18 0" fill="#fff" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<ellipse class="b-talk" cx="60" cy="74" rx="6" ry="5" fill="#7A1F3D"' + O.replace("3", "2.4") + "/>" +
    "</g></g></svg>";

  var FLUFFY =
    '<svg class="fluffy" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="50" cy="76" rx="32" ry="3.5" fill="' + INK + '" opacity=".15"/>' +
    '<g class="f-all">' +
    '<g class="f-tail"><path d="M78 44c10-6 14-16 10-22-6 2-10 12-12 18" fill="#FFF7E6"' + O + "/></g>" +
    '<g fill="#FFF7E6"' + O + '><circle cx="46" cy="52" r="16"/><circle cx="62" cy="50" r="16"/><circle cx="72" cy="58" r="11"/></g>' +
    '<g fill="#FFF7E6"' + O + '><rect x="40" y="60" width="9" height="15" rx="4"/><rect x="64" y="60" width="9" height="15" rx="4"/></g>' +
    '<circle cx="30" cy="36" r="17" fill="#FFF7E6"' + O + "/>" +
    '<path d="M16 26c-6 4-6 16 0 20 4-4 6-14 0-20zM42 22c6 2 8 14 2 20-4-4-6-14-2-20z" fill="#C98A5A"' + O.replace("3", "2.5") + "/>" +
    '<circle cx="25" cy="36" r="2.6" fill="' + INK + '"/><circle cx="36" cy="36" r="2.6" fill="' + INK + '"/>' +
    '<ellipse cx="30" cy="43" rx="3.4" ry="2.6" fill="' + INK + '"/>' +
    '<path class="f-tongue" d="M28 47q2 7 5 0" fill="#FF7BAC" stroke="' + INK + '" stroke-width="1.6"/>' +
    '<path d="M22 48l16 0" stroke="#FF4F6D" stroke-width="3" stroke-linecap="round"/>' +
    "</g></svg>";

  var el = null, dog = null, runner = null, mood = "idle", moodTimer = null;

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

  /* where Asma stands on each screen */
  function place(screen) {
    if (!el) { return; }
    var slot = Shell.$(screen === "home" ? "home-mascot" : (screen === "end" ? "end-mascot" : "game-buddy"));
    if (slot && el.parentNode !== slot) { slot.appendChild(el); }
    if (dog) {
      var dslot = screen === "game" ? Shell.$("game-buddy") : null;
      dog.style.display = dslot ? "" : "none";
      if (dslot && dog.parentNode !== dslot) { dslot.appendChild(dog); }
    }
    if (runner && screen !== "end") { runner.className = "fluffy-run"; }
    if (screen === "home") { setMood("wave", 2600); }
    else if (screen === "end") { setMood("cheer", 3200); runAcross(); }
    else { setMood("idle"); }
  }

  function runAcross() {
    if (!runner) { return; }
    runner.className = "fluffy-run";
    void runner.offsetWidth;
    runner.className = "fluffy-run go";
  }

  /* Asma never covers the game: after each screen is drawn, if anything the
     child needs sits under her corner, she and Fluffy step out of view */
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

  /* Asma's drawing, for games that use her as a picture (e.g. body parts) */
  B.asmaInner = function () {
    return ASMA.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<ellipse class="b-talk"[^>]*\/>/, "");
  };

  B.mount = function (who) {
    if (who !== "asma") { return; }
    el = Shell.el("div", "buddy idle", ASMA);
    dog = Shell.el("div", "buddy-dog", FLUFFY);
    runner = Shell.el("div", "fluffy-run", FLUFFY);
    document.body.appendChild(runner);
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
