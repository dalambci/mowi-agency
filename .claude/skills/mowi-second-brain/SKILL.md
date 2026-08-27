---
name: "mowi-second-brain"
description: "Load and maintain the Mowi project's persistent second-brain — an Obsidian vault shared across the mowi.agency website and Mowi Dashboard projects. Use at the start of any session doing real project work, and whenever something important gets decided or changed."
---

# Mowi second-brain (Obsidian vault)

The vault lives at `c:/Users/SalP1/Desktop/Mowi brain/` on the Windows PC and — synced via
Obsidian Sync (Sal has the subscription) — at `/Users/sal/Desktop/Mowi brain/` on the Mac. Note
the structural difference: on the Mac the notes sit directly in the vault root (`Home.md`,
`Decisions log.md`, topic folders like `Website/`), with no `Mowi/` subfolder and no `Mowi - `
filename prefix on the core files. If the folder looks missing, ask Sal to open the Obsidian app
so Sync can catch up before concluding the vault is unavailable. It is separate from Claude Code's
own built-in auto-memory system — this one is a manually-curated, cross-project knowledge base
(website + dashboard both read and write the same files), visible to the user as an Obsidian
graph. Treat it as the authoritative source of project decisions and status, not a nice-to-have.

## Phase 1 — Load context (start of session)

Before starting real work (not needed for a one-line question that doesn't touch project
decisions):
- Always read `Mowi - Home.md` first (kept deliberately short — an index, not a restatement of
  every note) and `Mowi - Decisions log.md` (short, gives fast orientation on anything recent).
- For everything else, **do not read every note in the folder** — that stops scaling once the
  vault has more than a handful of files. Instead:
  - `Grep` the vault folder (`c:/Users/SalP1/Desktop/Mowi brain/`, recursively — plan for
    subfolders as the vault grows) for keywords from today's task, or for the relevant
    frontmatter `tags:` value, to find candidate notes.
  - `Glob` for filename patterns (e.g. `Mowi - Agent*.md`) once you know the topic.
  - Only read the specific notes that actually matched. A full-folder read-everything pass is
    only fine while the vault stays small (roughly under ~15-20 notes); past that, always
    search first.

## Note-hygiene rules (apply whenever creating/editing notes — this is what keeps scaling working)

- **One note per concept.** Don't let a note become a dumping ground for multiple unrelated
  topics — split it into a new note and link it instead.
- **Tag specifically.** Every note keeps a unique `tags:` entry beyond the shared `mowi` tag, so
  grep-by-tag stays a reliable way to find it later.
- **Home.md stays an index only** — one line per note (or per category once the list grows;
  group entries under category subheadings like `### Product`, `### Business`, `### Decisions`
  rather than letting it balloon into a flat list of hundreds of lines).
- **Search before creating.** Grep by topic/tag before writing a new note — prefer extending an
  existing note over creating a near-duplicate one.
- No MCP server, Obsidian plugin, or API key is needed for any of this — it's plain filesystem
  search with tools already available in every session. Don't suggest adding one; it would be
  more moving parts for no additional capability at this vault's scale.

## Phase 2 — Update it (when something important happens)

Something is "important" if it would change how a future session should behave: a decision,
a reversal, a new fact about the business/product, a blocker discovered, a plan adopted or
dropped. Ordinary implementation detail (which the code itself already documents) is not.

When it happens:
1. Edit the matching topic note directly — update the relevant paragraph/bullet, don't just
   append noise to the end.
2. Bump that note's frontmatter `updated:` field to today's date.
3. Append one line to `Mowi - Decisions log.md` in the format
   `YYYY-MM-DD — decision — why`.
4. **Never delete history.** If a past decision is superseded, mark it
   `(superseded 2026-XX-XX — see below)` rather than removing the line.
5. If you create a brand-new note, add it to `Mowi - Home.md`'s linked list with a one-line
   description, and cross-link it from/to related existing notes with `[[wikilinks]]`.
6. Don't invent or embellish facts — only write what was actually confirmed or decided in the
   session. Keep any `(RECOMMENDED — not yet confirmed)` labels intact until the user confirms.

## Phase 3 — Be honest about reliability

This skill is a behavioral instruction, not a mechanical guarantee. A `Stop` hook in this
project's `.claude/settings.json` prints a reminder after each turn as a backstop — if you
notice it and realize something should have been written, do it then rather than waiting to be
asked twice.
