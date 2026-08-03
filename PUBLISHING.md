# Publishing a blog post

Not part of the shipped site — this is the "how do I actually publish a post"
guide, written for someone who doesn't code and who is pasting in content
another AI session produced.

## 1. Write the post

- Copy `content/blog/POST_TEMPLATE.md` to a new file in that same folder,
  e.g. `content/blog/mijn-nieuwe-post.md`.
- Fill in every field at the top (between the `---` lines) — each one has a
  one-line comment explaining what goes there. The most important ones:
  - `slug` — becomes the web address, e.g. `slug: kosten-facturen` →
    `mowi.agency/blog/kosten-facturen`.
  - `draft: true` — keep this while you're still writing. A draft post
    **never appears anywhere** (not on the blog page, not in search engines)
    — it only exists as a file until you flip it to `draft: false`.
- Below the `---` line, write the post itself in plain text/Markdown — see
  the template file for the exact structure (direct answer first, then
  question-headings with `##`).

## 2. Preview it before publishing

1. Make sure the local server is running: double-click
   `start-local-server.bat` (or run `node serve.js` in a terminal).
2. Run: `node build-blog.js --preview`
   - This builds every real post as normal, AND additionally renders every
     draft (including the one you're writing) into a `blog-preview/` folder
     that never goes live — purely for you to check.
3. Open `http://localhost:8765/blog-preview/mijn-nieuwe-post.html` in your
   browser and read it over.
4. If something looks wrong, edit the `.md` file and just run the command
   in step 2 again — it overwrites the preview each time.

## 3. Publish it for real

1. Open your post's `.md` file and change `draft: true` to `draft: false`.
2. Run: `node build-blog.js` (without `--preview` this time).
   - You'll see a line like `Built 1 published post(s), 0 draft(s) skipped.`
     — if the number of published posts didn't go up by one, something's
     wrong; re-check the frontmatter (see "If something fails" below).
   - This also regenerates `blog/index.html` (the post list),
     `sitemap.xml`, and `blog/feed.xml` automatically — you never edit
     those by hand.
3. Deploy, same as any other change to this site:
   - `git add content/blog/mijn-nieuwe-post.md blog/ sitemap.xml`
   - `git commit -m "Add blog post: <title>"`
   - `git push origin master`
   - SSH into the production server and `git pull origin master` in the
     app's folder (see CLAUDE.md's "Deploying to production" section for
     the exact SSH command — this part doesn't change for a blog post).
   - If the CSS or JS was also touched, bump the `?v=` cache-busting number
     on every page per CLAUDE.md's cache-busting rule — a plain new blog
     post normally does NOT touch CSS/JS, so this step is usually
     unnecessary.
4. Once live, ask for the new post's URL to be submitted for indexing in
   Google Search Console (not something this project can automate).

## If something fails

The build script fails loudly and tells you exactly what's wrong rather than
silently publishing a broken page — for example:

```
Error: mijn-nieuwe-post.md: missing required field "description"
```

Fix the named field in that file and run the command again. Nothing gets
written until every post in `content/blog/` parses cleanly.

## Images

Put post images in `assets/` (same folder the rest of the site uses) and
reference them in the post body with standard Markdown:
`![Beschrijving in het Nederlands](assets/mijn-afbeelding.png)`. There is no
separate image pipeline — same as every other image on this site.
