---
name: "mowi-ai-scan"
description: "Fase 2 (AI-analyse) van Mowi's betaalde AI-scan-aanbod: neemt het transcript van een ontdekkingsgesprek en levert pijnpunten -> aanbevolen tools (kosten, opzettijd, tijdwinst/week), NL-first. Gebruik na elk ontdekkingsgesprek voor de AI-scan, vóór het rapport wordt opgesteld."
---

# Mowi AI-scan — fase 2, AI-analyse van het transcript

Fulfilment-stap voor Mowi's betaalde AI-scan (€999 excl. btw, geld-terug-garantie bij minder
dan 5 uur/week tijdwinst). Zie `ai-scan-offer.md` in de projectvault
(`c:/Users/SalP1/Desktop/Mowi brain/Marketing & acquisition/`) voor het volledige aanbod, en
`ai-scan-discovery-questions.md` voor de vragenlijst die het transcript oplevert. Gebaseerd op
Corey Gannon's "AI Tools Assessment"-methode (`The_1000hour_Solo_AI_business_Full_Course_eng.txt`).

## Wat deze skill doet

Input: het transcript van het 45-minuten ontdekkingsgesprek (fase 1), plus welke systemen de
klant gebruikt (Exact, AFAS, Moneybird, SnelStart, Shopify, WooCommerce, Pipedrive, Google
Agenda/Outlook — uit de laatste vraag van `ai-scan-discovery-questions.md`).

Output: 3-7 pijnpunten, elk gekoppeld aan één concrete tool, met per aanbeveling:
- **Pijnpunt** — één zin, herleidbaar naar wat de klant letterlijk zei
- **Tool** — naam, en of het een NL/EU-tool is of een internationale
- **Kosten** — €/maand, echte lijstprijs, geen schatting
- **Opzettijd** — realistische inschatting in minuten
- **Tijdwinst/week** — alleen invullen als de klant zelf een tijdsindicatie gaf op dat
  pijnpunt (zie de garantiedefinitie in `ai-scan-offer.md` §1 — een cijfer zonder klant-bron
  telt niet mee voor de garantie)
- **Effort/impact-classificatie** — quick win (laag effort, hoog impact) of groot project
  (hoog effort, hoog impact), voor de effort-vs-impact-matrix in het rapport (fase 3)

## Werkwijze

1. **Lees het transcript volledig.** Zoek naar elk moment waarop de klant een taak, frustratie
   of tijdverlies noemt — ook impliciete signalen ("dat kost me altijd te veel tijd", "daar
   loop ik dan weer achteraan"), niet alleen expliciete klachten.
2. **Zoek per pijnpunt naar tools**, in deze volgorde van voorkeur:
   - Eerst `references/nl-tool-shortlist.md` in deze skill-map — de gecureerde NL/EU-lijst.
     **Dit bestand eerst raadplegen, niet overslaan.** Zonder deze stap schrijft de analyse
     structureel Amerikaanse tools voor die niet aansluiten op NL-boekhoudpakketten of de
     Nederlandse taal.
   - Pas als de shortlist niets passends bevat: WebSearch, met futurepedia.io en
     theresanaiforthat.com als startpunt (bron: transcriptregel 62) — filter dan zelf op
     NL-taalondersteuning en EU-dataopslag waar dat voor het pijnpunt relevant is (bijv.
     alles wat persoonsgegevens verwerkt).
   - Mowi's eigen producten (E-mail agent, Call agent, koppelingen, het platform) mogen als
     aanbeveling meegenomen worden waar ze **aantoonbaar** het beste antwoord zijn — nooit
     standaard, nooit als eerste optie zonder afweging. Zie de mapping-tabel in
     `ai-scan-offer.md` §"Het uitbreidingsmenu" voor welk Mowi-product bij welk soort
     "groot project" hoort.
3. **Wees tool-agnostisch.** Dit is Sal's expliciete instructie (2026-08-21): het rapport
   beveelt de beste tool aan, niet de Mowi-tool. Een scan die alleen Mowi-producten voorschrijft
   ondermijnt de geld-terug-garantie en het "doctor die niets verkoopt"-frame dat de €999
   rechtvaardigt.
4. **Vermijd overkill.** Klassiek voorbeeld uit de transcriptie (regel 44): een AI die
   Salesforce voorschrijft aan een 4-persoonsbedrijf. Weeg bedrijfsgrootte en volume mee bij
   elke aanbeveling — een tool die voor een enterprise-klant logisch is, is voor een MKB-bedrijf
   met 5 medewerkers vaak overkill.
5. **Splits quick wins van grote projecten.** Quick wins zijn off-the-shelf, klant kan zelf
   binnen enkele minuten starten. Grote projecten vergen een implementatie (vaak een Mowi-
   upsell) — deze horen op slide 7 van het rapport ("wat komt er na de quick wins"), niet
   tussen de quick wins.

## QA — verplicht, nooit overslaan

De output van deze skill gaat **nooit rechtstreeks** naar de klant. Een mens controleert altijd:
- Klopt elke tool-aanbeveling qua bedrijfsgrootte en budget?
- Is elk tijdwinst-cijfer herleidbaar naar iets wat de klant zelf zei?
- Staan er geen verzonnen kosten in (bindende copyregel — altijd de echte lijstprijs opzoeken,
  nooit schatten)?
- Is de mix tool-agnostisch genoeg, of leunt de output te veel op Mowi's eigen producten?

## Leren van eerdere scans

Vanaf de 3e à 4e uitgevoerde scan: voeg afgeronde transcript+rapport-paren toe als voorbeelden
in `references/` (nieuw bestand per voorbeeld, bijv. `references/example-scan-01.md`), zodat
latere analyses weten hoe een goede aanbeveling eruitziet. Nooit klantgegevens herleidbaar
laten — anonimiseer bedrijfsnaam en contactpersoon voordat een transcript als voorbeeld wordt
opgeslagen.

## Related

- `ai-scan-offer.md`, `ai-scan-discovery-questions.md`, `ai-scan-review-call-script.md` — vault,
  `Marketing & acquisition/`
- `references/nl-tool-shortlist.md` — de gecureerde NL/EU-toollijst, in deze skill-map
- `Dashboard/Integrations hitlist` — welke koppelingen Mowi vandaag écht ondersteunt (8 van 30)
