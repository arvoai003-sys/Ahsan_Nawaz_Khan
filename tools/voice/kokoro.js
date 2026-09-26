// Generate WAV files with the Kokoro voice. Called by tools/make_voice.py.
//   node tools/voice/kokoro.js jobs.json      jobs: [{text, sid, speed, out}]
var path = require('path'), fs = require('fs');
var sherpa = require(path.join(__dirname, 'node_modules', 'sherpa-onnx-node'));
var dir = path.join(__dirname, 'node_modules', 'n8n-nodes-ttsbro', 'kokoro-int8-en-v0_19');
var tts = new sherpa.OfflineTts({
  model: { kokoro: { model: dir + '/model.int8.onnx', voices: dir + '/voices.bin', tokens: dir + '/tokens.txt',
    dataDir: dir + '/espeak-ng-data', lengthScale: 1.0 }, numThreads: 4, debug: 0, provider: 'cpu' },
  maxNumSentences: 1
});
var jobs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
jobs.forEach(function (j, n) {
  var a = tts.generate({ text: j.text, sid: j.sid, speed: j.speed });
  sherpa.writeWave(j.out, { samples: a.samples, sampleRate: a.sampleRate });
  process.stdout.write('\r' + (n + 1) + '/' + jobs.length);
});
process.stdout.write('\n');
