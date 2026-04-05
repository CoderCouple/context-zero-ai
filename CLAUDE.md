# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog and profile website built using the Tailwind Next.js Starter Blog template. It combines blogging functionality with a comprehensive profile/portfolio page.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Content**: MDX for blog posts
- **Content Management**: Contentlayer
- **Search**: KBar
- **Comments**: Giscus (configurable)
- **Analytics**: Umami (configurable)

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run typecheck

# Format code
npm run format
```

## Project Architecture

### Key Directories

- `/app` - Next.js App Router pages and layouts
  - `/blog` - Blog listing and post pages
  - `/profile` - Custom profile/portfolio page
  - `/about` - About page using author MDX content
  - `/projects` - Projects showcase page
  - `/tags` - Tag-based blog filtering
- `/components` - Reusable React components
- `/layouts` - Page layout templates
- `/data` - Site configuration and static data
  - `siteMetadata.js` - Main site configuration
  - `headerNavLinks.ts` - Navigation menu items
  - `/blog` - Blog post MDX files
  - `/authors` - Author profile MDX files
- `/public` - Static assets
- `/css` - Global styles and Tailwind configuration

### Content Management

Blog posts are written in MDX format and stored in `/data/blog/`. Each post supports:
- Frontmatter metadata (title, date, tags, summary)
- MDX components for rich content
- Code syntax highlighting
- Images and other media

Author information is stored in `/data/authors/` as MDX files.

### Key Features

1. **Blog System**: Full-featured blog with tags, search, and pagination
2. **Profile Page**: Custom profile page at `/profile` showcasing:
   - Personal information
   - Skills
   - Experience
   - Projects
   - Contact information
3. **Dark Mode**: System-based or manual theme switching
4. **SEO Optimized**: Built-in metadata generation and sitemap
5. **Search**: KBar command palette for quick navigation
6. **Comments**: Giscus integration for blog comments
7. **Analytics**: Support for various analytics providers

## Configuration

Main configuration is in `/data/siteMetadata.js`:
- Update site title, author, and social links
- Configure analytics and comment providers
- Set newsletter provider

## Adding Content

### New Blog Post
Create a new MDX file in `/data/blog/`:
```mdx
---
title: 'Post Title'
date: '2024-03-22'
tags: ['tag1', 'tag2']
draft: false
summary: 'Post summary'
---

Post content here...
```

### Update Profile
- Edit `/app/profile/page.tsx` for profile page structure
- Update `/data/authors/default.mdx` for author bio
- Modify skills, experience, and projects in the profile component

## Environment Variables

Create `.env.local` for:
- Analytics IDs
- Comment system tokens
- Newsletter API keys

See `.env.example` for required variables.