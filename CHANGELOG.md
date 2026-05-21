# Changelog

All notable changes to AnimIconSVG are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [1.1.0] - 2026-05-21

> ⚠️ **Known issues — hotfix incoming.**
> Preview SVG in the icon grid is currently broken for some icons. Settings page changes do not reflect in the preview library. Fix in progress.

### Added
- 🎬 Motion preview: hover over any icon in Motion mode plays the actual hover animation — no CDN, no eval, no Babel. Uses framer-motion's imperative `animate()` API on DOM elements directly
- 🗂️ All 263 icons bundled locally in `icon-sources.json` (660 KB) — zero network requests, zero trust on external uptime
- 🖱️ Hover action bar: Copy SVG and ↓ TSX buttons appear on hover for quick export without inserting to canvas
- 📦 Download TSX exports a standalone React component (motion dep, no Framer SDK) + Apache 2.0 LICENSE file
- 🎬 Group-aware SVG extraction: `<motion.g className="X">` becomes `<g class="X">` in preview SVG so framer-motion can target and animate it
- 🔧 `extractStartFunctionBody` — reads `startAnimation` name from `useImperativeHandle`, parses only the hover-start function (previously ran start + stop together, cancelling the animation immediately)

### Changed
- 🚀 `useSettings` now initializes from localStorage synchronously (lazy `useState` initializer) — no flash of wrong settings on grid remount after visiting settings page
- 🎬 SVG preview in Motion mode injects `transform-box: fill-box; transform-origin: center` so scale/rotate animations apply from element center, not SVG viewport origin
- 🔀 `querySelectorAll` replaces `querySelector` — tag-name selectors (`path`, `circle`) now animate all matching elements, not just the first
- 🖱️ Hover animation is mode-aware: Motion mode plays actual icon animation, CSS Stroke mode plays stroke-draw, Static mode no animation
- 🎨 Fill icon hover uses spring bounce CSS animation — `transform-box: fill-box` added so scale applies from icon center
- 📐 Framer code component wrapper: 12% padding, `overflow: visible`, inner SVG `size={256}` + CSS `width/height: 100%` — bounding box resizes correctly on canvas

### Fixed
- 🐛 Fill icons rendering as solid black circles — `substituteJSXProps` pre-substitutes `stroke={color}` / `fill={color}` before regex extraction; preview ignores `defaultStyle` override
- 🐛 `<motion.g>` consuming child elements — removed `g` from PRIMITIVES; `TAG_RE` lazy match was absorbing children into the group tag match
- 🐛 Stale closure: `keepClasses` captured wrong `insertMode` at `useCallback` memo time — removed conditional, always `keepClasses=true` for preview
- 🐛 `pathLength` / `opacity` reset direction on hover-stop — arrays like `[0, 1]` now reset to first value (`0`), not hardcoded `1`

---

## [1.0.0] - 2026-05-15

> ⚠️ **Alpha release — animations not fully implemented.**
> Motion insert mode fetches ItsHover TSX source but only static SVG primitives are extracted and inserted. Full motion/animation support is planned for a future release.

### Added
- 🗂️ Icon grid with 263 icons fetched from GitHub Raw registry; 24h localStorage cache with offline fallback
- 🔀 Three insert modes: Motion (ItsHover animated — static SVG extraction only in this release), SvgIcon (static), CSS Stroke (basic stroke-draw)
- 🖱️ Hover-to-prefetch SVG (200ms delay); drag-and-drop + click-to-insert via `framer.addSVGNode()`; clipboard fallback
- ⚙️ Settings page: theme toggle, default size slider (16–64px), default color picker + presets, cache clear
- 🪟 Settings page: Theme and Cache controls side by side to conserve space
- 🏷️ Category filter chips: All, Arrows, Brand, Social, Letters, Tech
- 🎬 MotionGuide overlay for Motion insert mode
- 🍞 Toast notifications for insert feedback
- ℹ️ Info page with plugin and icon library attribution

### Changed
- ✏️ Plugin name set to **AnimIconSVG** (was "ItsHover Icons") in `framer.json`
- 🎨 Settings and Info pages aligned to shared design system: same padding (12px), typography scale, section spacing, and footer
- 🔗 Shared footer across Settings and Info pages: `AnimIconSVG v1.0.0 · dev.izo.red · Icons ItsHover, Apache 2.0`
- 🐙 Info page: standardized GitHub links to `github.com/…` format
- 📐 Info page: attribution grey box hugs footer, separated by 8px gap

### Fixed
- 📏 Settings page condensed to fit 600px plugin viewport without scrollbar
- 📌 Info page footer now pins to bottom of viewport
- 📦 Installed missing `vite-plugin-framer` dev dependency
