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
