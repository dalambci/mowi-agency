# REVIEW

Sal's review queue. `verify.mjs` proves the **structure** is right - correct chrome, one CTA in
`<main>`, canonical form, title and meta lengths, no em dash in visible prose. It cannot prove a page
*looks* right or *reads* right. That is what this file is for.

The loop appends one entry per built page in Step 6 and never ticks the boxes itself. Sal ticks them.

**How to open any page locally:** run `start-local-server.bat` in the repo root, then visit the URL in
each entry. The server serves extensionless URLs the same way production does, so review the
extensionless form, not the `.html` file.

## Per-page entry format

```
### <task-id> <slug>
- Path: `koppeling-<slug>.html` (+ `downloads/it-partner-<slug>.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-<slug>
- [ ] Spacing matches the blog / koppelingen canon (section rhythm, heading margins, card gutters -
      open koppelingen.html in a second tab and flip between them)
- [ ] Exactly one CTA visible in the page body, and it is obvious - "Start gratis", pointing at
      my.mowi.agency/aanmelden. Header and footer CTAs do not count.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- Open questions: <pulled from NEEDS_SAL.md for this task, or "none">
```

`verify.mjs` is also explicitly blind to some things worth a human eye: the `<h1>` wording, the 7-section
order and their heading classes, which page the parent breadcrumb crumb points at, whether a sheet wrongly
pulled in `css/style.css`, and whether any FAQ answer claims more than live copy supports.

---

## Queue

### T01R pipedrive (retrofit naar D17-sjabloon)
- Path: `koppeling-pipedrive.html` (+ `downloads/it-partner-pipedrive.html`, unchanged - D17 only
  redesigned the lander spec, the sheet spec/content did not move)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-pipedrive
- [ ] Hero now matches `koppeling-exact-online.html`'s shape: `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in Pipedrive?"), a direct-answer
      `.hero-sub`, the one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview (inbound e-mail,
      "Klant herkend"). Confirm it reads like T02, not like the old label-heading version.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] "Zo koppelt u" is now **4** `.lp-steps` (was 5 pre-retrofit): entries 2+3 of
      `pipedrive.instructions[]` (direct link vs. via-menu route to the same API-settings screen) were
      folded into one step's body, same "alternative route is not its own step" rule Exact Online used to
      go 3→2. Nothing dropped. A `.dp-window-tile` connect tile sits under the steps.
- [ ] "Welke agents gebruiken de Pipedrive-koppeling?" is now a `.split`: `.lp-link-stack` of 3
      `<a class="lp-card">` (Inbox agent, Voice agent, CRM-synchronisatie) beside a `.dp-window-side`
      preview (inbound call, "Klant herkend"). No dashboard card here - unlike Exact Online/WooCommerce,
      Pipedrive's deal/pipeline reporting methods are the ones flagged un-verified in S-008-style reads
      of `PipedriveGateway.php` (only the contact-lookup half was live-verified), and no nav dashboard
      fragment matches "sales pipeline" today, so none was claimed.
- [ ] "Wat leest Mowi uit Pipedrive?" is now 4 icon `.lp-card`s (Klant herkend / Open deals in beeld /
      Alleen lezend / Uw eigen API-token) instead of the old 3 plain paragraphs. "Open deals in beeld" is
      grounded in `PipedriveGateway::buildPersonShape()`'s `open_deals` (title + stage), part of the
      live-verified contact-lookup path, not the separate unverified DealGateway aggregate methods.
- [ ] "Wat heeft uw IT-partner nodig?" is now an `.lp-trust-note` box, not a bare paragraph.
- [ ] FAQ content is byte-identical to the pre-retrofit page (4 Q&A, same JSON-LD) - only the section
      wrapper changed from `.page-heading`/`.page-body` to `.lp-section-heading`/`.lp-card-grid`.
- [ ] No standalone closing-CTA section anymore (D17): the footer's own "Vertel het en Mowi regelt het"
      band is now the only CTA below the FAQ. Confirm that doesn't read as the page ending abruptly.
- [ ] Open `downloads/it-partner-pipedrive.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, and it must NOT pull in `css/style.css` (it carries its own `<style>`). Untouched by
      this retrofit.
- Open questions: S-006 (agent cards link to `/e-mail-agent` + `/call-agent`, not the spec's
  `/workflows#email-agent`; `/workflows#crm-sync` still lands on an empty page) and S-007 (no named
  secure channel for handing over the API-token, sheet uses the fallback line). No cross-platform
  sub-question added: "pipedrive exact online" is already logged as S-010/D18 (cut, not content) on
  the Exact Online side, and applies here the same way - skipped, not re-logged.

### T03R woocommerce (retrofit naar D17-sjabloon)
- Path: `koppeling-woocommerce.html` (+ `downloads/it-partner-woocommerce.html`, unchanged - D17 only
  redesigned the lander spec, the sheet spec/content did not move)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-woocommerce
- [ ] Hero now matches `koppeling-exact-online.html`'s shape: `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in WooCommerce?"), a
      direct-answer `.hero-sub`, the one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview
      (order lookup, "In behandeling"). Confirm it reads like T02/T01R, not like the old label-heading
      version.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] "Hoe koppelt u WooCommerce aan Mowi?" stayed at **5** `.lp-steps`, unchanged from the pre-retrofit
      page - T03's own build already folded the sleutel-aanmaken sub-steps into one step, so no further
      merge happened this pass. A `.dp-window-tile` connect tile sits under the steps.
- [ ] "Welke agents gebruiken de WooCommerce-koppeling?" is now a `.split`: `.lp-link-stack` of 4
      `<a class="lp-card">` (Inbox agent, Voice agent, Orderstatus, Dashboard Webshops vergelijken)
      beside a new `.dp-window-side` preview (inbound call, "Bestelling gevonden"). Confirm 4 cards in a
      `.split` layout reads right, not cramped, next to Exact Online's 3-card version.
- [ ] "Wat leest Mowi uit WooCommerce?" is now 4 icon `.lp-card`s (Bestelling opgezocht / Alleen lezend /
      Uw eigen sleutel / Status altijd actueel) instead of the old 3 plain paragraphs. The 4th card
      ("Status altijd actueel") is new copy this retrofit added - confirm it doesn't overstate anything
      the koppeling does not do.
- [ ] "Wat heeft uw IT-partner of accountant nodig?" is now an `.lp-trust-note` box, not a bare paragraph.
- [ ] FAQ content is byte-identical to the pre-retrofit page (4 Q&A, same JSON-LD) - only the section
      wrapper changed from `.page-heading`/`.page-body` to `.lp-section-heading`/`.lp-card-grid`.
- [ ] No standalone closing-CTA section anymore (D17): the footer's own "Vertel het en Mowi regelt het"
      band is now the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-woocommerce.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, and it must NOT pull in `css/style.css` (it carries its own `<style>`). Untouched by
      this retrofit.
- Open questions: S-006 (agent cards link to `/e-mail-agent` + `/call-agent`, not the spec's
  `/workflows#email-agent`; `/workflows#order-status` and the dashboard fragment still land on an empty
  page) and S-007 (no named secure channel for the key and secret, sheet uses the fallback line). No
  woocommerce-specific keyword numbers exist yet, so the H1/title use the fallback pattern rather than a
  Sal-supplied search term - worth a `missing fact` follow-up if real numbers ever surface for this
  platform.

### T04R shopify (retrofit naar D17-sjabloon)
- Path: `koppeling-shopify.html` (+ `downloads/it-partner-shopify.html`, unchanged - D17 only
  redesigned the lander spec, the sheet spec/content did not move)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-shopify
- [ ] Hero now matches `koppeling-exact-online.html`'s shape: `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in Shopify?"), a direct-answer
      `.hero-sub`, the one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview (order lookup,
      "Verzonden"). Confirm it reads like T02/T01R/T03R, not like the old label-heading version.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] "Hoe koppelt u Shopify aan Mowi?" stayed at **3** `.lp-steps`, unchanged from the pre-retrofit
      page - 1:1 with `shopify.instructions[]` (adres invullen, Koppel met Shopify, toegang bevestigen),
      nothing merged, nothing added. A `.dp-window-tile` connect tile sits under the steps.
- [ ] "Welke agents gebruiken de Shopify-koppeling?" is now a `.split`: `.lp-link-stack` of 4
      `<a class="lp-card">` (Inbox agent, Voice agent, Orderstatus, Dashboard Webshops vergelijken)
      beside a new `.dp-window-side` preview (inbound call, "Bestelling gevonden"). Same 4-card set the
      pre-retrofit page already used.
- [ ] "Wat leest Mowi uit Shopify?" is now 4 icon `.lp-card`s (Bestelling opgezocht / Alleen lezend /
      Uw eigen account / Ook oudere bestellingen) instead of the old 3 plain paragraphs. The 4th card
      restates the FAQ's 60-dagen fact as a short claim - confirm it doesn't overstate anything.
- [ ] "Wat heeft uw IT-partner of accountant nodig?" is now an `.lp-trust-note` box, not a bare paragraph.
- [ ] FAQ content is byte-identical to the pre-retrofit page (4 Q&A, same JSON-LD) - only the section
      wrapper changed from `.page-heading`/`.page-body` to `.lp-section-heading`/`.lp-card-grid`.
- [ ] No standalone closing-CTA section anymore (D17): the footer's own "Vertel het en Mowi regelt het"
      band is now the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-shopify.html` and print-preview it (Ctrl+P): one A4, nothing clipped,
      and it must NOT pull in `css/style.css` (it carries its own `<style>`). Untouched by this retrofit.
- Open questions: S-006 (agent cards link to `/e-mail-agent` + `/call-agent`; `/workflows#order-status`
  and the dashboard fragment still land on an empty page), S-009 (the live docs page still describes the
  retired concierge flow; this retrofit kept T04's original decision to follow the dashboard config's
  self-serve OAuth flow instead, unchanged) and S-012 (no shopify-specific keyword numbers exist yet, so
  the H1/title use the fallback pattern rather than a Sal-supplied search term).

### T02 exact-online
- Path: `koppeling-exact-online.html` (+ `downloads/it-partner-exact-online.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-exact-online
- [ ] Spacing matches the blog / koppelingen canon (section rhythm, heading margins, card gutters -
      open koppelingen.html in a second tab and flip between them)
- [ ] Exactly one CTA visible in the page body, and it is obvious - "Start gratis", pointing at
      my.mowi.agency/aanmelden. Header and footer CTAs do not count.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] `.lp-steps` renders acceptably with only 3 steps (Pipedrive had 5) - check it does not look
      sparse or unevenly spaced compared to the 5-step version.
- [ ] The three cards under "Werkt met deze agents en workflows" are `<a class="lp-card">`. This
      lander picks Inbox agent, Voice agent and the "Openstaande facturen" dashboard fragment
      (`/workflows#dashboard-openstaande-facturen`) instead of Pipedrive's CRM-sync card - grounded
      in `ExactOnlineGateway` implementing both `CrmGateway` (findPersonByEmail/Phone) and
      `InvoiceGateway` (open/overdue invoices), read-only against `config/shop_platforms.php`.
  Confirm that reading is right, not just Pipedrive's pattern copy-pasted.
- [ ] This is the oauth/`fields => []` case: no credential field anywhere, "Zo koppelt u" has only 3
      steps (1:1 with `exact_online.instructions[]`), and both the lander's "Voor uw IT-partner"
      paragraph and the whole sheet say plainly that nothing is created or shared, only a login with
      the right account/administration. Confirm this reads right and not like a missing section.
- [ ] The NL-only caveat ("alleen het Nederlandse Exact Online") is grounded only in a dashboard
      code comment (`ExactOnlineGateway.php`, tier 2), not in any customer-facing UI copy. Confirm
      it is true today before this ships, since it is not currently stated anywhere the client sees.
- [ ] Open `downloads/it-partner-exact-online.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, and it must NOT pull in `css/style.css` (it carries its own `<style>`). Shorter than
      Pipedrive's sheet on purpose (no token to create or return).
- Open questions: S-006 (same agent-card link reading as T01, applied here too) and the NL-only
  caveat above (no NEEDS_SAL entry filed since the dashboard source is tier-2-authoritative for
  connect-flow facts per SPEC section 9, but it has no live-copy precedent to double-check against).

### T03 woocommerce
- Path: `koppeling-woocommerce.html` (+ `downloads/it-partner-woocommerce.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-woocommerce
- [ ] Spacing matches the blog / koppelingen canon (section rhythm, heading margins, card gutters -
      open koppelingen.html in a second tab and flip between them)
- [ ] Exactly one CTA visible in the page body, and it is obvious - "Start gratis", pointing at
      my.mowi.agency/aanmelden. Header and footer CTAs do not count.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] "Zo koppelt u" has 5 steps from a 7-entry `instructions[]`. Step 3 ("Maak een sleutel aan")
      folds three config entries into one action, the same grouping the live docs page uses. Check
      the step-3 body does not read as too long next to the one-liners around it.
- [ ] Four cards under "Werkt met deze agents en workflows" (2x2 on desktop), one more than T01/T02:
      Inbox agent, Voice agent, Orderstatus (`/workflows#order-status`) and Webshops vergelijken
      (`/workflows#dashboard-webshops-vergelijken`). The dashboard card is grounded in
      `WooCommerceGateway` implementing the sales/order-count gateways (its docblock names that exact
      dashboard on a real client store), not in customer-facing copy. Confirm the reading, and whether
      four cards is the right count or three reads tighter.
- [ ] The preview chip reads "In behandeling", a real WooCommerce status label from the gateway.
      The head line "Waar blijft mijn bestelling?" is the docs page's own example question. Confirm
      both read as illustrative, not as a claim.
- [ ] Open `downloads/it-partner-woocommerce.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, and it must NOT pull in `css/style.css` (it carries its own `<style>`). Slightly longer
      than Pipedrive's sheet: three values to return (adres, key, secret) plus the /wp-json/ note.
- Open questions: S-006 (agent cards link to `/e-mail-agent` + `/call-agent`; `/workflows#order-status`
  and the dashboard fragment still land on an empty page) and S-007 (no named secure channel for the
  key and secret, sheet uses the fallback line). No new entries filed.

### T04 shopify
- Path: `koppeling-shopify.html` (+ `downloads/it-partner-shopify.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-shopify
- [ ] Spacing matches the blog / koppelingen canon (section rhythm, heading margins, card gutters -
      open koppelingen.html in a second tab and flip between them)
- [ ] Exactly one CTA visible in the page body, and it is obvious - "Start gratis", pointing at
      my.mowi.agency/aanmelden. Header and footer CTAs do not count.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] This is the oauth case with a shop-domain field: "Zo koppelt u" has 3 steps, 1:1 with
      `shopify.instructions[]` (adres invullen, Koppel met Shopify, toegang bevestigen). No token,
      no key anywhere on either page. Confirm the 3-step block does not look sparse next to T03's 5.
- [ ] **The live docs page says the opposite** (S-009): `docs/koppeling-shopify.html` still tells the
      client to ask Support for an approval link. The lander follows the dashboard config's self-serve
      OAuth button instead. Confirm the config is what production actually shows today (a real
      "Koppel met Shopify" button with a Shopify-adres field), since a visitor who reads both will see
      two different stories until the docs page is rewritten.
- [ ] Four cards under "Werkt met deze agents en workflows", the same set as T03 (Inbox agent, Voice
      agent, Orderstatus, Webshops vergelijken): `ShopifyGateway` implements the same order + sales
      gateways WooCommerce does, live-verified on a real store per its docblock. Confirm the reading.
- [ ] Preview chip reads "Verzonden" (a real Shopify fulfilment label from the gateway's
      STATUS_LABELS); head line is the docs page's "Waar blijft mijn bestelling?". The body copy
      mentions the track-en-trace link (gateway fetches `fulfillments.trackingInfo`). Confirm all three
      read as illustrative, not as a claim.
- [ ] Not stated on either page: the gateway's docblock says Shopify blocks e-mail and address fields
      on free *development* stores regardless of scope, so lookup-by-e-mail needs a paid-plan store.
      Real merchants are on paid plans, so it was left off. Say the word if it should be a FAQ line.
- [ ] Open `downloads/it-partner-shopify.html` and print-preview it (Ctrl+P): one A4, nothing clipped,
      and it must NOT pull in `css/style.css` (it carries its own `<style>`). Short like T02's sheet:
      nothing to create or return, only an owner/admin login and a confirmation.
- Open questions: S-006 (same agent-card link reading as T01-T03) and S-009 (docs page describes the
  retired concierge flow; the lander follows the dashboard's self-serve OAuth flow).

### T05 lightspeed-ecom
- Path: `koppeling-lightspeed-ecom.html` (+ `downloads/it-partner-lightspeed-ecom.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-lightspeed-ecom
- [ ] Built straight to the D17 template (no retrofit step): `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in Lightspeed eCom?"), a
      direct-answer `.hero-sub`, one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview
      (order lookup, "Verzonden"). Confirm it reads like T02/T01R/T03R/T04R.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size.
- [ ] "Hoe koppelt u Lightspeed eCom aan Mowi?" is 5 steps from a 6-entry `instructions[]`. Step 4
      merges copying the API-adres into the API Key/Secret copy step (same page, per the config's own
      "dit staat op dezelfde pagina" note). A `.dp-window-tile` connect tile sits under the steps.
- [ ] "Welke agents gebruiken de Lightspeed eCom-koppeling?" is a `.split`: 4 `.lp-card`s (Inbox agent,
      Voice agent, Orderstatus, Dashboard Webshops vergelijken) beside a `.dp-window-side` preview
      (inbound call, "Bestelling gevonden") - same 4-card set T03R/T04R use, grounded in
      `LightspeedGateway` implementing the same order-lookup shape (findByOrderNumber/findByEmail).
- [ ] "Wat leest Mowi uit Lightspeed eCom?" is 4 icon `.lp-card`s. Note the "Alleen lezend" and "Uw
      eigen sleutel" cards deliberately do NOT claim the API key itself is scoped to read-only by the
      client (unlike the WooCommerce/Magento/PrestaShop copy) - `lightspeed.instructions[]` never asks
      the client to pick a permission level, so the read-only guarantee is framed as what Mowi's gateway
      does with the key, not a right the client grants at creation. Confirm this reading is right before
      publishing, since it is a real difference from the sibling webshop landers.
- [ ] FAQ's two error-code questions (401 sleutel geweigerd, 404 geen omgeving gevonden) are lifted
      verbatim from `LightspeedGateway::testConnection()`'s own summary strings - confirm they still
      match if that method ever changes.
- [ ] "Wat heeft uw IT-partner of accountant nodig?" is an `.lp-trust-note` box linking the sheet.
- [ ] No standalone closing-CTA section (D17): the footer's own "Vertel het en Mowi regelt het" band is
      the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-lightspeed-ecom.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, must NOT pull in `css/style.css` (own `<style>` block). Three values to return (API-adres,
      API Key, API Secret), same shape as the WooCommerce sheet.
- Open questions: no docs page exists for this platform (`doc_url` in the config 404s, per S-002), so
  every claim traces to `config/shop_platforms.php` + `LightspeedGateway.php` only, no tier-1 source to
  cross-check against - a new, not-yet-logged instance of the same gap the TASKS.md header already flags
  for 7 of the 11 platforms. No keyword numbers exist for `lightspeed-ecom` (same class of gap as
  S-011/S-012), so H1/title use the fallback pattern.

### T06 prestashop
- Path: `koppeling-prestashop.html` (+ `downloads/it-partner-prestashop.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-prestashop
- [ ] Built straight to the D17 template (no retrofit step): `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in PrestaShop?"), a
      direct-answer `.hero-sub`, one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview
      (order lookup, "Verzonden"). Confirm it reads like the other webshop landers.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size.
- [ ] "Hoe koppelt u PrestaShop aan Mowi?" is 5 steps from a 6-entry `instructions[]`. Step 3 merges
      "Klik op Sleutel toevoegen" with the naam+Rechten-instellen entry into one "Maak een sleutel aan"
      step, the same fold WooCommerce's own step 3 uses. A `.dp-window-tile` connect tile sits under
      the steps.
- [ ] "Welke agents gebruiken de PrestaShop-koppeling?" is a `.split`: **3** `.lp-card`s (Inbox agent,
      Voice agent, Orderstatus), not the 4-card set the other webshop landers use - deliberate,
      because `PrestaShopGateway.php` implements only `OrderGateway`, not the `SalesGateway`/
      `OrderCountGateway` pair the "Webshops vergelijken" dashboard actually needs (confirmed by
      reading `WooCommerceGateway.php`'s own docblock on why it added those interfaces). See S-015:
      this same check suggests `koppeling-lightspeed-ecom.html`'s 4th card may be an overclaim, since
      `LightspeedGateway` has the same OrderGateway-only shape - flagged there, not fixed here (outside
      this task's allowed paths). Side preview (inbound call, "Bestelling gevonden") kept alongside the
      3 cards, same as Exact Online's 3-card layout.
- [ ] "Wat leest Mowi uit PrestaShop?" is 4 icon `.lp-card`s (Bestelling opgezocht / Alleen lezend / Uw
      eigen sleutel / Status altijd actueel). No track-en-tracecode claim (unlike Lightspeed/Shopify):
      `PrestaShopGateway::normalize()` always sets `track_trace_url` to null (PrestaShop core has no
      generic tracking URL), so the copy says "de vervoerder zodra die bekend is" instead. Confirm this
      reads right next to the sibling webshop landers' stronger tracking claim.
- [ ] FAQ's two error-code questions (401 sleutel geweigerd, 404 webservice niet gevonden) are adapted
      from `PrestaShopGateway::testConnection()`'s own summary strings, with the source's em dash and
      arrow rewritten to plain punctuation. Confirm they still match if that method ever changes.
- [ ] "Wat heeft uw IT-partner of accountant nodig?" is an `.lp-trust-note` box linking the sheet.
- [ ] No standalone closing-CTA section (D17): the footer's own "Vertel het en Mowi regelt het" band is
      the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-prestashop.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, must NOT pull in `css/style.css` (own `<style>` block). Notes PrestaShop's own
      no-separate-password webservice-auth quirk (the key is used as the username, no password field)
      since it's a genuine detail an IT-partner would otherwise expect to fill in.
- Open questions: no docs page exists for this platform (`doc_url` 404s, per S-002), so every claim
  traces to `config/shop_platforms.php` + `PrestaShopGateway.php` only. No keyword numbers exist for
  `prestashop` (same gap class as S-011/S-012/S-013/S-016), so H1/title use the fallback pattern. S-015
  flags a possible overclaim on the already-shipped `koppeling-lightspeed-ecom.html`, found while
  grounding this page - not fixed here, outside this task's allowed paths.

### T07 magento
- Path: `koppeling-magento.html` (+ `downloads/it-partner-magento.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-magento
- [ ] Built straight to the D17 template (no retrofit step): `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in Magento Open Source?"), a
      direct-answer `.hero-sub`, one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview
      (order lookup, "In behandeling"). Confirm it reads like the other webshop landers, and that the
      full "Magento Open Source" name (not just "Magento") doesn't crowd the `.h-nowrap` wrap on the H1.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size.
- [ ] "Hoe koppelt u Magento Open Source aan Mowi?" is 5 steps from a 7-entry `instructions[]`, the
      most raw entries folded of any lander so far. Step 3 merges creating the Integration with setting
      its API permissions; step 4 merges activating it with copying the four shown keys (Consumer Key,
      Consumer Secret, Access Token, Access Token Secret). Confirm step 4's body doesn't read as doing
      two things at once next to the one-liners around it.
- [ ] "Welke agents gebruiken de Magento Open Source-koppeling?" is a `.split`: **3** `.lp-card`s (Inbox
      agent, Voice agent, Orderstatus), the PrestaShop pattern, not the 4-card WooCommerce/Shopify set -
      `MagentoGateway.php` implements only `OrderGateway`, same shape as PrestaShop, so no "Webshops
      vergelijken" dashboard card is claimed. Confirm this reading against S-015's flag on
      `koppeling-lightspeed-ecom.html`, which may have overclaimed the same card on the same gateway
      shape.
- [ ] "Wat leest Mowi uit Magento Open Source?" is 4 icon `.lp-card`s (Bestelling opgezocht / Alleen
      lezend / Eigen Integration-sleutels / Status altijd actueel). No vervoerder/tracking claim at all
      (stronger omission than PrestaShop's "zodra die bekend is" hedge): `MagentoGateway::normalize()`
      hardcodes `carrier` to null unconditionally. Confirm this reads right, not as a missing feature.
- [ ] FAQ's two error-code questions (401, 404) are adapted from `MagentoGateway::testConnection()`'s
      own summary strings. Confirm they still match if that method ever changes.
- [ ] "Wat heeft uw IT-partner of accountant nodig?" is an `.lp-trust-note` box linking the sheet -
      frames it as four sleutels uit een eigen Integration, not one key like the sibling webshop sheets.
- [ ] No standalone closing-CTA section (D17): the footer's own "Vertel het en Mowi regelt het" band is
      the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-magento.html` and print-preview it (Ctrl+P): one A4, nothing clipped,
      must NOT pull in `css/style.css` (own `<style>` block). Describes four sleutels instead of one,
      the OAuth 1.0a Integration shape, not a single API key/secret pair like WooCommerce/PrestaShop.
- Open questions: no docs page exists for this platform (`doc_url` 404s, per S-002), so every claim
  traces to `config/shop_platforms.php` + `MagentoGateway.php` only. No keyword numbers exist for
  `magento` (same gap class as S-011/S-012/S-013/S-016), so H1/title use the fallback pattern. Not
  claimed: a postcode-based identity-check capability, even though the gateway returns
  `billing_postcode`/`shipping_postcode` - no sibling lander frames postcode data that way, so it was
  left out rather than introduced as a new, ungrounded claim type. Worth a word from Sal if that's a
  real feature worth adding across all the order-lookup landers at once.

### T08 hubspot
- Path: `koppeling-hubspot.html` (+ `downloads/it-partner-hubspot.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-hubspot
- [ ] Built straight to the D17 template (no retrofit step): `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in HubSpot?"), a
      direct-answer `.hero-sub`, one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview
      (inbound e-mail, "Klant herkend"). Confirm it reads like `koppeling-pipedrive.html`, the closest
      sibling (same CRM shape, same access-token auth).
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size.
- [ ] "Hoe koppelt u HubSpot aan Mowi?" is 4 steps from a 6-entry `instructions[]`. Step 2 folds the
      direct Private Apps link and the "via het menu" alternative route into one step's body (same
      "alternative route is not its own step" rule Pipedrive/Exact Online used). Step 3 folds creating
      the private app + setting its scope + copying the shown-once token into one step (a same-screen
      create-and-copy action, same fold class WooCommerce/Magento used for their own key-creation step).
      Confirm step 3's body doesn't read as doing too much at once next to the one-liners around it.
- [ ] "Welke agents gebruiken de HubSpot-koppeling?" is a `.split`: 3 `.lp-card`s (Inbox agent, Voice
      agent, CRM-synchronisatie), the Pipedrive pattern, not a dashboard card - `HubSpotGateway.php`
      implements `DealGateway` (pipeline/win-rate aggregates), but per NEEDS_SAL S-008 those methods are
      explicitly un-verified against a real portal, so only the live-verified `CrmGateway` contact-lookup
      half (which the hero/side previews already draw from) is claimed. Confirm this reading is right.
- [ ] "Wat leest Mowi uit HubSpot?" is 4 icon `.lp-card`s (Klant herkend / Open deals in beeld / Alleen
      lezend / Uw eigen access-token). "Open deals in beeld" is grounded in
      `HubSpotGateway::buildPersonShape()`'s `open_deals` field (title + stage from the associations +
      batch/read calls), part of the same contact-lookup path as the recognized-caller claim, not the
      separate unverified DealGateway aggregate methods.
- [ ] Hero/FAQ claim "Notities uit HubSpot ziet de agent nooit": grounded in the `properties` list
      `findPerson()` actually requests (firstname/lastname/email/phone/mobilephone/company/
      lifecyclestage/createdate/lastmodifieddate) - no note-related property is ever fetched. Confirm
      this reads as accurate, not as a stronger privacy claim than intended.
- [ ] FAQ's "access-token werd geweigerd" answer is adapted from `HubSpotGateway::testConnection()`'s
      own 401 summary string, with the source's em dash rewritten to a period. The 4th FAQ ("kan een
      collega het token aanmaken?") answers "ja" because a HubSpot private-app token belongs to the app/
      portal, not a personal account - the opposite answer from Pipedrive's own FAQ (whose token IS
      personal). Confirm this distinction is correct before publishing.
- [ ] "Wat heeft uw IT-partner nodig?" is an `.lp-trust-note` box linking the sheet.
- [ ] No standalone closing-CTA section (D17): the footer's own "Vertel het en Mowi regelt het" band is
      the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-hubspot.html` and print-preview it (Ctrl+P): one A4, nothing clipped,
      must NOT pull in `css/style.css` (own `<style>` block). Same shape as the Pipedrive sheet (one
      token to create and return), but frames the scope as `crm.objects.contacts.read` on a private app
      rather than a personal API token.
- Open questions: no docs page exists for this platform (`doc_url` in the config points at
  `mowi.agency/docs/koppeling-hubspot`, which 404s per S-002), so every claim traces to
  `config/shop_platforms.php` + `HubSpotGateway.php` only. No keyword numbers exist for `hubspot` (same
  gap class as S-011/S-012/S-013/S-016), so H1/title use the fallback pattern - not re-logged as a new
  NEEDS_SAL entry, same reasoning prior webshop tasks used. No cross-platform sub-question: no keyword
  supplied for hubspot, section skipped per D17 item 6.

### T09 moneybird
- Path: `koppeling-moneybird.html` (+ `downloads/it-partner-moneybird.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-moneybird
- [ ] Built straight to the D17 template (no retrofit step): `.hero.lp-hero` with the logo above an
      `<h1 class="h-balance">` question ("Wat kunt u met AI automatiseren in Moneybird?"), a
      direct-answer `.hero-sub`, one `.lp-cta-block` CTA, and a full-width `.dp-window-hero` preview
      (inbound e-mail, "Klant herkend"). Confirm it reads like `koppeling-pipedrive.html`/
      `koppeling-hubspot.html`, the closest siblings (same CRM shape, same access-token auth).
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size.
- [ ] "Welke agents gebruiken de Moneybird-koppeling?" is a `.split`: 3 `.lp-card`s (Inbox agent, Voice
      agent, Openstaande facturen) beside a `.dp-window-side` preview (masked debtor name, "Te laat"
      chip) - deliberately **not** Pipedrive/HubSpot's CRM-sync card. `MoneybirdGateway.php` implements
      both a `CrmGateway` (contact lookup) and an `InvoiceGateway` (open/overdue invoices, aging
      buckets), the same shape as `ExactOnlineGateway` (T02), so this page follows Exact Online's
      dashboard-card pattern instead of Pipedrive's. Confirm this reading is right, and that the invoice
      preview doesn't read as a duplicate of the hero's contact-recognition preview.
- [ ] "Wat leest Mowi uit Moneybird?" is 4 icon `.lp-card`s (Klant herkend / Openstaande facturen in
      beeld / Alleen lezend / Uw eigen API-token). "Klant herkend" deliberately does NOT claim open
      deals or last-contact-date (unlike Pipedrive/HubSpot's "Open deals in beeld" card):
      `MoneybirdGateway::buildPersonShape()` hardcodes both fields empty, and the class's own docblock
      says plainly "Moneybird is bookkeeping software, not a sales-pipeline CRM, so those two fields ...
      are always empty/null here, not a bug." Confirm the FAQ entry below reads as an honest
      clarification, not as a weakness.
- [ ] FAQ has a Moneybird-only 2nd question with no sibling precedent: "Ziet Mowi ook offertes of deals
      in Moneybird?" -> "Nee. Moneybird is boekhoudsoftware, geen verkoop-CRM. ..." - grounded in the
      same gateway docblock sentence above. Confirm this reads as useful honesty, not as a page arguing
      against itself.
- [ ] "Hoe koppelt u Moneybird aan Mowi?" is 4 steps from a 5-entry `instructions[]`. Step 3 merges
      clicking "Nieuwe token", naming it and copying the shown-once token into one same-screen action
      (the same fold class WooCommerce/Magento/HubSpot used); step 2 (navigate to settings) stayed its
      own step since, unlike Pipedrive/HubSpot's config, Moneybird's own `instructions[]` never offered
      an alternative menu route to fold it against. A `.dp-window-tile` connect tile sits under the
      steps.
- [ ] "Wat heeft uw IT-partner of accountant nodig?" is an `.lp-trust-note` box linking the sheet.
- [ ] No standalone closing-CTA section (D17): the footer's own "Vertel het en Mowi regelt het" band is
      the only CTA below the FAQ.
- [ ] Open `downloads/it-partner-moneybird.html` and print-preview it (Ctrl+P): one A4, nothing clipped,
      must NOT pull in `css/style.css` (own `<style>` block). Same shape as the Pipedrive sheet (one
      personal API-token to create and return), plus one caveat with no sibling sheet precedent: the
      gateway always reads the FIRST Moneybird administration returned by the account's token, so a
      client with several administrations needs to say so - grounded in `MoneybirdGateway.php`'s own
      docblock (tier 2). Confirm this reads as useful, not as unnecessary complexity.
- Open questions: no docs page exists for this platform, so every claim traces to
  `config/shop_platforms.php` + `MoneybirdGateway.php` only. S-008 already names this gateway's "NOT
  live-verified against a real Moneybird tenant" gap explicitly ("RUN 2's moneybird") - not re-logged.
  No keyword numbers exist for `moneybird` (same gap class as S-011/S-012/S-013/S-016), so H1/title use
  the fallback pattern - not re-logged, same reasoning T06-T08 used. No cross-platform sub-question: no
  keyword supplied for moneybird, section skipped per D17 item 6.
