/* generate-it-sheets.js — dev-only tooling (same status as build-blog.js /
   screenshot.js), not part of the shipped site's runtime. Renders one clean
   A4 PDF per koppeling into downloads/, from the "Voor uw IT-partner"
   copyable request text — Exact Online and AFAS content is copied verbatim
   from the real docs pages (docs/koppeling-exact-online.html,
   docs/koppeling-afas.html); SnelStart and Pipedrive have no docs page yet
   (see js/docs-nav.js), so their content is deliberately more cautious —
   Pipedrive's steps are grounded in Pipedrive's own official developer docs
   (pipedrive.readme.io, fetched 2026-08-04), SnelStart's are not, since no
   equivalent confirmed source was found for a *client-side* authorization
   flow (only a multi-step *developer* certification process, a different,
   one-time thing Mowi itself would do, not something to hand a client's
   IT-partner). Sal reviews every sheet before it goes live, per the
   Website & Conversion plan's own instruction.

   Run with: node generate-it-sheets.js */

const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT_DIR = path.join(__dirname, "downloads");

function sheetHtml({ title, requestText, note }) {
  const escapedRequest = requestText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap" rel="stylesheet" />
<style>
  @page { size: A4; margin: 22mm 20mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
    color: #16140f;
    margin: 0;
    font-size: 11pt;
    line-height: 1.55;
  }
  .brand { display: flex; align-items: center; gap: 0.6em; margin-bottom: 2.4em; }
  .brand-name { font-size: 15pt; font-weight: 800; letter-spacing: -0.02em; }
  h1 { font-size: 17pt; font-weight: 800; letter-spacing: -0.02em; margin: 0 0 0.3em; }
  .sub { color: #6b6a63; margin: 0 0 2em; font-size: 10.5pt; }
  pre {
    white-space: pre-wrap;
    font-family: inherit;
    font-size: 10.5pt;
    background: #fcfbfa;
    border: 1px solid #e6e2d8;
    padding: 1.4em 1.6em;
    margin: 0 0 1.4em;
  }
  .note { font-size: 9.5pt; color: #6b6a63; margin: 0 0 2.4em; }
  .footer { font-size: 9.5pt; color: #6b6a63; border-top: 1px solid #e6e2d8; padding-top: 1em; }
</style>
</head>
<body>
  <div class="brand">
    <div class="brand-name">mowi</div>
  </div>
  <h1>${title}</h1>
  <p class="sub">Eén A4 om direct door te sturen naar wie de koppeling aan de andere kant beheert.</p>
  <pre>${escapedRequest}</pre>
  ${note ? `<p class="note">${note}</p>` : ""}
  <div class="footer">Mowi &middot; 085 333 5800 &middot; contact@mowi.agency &middot; mowi.agency/colofon</div>
</body>
</html>`;
}

const sheets = [
  {
    file: "it-partner-exact-online.pdf",
    title: "Exact Online-koppeling voor Mowi instellen",
    requestText: `Onderwerp: Exact Online-koppeling voor Mowi instellen

Beste [naam IT-partner],

Voor de koppeling van ons Mowi-dashboard met Exact Online hebben we het volgende nodig:

1. Toegang voor Mowi via het App Center van Exact Online, voor de juiste administratie(s) — graag aangeven om welke administratie(s) het gaat als er meerdere zijn.
2. De rechten die Mowi voor deze koppeling nodig heeft. Mowi bevestigt de exacte rechten voorafgaand aan het inrichten — neem hierover contact op met Mowi voordat u de koppeling autoriseert.
3. De inloggegevens van de koppeling via een veilig kanaal gedeeld met Mowi, niet per e-mail in platte tekst.

Contactpersoon bij Mowi: contact@mowi.agency / 085 333 5800.

Met vriendelijke groet,
[uw naam]`,
    note: "Punt 2 is bewust niet ingevuld met specifieke rechten: die hangen af van hoe Mowi de koppeling voor u inricht. Bron: docs.mowi.agency/koppeling-exact-online.",
  },
  {
    file: "it-partner-afas.pdf",
    title: "AFAS-koppeling voor Mowi instellen",
    requestText: `Onderwerp: AFAS-koppeling voor Mowi instellen

Beste [naam IT-partner],

Voor de koppeling van ons Mowi-dashboard met AFAS hebben we het volgende nodig:

1. Een app connector aangemaakt voor Mowi in onze AFAS-omgeving (Algemeen / Beheer / App connector).
2. Een gebruikerstoken gekoppeld aan die app connector, met de rechten die Mowi voor deze koppeling nodig heeft. Mowi bevestigt de exacte rechten voorafgaand aan het inrichten — neem hierover contact op met Mowi voordat u de app connector aanmaakt.
3. Het token via een veilig kanaal gedeeld met Mowi, niet per e-mail in platte tekst.

Contactpersoon bij Mowi: contact@mowi.agency / 085 333 5800.

Met vriendelijke groet,
[uw naam]`,
    note: "Punt 2 is bewust niet ingevuld met specifieke rechten: die hangen af van hoe Mowi de koppeling voor u inricht. Bron: docs.mowi.agency/koppeling-afas.",
  },
  {
    file: "it-partner-snelstart.pdf",
    title: "SnelStart-koppeling voor Mowi instellen",
    requestText: `Onderwerp: SnelStart-koppeling voor Mowi instellen

Beste [naam boekhouder / IT-partner],

Voor de koppeling van ons Mowi-dashboard met SnelStart neemt Mowi's implementatieteam rechtstreeks contact met u op om vast te stellen wat er precies nodig is — dit hangt af van hoe de koppeling technisch wordt ingericht.

Neem in de tussentijd alvast het volgende door:

1. Weet u welke SnelStart-administratie gekoppeld moet worden, als er meerdere zijn.
2. Heeft u (of iemand in uw organisatie) rechten om een koppeling of API-toegang voor SnelStart te autoriseren.

Contactpersoon bij Mowi: contact@mowi.agency / 085 333 5800 — zij nemen de vervolgstappen met u door.

Met vriendelijke groet,
[uw naam]`,
    note: "V1 — bewust algemener dan de Exact Online- en AFAS-versies van dit A4: er bestaat nog geen Mowi-documentatiepagina voor de SnelStart-koppeling, en de exacte technische autorisatiestap (API-sleutel, app-koppeling of iets anders) staat aan Mowi's kant nog niet vast. Wordt bijgewerkt zodra dat wel zo is.",
  },
  {
    file: "it-partner-pipedrive.pdf",
    title: "Pipedrive-koppeling voor Mowi instellen",
    requestText: `Onderwerp: Pipedrive-koppeling voor Mowi instellen

Beste [naam IT-partner],

Voor de koppeling van ons Mowi-dashboard met Pipedrive hebben we het volgende nodig:

1. Een persoonlijk API-token uit Pipedrive: accountnaam (rechtsboven) > Company settings > Personal preferences > API. Is deze optie niet zichtbaar, dan moet een beheerder eerst API-toegang voor de organisatie inschakelen.
2. Het token via een veilig kanaal gedeeld met Mowi, niet per e-mail in platte tekst.
3. Mowi bevestigt vooraf welke rechten/scope voor deze koppeling nodig zijn — neem hierover contact op met Mowi voordat u het token deelt.

Contactpersoon bij Mowi: contact@mowi.agency / 085 333 5800.

Met vriendelijke groet,
[uw naam]`,
    note: "Punt 1 is rechtstreeks uit Pipedrive's eigen documentatie (pipedrive.readme.io, geraadpleegd 2026-08-04). Punt 3 is bewust niet ingevuld met specifieke rechten: die hangen af van hoe Mowi de koppeling voor u inricht.",
  },
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const sheet of sheets) {
    await page.setContent(sheetHtml(sheet), { waitUntil: "networkidle" });
    const outPath = path.join(OUT_DIR, sheet.file);
    await page.pdf({ path: outPath, format: "A4", printBackground: true });
    console.log("wrote", outPath);
  }

  await page.close();
  await browser.close();
})();
