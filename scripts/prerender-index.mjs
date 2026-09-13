#!/usr/bin/env node
/**
 * prerender-index.mjs
 * Pre-renders the root "/" route into dist/client/index.html
 * for Cloudflare Pages static hosting.
 *
 * Starts the wrangler SSR server, fetches the rendered HTML,
 * saves it to dist/client/index.html, then exits.
 */

import { spawn } from "child_process";
import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "dist", "client", "index.html");
const wranglerConfig = path.join(root, "dist", "server", "wrangler.json");

// Pick a free port
const PORT = 18765;

console.log("🔨 Pre-rendering index.html for Cloudflare Pages...");

// Start wrangler SSR dev server briefly
const proc = spawn(
  "node",
  [
    "--import",
    "./scripts/sites-env.mjs",
    "./node_modules/wrangler/bin/wrangler.js",
    "dev",
    "--config",
    wranglerConfig,
    "--local",
    "--persist-to",
    ".wrangler/state",
    "--ip",
    "127.0.0.1",
    "--port",
    String(PORT),
    "--inspector-port",
    "0",
  ],
  {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  }
);

let output = "";
proc.stdout.on("data", (d) => { output += d.toString(); });
proc.stderr.on("data", (d) => { output += d.toString(); });

// Poll until wrangler is ready, then fetch
const MAX_WAIT_MS = 30_000;
const POLL_INTERVAL = 500;
let elapsed = 0;

async function fetchAndSave() {
  const url = `http://127.0.0.1:${PORT}/`;
  const res = await fetch(url, {
    headers: { Accept: "text/html" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let html = await res.text();
  
  // Fix font paths: replace any absolute local filesystem paths with /_next/static/...
  // (dev server embeds local paths, production build should have correct paths)
  html = html.replace(
    /src: url\(\/Users\/[^)]+\/\.vinext\/fonts\/([^/]+\/[^)]+)\) format\('woff2'\)/g,
    "src: url(/_next/static/_vinext_fonts/$1) format('woff2')"
  );
  html = html.replace(
    /href="\/Users\/[^"]+\/\.vinext\/fonts\/([^"]+)"/g,
    'href="/_next/static/_vinext_fonts/$1"'
  );
  
  writeFileSync(outPath, html, "utf8");
  console.log(`✅ Saved pre-rendered HTML to dist/client/index.html (${html.length} bytes)`);
}

const interval = setInterval(async () => {
  elapsed += POLL_INTERVAL;
  
  // Check if server output indicates it's ready
  const ready =
    output.includes("Ready on") ||
    output.includes("Listening on") ||
    output.includes("started");

  if (ready || elapsed >= MAX_WAIT_MS) {
    clearInterval(interval);
    
    // Give it one more moment to bind
    await new Promise((r) => setTimeout(r, 800));

    try {
      await fetchAndSave();
    } catch (e) {
      // Try once more after a brief pause
      await new Promise((r) => setTimeout(r, 1500));
      try {
        await fetchAndSave();
      } catch (e2) {
        console.error("❌ Failed to fetch pre-rendered HTML:", e2.message);
        console.error("Server output:", output.slice(-2000));
        proc.kill();
        process.exit(1);
      }
    }

    proc.kill("SIGTERM");
    setTimeout(() => process.exit(0), 500);
  }
}, POLL_INTERVAL);

proc.on("error", (e) => {
  clearInterval(interval);
  console.error("❌ Wrangler process error:", e.message);
  process.exit(1);
});
