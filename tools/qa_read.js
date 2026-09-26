// QA driver for read-along games: node tools/qa_read.js <build.html> <outdir>
// Plays every mode from the home page at 360x640, 740x360 and 1280x720:
// reads/turns every page, taps words, does the word hunt (one wrong tap first),
// checks the words light up while a page is read, layout, errors, voice fallbacks.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const [, , file, out] = process.argv;
fs.mkdirSync(out, { recursive: true });
const STUB = `
  window.__spoken = []; window.__lit = 0;
  (function(){
    function U(t){ this.text=t; }
    window.SpeechSynthesisUtterance = U;
    var fake = { getVoices: function(){ return [{name:'Test', lang:'en-US'}]; }, cancel: function(){},
      speak: function(u){ (window.__fallback = window.__fallback || []).push(u.text); setTimeout(function(){ u.onend && u.onend(); }, 30); } };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
    // clips "play" for 600 ms with a moving clock, so word highlighting can be seen
    HTMLMediaElement.prototype.play = function () {
      var a = this, t0 = Date.now();
      Object.defineProperty(a, 'duration', { value: 0.6, configurable: true });
      Object.defineProperty(a, 'currentTime', { get: function () { return (Date.now() - t0) / 1000; }, configurable: true });
      setTimeout(function () { if (a.onended) a.onended(); }, 600);
      return Promise.resolve();
    };
    HTMLMediaElement.prototype.pause = function () {};
    setInterval(function () { if (document.querySelector('.ra-text .w.on')) window.__lit++; }, 40);
  })();`;
(async () => {
  const browser = await chromium.launch();
  const report = [];
  for (const vp of [{ name: 'portrait', width: 360, height: 640, touch: true }, { name: 'phone-land', width: 740, height: 360, touch: true }, { name: 'landscape', width: 1280, height: 720 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch });
    const page = await ctx.newPage();
    const errors = [], issues = new Set();
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(STUB);
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.resolve(file) + '?qa=1');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${vp.name}-home.png` });
    const n = await page.$$eval('.level', l => l.length);
    for (let L = 0; L < n; L++) {
      await page.locator('.level').nth(L).click();
      let pages = 0, wrongDone = false;
      for (let g = 0; g < 20; g++) {
        await page.waitForFunction(() => document.querySelector('#end.on') || (document.querySelector('#game.on #stage[data-ready="1"] .ra-book') && !document.querySelector('#banner.on') && !document.querySelector('#end.on')), null, { timeout: 30000 });
        if (await page.$('#end.on')) break;
        await page.waitForTimeout(900);
        const lay = await page.evaluate(() => {
          const r = [], W = innerWidth, H = innerHeight;
          document.querySelectorAll('.ra-book, .ra-nav .icon-btn, .ra-text .w, .topbar .icon-btn').forEach(e => { const b = e.getBoundingClientRect(); if (b.left < -1 || b.top < -1 || b.right > W + 1 || b.bottom > H + 1) r.push(e.className.split(' ')[0] + ' off-screen'); });
          if (document.documentElement.scrollWidth > W) r.push('page scrolls sideways');
          const gb = document.querySelector('#game-buddy');
          if (gb && getComputedStyle(gb).display !== 'none' && !gb.classList.contains('away')) { const g = gb.getBoundingClientRect(); document.querySelectorAll('.ra-book, .ra-nav .icon-btn').forEach(e => { const b = e.getBoundingClientRect(); if (b.left < g.right - 8 && b.right > g.left + 8 && b.top < g.bottom - 8 && b.bottom > g.top + 8) r.push('buddy overlaps ' + e.className.split(' ')[0]); }); }
          return r;
        });
        lay.forEach(x => issues.add(`L${L + 1} ${x}`));
        if (pages < 2 || pages === 5) await page.screenshot({ path: `${out}/${vp.name}-L${L + 1}-p${pages}.png` });
        const qa = await page.evaluate(() => window.__qa);
        if (qa && qa.hunt) {
          if (!wrongDone) {
            const other = await page.$$eval('.ra-text .w', (ws, h) => ws.map(w => w.getAttribute('data-word')).find(w => w !== h), qa.hunt);
            await page.locator(`.ra-text .w[data-word="${other}"]`).first().click(); await page.waitForTimeout(500); wrongDone = true;
          }
          await page.locator(`.ra-text .w[data-word="${qa.hunt}"]`).first().click();
          await page.waitForTimeout(800);
          if (!(await page.$('.ra-text .w.found'))) report.push(`${vp.name} L${L + 1} p${pages}: hunt word not accepted`);
        } else {
          await page.locator('.ra-text .w').first().click(); await page.waitForTimeout(300);
        }
        const last = await page.evaluate(() => document.querySelectorAll('#progress i').length - 1 === (window.__qa || {}).page);
        await page.click('#ra-next', { force: true });
        pages++;
        if (last) { await page.waitForSelector('#end.on', { timeout: 30000 }); break; }
        await page.waitForTimeout(250);
      }
      await page.waitForSelector('#end.on', { timeout: 30000 });
      await page.waitForTimeout(800);
      if (L === 0) await page.screenshot({ path: `${out}/${vp.name}-end.png` });
      report.push(`${vp.name} L${L + 1}: pages=${pages}`);
      await page.click('#end-home-btn'); await page.waitForSelector('#home.on');
    }
    const lit = await page.evaluate(() => window.__lit);
    report.push(`${vp.name}: words lit while reading=${lit > 0} layout=${JSON.stringify([...issues])} errors=${JSON.stringify(errors)} fallback=${JSON.stringify([...new Set(await page.evaluate(() => window.__fallback || []))])}`);
    await ctx.close();
  }
  await browser.close();
  console.log(report.join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
