import { access, readFile } from "node:fs/promises";
import { strict as assert } from "node:assert";

const requiredAssets = [
  "public/images/hero-pink-tablescape.jpg",
  "public/images/the-girls.png",
  "public/images/the-girls-stickers.png",
  "public/images/pink-raspberry-cake.jpg",
  "public/images/pink-bouquet-macro.jpg",
  "public/images/garden-party-table.jpg",
  "public/og.png",
];

await Promise.all(requiredAssets.map((asset) => access(asset)));

const eventSource = await readFile("src/data/event.ts", "utf8");
const experienceSource = await readFile("components/experience.tsx", "utf8");
const formsSource = await readFile("components/forms.tsx", "utf8");
const styleSource = await readFile("app/globals.css", "utf8");

assert.match(eventSource, /2026-09-15/, "Event date must remain 15 September 2026");
assert.match(experienceSource, /SatinCanvas/, "WebGL layer must be present");
assert.match(formsSource, /Seal my RSVP/, "RSVP flow must be present");
assert.match(styleSource, /the-girls-stickers/, "Sticker experience must be present");

console.log("Smoke checks passed: date, WebGL, RSVP, sticker experience, and required assets.");
