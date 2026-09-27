// QA driver for tap-identify games with a level picker.
//   node tools/qa_tap.js <build.html> <outdir>
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

function answersFor(state) {
  const groups = {};
  state.words.forEach(w => (groups[w[0]] = groups[w[0]] || []).push(w));
  if (state.target) return groups[state.target[0]] || [];
  if (/different/.test(state.prompt)) return Object.values(groups).filter(g => g.length === 1).map(g => g[0]);
  return Object.values(groups).sort((a, b) => b.length - a.length)[0];
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
          ((document.querySelector('#stage[data-ready="1"] .cards .card') && !document.querySelector('.cards .card.got')) ||
           (document.querySelector('#stage[data-ready="1"] .mt .chip') && !document.querySelector('.mt .target.done')) ||
           (document.querySelector('#stage[data-ready="1"] .tray .tile') && !document.querySelector('.slot.filled')) ||
           (document.querySelector('#stage[data-ready="1"] .sb-tile') && !document.querySelector('.sb-slot.filled') && !document.querySelector('.sb-sign.built'))) &&
          !document.querySelector('#banner.on') && !document.querySelector('#hand.on'), null, { timeout: 30000 });
        if (await page.$('#end.on')) break;
        await page.waitForTimeout(700);
        const offScreen = sel => page.evaluate(sel => {
          const r = [], W = innerWidth, H = innerHeight;
          document.querySelectorAll(sel).forEach(e => { const b = e.getBoundingClientRect(); if (b.width && (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1)) r.push(e.className.split(' ').slice(0, 2).join(' ') + ' off-screen'); });
          if (document.documentElement.scrollWidth > W) r.push('page scrolls sideways');
          const gb = document.querySelector('#game-buddy');
          if (gb && getComputedStyle(gb).display !== 'none' && !gb.classList.contains('away')) {
            const g = gb.getBoundingClientRect();
            document.querySelectorAll(sel).forEach(e => { const b = e.getBoundingClientRect(); if (b.width && b.left < g.right - 8 && b.right > g.left + 8 && b.top < g.bottom - 8 && b.bottom > g.top + 8) r.push('buddy overlaps ' + e.className.split(' ')[0]); });
          }
          return r;
        }, sel);
        if (await page.$('#stage .sb')) {
          // sign-build: tap the tiles in the order they fill the sign (first screen: a wrong tile first, second: drag one)
          (await offScreen('.sb-sign, .sb-tile, .prompt, .topbar .icon-btn')).forEach(x => layoutIssues.add(`L${L + 1} ${x}`));
          if (shot < 2) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-${shot++}.png` });
          const order = await page.evaluate(() => window.__qa.order);
          if (L === 0 && items === 0) {
            const wrongId = await page.evaluate(o => { const t = [...document.querySelectorAll('.sb-tile')].find(e => !o.includes(e.getAttribute('data-id'))); return t && t.getAttribute('data-id'); }, order);
            if (wrongId) {
              await page.locator('.sb-tile[data-id="' + wrongId + '"]').click();
              await page.waitForTimeout(300);
              await page.waitForFunction(() => document.querySelector('#stage[data-ready="1"]'), null, { timeout: 30000 });
              await page.screenshot({ path: `${out}/${vp.name}-hints.png` });
            }
          }
          for (let m = 0; m < order.length; m++) {
            const tile = page.locator('.sb-tile[data-id="' + order[m] + '"]');
            if (L === 0 && items === 1 && m === 0) {
              const tb = await tile.boundingBox(), sb = await page.locator('.sb-slot:not(.given):not(.filled)').first().boundingBox();
              await page.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await page.mouse.down();
              await page.mouse.move(tb.x + 30, tb.y - 20, { steps: 4 });
              await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2, { steps: 8 });
              if (vp.name === 'landscape') await page.screenshot({ path: `${out}/${vp.name}-dragging.png` });
              await page.mouse.up();
            } else {
              await tile.click();
            }
            await page.waitForTimeout(250);
          }
          const built = await page.$('.sb-sign.built');
          if (!built) report.push(`${vp.name} L${L + 1}: sign not built after ${JSON.stringify(order)}`);
          items++;
          continue;
        }
        if (await page.$('#stage .lf')) {
          // letter-fill inside a mixed game (a check): tap the right letter
          (await offScreen('.tile, .sign, .lf-word, .prompt, .topbar .icon-btn')).forEach(x => layoutIssues.add(`L${L + 1} ${x}`));
          if (shot < 3) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-${shot++}.png` });
          const letter = await page.evaluate(() => window.__qa.letter);
          await page.locator('.tray .tile', { hasText: new RegExp('^' + letter.replace(/[.?*+^$()[\]{}|\\]/g, '\\$&') + '$') }).first().click();
          await page.waitForTimeout(250);
          items++;
          continue;
        }
        if (await page.$('#stage .mt')) {
          // a match screen inside a mixed game: tap each chip, then its target
          const moves = await page.evaluate(() => window.__qa && window.__qa.moves);
          const lay = await page.evaluate(() => {
            const r = [], W = innerWidth, H = innerHeight;
            document.querySelectorAll('.mt .target, .chip, .prompt, .topbar .icon-btn').forEach(e => { const b = e.getBoundingClientRect(); if (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1) r.push(e.className.split(' ')[0] + ' off-screen'); });
            if (document.documentElement.scrollWidth > W) r.push('page scrolls sideways');
            const gb = document.querySelector('#game-buddy');
            if (gb && getComputedStyle(gb).display !== 'none' && !gb.classList.contains('away')) {
              const g = gb.getBoundingClientRect();
              document.querySelectorAll('.chip, .mt .target, .prompt').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && b.left < g.right - 8 && b.right > g.left + 8 && b.top < g.bottom - 8 && b.bottom > g.top + 8) r.push('buddy overlaps ' + e.className.split(' ')[0]); });
            }
            return r;
          });
          lay.forEach(x => layoutIssues.add(`L${L + 1} ${x}`));
          if (shot < 2) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-${shot++}.png` });
          for (const [c, ti] of moves) {
            await page.locator('.chips .chip:not(.placed)', { hasText: new RegExp('^' + c + '$') }).first().click();
            if (await page.locator('.mt .target:not(.done)').count() > 0 && await page.locator('.chips .chip.picked').count() > 0) await page.locator('.mt .targets .target').nth(ti).click();
            await page.waitForTimeout(250);
            await page.waitForFunction(() => document.querySelector('#stage[data-ready="1"]') || document.querySelector('#end.on') || document.querySelector('#banner.on'), null, { timeout: 30000 });
          }
          items++;
          continue;
        }
        const state = await page.evaluate(() => ({
          prompt: document.querySelector('.prompt-text').innerText,
          target: (document.querySelector('.card.target .word') || {}).innerText || '',
          words: [...document.querySelectorAll('.cards .card')].map(e => e.getAttribute('data-id'))
        }));
        const qa = await page.evaluate(() => window.__qa && window.__qa.answer);
        const gate = await page.evaluate(() => !!(window.__qa && window.__qa.gate));
        const ans = qa || answersFor(state);
        const lay = await page.evaluate(() => {
          const r = [], W = innerWidth, H = innerHeight;
          document.querySelectorAll('.cards .card, .card.target, .prompt, .topbar .icon-btn').forEach(e => { const b = e.getBoundingClientRect(); if (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1) r.push(e.className + ' off-screen'); if (/card/.test(e.className) && (b.width < 64 || b.height < 64)) r.push('small card'); });
          if (document.documentElement.scrollWidth > W) r.push('page scrolls sideways');
          const gb = document.querySelector('#game-buddy');
          if (gb && getComputedStyle(gb).display !== 'none' && !gb.classList.contains('away')) {
            const g = gb.getBoundingClientRect();
            document.querySelectorAll('.card, .tile, .chip, .target, .prompt, .lf-word, .lf-pic, .sign').forEach(e => { const b = e.getBoundingClientRect(); if (b.width && b.left < g.right - 8 && b.right > g.left + 8 && b.top < g.bottom - 8 && b.bottom > g.top + 8) r.push('buddy overlaps ' + e.className.split(' ')[0]); });
          }
          document.querySelectorAll('.card .word').forEach(w => { const c = w.parentNode.getBoundingClientRect(), b = w.getBoundingClientRect(); if (b.left < c.left + 2 || b.right > c.right - 2) r.push('word overflows card: ' + w.innerText); });
          document.querySelectorAll('.big-btn').forEach(bt => { if (bt.offsetParent && bt.getBoundingClientRect().height > 90) r.push('button label wraps'); });
          return r;
        });
        lay.forEach(x => layoutIssues.add(`L${L + 1} ${x}`));
        if (shot < 2) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-${shot++}.png` });
        if (L === 0 && items === 0) {
          const wrong = state.words.find(w => !ans.includes(w));
          for (let k = 0; k < (gate ? 1 : 3); k++) {
            const cardW = page.locator('.cards .card[data-id="' + wrong + '"]').first(), bbW = await cardW.boundingBox();
            await cardW.click({ position: { x: 22, y: Math.min(70, bbW.height - 14) } });
            await page.waitForTimeout(250);
            await page.waitForFunction(() => document.querySelector('#stage[data-ready="1"]'), null, { timeout: 30000 });
            await page.waitForTimeout(200);
          }
          await page.screenshot({ path: `${out}/${vp.name}-hints.png` });
          if (gate) { items++; continue; } // a check moves on after one wrong answer
        }
        for (const a of ans) {
          const cardA = page.locator('.cards .card[data-id="' + a + '"]').first(), bbA = await cardA.boundingBox();
          await cardA.click({ position: { x: 22, y: Math.min(70, bbA.height - 14) } });
          await page.waitForTimeout(200);
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
    await page.locator('.level').nth(Math.min(2, nLevels - 1)).click();
    await page.waitForFunction(() => document.querySelector('.cards .card, .mt .chip, .sb-tile, .tray .tile') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
    await page.click('#home-btn');
    const atHome1 = await page.$('#home.on');
    await page.locator('.level').nth(Math.min(3, nLevels - 1)).click();
    await page.waitForFunction(() => document.querySelector('.cards .card, .mt .chip, .sb-tile, .tray .tile') && !document.querySelector('#banner.on'), null, { timeout: 30000 });
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
