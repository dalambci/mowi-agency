// Paid KVK Basisprofiel lookups (EUR 0.02 each), hard cap via MAX. Key read from file, never printed.
// Usage: node kvk-profielen.mjs out.jsonl nr1 nr2 ...
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const MAX = 70;
const KEY = readFileSync(`${homedir()}/.config/mowi-outbound/kvk_api_key`, 'utf8').trim();
const [out, ...nrs] = process.argv.slice(2);
const uniq = [...new Set(nrs)];
const bad = uniq.filter(n => !/^\d{8}$/.test(n));
if (bad.length) { console.error(`refusing: invalid KVK numbers: ${bad.join(", ")}`); process.exit(1); }
if (uniq.length > MAX) { console.error(`refusing: ${uniq.length} > ${MAX}`); process.exit(1); }
const lines = []; let paid = 0;
for (const nr of uniq) {
  let res, attempt = 0;
  while (true) {
    res = await fetch(`https://api.kvk.nl/api/v1/basisprofielen/${nr}`, { headers: { apikey: KEY, accept: 'application/json' } });
    paid++;
    if (res.status === 429 && attempt++ < 4) { await new Promise(r => setTimeout(r, 1500 * attempt)); continue; }
    break;
  }
  if (res.status === 401 || res.status === 403) { console.error('key refused, stopping'); break; }
  if (!res.ok) { lines.push({ nr, http: res.status }); continue; }
  const p = await res.json(); const e = p._embedded || {};
  lines.push({ nr, naam: p.naam, nmi: p.indNonMailing, rechtsvorm: e.eigenaar?.rechtsvorm || e.eigenaar?.uitgebreideRechtsvorm,
    handelsnamen: (p.handelsnamen || []).map(h => h.naam), websites: e.hoofdvestiging?.websites || [],
    plaats: [...new Set((e.hoofdvestiging?.adressen || []).map(a => a.plaats))], personen: p.totaalWerkzamePersonen,
    sbi: (p.sbiActiviteiten || []).map(s => s.sbiCode + ' ' + s.sbiOmschrijving).slice(0, 2) });
  await new Promise(r => setTimeout(r, 120));
}
writeFileSync(out, lines.map(l => JSON.stringify(l)).join('\n') + '\n');
console.log(`Basisprofiel calls: ${paid} (≈ EUR ${(paid * 0.02).toFixed(2)}), saved ${lines.length} profiles to ${out}`);
