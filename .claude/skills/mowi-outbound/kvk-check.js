#!/usr/bin/env node
'use strict';
// Legal gate for the cold-outbound prospect list (Legal/19-LIA-outbound-prospecting.md §4).
//
//   KVK_API_KEY=... node kvk-check.js <apollo-export.csv> [--out <map>] [--test] [--limit N] [--max-paid N]
//
// The key may also live in ~/.config/mowi-outbound/kvk_api_key (chmod 600), so it never has to be typed
// into a command line or a chat. KVK does not credit costs caused by implementation mistakes, so:
// run --test first, then --limit 5 against production, then the full list. --max-paid caps the paid
// Basisprofiel calls per run (default 200); when it is reached the script stops and writes nothing.
//
// Input: a CSV exported from Apollo (People). Used columns, matched case-insensitively and
// tolerant of Apollo's variants: Company / Company Name, City / Company City, Website,
// First Name, Last Name, Title, Email, Email Status, Person Linkedin Url.
//
// For every unique company it asks the KVK Handelsregister:
//   1. Zoeken API v2  → kvkNummer (free; needs an API key from developers.kvk.nl)
//   2. Basisprofiel   → rechtsvorm (via _embedded.eigenaar), indNonMailing, totaalWerkzamePersonen
//      (paid: ±€6,40/maand + €0,02 per call — one call per company, never per contact)
// and decides:
//   TOEGESTAAN  rechtsvorm is a rechtspersoon AND non-mailing-indicator is "Nee" AND domain not suppressed
//   GEBLOKKEERD natuurlijke persoon (eenmanszaak, VOF, CV, maatschap), NMI "Ja", or suppressed domain
//   CONTROLE    no confident KVK match, foreign legal form, or anything the script cannot decide
// Nothing with status GEBLOKKEERD or CONTROLE may ever be added to a sequence. The block is in the
// data, not in a toggle (prospect-engine-plan §3).
//
// --test uses KVK's public test environment and test key, so the pipeline can be exercised without
// a real key; the test register only knows fictitious companies.

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
if (!input) { console.error('Gebruik: KVK_API_KEY=... node kvk-check.js <apollo-export.csv> [--out map] [--test] [--limit N] [--max-paid N]'); process.exit(2); }

const TEST = flag('--test');
const BASE = TEST ? 'https://api.kvk.nl/test/api' : 'https://api.kvk.nl/api';
// Key: env var first, then a 0600 file outside git and outside the vault.
const KEY_FILE = path.join(process.env.HOME || '', '.config', 'mowi-outbound', 'kvk_api_key');
function readKeyFile() {
  try {
    const st = fs.statSync(KEY_FILE);
    if (st.mode & 0o077) console.error(`Waarschuwing: ${KEY_FILE} is leesbaar voor anderen. Draai: chmod 600 "${KEY_FILE}"`);
    return fs.readFileSync(KEY_FILE, 'utf8').trim();
  } catch { return ''; }
}
const KEY = TEST ? 'l7xx1f2691f2520d487b902f4e0b57a0b197' : (process.env.KVK_API_KEY || readKeyFile());
if (!KEY) { console.error(`KVK-sleutel ontbreekt. Zet KVK_API_KEY of bewaar de sleutel in ${KEY_FILE} (chmod 600). Vraag een sleutel aan op developers.kvk.nl (Zoeken is gratis, Basisprofiel is betaald) of draai met --test.`); process.exit(2); }

// Hard stops against runaway cost: at most MAX_PAID paid Basisprofiel calls per run, and a 429 is
// retried a few times, never forever.
const MAX_PAID = Number(opt('--max-paid') || 200);
const MAX_429_RETRIES = 4;
const stats = { zoeken: 0, basisprofiel: 0, retries429: 0 };

const VAULT = process.env.MOWI_VAULT || '/Users/sal/Desktop/Mowi brain';
const SUPPRESSION = path.join(VAULT, 'Marketing & acquisition', 'suppression-list.csv');
const outDir = path.resolve(opt('--out') || path.dirname(path.resolve(input)));
const limit = Number(opt('--limit') || 0);

// Rechtsvormen with rechtspersoonlijkheid (Telecommunicatiewet 11.7 opt-out regime applies).
const RECHTSPERSOON = /^(besloten vennootschap|naamloze vennootschap|stichting|vereniging|co[öo]peratie|onderlinge waarborgmaatschappij|europese naamloze vennootschap|europese co[öo]peratieve vennootschap|kerkgenootschap|publiekrechtelijke rechtspersoon)/i;
// Natuurlijke personen: prior consent needed, hard block.
const NATUURLIJK = /^(eenmanszaak|vennootschap onder firma|commanditaire vennootschap|maatschap|rederij)/i;

// ---------- tiny CSV parser/writer (quotes, commas, newlines) ----------
function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift().map((h) => h.trim());
  return rows.filter((r) => r.some((x) => x.trim())).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])));
}
const csvCell = (v) => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const toCsv = (rows, cols) => [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n') + '\n';

const pick = (row, ...names) => { for (const n of names) { const k = Object.keys(row).find((h) => h.toLowerCase() === n.toLowerCase()); if (k && row[k]) return row[k]; } return ''; };
const domainOf = (s) => (s || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split(/[/?#]/)[0].split('@').pop();
const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\b(b\.?v\.?|n\.?v\.?|v\.?o\.?f\.?|c\.?v\.?|holding|group|groep|nederland|the|de|het)\b/g, ' ')
  .replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const tokens = (s) => new Set(norm(s).split(' ').filter((t) => t.length > 1));
function similarity(a, b) {
  const A = tokens(a), B = tokens(b); if (!A.size || !B.size) return 0;
  let inter = 0; for (const t of A) if (B.has(t)) inter++;
  return inter / Math.max(A.size, B.size);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function kvk(pathname, params, attempt = 0) {
  const paid = pathname.startsWith('/v1/basisprofielen');
  if (attempt === 0) {
    if (paid && stats.basisprofiel >= MAX_PAID) {
      console.error(`\nVeiligheidsgrens bereikt: ${stats.basisprofiel} betaalde Basisprofiel-calls (--max-paid ${MAX_PAID}). Gestopt, er is niets weggeschreven. Verhoog --max-paid alleen bewust.`);
      process.exit(3);
    }
    stats[paid ? 'basisprofiel' : 'zoeken']++;
  }
  const url = new URL(BASE + pathname); for (const [k, v] of Object.entries(params || {})) if (v != null && v !== '') url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { apikey: KEY, accept: 'application/json' } });
  if (res.status === 404) return null;
  if (res.status === 401 || res.status === 403) {
    console.error(`\nKVK weigert de sleutel (HTTP ${res.status}). Gestopt. Controleer de sleutel en het abonnement in het KVK Developer Portal.`);
    process.exit(4);
  }
  if (res.status === 429) {
    stats.retries429++;
    if (attempt >= MAX_429_RETRIES) throw new Error(`KVK 429 (te veel verzoeken) op ${url.pathname}, opgegeven na ${attempt} nieuwe pogingen`);
    await sleep(1500 * (attempt + 1));
    return kvk(pathname, params, attempt + 1);
  }
  if (!res.ok) throw new Error(`KVK ${res.status} op ${url.pathname}`);
  return res.json();
}

async function lookupCompany(name, city) {
  // 1) exact-ish search on name (+ city when known), hoofdvestiging only
  const tries = [{ naam: name, plaats: city }, { naam: name }];
  let lastError = '';
  for (const t of tries) {
    const r = await kvk('/v2/zoeken', { ...t, type: 'hoofdvestiging', resultatenPerPagina: 10 }).catch((e) => ({ error: e.message }));
    if (r?.error) { lastError = r.error; continue; }
    if (!r || !r.resultaten?.length) continue;
    const scored = r.resultaten.map((x) => ({ x, s: similarity(name, x.naam) + (city && (x.adres?.binnenlandsAdres?.plaats || '').toLowerCase() === city.toLowerCase() ? 0.15 : 0) }))
      .sort((a, b) => b.s - a.s);
    const best = scored[0];
    if (best.s >= 0.6 && (scored.length === 1 || best.s - scored[1].s >= 0.15 || scored[1].s < 0.6)) return { match: best.x, score: Math.min(best.s, 1) };
    return { ambiguous: scored.slice(0, 3).map((y) => `${y.x.naam} (${y.x.kvkNummer}, ${y.x.adres?.binnenlandsAdres?.plaats || '?'})`), score: best.s };
  }
  return lastError ? { error: lastError } : null;
}

async function profile(kvkNummer) {
  const p = await kvk(`/v1/basisprofielen/${kvkNummer}`);
  if (!p) return null;
  const eigenaar = p._embedded?.eigenaar || {};
  return {
    kvkNummer: p.kvkNummer, naam: p.naam || p.statutaireNaam, rechtsvorm: eigenaar.rechtsvorm || '',
    nmi: p.indNonMailing || '', personen: p.totaalWerkzamePersonen ?? '',
    sbi: (p.sbiActiviteiten || []).map((s) => `${s.sbiCode} ${s.sbiOmschrijving}`).slice(0, 2).join(' | '),
  };
}

function decide(prof, suppressed) {
  if (suppressed) return ['GEBLOKKEERD', 'domein staat op de suppressielijst'];
  if (!prof) return ['CONTROLE', 'geen betrouwbare KVK-match, handmatig opzoeken'];
  if (prof.nmi === 'Ja') return ['GEBLOKKEERD', 'KVK non-mailing-indicator staat aan'];
  if (NATUURLIJK.test(prof.rechtsvorm)) return ['GEBLOKKEERD', `natuurlijke persoon (${prof.rechtsvorm}), vereist voorafgaande toestemming`];
  if (RECHTSPERSOON.test(prof.rechtsvorm)) {
    if (prof.nmi !== 'Nee') return ['CONTROLE', `rechtspersoon, maar non-mailing-indicator onbekend ("${prof.nmi}")`];
    return ['TOEGESTAAN', `${prof.rechtsvorm}, NMI nee`];
  }
  return ['CONTROLE', `rechtsvorm "${prof.rechtsvorm || 'onbekend'}" niet in de allowlist (buitenlands of zeldzaam)`];
}

(async () => {
  const rows = parseCsv(fs.readFileSync(path.resolve(input), 'utf8'));
  const suppression = new Set(fs.existsSync(SUPPRESSION) ? parseCsv(fs.readFileSync(SUPPRESSION, 'utf8')).map((r) => domainOf(r.domein)).filter(Boolean) : []);
  const today = new Date().toISOString().slice(0, 10);
  const companies = new Map();
  for (const r of rows) {
    const company = pick(r, 'Company', 'Company Name', 'Organization', 'Company Name for Emails');
    const key = norm(company) || domainOf(pick(r, 'Website', 'Company Website', 'Email'));
    if (!companies.has(key)) companies.set(key, { company, city: pick(r, 'City', 'Company City', 'Organization City'), website: pick(r, 'Website', 'Company Website'), contacts: [] });
    companies.get(key).contacts.push(r);
  }
  const list = [...companies.values()].slice(0, limit || undefined);
  console.log(`${rows.length} contacten, ${companies.size} bedrijven${limit ? ` (eerste ${list.length})` : ''}; suppressielijst: ${suppression.size} domeinen; omgeving: ${TEST ? 'KVK TEST' : 'KVK productie'}`);

  const out = []; const counts = { TOEGESTAAN: 0, GEBLOKKEERD: 0, CONTROLE: 0 };
  for (const c of list) {
    const domain = domainOf(c.website) || domainOf(pick(c.contacts[0], 'Email'));
    const suppressed = suppression.has(domain);
    let prof = null, note = '';
    if (!suppressed) {
      const found = await lookupCompany(c.company, c.city).catch((e) => ({ error: e.message }));
      if (found?.match) { prof = await profile(found.match.kvkNummer).catch(() => null); note =`match ${Math.round(found.score * 100)}% op "${found.match.naam}"`; }
      else if (found?.ambiguous) note = 'meerdere kandidaten: ' + found.ambiguous.join(' / ');
      else if (found?.error) note = 'KVK-fout: ' + found.error;
      else note = 'niets gevonden in het Handelsregister';
      await sleep(TEST ? 50 : 120);
    }
    const [status, reden] = decide(prof, suppressed);
    counts[status]++;
    for (const r of c.contacts) {
      out.push({
        status, reden, bedrijf: c.company, domein: domain, kvk_nummer: prof?.kvkNummer || '', kvk_naam: prof?.naam || '',
        rechtsvorm: prof?.rechtsvorm || '', non_mailing_indicator: prof?.nmi || '', werkzame_personen: prof?.personen ?? '', sbi: prof?.sbi || '',
        kvk_check_datum: today, kvk_notitie: note,
        contactpersoon: `${pick(r, 'First Name')} ${pick(r, 'Last Name')}`.trim(), functietitel: pick(r, 'Title'),
        email: pick(r, 'Email'), email_status: pick(r, 'Email Status'), linkedin: pick(r, 'Person Linkedin Url'),
      });
    }
    process.stdout.write(`  ${status.padEnd(11)} ${c.company}${prof ? ` → ${prof.naam} [${prof.rechtsvorm}, NMI ${prof.nmi}]` : ''} ${note ? '(' + note + ')' : ''}\n`);
  }

  fs.mkdirSync(outDir, { recursive: true });
  const cols = ['status', 'reden', 'bedrijf', 'domein', 'kvk_nummer', 'kvk_naam', 'rechtsvorm', 'non_mailing_indicator', 'werkzame_personen', 'sbi', 'kvk_check_datum', 'kvk_notitie', 'contactpersoon', 'functietitel', 'email', 'email_status', 'linkedin'];
  const checkFile = path.join(outDir, `prospects-check-${today}${TEST ? '-TEST' : ''}.csv`);
  fs.writeFileSync(checkFile, toCsv(out, cols));
  const allowed = out.filter((r) => r.status === 'TOEGESTAAN' && r.email);
  const allowFile = path.join(outDir, `apollo-toegestaan-${today}${TEST ? '-TEST' : ''}.csv`);
  fs.writeFileSync(allowFile, toCsv(allowed, ['email', 'contactpersoon', 'bedrijf', 'domein', 'kvk_nummer', 'rechtsvorm']));
  console.log(`\nBedrijven: ${counts.TOEGESTAAN} toegestaan · ${counts.GEBLOKKEERD} geblokkeerd · ${counts.CONTROLE} controle`);
  console.log(`KVK-calls: ${stats.zoeken} Zoeken (gratis) + ${stats.basisprofiel} Basisprofiel (±€${(stats.basisprofiel * 0.02).toFixed(2)} bij productie)${stats.retries429 ? ` · ${stats.retries429}× HTTP 429 ontvangen` : ''}`);
  console.log(`Volledige controle:  ${checkFile}\nAlleen toegestaan:   ${allowFile} (${allowed.length} contacten) — dit is het enige bestand dat een sequence in mag.`);
})().catch((e) => { console.error('Mislukt:', e.message); process.exit(1); });
