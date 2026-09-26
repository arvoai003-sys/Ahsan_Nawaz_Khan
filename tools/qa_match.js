// QA driver for match games with a level picker (derived from qa_fill.js).
// Answers come from its own key (book p.34 pairs, activity senses), so it also checks the content.
//   node tools/qa_match.js <build.html> <outdir>
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

const SENSE_PART = { see: 'eyes', hear: 'ears', smell: 'nose', taste: 'tongue', touch: 'hands' };
const ACT_SENSE = { 'stroke a pet': 'touch', 'sniff a flower': 'smell', 'eat an ice cream': 'taste', 'look at the moon': 'see',
  'listen to a drum': 'hear', 'eat a banana': 'taste', 'hug a teddy': 'touch', 'sniff the soap': 'smell' };
// returns [[chipText, targetIndex], ...]
function plan(state) {
  const out = [];
  state.targets.forEach((cap, ti) => {
    if (cap.includes('___')) {
      const part = Object.values(SENSE_PART).find(p => state.chips.includes(p) && cap.toLowerCase().includes(Object.keys(SENSE_PART).find(k => SENSE_PART[k] === p)));
      out.push([part, ti]); return;
    }
    const sense = Object.keys(SENSE_PART).find(k => SENSE_PART[k] === cap) || ACT_SENSE[cap];
    out.push([sense, ti]);
  });
  return out;
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
    await page.goto('file://' + path.resolve(file) + '?qa=1');
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
          (document.querySelector('#stage[data-ready="1"] .chips .chip') && !document.querySelector('.target.done') && !document.querySelector('#banner.on') && !document.querySelector('#hand.on')), null, { timeout: 30000 });
        if (await page.$('#end.on')) break;
        await page.waitForTimeout(700);
        const state = await page.evaluate(() => ({
          targets: [...document.querySelectorAll('.target')].map(t => { if (!t.querySelector('.cap')) return t.getAttribute('aria-label') || ''; const c = t.querySelector('.cap').cloneNode(true); const d = c.querySelector('.drop'); if (d) d.textContent = '___'; return c.textContent.replace(/\s+/g, ' ').trim(); }),
          chips: [...document.querySelectorAll('.chips .chip')].map(c => c.textContent.trim())
        }));
        const hook = await page.evaluate(() => window.__qa && window.__qa.moves);
        const moves = hook || plan(state);
        if (moves.some(m => !m[0])) { report.push(`${vp.name} L${L + 1}: no key for ${JSON.stringify(state)}`); break; }
        const lay = await page.evaluate(() => {
          const r = [], W = innerWidth, H = innerHeight;
          document.querySelectorAll('.target, .chip, .prompt, .topbar .icon-btn').forEach(e => { const b = e.getBoundingClientRect(); if (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1) r.push(e.className.split(' ')[0] + ' off-screen'); });
          document.querySelectorAll('.chip').forEach(e => { const b = e.getBoundingClientRect(); if (b.height < 48) r.push('small chip'); });
          document.querySelectorAll('.target .cap').forEach(e => { if (e.scrollWidth > e.clientWidth + 2) r.push('caption overflows: ' + e.textContent); });
          if (document.documentElement.scrollWidth > W) r.push('page scrolls sideways');
          const gb = document.querySelector('#game-buddy');
          if (gb && getComputedStyle(gb).display !== 'none' && !gb.classList.contains('away')) {
            const g = gb.getBoundingClientRect();
            document.querySelectorAll('.card, .tile, .chip, .target, .prompt, .lf-word, .lf-pic, .sign').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && b.left < g.right - 8 && b.right > g.left + 8 && b.top < g.bottom - 8 && b.bottom > g.top + 8) r.push('buddy overlaps ' + e.className.split(' ')[0]); });
          }
          return r;
        });
        lay.forEach(x => layoutIssues.add(`L${L + 1} ${x}`));
        if (shot < 2) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-${shot++}.png` });
        const chip = t => page.locator('.chips .chip', { hasText: new RegExp('^' + t + '$') }).first();
        const target = i => page.locator('.target').nth(i);
        if (L === 0 && items === 0) {
          // wrong: drop the first chip on the other target, twice
          const [c0, t0] = moves[0], wrongT = moves[1][1];
          for (let k = 0; k < 2; k++) {
            await chip(c0).click(); await target(wrongT).click();
            await page.waitForTimeout(300);
            await page.waitForFunction(() => document.querySelector('#stage[data-ready="1"]'), null, { timeout: 30000 });
          }
          await page.screenshot({ path: `${out}/${vp.name}-hints.png` });
        }
        for (let m = 0; m < moves.length; m++) {
          const [c, ti] = moves[m];
          await page.waitForFunction(() => document.querySelector('#stage[data-ready="1"]'), null, { timeout: 30000 });
          if (items === 1 && m === 0) {
            const cb = await chip(c).boundingBox(), tb = await target(ti).boundingBox();
            await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.mouse.down();
            await page.mouse.move(cb.x + 30, cb.y - 30, { steps: 4 });
            await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2, { steps: 8 });
            if (vp.name === 'landscape' && L === 0) await page.screenshot({ path: `${out}/${vp.name}-dragging.png` });
            await page.mouse.up();
          } else if (state.targets.length === 1) {
            await chip(c).click();
          } else {
            await chip(c).click(); await target(ti).click();
          }
          await page.waitForTimeout(250);
          const ok = await target(ti).evaluate(e => e.className.includes('done'));
          if (!ok) report.push(`${vp.name} L${L + 1}: '${c}' did not match '${state.targets[ti]}'`);
        }
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
    await page.waitForFunction(() => document.querySelector('.chips .chip') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
    await page.click('#home-btn');
    const atHome1 = await page.$('#home.on');
    await page.locator('.level').nth(3).click();
    await page.waitForFunction(() => document.querySelector('.chips .chip') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
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
