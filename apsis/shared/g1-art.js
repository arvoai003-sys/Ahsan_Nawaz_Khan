/* ARVO Grade 1 art: bright, chunky cartoon pictures drawn in code (no image
   files). Thick outlines, shine and friendly faces on objects that suit one.
   Art.get(key) returns an SVG string sized by its container. ES5 only. */
var Art = (function () {
  var A = {};
  var INK = "#2E2A4F";
  var O = ' stroke="' + INK + '" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
  var SVG = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';

  /* face parts */
  function eye(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff"' + O.replace("3.5", "2.2") + "/>" +
      '<circle cx="' + (x + r * 0.15) + '" cy="' + (y + r * 0.15) + '" r="' + (r * 0.58) + '" fill="' + INK + '"/>' +
      '<circle cx="' + (x - r * 0.12) + '" cy="' + (y - r * 0.18) + '" r="' + (r * 0.24) + '" fill="#fff"/>';
  }
  function face(x, y, s) {
    s = s || 1;
    var g = 9 * s, r = 5 * s;
    return eye(x - g, y, r) + eye(x + g, y, r) +
      '<path d="M' + (x - 6 * s) + " " + (y + 8 * s) + " q" + (6 * s) + " " + (6 * s) + " " + (12 * s) + ' 0" fill="none" stroke="' + INK + '" stroke-width="' + (3 * s) + '" stroke-linecap="round"/>' +
      '<circle cx="' + (x - g - 4 * s) + '" cy="' + (y + 8 * s) + '" r="' + (3.4 * s) + '" fill="#FF7BAC" opacity=".6"/>' +
      '<circle cx="' + (x + g + 4 * s) + '" cy="' + (y + 8 * s) + '" r="' + (3.4 * s) + '" fill="#FF7BAC" opacity=".6"/>';
  }
  function shine(x, y, rx, ry, rot) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#fff" opacity=".55" transform="rotate(' + (rot || -30) + " " + x + " " + y + ')"/>';
  }
  function ground(y) { return '<ellipse cx="50" cy="' + (y || 94) + '" rx="30" ry="4" fill="' + INK + '" opacity=".12"/>'; }

  var lib = {
    /* ---------- chapter book words ---------- */
    book: ground() +
      '<path d="M22 14h52a6 6 0 0 1 6 6v64a6 6 0 0 1-6 6H22z" fill="#FFF3D6"' + O + "/>" +
      '<path d="M18 12h52a6 6 0 0 1 6 6v62a6 6 0 0 1-6 6H18z" fill="#FF4F6D"' + O + "/>" +
      '<path d="M26 12v74" stroke="#C7254A" stroke-width="5"/>' + shine(60, 24, 10, 4) + face(50, 48, 1.1),
    stop: ground(96) +
      '<rect x="46" y="62" width="8" height="32" rx="3" fill="#B7C3CF"' + O + "/>" +
      '<path d="M35 6h30l20 20v30L65 76H35L15 56V26z" fill="#FF3B3B"' + O + "/>" +
      '<path d="M37 12h26l16 16v26L63 70H37L21 54V28z" fill="none" stroke="#fff" stroke-width="3"/>' +
      '<text x="50" y="49" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="18" fill="#fff" text-anchor="middle">STOP</text>',
    exit:
      '<rect x="7" y="18" width="86" height="64" rx="12" fill="#23C16B"' + O + "/>" +
      '<text x="50" y="46" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="22" fill="#fff" text-anchor="middle">EXIT</text>' +
      '<path d="M36 74l24-18M49 54h12v12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' + shine(24, 26, 9, 3),
    staff:
      '<path d="M20 96c0-24 13-38 30-38s30 14 30 38z" fill="#2EA7FF"' + O + "/>" +
      '<path d="M40 60l10 20 10-20" fill="none" stroke="#FFD23F" stroke-width="4"/>' +
      '<rect x="39" y="78" width="22" height="16" rx="3" fill="#fff"' + O.replace("3.5", "2.5") + "/>" +
      '<circle cx="45" cy="86" r="3" fill="#FF4F6D"/><path d="M50 84h7M50 89h5" stroke="#2EA7FF" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="50" cy="34" r="20" fill="#F5C29A"' + O + "/>" +
      '<path d="M30 32c0-14 9-22 20-22s20 8 20 22c-5-7-12-10-20-10s-15 3-20 10z" fill="#4A2E24"' + O + "/>" + face(50, 36, 0.8),
    hand:
      '<path d="M32 92c-8-5-14-15-16-24l-6-17c-1-4 1-7 5-8s6 1 7 4l5 11V24c0-4 3-6 6-6s6 2 6 6v20-26c0-4 3-6 6-6s6 2 6 6v26-20c0-4 3-6 6-6s6 2 6 6v24-12c0-4 3-6 6-6s5 2 5 6v26c0 16-10 30-26 30z" fill="#FFC99E"' + O + "/>" +
      '<path d="M46 60q4 4 8 0" fill="none" stroke="#E0906A" stroke-width="3" stroke-linecap="round"/>',
    sign: ground(95) +
      '<rect x="45" y="40" width="10" height="54" rx="3" fill="#B97A4A"' + O + "/>" +
      '<path d="M8 14h66l18 15-18 15H8z" fill="#FFD23F"' + O + "/>" +
      '<path d="M18 29h46" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' + shine(24, 20, 8, 2.5, 0),

    /* ---------- s ---------- */
    sun:
      '<g stroke="#FF9F1C" stroke-width="7" stroke-linecap="round">' +
      '<path d="M50 4v12M50 84v12M4 50h12M84 50h12M17 17l9 9M74 74l9 9M83 17l-9 9M26 74l-9 9"/></g>' +
      '<circle cx="50" cy="50" r="28" fill="#FFD23F"' + O + "/>" + shine(40, 36, 8, 4) + face(50, 50, 1.05),
    sock:
      '<path d="M34 8h30v46c0 6 3 10 8 14l6 5c6 5 6 14 0 19-4 4-11 5-16 1L36 72c-5-4-6-8-6-14V8z" fill="#fff"' + O + "/>" +
      '<path d="M32 22h32M32 36h32M32 50h32" stroke="#FF4F6D" stroke-width="7"/>' +
      '<path d="M34 8h30v8H34z" fill="#9B5DE5"' + O + "/>" +
      '<path d="M60 84c3 3 9 3 13-1" fill="none" stroke="#2EA7FF" stroke-width="6" stroke-linecap="round"/>',
    soap:
      '<circle cx="24" cy="22" r="8" fill="#BDEBFF"' + O.replace("3.5", "2.5") + '/><circle cx="76" cy="16" r="6" fill="#BDEBFF"' + O.replace("3.5", "2.5") + '/><circle cx="84" cy="34" r="4" fill="#BDEBFF"' + O.replace("3.5", "2.5") + "/>" +
      '<rect x="14" y="40" width="72" height="44" rx="18" fill="#FF8FC8"' + O + "/>" + shine(34, 50, 12, 4, -10) + face(50, 60, 1),

    /* ---------- b ---------- */
    bus:
      '<rect x="8" y="22" width="84" height="52" rx="12" fill="#FFD23F"' + O + "/>" +
      '<rect x="16" y="30" width="18" height="16" rx="4" fill="#BDEBFF"' + O.replace("3.5", "2.5") + '/><rect x="40" y="30" width="18" height="16" rx="4" fill="#BDEBFF"' + O.replace("3.5", "2.5") + '/><rect x="64" y="30" width="20" height="24" rx="4" fill="#BDEBFF"' + O.replace("3.5", "2.5") + "/>" +
      '<path d="M8 56h56" stroke="#FF9F1C" stroke-width="5"/>' +
      '<circle cx="28" cy="76" r="10" fill="' + INK + '"/><circle cx="28" cy="76" r="4" fill="#DDE3EA"/><circle cx="72" cy="76" r="10" fill="' + INK + '"/><circle cx="72" cy="76" r="4" fill="#DDE3EA"/>' +
      '<circle cx="88" cy="64" r="3.5" fill="#FF4F6D"/>',
    ball:
      '<circle cx="50" cy="52" r="36" fill="#fff"' + O + "/>" +
      '<path d="M50 16a36 36 0 0 1 30 16L50 52z" fill="#FF4F6D"/><path d="M86 52a36 36 0 0 1-16 30L50 52z" fill="#FFD23F"/>' +
      '<path d="M50 88a36 36 0 0 1-30-16L50 52z" fill="#2EA7FF"/><path d="M14 52a36 36 0 0 1 16-30L50 52z" fill="#23C16B"/>' +
      '<circle cx="50" cy="52" r="36" fill="none"' + O + '/><circle cx="50" cy="52" r="7" fill="#fff"' + O.replace("3.5", "2.5") + "/>" + shine(34, 32, 9, 4),
    bag:
      '<path d="M36 22c0-10 28-10 28 0" fill="none" stroke="' + INK + '" stroke-width="6"/>' +
      '<rect x="18" y="22" width="64" height="70" rx="16" fill="#2EA7FF"' + O + "/>" +
      '<rect x="28" y="58" width="44" height="26" rx="8" fill="#FFD23F"' + O + "/>" +
      '<path d="M28 68h44" stroke="' + INK + '" stroke-width="3"/>' + shine(32, 34, 8, 3),
    bell:
      '<path d="M50 8v8" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M24 74c4-6 6-12 6-26 0-14 9-24 20-24s20 10 20 24c0 14 2 20 6 26z" fill="#FFC53D"' + O + "/>" +
      '<rect x="18" y="72" width="64" height="10" rx="5" fill="#FF9F1C"' + O + "/>" +
      '<circle cx="50" cy="88" r="7" fill="#FF4F6D"' + O + "/>" + shine(40, 38, 5, 10, 15),
    banana:
      '<path d="M20 30c-4 30 16 56 52 56 8 0 12-4 10-8-30 2-50-18-52-48 0-4-8-4-10 0z" fill="#FFE14D"' + O + "/>" +
      '<path d="M24 26l-2-10" stroke="#6B4A2E" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M28 42c4 18 18 32 40 36" fill="none" stroke="#F2B90C" stroke-width="3" stroke-linecap="round"/>',

    /* ---------- h ---------- */
    hat:
      '<ellipse cx="50" cy="74" rx="44" ry="12" fill="#9B5DE5"' + O + "/>" +
      '<path d="M24 72c0-30 8-50 26-50s26 20 26 50z" fill="#9B5DE5"' + O + "/>" +
      '<path d="M25 60h50v10H25z" fill="#FFD23F"' + O.replace("3.5", "3") + "/>" + shine(38, 36, 5, 10, 10),
    house:
      '<rect x="20" y="44" width="60" height="48" rx="4" fill="#FFF3D6"' + O + "/>" +
      '<path d="M10 48L50 12l40 36z" fill="#FF4F6D"' + O + "/>" +
      '<rect x="42" y="64" width="16" height="28" rx="3" fill="#2EA7FF"' + O.replace("3.5", "3") + "/>" +
      '<rect x="26" y="54" width="12" height="12" rx="2" fill="#BDEBFF"' + O.replace("3.5", "2.5") + '/><rect x="62" y="54" width="12" height="12" rx="2" fill="#BDEBFF"' + O.replace("3.5", "2.5") + "/>",
    hen:
      '<path d="M22 60c0-18 12-30 30-30 2-10 8-16 16-16s14 8 14 16c0 10-6 14-6 20 0 20-14 36-32 36S22 76 22 60z" fill="#fff"' + O + "/>" +
      '<path d="M62 14c0-6 4-8 6-4 1-5 6-5 7 0 3-3 7 0 5 4" fill="#FF3B3B"' + O.replace("3.5", "2.5") + "/>" +
      '<path d="M82 30l10 4-10 4z" fill="#FF9F1C"' + O.replace("3.5", "2.5") + "/>" +
      '<path d="M78 40c0 6-4 8-6 4" fill="#FF3B3B" stroke="' + INK + '" stroke-width="2"/>' + eye(70, 28, 4.5) +
      '<path d="M30 58c8 10 22 10 28 0" fill="none" stroke="#DDE3EA" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M44 90v6M56 90v6" stroke="#FF9F1C" stroke-width="4" stroke-linecap="round"/>',

    /* ---------- e ---------- */
    egg:
      '<path d="M50 8c20 0 34 30 34 52 0 20-15 32-34 32S16 80 16 60C16 38 30 8 50 8z" fill="#FFF7E6"' + O + "/>" + shine(36, 32, 6, 12, 20) + face(50, 60, 1),
    elephant:
      '<path d="M22 30c-14 0-18 14-14 26 4 10 14 12 22 8M78 30c14 0 18 14 14 26-4 10-14 12-22 8" fill="#B8D4F2"' + O + "/>" +
      '<path d="M50 14c18 0 28 12 28 28 0 12-6 20-14 24v10c0 10-6 18-14 18s-10-6-8-10c4 0 6-4 6-8V66c-8-4-14-12-14-24 0-16 10-28 16-28z" fill="#8FB8E8"' + O + "/>" +
      eye(40, 38, 5.5) + eye(60, 38, 5.5) +
      '<circle cx="34" cy="50" r="4" fill="#FF7BAC" opacity=".6"/><circle cx="66" cy="50" r="4" fill="#FF7BAC" opacity=".6"/>' +
      '<path d="M44 76q-6 2-8-2M56 76q6 2 8-2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>' + shine(42, 22, 8, 3, 0),

    /* ---------- m ---------- */
    mouth:
      '<path d="M10 46c12-12 24-14 40-6 16-8 28-6 40 6-10 26-26 38-40 38S20 72 10 46z" fill="#FF4F6D"' + O + "/>" +
      '<path d="M18 50c14 6 50 6 64 0-6 10-12 14-12 14H30s-6-4-12-14z" fill="#fff"' + O.replace("3.5", "2.5") + "/>" +
      '<path d="M42 52v10M58 52v10" stroke="#DDE3EA" stroke-width="2"/>' + shine(32, 46, 6, 2, -10),
    moon:
      '<path d="M62 10a40 40 0 1 0 28 64A32 32 0 0 1 62 10z" fill="#FFE14D"' + O + "/>" +
      '<path d="M28 50q4 4 8 0M42 58q4 4 8 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M34 68q6 5 12 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="26" cy="62" r="3.5" fill="#FF7BAC" opacity=".6"/>' +
      '<path d="M82 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFD23F"' + O.replace("3.5", "1.5") + "/>",
    milk:
      '<path d="M26 16h48l-6 76H32z" fill="#E8F6FF"' + O + "/>" +
      '<path d="M28.5 36h43l-4.3 56H32.8z" fill="#fff"/>' +
      '<path d="M28 36q6 5 11 0t11 0 11 0 11 0" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M26 16h48l-6 76H32z" fill="none"' + O + "/>" + face(50, 62, 0.8),
    mango:
      '<path d="M30 20c-6-6-4-14 4-16 4 6 2 12-4 16z" fill="#23C16B"' + O.replace("3.5", "3") + "/>" +
      '<path d="M32 18c-14 6-20 22-14 40 8 24 30 36 50 30 14-4 18-18 10-30-6-10-18-12-24-22-6-10-12-22-22-18z" fill="#FFC21A"' + O + "/>" +
      '<path d="M64 64c8 4 16 10 14 20" fill="none" stroke="#FF6B2C" stroke-width="10" opacity=".45" stroke-linecap="round"/>' +
      '<path d="M26 32c-4 10-2 22 4 30" fill="none" stroke="#9BD85B" stroke-width="7" opacity=".6" stroke-linecap="round"/>' + shine(40, 40, 5, 11, 25),

    /* ---------- f ---------- */
    face:
      '<circle cx="50" cy="54" r="36" fill="#FFC99E"' + O + "/>" +
      '<path d="M16 46c2-22 18-34 34-34s32 12 34 34c-8-10-20-14-34-14S24 36 16 46z" fill="#4A2E24"' + O + "/>" +
      '<circle cx="14" cy="56" r="6" fill="#FFC99E"' + O.replace("3.5", "3") + '/><circle cx="86" cy="56" r="6" fill="#FFC99E"' + O.replace("3.5", "3") + "/>" + face(50, 56, 1.2),
    foot:
      '<path d="M30 40c0-8 10-12 20-12s22 4 22 16c0 14-8 20-8 32 0 10-6 16-16 16S30 86 30 74c0-10 4-14 4-20 0-6-4-8-4-14z" fill="#FFC99E"' + O + "/>" +
      '<g fill="#FFC99E"' + O.replace("3.5", "2.8") + '><ellipse cx="34" cy="20" rx="7.5" ry="9"/><ellipse cx="48" cy="14" rx="6" ry="7"/><ellipse cx="60" cy="14" rx="5.5" ry="6.5"/><ellipse cx="70" cy="18" rx="5" ry="6"/><ellipse cx="78" cy="26" rx="4.5" ry="5.5"/></g>' +
      '<path d="M44 56q8 4 14 0" fill="none" stroke="#E0906A" stroke-width="3" stroke-linecap="round"/>',
    fish:
      '<path d="M76 50l18-16v32z" fill="#FF6B2C"' + O + "/>" +
      '<path d="M8 50c10-22 50-30 70 0-20 30-60 22-70 0z" fill="#FF9F1C"' + O + "/>" +
      '<path d="M40 34c6 10 6 22 0 32" fill="none" stroke="#FF6B2C" stroke-width="4" stroke-linecap="round"/>' + eye(24, 46, 5.5) +
      '<path d="M14 58q4 3 8 0" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="12" cy="24" r="4" fill="#BDEBFF"' + O.replace("3.5", "2") + '/><circle cx="20" cy="12" r="3" fill="#BDEBFF"' + O.replace("3.5", "2") + "/>",
    fan:
      '<path d="M44 66h12l6 24H38z" fill="#9B5DE5"' + O + "/>" +
      '<circle cx="50" cy="40" r="32" fill="#E8F6FF"' + O + "/>" +
      '<g fill="#2EA7FF"' + O.replace("3.5", "2.5") + '><path d="M50 40c-4-12 0-22 8-22s8 12-8 22z"/><path d="M50 40c12-2 20 4 18 12s-12 6-18-12z"/><path d="M50 40c-8 10-18 12-22 5s6-12 22-5z"/></g>' +
      '<circle cx="50" cy="40" r="5" fill="#FFD23F"' + O.replace("3.5", "2.5") + "/>",

    /* ---------- t ---------- */
    tap:
      '<rect x="20" y="30" width="46" height="16" rx="6" fill="#B7C3CF"' + O + "/>" +
      '<path d="M54 46h12v14H54z" fill="#B7C3CF"' + O + "/>" +
      '<rect x="36" y="14" width="10" height="16" fill="#B7C3CF"' + O + '/><rect x="26" y="8" width="30" height="8" rx="4" fill="#FF4F6D"' + O + "/>" +
      '<path d="M60 68c-5 8-6 12-6 15a6 6 0 0 0 12 0c0-3-1-7-6-15z" fill="#2EA7FF"' + O.replace("3.5", "2.5") + "/>" + shine(34, 36, 6, 2, 0),
    tree:
      '<rect x="42" y="56" width="16" height="36" rx="4" fill="#B97A4A"' + O + "/>" +
      '<path d="M50 8c14 0 22 8 22 16 10 2 16 10 16 20 0 12-10 20-22 20H34c-12 0-22-8-22-20 0-10 6-18 16-20 0-8 8-16 22-16z" fill="#23C16B"' + O + "/>" +
      '<circle cx="34" cy="40" r="4" fill="#FF4F6D"/><circle cx="62" cy="30" r="4" fill="#FF4F6D"/><circle cx="66" cy="52" r="4" fill="#FF4F6D"/>' + shine(38, 24, 8, 4),
    teeth:
      '<path d="M12 34c0-12 8-18 16-16 6 2 8 2 12 0 8-2 14 4 14 16 0 14-4 20-6 34-1 6-8 6-9 0l-3-12-3 12c-1 6-8 6-9 0-2-14-6-20-6-34z" fill="#fff"' + O + "/>" +
      '<path d="M46 34c0-12 8-18 16-16 6 2 8 2 12 0 8-2 14 4 14 16 0 14-4 20-6 34-1 6-8 6-9 0l-3-12-3 12c-1 6-8 6-9 0-2-14-6-20-6-34z" fill="#fff"' + O + "/>" +
      face(32, 36, 0.55) + face(66, 36, 0.55) +
      '<path d="M84 12l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFD23F"' + O.replace("3.5", "1.5") + "/>",
    toys:
      '<rect x="56" y="58" width="34" height="34" rx="6" fill="#FFD23F"' + O + '/><text x="73" y="84" font-family="Arial Black, Arial, sans-serif" font-size="22" font-weight="900" fill="#FF4F6D" text-anchor="middle">A</text>' +
      '<circle cx="24" cy="22" r="9" fill="#C98A5A"' + O + '/><circle cx="54" cy="22" r="9" fill="#C98A5A"' + O + "/>" +
      '<ellipse cx="39" cy="70" rx="22" ry="22" fill="#C98A5A"' + O + '/><ellipse cx="39" cy="74" rx="12" ry="13" fill="#F2D2B0"/>' +
      '<circle cx="39" cy="36" r="20" fill="#C98A5A"' + O + '/><ellipse cx="39" cy="44" rx="8" ry="6" fill="#F2D2B0"/>' +
      eye(32, 32, 3.5) + eye(46, 32, 3.5) + '<circle cx="39" cy="41" r="3" fill="' + INK + '"/>',

    /* ---------- n ---------- */
    nose:
      '<path d="M50 10c6 0 8 8 10 24l6 30c10 2 16 8 14 16-2 6-10 8-18 6-4 4-20 4-24 0-8 2-16 0-18-6-2-8 4-14 14-16l6-30C42 18 44 10 50 10z" fill="#FFC99E"' + O + "/>" +
      '<ellipse cx="41" cy="80" rx="5" ry="3.5" fill="#A0603A"/><ellipse cx="59" cy="80" rx="5" ry="3.5" fill="#A0603A"/>' + shine(52, 36, 3, 12, 0),
    nest:
      '<circle cx="36" cy="46" r="11" fill="#7EC8FF"' + O + '/><circle cx="52" cy="42" r="11" fill="#7EC8FF"' + O + '/><circle cx="67" cy="47" r="11" fill="#7EC8FF"' + O + "/>" +
      '<path d="M8 52c4 26 22 38 42 38s38-12 42-38z" fill="#B97A4A"' + O + "/>" +
      '<path d="M14 60c20 6 52 6 72 0M20 72c16 5 44 5 60 0M10 52c10 6 22 2 30 6s20-2 30 2 16-2 22-6" fill="none" stroke="#8A5530" stroke-width="3" stroke-linecap="round"/>',
    nine:
      '<circle cx="50" cy="50" r="42" fill="#9B5DE5"' + O + "/>" +
      '<text x="50" y="72" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="62" fill="#fff" text-anchor="middle" stroke="' + INK + '" stroke-width="2">9</text>' + shine(28, 26, 8, 4),

    /* ---------- d ---------- */
    door:
      '<rect x="22" y="8" width="56" height="86" rx="6" fill="#2EA7FF"' + O + "/>" +
      '<rect x="31" y="18" width="38" height="28" rx="4" fill="#7EC8FF"' + O.replace("3.5", "2.5") + '/><rect x="31" y="54" width="38" height="30" rx="4" fill="#7EC8FF"' + O.replace("3.5", "2.5") + "/>" +
      '<circle cx="66" cy="52" r="5" fill="#FFD23F"' + O.replace("3.5", "2.5") + "/>",
    duck:
      '<path d="M16 58c0-6 4-10 10-10h14c-6-4-8-10-8-16 0-12 10-20 22-20s20 10 20 20c0 8-4 14-10 18 14 0 24 8 24 20 0 14-14 22-34 22S16 84 16 58z" fill="#FFD23F"' + O + "/>" +
      '<path d="M74 30c8-2 16 0 18 4-4 4-12 6-18 4z" fill="#FF9F1C"' + O.replace("3.5", "2.5") + "/>" + eye(62, 28, 5) +
      '<path d="M34 66c10 8 24 8 32 0" fill="none" stroke="#F2B90C" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="54" cy="40" r="3.5" fill="#FF7BAC" opacity=".6"/>',
    drum:
      '<path d="M22 20l-12-12M78 20l12-12" stroke="#B97A4A" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M14 36v36c0 10 16 18 36 18s36-8 36-18V36z" fill="#FF4F6D"' + O + "/>" +
      '<path d="M14 40l14 44M36 46l-8 38M36 46l20 42M64 46l-8 42M64 46l14 36M86 40l-8 44" fill="none" stroke="#FFD23F" stroke-width="3"/>' +
      '<ellipse cx="50" cy="36" rx="36" ry="12" fill="#FFF7E6"' + O + "/>",

    /* ---------- l ---------- */
    leg:
      '<path d="M34 6h32v14H34z" fill="#2EA7FF"' + O + "/>" +
      '<path d="M38 20h22l-2 50H40z" fill="#FFC99E"' + O + "/>" +
      '<path d="M36 70h26v8c10 0 22 4 26 10 2 4 0 6-4 6H36z" fill="#FF4F6D"' + O + "/>" +
      '<path d="M40 88h46" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M42 42q6 3 12 0" fill="none" stroke="#E0906A" stroke-width="2.5" stroke-linecap="round"/>',
    leaf:
      '<path d="M18 84C12 44 40 14 86 12c2 44-26 74-68 72z" fill="#23C16B"' + O + "/>" +
      '<path d="M18 84C38 60 56 42 80 18M40 62l-6-18M54 48l-2-16M40 62l18 2M54 48l16 0" fill="none" stroke="#149E52" stroke-width="3" stroke-linecap="round"/>' + shine(56, 30, 8, 3, -40),
    lion:
      '<g fill="#E8791B"' + O + '><circle cx="50" cy="10" r="10"/><circle cx="78" cy="20" r="10"/><circle cx="90" cy="48" r="10"/><circle cx="80" cy="76" r="10"/><circle cx="50" cy="90" r="10"/><circle cx="20" cy="76" r="10"/><circle cx="10" cy="48" r="10"/><circle cx="22" cy="20" r="10"/></g>' +
      '<circle cx="50" cy="50" r="38" fill="#E8791B"/>' +
      '<circle cx="28" cy="28" r="8" fill="#FFB84D"' + O + '/><circle cx="72" cy="28" r="8" fill="#FFB84D"' + O + "/>" +
      '<circle cx="50" cy="52" r="27" fill="#FFB84D"' + O + '/><ellipse cx="50" cy="62" rx="12" ry="9" fill="#FFE3B3"/>' +
      eye(40, 46, 5) + eye(60, 46, 5) +
      '<path d="M45 56h10l-5 5z" fill="' + INK + '"/><path d="M44 64q6 5 12 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>',
    lollipop:
      '<rect x="46" y="54" width="8" height="42" rx="3" fill="#fff"' + O + "/>" +
      '<circle cx="50" cy="36" r="30" fill="#FF7BAC"' + O + "/>" +
      '<path d="M50 36m-4 0a4 4 0 1 1 8 0a10 10 0 1 1-20 0a16 16 0 1 1 32 0a22 22 0 1 1-44 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>' + shine(36, 22, 6, 3),

    /* ---------- UI ---------- */
    home:
      '<path d="M16 48L50 18l34 30" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M26 44v36h48V44" fill="none" stroke="#fff" stroke-width="9" stroke-linejoin="round"/>',
    trophy:
      '<path d="M26 16h48v18c0 16-10 28-24 28S26 50 26 34z" fill="#FFD23F"' + O + "/>" +
      '<path d="M26 22H12c0 14 6 20 16 20M74 22h14c0 14-6 20-16 20" fill="none"' + O + "/>" +
      '<rect x="44" y="62" width="12" height="14" fill="#FF9F1C"' + O + '/><rect x="28" y="76" width="44" height="14" rx="4" fill="#9B5DE5"' + O + "/>" +
      '<path d="M50 24l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff"/>' + shine(36, 28, 3, 8, 0),
    chick:
      '<ellipse cx="50" cy="94" rx="26" ry="4" fill="' + INK + '" opacity=".12"/>' +
      '<path d="M50 6c6 0 8 6 4 10" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
      '<ellipse cx="50" cy="54" rx="38" ry="38" fill="#FFD23F"' + O + "/>" +
      '<path d="M12 58c-6-4-8-14-2-16 6 0 10 8 10 14M88 58c6-4 8-14 2-16-6 0-10 8-10 14" fill="#FFC21A"' + O.replace("3.5", "3") + "/>" +
      eye(37, 46, 9) + eye(63, 46, 9) +
      '<path d="M43 60h14l-7 9z" fill="#FF9F1C"' + O.replace("3.5", "2.5") + "/>" +
      '<circle cx="26" cy="62" r="6" fill="#FF7BAC" opacity=".6"/><circle cx="74" cy="62" r="6" fill="#FF7BAC" opacity=".6"/>' + shine(34, 24, 10, 5)
  };
  /* body parts, book p.38 style: a child's portrait with a red arrow to the part */
  function kid(tipX, tipY, fromX, fromY, longHair) {
    var hair = longHair ?
      '<path d="M26 44c-2-22 10-34 24-34s26 12 24 34c4 10 4 22-2 30-2-14-4-24-6-30-8 4-24 4-32 0-2 6-4 16-6 30-6-8-6-20-2-30z" fill="#4A2E24"' + O + "/>" :
      '<path d="M28 42c0-18 10-28 22-28s22 10 22 28c-6-8-14-11-22-11s-16 3-22 11z" fill="#4A2E24"' + O + "/>";
    var dx = tipX - fromX, dy = tipY - fromY, len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
    var bx = tipX - ux * 9, by = tipY - uy * 9, px = -uy * 6, py = ux * 6;
    return '<path d="M22 100c2-14 12-20 28-20s26 6 28 20z" fill="#2EA7FF"' + O + "/>" +
      '<rect x="42" y="64" width="16" height="18" fill="#FFC99E"' + O + "/>" +
      (longHair ? hair : "") +
      '<circle cx="27" cy="48" r="6" fill="#FFC99E"' + O.replace("3.5", "3") + '/><circle cx="73" cy="48" r="6" fill="#FFC99E"' + O.replace("3.5", "3") + "/>" +
      '<ellipse cx="50" cy="46" rx="23" ry="25" fill="#FFC99E"' + O + "/>" +
      (longHair ? '<path d="M28 40c4-14 12-20 22-20s18 6 22 20c-8-6-14-8-22-8s-14 2-22 8z" fill="#4A2E24"/>' : hair) +
      face(50, 46, 0.75) +
      '<path d="M' + fromX + " " + fromY + "L" + bx.toFixed(1) + " " + by.toFixed(1) + '" stroke="#FF3B3B" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M' + tipX + " " + tipY + "L" + (bx + px).toFixed(1) + " " + (by + py).toFixed(1) + "L" + (bx - px).toFixed(1) + " " + (by - py).toFixed(1) + 'z" fill="#FF3B3B" stroke="#FF3B3B" stroke-width="2" stroke-linejoin="round"/>';
  }
  /* ---------- senses (A14) ---------- */
  lib.eyes =
    '<ellipse cx="28" cy="50" rx="21" ry="16" fill="#fff"' + O + "/>" + '<ellipse cx="72" cy="50" rx="21" ry="16" fill="#fff"' + O + "/>" +
    '<circle cx="30" cy="51" r="10" fill="#6B4A2E"/><circle cx="74" cy="51" r="10" fill="#6B4A2E"/>' +
    '<circle cx="30" cy="51" r="5" fill="' + INK + '"/><circle cx="74" cy="51" r="5" fill="' + INK + '"/>' +
    '<circle cx="27" cy="47" r="3" fill="#fff"/><circle cx="71" cy="47" r="3" fill="#fff"/>' +
    '<path d="M10 32l-4-7M18 27l-2-8M28 25v-8M60 25v-8M70 27l2-8M80 32l4-7" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M8 20q20-10 38 2M54 22q18-12 38-2" fill="none" stroke="#4A2E24" stroke-width="5" stroke-linecap="round"/>';
  lib.ears =
    '<path d="M50 8c20 0 32 14 32 32 0 14-8 20-12 28-4 10-6 22-20 22-10 0-16-8-16-14 0-8 8-10 10-18 2-6-6-8-6-16 0-8 6-12 12-12 8 0 12 6 12 12" fill="#FFC99E"' + O + "/>" +
    '<path d="M50 20c12 0 20 8 20 20 0 8-4 12-8 18" fill="none" stroke="#E0906A" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M14 40q-6 10 0 20M6 34q-10 16 0 32" fill="none" stroke="#2EA7FF" stroke-width="4" stroke-linecap="round"/>';
  lib.tongue =
    '<circle cx="50" cy="44" r="36" fill="#FFC99E"' + O + "/>" + eye(38, 34, 5) + eye(62, 34, 5) +
    '<path d="M30 52q20 16 40 0" fill="#7A1F3D"' + O + "/>" +
    '<path d="M40 58c0 14 4 24 10 24s10-10 10-24c-6 4-14 4-20 0z" fill="#FF7BAC"' + O + "/>" +
    '<path d="M50 62v12" stroke="#E0457B" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="26" cy="48" r="4" fill="#FF7BAC" opacity=".6"/><circle cx="74" cy="48" r="4" fill="#FF7BAC" opacity=".6"/>';
  lib.pet =
    '<path d="M20 90c0-20 10-34 30-34s30 14 30 34z" fill="#FFB866"' + O + "/>" +
    '<path d="M26 34l-6-22 18 12M74 34l6-22-18 12" fill="#FFB866"' + O + "/>" +
    '<circle cx="50" cy="42" r="24" fill="#FFB866"' + O + "/>" +
    '<path d="M38 44q4-4 8 0M54 44q4-4 8 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M47 52h6l-3 3z" fill="#FF7BAC"/><path d="M44 57q6 4 12 0" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M24 52l-12-2M24 56l-12 3M76 52l12-2M76 56l12 3" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M56 10c10-4 22 0 26 8 2 4-2 6-6 4l-14-4c-6-2-10-6-6-8z" fill="#FFC99E"' + O.replace("3.5", "3") + "/>" +
    '<path d="M86 30c4-2 8 0 8 4" fill="none" stroke="#FF4F6D" stroke-width="3" stroke-linecap="round"/><path d="M88 22c3-3 8-2 8 2" fill="none" stroke="#FF4F6D" stroke-width="3" stroke-linecap="round"/>';
  lib.flower =
    '<path d="M50 56v38" stroke="#23C16B" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M50 78c-12-10-24-8-26-2 6 6 18 6 26 2zM50 70c10-10 22-10 26-4-6 6-18 8-26 4z" fill="#23C16B"' + O.replace("3.5", "2.5") + "/>" +
    '<g fill="#FF7BAC"' + O.replace("3.5", "3") + '><circle cx="50" cy="16" r="13"/><circle cx="70" cy="30" r="13"/><circle cx="63" cy="52" r="13"/><circle cx="37" cy="52" r="13"/><circle cx="30" cy="30" r="13"/></g>' +
    '<circle cx="50" cy="36" r="12" fill="#FFD23F"' + O.replace("3.5", "3") + "/>" + face(50, 34, 0.45);
  lib.icecream =
    '<path d="M32 50l18 44 18-44z" fill="#F2B866"' + O + "/>" +
    '<path d="M38 60l20 14M36 52l26 18M44 78l14-18M40 66l20-14" stroke="#C98A3A" stroke-width="2.5"/>' +
    '<circle cx="50" cy="30" r="20" fill="#FF8FC8"' + O + "/>" + '<circle cx="36" cy="46" r="12" fill="#FF8FC8"' + O.replace("3.5", "3") + '/><circle cx="64" cy="46" r="12" fill="#FF8FC8"' + O.replace("3.5", "3") + "/>" +
    '<path d="M50 6c2-6 8-6 8 0" fill="none" stroke="#FF3B3B" stroke-width="3"/><circle cx="50" cy="8" r="6" fill="#FF3B3B"' + O.replace("3.5", "2.5") + "/>" +
    '<circle cx="42" cy="26" r="2" fill="#fff"/><circle cx="58" cy="34" r="2" fill="#FFD23F"/><circle cx="48" cy="40" r="2" fill="#2EA7FF"/>' + shine(42, 20, 5, 3);

  /* ---------- signs (A3): drawn from the book's pictures, pp.28-32 ---------- */
  function board(fill, text, size, color, extra) {
    return '<rect x="6" y="22" width="88" height="54" rx="8" fill="' + fill + '"' + O + "/>" + (extra || "") +
      '<text x="50" y="' + (49 + size * 0.35) + '" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="' + size + '" fill="' + (color || INK) + '" text-anchor="middle">' + text + "</text>";
  }
  function noSign(inner) {
    return '<circle cx="50" cy="50" r="42" fill="#fff"' + O + "/>" + inner +
      '<circle cx="50" cy="50" r="36" fill="none" stroke="#E4252B" stroke-width="9"/><path d="M25 25l50 50" stroke="#E4252B" stroke-width="9" stroke-linecap="round"/>';
  }
  lib.entrance = '<rect x="18" y="40" width="64" height="54" fill="#E4453A"' + O + "/>" +
    '<rect x="26" y="50" width="22" height="44" fill="#FF6B5E"' + O.replace("3.5", "2.5") + '/><rect x="52" y="50" width="22" height="44" fill="#FF6B5E"' + O.replace("3.5", "2.5") + "/>" +
    '<path d="M46 72v6M54 72v6" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="8" y="12" width="84" height="22" rx="4" fill="#fff"' + O + "/>" +
    '<text x="50" y="29" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="14" fill="' + INK + '" text-anchor="middle">ENTRANCE</text>';
  lib.washsign = '<rect x="10" y="14" width="80" height="72" rx="8" fill="#2EA7FF"' + O + "/>" +
    '<text x="50" y="38" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="14" fill="#fff" text-anchor="middle">Wash your</text>' +
    '<text x="50" y="56" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="14" fill="#fff" text-anchor="middle">hands</text>' +
    '<path d="M34 66h14v-4h6v8H40v8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M58 70q6 6 12 0" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>';
  lib.bookslabel = '<path d="M30 6v14M70 6v14" stroke="' + INK + '" stroke-width="3"/>' + board("#fff", "BOOKS", 19) +
    '<path d="M20 84h60" stroke="#B97A4A" stroke-width="5"/><rect x="24" y="80" width="8" height="12" fill="#FF4F6D"/><rect x="34" y="78" width="7" height="14" fill="#2EA7FF"/><rect x="43" y="80" width="8" height="12" fill="#FFD23F"/><rect x="53" y="77" width="7" height="15" fill="#23C16B"/>';
  lib.toyslabel = '<path d="M30 6v14M70 6v14" stroke="' + INK + '" stroke-width="3"/>' + board("#fff", "TOYS", 22) +
    '<circle cx="36" cy="86" r="7" fill="#FF4F6D"' + O.replace("3.5", "2") + '/><rect x="52" y="80" width="14" height="14" fill="#FFD23F"' + O.replace("3.5", "2") + "/>";
  lib.danger = '<rect x="46" y="70" width="8" height="26" fill="#B97A4A"' + O.replace("3.5", "2.5") + "/>" +
    '<rect x="6" y="18" width="88" height="54" rx="6" fill="#FFD23F"' + O + "/>" +
    '<text x="50" y="41" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="15" fill="' + INK + '" text-anchor="middle">Danger</text>' +
    '<text x="50" y="61" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="13" fill="' + INK + '" text-anchor="middle">Deep Water</text>' +
    '<path d="M4 92q8-6 16 0t16 0 16 0 16 0 16 0 16 0" fill="none" stroke="#2EA7FF" stroke-width="4"/>';
  lib.slippery = '<path d="M50 4L96 50 50 96 4 50z" fill="#FFD23F"' + O + "/>" +
    '<path d="M36 44h28l4 10H32z" fill="' + INK + '"/><rect x="38" y="36" width="24" height="10" rx="3" fill="' + INK + '"/>' +
    '<circle cx="38" cy="56" r="3.5" fill="' + INK + '"/><circle cx="62" cy="56" r="3.5" fill="' + INK + '"/>' +
    '<path d="M40 62c-6 6 6 10 0 18M58 62c-6 6 6 10 0 18" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
  lib.nowaste = noSign('<path d="M30 40h26v10h8v10h-8v-4H30z" fill="#8C9AA5"/><rect x="38" y="30" width="8" height="10" fill="#8C9AA5"/><path d="M60 64c-3 5-4 8-4 10a4 4 0 0 0 8 0c0-2-1-5-4-10z" fill="#2EA7FF"/>');
  lib.slow = '<rect x="46" y="70" width="8" height="26" fill="#B7C3CF"' + O.replace("3.5", "2.5") + "/>" +
    '<path d="M50 4L92 46 50 88 8 46z" fill="#FFD23F"' + O + "/>" +
    '<text x="50" y="54" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="20" fill="' + INK + '" text-anchor="middle">SLOW</text>';
  lib.nodive = noSign('<path d="M26 66q8-6 16 0t16 0 16 0" fill="none" stroke="#2EA7FF" stroke-width="4"/><circle cx="66" cy="34" r="5" fill="' + INK + '"/><path d="M62 38L40 58M50 48l-12-4M50 48l6 10" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>');
  lib.nodrink = noSign('<path d="M30 34h24v8h8v8h-8v-4H30z" fill="#8C9AA5"/><path d="M56 60h14l-2 18H58z" fill="#BDEBFF" stroke="' + INK + '" stroke-width="2.5"/><path d="M63 52v5" stroke="#2EA7FF" stroke-width="3"/>');
  lib.dosign = '<circle cx="50" cy="50" r="42" fill="#23C16B"' + O + '/><path d="M28 52l14 14 30-32" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>';
  lib.dontsign = '<circle cx="50" cy="50" r="42" fill="#FF3B3B"' + O + '/><path d="M32 32l36 36M68 32L32 68" stroke="#fff" stroke-width="11" stroke-linecap="round"/>';
  lib.storybook = '<path d="M12 26c14-6 26-6 38 2 12-8 24-8 38-2v58c-14-6-26-6-38 2-12-8-24-8-38-2z" fill="#fff"' + O + "/>" +
    '<path d="M50 28v58" stroke="' + INK + '" stroke-width="3"/>' +
    '<path d="M22 70l8-20 8 20zM26 62h8" fill="#9B5DE5" stroke="' + INK + '" stroke-width="2"/><rect x="28" y="44" width="4" height="8" fill="#FF4F6D"/>' +
    '<path d="M70 38l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#FFD23F" stroke="' + INK + '" stroke-width="2"/>' +
    '<path d="M60 70q8-10 16 0" fill="none" stroke="#FF7BAC" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M18 16l2 4 4 1-4 2-2 4-2-4-4-2 4-1zM84 12l2 4 4 1-4 2-2 4-2-4-4-2 4-1z" fill="#FFD23F"/>';
  lib.reallife = '<circle cx="44" cy="44" r="30" fill="#7EC8FF"' + O + "/>" +
    '<path d="M24 36c8-4 12 2 18-2s8-10 16-6M22 54c10 0 12 8 20 6s10-8 18-2" fill="none" stroke="#23C16B" stroke-width="6" stroke-linecap="round"/>' +
    '<circle cx="44" cy="44" r="30" fill="none"' + O + '/><path d="M66 66l20 20" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' + shine(34, 30, 8, 4);

  /* book covers (A3): simple covers of our own with the titles the book shows (pp.26-30); never the publishers' art */
  function cover(bg, title1, title2, art, tc) {
    return '<rect x="16" y="6" width="68" height="88" rx="5" fill="' + bg + '"' + O + "/>" +
      '<rect x="16" y="6" width="8" height="88" fill="' + INK + '" opacity=".25"/>' +
      '<text x="53" y="' + (title2 ? 22 : 26) + '" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9" fill="' + (tc || "#fff") + '" text-anchor="middle">' + title1 + "</text>" +
      (title2 ? '<text x="53" y="33" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9" fill="' + (tc || "#fff") + '" text-anchor="middle">' + title2 + "</text>" : "") +
      '<g transform="translate(29 38) scale(.48)">' + lib[art] + "</g>";
  }
  lib.redhood = '<path d="M50 10c16 0 26 14 26 30v8H24v-8c0-16 10-30 26-30z" fill="#E4252B"' + O + '/><circle cx="50" cy="44" r="16" fill="#FFC99E"' + O + "/>" + face(50, 44, 0.6) +
    '<path d="M28 56l-8 38h60l-8-38z" fill="#E4252B"' + O + '/><path d="M64 70h18l-4 14H68z" fill="#C98A3A"' + O.replace("3.5", "2.5") + "/>";
  lib.braids = '<circle cx="50" cy="46" r="22" fill="#FFC99E"' + O + '/><path d="M28 40c0-16 10-24 22-24s22 8 22 24c-6-6-14-8-22-8s-16 2-22 8z" fill="#FF9F1C"' + O + "/>" +
    '<path d="M28 42L8 30M72 42l20-12" stroke="#FF9F1C" stroke-width="7" stroke-linecap="round"/>' + face(50, 48, 0.7) + '<circle cx="42" cy="56" r="1.5" fill="#C98A3A"/><circle cx="58" cy="56" r="1.5" fill="#C98A3A"/>';
  lib.monkey = '<circle cx="24" cy="44" r="10" fill="#C98A5A"' + O + '/><circle cx="76" cy="44" r="10" fill="#C98A5A"' + O + '/><circle cx="50" cy="46" r="26" fill="#A0603A"' + O + "/>" +
    '<ellipse cx="50" cy="54" rx="18" ry="14" fill="#F2D2B0"/>' + face(50, 50, 0.7) + '<path d="M70 70l22-10" stroke="#B97A4A" stroke-width="5" stroke-linecap="round"/>';
  lib.hero = '<path d="M26 44l-14 44h76L74 44z" fill="#E4252B"' + O + '/><circle cx="50" cy="38" r="20" fill="#FFC99E"' + O + "/>" +
    '<path d="M32 34h36v8H32z" fill="#2EA7FF"/>' + eye(42, 38, 3.5) + eye(58, 38, 3.5) + '<path d="M44 48q6 4 12 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M40 64l10 10 10-10" fill="#FFD23F"' + O.replace("3.5", "2") + "/>";
  lib.globe = '<circle cx="50" cy="50" r="38" fill="#7EC8FF"' + O + '/><path d="M26 36c10-6 16 4 24-2s10-12 20-6M20 58c12 0 14 10 24 8s12-10 22-4M52 76c6-4 12-2 16 2" fill="none" stroke="#23C16B" stroke-width="8" stroke-linecap="round"/>' +
    '<circle cx="50" cy="50" r="38" fill="none"' + O + "/>" + shine(36, 30, 9, 4);
  lib.ladybird = '<circle cx="50" cy="30" r="12" fill="' + INK + '"/><ellipse cx="50" cy="58" rx="32" ry="30" fill="#E4252B"' + O + '/><path d="M50 30v58" stroke="' + INK + '" stroke-width="3"/>' +
    '<circle cx="36" cy="50" r="6" fill="' + INK + '"/><circle cx="64" cy="50" r="6" fill="' + INK + '"/><circle cx="38" cy="72" r="5" fill="' + INK + '"/><circle cx="62" cy="72" r="5" fill="' + INK + '"/>' +
    eye(45, 28, 3) + eye(55, 28, 3);
  lib.turtle = '<ellipse cx="50" cy="56" rx="30" ry="22" fill="#23C16B"' + O + '/><path d="M36 48l14-8 14 8-2 14H38z" fill="#149E52"/><circle cx="84" cy="52" r="10" fill="#9BD85B"' + O + "/>" + eye(86, 48, 3) +
    '<path d="M28 72l-8 10M70 74l6 10M28 42l-8-8" stroke="#9BD85B" stroke-width="8" stroke-linecap="round"/>';
  lib.guitar = '<path d="M60 12l18 18-18 22-6-6z" fill="#B97A4A"' + O + '/><circle cx="38" cy="66" r="20" fill="#FF9F1C"' + O + '/><circle cx="52" cy="52" r="14" fill="#FF9F1C"' + O + "/>" +
    '<circle cx="42" cy="62" r="6" fill="' + INK + '"/><path d="M30 74l40-40" stroke="#fff" stroke-width="2"/>';
  lib.bodymap = '<circle cx="50" cy="20" r="12" fill="#FFC99E"' + O + '/><path d="M36 36h28l6 30H62l-2 28H40l-2-28h-8z" fill="#FFC99E"' + O + "/>" +
    '<path d="M50 40c-6 6-6 14 0 20 6-6 6-14 0-20z" fill="#E4252B"/><path d="M44 48c-6 10-8 20-6 30M56 48c6 10 8 20 6 30" stroke="#2EA7FF" stroke-width="2.5" fill="none"/>';
  lib.sheep = '<g fill="#fff"' + O.replace("3.5", "3") + '><circle cx="38" cy="48" r="14"/><circle cx="56" cy="44" r="14"/><circle cx="66" cy="58" r="12"/><circle cx="44" cy="62" r="14"/></g>' +
    '<ellipse cx="24" cy="46" rx="10" ry="12" fill="#fff"' + O + "/>" + '<circle cx="21" cy="44" r="2.5" fill="' + INK + '"/>' +
    '<path d="M40 74v14M58 72v14" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M78 20l-8 8M84 30l-10 4" stroke="#FF9F1C" stroke-width="4" stroke-linecap="round"/>';
  lib.cov_redhood = cover("#2E7D4F", "Little Red", "Riding Hood", "redhood");
  lib.cov_pippi = cover("#FFD23F", "Pippi", "Longstocking", "braids", INK);
  lib.cov_monkey = cover("#8A5530", "Monkey's", "Magic Pipe", "monkey");
  lib.cov_hero = cover("#2EA7FF", "Hero", "Academy", "hero");
  lib.cov_atlas = cover("#FF4F6D", "First", "Atlas", "globe");
  lib.cov_bugs = cover("#23C16B", "BUGS", "", "ladybird");
  lib.cov_oceans = cover("#0B7FD6", "Our", "Oceans", "turtle");
  lib.cov_guitar = cover("#fff", "How to", "Play Guitar", "guitar", "#E4252B");
  lib.cov_body = cover("#9B5DE5", "The Human", "Body", "bodymap");
  lib.cov_cartoons = cover("#FFB020", "How to draw", "cartoons", "sheep", "#E4252B");

  lib.chin = kid(52, 70, 88, 92);
  lib.ear = kid(80, 48, 99, 30);
  lib.neck = kid(54, 74, 92, 70);
  lib.hair = kid(40, 18, 10, 4, true);

  A.has = function (key) { return lib.hasOwnProperty(key); };
  A.get = function (key) { return SVG + (lib[key] || "") + "</svg>"; };
  A.add = function (key, body) { lib[key] = body; };
  A.keys = function () { var k, out = []; for (k in lib) { if (lib.hasOwnProperty(k)) { out.push(k); } } return out; };
  return A;
})();
