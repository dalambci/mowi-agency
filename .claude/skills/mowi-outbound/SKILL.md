---
name: "mowi-outbound"
description: "Koude e-mailacquisitie voor Mowi via Apollo vanaf sal@getmowi.nl: prospectlijst bouwen binnen de ICP, de juridische poort (KVK-rechtsvorm, non-mailing-indicator, suppressielijst) draaien vóór een contact een sequence in gaat, en de suppressieprocedure uitvoeren bij 'stop'. Gebruik bij elke lijstopbouw, bij elk 'stop'-antwoord en bij het bijstellen van de verzendlimieten."
---

# Mowi outbound — lijst, poort, suppressie

Bindende bronnen in de vault (`/Users/sal/Desktop/Mowi brain/`, op de PC `c:/Users/SalP1/Desktop/Mowi brain/`):
`Legal/19-LIA-outbound-prospecting.md` (§4 waarborgen, geen van alle optioneel),
`Marketing & acquisition/suppression-procedure.md`, `outbound-sequence-assessment-v2.md`
(copy v3 + Apollo-inrichting), `Business model & strategy/Mowi - ICP segmentation 2026-09.md` (§4).

## Vaste feiten (stand 2026-10-07)

- Verzendmailbox **sal@getmowi.nl**, nooit `contact@mowi.agency`. Apollo-sequence
  "Webshops NL - Support Agent v3", footer als mailbox-handtekening, tracking uit, schema
  ma-vr 08-17 op tijdzone *Paris* (= Amsterdam; Apollo kent geen Amsterdam).
- Limieten: mailbox 5/dag, 2/uur, 600 s; sequence 5 per 24 u. Ramp: +5 per week tot 15/dag,
  alleen als bounces < 2% en er geen spamklachten zijn.
- Alleen Nederland. België staat uit tot een advocaat ernaar heeft gekeken (LIA §4).
- Testcampagne ±150 prospects; niet-reagerenden na 6 maanden uit de actieve lijst.

## 1. Lijst bouwen in Apollo (People)

Filters, in deze volgorde:

| Filter | Waarde | Waarom |
|---|---|---|
| Location (person) | Netherlands | LIA: alleen NL |
| # Employees | 1-10, 11-20, 21-50 | ICP 1-50; webshop 2-20 is het sterkste segment |
| Industry & Keywords, include (tags + name) | webshop, webwinkel, e-commerce, online shop | "webshop" is geen branche in Apollo; de **Technologies**-filter (Shopify, WooCommerce, …) zit achter het betaalde plan (gecontroleerd 2026-10-07: "Cannot access advanced filters … on free plan"), dus de keywords zijn het webshop-signaal |
| Industry & Keywords, exclude | agency, bureau, marketing, webdesign, web design, development, consultancy, software, saas, hosting | zonder dit staan de webshop-bouwers tussen de webshops |
| Job titles | owner, founder, eigenaar, oprichter, directeur, managing director, ceo, e-commerce manager, customer service manager | de beslisser of degene met de inbox-pijn |
| Email status | Verified | bounces zijn wat een vers domein de das omdoet |

De opgeslagen zoekopdracht heet **"Webshops NL 1-50 (v3)"** (People → Saved searches). **Nooit** direct
"Add to sequence" vanuit de zoekresultaten; eerst de poort hieronder. Exporteer naar CSV (People → selecteer → Export; kost exportcredits op het
gratis plan) en zet het bestand in de vault onder `Marketing & acquisition/prospects/`.

## 2. De juridische poort — `kvk-check.js`

```
KVK_API_KEY=... node .claude/skills/mowi-outbound/kvk-check.js "<vault>/Marketing & acquisition/prospects/apollo-export-JJJJ-MM-DD.csv"
```

Per bedrijf één KVK-zoekactie (gratis) en één Basisprofiel-call (±€0,02). Uitkomst per contact:

- **TOEGESTAAN**: rechtspersoon (B.V., N.V., stichting, vereniging, coöperatie), non-mailing-
  indicator "Nee", domein niet op de suppressielijst.
- **GEBLOKKEERD**: eenmanszaak, VOF, CV, maatschap (natuurlijke personen, toestemming vereist),
  NMI "Ja", of domein op de suppressielijst.
- **CONTROLE**: geen betrouwbare match, buitenlandse of zeldzame rechtsvorm. Zelf opzoeken op
  kvk.nl, uitkomst in de kolom `kvk_notitie` zetten en de status met de hand aanpassen; bij
  twijfel blijft het GEBLOKKEERD.

Alleen `apollo-toegestaan-<datum>.csv` mag Apollo in (People → Import → CSV, daarna pas "Add to
sequence"). De volledige `prospects-check-<datum>.csv` is de audittrail; voeg de toegestane
regels ook toe aan `prospects-test-1.csv` (kolommen daar: bedrijf, rechtsvorm, kvk_check_datum,
non_mailing_indicator, contactpersoon, functietitel, email, bron_adres, apollo_verified,
toegevoegd_op, sequence_status).

KVK-sleutel: aanvragen op developers.kvk.nl (Sal, eenmalig). Zoeken is gratis; Basisprofiel is een
betaald abonnement (±€6,40/maand + €0,02/call). `--test` draait tegen KVK's testomgeving met de
publieke testsleutel, alleen om het script te controleren; de testregistratie bevat fictieve
bedrijven.

## 3. Warmup, kort

Zie `Marketing & acquisition/warmup-protocol-getmowi.md`. Geen koude mail vóór week 3; de
sequence blijft inactief tot Sal zelf op Activate drukt.

## 4. Suppressie bij "stop", bezwaar of harde bounce

Dezelfde werkdag, in deze volgorde: (1) Apollo → contact en het hele bedrijfsdomein op de
suppressielijst, uit elke sequence; (2) regel toevoegen aan
`Marketing & acquisition/suppression-list.csv` (`domein, datum_toegevoegd, reden, sequence_naam`,
nooit verwijderen); (3) bij een expliciet bezwaar een korte menselijke bevestiging terug, zonder
verkoop. Out-of-office is geen stop. `kvk-check.js` leest dit bestand bij elke volgende lijst.

## Related

`outbound-sequence-assessment-v2.md` · `suppression-procedure.md` · `19-LIA-outbound-prospecting.md` ·
`prospect-engine-plan (not executed).md` §3-4 · `Mowi - ICP segmentation 2026-09.md`
