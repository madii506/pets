/* Pets */
(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(pointer: fine)').matches;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n, d = 0) => (+n || 0).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const usd = v => v == null ? '—' : '$' + (v >= 1e6 ? nf(v / 1e6, 2) + 'M' : v >= 1e4 ? nf(v / 1e3, 1) + 'K' : nf(v, 0));
const ago = iso => { if (!iso) return '—'; const s = (Date.now() - Date.parse(iso)) / 1000; return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + 'm ago' : s < 86400 ? Math.round(s / 3600) + 'h ago' : Math.round(s / 86400) + 'd ago'; };
const PAW = '<svg viewBox="0 0 40 40"><use href="#paw"/></svg>';
gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

// ------------------------------------------------ marquee + paw trails
const mq = (window.PETS_MARQ || []).map(t => `<span>${esc(t)}<svg viewBox="0 0 40 40"><use href="#paw"/></svg></span>`).join('');
$('#marq').innerHTML = mq + mq + mq;
(() => { const bg = $('#pawbg'); let h = ''; for (let i = 0; i < 16; i++) { const t = i / 15, x = 4 + t * 92, y = 88 - t * 70 + Math.sin(t * 7) * 6 + (i % 2 ? 3.5 : -3.5), r = 60 - t * 25;
  h += `<svg style="left:${x}%;top:${y}%;transform:rotate(${r}deg);animation:step 4.8s ${(i * .3).toFixed(2)}s infinite">${PAW.replace('<svg viewBox="0 0 40 40">', '').replace('</svg>', '')}</svg>`; } bg.innerHTML = h.replace(/<svg style/g, '<svg viewBox="0 0 40 40" style'); })();

// ------------------------------------------------ smooth scroll, nav, progress
let lenis = null;
if (window.Lenis && !reduced) { lenis = new Lenis({ duration: 1.15, smoothWheel: true }); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
const go = id => { const el = id === 'top' ? 0 : document.getElementById(id); if (el == null) return; document.body.classList.remove('menu'); lenis ? lenis.scrollTo(el, { offset: id === 'top' ? 0 : -80, duration: 1.4 }) : (el === 0 ? scrollTo(0, 0) : el.scrollIntoView({ behavior: 'smooth' })); };
document.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); go(a.dataset.go); } });
$('#burger').onclick = () => document.body.classList.toggle('menu');
const nav = $('#nav');
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => { nav.classList.toggle('solid', s.scroll() > 30); gsap.set('#prog', { scaleX: s.progress }); } });
$$('.links a').forEach(a => { const sec = document.getElementById(a.dataset.go); if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 45%', end: 'bottom 45%', onToggle: s => a.classList.toggle('on', s.isActive) }); });

// ------------------------------------------------ headings split into words that rise
$$('.split').forEach(h => { h.innerHTML = h.innerHTML.split(/(<br>)/).map(p => p === '<br>' ? p : p.split(/ (?![^<]*>)/).filter(Boolean).map(w => `<span class="wd"><span>${w}</span></span>`).join(' ')).join(''); });
if (!reduced) gsap.set('.split .wd > span', { yPercent: 115 });

// ------------------------------------------------ the dog: wag, blink, tag swing
const wag = (root, big = 1) => { const ear = root.querySelector('.ear'), tag = root.querySelector('.tag'); if (!ear) return;
  gsap.timeline().to(ear, { rotate: -16 * big, duration: .14, ease: 'power2.out' }).to(ear, { rotate: 10 * big, duration: .16, ease: 'power2.inOut' }).to(ear, { rotate: -7 * big, duration: .14 }).to(ear, { rotate: 0, duration: .5, ease: 'elastic.out(1,.4)' });
  if (tag) gsap.fromTo(tag, { rotate: 0 }, { keyframes: [{ rotate: 14, duration: .18 }, { rotate: -9, duration: .2 }, { rotate: 0, duration: .6, ease: 'elastic.out(1,.35)' }] }); };
const blink = root => { const l = root.querySelector('.lid'); if (l) gsap.timeline().to(l, { scaleY: 1, duration: .07 }).to(l, { scaleY: 0, duration: .12, delay: .05 }); };

// ------------------------------------------------ intro: paw prints walk in, the tile pops, wags, and lands in the hero
function intro(done) {
  const el = $('#intro'), force = /[?&]intro/.test(location.search);
  const seen = !force && (() => { try { return sessionStorage.getItem('pets1') === '1'; } catch { return false; } })();
  if (reduced || seen) { el.remove(); return done(false); }
  document.body.classList.add('intro'); scrollTo(0, 0); lenis && lenis.stop();
  const W = innerWidth, H = innerHeight, tile = $('#itile'), paws = $('#ipaws'), N = 9;
  for (let i = 0; i < N; i++) { const t = i / (N - 1), x = W * (.06 + t * .38), y = H * (.86 - t * .36) + (i % 2 ? 16 : -16), r = 62 - t * 18;
    paws.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 40 40" style="left:${x - 17}px;top:${y - 17}px;transform:rotate(${r}deg)"><use href="#paw"/></svg>`); }
  const P = $$('#ipaws svg'), tl = gsap.timeline();
  tl.to(P, { opacity: 1, scale: 1, startAt: { scale: .3 }, duration: .22, ease: 'back.out(3)', stagger: .11 })
    .to(P, { opacity: 0, duration: .5, stagger: .06 }, '-=.6')
    .to(tile, { opacity: 1, scale: 1, startAt: { scale: .2, rotate: 18 }, rotate: -6, duration: .62, ease: 'back.out(1.8)' }, '-=.75')
    .add(() => wag(tile, 1.2), '-=.2').add(() => blink(tile), '+=.25')
    .to({}, { duration: .55 });
  let flown = false;
  const fly = () => { if (flown) return; flown = true; tl.kill(); gsap.killTweensOf(P); gsap.to(P, { opacity: 0, duration: .2 });
    const ht = $('#htile'), r = ht.getBoundingClientRect(), s = ht.offsetWidth / tile.offsetWidth, tr = tile.getBoundingClientRect();
    const dx = (r.left + r.width / 2) - (tr.left + tr.width / 2), dy = (r.top + r.height / 2) - (tr.top + tr.height / 2);
    gsap.to(el, { backgroundColor: 'rgba(255,244,228,0)', duration: .9, ease: 'power2.inOut' });
    gsap.to(tile, { x: '+=' + dx, y: '+=' + dy, scale: s, rotate: -6, opacity: 1, duration: 1, ease: 'expo.inOut', onComplete: () => {
      document.body.classList.remove('intro'); el.remove(); lenis && lenis.start(); try { sessionStorage.setItem('pets1', '1'); } catch { } } });
    setTimeout(() => done(true), 450); };
  tl.eventCallback('onComplete', fly);
  el.addEventListener('pointerdown', fly); addEventListener('keydown', fly, { once: true });
}

// ------------------------------------------------ reveals, counters, tilt, hero life
function motion(fromIntro) {
  gsap.to('.hero h1 .wd > span', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .06, delay: fromIntro ? .1 : 0 });
  ScrollTrigger.batch('.rv', { start: 'top 90%', once: true, onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .08 }) });
  ScrollTrigger.addEventListener('scrollEnd', () => $$('.rv').forEach(el => { if (+getComputedStyle(el).opacity < .05 && el.getBoundingClientRect().top < innerHeight) gsap.to(el, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }); }));
  $$('.split').forEach(h => { if (h.closest('.hero')) return; gsap.to(h.querySelectorAll('.wd > span'), { yPercent: 0, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: h, start: 'top 88%', once: true } }); });
  $$('.st b').forEach(b => { const n = +b.dataset.n, suf = b.dataset.suf || '', o = { v: 0 }; ScrollTrigger.create({ trigger: b, start: 'top 88%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 2, ease: 'power3.out', onUpdate: () => b.textContent = nf(Math.round(o.v)) + suf }) }); });
  gsap.fromTo('#bigw', { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', ease: 'none', scrollTrigger: { trigger: '#bigw', start: 'top bottom', end: 'max', scrub: true } });
  gsap.to('.halo', { scale: 1.12, opacity: .8, duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  ScrollTrigger.create({ trigger: '.cta', start: 'top 70%', onEnter: () => wag($('.cta .tile'), 1.3) });
  const ht = $('#htile');
  gsap.to(ht, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  setInterval(() => { if (!document.hidden) { blink(ht); if (Math.random() < .5) setTimeout(() => wag(ht, .8), 400); } }, 3600);
  ht.addEventListener('pointerenter', () => { wag(ht, 1.3); heart(); heart(); });
  const hearts = $('#hearts'), HC = ['#F0564A', '#FFC93C', '#2D5BFF', '#FF8FB1'];
  function heart() { const r = ht.getBoundingClientRect(), b = hearts.getBoundingClientRect(), h = document.createElement('div');
    h.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 21 c-5 -3.6 -9 -7 -9 -11 a4.5 4.5 0 0 1 9 -1.6 a4.5 4.5 0 0 1 9 1.6 c0 4 -4 7.4 -9 11z" fill="${HC[Math.random() * 4 | 0]}"/></svg>`; const s = h.firstChild; hearts.appendChild(s);
    gsap.set(s, { left: r.left - b.left + r.width * (.3 + Math.random() * .5), top: r.top - b.top + r.height * .2, scale: .4 + Math.random() * .6 });
    gsap.to(s, { y: -140 - Math.random() * 80, x: (Math.random() - .5) * 90, rotate: (Math.random() - .5) * 60, opacity: 0, duration: 2.4, ease: 'power1.out', onComplete: () => s.remove() }); }
  setInterval(() => { if (!document.hidden && ht.getBoundingClientRect().bottom > 0) heart(); }, 1400);
  if (fine && !reduced) {
    addEventListener('pointermove', e => { const px = e.clientX / innerWidth - .5, py = e.clientY / innerHeight - .5; gsap.to(ht, { rotateY: px * 16, rotateX: -py * 12, x: px * 22, y: py * 16, transformPerspective: 900, duration: 1.1, ease: 'power3.out' }); });
    $$('.mag').forEach(b => { b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .22, y: (e.clientY - r.top - r.height / 2) * .32, duration: .4, ease: 'power3.out' }); }); b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' })); });
    $$('.tilt').forEach(c => { c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; gsap.to(c, { rotateY: px * 8, rotateX: -py * 8, y: -6, transformPerspective: 900, duration: .5, ease: 'power3.out' }); }); c.addEventListener('pointerleave', () => gsap.to(c, { rotateY: 0, rotateX: 0, y: 0, duration: .8, ease: 'expo.out' })); });
  }
}

// ------------------------------------------------ journey: pinned, sideways
function journey() {
  const track = $('#jtrack');
  if (innerWidth > 860 && !reduced) {
    const dist = () => track.scrollWidth - innerWidth;
    const tw = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#jpin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .8, invalidateOnRefresh: true, refreshPriority: 1, onUpdate: s => gsap.set('#jfill', { scaleX: s.progress }) } });
    $$('.jp').forEach(p => ScrollTrigger.create({ trigger: p, containerAnimation: tw, start: 'left 70%', onEnter: () => { const d = p.querySelector('.scene'); gsap.fromTo(d, { scale: .85, rotate: -4 }, { scale: 1, rotate: 0, duration: .9, ease: 'elastic.out(1,.5)' }); wag(p, 1.2); } }));
  } else $$('.jp').forEach(p => ScrollTrigger.create({ trigger: p, start: 'top 75%', once: true, onEnter: () => wag(p, 1.2) }));
}

// ------------------------------------------------ countdown to Christmas
(function cd() { const now = new Date(), y = now.getMonth() === 11 && now.getDate() > 25 ? now.getFullYear() + 1 : now.getFullYear(), t = new Date(y, 11, 25) - now, p = n => String(Math.max(0, n)).padStart(2, '0');
  $('#cdD').textContent = p(Math.floor(t / 864e5)); $('#cdH').textContent = p(Math.floor(t / 36e5) % 24); $('#cdM').textContent = p(Math.floor(t / 6e4) % 60); $('#cdS').textContent = p(Math.floor(t / 1e3) % 60); setTimeout(cd, 1000); })();

// ------------------------------------------------ the meter: odometer, bowl, ladder
const MILES = [[1000, 'first bowl'], [10000, 'full bag'], [50000, 'full pantry'], [100000, 'full truck'], [250000, 'full warehouse']];
$('#ladder').innerHTML = MILES.map(([v, l]) => `<div class="rung" data-v="${v}"><b>${usd(v)}</b><span>${l}</span><i></i></div>`).join('');
let odoTxt = '';
function odo(v) { const txt = '$' + nf(Math.floor(v)); const el = $('#odo');
  if (txt.length !== odoTxt.length) el.innerHTML = [...txt].map(c => /\d/.test(c) ? `<span class="dg"><span>${'0123456789'.split('').map(d => `<i>${d}</i>`).join('')}</span></span>` : `<span class="sep">${c}</span>`).join('');
  odoTxt = txt; let k = 0; [...txt].forEach((c, i) => { if (!/\d/.test(c)) return; const col = el.querySelectorAll('.dg > span')[k++]; requestAnimationFrame(() => col.style.transform = `translateY(-${+c}em)`); }); }
function bowl(v) { const next = MILES.find(m => v < m[0]) || MILES[MILES.length - 1], prev = [0, ...MILES.map(m => m[0])].filter(x => x <= v).pop() || 0;
  const f = Math.max(0, Math.min(1, (v - prev) / (next[0] - prev))); gsap.to('#bowlFill', { attr: { y: 124 - f * 56 }, duration: 1.4, ease: 'expo.out' });
  $('#bNext').textContent = v >= MILES[MILES.length - 1][0] ? 'every milestone reached' : `next: ${usd(next[0])} · ${next[1]}`;
  let k = ''; const lvl = 124 - f * 56; for (let i = 0; i < Math.round(f * 26); i++) k += `<circle cx="${34 + Math.random() * 132}" cy="${lvl + 4 + Math.random() * (122 - lvl)}" r="${3 + Math.random() * 2.5}"/>`; $('#kibs').innerHTML = k;
  $$('.rung').forEach(r => { const m = +r.dataset.v, i = MILES.findIndex(x => x[0] === m), p = i ? MILES[i - 1][0] : 0; r.classList.toggle('done', v >= m); r.querySelector('i').style.width = v >= m ? '100%' : Math.max(0, (v - p) / (m - p)) * 100 + '%'; }); }
odo(0); bowl(0);

// ------------------------------------------------ live data
let lastAt = 0, cfg = {};
function setCfg(c) {
  if (c.ca === cfg.ca && c.x === cfg.x) return; cfg = c;
  if (c.ca) { const s = c.ca.slice(0, 4) + '…' + c.ca.slice(-4); $('#caTxt').textContent = s; $('#caPill').classList.remove('hide'); $('#caBig').textContent = c.ca; $('#tCa').classList.remove('hide');
    const b = $('#buyBtn'); b.textContent = 'buy $PETS'; b.href = 'https://pump.fun/coin/' + c.ca; b.target = '_blank'; b.rel = 'noopener'; delete b.dataset.go;
    $('#tlinks').innerHTML = `<a class="btn blue" href="https://pump.fun/coin/${c.ca}" target="_blank" rel="noopener">buy on pump.fun ↗</a><a class="btn" href="https://dexscreener.com/solana/${c.ca}" target="_blank" rel="noopener">chart ↗</a><a class="btn" href="https://solscan.io/token/${c.ca}" target="_blank" rel="noopener">solscan ↗</a>` + $('#tlinks').innerHTML; }
  if (c.x) { const x = $('#xBtn'); x.href = 'https://x.com/' + c.x; x.classList.remove('hide'); }
}
const copy = () => { if (!cfg.ca) return; navigator.clipboard && navigator.clipboard.writeText(cfg.ca); const t = $('#caTxt'), o = t.textContent; t.textContent = 'copied'; setTimeout(() => t.textContent = o, 1200); };
$('#caPill').onclick = copy; $('#caBig').onclick = copy;
function render(d) {
  setCfg(d.cfg || {}); lastAt = Date.now(); const st = $('#mStat');
  const don = d.coin && d.coin.donations, mk = d.coin && d.coin.market;
  if (!cfg.ca) { st.className = 'mstat'; st.innerHTML = '<i></i>switches on the moment $PETS launches'; }
  else if (!don) { st.className = 'mstat live'; st.innerHTML = '<i></i>live · waiting for the first donation'; }
  else st.className = 'mstat live';
  const v = don ? don.usd : 0; odo(v); bowl(v);
  $('#fPend').textContent = don ? `pending: ${usd(don.pending)}` : 'pending: —';
  $('#fDone').textContent = don ? `finalized: ${usd(don.delivered)} · ${nf(don.n)} donations · last ${ago(don.last)}` : 'finalized: —';
  $('#fFees').textContent = mk && mk.vol24 ? `24h volume ${usd(mk.vol24)}` : 'on every trade';
  $('#mkts').innerHTML = mk ? `<span>market cap <b>${usd(mk.mcap)}</b></span><span>24h volume <b>${usd(mk.vol24)}</b></span>${don ? `<span>board rank <b>#${don.rank}</b></span>` : ''}` : '';
  const B = d.board || [];
  $('#brows').innerHTML = B.length ? B.map(r => `<a class="brow${cfg.ca && r.ca === cfg.ca ? ' me' : ''}" href="https://dexscreener.com/solana/${esc(r.ca)}" target="_blank" rel="noopener"><span class="rk">${r.rank}</span><span class="cn">${r.img ? `<img src="${esc(r.img)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ph',textContent:'${esc((r.sym || '?')[0])}'}))">` : `<span class="ph">${esc((r.sym || '?')[0])}</span>`}<span><b>${esc(r.name)}</b><small>$${esc(r.sym)}</small></span></span><span class="us">${usd(r.usd)}</span><span class="dn">${nf(r.n)}</span><span class="ls">${ago(r.last)}</span></a>`).join('')
    : `<p class="muted">${(d.errors || []).length ? 'donate.gg is not answering right now. trying again in a moment.' : 'reading the board…'}</p>`;
}
setInterval(() => { if (lastAt && cfg.ca && $('#mStat').classList.contains('live') && !$('#mStat').textContent.includes('waiting')) $('#mStat').innerHTML = `<i></i>live · updated ${Math.round((Date.now() - lastAt) / 1000)}s ago`; }, 1000);
async function pull() { try { const r = await fetch('/api/p'); const d = await r.json(); render(d); } catch { if (!lastAt) $('#brows').innerHTML = '<p class="muted">the board is not answering right now. trying again in a moment.</p>'; } }
pull(); setInterval(() => { if (!document.hidden) pull(); }, 20000);

// ------------------------------------------------ faq: one open at a time, smooth
$$('.faq details').forEach(d => { const s = d.querySelector('summary'), p = d.querySelector('p'); s.addEventListener('click', e => { if (reduced) return; e.preventDefault();
  if (d.open) gsap.to(p, { height: 0, opacity: 0, duration: .3, ease: 'power2.inOut', onComplete: () => { d.open = false; gsap.set(p, { clearProps: 'all' }); } });
  else { $$('.faq details[open]').forEach(o => { o.open = false; }); d.open = true; gsap.from(p, { height: 0, opacity: 0, duration: .45, ease: 'expo.out', clearProps: 'all' }); } }); });

// ------------------------------------------------ start
journey();
intro(f => { motion(f); ScrollTrigger.refresh(); });
})();
