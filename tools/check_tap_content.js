// Stress-test a tap-identify game's content: node tools/check_tap_content.js <src/*.game.js> [runs]
// Builds every level many times and checks each item has one clear answer set
// (by first letter) and no repeated word on a screen. Also lists art keys used.
var fs = require('fs'), vm = require('vm'), path = require('path');
var src = fs.readFileSync(process.argv[2], 'utf8');
var runs = +(process.argv[3] || 500);
var art = fs.readFileSync(path.join(__dirname, '..', 'apsis/shared/g1-art.js'), 'utf8');
var captured;
var ctx = { Math: Math, JSON: JSON, console: console };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(art, ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'apsis/shared/g1-buddy.js'), 'utf8'), ctx);
ctx.Shell = { shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }, boot: function () {} };
ctx.TapIdentify = { init: function (c) { captured = c; }, start: function () {}, resume: function () {}, max: function () {} };
vm.runInContext(src, ctx);
var problems = {}, seen = {}, count = 0;
function bad(msg) { problems[msg] = (problems[msg] || 0) + 1; }
captured.levels.forEach(function (L, li) {
  for (var r = 0; r < (L.make ? runs : 1); r++) {
    var rounds = L.make ? L.make() : L.rounds;
    rounds.forEach(function (R) {
      R.items.forEach(function (it) {
        count++;
        var words = it.options.map(function (o) { return o.text; });
        words.concat(it.target ? [it.target.text] : []).forEach(function (w) { seen[w] = 1; if (!ctx.Art.has(w)) bad('L' + (li + 1) + ' missing art: ' + w); });
        if (new Set(words.concat(it.target ? [it.target.text] : [])).size !== words.length + (it.target ? 1 : 0)) bad('L' + (li + 1) + ' repeated word on screen');
        var groups = {};
        words.forEach(function (w) { (groups[w[0]] = groups[w[0]] || []).push(w); });
        var expect;
        if (it.target) expect = groups[it.target.text[0]] || [];
        else if (/different/.test(it.text)) expect = Object.keys(groups).filter(function (k) { return groups[k].length === 1; }).map(function (k) { return groups[k][0]; });
        else { var sizes = Object.keys(groups).map(function (k) { return groups[k].length; }); var mx = Math.max.apply(null, sizes);
          if (sizes.filter(function (s) { return s === mx; }).length > 1) bad('L' + (li + 1) + ' two groups tie'); expect = Object.keys(groups).filter(function (k) { return groups[k].length === mx; }).map(function (k) { return groups[k]; })[0]; }
        var a = it.answer.slice().sort().join(','), e = expect.slice().sort().join(',');
        if (a !== e) bad('L' + (li + 1) + ' answer ' + a + ' but by first letter ' + e + ' (' + words.join(' ') + ')');
        if (it.answer.length > 3 || it.options.length > 6) bad('too many');
        if (it.options.length > 3 && !/Find three/.test(it.text)) bad('L' + (li + 1) + ' more than 3 cards');
      });
    });
  }
});
console.log('items checked:', count, ' distinct words:', Object.keys(seen).length);
console.log(Object.keys(problems).length ? problems : 'no problems');
