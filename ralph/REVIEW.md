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
