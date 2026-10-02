# Old  Voices

Build ReEngage Voices, a sub-site of ReEngage Africa hosting African heritage stories and lived experiences. Final domain will be voices.reengageafrica.com.

Brand relationship: Inherit the warm, earth-toned, editorial feel of reengageafrica.com (terracotta, deep forest, cream, deep ink) but lean more cinematic and archival — think a digital storytelling magazine meets oral-history archive. Distinct identity, clearly part of the same family.

Content types (all four required):

Video stories — embedded player with poster image, transcript, chapters

Audio / podcast episodes — custom player with waveform and episode notes

PDF essays — inline reader + download, pull-quotes

Photo essays — image-led narrative with captions and credits

CMS: Use Lovable Cloud. Build an admin area (email + password auth, role-based) where editors can create/edit/publish stories, set cover image, tags, region (Abuja / Accra / Nairobi or country), contributor, and paste media URLs.

Media: Use placeholder URLs for now. Each story has a media_url text field that will later point to AWS S3 — design the schema so swapping from Drive/placeholders to signed S3 URLs is a one-field change.

Pages: Home (hero featured story + curated rails by theme), Stories index (filter by format, theme, region), Story detail (immersive reader template per format), Contributors, About, Submit your story.

SEO: Per-story OG images, JSON-LD Article schema, sitemap.

Reference (rough, please make it richer): https://reengage-voices.vercel.app/

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://voicesreengageafrica.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce1d5e74-b95c-4537-bf66-31723dbb004f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
