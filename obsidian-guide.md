# Using Obsidian with your Jekyll Site

You can write and publish blog posts directly from Obsidian. Here is the workflow:

## 1. Setup

1. Open **Obsidian**.
2. Click **"Open folder as vault"**.
3. Select the `hosaypenggithubio` folder.

## 2. Writing a New Post

1. In the Obsidian file explorer, navigate to the `_essays` folder.
2. Create a new note.
3. Name the note whatever you like (e.g., `my-first-post.md`). No date prefix is needed!
4. Add the following header (Front Matter) to the very top of your file:

```yaml
---
layout: post
title: "My First Post"
---
```

5. Write your content in Markdown!

## 3. Drafting

If you aren't ready to publish yet:
1. Create your file in the `_drafts` folder.
2. When you are ready to publish, move the file to the `_essays` folder.

## 4. Publishing

When you are ready to publish:
1. Save the file.
2. If running locally, the changes appear immediately at `http://127.0.0.1:4000/`.
3. To publish to the internet (GitHub Pages), you will need to push your changes using Git.

_If you need a script to simplify the "Git Push" part, let me know!_
