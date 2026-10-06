#!/usr/bin/env node
'use strict';
// Builds the nine-page AI-scan report (PDF + HTML, optional PNG per page) from one scan.json.
//
//   node build-report.js <pad/naar/scan.json> [--out <map>] [--png] [--allow-below-guarantee]
//
// Output lands next to the input JSON unless --out is given, so a real client scan that lives
// in the vault (Mowi brain/Klanten/AI-scans/<klant>/) keeps its PDF there too and never in git.
//
// The script refuses to build when the data breaks a binding rule from the vault
// (ai-scan-offer.md, outbound-sequence-assessment-v2.md, Brand book §10):
//   - 3 to 7 aanbevelingen, each with a real list price + where it was checked
//   - a tijdwinst figure only counts when it carries the client's own words as its source
//   - the garantie-som (sum of counted tijdwinst) must reach 5 uur/week, or --allow-below-guarantee
//   - u-vorm, no banned words, no em dashes, no emoji, 4 start days of max 10 minutes
// Fix the JSON, not the script.

const fs = require('fs');
const path = require('path');
const { renderReport, FOCUS, KWADRANT } = require('./template.js');

const args = process.argv.slice(2);
const input = args.find((x) => !x.startsWith('--'));
const flag = (n) => args.includes(n);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
if (!input) { console.error('Gebruik: node build-report.js <scan.json> [--out map] [--png] [--allow-below-guarantee]'); process.exit(2); }

const inputPath = path.resolve(input);
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const outDir = path.resolve(opt('--out') || path.dirname(inputPath));
const assetsDir = path.join(__dirname, 'assets');

// ---------- validation ----------
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const BANNED = ['AI-revolutie', 'de toekomst', 'disruptie', 'game-changer', 'in de snel veranderende wereld van vandaag', 'naadloos', 'ontketen', 'krachtig'];
const JE_VORM = /\b(je|jij|jouw|jullie|jou)\b/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function isStr(v) { return typeof v === 'string' && v.trim().length > 0; }
function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function need(obj, key, test, where, what) { if (!obj || !test(obj[key])) err(`${where}: "${key}" ontbreekt of is ongeldig (${what}).`); }

// walk every string in the document for copy rules
const texts = [];
(function walk(v, p) {
  if (typeof v === 'string') texts.push([p, v]);
  else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
  else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => { if (!k.startsWith('_')) walk(x, p ? `${p}.${k}` : k); });
})(data, '');
for (const [p, s] of texts) {
  if (/_bron$/.test(p) || p.endsWith('boek_url')) continue; // sources may quote the client verbatim
  for (const b of BANNED) if (s.toLowerCase().includes(b.toLowerCase())) err(`${p}: verboden woord "${b}" (copyregel).`);
  if (s.includes('—')) err(`${p}: gedachtestreepje (em dash) gevonden, gebruik twee zinnen of een komma (Brand book §10).`);
  if (JE_VORM.test(s)) err(`${p}: je-vorm gevonden, het rapport is in de u-vorm.`);
  if (EMOJI.test(s)) err(`${p}: emoji gevonden, het merk gebruikt er geen.`);
}

need(data, 'klant', (v) => v && typeof v === 'object', 'root', 'object');
need(data.klant, 'bedrijfsnaam', isStr, 'klant', 'tekst');
need(data.klant, 'type_bedrijf', isStr, 'klant', 'tekst');
need(data, 'datum', (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || ''), 'root', 'JJJJ-MM-DD');
need(data, 'primaire_focus', (v) => Object.keys(FOCUS).includes(v), 'root', Object.keys(FOCUS).join('|'));
need(data, 'uurtarief', (v) => isNum(v) && v > 0, 'root', 'getal > 0, door de klant genoemd');
need(data, 'uurtarief_bron', isStr, 'root', 'citaat of verwijzing naar wat de klant zei');
need(data, 'samenvatting', (v) => v && typeof v === 'object', 'root', 'object');
need(data.samenvatting, 'pijnpunten', (v) => Array.isArray(v) && v.length >= 1 && v.length <= 2 && v.every(isStr), 'samenvatting', '1 of 2 zinnen');
need(data.samenvatting, 'hoofdresultaat', isStr, 'samenvatting', 'tekst');
need(data, 'aanbevelingen', (v) => Array.isArray(v) && v.length >= 3 && v.length <= 7, 'root', '3 tot 7 aanbevelingen (ai-scan-offer.md fase 3)');
need(data, 'startplan', (v) => Array.isArray(v) && v.length === 4, 'root', 'precies 4 dagen');
need(data, 'grote_projecten', (v) => Array.isArray(v) && v.length <= 3, 'root', '0 tot 3 projecten');
need(data, 'vervolg', (v) => v && typeof v === 'object', 'root', 'object');
need(data.vervolg, 'boek_url', (v) => /^https:\/\//.test(v || ''), 'vervolg', 'https-link');
need(data.vervolg, 'afzender', isStr, 'vervolg', 'bijv. "Sal van Mowi"');

(data.aanbevelingen || []).forEach((r, i) => {
  const w = `aanbevelingen[${i}]`;
  need(r, 'pijnpunt', isStr, w, 'één zin, herleidbaar naar het gesprek');
  need(r, 'tool', isStr, w, 'naam');
  need(r, 'nl_eu', (v) => ['NL', 'EU', 'Internationaal'].includes(v), w, 'NL|EU|Internationaal');
  need(r, 'mowi_dienst', (v) => typeof v === 'boolean', w, 'true/false');
  need(r, 'kosten_per_maand', (v) => isNum(v) && v >= 0, w, 'getal, echte lijstprijs');
  need(r, 'kosten_bron', isStr, w, 'waar en wanneer de lijstprijs is gecontroleerd');
  need(r, 'opzettijd_min', (v) => Number.isInteger(v) && v > 0, w, 'minuten');
  need(r, 'kwadrant', (v) => Object.keys(KWADRANT).includes(v), w, Object.keys(KWADRANT).join('|'));
  if (r.tijdwinst_uur_per_week != null) {
    if (!(isNum(r.tijdwinst_uur_per_week) && r.tijdwinst_uur_per_week > 0)) err(`${w}: "tijdwinst_uur_per_week" moet een getal > 0 zijn, of null als de klant geen schatting gaf.`);
    if (!isStr(r.tijdwinst_bron)) err(`${w}: tijdwinst zonder "tijdwinst_bron" (citaat van de klant) telt niet mee voor de garantie. Vul de bron in of zet tijdwinst op null.`);
  }
  if (r.kwadrant === 'vermijden') warn(`${w}: een aanbeveling in het kwadrant "vermijden" hoort niet op pagina 5 thuis.`);
});
(data.startplan || []).forEach((s, i) => {
  const w = `startplan[${i}]`;
  need(s, 'dag', (v) => v === i + 1, w, `dag ${i + 1}`);
  need(s, 'actie', isStr, w, 'één concrete handeling');
  need(s, 'minuten', (v) => Number.isInteger(v) && v > 0 && v <= 10, w, 'max 10 minuten (fase 3, onderdeel 6)');
});
(data.grote_projecten || []).forEach((g, i) => {
  const w = `grote_projecten[${i}]`;
  need(g, 'titel', isStr, w, 'tekst');
  need(g, 'toelichting', isStr, w, 'tekst');
  if (g.mowi_product != null && !isStr(g.mowi_product)) err(`${w}: "mowi_product" moet tekst zijn of weggelaten.`);
});

if (errors.length) {
  console.error(`\n✗ Niet gebouwd. ${errors.length} probleem/problemen in ${path.relative(process.cwd(), inputPath)}:`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

// ---------- computations (the same sums the report prints) ----------
const counted = data.aanbevelingen.filter((r) => r.tijdwinst_uur_per_week != null && isStr(r.tijdwinst_bron));
const tijdwinstTotaal = round1(counted.reduce((s, r) => s + r.tijdwinst_uur_per_week, 0));
const toolkostenTotaal = data.aanbevelingen.reduce((s, r) => s + r.kosten_per_maand, 0);
const WEKEN_PER_MAAND = 52 / 12; // 4,33
const nettoPerMaand = Math.round(tijdwinstTotaal * data.uurtarief * WEKEN_PER_MAAND - toolkostenTotaal);

const kwadrant = { quick_win: [], groot_project: [], overwegen: [], vermijden: [] };
for (const r of data.aanbevelingen) kwadrant[r.kwadrant].push(r.tool);
for (const g of data.grote_projecten) kwadrant.groot_project.push(g.titel);
const quickWins = data.aanbevelingen.filter((r) => r.kwadrant === 'quick_win');
if (quickWins.length === 0) warn('Geen enkele aanbeveling staat in het kwadrant quick_win; pagina 4 is dan leeg.');

const computed = { tijdwinstTotaal, toolkostenTotaal, nettoPerMaand, kwadrant, quickWins };

console.log(`Garantie-som (tijdwinst met klantbron): ${tijdwinstTotaal} uur/week uit ${counted.length} van ${data.aanbevelingen.length} aanbevelingen.`);
console.log(`Toolkosten: € ${toolkostenTotaal}/maand · netto: € ${nettoPerMaand}/maand bij € ${data.uurtarief}/uur.`);
if (tijdwinstTotaal < 5) {
  const msg = `De garantie-som is ${tijdwinstTotaal} uur/week, onder de 5 uur uit de garantie (ai-scan-offer.md §1).`;
  if (!flag('--allow-below-guarantee')) {
    console.error(`\n✗ ${msg}\n  Dit rapport mag zo niet naar de klant als "gevonden tijdwinst". Of de analyse mist pijnpunten met een klantcijfer, of dit is een restitutiegeval. Bouw bewust met --allow-below-guarantee.`);
    process.exit(1);
  }
  warn(msg + ' Gebouwd met --allow-below-guarantee.');
}
for (const w of warnings) console.warn('  ! ' + w);

// ---------- render ----------
function round1(n) { return Math.round(n * 10) / 10; }
const slug = data.klant.bedrijfsnaam.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const base = path.join(outDir, `${slug}-ai-scan-rapport`);
fs.mkdirSync(outDir, { recursive: true });
const html = renderReport(data, computed, assetsDir);
fs.writeFileSync(base + '.html', html);

(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 2 });
  await page.goto('file://' + base + '.html', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Fail loudly if the webfonts did not arrive: a fallback font shifts every layout.
  const fontsOk = await page.evaluate(() => document.fonts.check('600 20px "Inter Tight"') && document.fonts.check('500 15px "Plus Jakarta Sans"'));
  if (!fontsOk) console.warn('  ! Webfonts niet geladen (geen netwerk?). De PDF is gebouwd met een vervangend lettertype. Controleer de regelafbreking.');
  await page.pdf({ path: base + '.pdf', width: '1200px', height: '750px', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  if (flag('--png')) {
    const pages = page.locator('.page');
    const n = await pages.count();
    for (let i = 0; i < n; i++) await pages.nth(i).screenshot({ path: `${base}-p${String(i + 1).padStart(2, '0')}.png` });
    console.log(`PNG per pagina: ${base}-p01.png … -p${String(n).padStart(2, '0')}.png`);
  }
  await browser.close();
  console.log(`\n✓ Rapport gebouwd:\n  ${base}.pdf\n  ${base}.html`);
  if (data._voorbeeld) console.log('  (VOORBEELD-badge staat op elke pagina: dit is fictieve data, niet voor een klant.)');
})().catch((e) => { console.error('Renderen mislukt:', e.message); process.exit(1); });
