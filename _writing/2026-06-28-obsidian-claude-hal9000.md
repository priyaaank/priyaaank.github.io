---
title: "HAL 9000 - An Obsidian and Claude Co-Pilot"
date: 2026-06-28
slug: obsidian-claude-hal9000
tags: [productivity, claude, obsidian, planning]
description: Blending Obsidian and Claude into a small set of skills that plan my day, organize my notes, and surface follow-ups - all from plain markdown.
---

I take a lot of notes and I obsess about planning. I have cycled through apps the way people cycle through t-shirts (_Evernote, Joplin, Notion, Bear, you name it_). I was a Notion loyalist for a while, and even tried [Zettelkasten](https://zettelkasten.de/overview/), though I found it far too exhaustive for my needs. The problem with Notion was that it locked my data in. So I went back to basics: plain `.md` files, an open format I can carry anywhere, with Obsidian on top. The one thing I missed was Notion's planning features. That is where Claude stepped in.

So I built [HAL 9000](https://github.com/priyaaank/hal9000), a small bundle of Claude Code skills that sit on top of my Obsidian vault. Nothing exotic. Plain markdown, a handful of folders, and a co-pilot that knows my mental model and conventions.

## The idea

Most note systems fail at the seams. Capture is easy. What kills you is everything after - filing, planning, remembering who you owe a reply to. HAL handles that layer.

The trick is a single master context file in the vault. Every skill reads from it instead of hardcoding rules. Change the convention once, and all skills follow. No drift, no duplicated logic.

## What it does

**Plan the day.** One command generates today's planner, carries forward every pending todo, archives the old planners, and sorts tasks into an [Eisenhower](https://fs.blog/eisenhower-matrix/) grid split across Work and Personal. Nothing falls through, and it quietly collects metadata on tasks and habits along the way.

**Add a todo.** I describe something in plain language. It lands in the right day, quadrant, and bucket, with a sensible due date inferred.

**Organize from staging.** Raw captures pile up in a Staging folder all day. The organize skill reads them, rewords the mess into crisp bullets, adds YAML and tags, names the file by convention, and files it. Anything genuinely ambiguous stays put with a flag rather than being misfiled.

**Surface follow-ups.** It sweeps the whole vault - todos, meeting notes, feedback notes - and groups every open loop by person, keeping light metadata on the people I know. Stale follow-ups get flagged as relationship risk, which is exactly the nudge I need.

**Review my habits.** This one coaches. It reads planner history and metadata to spot procrastination patterns and quadrant imbalances, then checks whether I acted on its *last* round of advice. Recommendations are saved with a status, so the next review can measure follow-through. This is my favourite bit. It surfaces hidden patterns I would never catch myself and pushes me toward small behaviour changes that actually stick.

The structure underneath is deliberately boring. A Staging area for inbox, a DailyPlanner folder, topic folders for filed notes, tags for discovery. Client meetings, internal discussions, and open-ended thinking each get a shape so they are easy to find later.

## Why this works

It preserves history rather than deleting it. It archives instead of overwriting. It asks before bulk changes and respects my voice when it rewrites. The intelligence lives in the skills, the data stays in portable markdown I fully own.

If you live in Obsidian and want to fold Claude into it, the skills are here: [github.com/priyaaank/hal9000](https://github.com/priyaaank/hal9000). Clone it, point it at your vault's conventions, and make it yours.
