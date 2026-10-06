'use strict';
// Renders the nine-page AI-scan report as one self-contained HTML document.
// Visual system = the live mowi.agency site, read from css/style.css on 2026-10-07 and the
// brand book (§2, §3, §6, §12): ink/bone/band/surface only, no accent colour, Plus Jakarta
// Sans body + Inter Tight headings, real icon+wordmark lockup on every page. The earlier
// Claude Design artboards (green accent, Newsreader/Public Sans) were superseded by this file.
//
// Every string that comes from scan.json passes through esc(). The template never trusts data.

const path = require('path');

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const nl = new Intl.NumberFormat('nl-NL', { maximumFractionDigits: 0 });
const nl1 = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const euro = (n) => `€ ${nl.format(Math.round(n))}`;
const uren = (n) => `${nl1.format(n)} uur`;

const FOCUS = {
  efficientie: { label: 'Efficiëntie', sub: 'Tijd terugwinnen. Niet meer omzet, niet hogere kwaliteit.' },
  effectiviteit: { label: 'Effectiviteit', sub: 'Meer omzet uit hetzelfde werk. Niet minder uren, niet hogere kwaliteit.' },
  kwaliteit: { label: 'Kwaliteit', sub: 'Minder fouten en herstelwerk. Niet minder uren, niet meer omzet.' },
};

const KWADRANT = {
  quick_win: { kop: 'Quick wins', sub: 'weinig moeite · veel effect' },
  groot_project: { kop: 'Grote projecten', sub: 'veel moeite · veel effect' },
  overwegen: { kop: 'Overwegen', sub: 'weinig moeite · weinig effect' },
  vermijden: { kop: 'Vermijden', sub: 'veel moeite · weinig effect' },
};

const MAAND = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
function datumNl(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MAAND[m - 1]} ${y}`;
}

const arrow = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

function css(assets) {
  return `
  :root{
    --bg:#fcfbfa; --band:#ece8e4; --surface:#ffffff; --muted:#f5f2f0;
    --ink:#121110; --ink-2:#595653; --ink-3:#8a8782; --border:#ece8e4;
    --radius-card:12px; --radius-btn:12px; --radius-pill:999px;
    --font-sans:"Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
    --font-heading:"Inter Tight", var(--font-sans);
  }
  @page{ size:1200px 750px; margin:0; }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;background:var(--bg);color:var(--ink);font-family:var(--font-sans);
    -webkit-print-color-adjust:exact; print-color-adjust:exact;}
  h1,h2,h3{font-family:var(--font-heading);font-weight:600;margin:0;letter-spacing:-0.01em;}
  p{margin:0;}
  .page{width:1200px;height:750px;overflow:hidden;position:relative;display:flex;flex-direction:column;
    padding:48px 64px 40px;background:var(--bg);page-break-after:always;break-after:page;}
  .page:last-child{page-break-after:auto;break-after:auto;}
  .hdr{display:flex;justify-content:space-between;align-items:center;padding-bottom:18px;border-bottom:1px solid var(--border);}
  .lockup{display:inline-flex;align-items:center;gap:9px;}
  .lockup img{display:block;height:26px;width:auto;}
  .lockup.lg img{height:44px;}
  .pageno{font-size:13px;color:var(--ink-2);}
  .ftr{margin-top:auto;padding-top:14px;border-top:1px solid var(--border);font-size:12px;color:var(--ink-3);display:flex;justify-content:space-between;}
  .title{font-size:30px;margin-top:26px;}
  .lead{font-size:15px;color:var(--ink-2);margin-top:6px;max-width:720px;line-height:1.5;}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);}
  .band{background:var(--band);border-radius:var(--radius-card);}
  .inkfill{background:var(--ink);color:var(--bg);border-radius:var(--radius-card);}
  .pill{display:inline-block;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-pill);padding:6px 12px;font-size:13px;font-weight:500;}
  .pill.ink{background:var(--ink);color:var(--bg);border-color:var(--ink);}
  .tag{display:inline-block;border:1px solid var(--ink);border-radius:var(--radius-pill);padding:2px 8px;font-size:10px;font-weight:600;letter-spacing:0.02em;vertical-align:middle;margin-left:6px;}
  .lbl{font-size:11px;color:var(--ink-2);}
  .val{font-size:15px;font-weight:600;}
  .big{font-family:var(--font-heading);font-weight:600;font-size:44px;line-height:1;letter-spacing:-0.02em;}
  .voorbeeld{position:absolute;top:14px;left:50%;transform:translateX(-50%);background:#FBE7C6;color:#7A4A00;
    border-radius:var(--radius-pill);padding:4px 12px;font-size:11px;font-weight:700;letter-spacing:0.04em;}
  `;
}

function hdr(nr, titel, assets) {
  return `<div class="hdr">
    <span class="lockup"><img src="${assets.iconInk}" alt=""><img src="${assets.wordmarkInk}" alt="Mowi"></span>
    <span class="pageno">${nr} · ${esc(titel)}</span>
  </div>`;
}

function ftr(d, nr, extra = '') {
  return `<div class="ftr"><span>Vertrouwelijk · opgesteld voor ${esc(d.klant.bedrijfsnaam)}${extra}</span><span>${nr} / 9</span></div>`;
}

function voorbeeldBadge(d) {
  return d._voorbeeld ? '<div class="voorbeeld">VOORBEELD · FICTIEVE DATA</div>' : '';
}

// 01 Titel
function p1(d, c, a) {
  const focus = FOCUS[d.primaire_focus];
  return `<section class="page">${voorbeeldBadge(d)}
    <div class="hdr" style="border-bottom:0;padding-bottom:0;">
      <span class="lockup lg"><img src="${a.iconInk}" alt=""><img src="${a.wordmarkInk}" alt="Mowi"></span>
      <span class="pageno">AI-scan</span>
    </div>
    <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:center;gap:18px;max-width:820px;">
      <h1 style="font-size:60px;line-height:1.05;letter-spacing:-0.025em;">AI-scan</h1>
      <p style="font-size:26px;font-weight:500;">Rapport voor ${esc(d.klant.bedrijfsnaam)}</p>
      <p style="font-size:16px;color:var(--ink-2);max-width:560px;line-height:1.5;">Waar u tijd wint, met tools die daar vandaag al voor bestaan. Elke aanbeveling met kosten, opzettijd en tijdwinst per week.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;">
      <div class="band" style="padding:16px 18px;"><div class="lbl" style="margin-bottom:6px;">Datum</div><div class="val">${esc(datumNl(d.datum))}</div></div>
      <div class="band" style="padding:16px 18px;"><div class="lbl" style="margin-bottom:6px;">Type bedrijf</div><div class="val">${esc(d.klant.type_bedrijf)}</div></div>
      <div class="band" style="padding:16px 18px;"><div class="lbl" style="margin-bottom:6px;">Primaire focus</div><div class="val">${esc(focus.label)}</div></div>
    </div>
    <div style="margin-top:22px;font-size:13px;color:var(--ink-3);">Opgesteld door ${esc(d.vervolg.afzender)}</div>
  </section>`;
}

// 02 Managementsamenvatting
function p2(d, c, a) {
  const focus = FOCUS[d.primaire_focus];
  const pijn = d.samenvatting.pijnpunten.map((t) => `<div class="card" style="padding:14px 18px;font-size:15px;line-height:1.5;">${esc(t)}</div>`).join('');
  return `<section class="page">${voorbeeldBadge(d)}${hdr('02', 'Managementsamenvatting', a)}
    <h1 class="title">Waar ${esc(d.klant.bedrijfsnaam)} tijd wint</h1>
    <div style="display:grid;grid-template-columns:1.3fr 1fr;gap:32px;margin-top:26px;flex-grow:1;min-height:0;">
      <div style="display:flex;flex-direction:column;gap:18px;">
        <div><div class="lbl" style="font-size:13px;font-weight:600;margin-bottom:8px;">Belangrijkste pijnpunten</div><div style="display:flex;flex-direction:column;gap:10px;">${pijn}</div></div>
        <div><div class="lbl" style="font-size:13px;font-weight:600;margin-bottom:8px;">Hoofdresultaat</div><p style="font-size:15px;line-height:1.6;">${esc(d.samenvatting.hoofdresultaat)}</p></div>
        ${(d.klant.systemen || []).length ? `<div><div class="lbl" style="font-size:13px;font-weight:600;margin-bottom:8px;">Systemen in gebruik</div><div style="display:flex;flex-wrap:wrap;gap:8px;">${d.klant.systemen.map((s) => `<span class="pill">${esc(s)}</span>`).join('')}</div><div style="font-size:12px;color:var(--ink-3);margin-top:8px;">Elke aanbeveling sluit hierop aan. Niets hoeft vervangen te worden.</div></div>` : ''}
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div class="inkfill" style="padding:26px 24px;">
          <div style="font-size:13px;opacity:0.75;margin-bottom:8px;">Gevonden tijdwinst per week</div>
          <div class="big">${esc(uren(c.tijdwinstTotaal))}</div>
          <div style="font-size:13px;opacity:0.75;margin-top:10px;line-height:1.45;">Som van de aanbevolen oplossingen op pagina 5. Elk cijfer komt uit wat u zelf aangaf in het gesprek.</div>
        </div>
        <div class="card" style="padding:16px 18px;">
          <div class="lbl" style="margin-bottom:6px;">Primaire focus</div>
          <div style="font-size:16px;font-weight:600;">${esc(focus.label)}</div>
          <div style="font-size:13px;color:var(--ink-2);margin-top:4px;line-height:1.45;">${esc(focus.sub)}</div>
        </div>
      </div>
    </div>
    ${ftr(d, 2)}
  </section>`;
}

// 03 Matrix
function p3(d, c, a) {
  const q = (key, items, hi) => {
    const pills = items.length
      ? `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">${items.map((t) => `<span class="pill${hi ? ' ink' : ''}">${esc(t)}</span>`).join('')}</div>`
      : `<div style="font-size:13px;color:var(--ink-2);margin-top:8px;">Voor ${esc(d.klant.bedrijfsnaam)} niets gevonden dat hier thuishoort.</div>`;
    return `<div class="${hi ? 'band' : 'card'}" style="padding:20px 22px;display:flex;flex-direction:column;${hi ? 'border:1px solid var(--ink);' : ''}${key === 'vermijden' ? 'opacity:0.75;' : ''}">
      <div style="font-size:16px;font-weight:600;">${KWADRANT[key].kop}</div>
      <div style="font-size:12px;color:var(--ink-2);margin-top:2px;">${KWADRANT[key].sub}</div>${pills}</div>`;
  };
  return `<section class="page">${voorbeeldBadge(d)}${hdr('03', 'Effort-vs-impactmatrix', a)}
    <h1 class="title">Waar we eerst op inzetten</h1>
    <p class="lead">Dit rapport richt zich op de oplossingen linksboven: veel effect, weinig moeite. De rest staat er ook, maar komt later.</p>
    <div style="flex-grow:1;display:flex;margin-top:20px;gap:12px;min-height:0;">
      <div style="display:flex;flex-direction:column;justify-content:space-between;align-items:center;width:28px;padding:6px 0;">
        <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;color:var(--ink-2);">veel effect</div>
        <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;color:var(--ink-2);">weinig effect</div>
      </div>
      <div style="flex-grow:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:14px;">
        ${q('quick_win', c.kwadrant.quick_win, true)}
        ${q('groot_project', c.kwadrant.groot_project, false)}
        ${q('overwegen', c.kwadrant.overwegen, false)}
        ${q('vermijden', c.kwadrant.vermijden, false)}
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;padding-left:40px;font-size:12px;color:var(--ink-2);"><span>weinig moeite</span><span>veel moeite</span></div>
    ${ftr(d, 3)}
  </section>`;
}

// 04 Quick wins
function p4(d, c, a) {
  const rows = c.quickWins.map((r) => `<div class="card" style="display:flex;align-items:center;gap:20px;padding:16px 22px;">
      <div style="flex:1;font-size:16px;line-height:1.4;">${esc(r.quickwin_label || r.pijnpunt)}</div>
      <span style="color:var(--ink-3);display:inline-flex;">${arrow}</span>
      <div style="flex:1;font-size:16px;font-weight:600;">${esc(r.tool)}${r.mowi_dienst ? '<span class="tag">Mowi-dienst</span>' : ''}</div>
    </div>`).join('');
  return `<section class="page">${voorbeeldBadge(d)}${hdr('04', 'Quick wins', a)}
    <h1 class="title">In één oogopslag</h1>
    <p class="lead">Elk pijnpunt, gekoppeld aan één tool. De uitleg per tool staat op de volgende pagina.</p>
    <div style="flex-grow:1;display:flex;flex-direction:column;gap:12px;margin-top:22px;justify-content:center;min-height:0;">${rows}</div>
    ${ftr(d, 4)}
  </section>`;
}

// 05 Aanbevolen oplossingen
function p5(d, c, a) {
  const compact = d.aanbevelingen.length > 5;
  const pad = compact ? '12px 20px' : '16px 22px';
  const fs = compact ? 14 : 15;
  const rows = d.aanbevelingen.map((r) => `<div class="card" style="padding:${pad};display:grid;grid-template-columns:2.2fr 1.3fr 0.9fr 0.9fr 1fr;gap:14px;align-items:center;">
      <div><div class="lbl" style="margin-bottom:3px;">Pijnpunt</div><div style="font-size:${fs}px;font-weight:600;line-height:1.35;">${esc(r.pijnpunt)}</div></div>
      <div><div class="lbl">Tool</div><div class="val" style="font-size:${fs}px;">${esc(r.tool)}${r.mowi_dienst ? '<span class="tag">Mowi-dienst</span>' : ''}</div><div style="font-size:11px;color:var(--ink-3);">${esc(r.nl_eu)}</div></div>
      <div><div class="lbl">Kosten/maand</div><div class="val" style="font-size:${fs}px;">${esc(euro(r.kosten_per_maand))}</div></div>
      <div><div class="lbl">Opzettijd</div><div class="val" style="font-size:${fs}px;">±${esc(r.opzettijd_min)} min</div></div>
      <div><div class="lbl">Tijdwinst/week</div><div class="val" style="font-size:${fs}px;">${r.tijdwinst_uur_per_week == null ? '<span style="color:var(--ink-3);font-weight:500;">niet geschat</span>' : esc(uren(r.tijdwinst_uur_per_week))}</div></div>
    </div>`).join('');
  return `<section class="page">${voorbeeldBadge(d)}${hdr('05', 'Aanbevolen oplossingen', a)}
    <h1 class="title">De tools, in detail</h1>
    <p class="lead">Alle prijzen zijn actuele lijstprijzen, gecontroleerd op ${esc(datumNl(d.datum))}. Tijdwinst is gebaseerd op wat u zelf aangaf tijdens het gesprek. Zonder uw eigen inschatting staat er "niet geschat" en telt de tool niet mee in de som.</p>
    <div style="flex-grow:1;display:flex;flex-direction:column;gap:${compact ? 8 : 12}px;margin-top:18px;justify-content:center;min-height:0;">${rows}</div>
    ${ftr(d, 5)}
  </section>`;
}

// 06 4-dagenstartplan
function p6(d, c, a) {
  const days = d.startplan.map((s) => `<div class="card" style="padding:20px 18px;display:flex;flex-direction:column;gap:12px;">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-weight:600;font-size:16px;">${esc(s.dag)}</div>
      <div style="font-size:13px;font-weight:600;color:var(--ink-2);">Dag ${esc(s.dag)}</div>
      <div style="font-size:15px;line-height:1.5;flex-grow:1;">${esc(s.actie)}</div>
      <div style="font-size:12px;font-weight:600;">±${esc(s.minuten)} min</div>
    </div>`).join('');
  return `<section class="page">${voorbeeldBadge(d)}${hdr('06', '4-dagenstartplan', a)}
    <h1 class="title">Zo begint u vandaag</h1>
    <p class="lead">Elke dag maximaal 10 minuten. Na dag 4 draait het grootste deel van dit rapport al.</p>
    <div style="flex-grow:1;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:26px;min-height:0;align-items:start;">${days}</div>
    ${ftr(d, 6)}
  </section>`;
}

// 07 Na de quick wins
function p7(d, c, a) {
  const n = d.grote_projecten.length;
  const cards = d.grote_projecten.map((g) => `<div class="card" style="padding:26px;display:flex;flex-direction:column;gap:10px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.04em;color:var(--ink-2);">GROOT PROJECT${g.mowi_product ? ` · ${esc(g.mowi_product)}<span class="tag">Mowi-dienst</span>` : ''}</div>
      <div style="font-size:19px;font-weight:600;line-height:1.3;">${esc(g.titel)}</div>
      <p style="font-size:14px;line-height:1.6;flex-grow:1;">${esc(g.toelichting)}</p>
      <div style="font-size:13px;color:var(--ink-2);">Vraag hiernaar tijdens het terugkoppelgesprek.</div>
    </div>`).join('');
  const intro = n === 0
    ? 'In het gesprek kwam niets naar boven dat buiten de quick wins valt. Dat is goed nieuws: alles in dit rapport kunt u zelf starten.'
    : `In het gesprek ${n === 1 ? 'kwam één onderwerp' : `kwamen ${['twee', 'drie'][n - 2] || n} onderwerpen`} naar boven zonder kant-en-klare tool. Geen quick wins, wel het overwegen waard.`;
  return `<section class="page">${voorbeeldBadge(d)}${hdr('07', 'Wat komt er na de quick wins', a)}
    <h1 class="title">Verder kijken dan de quick wins</h1>
    <p class="lead">${intro}</p>
    <div style="flex-grow:1;display:grid;grid-template-columns:repeat(${Math.max(n, 1)},minmax(0,1fr));gap:18px;margin-top:26px;min-height:0;align-items:start;">${cards}</div>
    ${ftr(d, 7)}
  </section>`;
}

// 08 Financiële impact
function p8(d, c, a) {
  const box = (lbl, val, sub, ink) => `<div class="${ink ? 'inkfill' : 'card'}" style="padding:22px 24px;text-align:center;min-width:180px;flex:1;">
      <div style="font-size:12px;${ink ? 'opacity:0.75;' : 'color:var(--ink-2);'}margin-bottom:8px;">${lbl}</div>
      <div class="big" style="font-size:36px;">${val}</div>
      <div style="font-size:12px;${ink ? 'opacity:0.75;' : 'color:var(--ink-2);'}margin-top:8px;line-height:1.4;">${sub}</div>
    </div>`;
  const op = (s) => `<div style="font-family:var(--font-heading);font-size:28px;color:var(--ink-3);">${s}</div>`;
  return `<section class="page">${voorbeeldBadge(d)}${hdr('08', 'Financiële impact', a)}
    <h1 class="title">Wat dit oplevert, in getallen</h1>
    <p class="lead">Elk cijfer komt uit wat u zelf in het gesprek aangaf, of uit de lijstprijs van de tool. Het is een som, geen belofte.</p>
    <div style="flex-grow:1;display:flex;align-items:center;gap:14px;margin-top:10px;">
      ${box('Tijdwinst per week', esc(uren(c.tijdwinstTotaal)), 'som van pagina 5')}
      ${op('×')}
      ${box('Uurtarief', esc(euro(d.uurtarief)), 'door u genoemd in het gesprek')}
      ${op('×')}
      ${box('Weken per maand', '4,33', '52 weken / 12 maanden')}
      ${op('−')}
      ${box('Toolkosten per maand', esc(euro(c.toolkostenTotaal)), 'som van alle tools op pagina 5')}
      ${op('=')}
      ${box('Netto per maand', esc(euro(c.nettoPerMaand)), `${esc(nl1.format(c.tijdwinstTotaal))} × ${esc(euro(d.uurtarief))} × 4,33 − ${esc(euro(c.toolkostenTotaal))}`, true)}
    </div>
    <p style="font-size:12px;color:var(--ink-3);line-height:1.5;max-width:900px;">Bron uurtarief: ${esc(d.uurtarief_bron.replace(/\.\s*$/, ''))}. Tools zonder uw eigen tijdsinschatting staan op pagina 5 als "niet geschat" en zijn niet meegeteld in de tijdwinst, wel in de kosten.</p>
    ${ftr(d, 8)}
  </section>`;
}

// 09 Vervolgstappen
function p9(d, c, a) {
  const step = (icon, kop, sub) => `<div style="display:flex;gap:16px;align-items:flex-start;">
      <span style="flex-shrink:0;margin-top:2px;display:inline-flex;">${icon}</span>
      <div><div style="font-size:16px;font-weight:600;">${kop}</div><div style="font-size:14px;color:var(--ink-2);margin-top:4px;line-height:1.5;">${sub}</div></div>
    </div>`;
  const i1 = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>';
  const i2 = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>';
  const i3 = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12 L10 18 L20 6"/></svg>';
  return `<section class="page">${voorbeeldBadge(d)}${hdr('09', 'Vervolgstappen', a)}
    <h1 class="title">Zo gaat het verder</h1>
    <div style="flex-grow:1;display:flex;gap:32px;margin-top:26px;min-height:0;">
      <div style="flex:1.2;display:flex;flex-direction:column;gap:18px;">
        ${step(i1, 'Begin met het 4-dagenstartplan', 'Vier korte stappen, samen minder dan een uur werk.')}
        ${step(i2, 'Boek uw terugkoppelgesprek', 'Dertig minuten. We lopen samen het rapport door en beantwoorden uw vragen.')}
        ${step(i3, 'Bepaal samen de prioriteit', 'Welke aanbeveling is voor u het meest urgent, en wat is uw tijdlijn.')}
        <div class="band" style="padding:14px 16px;font-size:13px;line-height:1.5;color:var(--ink-2);margin-top:auto;">Garantie: vinden wij in deze scan geen 5 uur per week aan tijdwinst, dan krijgt u het volledige bedrag terug. De som staat op pagina 8.</div>
      </div>
      <div class="inkfill" style="flex:1;padding:30px;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <span class="lockup"><img src="${a.iconBone}" alt=""><img src="${a.wordmarkBone}" alt="Mowi"></span>
          <div style="font-family:var(--font-heading);font-size:22px;font-weight:600;line-height:1.3;margin-top:22px;">Dertig minuten, we delen het scherm en lopen elke aanbeveling langs.</div>
        </div>
        <div style="margin-top:24px;">
          <a href="${esc(d.vervolg.boek_url)}" style="display:block;background:var(--bg);color:var(--ink);border-radius:var(--radius-btn);padding:13px 20px;font-size:15px;font-weight:600;text-align:center;text-decoration:none;">Terugkoppelgesprek boeken</a>
          <div style="font-size:12px;opacity:0.75;margin-top:12px;">Vragen tussendoor? Antwoord op de mail waarmee u dit rapport kreeg.</div>
        </div>
      </div>
    </div>
    ${ftr(d, 9, ` · ${esc(d.vervolg.afzender)}`)}
  </section>`;
}

function renderReport(d, c, assetsDir) {
  const a = {
    iconInk: path.join(assetsDir, 'mowi-icon-ink.png'),
    wordmarkInk: path.join(assetsDir, 'mowi-wordmark-ink.png'),
    iconBone: path.join(assetsDir, 'mowi-icon-bone.png'),
    wordmarkBone: path.join(assetsDir, 'mowi-wordmark-bone.png'),
  };
  for (const k of Object.keys(a)) a[k] = 'file://' + a[k];
  const pages = [p1, p2, p3, p4, p5, p6, p7, p8, p9].map((fn) => fn(d, c, a)).join('\n');
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<title>AI-scan · ${esc(d.klant.bedrijfsnaam)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter+Tight:wght@600;700&display=swap">
<style>${css(a)}</style>
</head>
<body>
${pages}
</body>
</html>`;
}

module.exports = { renderReport, FOCUS, KWADRANT };
