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
