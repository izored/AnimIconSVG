---
name: AnimIcon Framer Plugin — project overview
description: Core facts about this project: what it is, stack, structure, status, completed work
type: project
---

Framer sidebar plugin (branded **AnimIcon**, built by **DIR / dev.izo.red**) that lets designers search, preview, and insert 263+ animated SVG icons from the ItsHover library onto the canvas.

**Why:** Fetch icons at runtime instead of bundling them — keeps plugin under ~100KB. No `motion` dependency; icons are TSX on the server, extracted to static SVG in the plugin.

**Stack:** React 18 + TypeScript + Vite 6 + framer-plugin v2. Plain CSS, no CSS-in-JS.

**Working directories:**
- `itshover-framer-plugin - ALPHA/` — local dev scratch (note: spaces in folder name). All `npm` commands run from here.
- `github/` — git repo, source of truth for GitHub. Keep in sync with alpha when shipping.

**GitHub repo:** https://github.com/izored/AnimIconSVG (branch: `main`)

**Repo structure:**
- `src/` — all plugin source
- `docs/FRAMER-DEV-HANDBOOK.md` — Framer plugin dev troubleshooting reference
- `docs/framer-sdk-feature-request.md` — SDK gap: `unstable_createCodeFile` returns void, no canvas insert path
- `NOTICE` — Apache 2.0 attribution for ItsHover (required)
- `LICENSE` — "All Rights Reserved" placeholder (user undecided on open vs closed source)

**Plugin dimensions:** 320×600px. `framer.showUI({ width: 320, height: 600 })` in main.tsx. `.app` uses `height: 100%` (fills iframe via `html, body, #root { height: 100% }`).

**Icon library license:** ItsHover icons are Apache 2.0. Attribution is shown in InfoPage and SettingsPage footer.

**Plugin name / branding:**
- Display name: **AnimIcon**
- Builder brand: **DIR** by Reda Izo — dev.izo.red
- localStorage prefix: `animicon_` (settings, registry, icon cache)

**Views:** grid, settings, info — routed via `View` string union in `types.ts`

**Completed work (May 2026):**
- Full core implementation: extractSVG, fetchWithCache, insertToCanvas, IconCard, useSettings, useRegistry
- Rename ItsHover → AnimIcon throughout (header brand, localStorage keys, CSS animation names)
- InfoPage: DIR brand, ItsHover Apache 2.0 attribution, side-by-side link buttons, no logos, email in meta footer
- SettingsPage: removed redundant About section, insert mode hints, inline size slider + value, color hex label, attribution footer, cache row tightened
- Black box fix: app now fills full 600px iframe
- Scrollbar: accent color (orange) on grid + settings + info pages
- Grid: 4 columns (was 5)
- Icon preview: 46px SVG (was 32px), `--text-primary` color (was muted gray), tighter card padding for more icon space

**Known remaining:**
- 27 icons may fail to load (network errors, not code bugs)
- Previews render in `currentColor` (inherits text-primary); don't re-render when user changes default color setting (by design — cached)
