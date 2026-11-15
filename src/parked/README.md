# Parked sections

These sections are disconnected from the page (not imported in `src/App.tsx`) but kept for later:

- `Story.tsx` – "Our Story" in the small arch card (uses `components/ArchCard.tsx`)
- `Countdown.tsx` – live countdown (uses `hooks/useCountdown.ts`, `anim/countdown.ts`)
- `Rsvp.tsx` – WhatsApp / call card

Their styles are still in `src/styles/sections.css`. To bring one back, import it in `src/App.tsx`
from `./parked/<Name>` and add it after `<Scene />`.
