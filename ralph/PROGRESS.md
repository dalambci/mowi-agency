# PROGRESS

Append-only build log. One entry per completed (or blocked) loop iteration, newest at the bottom.
Written in Step 6, committed in Step 7. This file is also what the **stall rule** reads: if the last
3 entries show no new `[x]`, the run is stalled.

## Entry format

```
### YYYY-MM-DD HH:MM - <task-id> <slug>
- Built: <files created, one clause each>
- Decisions: <anything chosen where the spec left room; "none" is a valid answer>
- Oddities: <surprises, near-misses, verify.mjs failures and what fixed them; "none" is fine>
- Status: [x] done  |  [blocked] <one-line reason, mirrored in NEEDS_SAL.md>
```

Keep it to 3-5 lines. This is a trail for the next iteration and for Sal, not a report.

A `[blocked]` entry has a higher bar than a `[x]` one: it must name the file(s) that were actually built
and quote the `verify.mjs` check ids that were still FAIL after the third fix round. That is what the
Finishing predicate in `LOOP_PROMPT.md` checks for, and it is why "this looked hard" cannot become blocked.

No example entry lives in this file on purpose. The stall rule reads the last 3 entries here, so a sample
entry sitting in an otherwise empty log would read as a completed task and mask a stall.

---

## Log

### 2026-09-02 - T01 pipedrive
- Built: `downloads/it-partner-pipedrive.html` (sheet, built first so the lander's `sheet-link`
  check could resolve it) and `koppeling-pipedrive.html` (lander, 7 sections, 4-question FAQ).
- Decisions: the 5 "Zo koppelt u" steps are one-per-entry from `pipedrive.instructions[]` in the
  dashboard's `config/shop_platforms.php` (auth `static`, field label `API-token`), nothing merged.
  Section 4 links to `/e-mail-agent` and `/call-agent` rather than SPEC section 4's literal
  `/workflows#email-agent` / `#call-agent`: the sitewide nav in `test.html` uses the real agent
  pages, and those two fragments exist nowhere on the site (see S-006). `/workflows#crm-sync` is
  from the nav as written. Sheet's secure-channel step uses the prescribed fallback line (S-007).
  Sources cited per SPEC 5: tier 1 `docs/koppeling-pipedrive.html` (read-only claim, token is
  personal, 401 troubleshooting), tier 2 the dashboard config, tier 5 Pipedrive's own docs via
  `generate-it-sheets.js` (the "beheerder moet API-toegang inschakelen" note, 2026-08-04).
- Oddities: one `structure` FAIL on round 1, `<main` counted twice. The second hit was the literal
  string in a head comment ("zodat `<main>` scriptvrij blijft") - `structure` is the one gate that
  reads raw source, comments included. Reworded the comment; green on round 2, `--dom` green first try.
- Status: [x] done

### 2026-09-02 - T02 exact-online
- Built: `downloads/it-partner-exact-online.html` (sheet, built first) and `koppeling-exact-online.html`
  (lander, 7 sections, 4-question FAQ). Cache-bust read live from `index.html`: unchanged from T01
  (`style.css?v=20260829-5`, `main.js?v=20260822-23`).
- Decisions: this is the spec's own oauth/`fields => []` example (`exact_online.auth = 'oauth'` in
  `config/shop_platforms.php`), so "Zo koppelt u" is 3 steps (1:1 with `instructions[]`, nothing
  merged) and both the lander's IT-partner paragraph and the whole sheet say plainly there is no
  credential to create or hand over, only a login with the right account/administration - per SPEC
  section 5's "first check whether there is anything to ask for at all." Section 4 cards: read
  `ExactOnlineGateway.php` (tier 2) and found it implements both `CrmGateway`
  (findPersonByEmail/findPersonByPhone, same interface Pipedrive's recognition claim rests on) and
  `InvoiceGateway` (open/overdue invoices, aging buckets) - so cards are Inbox agent, Voice agent, and
  `/workflows#dashboard-openstaande-facturen` (matches the nav's own "Welke facturen aandacht nodig
  hebben" description) rather than reusing Pipedrive's third CRM-sync card. Followed S-006's precedent
  of linking `/e-mail-agent` + `/call-agent` literally rather than the spec's `#email-agent`/`#call-agent`
  fragments, for consistency with T01. Added one grounded FAQ/step caveat not in T01: Exact Online's
  OAuth only covers the Netherlands entry point (`start.exactonline.nl`), sourced from a code comment
  in `ExactOnlineGateway.php`, not customer-facing UI copy - flagged in REVIEW.md for Sal to confirm
  since it has no live-copy precedent.
- Oddities: meta description was 157 chars on round 1 (need <=155); trimmed "met uw eigen account" to
  "met eigen account", green on round 2. `--dom` green first try.
- Status: [x] done

### 2026-09-02 - T03 woocommerce
- Built: `downloads/it-partner-woocommerce.html` (sheet, built first) and `koppeling-woocommerce.html`
  (lander, 7 sections, 5 steps, 4 cards, 4-question FAQ). Cache-bust read live from `index.html`:
  unchanged (`style.css?v=20260829-5`, `main.js?v=20260822-23`). Chrome copied from the T01 lander,
  which `verify.mjs` confirmed byte-identical to `test.html` at the start of this iteration.
- Decisions: `woocommerce.instructions[]` has 7 entries (auth `static`, fields Webshop-adres / Consumer
  key / Consumer secret). Shipped as 5 steps under the "a step is an action" rule and SPEC 4's 3-5 cap:
  entries 3-5 (Sleutel toevoegen, Beschrijving + Rechten, Generate API Key) are one step "Maak een
  sleutel aan", the exact grouping tier-1 `docs/koppeling-woocommerce.html` already uses for its own
  step 4; entry 6's copy is step 4; entry 6's paste plus entry 7's Koppelen is step 5 (Pipedrive's own
  config writes paste + Koppelen as one instruction). Nothing dropped. Section 4 has 4 cards (the grid
  is 2-col, so 2x2): Inbox/Voice agent per S-006, `/workflows#order-status` (the nav's own "Zoekt
  bestellingen op in uw webshop"), and `/workflows#dashboard-webshops-vergelijken`, grounded the way
  T02's dashboard card was: `WooCommerceGateway.php` (tier 2) implements `OrderGateway`
  (findByOrderNumber / findByEmail, which is where "op bestelnummer of e-mailadres" comes from) plus the
  Sales / OrderCount / ProductSales / CustomerSales gateways, and its docblock names the "Webshops
  vergelijken" dashboard on a real client store. Preview chip "In behandeling" is a real label from that
  gateway's STATUS_LABELS, not invented. Sheet reuses S-007's fallback line and adds the /wp-json/
  reachability note from the docs page's 404 troubleshooting. No new NEEDS_SAL entries. Unlike S-008's
  platforms, this gateway is live-verified against a real store (2026-08-25, per its own docblock).
- Oddities: none. Both gates green on round 1, 0 skips on the lander. Both meta descriptions measure
  exactly 155, the ceiling: fine, but one added word breaks them.
- Status: [x] done

### 2026-09-02 - T04 shopify
- Built: `downloads/it-partner-shopify.html` (sheet, built first) and `koppeling-shopify.html` (lander,
  7 sections, 3 steps, 4 cards, 4-question FAQ). Cache-bust read live from `index.html`: unchanged
  (`style.css?v=20260829-5`, `main.js?v=20260822-23`). Chrome copied from the T03 lander, which
  `verify.mjs` confirmed byte-identical to `test.html`.
- Decisions: click-path follows tier 2, `shopify` in `config/shop_platforms.php`: `auth => 'oauth'` with
  `requires_shop_domain`, 3 `instructions[]` entries shipped 1:1 as 3 steps (adres invullen / Koppel met
  Shopify / toegang bevestigen), the "U komt automatisch terug ... Verbonden" confirmation folded into
  step 3's body. Field label "Shopify-adres", its hint and the button text read from
  `update-shop-connection-form.blade.php`. The config's `fields[]` (Admin API-token) is admin/concierge
  only per its own comment, so neither page mentions a token. **Tier 1 `docs/koppeling-shopify.html`
  contradicts the config**: it still describes the pre-OAuth concierge flow (ask via Support, receive an
  approval link, Mowi finishes it). SPEC 9 makes the dashboard the only admissible click-path source, so
  the lander follows the config; logged as S-009. Cards mirror T03 (Inbox, Voice, Orderstatus, Webshops
  vergelijken): `ShopifyGateway.php` implements the same `OrderGateway` (findByOrderNumber/findByEmail)
  plus the OrderCount/Sales/ProductSales/CustomerSales gateways, live-verified against a real store per
  its docblock. The track-en-trace claim comes from its `FIELDS` (`fulfillments.trackingInfo`) and the
  docs page. FAQ "60 dagen" grounded in the docs page plus the `read_all_orders` scope; "toegang
  intrekken" (Instellingen, Apps, Mowi-app verwijderen, status Fout) from the docs page and the blade's
  status labels. Preview chip "Verzonden" is a real `STATUS_LABELS` value. Sheet is the oauth shape like
  T02: nothing to create or hand over, only an owner/admin login (owner/admin requirement from the docs
  page's prereqs). No em dash or arrow from the config's instruction strings made it into copy.
- Oddities: sheet meta description was 157 chars on round 1 (need <=155); "wie die kan bevestigen" to
  "wie die bevestigt", green on round 2. `--dom` green both rounds, 0 skips on the lander.
- Status: [x] done

### 2026-09-03 - T01R pipedrive (retrofit to D17 template)
- Built: rewrote `koppeling-pipedrive.html` in place to the `koppeling-exact-online.html` template
  (`.hero.lp-hero` question H1, `.lp-section-heading` sub-questions, 3 `.dp-window` previews, one CTA
  in the hero, no closing-CTA section). `downloads/it-partner-pipedrive.html` untouched: D17 only
  redesigned the lander spec (SPEC section 4), the sheet spec (section 5) never moved.
- Decisions: same content, restructured, not re-derived. FAQ (4 Q&A) and JSON-LD carried over
  byte-identical. Steps folded from 5 to 4 the same way T02 went 3 to 2: `pipedrive.instructions[]`
  entries 2+3 (direct link vs. via-menu route to the same API-settings screen) merged into one step's
  body, nothing dropped. Section 3 ("Welke agents...") kept T01's original 3-card link-stack (Inbox
  agent, Voice agent, CRM-synchronisatie) with no dashboard card and no side-preview swap: re-read
  `PipedriveGateway.php` for the retrofit and confirmed its `DealGateway` methods (pipeline/win-rate
  aggregates) carry the same "NOT live-verified against a real sandbox" docblock pattern S-008 already
  flagged for Exact Online/Moneybird, while only the `CrmGateway` contact-lookup half (which the hero/
  side previews already draw from) was live-verified - so no new dashboard claim was added. Section 2
  ("Wat leest Mowi...") gained a 4th icon card, "Open deals in beeld", grounded in
  `buildPersonShape()`'s `open_deals` field (title + stage), which IS part of the verified contact-
  lookup path. No cross-platform sub-question added (D18/S-010 already covers "pipedrive exact
  online" from the Exact Online side; same "no" answer, not re-logged).
- Oddities: none - both gates green on round 1, 0 fix rounds, `--dom` green first try, 0 skips on the
  lander (4 on the sheet, as expected).
- Status: [x] done

### 2026-09-03 - T03R woocommerce (retrofit to D17 template)
- Built: rewrote `koppeling-woocommerce.html` in place to the `koppeling-exact-online.html` template
  (`.hero.lp-hero` question H1, `.lp-section-heading` sub-questions, 3 `.dp-window` previews, one CTA
  in the hero, no closing-CTA section). `downloads/it-partner-woocommerce.html` untouched: D17 only
  redesigned the lander spec (SPEC section 4), the sheet spec never moved.
  No keyword numbers exist for `woocommerce` in NEEDS_SAL.md/DECISIONS.md, so the H1 uses the fallback
  pattern per SPEC section 4 "Finding the question" step 2.
- Decisions: same content, restructured, not re-derived. FAQ (4 Q&A) and JSON-LD carried over
  byte-identical. Steps stayed at 5 (unchanged from the pre-retrofit page): T03's own PROGRESS entry
  already folds `woocommerce.instructions[]` entries 3-5 into one step under the "alternative route
  folds in" rule, so no further merge was made here. Section 3 ("Welke agents...") kept T03's original
  4-card link-stack (Inbox agent, Voice agent, Orderstatus, Dashboard Webshops vergelijken) and paired
  it with a side preview (inbound call, "Bestelling gevonden") since `WooCommerceGateway` genuinely
  supports a second distinct moment beyond the hero's order-lookup card, same reasoning T02/T04 used for
  their own side previews. Section 2 ("Wat leest Mowi...") converted the 3 old plain paragraphs into 4
  icon `.lp-card`s (Bestelling opgezocht / Alleen lezend / Uw eigen sleutel / Status altijd actueel), the
  4th new, grounded in the general "single source of truth" fact already implicit in a live read-only
  koppeling, not a new claim. No cross-platform sub-question: no keyword was ever supplied for
  woocommerce, so D17 item 6 is skipped outright, not logged again (S-010's pattern already covers the
  "skip on any platform with no cross-platform keyword" case).
- Oddities: meta description was 160 chars on round 1 (need <=155); trimmed "gratis proberen" to "gratis",
  green on round 2. `--dom` green first try, 0 skips on the lander (4 on the sheet).
- Status: [x] done

### 2026-09-03 - T04R shopify (retrofit to D17 template)
- Built: rewrote `koppeling-shopify.html` in place to the `koppeling-exact-online.html` template
  (`.hero.lp-hero` question H1, `.lp-section-heading` sub-questions, 3 `.dp-window` previews, one CTA
  in the hero, no closing-CTA section). `downloads/it-partner-shopify.html` untouched: D17 only
  redesigned the lander spec (SPEC section 4), the sheet spec never moved.
  No keyword numbers exist for `shopify` in NEEDS_SAL.md/DECISIONS.md, so the H1 uses the fallback
  pattern per SPEC section 4 "Finding the question" step 2 - logged as S-012.
- Decisions: same content, restructured, not re-derived. FAQ (4 Q&A) and JSON-LD carried over
  byte-identical. Steps stayed at 3 (unchanged from the pre-retrofit page): T04's own PROGRESS entry
  already ships `shopify.instructions[]` 1:1 with nothing merged, so no further change was made here.
  Section 3 ("Welke agents...") kept T04's original 4-card link-stack (Inbox agent, Voice agent,
  Orderstatus, Dashboard Webshops vergelijken) and paired it with a side preview (inbound call,
  "Bestelling gevonden"), same reasoning T02/T03R used for their own side previews - `ShopifyGateway`
  genuinely supports a second distinct moment beyond the hero's order-lookup card. Section 2 ("Wat
  leest Mowi...") converted the 3 old plain paragraphs into 4 icon `.lp-card`s (Bestelling opgezocht /
  Alleen lezend / Uw eigen account / Ook oudere bestellingen), the 4th restating the FAQ's 60-dagen fact
  rather than adding a new claim. S-009 (docs page vs. dashboard config disagreement) carried over
  unchanged: this retrofit did not re-open that call, it only restructured the page that already made
  it. No cross-platform sub-question: no keyword was ever supplied for shopify, so D17 item 6 is
  skipped outright, not logged again.
- Oddities: none - both gates green on round 1, 0 fix rounds, `--dom` green first try, 0 skips on the
  lander (4 on the sheet, as expected).
- Status: [x] done

### 2026-09-03 - T05 lightspeed-ecom
- Built: `downloads/it-partner-lightspeed-ecom.html` (sheet, built first) and
  `koppeling-lightspeed-ecom.html` (lander, D17 template directly, no retrofit step needed), both new
  in RUN 2. Cache-bust read live from `index.html`: unchanged (`style.css?v=20260829-5`,
  `main.js?v=20260822-23`). Chrome copied from `koppeling-shopify.html`, itself byte-identical to
  `test.html`.
- Decisions: config key is `lightspeed` (webshop category, `auth => 'static'`, gateway
  `LightspeedGateway`, `doc_url` points at a docs page that does not exist per S-002 - no tier-1 source,
  matches TASKS.md header). `instructions[]` has 6 entries; folded to 5 `.lp-steps` by merging entry 5
  ("kopieer ook het API-adres... staat op dezelfde pagina") into step 4's copy action, same "same-screen
  alternative folds in" rule T03/T01R used - nothing dropped. Read `LightspeedGateway.php` directly
  (tier 2, same precedent S-008/T01R used for gateway files beyond the SPEC's named list): only `.get()`
  calls exist (findByOrderNumber/findByEmail/listRecent/testConnection), no write endpoint, so "alleen
  lezend" is grounded in Mowi's own behaviour rather than a read-only scope the client sets - the config's
  instructions never mention selecting permissions the way WooCommerce's do, so the copy deliberately
  frames read-only as what Mowi does with the key, not a right the client grants. Order lookup + tracking
  (carrier/track-and-trace) mirrors Shopify's gateway shape, so section 3 reused the Inbox/Voice/
  Orderstatus/Dashboard-Webshops-vergelijken 4-card set. FAQ's two error-code questions (401/404) are
  lifted verbatim from `testConnection()`'s own summary strings. No keyword numbers exist for
  `lightspeed-ecom`, so H1/title use the proven fallback pattern (not re-logged - S-011/S-012 already
  cover this exact gap type). No cross-platform sub-question: no keyword supplied, section skipped per D17
  item 6.
- Oddities: sheet meta description was 159 chars on round 1 (need <=155); trimmed "de Lightspeed
  eCom-kant van de Mowi-koppeling regelt" to "de Lightspeed eCom-koppeling met Mowi regelt", green on
  round 2. `--dom` green first try, 0 skips on the lander (4 on the sheet, as expected).
- Status: [x] done

### 2026-09-03 - T06 prestashop
- Built: `downloads/it-partner-prestashop.html` (sheet, built first) and `koppeling-prestashop.html`
  (lander, D17 template directly, no retrofit step needed). Cache-bust read live from `index.html`:
  unchanged (`style.css?v=20260829-5`, `main.js?v=20260822-23`). Chrome copied from
  `koppeling-lightspeed-ecom.html`, itself byte-identical to `test.html`. Noticed while re-reading the
  template that SPEC.md section 4's own "Page-scoped `<style>`" prose (only 2 rules) is stale against
  the live `koppeling-exact-online.html` reference file, which carries the full D15/D16-era block
  (section-rhythm override, `.lp-hero-logo` sizing, `.lp-link-stack`, `.split` centering) - built the
  style block from the live file per SPEC's own "when this text and the live file disagree, read the
  file" rule, not from the stale prose. Not logged as a NEEDS_SAL entry since SPEC.md is outside this
  task's allowed paths and the rule already tells the builder which one wins.
- Decisions: config key `prestashop` (webshop category, `auth => 'static'`, gateway
  `PrestaShopGateway`, `doc_url` 404s per S-002 - no tier-1 source). `instructions[]` has 6 entries;
  folded to 5 `.lp-steps` by merging entry 3 (Klik op Sleutel toevoegen) with entry 4 (naam + Rechten op
  Bekijken instellen) into one "Maak een sleutel aan" step, the same-screen key-creation fold WooCommerce
  used for its own three entries. Entry 6's "en klik op Koppelen, wij testen de verbinding" confirmation
  folded into step 5's body per the "confirmation is not its own step" rule. Read `PrestaShopGateway.php`
  directly (tier 2): it implements only `OrderGateway` (findByOrderNumber via `reference`, findByEmail via
  a customer lookup, listRecent, testConnection) - no `SalesGateway`/`OrderCountGateway`, unlike
  WooCommerce/Shopify. Checked what "Webshops vergelijken" actually needs (`WooCommerceGateway.php`'s own
  docblock: added specifically for that dashboard, requires `OrderCountGateway`/`SalesGateway`/etc.) and
  confirmed PrestaShop does not implement them, so section 3 deliberately ships **3** cards (Inbox agent,
  Voice agent, Orderstatus) with no dashboard card, unlike T03R/T04R/T05's 4-card set - flagged as S-015
  below since T05 (lightspeed-ecom) claimed the same "Dashboard Webshops vergelijken" card while
  `LightspeedGateway.php` also implements only `OrderGateway`, the same shape as PrestaShop, which reads
  as an ungrounded claim on an already-shipped page outside this task's allowed paths. Side preview kept
  (inbound call, "Bestelling gevonden") since order-lookup-by-phone is still a genuine second moment. No
  track-en-tracecode claim (unlike Lightspeed/Shopify): the gateway's own `normalize()` sets
  `track_trace_url` to `null` always (PrestaShop core has no generic tracking URL, only a carrier-specific
  raw number per its own code comment) - copy says "de vervoerder zodra die bekend is" instead. FAQ's two
  error-code questions are adapted from `testConnection()`'s own summary strings, with the em dash and
  arrow character in the source rewritten to a period/comma per the guardrail. No keyword numbers exist
  for `prestashop` (same gap class as S-011/S-012/S-013), so H1/title use the proven fallback pattern -
  logged as S-016. No cross-platform sub-question: no keyword supplied, section skipped per D17 item 6.
- Oddities: none - both gates green on round 1, 0 fix rounds, `--dom` green first try, 0 skips on the
  lander (4 on the sheet, as expected).
- Status: [x] done

### 2026-09-03 - T07 magento
- Built: `downloads/it-partner-magento.html` (sheet, built first) and `koppeling-magento.html` (lander),
  D17 template directly, no retrofit step. Cache-bust read live from `index.html`: unchanged
  (`style.css?v=20260829-5`, `main.js?v=20260822-23`). Chrome copied from `koppeling-prestashop.html`,
  itself byte-identical to `test.html`. Pakket display name is "Magento Open Source" (byte-for-byte from
  the `integration-card-name` span in `koppelingen.html`), used in full in the H1, title, breadcrumb and
  tile preview, not shortened to "Magento".
- Decisions: config key `magento` (webshop category, `auth => 'static'`, gateway `MagentoGateway`,
  `doc_url` 404s per S-002, no tier-1 docs page). `instructions[]` has 7 entries; folded to 5 `.lp-steps`
  with two merges: entries 3+4 (create the Integration + set API permissions to View for Sales, Orders)
  fold into one step, the same same-screen create+configure fold WooCommerce/PrestaShop already used;
  entries 5+6 (activate the integration + copy the four shown keys) fold into one step, grounded directly
  in the config's own wording - entry 6 says the keys are "getoonde" (shown) right after the activate-and-
  confirm action in entry 5, so both belong to the same on-screen moment, not two separate screens. Entry
  7 (paste and connect, with the automatic connection test) stays its own final step, same "confirmation
  folds into the step before it" pattern the other webshop landers used for their own last step. Read
  `MagentoGateway.php` directly (tier 2, same precedent T05/T06 used for gateway files): `class
  MagentoGateway implements OrderGateway` only, no `SalesGateway`/`OrderCountGateway`, the exact same
  shape as `PrestaShopGateway` (T06) rather than the 4-card WooCommerce/Shopify/Lightspeed pattern, so
  section 3 ships PrestaShop's **3**-card set (Inbox agent, Voice agent, Orderstatus), deliberately not
  claiming a "Dashboard Webshops vergelijken" card, avoiding the exact overclaim S-015 flagged on
  `koppeling-lightspeed-ecom.html`. No tracking/carrier claim: the gateway's own `normalize()` hardcodes
  `'carrier' => null` unconditionally (its docblock cites the same accepted gap class as PrestaShop's
  always-null `track_trace_url`), stronger than PrestaShop's case, so the copy never mentions a vervoerder
  at all, only order number, status and date. Did not add a postcode/identity-verification capability
  card even though `normalize()` returns `billing_postcode`/`shipping_postcode`: no sibling lander frames
  postcode data as an identity-check feature (grep across all built landers/docs found zero precedent), so
  inventing that framing here would have been a new, ungrounded capability narrative rather than a plain
  restatement of what's read - left out per the Gap rule instead of stretched into a card. FAQ's two
  error-code questions (401, 404) are adapted from `MagentoGateway::testConnection()`'s own summary
  strings, with the source's em dash and parenthetical arrow rewritten to plain punctuation. No
  cross-platform sub-question: no keyword supplied for `magento`, section skipped per D17 item 6. No
  keyword numbers exist for `magento` either (same gap class as S-011/S-012/S-013/S-016), so H1/title use
  the proven fallback pattern, not re-logged as a new NEEDS_SAL entry, same reasoning T06 used.
- Oddities: none - both gates green on round 1, 0 fix rounds, `--dom` green first try, 0 skips on the
  lander (4 on the sheet, as expected). Title landed at exactly 70 chars (the upper bound), confirmed
  inclusive against `verify.mjs`'s own `title.length > 70` check before shipping.
- Status: [x] done

### 2026-09-03 - T08 hubspot
- Built: `downloads/it-partner-hubspot.html` (sheet, built first) and `koppeling-hubspot.html` (lander),
  D17 template directly, no retrofit step. Cache-bust read live from `index.html`: unchanged
  (`style.css?v=20260829-5`, `main.js?v=20260822-23`). Chrome copied from `koppeling-magento.html`,
  itself byte-identical to `test.html`. Logo file confirmed on disk: `assets/logos/hubspot.png`.
- Decisions: config key `hubspot` (crm category, `auth => 'static'`, gateway `HubSpotGateway`,
  `doc_url` points at `mowi.agency/docs/koppeling-hubspot`, which 404s per S-002 - no tier-1 source).
  `instructions[]` has 6 entries; folded to 4 `.lp-steps`: step 2 merges the direct Private Apps link
  with the "liever via het menu" alternative route (same fold Pipedrive/Exact Online used for their own
  alternative-route entries); step 3 merges create-private-app + set scope + copy the shown-once token
  into one same-screen action (the same class of fold WooCommerce/Magento used for their own
  key-creation steps). Read `HubSpotGateway.php` directly (tier 2): it implements both `CrmGateway`
  (findPersonByEmail/findPersonByPhone) and `DealGateway` (pipeline/win-rate aggregates), the same shape
  as Pipedrive. NEEDS_SAL S-008 already flags HubSpot's `CrmGateway` contact-lookup half as
  live-verified against a real sandbox while its `DealGateway` aggregate methods are explicitly
  un-verified (class docblock: "NOT live-verified against a real portal"), so section 3 ships
  Pipedrive's own 3-card set (Inbox agent, Voice agent, CRM-synchronisatie) with no dashboard card,
  same reasoning T01R used for Pipedrive's own DealGateway. "Open deals in beeld" IS claimed in section
  2, grounded in `buildPersonShape()`'s `open_deals` field, which is called from `findPerson()` and is
  therefore part of the verified contact-lookup path, not the separate unverified aggregate methods -
  same distinction T01R drew for Pipedrive. Added one claim with no direct sibling precedent: "Notities
  uit HubSpot ziet de agent nooit," grounded in the exact `properties` array `findPerson()` requests
  (no note-related property is ever fetched), flagged in REVIEW.md for Sal to confirm the wording reads
  as accurate. FAQ's "kan een collega het token aanmaken?" answers "ja" for the opposite reason
  Pipedrive's does: a HubSpot private-app token belongs to the app/portal, not a personal account
  (Pipedrive's IS personal) - a genuine platform difference, not an inconsistency. No cross-platform
  sub-question: no keyword supplied for `hubspot`, section skipped per D17 item 6. No keyword numbers
  exist for `hubspot` either (same gap class as S-011/S-012/S-013/S-016), so H1/title use the proven
  fallback pattern, not re-logged as a new NEEDS_SAL entry.
- Oddities: none - both gates green on round 1, 0 fix rounds, `--dom` green first try, 0 skips on the
  lander (4 on the sheet, as expected).
- Status: [x] done
