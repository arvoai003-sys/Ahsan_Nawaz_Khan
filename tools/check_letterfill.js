// Dump every letter-fill item a game can generate (runs make() many times):
//   node tools/check_letterfill.js <src/*.game.js> [runs] | python3 tools/check_letterfill.py
var fs = require('fs'), vm = require('vm'), path = require('path');
var src = fs.readFileSync(process.argv[2], 'utf8'), runs = +(process.argv[3] || 200), captured;
var ctx = { Math: Math, JSON: JSON }; ctx.window = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apsis/shared/g1-art.js'), 'utf8'), ctx);
ctx.Shell = { shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }, boot: function () {} };
ctx.LetterFill = { init: function (c) { captured = c; }, start: function () {}, resume: function () {}, max: function () {} };
vm.runInContext(src, ctx);
var seen = {}, missingArt = {};
captured.levels.forEach(function (L, li) {
  for (var r = 0; r < (L.make ? runs : 1); r++) {
    (L.make ? L.make() : L.rounds).forEach(function (R) {
      R.items.forEach(function (it) {
        if (it.art && !ctx.Art.has(it.art)) missingArt[it.art] = 1;
        var key = [li + 1, it.pattern, it.full, it.answer, it.choices.slice().sort().join('')].join('|');
        seen[key] = 1;
      });
    });
  }
});
if (Object.keys(missingArt).length) console.error('MISSING ART', Object.keys(missingArt));
console.log(JSON.stringify(Object.keys(seen)));
