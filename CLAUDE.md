# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog and profile site built on the Tailwind Next.js Starter Blog template (Next.js 15 App Router, React 19, TypeScript, Tailwind 3, MDX via `contentlayer2` + `pliny`). Deployed to Vercel (`iad1`) at `blog.context0.ai`.

## Development Commands

```bash
npm install           # install deps (npm only — see lint-staged note below)
npm run dev           # dev server (alias: `npm start` — both run `next dev`)
npm run build         # contentlayer build + next build + scripts/postbuild.mjs (RSS, etc.)
npm run serve         # production server (this is `next start`, NOT `npm start`)
npm run lint          # next lint --fix on pages/app/components/lib/layouts/scripts
npm run analyze       # ANALYZE=true next build — bundle analyzer report
```

There is no `typecheck` or `format` script. Run `npx tsc --noEmit` for type checking and `npx prettier --write <path>` for formatting. Husky's pre-commit hook runs lint-staged, which calls `npm run lint` and `npx prettier --write` on staged files.

## Architecture

### Content pipeline (this is the load-bearing part)

`contentlayer.config.ts` is the source of truth for how MDX becomes data:

- **Document types**: `Blog` (`data/blog/**/*.mdx`) and `Authors` (`data/authors/**/*.mdx`). Blog frontmatter supports `layout` (selects a file from `/layouts`), `bibliography` (resolved against `data/`), `draft`, `images`, `tags`, etc.
- **Computed fields** added to every doc: `readingTime`, `slug`, `path`, `filePath`, `toc`, plus `structuredData` (JSON-LD) for blogs.
- **Build side effects** (run on every contentlayer build, including `npm run dev`):
  - `createTagCount` writes `app/tag-data.json` — this file is generated, do not edit by hand.
  - `createSearchIndex` writes `public/search.json` (path comes from `siteMetadata.search.kbarConfig.searchDocumentsPath`) for the KBar command palette.
- **MDX plugins**: remark (gfm, math, code titles, github alerts, image-to-jsx, frontmatter extraction) + rehype (slug, autolink headings with a custom heroicon, katex, citations, prism-plus, minify). Adding a plugin means editing this file.

After `next build`, `scripts/postbuild.mjs` runs (`rss.mjs` is invoked from there) to generate the RSS feed.

### Layouts vs. components vs. pages

- `/app` — App Router routes. Pages typically pull MDX via contentlayer's `allBlogs`/`allAuthors`, then hand the doc to a layout.
- `/layouts` — Page-level templates (`PostLayout`, `PostSimple`, `PostBanner`, `ListLayout`, `ListLayoutWithTags`, `AuthorLayout`). A blog post's `layout: PostBanner` frontmatter selects which one renders it. To add a new layout, drop a `.tsx` file here and reference it by filename in frontmatter.
- `/components` — Reusable UI (Header, Footer, MDX components, Tag, ThemeSwitch, etc.). `MDXComponents.tsx` is the registry of components available inside MDX content.
- `/data` — Site config (`siteMetadata.js`), nav (`headerNavLinks.ts`), projects (`projectsData.ts`), bibliography (`references-data.bib`), and content (`blog/`, `authors/`).
- `/css` — global Tailwind layers and prism theme.

### Configuration surfaces

- `data/siteMetadata.js` — title, author, URLs, analytics provider, comments provider, newsletter provider, search provider. Most "where do I configure X" questions answer here.
- `next.config.js` — strict CSP (allows giscus + umami; tighten/expand here if adding third-party scripts), security headers, SVG-as-component via `@svgr/webpack`, contentlayer + bundle-analyzer plugins. `EXPORT`, `BASE_PATH`, `UNOPTIMIZED` env vars switch the build into static-export mode.
- `vercel.json` — pins region `iad1`, sets `NEXT_PUBLIC_BASE_URL`, layers a second set of security headers on top of `next.config.js`.
- `.env.example` — Giscus, Mailchimp/Buttondown/ConvertKit/Klaviyo/EmailOctopus/Beehiiv newsletter keys. Only the providers selected in `siteMetadata.js` are actually used at runtime.

## Adding content

### New blog post

Create `data/blog/<slug>.mdx`:

```mdx
---
title: 'Post Title'
date: '2026-05-10'
tags: ['tag1', 'tag2']
draft: false
summary: 'One-line summary used for SEO and listings.'
layout: PostLayout # optional — one of /layouts/Post*.tsx
---
```

Tag pages and the search index regenerate automatically on the next dev/build.

### Profile page

The `/profile` route is custom (not derived from MDX). Edit `app/profile/page.tsx` directly. The `/about` route, by contrast, renders `data/authors/default.mdx` through `AuthorLayout`.
