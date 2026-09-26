// List every line a game can speak, as a recording script for a voice artist.
//   node tools/voice_lines.js <src/*.game.js> [runs]
// Writes <chapter>/voice/<ASSET>_voice_script.csv  (key,text)
// Record each line as <chapter>/voice/clips/<key>.mp3 (or .m4a/.ogg/.wav);
// tools/build.py then packs the clips into the game and they replace the
// device voice line by line.
var fs = require('fs'), vm = require('vm'), path = require('path');
var gamePath = path.resolve(process.argv[2]), runs = +(process.argv[3] || 300);
var root = path.join(__dirname, '..'), shared = path.join(root, 'apsis/shared');
var src = fs.readFileSync(gamePath, 'utf8');
var engine = (src.match(/^\/\/\s*@engine\s+(\S+)/m) || [])[1];
var asset = (src.match(/^\/\/\s*@asset\s+(\S+)/m) || [])[1];
var noop = function () {};
var ctx = { Math: Math, JSON: JSON, console: console, setTimeout: noop, clearTimeout: noop };
ctx.window = ctx;
ctx.addEventListener = noop;
ctx.document = { addEventListener: noop, getElementById: function () { return null; } };
vm.createContext(ctx);
['g1-shell.js', 'g1-art.js', 'g1-buddy.js', 'engines/' + engine + '.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(shared, f), 'utf8'), ctx); });
var bootCfg = null;
vm.runInContext('Shell.boot = function (c) { this.__cfg = c; };', ctx);
var ENGINE = { 'tap-identify': 'TapIdentify', 'letter-fill': 'LetterFill', 'match': 'Match', 'read-along': 'ReadAlong' }[engine];
var captured;
vm.runInContext('var __init = ' + ENGINE + '.init; ' + ENGINE + '.init = function (c) { this.__content = c; __init(c); };', ctx);
vm.runInContext(src, ctx);
bootCfg = vm.runInContext('Shell.__cfg', ctx);
captured = vm.runInContext(ENGINE + '.__content', ctx);
var lines = {};
var pairs = {};
function add(x) {
  if (x === undefined || x === null || x === '') return;
  if (Object.prototype.toString.call(x) === '[object Array]') {
    x.forEach(add);
    // a part without end punctuation runs on into the next one ("Which word starts like" + "sun"):
    // record the pair as one natural sentence as well
    for (var i = 0; i + 1 < x.length; i++) {
      var a = String(x[i]).trim(), b = String(x[i + 1]).trim();
      if (a && b && !/[.!?]$/.test(a) && a.split(' ').length >= 2 && b.split(' ').length <= 4 && !/[.!?]$/.test(b)) pairs[a + ' ' + b] = 1;
    }
    return;
  }
  x = String(x).replace(/<[^>]+>/g, '').trim();
  if (x) lines[x] = 1;
}
// plain lists of separate lines (not sentences): add one by one
function addEach(list) { (list || []).forEach(function (x) { add(x); }); }
addEach(vm.runInContext('Shell.LINES', ctx));
addEach(vm.runInContext(ENGINE + '.LINES', ctx));
addEach([bootCfg.title, bootCfg.intro]);
var engineAll = vm.runInContext(ENGINE, ctx);
if (engineAll.allLines) engineAll.allLines().forEach(add);
if (!engineAll.allLines) captured.levels.forEach(function (L) {
  for (var r = 0; r < (L.make ? runs : 1); r++) {
    (L.make ? L.make() : L.rounds).forEach(function (R) {
      add(R.bannerSay);
      R.items.forEach(function (it) {
        add(it.say); add(it.hint2); add(it.full); add(it.done);
        if (it.target && it.target.say) add(it.target.say);
        var engineObj = vm.runInContext(ENGINE, ctx);
        if (engineObj.instructionFor) add(engineObj.instructionFor(it));
        if (engineObj.linesFor) engineObj.linesFor(it).forEach(add);
        if (it.target && !it.target.hideWord) add(it.target.text);
        (it.options || []).forEach(function (o) { if (!o.noBadge) add(o.say || o.text); });
      });
    });
  }
});
Object.keys(pairs).forEach(function (r) { lines[r] = 1; });
var keyOf = vm.runInContext('Shell.clipKey', ctx);
var seenKey = {};
var rows = Object.keys(lines).sort().map(function (t) { return [keyOf(t), t]; })
  .filter(function (r) { if (seenKey[r[0]]) return false; seenKey[r[0]] = 1; return true; });
var outDir = path.join(path.dirname(path.dirname(gamePath)), 'voice');
fs.mkdirSync(path.join(outDir, 'clips'), { recursive: true });
var csv = 'key,text\n' + rows.map(function (r) { return r[0] + ',"' + r[1].replace(/"/g, '""') + '"'; }).join('\n') + '\n';
fs.writeFileSync(path.join(outDir, asset + '_voice_script.csv'), csv);
console.log(asset + ': ' + rows.length + ' lines -> ' + path.relative(root, path.join(outDir, asset + '_voice_script.csv')));
