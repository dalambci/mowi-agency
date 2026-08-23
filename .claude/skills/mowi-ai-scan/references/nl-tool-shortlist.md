# NL/EU-toolshortlist voor de AI-scan

Referentiebestand voor de `mowi-ai-scan`-skill. Doel: voorkomen dat fase 2 (AI-analyse)
structureel Amerikaanse, VS-gerichte tools voorschrijft aan Nederlandse MKB-klanten die
Nederlandstalige software nodig hebben of gekoppeld moeten worden aan Exact/AFAS/Moneybird/
SnelStart. Corey Gannon's eigen bronnen (futurepedia.io, theresanaiforthat.com — transcriptregel
62) zijn Engelstalig en dekken dit segment niet.

**Belangrijk — prijzen en features verouderen.** De onderstaande prijsindicaties zijn een
uitgangspunt, geen bevroren feit. Controleer de actuele prijs op de eigen website van de tool
voordat een cijfer het rapport in gaat (bindende copyregel: geen verzonnen kosten). Deze lijst
is een startpunt voor waar te zoeken, geen vervanging van die controle.

Gesorteerd per pijnpuntcategorie, zoals die in ontdekkingsgesprekken meestal naar boven komen.

## E-mail & klantenservice

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Trengo** | NL (Rotterdam) | Gedeelde inbox, WhatsApp/e-mail/chat samen, teamrouting | Vanaf ±€25-30/maand/gebruiker — verifiëren |
| **SaneBox** | Internationaal | Inbox-triage, automatisch sorteren op prioriteit | ±$10-20/maand — verifiëren |
| **Front** | Internationaal | Gedeelde inbox met interne notities, SLA-tracking | Vanaf ±$19/gebruiker/maand — verifiëren |
| **Gorgias** | Internationaal | Helpdesk specifiek voor Shopify/WooCommerce-webshops | Vanaf ±$10/maand instap, schaalt met tickets — verifiëren |
| **Zendesk** | Internationaal | Volwaardige helpdesk, vaak overkill voor <10 medewerkers | Alleen voorschrijven bij reëel ticketvolume |

## Notulen & transcriptie (ook relevant voor Mowi's eigen fase 1)

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Fathom** | Internationaal | Gratis notulist, samenvattingen, actiepunten uit meetings | Gratis tier vaak toereikend voor MKB |
| **Fireflies.ai** | Internationaal | Notulist + doorzoekbaar archief van gesprekken | Vanaf ±$10/maand — verifiëren |
| **tl;dv** | Internationaal (EU-gevestigd) | Meeting-recording + AI-samenvatting, EU-dataoptie | Gratis tier beschikbaar — verifiëren |

## CRM & offerte-opvolging

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Simplicate** | NL | CRM + projectadministratie + facturatie in één, populair bij NL-dienstverleners | Vanaf ±€27/gebruiker/maand — verifiëren |
| **Teamleader** | België | CRM + facturatie + projectplanning, NL-taal | Vanaf ±€25-30/maand — verifiëren |
| **Pipedrive** | Internationaal | Lichte, visuele salespipeline — Mowi's eigen CRM-keuze (dogfooding) | Vanaf ±€14/gebruiker/maand — verifiëren |
| **Salesflare** | België | Lichte CRM met automatische data-invulling | Vanaf ±€29/gebruiker/maand — verifiëren |

## Boekhouding & facturatie (AI-gestuurde herkenning/verwerking)

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Moneybird** | NL | Facturatie + boekhouding voor kleine bedrijven, sterk in NL | Vanaf ±€15-20/maand — verifiëren |
| **e-Boekhouden.nl** | NL | Boekhoudpakket, laag instapniveau | Vanaf ±€10/maand — verifiëren |
| **Klippa** | NL (Rotterdam) | AI-gestuurde bon-/factuurherkenning (OCR), koppelt op Exact/AFAS | Prijs op aanvraag — verifiëren |
| **Basecone** | NL (onderdeel Wolters Kluwer) | Factuurscanning + goedkeuringsworkflow | Prijs op aanvraag — verifiëren |
| **Exact Online / AFAS / SnelStart** | NL | Al aanwezig bij de klant — vraag altijd na in fase 1 welk pakket, aanbevelingen moeten hierop aansluiten | N.v.t., is de bestaande boekhouding |

## Lead enrichment & website-intentie

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Leadinfo** | NL (Rotterdam) | Herkent welke bedrijven de website bezoeken, koppelt aan CRM | Vanaf ±€60-70/maand — verifiëren |
| **Albacross** | Zweden | Vergelijkbaar, EU-alternatief | Prijs op aanvraag — verifiëren |

## Automatisering / koppelingen tussen systemen

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Make (voorheen Integromat)** | EU (Tsjechië) | Visuele workflow-automatisering tussen SaaS-tools, populair in NL | Gratis tier + vanaf ±€9/maand — verifiëren |
| **n8n** | EU (Duitsland) | Zelfde als Make, meer technisch, self-hosted mogelijk — is ook Mowi's eigen infrastructuur | Gratis (self-hosted) tot vanaf ±€20/maand cloud — verifiëren |
| **Zapier** | Internationaal | Marktleider, minder EU-datagaranties dan Make/n8n | Vanaf ±$20/maand — verifiëren, overweeg eerst Make/n8n bij AVG-gevoelige koppelingen |

## Agenda & planning

| Tool | NL/EU of internationaal | Wat het oplost | Indicatie |
|---|---|---|---|
| **Google Agenda / Outlook** | Internationaal | Vaak al aanwezig — eerste vraag is of dit al goed benut wordt vóór een nieuwe tool | N.v.t. |
| **Cal.com** | EU-vriendelijk, open source | Boekingslinks, self-hosted optie voor AVG-gevoelige klanten | Gratis tot vanaf ±€10-15/maand — verifiëren |

## Wanneer Mowi's eigen producten wél passen

Zie `ai-scan-offer.md`'s uitbreidingsmenu-tabel. Kort: E-mail agent/Call agent zijn valide
aanbevelingen wanneer het pijnpunt neerkomt op *repetitieve klantcommunicatie op basis van
bestaande data* (bijv. "waar blijft mijn bestelling") — niet als generieke inbox-triage
(daarvoor is SaneBox/Trengo vaak sneller en goedkoper op te zetten). Het platform (Motion B)
past bij pijnpunten die een *op maat gemaakte workflow* nodig hebben die geen off-the-shelf
tool oplost — dat is precies de "grote projecten"-kwadrant van de effort-vs-impact-matrix.
