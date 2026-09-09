# THE.LUMENCODE — Command Reference

Run everything from the `portfolio/` folder. The live site deploys automatically
from the `main` branch to **https://atharvagoyal.com**.

---

## Everyday
| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server at http://localhost:3000 (auto-runs `og` first). |
| `npm run build` | Production build (auto-runs `og` first). |
| `npm run start` | Serve an existing production build locally. |
| `npm run typecheck` | TypeScript check only (`tsc --noEmit`). |
| `npm run lint` | ESLint check only. |
| `npm run check` | `lint` + `typecheck` + `build` all in one. |

## Portfolio photos (R2 + lumen-cdn worker)
Portfolio images live in `public/images/<CATEGORY>/<PROJECT>/` and are served from
Cloudflare R2 through the `lumen-cdn` worker (`lumen-cdn.lumen-cdn.workers.dev`).

| Command | What it does |
| --- | --- |
| `npm run uploads:portfolio` | Upload originals + 1600px WebP previews to R2, extract EXIF, generate blur placeholders, and write `src/data/image-manifest.json`. |
| `npm run audit` | Report: counts per category/project, photos on disk still unindexed, duplicate filenames. |
| `node scripts/suggest.mjs` | Suggest a project for each photo sitting in `public/images/unsorted/`. |
| `npm run verify` | Check the manifest + fetch every image URL to confirm it serves. |

Workflow: drop photos into `public/images/<CATEGORY>/<PROJECT>/` → `npm run uploads:portfolio`
to upload + re-index → `npm run audit` to confirm → commit the manifest. New categories are
picked up automatically (folder name → slug + label).

## OG image
| Command | What it does |
| --- | --- |
| `npm run og` | Regenerate `public/og.jpg` (1200×630) from the first image in the manifest. |

## Client galleries (Cloudflare R2)
Drop each shoot's photos in its own folder: `deliverables/<slug>/`.

| Command | What it does |
| --- | --- |
| `npm run uploads:r2 -- <slug>` | Upload originals + WebP previews to R2, write `content/galleries/<slug>/gallery.json`, print the password, and add/update the client's card in `deliverables/clients.html`. |
| `npm run uploads:r2 -- <slug> --refresh` | Same, but **no upload** — just re-syncs the tracker card from the existing `gallery.json` (e.g. to flip status / add notes later). |
| `npm run uploads:r2 -- <slug> --client "Name" --email x@y.com --phone 555-0100 --status delivered --notes "…"` | Set client fields at upload time. |

Notes:
- After uploading it **prompts** for client name / email / phone / status / notes — press
  Enter to leave a field unchanged. Values already in the card are reused on re-runs.
- Status choices: `Upcoming`, `Delivered`, `Archived`.
- The password is auto-generated (`LUMEN-XXXX…`) once and kept on re-runs.
- **`deliverables/clients.html`** is the client tracker — open it in a browser (one card per
  client: link, password, contact, status, notes). It is git-ignored — keep it private.
- After upload, edit `content/galleries/<slug>/gallery.json` to set the title, category,
  location, `featured`, `download`, `expires`. Commit `content/galleries/<slug>/` to deploy
  the gallery to the site.

Full walkthrough:

```
mkdir deliverables/jane-grad
# copy jane's photos into deliverables/jane-grad/
npm run uploads:r2 -- jane-grad --client "Jane Doe" --email jane@x.com
# edit title/category/location in content/galleries/jane-grad/gallery.json
git add content/galleries/jane-grad && git commit -m "gallery: jane-grad" && git push
# send client: https://atharvagoyal.com/gallery/jane-grad + password
# later, after the session:  npm run uploads:r2 -- jane-grad --refresh --status delivered
```

## Git / deploy
```
git add <files>
git commit -m "message"
git push origin main        # Vercel builds & deploys automatically
```
Vercel dashboard: https://vercel.com — Cloudflare R2: https://dash.cloudflare.com.

## Environment (`.env.local`, git-ignored)
| Var | Where from |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Live `https://atharvagoyal.com` (also in Vercel env). |
| `GALLERY_SECRET` | Random string signing gallery unlock cookies (`openssl rand -hex 32`). |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET` | Cloudflare R2 (also set in Vercel Production/Preview; the `lumen-cdn` worker gets its own copies via `wrangler secret put`). |

## lumen-cdn worker (Cloudflare)
```
cd workers/cdn-worker
wrangler secret put R2_ACCOUNT_ID        # one-time, values never committed
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put R2_BUCKET_NAME
wrangler deploy
```

## Other endpoints
Formspree: `https://formspree.io/f/xjyvwgaw` (contact form). Calendly:
`https://calendly.com/projects-executable/photography-session` (30-min consult). All config
lives in `lib/site.ts`.