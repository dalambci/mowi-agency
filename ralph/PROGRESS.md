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
