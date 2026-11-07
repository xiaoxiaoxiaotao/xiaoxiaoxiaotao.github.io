# Songtao Li — personal site

Static personal site for [www.lisongtao.eu.org](https://www.lisongtao.eu.org/), built with [Astro](https://astro.build/) and deployed to GitHub Pages.

Visible copy lives in `src/pages/`. Publications are rendered from `posts/publications.json`. Paper titles link to `https://doi.org/…` when the DOI matches the existing pattern, and the name **Songtao Li** is bold in the author line.

## Build

```bash
npm ci
npm run build
npm run check
```

`npm run build` writes the static site to `dist/` (`output: 'static'`). `public/CNAME` is copied through so the custom domain stays `www.lisongtao.eu.org`.

Preview the build locally:

```bash
npm run preview
```

Development server:

```bash
npm run dev
```

## Routes

| Page | URL |
| --- | --- |
| Home | `/` |
| Publications | `/publications/` |
| Blog | `/blog/` |
| About | `/about/` |

Old hash URLs still open the right page. A small inline script redirects:

- `/#home` → `/`
- `/#publications` → `/publications/`
- `/#blog` → `/blog/`
- `/#about` → `/about/`

`sitemap.xml` lists the path URLs, not the hashes.

## Edit content

- Home, about, blog index, and the 404 page: `src/pages/`
- Navigation labels: `src/components/Navbar.astro`
- Publications: `posts/publications.json` (do not hand-write the cards)
- Blog posts: `src/content/blog/*.md`. The filename is the URL slug (`note.md` → `/blog/note/`). There are no posts yet; the index shows an empty state until one is added. Drafts (`draft: true`) are omitted. A post starts with `title`, `description`, and `date` in front matter.
- Colors, type, and layout: `src/styles/styles.css`
- Portrait and icons: `public/images/`
- SEO description and JSON-LD: `src/lib/jsonld.ts` and `src/layouts/BaseLayout.astro`

Publication entries keep the same fields as before (`title`, `authors`, `doi`, and the rest). Only the title and authors are shown on the page.

## Deploy (GitHub Pages)

This repository is a user site. Pages must publish the **built** `dist/` directory, not the Astro source on `main`.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**. Do not switch it back to **Deploy from a branch** at the repository root. That publishes the Astro source instead of the built site.
3. Merge to `main`. The workflow `.github/workflows/pages.yml` runs `npm ci`, `npm run build`, checks the output, and deploys `dist/`.
4. Leave `public/CNAME` as `www.lisongtao.eu.org`. The custom domain setting should stay on that host.

Pull requests only build and check. They do not deploy.
