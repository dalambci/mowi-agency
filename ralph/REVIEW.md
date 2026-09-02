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
