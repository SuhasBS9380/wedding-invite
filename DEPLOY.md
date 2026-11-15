# Putting the invitation online (Netlify)

The site is a plain static build: `npm run build` writes everything the browser needs into `dist/`
(HTML, CSS, JS, images, music and the Kannada webfonts). Netlify only has to serve that folder.

Ready-made settings live in `netlify.toml`:

- build command `npm run build`, publish directory `dist`
- Node 22 for the build
- single-page redirect (`/*` → `/index.html`)
- `public/_headers` gives the page a no-cache rule and the hashed fonts/scripts a one-year cache

---

## Option 1 — Netlify Drop (2 minutes, no account setup)

1. Build the site on your computer:

   ```powershell
   npm install
   npm run build
   ```

   This creates the `dist` folder.

2. Open <https://app.netlify.com/drop> and drag the **`dist`** folder onto the page
   (drag the folder itself, not the files inside it).

3. Netlify gives the site a temporary name like `dreamy-pastry-1a2b3c.netlify.app`.
   You can rename it under **Site configuration → Site details → Change site name**.

4. **After renaming, build once more** so the link-preview tags point at the new address:

   ```powershell
   $env:URL = "https://your-new-name.netlify.app"
   npm run build
   ```

   then drag `dist` onto the site again (Deploys → drag and drop).

Why step 4: `index.html` contains `%SITE_URL%` placeholders for the WhatsApp/Instagram preview
(title, image, url). They are filled at build time from Netlify's `URL` variable; drop-deploys
upload a pre-built folder, so the value has to be set on your machine. Inside Netlify's own
build (Option 2) it is filled in automatically.

---

## Option 2 — GitHub + Netlify (recommended: every push publishes)

Netlify builds the site itself, so the share links always use the right address.

### a. Put the project on GitHub

The folder is not a git repository yet:

```powershell
git init
git add .
git commit -m "Darshan & Nisarga wedding invitation"
```

Create an empty repository on <https://github.com/new> (no README, no .gitignore — they already
exist here), then:

```powershell
git remote add origin https://github.com/<your-account>/<repo-name>.git
git branch -M main
git push -u origin main
```

`.gitignore` already keeps `node_modules` and `dist` out of the repository.

### b. Connect it in Netlify

1. <https://app.netlify.com> → **Add new site → Import an existing project**.
2. Choose **GitHub**, authorise it, pick the repository.
3. Netlify reads `netlify.toml`; the build command and publish directory are already correct.
   Press **Deploy**.
4. First deploy takes about a minute. The site is live at `https://<name>.netlify.app`.
5. Rename it under **Site configuration → Site details → Change site name** if you want a nicer
   address, then hit **Deploys → Trigger deploy → Deploy site** once so the preview tags pick up
   the new name.

From then on: `git push` → Netlify rebuilds and publishes automatically.

---

## Option 3 — Netlify CLI (no GitHub)

```powershell
npm install -g netlify-cli
netlify login
netlify init          # create a new site, or link an existing one
netlify deploy --prod --dir dist
```

(`netlify build` first, or `npm run build`, to produce `dist`.) With this route the preview tags
are also built locally, so if the site already has its final name, run one deploy from Netlify
itself (Deploys → Trigger deploy) to fill them in automatically.

---

## Vercel (also works, same repository)

The project is host-agnostic: Vite builds `dist`, and `vite.config.ts` reads Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL` as well as Netlify's `URL`, so the link-preview tags
are correct on both. `netlify.toml` and `public/_headers` are simply ignored by Vercel.

**"The repository couldn't be found"** on Vercel means the Vercel GitHub App has not been given
access to this repository — not a typo:

1. Open <https://github.com/apps/vercel> → **Configure** (next to the SuhasBS9380 account).
2. Under **Repository access**, choose *Only select repositories* → add **`wedding-invite`**
   (or switch to *All repositories*), then **Save**.
3. Back on Vercel's *Import Git Repository* screen, click **Adjust GitHub App Permissions** (or
   reload the page) — `wedding-invite` now appears.
4. Make sure the Vercel account is signed in with the **SuhasBS9380** GitHub account.

Import settings:

| Field | Value |
| --- | --- |
| Framework preset | Vite (auto-detected) |
| Root directory | `./` (leave empty) |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |
| Node.js version | 22.x (Project Settings → General, if it defaults to an older one) |
| Environment variables | none |

Then **Deploy**. Every `git push` to `main` redeploys, exactly as with Netlify.

---

## After the deploy — a 60-second check

- [ ] the cloud screen opens on a tap; the music button appears bottom left
- [ ] the round **ಕ / E** button appears bottom right and switches the whole invitation
- [ ] in Kannada the two banners at the venue scene still sit inside the maroon cloth
- [ ] the venue QR opens Google Maps
- [ ] send the link to yourself on WhatsApp and check the preview image
      (if it shows an old preview, WhatsApp caches it — test with a `?v=2` at the end of the URL)

## Custom domain later

Add it under **Domain management → Add a domain**. Netlify then sets `URL` to the custom domain,
so the next deploy rewrites the preview tags automatically. No code change needed.

## What to edit later

| What | Where |
| --- | --- |
| English wording, dates, venue, phone | `src/data/invite.ts` |
| Kannada wording | `src/data/inviteKn.ts` |
| The ಕ / E button labels | `src/i18n/lang.ts` (`UI`) |
| Photos, music, QR code | `public/assets/` |
| Colours, fonts, sizes | `src/styles/*.css` |

Both language files must keep the same shape: `inviteKn.ts` is typed as `Invite` (the type of
`invite.ts`), so the build fails if a field is missing.
