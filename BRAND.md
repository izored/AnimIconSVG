# AnimIconSVG — Brand & Positioning

## What we are

A Framer plugin that bridges open-source icon libraries and Framer's canvas. We deliver icons in three modes — full motion animation, CSS animated SVG, or static SVG — whatever the user needs. We curate and connect, we do not produce.

## What we are not

- Not affiliated with any icon library we source from
- Not a fork or derivative of any upstream project
- Not an icon *author* — we don't design or draw icons
- Not endorsed by Framer (yet — we'd love that)

## What we do

We identify high-quality open-source icon projects — animated or static — and make them accessible inside Framer, a platform those projects never targeted. When an interesting project surfaces, we evaluate it, and if its license permits, we add it as a source. The decision to include a source is entirely ours — it does not imply any relationship with that project's maintainers.

## Icon sources

Sources are chosen by AnimIconSVG based on quality, license compatibility, and relevance to Framer users. We do not host, modify, or redistribute source files — we fetch at runtime from each project's public API.

| Source | License | Status |
|--------|---------|--------|
| ItsHover (itshover.com) | Apache 2.0 | Active |
| *(more to come)* | | |

### Why we can do this

Apache 2.0, MIT, and AGPL licenses explicitly permit fetching, using, and building on top of the licensed work — including commercially — as long as attribution is preserved. AnimIconSVG complies: attribution is embedded in every exported file automatically.

## Free to use

AnimIconSVG is free. The icons are free because their upstream licenses are free. We pass that freedom through to Framer users without restriction.

## Donations

This plugin is built and maintained independently. If it saves you time, donations are welcome — destination TBD, link coming soon.

## Our relationship to open-source providers

| Provider | Relation | License |
|----------|----------|---------|
| ItsHover | Data source — no affiliation | Apache 2.0 |
| Framer | Plugin platform — no affiliation | Proprietary |
| Motion / framer-motion | Runtime inside Framer — no affiliation | MIT |

## Plugin identity

- **Name:** AnimIconSVG
- **Author:** Reda Izo
- **Contact:** dev@izo.red
- **Studio:** izo.red
- **Plugin ID:** anisvg

## Attribution requirement

Any icon exported from this plugin (TSX download or SVG copy) carries the upstream project's copyright notice. Our generated LICENSE file handles this automatically on every export.

## What we take credit for

- Curation decisions — which sources to include
- The Framer plugin UI and UX
- The TSX-to-Framer code component pipeline
- The SVG extraction and CSS animation layer
- The bridge between open-source icon registries and Framer's canvas
