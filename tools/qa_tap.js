// QA driver for tap-identify games: node tools/qa_tap.js <build.html> <answers.json> <outdir>
// answers.json: [["staff"],["stop"],...] is not used; answers are read from the screen by text list per item
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const [,, file, keyFile, out] = process.argv;
const KEY = JSON.parse(fs.readFileSync(keyFile, 'utf8')); // { "<prompt contains>": { "<target or set>": [answers] } } simplified below
fs.mkdirSync(out, { recursive: true });

const STUB = `
  window.__spoken = [];
  (function(){
    function U(t){ this.text=t; }
    window.SpeechSynthesisUtterance = U;
    var cur=null;
    var fake = {
      getVoices: function(){ return [{name:'Test en-GB', lang:'en-GB'}]; },
      cancel: function(){ if(cur){ var c=cur; cur=null; if(c.onend) setTimeout(c.onend,0);} },
      speak: function(u){ window.__spoken.push(u.text); cur=u; setTimeout(function(){ if(cur===u){ cur=null; if(u.onend) u.onend(); } }, 30); }
    };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
  })();`;

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const results = [];
  for (const vp of [{ name: 'portrait', width: 360, height: 640, touch: true }, { name: 'landscape', width: 1280, height: 720, touch: false }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push(m.text()); });
    await page.addInitScript(STUB);
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.resolve(file));
    await page.screenshot({ path: `${out}/${vp.name}-0-start.png` });
    await page.click('#play-btn');
    let shot = 1, wrongDone = false, items = 0;
    const ov = async () => {
      const o = await page.evaluate(() => { const r = [], els = document.querySelectorAll('.cards .card, .cards .badge'); for (const e of els) { const b = e.getBoundingClientRect(); r.push([e.className, b.left, b.top, b.right, b.bottom, b.width, b.height]); } return { r, w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight }; });
      const bad = o.r.filter(x => x[1] < -1 || x[2] < -1 || x[3] > o.w + 1 || x[4] > o.h + 1);
      const small = o.r.filter(x => !/badge/.test(x[0]) && (x[5] < 64 || x[6] < 64));
      return { bad, small, sw: o.sw, sh: o.sh, w: o.w, h: o.h };
    };
    for (let guard = 0; guard < 60; guard++) {
      // wait for board ready or end screen
      await page.waitForFunction(() => document.querySelector('#end.on') || (document.querySelector('.cards .card') && !document.querySelector('.cards .card.got') && !document.querySelector('#banner.on') && !document.querySelector('#hand.on')), null, { timeout: 30000 });
      if (await page.$('#end.on')) break;
      await page.waitForTimeout(150);
      const state = await page.evaluate(() => ({ prompt: document.querySelector('.prompt-text').innerText, target: (document.querySelector('.card.target .word') || {}).innerText || '', words: [...document.querySelectorAll('.cards .card:not(.got) .word')].map(e => e.innerText) }));
      const keyId = state.target ? 'same:' + state.target + ':' + [...state.words].sort().join(',') : 'set:' + [...state.words].sort().join(',');
      const answers = KEY[keyId];
      if (!answers) { console.log(`${vp.name}: NO KEY for ${keyId}`); break; }
      const o = await ov();
      if (o.bad.length || o.small.length || o.sw > o.w || o.sh > o.h) results.push(`${vp.name} item ${items}: layout bad=${JSON.stringify(o.bad)} small=${JSON.stringify(o.small)} scroll=${o.sw}x${o.sh}`);
      await page.screenshot({ path: `${out}/${vp.name}-${shot++}.png` });
      if (!wrongDone) {
        const wrong = state.words.find(w => !answers.includes(w));
        for (let k = 0; k < 3; k++) {
          await page.locator('.cards .card').filter({ has: page.locator('.word', { hasText: new RegExp('^' + wrong + '$') }) }).first().click({ position: { x: 20, y: 60 } });
          await page.waitForTimeout(700);
          await page.waitForFunction(() => !document.querySelector('#hand.on'), null, { timeout: 30000 });
        }
        await page.screenshot({ path: `${out}/${vp.name}-hints.png` });
        wrongDone = true;
        // hint 3 listens to all words; wait until unlocked
        await page.waitForTimeout(800);
      }
      for (const a of answers) {
        await page.locator('.cards .card').filter({ has: page.locator('.word', { hasText: new RegExp('^' + a + '$') }) }).first().click({ position: { x: 20, y: 60 } });
        await page.waitForTimeout(250);
      }
      items++;
      await page.waitForTimeout(400);
    }
    await page.waitForSelector('#end.on', { timeout: 30000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/${vp.name}-end.png` });
    const res = await page.evaluate(() => ({ stars: document.querySelectorAll('#end-stars .lit').length, spoken: window.__spoken, stored: (function(){ try { return localStorage.getItem('arvo:ENG01CH02SAMESOUND'); } catch(e) { return 'blocked'; } })() }));
    results.push(`${vp.name}: items=${items} stars=${res.stars} stored=${res.stored} errors=${JSON.stringify(errors)}`);
    if (vp.name === 'landscape') {
      fs.writeFileSync(`${out}/spoken.txt`, res.spoken.join('\n'));
      // restart test from pause mid-game
      await page.click('#again-btn');
      await page.waitForFunction(() => document.querySelector('.cards .card') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
      await page.click('#pause-btn'); await page.screenshot({ path: `${out}/pause.png` });
      await page.click('#restart-btn');
      await page.waitForTimeout(300);
      const dots = await page.evaluate(() => document.querySelectorAll('#progress i.done').length);
      results.push(`restart: done dots=${dots} stars=${await page.textContent('#star-num')} errors=${JSON.stringify(errors)}`);
    }
    await ctx.close();
  }
  await browser.close();
  console.log(results.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
