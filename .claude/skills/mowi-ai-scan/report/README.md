# AI-scan rapport, bouwen

```
node build-report.js <pad/naar/scan.json> [--out <map>] [--png] [--allow-below-guarantee]
```

- Uitvoer: `<slug>-ai-scan-rapport.pdf` en `.html`, naast de JSON tenzij `--out`.
- `--png`: één PNG per pagina erbij, voor de QA.
- `--allow-below-guarantee`: bouw ook als de garantie-som onder 5 uur/week ligt (restitutiegeval).
- Draait vanuit elke map; Playwright komt uit de `node_modules` van de repo-root. Webfonts
  (Plus Jakarta Sans, Inter Tight) worden van Google Fonts geladen, dus netwerk is nodig; zonder
  netwerk waarschuwt de builder en valt hij terug op een systeemlettertype.

Voorbeeld: `node build-report.js voorbeeld-scan.json --out out --png` (de `_voorbeeld`-sleutel in
dat bestand zet een VOORBEELD-badge op elke pagina). Echte klantscans horen in de vault, nooit in
deze repo; zie `../SKILL.md`.

Wat de builder weigert en waarom staat in de kop van `build-report.js`. Pas de JSON aan, niet
het script.
