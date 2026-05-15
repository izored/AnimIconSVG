# Changelog

All notable changes to AnimIconSVG are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

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
