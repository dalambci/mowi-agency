---
name: "mowi-outbound"
description: "Koude e-mailacquisitie voor Mowi via Apollo vanaf sal@getmowi.nl: prospectlijst bouwen binnen de ICP, de juridische poort (KVK-rechtsvorm, non-mailing-indicator, suppressielijst) draaien vóór een contact een sequence in gaat, en de suppressieprocedure uitvoeren bij 'stop'. Gebruik bij elke lijstopbouw, bij elk 'stop'-antwoord en bij het bijstellen van de verzendlimieten."
---

# Mowi outbound — lijst, poort, suppressie

> **Blokkade sinds 2026-10-15 — geen koude e-mail activeren.** Art. 11.7 lid 1 Telecommunicatiewet vraagt
> voorafgaande toestemming voor ongevraagde commerciële e-mail aan elke eindgebruiker, ook aan een B.V.
> (sinds 1-10-2009; OPTA, Companeo-boetebesluit 2012). Lid 3 zondert alleen adressen uit die het bedrijf
> zelf voor commerciële berichten heeft "bestemd en bekendgemaakt"; Apollo-adressen zijn dat niet. Bellen
> naar een rechtspersoon mag wel (opt-out, lid 2 geldt alleen voor natuurlijke personen). Voorstel
> (telefoon eerst, mail pas na toestemming in het gesprek) staat in de vault in
> `Legal/19-LIA-outbound-prospecting.md` §6 en wacht op Sal. Tot hij beslist: de sequence niet activeren,
> geen stap toevoegen die koud mailt, en niets hieronder lezen als toestemming om te mailen.

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

KVK-sleutel: aangevraagd op developers.kvk.nl (Sal, eenmalig); sinds 2026-10-14 actief. De sleutel
zelf staat in het Developer Portal (developers.kvk.nl/nl/login, eigen gebruikersnaam en wachtwoord;
de Handelsregister-toegangscode werkt daar niet). Kosten (developers.kvk.nl/nl/pricing, gelezen
2026-10-15): abonnement €6,40/maand per API-key voor de aansluiting (alle API's samen; een extra key
kost nog eens €6,40), per bevraging Zoeken gratis en Basisprofiel/Vestigingsprofiel/Naamgeving
€0,02, btw-vrij. Opzeggen alleen schriftelijk (account@kvk.nl); de overeenkomst loopt dan door t/m
de laatste dag van de volgende kalendermaand (overeenkomst §3). `--test` draait tegen KVK's
testomgeving met de publieke testsleutel, alleen om het script te controleren; de testregistratie
bevat fictieve bedrijven.

**Eerst testen, dan pas de volledige lijst** (KVK crediteert geen kosten die een implementatiefout
veroorzaakt, gezegd in hun mail van 2026-10-07): (1) `--test`; (2) productie met `--limit 5` en
daarna het kostenoverzicht in het Handelsregister-portaal naast de uitvoer leggen; (3) pas dan de
hele export. Ingebouwde remmen (2026-10-14): `--max-paid N` (standaard 200) stopt het script en
schrijft niets weg zodra N betaalde Basisprofiel-calls zijn gedaan; een HTTP 429 wordt vier keer
herhaald en komt daarna als KVK-fout in `kvk_notitie` (status CONTROLE); een geweigerde sleutel
(401/403) stopt de hele run meteen. De samenvatting onderaan telt de echte calls (Zoeken gratis,
Basisprofiel betaald).

De sleutel mag in plaats van in de shell ook in `~/.config/mowi-outbound/kvk_api_key` (chmod 600)
staan, zodat hij nooit in een chat of commandoregel verschijnt: kopieer de sleutel uit het KVK
Developer Portal en draai `mkdir -p ~/.config/mowi-outbound && pbpaste > ~/.config/mowi-outbound/kvk_api_key && chmod 600 ~/.config/mowi-outbound/kvk_api_key`.
`KVK_API_KEY` in de omgeving gaat voor het bestand. Nooit in git of in de vault. Let op: typ die opdracht in plaats van hem te kopiëren, want kopiëren vervangt de sleutel op het klembord. Veiliger is `sh ~/.config/mowi-outbound/save-key.sh` (staat alleen op de Mac van Sal): het controleert dat het klembord op een sleutel lijkt en toont de sleutel nooit.

### 2b. Sitecontrole: hoort het e-maildomein bij het gecontroleerde bedrijf?

`kvk-check.js` matcht op bedrijfsnaam, en dat ging op 2026-10-15 bij ± 1 op 10 goedgekeurde bedrijven mis:
het echte bedrijf achter de webshop bleek een VOF, eenmanszaak of NMI "Ja" te hebben (Oostendorp, Geels,
Kilo Kilo, Kappershandel, Koffie Lovers, Woef Woef, Fento). Na het ontgrendelen daarom per contact:

1. `python3 -I tools/kvk_site_check.py <goedgekeurd.csv> <apollo-lijst.txt> <uit.tsv>` zoekt het KvK-nummer
   op de eigen site (home, contact, voorwaarden, Shopify-policies) en vergelijkt het met `kvk_nummer`.
   `apollo-lijst.txt` heeft per regel `naam | functie | bedrijf | e-mail`.
2. Ander KvK-nummer op de site: dat bedrijf telt. Geen nummer op de site: `node tools/kvk-profielen.mjs
   <uit.jsonl> <kvk-nummers…>` (± € 0,02 per nummer, harde rem 70) en de KVK-website of handelsnaam
   naast het e-maildomein leggen. Klopt geen van beide, of is het adres een privémailbox (ziggo.nl e.d.):
   GEBLOKKEERD.
3. `python3 -I tools/phone_crawl.py <goedgekeurd.csv> <belijst.csv>` haalt het publieke nummer van de eigen
   site (tel:-links eerst). Gebruik nooit Apollo's betaalde nummers.

De uitkomst van 2026-10-15 staat in de vault onder `prospects/2026-10-15-sitecontrole/`.

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
