# priyaaank.com

Personal site, built with Jekyll. Every piece of content lives in a
markdown or YAML file; templates only hold structure.

## Where content lives

| File or folder                  | What it controls                                     |
|---------------------------------|------------------------------------------------------|
| [index.md](index.md)            | Homepage hero — H1 + bio paragraphs                  |
| [_data/profile.yml](_data/profile.yml)         | Name, role, initials/photo, resume link    |
| [_data/nav.yml](_data/nav.yml)                 | Sidebar primary navigation                 |
| [_data/currently.yml](_data/currently.yml)     | "Currently" stripe on the homepage         |
| [_data/sections.yml](_data/sections.yml)       | The three homepage cards                   |
| [_data/milestones.yml](_data/milestones.yml)   | Right-column timeline (years + events)     |
| [_data/elsewhere.yml](_data/elsewhere.yml)     | Homepage contact pills                     |
| [_data/socials.yml](_data/socials.yml)         | Sidebar bottom icons                       |
| [_data/home.yml](_data/home.yml)               | Section headings, footer note, etc.        |
| [_writing/](_writing/)          | Tech blog posts — one `.md` per article              |
| [_health/](_health/)            | Health experiments — one `.md` per write-up          |
| [_pages/about.md](_pages/about.md) | About page                                        |
| [_pages/writing-index.md](_pages/writing-index.md) and [health-index.md](_pages/health-index.md) | Section listing pages |

## Where the visual layer lives

| File or folder                                 | What it does                          |
|------------------------------------------------|---------------------------------------|
| [assets/css/site.css](assets/css/site.css)     | All styles (dual-tone, mobile-aware)  |
| [_layouts/default.html](_layouts/default.html) | Sidebar + main wrapper                |
| [_layouts/home.html](_layouts/home.html)       | Homepage (sidebar + main + timeline)  |
| [_layouts/page.html](_layouts/page.html)       | Static pages like About               |
| [_layouts/post.html](_layouts/post.html)       | Individual blog post                  |
| [_layouts/section-index.html](_layouts/section-index.html) | Generic collection listing |
| [_includes/sidebar.html](_includes/sidebar.html) | Left vertical nav                   |
| [_includes/timeline.html](_includes/timeline.html) | Right column milestone timeline   |
| [_includes/icon.html](_includes/icon.html)     | All inline SVG icons, looked up by name |
| [_includes/head.html](_includes/head.html), [page-footer.html](_includes/page-footer.html) | Shared chrome |

Content files never contain markup beyond what markdown gives you.
Templates never contain copy beyond unavoidable scaffolding.

## Adding things

**A new tech-writing post** — drop a markdown file in [_writing/](_writing/):

```yaml
---
title: "Some title"
date: 2026-05-26
slug: some-title
tags: [tech, architecture]          # any strings; first one usually a category
excerpt_short: One-line teaser shown on the index page.
---

Body in markdown.
```

Tags drive the filter chips on `/writing/`. The convention I use:

- `tech` for technical posts (architecture, tools, languages, craft)
- `essay`, `book`, `life` for non-technical writing

You can add any other tag; new tags automatically appear as filter chips
with a count, sorted alphabetically. No code changes needed.

To turn off the filter UI on a section, remove `show_tag_filter: true`
from the section's index page front matter (e.g.
[_pages/writing-index.md](_pages/writing-index.md)).

Same file shape for health write-ups under [_health/](_health/) — no
filter there by default.

**A new milestone on the timeline** — add an entry to
[_data/milestones.yml](_data/milestones.yml). New years go at the top.

**Change a homepage card** — edit
[_data/sections.yml](_data/sections.yml). To use a new icon, add a
`{% when "name" %}` branch to [_includes/icon.html](_includes/icon.html).

**Swap initials for a photo** — drop the image at `/assets/avatar.jpg`
and uncomment the `avatar:` line in
[_data/profile.yml](_data/profile.yml).

## Running locally

### With Docker (recommended — no Ruby on host)

```bash
docker compose up --build
```

Site at <http://localhost:4000>. Edits to markdown, YAML, layouts, and
CSS are picked up live (LiveReload is on).

- After **adding a new gem** to the `Gemfile`, rebuild the image:
  `docker compose up --build`
- To drop the container and image: `docker compose down`

### With a local Ruby install

```bash
bundle install
bundle exec jekyll serve
```

Site at <http://localhost:4000>.
