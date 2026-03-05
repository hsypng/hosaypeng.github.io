# hosaypenggithubio — AI Instructions

## Overview

Jekyll static site hosted on GitHub Pages. Minimalist, text-focused personal site. Content managed via Obsidian.

## File Structure

- `_essays/` — Published posts (kebab-case filenames, no date prefixes)
- `_drafts/` — Work in progress (move to `_essays/` to publish)
- `_layouts/` — HTML templates
- `_includes/css/` — CSS partials
- `assets/` — Static files
- `_data/` — Data files (`habits.json` — habit tracking data for heatmap visualization)
- `scripts/parse_habits.py` — Parses habits from Obsidian `all_habits.md` into `_data/habits.json`
- `scripts/edit_habit.py` — Adds/removes/renames habits across all entries
- `habits.html` — Main page for the habits heatmap feature
- `about.md`, `404.md`, `obsidian-guide.md` — Standalone pages

## Conventions

- Use kebab-case titles for filenames — no date prefixes.
- Put dates in frontmatter (required for RSS feed, never displayed on site).
- Keep all posts directly in `_essays/` — flat structure.
- Require `layout: post`, `title`, and `date` in front matter.

## Design Standards

- Set header padding to 80px top.
- Left-align all text — no centered titles.
- Use "Back" for back links, not "Back to Home".
- Show titles only on homepage — never display post content or excerpts.

## Verification

- Run `bundle exec jekyll build` to verify changes compile.
- Check `_site/` output for correctness after layout/template changes.

## Related Repos

- **Obsidian vault** (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/`) — Source of `all_habits.md` which feeds the habits pipeline.
- **peng-ai** (`~/Code/peng-ai/`) — Slack bot that reads habits data and sends reminders.

## Habits Pipeline

The habits heatmap is fed by a cross-repo pipeline:
1. User checks habit boxes in Obsidian (`20_areas/personal/all_habits.md`)
2. `scripts/parse_habits.py` parses the markdown into `_data/habits.json`
3. `habits.html` renders the heatmap from `habits.json`
4. The `/update-habits` Claude skill automates steps 2-3 + commit + push

## Rules

- Do not use em dashes in content. Use hyphens or rewrite.
- Indent Python scripts in `scripts/` with 2 spaces. Use standard HTML/Liquid conventions for Jekyll templates.
- Never push without explicit permission.

## Lessons

- **jq `test()` uses semicolons for flags, not commas.** `test("pattern", "i")` in jq 1.7+ creates two separate expressions. Correct syntax: `test("pattern"; "i")`. This caused a silent false-positive.
- **Hook performance: add fast-path negative greps.** IF a hook runs on every tool call → THEN a single negative grep covering all dangerous patterns lets 95%+ of commands exit after one check. Avoid 20+ sequential greps.
- **Test hooks in Claude Code, not just standalone.** `echo ... | script.sh` may return `{}` correctly, but the hook can still fail in practice due to cumulative latency.
- **Always ask where new code should live.** Repo location is a fundamental architectural decision. Never assume new scripts/tools belong in an existing repo.
- **Check existing directory structure before creating new directories.** Never guess paths like `~/code/`. Look for where the user's existing projects live first.
- **Never fabricate user data.** IF information doesn't exist in the user's files → THEN ask. Proposing ideas is fine, but present them as suggestions for the user to confirm — never silently bake them into config files or code.
- **Never push without explicit permission.** Show the diff and ask before running `git push`. Pushing is a shared-state action — treat it like a deployment, not a save.
