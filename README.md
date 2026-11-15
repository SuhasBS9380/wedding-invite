# Darshan & Nisarga — wedding invitation

A single-page, scroll-story wedding invitation (React + TypeScript + Vite) with a full English ⇄ Kannada
switch. Everything the browser needs is static, so it can be hosted anywhere; the deploy steps for
Netlify are in **[DEPLOY.md](DEPLOY.md)**.

## Run it

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the built site
npm run lint       # oxlint
```

## How the two languages work

- `src/data/invite.ts` — the English copy (single source of truth), plus the `Invite` type.
- `src/data/inviteKn.ts` — the Kannada copy, typed `Invite`, so both files must stay in step.
- `src/i18n/lang.ts` — the interface words (`UI`) for both languages.
- `src/i18n/LangProvider.tsx` — owns the current language, remembers it (`localStorage: invite-lang`),
  keeps `<html lang>` and the page title in sync.
- Every section reads `{ invite, t }` from `useLang()`.
- `src/components/LangToggle.tsx` — the round **ಕ / E** button, bottom right (the music button is bottom left).
- `src/styles/lang.css` — the button and the Kannada typography overrides
  (`html[lang="kn"]`), using the self-hosted Noto Serif Kannada webfonts.

Kannada names are rendered as one cluster, not letter by letter, so the glyphs are never split; the CSS
also re-shows the fresh name spans after a language switch (their one-off reveal animation has already run).

## Editing content

| What | Where |
| --- | --- |
| Names, parents, blessings, dates, venue, phone, music | `src/data/invite.ts` |
| Kannada wording | `src/data/inviteKn.ts` |
| Button/hint labels | `src/i18n/lang.ts` |
| Images, QR code, music | `public/assets/` |
| Layout, colours, type sizes | `src/styles/*.css` |

Countdown targets live in `weddingStart` / `weddingEnd` (IST) in both data files.

## Hosting notes

- `index.html` has `%SITE_URL%` placeholders for the link-preview tags (WhatsApp, Instagram, …). A small
  Vite plugin (`vite.config.ts`) fills them from Netlify's `URL` / `DEPLOY_PRIME_URL` at build time and
  uses `http://localhost:5173` when building locally.
- `netlify.toml` holds the build command, publish directory, Node version and the SPA redirect.
- `public/_headers` sets the cache rules (page: revalidate, hashed assets/fonts: one year).
- `?auto=0` in the URL disables the automatic scroll, `?auto=1` forces it on.
