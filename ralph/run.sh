#!/usr/bin/env bash
#
# ralph/run.sh - loop runner for the mowi.agency site batch.
#
# Usage (from the repo root, in Git Bash):
#   bash ralph/run.sh 1        # RUN 1: the two pilot landers, cap 8 iterations
#   bash ralph/run.sh 2        # RUN 2: the remaining tasks, cap 30 iterations
#   bash ralph/run.sh 1 3      # override the iteration cap
#
# Stop it at any time with Ctrl+C. Every finished task is already committed,
# so the most you lose is the iteration in flight.
#
# WHY A BASH LOOP AND NOT THE ralph-loop PLUGIN
# Measured on this machine, 2026-08-23:
#   1. `bash` resolves to C:\WINDOWS\system32\bash.exe (WSL2), which cannot
#      execute a script given a Windows path - the backslashes are eaten and
#      it exits 127. The plugin's hook is registered as `bash "${...}/stop-hook.sh"`.
#   2. Even forced through Git Bash, the hook dies on `jq: command not found`
#      (exit 127); it uses jq to parse the transcript. jq is not installed.
# A failed Stop hook does not block exit, so the plugin would have looped
# exactly once and looked like a clean finish - the worst possible failure.
# A bash loop needs neither fix. It also gives every iteration a FRESH context,
# which is what we want across 30 iterations, and it lets the tool allowlist
# below act as a brake the harness enforces rather than one the prompt asks for.
#
# This is DECISION D10 in ralph/DECISIONS.md, which supersedes D5. To use the
# plugin instead: `winget install jqlang.jq`, then point the hook at Git Bash
# ("C:/Program Files/Git/bin/bash.exe") in the cached plugin's hooks/hooks.json.
#
# BEFORE THE FIRST RUN, once, by hand: commit the branch setup, so that
# LOOP_PROMPT.md Step 0's "git status shows exactly this iteration's work"
# premise is true from iteration 1 rather than from iteration 2.
#   git add .gitignore ralph/ && git commit -m "ralph: branch setup"
# The loop survives without it - Step 0 names ` M .gitignore` as sanctioned
# state and never reverts it - but the first iteration's paths gate is noisier.

set -uo pipefail

cd "$(dirname "$0")/.." || exit 1

RUN="${1:-}"
case "$RUN" in
  1) PROMISE="RUN 1 DONE";      DEFAULT_MAX=8  ;;
  2) PROMISE="SITE BATCH DONE"; DEFAULT_MAX=30 ;;
  *) echo "usage: bash ralph/run.sh <1|2> [max-iterations]" >&2; exit 2 ;;
esac
MAX="${2:-$DEFAULT_MAX}"

# The brakes. Deny rules win over allow rules, so the denies below hold even if
# an allow pattern would otherwise cover them. Everything the loop legitimately
# needs is listed; anything else is refused by the harness, not by the prompt.
ALLOW="Read,Write,Edit,Glob,Grep,TodoWrite"
ALLOW="$ALLOW,Bash(node ralph/verify.mjs:*)"
ALLOW="$ALLOW,Bash(git status:*),Bash(git add:*),Bash(git commit:*),Bash(git diff:*)"
ALLOW="$ALLOW,Bash(git log:*),Bash(git rev-parse:*),Bash(git checkout:*),Bash(git clean:*)"
DENY="Bash(git push:*),Bash(git remote:*),Bash(ssh:*),Bash(scp:*),Bash(rsync:*)"
DENY="$DENY,Bash(curl:*),Bash(wget:*),Bash(npm:*),Bash(npx:*),Bash(node build-blog.js:*)"
# generate-it-sheets.js launches Playwright and writes .pdf files straight into
# downloads/, which IS inside a task's allowed paths - so it would look clean in
# the paths gate. It was denied only by omission from ALLOW; name it explicitly.
# rm likewise: the sanctioned delete is `git clean -f -- <path>`, and .claude/
# settings.local.json is merged in on top of these flags with broader Bash rules
# of its own, so anything that must not run has to be in DENY, not just absent.
DENY="$DENY,Bash(node generate-it-sheets.js:*),Bash(rm:*)"
DENY="$DENY,WebFetch,WebSearch"

mkdir -p ralph/logs
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="ralph/logs/run${RUN}-${STAMP}.log"

echo "ralph: RUN $RUN, max $MAX iterations, promise \"$PROMISE\""
echo "ralph: logging to $LOG"
echo

for (( i=1; i<=MAX; i++ )); do
  echo "=== iteration $i/$MAX  ($(date +%H:%M:%S)) ==="

  # Fresh process, fresh context, same prompt every time. TASKS.md and git are
  # the only state carried between iterations - that is the whole Ralph idea.
  out=$( { cat ralph/LOOP_PROMPT.md; printf '\n\nActive run: RUN %s.\n' "$RUN"; } \
         | claude -p --allowedTools "$ALLOW" --disallowedTools "$DENY" 2>&1 )

  printf '%s\n' "$out"
  { echo "=== iteration $i/$MAX ($(date -Iseconds)) ==="; printf '%s\n' "$out"; } >> "$LOG"

  # Match the wrapped form AND its position. Matching presence alone is not
  # enough: LOOP_PROMPT.md contains both promise strings already wrapped (it has
  # to, to specify them), and it is piped in as the prompt - so any iteration
  # that quotes its Finishing instructions back, in a summary or a "here is what
  # I will do at the end", would end the whole run as a silent success.
  # LOOP_PROMPT says the promise is the very last thing with nothing after it;
  # this is what actually enforces that.
  if printf '%s' "$out" | tail -n 3 | grep -qF "<promise>${PROMISE}</promise>"; then
    echo
    echo "=== $PROMISE - after $i iteration(s) ==="
    echo "Next: read ralph/REVIEW.md, then ralph/NEEDS_SAL.md (check for a STALLED banner)."
    exit 0
  fi

  sleep 5
done

echo
echo "=== stopped: hit the $MAX-iteration cap without the completion promise ==="
echo "Check ralph/TASKS.md for what is still unchecked and ralph/NEEDS_SAL.md for why."
exit 1
