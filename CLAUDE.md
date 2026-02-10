# CLAUDE.md - Project Context

## Overview

- Jekyll static site hosted on GitHub Pages
- Minimalist, text-focused personal site
- Content managed via Obsidian

## File Structure

- `_essays/` - Published posts (kebab-case filenames, no date prefixes)
- `_drafts/` - Work in progress (move to `_essays/` to publish)
- `_layouts/` - HTML templates
- `_includes/css/` - CSS partials
- `assets/` - Static files

## Conventions

- **No dates in filenames** - use kebab-case titles only
- **Dates in frontmatter** - required for RSS feed, but never displayed on site
- **Flat structure** - all posts directly in `_essays/`
- **Front matter** - `layout: post`, `title`, and `date` required

## Design Standards

- Header padding: 80px top
- Left-align all text (no centered titles)
- Back links use "Back" not "Back to Home"
- **Homepage shows titles only** - never display post content or excerpts on the homepage, only linked titles

## Verification

- Run `bundle exec jekyll build` to verify changes compile
- Check `_site/` output for correctness after layout/template changes

## Style Rules

- Do not use em dashes. Use hyphens or rewrite.

## Lessons Learned

- **jq `test()` uses semicolons for flags, not commas.** `test("pattern", "i")` in jq 1.7+ creates two separate expressions (the test + the string `"i"` which is truthy). Correct syntax: `test("pattern"; "i")`. This caused a silent false-positive that blocked every command reaching that check.
- **Hook performance: add fast-path negative greps.** When a hook runs on every tool call, 20+ sequential greps cause latency that can trigger timeouts. A single negative grep covering all dangerous patterns lets 95%+ of commands exit after one check.
- **Test hooks in Claude Code, not just standalone.** `echo ... | script.sh` may return `{}` correctly, but the hook can still fail in practice due to cumulative latency across multiple hooks. Always verify with real tool calls.
- **Always ask where new code should live.** Repo location is a fundamental architectural decision. Never assume new scripts/tools belong in an existing repo - ask the user first. This applies to any new project, tool, or service.
- **Check existing directory structure before creating new directories.** Never guess paths like `~/code/`. Always look for where the user's existing projects live first (e.g., `~/Documents/Code/` on iCloud). A 5-second `find` saves a round of corrections.
- **NEVER fabricate user data.** If information doesn't exist in the user's files (schedules, times, descriptions, preferences), ASK - do not invent it. Proposing ideas is fine, but they must be explicitly presented as suggestions for the user to confirm, never silently baked into config files or code. This is a trust issue, not a style issue.
