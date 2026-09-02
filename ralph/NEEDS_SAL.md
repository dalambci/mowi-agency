# NEEDS_SAL

Everything the loop could not resolve on its own. Sal reads this once at run end; the loop writes to
it mid-run and never waits for an answer. Writing an entry here and shipping conservative copy is the
**correct** outcome for a gap - it is not a failure, and it never justifies inventing a fact.

If the stall rule fires, a `## STALLED` banner is written at the **top** of this file, above
everything else.

## Categories

| Category | Means |
| --- | --- |
| `missing fact` | Copy needed something not in live site copy or the vault. Page shipped conservative; the specific claim was left out. |
| `blocked reason` | A task is marked `[blocked]` in TASKS.md. Every `[blocked]` task must have an entry here - the completion promise checks for it. |
| `guardrail incident` | The loop touched, or nearly touched, something outside its allowed paths. What happened, what was reverted, whether verify still passed afterwards. |
| `wanted-but-out-of-scope` | A real improvement noticed while building that this batch may not do (needs an existing file edited, a new claim, or a decision). Parked for Sal. |

## Entry format

```
### <ID> <category> - <task-id> <slug>
- Needed: <what is missing, in one or two sentences>
- Shipped instead: <the conservative fallback that is live in the file right now>
- Suggested next step: <the smallest concrete thing Sal can do to unblock it>
```

IDs run `S-001`, `S-002`, ... Never renumber; never delete an entry once written. The next free ID is
always one past the highest ID already in **Open items**; there is no example entry to confuse it with.

---

## Open items

### S-001 wanted-but-out-of-scope - setup - RESOLVED 2026-08-23, before RUN 1
- Needed: `.gitignore` did not list `.claude/ralph-loop.local.md`. The `ralph-loop` plugin writes its
  state file there, so it would show up as untracked dirt in every Step 0 / Step 5 `git status` check
  and risk being read as a guardrail violation.
- Shipped instead: n/a - resolved during setup. The branch-setup hunk adds 6 lines to `.gitignore`:
  `.claude/ralph-loop.local.md` (plugin state, kept for the D5 path even though D10 uses `run.sh`) and
  `ralph/logs/` (where `run.sh` writes every transcript). That `.gitignore` edit is the one pre-existing
  file legitimately changed on this branch, done during setup, not by the loop. The loop must never edit
  it again **and must never revert it**: ` M .gitignore` in `git status` is sanctioned state, not dirt.
- Suggested next step: none. Left in place as the record of why that line exists.

### S-002 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: eight platforms in the dashboard's `config/shop_platforms.php` carry a `doc_url` pointing at a
  docs page that **does not exist** on mowi.agency, so the "lees de handleiding" link in the dashboard's
  own connect screen 404s today: `koppeling-lightspeed`, `koppeling-shopware`, `koppeling-magento`,
  `koppeling-bol`, `koppeling-prestashop`, `koppeling-hubspot`, `koppeling-guestplan`,
  `koppeling-calendly`. Only `woocommerce`, `shopify`, `pipedrive` and `google-agenda` resolve.
- Shipped instead: nothing - this is a dashboard-side bug found while sourcing grounding material, not a
  batch task. It is also **why** 7 of the 11 landers have no docs page to ground copy in (TASKS.md header).
- Suggested next step: decide whether the missing docs pages get written (they would ground both the
  landers and the dashboard link), or whether the dashboard should drop the `doc_url` for those eight
  until a page exists. Either is a separate job from this batch.

### S-003 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: **Shopware, bol.com and Guestplan** are `implemented => true` in the dashboard - a customer can
  connect them today - but `koppelingen.html` still lists all three under "Op de planning". They are
  therefore out of scope under D2/D14 and have no lander.
- Shipped instead: nothing. The 11 landers cover only what the public hub page calls live.
- Suggested next step: one word from Sal. If those three are genuinely live, they become T12-T14 on the
  same spec and the hub page's cards move from "Op de planning" to "Nu al te koppelen" in the supervised
  T99 wiring pass - the hub page is a shared file, so it cannot move inside a loop run.

### S-004 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: master's working tree had two uncommitted `.gitignore` additions (`out/` and
  `content/social-templates/.render-tmp.html`) that blocked the branch switch. They are parked in
  `stash@{0}` ("ralph phase0: master .gitignore additions...").
- Shipped instead: the same two lines were added to this branch's `.gitignore` directly, so the loop is
  not affected either way. The stash is a belt-and-braces copy, deliberately not dropped.
- Suggested next step: when the social-content workstream gets committed on master, `git stash pop` there
  (or just re-add the two lines) and drop the stash. Nothing in this batch depends on it.

### S-005 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: commit `2f0991b` (2026-08-24, "Add accounting workflows and 3 boekhouding integrations from
  autoboeker.nl") lives on this branch only - it is not on `origin/master`. It edits `index.html` and
  `koppelingen.html`, and it adds **Twinfield, SnelStart and e-Boekhouden.nl** to the hub page's "Op de
  planning" list. `verify.mjs`'s `vendors` check treats "SnelStart" and "Twinfield" as forbidden names
  (D2), so the existing hub page now fails that check - new landers are unaffected, they never name them.
- Shipped instead: nothing changed. The commit predates this session and is unrelated to the batch.
- Suggested next step: decide whether that commit belongs on master at all, and whether "Op de planning"
  counts as naming a vendor for D2's purposes. If it does, the hub page needs a separate pass - it is a
  shared file and out of this batch's reach.

### S-006 missing fact - T01 pipedrive (and every later lander)
- Needed: SPEC section 4 item 4 says to link the agent cards at `/workflows#email-agent` and
  `/workflows#call-agent`, "the same fragments the sitewide nav already uses". The nav in
  `test.html` does not use those: it links **Inbox agent -> `/e-mail-agent`** and **Voice agent ->
  `/call-agent`**, both real pages with real content. Those two fragments appear nowhere on the
  site, and `workflows.html` has an empty `<main>` carrying no anchors at all, so the spec's
  literal URLs would have pointed at the top of a blank page while a better page existed.
- Shipped instead: the two agent cards link to `/e-mail-agent` and `/call-agent` (the nav as it
  actually is today). The third card links to `/workflows#crm-sync`, which IS a nav fragment, and
  does land on the empty `workflows.html` - the known gap SPEC section 4 tells the loop to accept.
- Suggested next step: confirm this reading for T02-T11 so all 11 landers agree, or say the word
  and they all use `/workflows#...` for the agents too. Separately, `workflows.html`'s empty
  `<main>` is the real fix: every workflow fragment on the site is dead until it has content.

### S-007 missing fact - T01 pipedrive (sheet)
- Needed: the sheet has to tell an IT-partner **how** to return the Pipedrive API-token. Live copy
  says only what not to do ("niet per e-mail in platte tekst", `docs/koppeling-pipedrive.html`).
  No named secure channel exists in any source: no vault entry, no dashboard upload field, no
  password-vault or one-time-link tool that Mowi actually uses. Naming one would be invented.
- Shipped instead: the prescribed conservative fallback, verbatim, in the "Hoe u het token
  terugstuurt" block: "Mowi volgt dit direct met u op en geeft aan via welk kanaal u het veilig
  kunt delen." Plus the grounded negative ("niet per e-mail in platte tekst").
- Suggested next step: name the channel once (a vault line is enough) and all 11 sheets can carry
  it instead of the fallback. If a self-serve credential field lands in the dashboard, that becomes
  the answer and the fallback disappears entirely.

### S-008 wanted-but-out-of-scope - T02 exact-online (and RUN 2's moneybird) (2026-09-02)
- Needed: a decision on whether these landers may publish before the koppeling is proven to work.
  Found by reading the gateway sources directly, which is below what any lander check looks at:
  - `ExactOnlineGateway.php`: *"NOT live-verified against a real Exact Online tenant (no sandbox
    credentials available to this build) ... Before any real client connects Exact Online: walk through
    one real OAuth round-trip and one real contact lookup against a sandbox/trial account."* Both the
    CRM and the Invoice methods carry that gap.
  - `MoneybirdGateway.php` (RUN 2, T09): the same, in the same words, for both method groups.
  - By contrast `PipedriveGateway.php` and `HubSpotGateway.php` had their core contact-lookup methods
    **live-verified against a real sandbox**; only the later dashboard deal-reporting methods are
    unverified. T01 pipedrive is therefore on solid ground and is not part of this entry.
- Shipped instead: nothing was overstated on the page - `koppeling-exact-online.html` claims only what
  the config and the gateway support, and it correctly discloses the NL-only limitation. The point is
  narrower: an SEO lander's whole job is to send strangers down a connect flow that no one has ever
  completed end to end. `koppelingen.html` already lists both platforms under "Nu al te koppelen", so
  the claim is live on the site today - the lander amplifies it, it does not invent it.
- Suggested next step: one real OAuth round-trip plus one contact lookup on an Exact Online trial
  account, and the same on a Moneybird account, before either page is deployed. If that cannot happen
  soon, the cheap alternative is to hold just those two pages back and ship the other nine - the
  batch does not depend on them. Belgian clients are a separate, already-disclosed gap: Exact Online
  is wired to `start.exactonline.nl` only, so a Belgian account cannot complete the flow at all.

### S-009 wanted-but-out-of-scope - T04 shopify (2026-09-02)
- Needed: the live docs page `docs/koppeling-shopify.html` (tier 1) and the dashboard's
  `config/shop_platforms.php` (tier 2) disagree about how Shopify is connected. The docs page says
  "Deze koppeling zet u niet zelf in elkaar": open Support in the dashboard, receive one approval link
  from Mowi, open it while logged in to Shopify, and Mowi finishes the connection. The config's own
  comment says that concierge path was replaced by a one-button OAuth flow against Mowi's own "Mowi
  Koppeling" app: the client types the `.myshopify.com` address, clicks "Koppel met Shopify", confirms
  read-only order access, and lands on Verbonden without Mowi doing anything. The `Admin API-token`
  field is kept for the admin path only and never shown to a client.
- Shipped instead: the lander and the sheet follow the config (SPEC section 9: the dashboard is the
  only admissible click-path source), so 3 self-serve steps, no Support step, no approval link. Facts
  both sources agree on were kept: read-only scope, the 60-day / `read_all_orders` note, revoking via
  Instellingen, Apps, and the status jumping to Fout.
- Suggested next step: rewrite the warning callout, the "De koppeling inrichten" steps and the
  IT-partner message on `docs/koppeling-shopify.html` to the self-serve flow. It is a pre-existing
  file, so out of this batch's reach. Until then the dashboard's own "Bekijk de documentatie" link on
  the Shopify tile sends a client to steps that no longer match the screen they are looking at.

### S-009 wanted-but-out-of-scope - T02 exact-online, template-wide (2026-09-02)
- Needed: a confirmed call on whether platform logos in a lander hero render in their own brand
  color (Exact Online ships red, matching koppelingen.html) or get greyscaled to match the sitewide
  monochrome rule. D17 reasons the monochrome rule governs Mowi UI, not a third-party trademark mark,
  and treats brand-color as the default - but this is Sal's call, not a default worth assuming silently
  across 11 pages.
- Shipped instead: koppeling-exact-online.html ships the Exact mark in its real red, same as the live
  hub page.
- Suggested next step: one word from Sal. If greyscale is wanted, apply
  `filter: grayscale(1); opacity: 0.7` (the marquee's own treatment) to every lander logo in one pass -
  cheap to do at any point, so it is not a blocker for RUN 2.

### S-010 wanted-but-out-of-scope - T02 exact-online (2026-09-02)
- Needed: "pipedrive exact online" (10/mo, Sal) has a real cross-platform search behind it, but the
  honest answer today is "Mowi doesn't sync them" - not useful content, cut per D18 rather than
  published as a thin no-answer section.
- Shipped instead: nothing on the page. The section that answered this was removed entirely.
- Suggested next step: a genuine Pipedrive <-> Exact Online sync workflow (distinct from the existing
  CRM-synchronisatie workflow, which only recognizes customers, never writes) would turn this into a
  real yes and make the keyword worth capturing. Logged as a product idea in the vault
  (`Ideas for agents.md`), not only here - this is Sal's call to build, not a site-copy fix.

### S-011 missing fact - T03R woocommerce (2026-09-03)
- Needed: SPEC section 4 "Finding the question" step 2 - no real keyword numbers have been supplied for
  `woocommerce` (unlike `exact_online`'s three Google Keyword Planner figures). This retrofit is the
  first time WooCommerce gets the question-pattern `<h1>`/`<title>`; the pre-retrofit page used a
  different, non-question title entirely ("WooCommerce koppelen aan Mowi: bestelstatus direct
  opgezocht"), so there was no earlier point where this gap would have been logged.
- Shipped instead: the fallback pattern proven on Exact Online - `<h1>` "Wat kunt u met AI automatiseren
  in WooCommerce?", title "WooCommerce koppeling met AI: wat kunt u automatiseren? — Mowi".
- Suggested next step: a real search-volume number for a WooCommerce-plus-AI query (Google Keyword
  Planner, same source as the Exact Online figures) would let the title/H1 be built around the actual
  seed keyword instead of the generic pattern - no rebuild needed, just a copy swap.
