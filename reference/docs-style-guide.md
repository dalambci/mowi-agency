# Documentation Style Guide (structure & style ONLY)

Captured 2026-08-02 by fetching/navigating the live sites directly (Stripe docs via WebFetch +
browser, Zapier/Linear/Notion via browser navigation into real articles, not just landing
pages) and observing their structure. All four requested sites were reachable — no substitution
needed. **Hard rule (same spirit as `style-vuewer.md`): we study structure and writing
*patterns* only.** Nothing below quotes their actual instructional content; every example is
paraphrased or genericized.

Sites studied, with the specific article(s) inspected:
- **Stripe** (`docs.stripe.com`) — `/get-started`, `/get-started/account/set-up`,
  `/get-started/account/checklist`, and one API integration page
  (`/payments/quickstart`) for contrast.
- **Zapier** (`help.zapier.com`) — `Zap workflows quick start guide` (Getting started category).
- **Linear** (`linear.app/docs`) — `Start Guide` (hub page) and `Teams` (long reference page).
- **Notion** (`notion.com/help`) — `Notion basics` (category hub) and `Create a database`
  (step-by-step article).

---

## 1. Page anatomy

Every site converges on the same skeleton for a real how-to article, even though the visual
styling differs. In order, top to bottom:

1. **Breadcrumb** — `Home / Category / Article`. Stripe and Notion leave the current page as
   plain text (not a link); Linear bolds it. Never a link to itself.
2. **Title (H1)** — short, verb-phrase or noun-phrase describing the *outcome*, not the feature
   name in isolation. "Set up your account," not "Account setup module."
3. **One-line summary directly under the title** — a single sentence stating what the reader
   will accomplish. Stripe: *"Verify your business to set up Stripe services on a live
   account."* Notion uses a small `IN THIS HELP DOC` eyebrow label above a short paragraph
   doing the same job. This line alone should let a reader decide "is this the doc I need?"
   without reading further.
4. **Prerequisites**, expressed as a short checklist or bullet list *before* the main
   steps — what the reader needs already in place (an account, a permission level, another
   integration already connected). Stripe's clearest version of this is literally a checklist
   page with checkboxes and a persisted "progress" state; simpler cases just use 2-3 bold-linked
   bullets ("Create an account," "Verify your business...") ahead of the detailed steps.
5. **Numbered steps** — see the Writing rules section below for the one-action-per-step rule.
   Steps are almost always preceded by one lead-in sentence ("To create a new database:") that
   sets up what the list accomplishes.
6. **Expected-result confirmation** — after a step or a short group of steps, a sentence or an
   embedded screenshot/GIF shows what the reader should now see. Notion does this most
   consistently: a live product screenshot or short clip sits directly under nearly every step
   group, functioning as visual proof the step worked.
7. **Troubleshooting** — never a copy-pasted block *inside* the happy-path steps. It's either
   its own page linked at the point of risk ("If errors occur, learn how to troubleshoot your
   Zap workflows") or a dedicated page in an "if something goes wrong" category. Keep it out of
   the numbered steps entirely so the happy path stays uninterrupted.
8. **Next steps** — a short bulleted section (Zapier, Notion) or a single "Up next" /
   "Next: [article]" card (Zapier, Notion) pointing to the next logical article. Not a generic
   "related articles" dump — one specific next thing.
9. **Feedback widget** *(optional, nice-to-have)* — "Was this helpful?" thumbs up/down, seen on
   Zapier and Notion. Useful once we have traffic/analytics behind the docs section; not a v1
   requirement for a static site.
10. **Freshness stamp** *(optional)* — Zapier shows "Updated 1 month ago" under the title. Worth
    adopting for agent/integration pages specifically, since those change when a client's
    connected system changes its own UI.

**Also observed, worth deciding on later, not required for v1:** three of the four sites offer
an "Ask AI" / "Copy for LLM" / "View as Markdown" utility (Stripe most explicitly, Linear has a
"Copy page" button). This reflects docs increasingly being consumed by AI assistants as well as
humans. Not a launch requirement, but worth keeping page content clean/structured (real
headings, real lists) so it would work if we ever add this.

## 2. Navigation anatomy

- **Persistent left sidebar**, grouped by category with small-caps section headers
  (Stripe: `START BUILDING`, `ACCOUNT STRUCTURE`; Linear: flat top-level list, each
  expandable). Current page is highlighted (bold or filled background), current category
  auto-expanded.
- **Breadcrumb** directly above the title (see anatomy #1).
- **"On this page" table of contents**, right-hand column, sticky while scrolling, mirroring
  the article's own H2/H3 structure with indentation for H3s. Zapier and Linear both highlight
  the current section as the reader scrolls (scroll-spy). This is the single most consistently
  present nav element across all four sites on long articles — prioritize it.
- **Previous/next**: not a generic paginator. It's a single, named "next article" card at the
  very bottom (see anatomy #8), styled distinctly from inline body links.
- **Category hub pages**: every category (not just the docs home) has its own landing page —
  title, one-line summary, then a card grid of its articles. Notion's hub pages additionally
  segment by *audience* in places (Linear does this too: "Admins" vs. "Team members" bullet
  groups within one page) — worth doing for our "Voor uw IT-partner" category, which is
  explicitly audience-scoped already.
- **Search**, prominent, near the top, often with a visible keyboard shortcut hint (Stripe: `/`).
  Not required for a small initial doc set, but keep the sidebar structure clean enough that
  search could be bolted on later without restructuring.

## 3. Writing rules

These are the user's explicit rules, confirmed against real examples from all four sites:

- **Short sentences.** One idea per sentence. Long compound sentences appeared almost nowhere in
  the actual step text on any of the four sites — length was reserved for the contextual
  paragraphs *around* steps, never inside a numbered step itself.
- **Imperative voice for every step.** "Klik op **Nieuwe koppeling**," not "U kunt op Nieuwe
  koppeling klikken" or "De gebruiker klikt op...". All four sites default to imperative
  ("Click," "Create," "Enable") for the action itself, reserving second-person ("you/your") for
  the explanatory sentences around it.
- **Exactly one action per numbered step.** Where a real-world example broke this (Stripe's
  quickstart offering two alternate paths inside step 1), it read as noticeably harder to
  follow than the strict versions — treat that as a pattern to avoid, not to imitate.
- **State the expected result after every step or step group.** Either a sentence ("You'll see a
  confirmation banner") or an embedded screenshot immediately after. Never leave a step without
  some form of "here's how you know it worked."
- **UI names in bold, quoted exactly as shown on screen.** All four sites visually distinguish
  UI element names from prose, but use three different exact techniques: Zapier/Notion prose
  uses **bold**, Stripe's code-adjacent pages use `code formatting` for literal values, and
  Notion's step lists specifically use a pill/chip badge style for on-screen labels. **We use
  bold** — it's the most broadly legible in running Dutch prose and doesn't imply "this is
  code" the way backticks do. Always the exact on-screen casing/wording, never a paraphrase
  ("**Nieuwe koppeling toevoegen**", not "de knop om een koppeling toe te voegen").
- **Never vague filler words.** Banned: "simply," "just," "easily" (EN) / "simpelweg," "gewoon,"
  "even," "makkelijk," "ergens," "vanzelfsprekend" (NL). These words assume the outcome instead
  of describing the action, and they read as condescending when a step turns out not to be
  simple for a given reader. If a step is genuinely simple, the short sentence and single action
  already show that — the adjective adds nothing.
- **Define every term on first use**, inline, in one clause — not a separate glossary entry the
  reader has to break flow to find (though a `Stripe glossary`-style reference page for the
  whole docs section, linked from "Aan de slag," is worth having too, for lookups after the
  fact).
- **One consistent name for the same thing, everywhere.** Pick the term once and never
  introduce a synonym for variety. This is the rule the four sites are most disciplined about —
  Notion, for instance, never once switched between the term it uses for accounts/pages
  mid-document. For us: it's always **"het dashboard,"** never "de omgeving," "het portaal," or
  "uw account" for the same thing.

---

## 4. Proposed information architecture

Categories and initial pages, per the requested structure. Dutch titles for everything except
agent/integration proper nouns (per the existing English-labels convention in `CLAUDE.md`).
Nothing below is built yet — this is the page list to review before any HTML/CSS work starts.

### Aan de slag
- **Overzicht: wat is het dashboard** — orientation page; defines "het dashboard" on first use
  (per the writing rules above) so every later page can use the term without redefining it.
- **Uw eerste agent instellen (checklist)** — a Stripe-checklist-style page: the minimum path
  from signup to one working agent, each item linking out to its full page elsewhere in the IA.
- **Toegang en rollen** — who on the client's team can log in / configure agents, if relevant to
  how the dashboard actually handles roles.
- **Systeemvereisten** — supported browsers, required account permissions on the client's own
  systems (e.g., admin access to Salesforce) before starting a koppeling.

### Agents
One page per agent, matching the Products mega-menu's Automations list exactly:
- **CRM sync**
- **E-mail agent**
- **Invoice processing**
- **Lead enrichment**
- **Report generator**

Each page follows the full anatomy in section 1: one-line summary, prerequisites, numbered
setup steps, expected results, troubleshooting link, next steps (likely: the koppeling page the
agent depends on).

### Koppelingen
One page per integration. Starting three, in the order given:
- **Salesforce**
- **Exact Online**
- **AFAS**

### Voor uw IT-partner
Audience-scoped per the navigation-anatomy note above (Linear's Admins/Team-members pattern).
- **Overzicht voor IT-partners** — hub page, who this section is for and how it differs from
  the client-facing Agents/Koppelingen pages.
- **Beveiliging & gegevensverwerking** — what data agents touch, where it's processed.
- **Netwerkvereisten** — IP's/domeinen die moeten worden vrijgegeven, poorten, etc. (only the
  parts that are actually true today — placeholder-marked if not yet finalized, never invented).

### Problemen oplossen & FAQ
- **Veelgestelde vragen** — the FAQ index page itself.
- **Een koppeling werkt niet meer** — the single most likely support-deflecting page (matches
  the "link troubleshooting at the point of risk" pattern from section 1).
- **Een agent voert geen taken uit** — second most likely case, parallel structure to the above.
- **Contact opnemen met support** — last resort, always present as an escape hatch (every site
  studied has an equivalent).
