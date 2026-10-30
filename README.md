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
| About | `/about/` |

Old hash URLs still open the right page. A small inline script redirects:

- `/#home` → `/`
- `/#publications` → `/publications/`
- `/#about` → `/about/`

`sitemap.xml` lists the path URLs, not the hashes.

## Edit content

- Home, about, and the 404 page: `src/pages/`
- Navigation labels: `src/components/Navbar.astro`
- Publications: `posts/publications.json` (do not hand-write the cards)
- Colors, type, and layout: `src/styles/styles.css`
- Portrait and icons: `public/images/`
- SEO description and JSON-LD: `src/lib/jsonld.ts` and `src/layouts/BaseLayout.astro`

Publication entries keep the same fields as before (`title`, `authors`, `doi`, and the rest). Only the title and authors are shown on the page.

## Deploy (GitHub Pages)

This repository is a user site. Pages must publish the **built** `dist/` directory, not the Astro source on `main`.

1. In the repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Merge to `main`. The workflow `.github/workflows/pages.yml` runs `npm ci`, `npm run build`, checks the output, and deploys `dist/`.
4. Leave `public/CNAME` as `www.lisongtao.eu.org`. The custom domain setting should stay on that host.

Pull requests only build and check. They do not deploy.

## 构建与部署

```bash
npm ci
npm run build    # 静态文件输出到 dist/
npm run preview  # 本地预览构建结果
```

合并到 `main` 后，GitHub Actions 会把 `dist/` 部署到 GitHub Pages。仓库 **Settings → Pages** 的 Source 需要选 **GitHub Actions**（不要再从分支根目录直接发布，否则会发布 Astro 源码而不是站点）。自定义域名仍由 `public/CNAME`（`www.lisongtao.eu.org`）保持。
