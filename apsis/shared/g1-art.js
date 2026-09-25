/* ARVO Grade 1 art: flat, friendly SVG pictures drawn in code (no image files).
   Art.get(key) returns an SVG string sized by its container. ES5 only. */
var Art = (function () {
  var A = {};
  var SVG = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
  var lib = {
    book:
      '<path d="M18 22h28c4 0 6 2 6 6v54c0-3-2-5-6-5H18z" fill="#1E9FB4"/>' +
      '<path d="M82 22H56c-4 0-6 2-6 6v54c0-3 2-5 6-5h26z" fill="#F3A184"/>' +
      '<path d="M22 28h22v44H22zM56 28h22v44H56z" fill="#fff" opacity=".92"/>' +
      '<path d="M26 36h14M26 44h14M26 52h10M60 36h14M60 44h14M60 52h10" stroke="#9FB3C0" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M50 28v54" stroke="#213547" stroke-width="2.5" opacity=".35"/>',
    stop:
      '<rect x="47" y="60" width="6" height="36" rx="2" fill="#8C9AA5"/>' +
      '<path d="M34 6h32l22 22v32L66 82H34L12 60V28z" fill="#E4453A" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>' +
      '<text x="50" y="52" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#fff" text-anchor="middle">STOP</text>',
    exit:
      '<rect x="8" y="16" width="84" height="68" rx="10" fill="#2FA84F" stroke="#fff" stroke-width="4"/>' +
      '<text x="50" y="46" font-family="Arial, sans-serif" font-weight="900" font-size="24" fill="#fff" text-anchor="middle">EXIT</text>' +
      '<path d="M34 76l26-22M48 52h13v13" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>',
    staff:
      '<circle cx="50" cy="28" r="15" fill="#E7B38D"/>' +
      '<path d="M35 26c0-12 7-18 15-18s15 6 15 18c-3-5-9-8-15-8s-12 3-15 8z" fill="#3B2A22"/>' +
      '<circle cx="45" cy="29" r="2" fill="#213547"/><circle cx="55" cy="29" r="2" fill="#213547"/>' +
      '<path d="M45 35q5 4 10 0" fill="none" stroke="#213547" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M22 96c0-26 12-42 28-42s28 16 28 42z" fill="#1E9FB4"/>' +
      '<path d="M42 55l8 18 8-18" fill="none" stroke="#FFC845" stroke-width="3"/>' +
      '<rect x="41" y="72" width="18" height="15" rx="3" fill="#fff" stroke="#213547" stroke-width="2"/>' +
      '<path d="M45 78h10M45 83h7" stroke="#1E9FB4" stroke-width="2.5" stroke-linecap="round"/>',
    hand:
      '<path d="M34 92c-8-6-14-16-16-26l-6-18c-1-4 1-7 5-8 3-1 6 1 7 4l5 12V22c0-4 3-6 6-6s6 2 6 6v24-30c0-4 3-6 6-6s6 2 6 6v30-24c0-4 3-6 6-6s6 2 6 6v28-16c0-4 3-6 6-6s5 2 5 6v30c0 16-10 30-26 30z" fill="#F2C29B" stroke="#B9835C" stroke-width="3" stroke-linejoin="round"/>',
    sign:
      '<rect x="46" y="40" width="8" height="56" rx="3" fill="#A0714F"/>' +
      '<path d="M10 14h64l16 14-16 14H10z" fill="#FFC845" stroke="#D99A12" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M20 28h44" stroke="#213547" stroke-width="5" stroke-linecap="round" opacity=".55"/>' +
      '<ellipse cx="50" cy="95" rx="20" ry="4" fill="#213547" opacity=".12"/>'
  };
  A.has = function (key) { return lib.hasOwnProperty(key); };
  A.get = function (key) { return SVG + (lib[key] || "") + "</svg>"; };
  A.add = function (key, body) { lib[key] = body; };
  return A;
})();
