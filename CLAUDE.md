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

## Style Rules

- Do not use em dashes. Use hyphens or rewrite.
