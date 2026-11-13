// Pets data relay: the coin's donations (donate.gg), its market (Dexscreener) and the live charity-coin board.
// Set PETS_CA (token address) and PETS_X (X handle, no @) in Vercel once the coin is live.
const DG = 'https://www.donate.gg/api/v1/charity-coins';
const cache = new Map();
const cached = async (k, ms, fn) => { const c = cache.get(k); if (c && Date.now() - c.t < ms) return c.v; try { const v = await fn(); cache.set(k, { t: Date.now(), v }); return v; } catch (e) { if (c) return c.v; throw e; } };
const jget = async (u, ms = 9000) => { const r = await fetch(u, { headers: { accept: 'application/json', 'user-agent': 'pets-site' }, signal: AbortSignal.timeout(ms) }); if (!r.ok) throw new Error(u.split('?')[0] + ' ' + r.status); return r.json(); };
const row = (c, img) => { const t = (c.donationSubject && c.donationSubject.token) || {}, a = c.donationSubject && c.donationSubject.address;
  return { rank: c.rank, ca: a, sym: t.symbol || '?', name: t.name || '?', img: (img && img[a]) || null, usd: +(c.displayedUsdE6 || 0) / 1e6, pending: +(c.pendingUsdE6 || 0) / 1e6, delivered: +(c.finalizedUsdE6 || 0) / 1e6, n: c.donationCount || 0, first: c.firstDonationAt || null, last: c.lastDonationAt || null }; };
async function board() { return cached('board', 60000, async () => { const j = await jget(`${DG}?limit=12&sortBy=top-donated`); return (j.response || []).filter(c => !c.hidden).map(c => row(c, j.tokenImageMap)); }); }
async function coin(ca) {
  return cached('coin:' + ca, 25000, async () => {
    let found = null;
    for (const [sort, pages] of [['recent-donation', 1], ['top-donated', 6]]) {
      let cursor = null;
      for (let i = 0; i < pages && !found; i++) {
        const j = await jget(`${DG}?limit=100&sortBy=${sort}${cursor ? '&cursor=' + encodeURIComponent(cursor) : ''}`);
        const c = (j.response || []).find(x => x.donationSubject && x.donationSubject.address === ca); if (c) found = row(c, j.tokenImageMap);
        cursor = j.pageKey; if (!cursor || !(j.response || []).length) break;
      }
      if (found) break;
    }
    let market = null;
    try { const d = await jget(`https://api.dexscreener.com/latest/dex/tokens/${ca}`); const p = (d.pairs || []).sort((a, b) => ((b.liquidity && b.liquidity.usd) || 0) - ((a.liquidity && a.liquidity.usd) || 0))[0];
      if (p) market = { mcap: p.marketCap || p.fdv || null, vol24: (p.volume && p.volume.h24) || null, ch24: (p.priceChange && p.priceChange.h24) || null, url: p.url, dex: p.dexId }; } catch { }
    return { donations: found, market };
  });
}
module.exports = async (req, res) => {
  res.setHeader('content-type', 'application/json; charset=utf-8');
  const ca = (process.env.PETS_CA || '').trim() || null, x = (process.env.PETS_X || '').trim().replace(/^@/, '') || null;
  const out = { cfg: { ca, x }, at: Date.now(), coin: null, board: [], errors: [] };
  await Promise.all([
    board().then(b => { out.board = b; }).catch(e => out.errors.push('board: ' + e.message)),
    ca ? coin(ca).then(c => { out.coin = c; }).catch(e => out.errors.push('coin: ' + e.message)) : null,
  ]);
  res.setHeader('cache-control', 'public, s-maxage=20, stale-while-revalidate=120');
  res.end(JSON.stringify(out));
};
