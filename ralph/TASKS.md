# Site batch tasks v2 - D1 drop agents / D2 all 11 live / D3 flat root / D4 Start gratis
#
# Every task's allowed paths implicitly include ralph/*
#
# SYNTAX. An open task is "- [ ] T0N - ...". A done task is "- [x] T0N - ...".
# A BLOCKED task is written "- [blocked] T0N - ..." - the checkbox is REPLACED,
# not annotated, and never "- [ ] T0N [blocked]". A stalled sweep writes
# "- [blocked] (stalled) T0N - ...". Step 2's picker and the Finishing predicate
# both key on this exact form, so a second spelling silently re-picks tasks or
# stops the run from ever finishing.
#
# Only 4 of the 11 integrations have a live docs page to ground the copy in:
#   pipedrive     -> docs/koppeling-pipedrive.html
#   shopify       -> docs/koppeling-shopify.html
#   woocommerce   -> docs/koppeling-woocommerce.html
#   google-agenda -> docs/koppeling-google-agenda.html
# The other 7 (exact-online, lightspeed-ecom, prestashop, magento, hubspot,
# moneybird, calendly) have NO docs page. They get conservative copy from their
# koppelingen.html card description + the generic connect story. More NEEDS_SAL
# entries there is correct behaviour, not failure.

== RUN 1 ==
# Pipedrive first, deliberately (D11): it is the one integration grounded end to
# end (docs page + 5-entry instructions[] + a real "Voor uw IT-partner" block),
# so it proves the pipeline before the hard case. Exact Online is the hard case:
# no docs page, and an oauth platform with fields => [] where the IT-partner
# sheet has almost nothing to ask for. See SPEC section 5, "First check whether
# there is anything to ask for at all".
- [x] T01 - integratie: pipedrive (lander + sheet) - allowed: koppeling-pipedrive.html, downloads/it-partner-pipedrive.html
- [x] T02 - integratie: exact-online (lander + sheet) - allowed: koppeling-exact-online.html, downloads/it-partner-exact-online.html

== RUN 2 ==
# D17 (2026-09-02, ralph/DECISIONS.md): koppeling-exact-online.html was rebuilt
# completely as the new template - question-first H1, keyword-grounded title,
# the site's own .hero/.lp-* landing-page kit, 3 dashboard-style previews, one
# CTA in the hero, no standalone closing-CTA section. Read ralph/SPEC.md
# section 4 in full before touching ANY task below - the old 7-section spec it
# describes is gone, replaced by what koppeling-exact-online.html now shows.
# D18: a cross-platform sub-question only ships if the honest answer is worth
# reading - a bare "no" goes to NEEDS_SAL.md instead, never onto the page.
#
# T01R/T03R/T04R retrofit the 3 landers already built under the old shape.
# Same grounding, same FAQ facts already gathered - restructure into the new
# template, do not re-derive facts that already passed verify.mjs once. They
# run before T05-T11 so every fresh build after them has 4 real examples of
# the template to match, not 1.
- [x] T01R - retrofit: pipedrive naar D17-sjabloon - allowed: koppeling-pipedrive.html, downloads/it-partner-pipedrive.html
- [x] T03R - retrofit: woocommerce naar D17-sjabloon - allowed: koppeling-woocommerce.html, downloads/it-partner-woocommerce.html
- [x] T04R - retrofit: shopify naar D17-sjabloon - allowed: koppeling-shopify.html, downloads/it-partner-shopify.html
- [x] T05 - integratie: lightspeed-ecom - allowed: koppeling-lightspeed-ecom.html, downloads/it-partner-lightspeed-ecom.html
- [ ] T06 - integratie: prestashop - allowed: koppeling-prestashop.html, downloads/it-partner-prestashop.html
- [ ] T07 - integratie: magento - allowed: koppeling-magento.html, downloads/it-partner-magento.html
- [ ] T08 - integratie: hubspot - allowed: koppeling-hubspot.html, downloads/it-partner-hubspot.html
- [ ] T09 - integratie: moneybird - allowed: koppeling-moneybird.html, downloads/it-partner-moneybird.html
- [ ] T10 - integratie: google-agenda - allowed: koppeling-google-agenda.html, downloads/it-partner-google-agenda.html
- [ ] T11 - integratie: calendly - allowed: koppeling-calendly.html, downloads/it-partner-calendly.html
- [ ] T20 - SEO-kruispas: cross-links tussen alle gebouwde pagina's + meta-lengtes nalopen - allowed: koppeling-*.html, downloads/it-partner-*.html

== SUPERVISED (not a loop run) ==
# NOT part of RUN 1 or RUN 2. The loop never picks from this block, and the
# Finishing predicate never looks at it. Sal runs T99 by hand, once, after every
# lander and sheet is built and reviewed. Leaving it inside RUN 2 made that run's
# completion predicate unsatisfiable: permanently "[ ]" and permanently unpickable,
# so the run could only ever end by burning its whole iteration cap.
- [ ] T99 [SUPERVISED] - wiring (zie ralph/SPEC.md sectie 8): koppelingen.html kaart-links, build-blog.js sitemap-lijst + regeneratie, optionele inbound links
