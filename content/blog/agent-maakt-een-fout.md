---
title: "Wat gebeurt er als de e-mailagent een fout maakt?"
description: "Elke storing verschijnt direct onder 'Needs attention' in het dashboard. Wat telt als een fout, wie lost het op, en merkt de klant er iets van?"
slug: agent-maakt-een-fout
date: 2026-08-08
updated:
author: Sal
tags: [email, agents, betrouwbaarheid]
video_id:
draft: false
sources: []
faq:
  - q: "Kan ik een gepauzeerde agent zelf weer starten?"
    a: "Nee, dat kan niet zelf in het dashboard. Neem contact op met Mowi om de agent weer te laten draaien."
  - q: "Wat zie ik als een run is mislukt?"
    a: "Bij een mislukte run staat een toelichting in de kolom Note onder Run history — neem contact op met Mowi en vermeld die tekst."
  - q: "Merkt de klant iets van een storing?"
    a: "Meestal niet: Needs attention signaleert het voordat een klant erover kan bellen, en de mail blijft gewoon in de mailbox staan tot het is opgelost."
  - q: "Werkt dit ook als de mailboxkoppeling wegvalt?"
    a: "Ja, ook dat verschijnt als storing. Herstel gebeurt via je Google- of Microsoft-accountinstellingen, samen met Mowi."
---

Niets stiekem: elke fout — een verkeerd ingeschatte mail, een mislukte run, een weggevallen mailboxkoppeling — verschijnt direct onder "Needs attention" in het dashboard, zodat iemand het ziet voordat een klant erover belt. De agent lost het niet zelf op; dat doe jij of Mowi. Geen enkel systeem is foutloos. Het verschil zit in of je het merkt vóór het schade doet, niet in of het ooit misgaat.

## Waarom deze vraag nu speelt

Voordat iemand de mailbox uit handen geeft, is dit meestal de eerste vraag: wat als het misgaat? Bij administratie is een fout vervelend; bij e-mail naar klanten voelt het risicovoller, omdat een verkeerd antwoord direct zichtbaar is voor de buitenwereld.

Een vaag "dat lossen we op" stelt niemand gerust. Hieronder staat precies wat er telt als fout, waar je dat ziet, en wie er dan aan zet is.

## Wat telt eigenlijk als een fout?

Drie dingen kunnen misgaan: de agent schat een mail verkeerd in, een run mislukt door een technisch probleem, of de koppeling met de mailbox valt weg.

Een verkeerde inschatting is bijvoorbeeld een offerteaanvraag die als nieuwsbrief wordt gearchiveerd. Een mislukte run is een technische hapering tijdens het verwerken — de mail zelf blijft gewoon in de mailbox staan, er gaat niets verloren. Een weggevallen koppeling ontstaat meestal doordat toegang is ingetrokken, een wachtwoord is gewijzigd, of een beveiligingsinstelling van Gmail of Microsoft 365 de verbinding blokkeert.

## Hoe zie je dat er iets misging?

Via "Needs attention" in het dashboard, en dat verschijnt op het moment zelf, niet achteraf. Bekijk de [E-mail agent](/agents/email-triage) voor het volledige overzicht van wat je daar ziet.

Op de detailpagina van de agent staat de status rechtsboven (Running of Paused) en daaronder Run history: tijdstip, status en aantal verwerkte taken per run. Staat een run op Failed, dan staat er een toelichting in de kolom Note — dat is precies de tekst die je aan Mowi doorgeeft om het probleem te melden.

## Wie lost het op, en wat doe jij?

Jijzelf niet vanuit het dashboard — de status zelf wijzigen kan daar niet. Je meldt het bij Mowi, met de tekst uit de Note-kolom als die er is, en Mowi herstelt het.

Er is geen vaste hersteltijd om hier te noemen; hoe snel dat gaat hangt af van wat er precies misging. Wat wel vaststaat: het probleem is al zichtbaar voordat je het zelf hoefde te ontdekken, en dat is de winst ten opzichte van een systeem zonder die melding.

## Merkt de klant er iets van?

Meestal niet, zolang de storing snel wordt opgemerkt en verholpen. De mail zelf gaat nooit verloren — hij blijft gewoon in de mailbox staan tot hij alsnog correct wordt verwerkt.

Er is wel een situatie waarin een klant het wél merkt: als een koppeling langere tijd stil ligt zonder dat iemand het dashboard checkt, stapelt onverwerkte mail zich op en duurt het langer voordat een klant iets terughoort. Precies daarom is het raadzaam om zelf ook af en toe naar Running te kijken, niet alleen te vertrouwen op de melding.

## Praktijkvoorbeeld: onze eigen inbox

Mowi draait de E-mail agent op de eigen inbox — gaat er iets mis, dan zien we dat zelf het eerst, via hetzelfde "Needs attention"-systeem dat klanten ook hebben. Er is geen apart, beter systeem achter de schermen: het is exact wat je zelf ook in je dashboard ziet.

Dat is ook waarom het zo is gebouwd: niet voor een demo, maar om zelf op te kunnen vertrouwen vóórdat het aan een klant werd aangeboden. Signaleert het voor de eigen mailbox iets te laat, dan is dat het eerste wat opvalt — nog voordat het bij een klant een rol speelt.

## Wat je in het dashboard ziet: het overzicht

| Status | Wat het betekent | Wat je doet |
|---|---|---|
| Running | Agent verwerkt actief mail | Niets — dit is de normale stand |
| Paused | Koppeling of proces staat stil | Neem contact op met Mowi |
| Failed (bij een run) | Die specifieke run is mislukt | Bekijk de Note-kolom, meld dit bij Mowi |

Meer weten over hoe dit er in de praktijk uitziet? Lees de [installatiehandleiding voor de E-mail agent](/docs/agent-email-triage), of hoe de agent binnenkomende mail precies afhandelt in [Kan e-mail automatisch beantwoord worden zonder dat klanten het merken?](/blog/e-mail-automatisch-beantwoorden)
