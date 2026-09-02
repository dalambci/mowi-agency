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

### T01 pipedrive
- Path: `koppeling-pipedrive.html` (+ `downloads/it-partner-pipedrive.html`)
- Open: `start-local-server.bat` then http://localhost:8765/koppeling-pipedrive
- [ ] Spacing matches the blog / koppelingen canon (section rhythm, heading margins, card gutters -
      open koppelingen.html in a second tab and flip between them)
- [ ] Exactly one CTA visible in the page body, and it is obvious - "Start gratis", pointing at
      my.mowi.agency/aanmelden. Header and footer CTAs do not count.
- [ ] Tablet view (~768px, narrow the window): breadcrumb padding is not cramped against the header,
      and the hero H1 does not overflow or jump a size
- [ ] `.lp-steps` renders acceptably here. It is the site's numbered-step component (both agent
      pages use it) but it centres its own text, and this page's headings are left-aligned
      `.page-heading`. Five steps instead of the usual three, one per `instructions[]` entry.
- [ ] The three cards under "Werkt met deze agents en workflows" are `<a class="lp-card">`, not the
      `<div>` the agent pages use. Check the whole card is clickable and the hover reads as a link.
- [ ] Open `downloads/it-partner-pipedrive.html` and print-preview it (Ctrl+P): one A4, nothing
      clipped, and it must NOT pull in `css/style.css` (it carries its own `<style>`).
- Open questions: S-006 (agent cards link to `/e-mail-agent` + `/call-agent`, not the spec's
  `/workflows#email-agent`; `/workflows#crm-sync` still lands on an empty page) and S-007 (no named
  secure channel for handing over the API-token, sheet uses the fallback line).

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
