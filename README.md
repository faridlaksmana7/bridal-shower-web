# Pinky Promise

A mobile-first, interactive bridal shower invitation for 15 September 2026, built with Next.js/Vinext, TypeScript, Lenis, Motion, React Three Fiber, and local optimized photography.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Build

```bash
npm run build
```

## Customize

Edit `src/data/event.ts` to change the bride name, hosts, time, venue, map, RSVP deadline, WhatsApp number, or wishlist. Guest names can be personalized with `?to=Nama%20Tamu`.

When the time and venue are still empty, the interface intentionally shows polished “segera diumumkan” copy and creates an all-day calendar event. RSVP and love notes run in honest device-local demo mode using `localStorage`.

Replace images in `public/images` while keeping the filenames, or update the image paths in `src/data/event.ts` and `components/experience.tsx`. Original source details are recorded in `ASSET_CREDITS.md`.
