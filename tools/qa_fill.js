// QA driver for letter-fill games with a level picker (derived from qa_tap.js).
//   node tools/qa_fill.js <build.html> <outdir>
// Plays every level from the home page at 360x640 (touch), 740x360 (touch) and
// 1280x720 with a speech stub. Answers are worked out from the screen by first
// letter (same-sound games). On level 1 it taps wrong three times to run the
// hint ladder. Checks layout, console errors, stars on the home tiles, the Home
// button mid-level, Pause > Home, and writes screenshots plus all speech.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const [, , file, out] = process.argv;
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
      speak: function(u){ (window.__fallback = window.__fallback || []).push(u.text); window.__spoken.push(u.text); cur=u; setTimeout(function(){ if(cur===u){ cur=null; if(u.onend) u.onend(); } }, 30); }
    };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
    // recorded clips: finish at once, and log every line the game says (clip or not)
    HTMLMediaElement.prototype.play = function () { var a = this; setTimeout(function () { if (a.onended) a.onended(); }, 30); return Promise.resolve(); };
    HTMLMediaElement.prototype.pause = function () {};
    window.addEventListener('DOMContentLoaded', function () {
      if (!window.Shell) return;
      var orig = Shell.say;
      Shell.say = function (t, d) { [].concat(t).forEach(function (x) { window.__spoken.push(String(x)); }); return orig.apply(this, arguments); };
    });
  })();`;

function answerFor(state, spoken) {
  for (const L of state.letters) { const w = state.pattern.replace('_', L); if (spoken.includes(w)) return L; }
  return null;
}

(async () => {
  const browser = await chromium.launch();
  const report = [];
  const viewports = [
    { name: 'portrait', width: 360, height: 640, touch: true },
    { name: 'phone-land', width: 740, height: 360, touch: true },
    { name: 'landscape', width: 1280, height: 720, touch: false }
  ];
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: vp.touch });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED/.test(m.text())) errors.push(m.text()); });
    await page.addInitScript(STUB);
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.resolve(file));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${vp.name}-home.png` });
    const homeOv = await page.evaluate(() => [document.querySelector('.home-wrap').scrollHeight, document.querySelector('.home-wrap').clientHeight, document.documentElement.scrollWidth]);
    if (homeOv[2] > vp.width) report.push(`${vp.name}: home scrolls sideways`);
    if (homeOv[0] > homeOv[1] + 2) report.push(`${vp.name}: home needs vertical scroll (${homeOv[0]} > ${homeOv[1]})`);
    const nLevels = await page.$$eval('.level', l => l.length);
    const layoutIssues = new Set();

    for (let L = 0; L < nLevels; L++) {
      await page.locator('.level').nth(L).click();
      let items = 0, shot = 0;
      for (let guard = 0; guard < 40; guard++) {
        await page.waitForFunction(() => document.querySelector('#end.on') ||
          (document.querySelector('#stage[data-ready="1"] .tray .tile') && !document.querySelector('.slot.filled') && !document.querySelector('#banner.on') && !document.querySelector('#hand.on')), null, { timeout: 30000 });
        if (await page.$('#end.on')) break;
        await page.waitForTimeout(450);
        const state = await page.evaluate(() => {
          const box = document.querySelector('.lf-word, .sign .txt').cloneNode(true);
          const sl = box.querySelector('.slot'); sl.textContent = '_';
          box.querySelectorAll('br').forEach(b => b.replaceWith(' '));
          return { pattern: box.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(),
                   letters: [...document.querySelectorAll('.tray .tile')].map(t => t.textContent.trim()) };
        });
        const ans = answerFor(state, await page.evaluate(() => window.__spoken));
        if (!ans) { report.push(`${vp.name} L${L + 1}: could not work out answer for ${state.pattern}`); break; }
        const lay = await page.evaluate(() => {
          const r = [], W = innerWidth, H = innerHeight;
          document.querySelectorAll('.tile, .lf-word, .lf-pic, .sign, .prompt, .topbar .icon-btn').forEach(e => { const b = e.getBoundingClientRect(); if (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1) r.push(e.className.split(' ')[0] + ' off-screen'); });
          document.querySelectorAll('.tile').forEach(e => { const b = e.getBoundingClientRect(); if (b.width < 64 || b.height < 64) r.push('small tile'); });
          const tx = document.querySelector('.sign .txt'), sg = document.querySelector('.sign');
          if (tx && sg) { const a = tx.getBoundingClientRect(), c = sg.getBoundingClientRect(); if (a.left < c.left || a.right > c.right) r.push('sign text spills: ' + tx.textContent); }
          if (document.documentElement.scrollWidth > W) r.push('page scrolls sideways');
          return r;
        });
        lay.forEach(x => layoutIssues.add(`L${L + 1} ${x}`));
        if (shot < 2) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-${shot++}.png` });
        const tile = l => page.locator('.tray .tile', { hasText: new RegExp('^' + l + '$') }).first();
        if (L === 0 && items === 0) {
          const wrong = state.letters.find(l => l !== ans);
          for (let k = 0; k < 2; k++) {
            await tile(wrong).click();
            await page.waitForTimeout(300);
            await page.waitForFunction(() => document.querySelector('#stage[data-ready="1"]'), null, { timeout: 30000 });
          }
          await page.screenshot({ path: `${out}/${vp.name}-hints.png` });
        }
        if (items === 1) {
          // drag this one instead of tapping
          const tb = await tile(ans).boundingBox(), sb = await page.locator('#slot').boundingBox();
          await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
          await page.mouse.down();
          await page.mouse.move(tb.x + 40, tb.y - 20, { steps: 4 });
          await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2, { steps: 8 });
          if (vp.name === 'landscape' && L === 0) await page.screenshot({ path: `${out}/${vp.name}-dragging.png` });
          await page.mouse.up();
        } else {
          await tile(ans).click();
        }
        await page.waitForTimeout(200);
        const filled = await page.$('.slot.filled');
        if (!filled) report.push(`${vp.name} L${L + 1}: slot not filled after answer ${ans} for ${state.pattern}`);
        items++;
      }
      await page.waitForSelector('#end.on', { timeout: 30000 });
      await page.waitForTimeout(900);
      if (L === 0 || L === nLevels - 1) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-end.png` });
      const lit = await page.$$eval('#end-stars .lit', s => s.length);
      report.push(`${vp.name} L${L + 1}: items=${items} stars=${lit}`);
      await page.click('#end-home-btn');
      await page.waitForSelector('#home.on');
    }
    const tileStars = await page.$$eval('.level', ts => ts.map(t => t.querySelectorAll('.lstars svg path[fill="#FFC845"]').length));
    report.push(`${vp.name}: home tile stars ${JSON.stringify(tileStars)}`);
    await page.screenshot({ path: `${out}/${vp.name}-home-after.png` });

    // Home button mid-level, then Pause > Home
    await page.locator('.level').nth(2).click();
    await page.waitForFunction(() => document.querySelector('.tray .tile') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
    await page.click('#home-btn');
    const atHome1 = await page.$('#home.on');
    await page.locator('.level').nth(3).click();
    await page.waitForFunction(() => document.querySelector('.tray .tile') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
    await page.click('#pause-btn');
    if (vp.name === 'landscape') await page.screenshot({ path: `${out}/${vp.name}-pause.png` });
    await page.click('#menu-home-btn');
    const atHome2 = await page.$('#home.on');
    await page.waitForTimeout(1500);
    const stray = await page.evaluate(() => !!document.querySelector('#game.on') || document.querySelector('#hand.on') !== null);
    report.push(`${vp.name}: home button ok=${!!atHome1} pause>home ok=${!!atHome2} stray-after-home=${stray}`);
    report.push(`${vp.name}: layout issues ${JSON.stringify([...layoutIssues])} errors=${JSON.stringify(errors)}`);
    report.push(`${vp.name}: device-voice fallback lines: ${JSON.stringify([...new Set(await page.evaluate(() => window.__fallback || []))])}`);
    if (vp.name === 'landscape') fs.writeFileSync(`${out}/spoken.txt`, (await page.evaluate(() => window.__spoken)).join('\n'));
    await ctx.close();
  }
  await browser.close();
  console.log(report.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
