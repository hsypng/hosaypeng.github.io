
Personal blog and project site built with Jekyll, hosted on GitHub Pages.

## Tech Stack

- **Jekyll** static site generator
- GitHub Pages hosting
- Liquid templates, vanilla JS, CSS

## Directory Structure

| Directory | Purpose |
|-----------|---------|
| `_essays/` | Published posts (kebab-case filenames, no date prefixes) |
| `_drafts/` | Work-in-progress posts |
| `_layouts/` | HTML templates (default, post) |
| `_includes/` | Reusable partials and CSS |
| `_data/` | Data files (`habits.json`) |
| `assets/` | Static files (JS, images) |
| `scripts/` | Python utilities for data pipelines |

## Standalone Pages

- `index.md` - Homepage with tag-filtered essay list
- `about.md` - About page
- `habits.html` - Habits heatmap visualization
- `obsidian-guide.md` - Obsidian setup guide
- `404.md` - Custom 404 page

## Habits Heatmap

A cross-repo pipeline renders a daily habit-tracking heatmap:

1. `scripts/parse_habits.py` parses habit data from an Obsidian vault into `_data/habits.json`
2. `habits.html` loads the JSON and renders an interactive heatmap via `assets/js/heatmap.js`

## Local Development

```bash
bundle install
bundle exec jekyll serve
```

Site will be available at `http://localhost:4000`.
