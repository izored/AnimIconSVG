# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root:

```bash
npm install        # install deps
npm run dev        # dev server at localhost:5173 (use Framer's "Load URL")
npm run build      # production build → /dist
```

TypeScript check (no emit): `npx tsc --noEmit` from the repo root.

No test suite exists yet.

## Architecture

Framer sidebar plugin (320×600px iframe). Three views — grid, settings, info — routed in `App.tsx` via a `View` string union defined in `types.ts`.

### Data flow

1. **Mount** → `useRegistry` fetches `registry.json` from GitHub Raw (263 icon names). Cached in `localStorage` for 24h via `fetchWithCache`. Falls back to bundled `src/data/fallback-registry.json` if offline.
2. **Search** → client-side filter in `IconGrid`, debounced 150ms by `useDebounce`.
3. **Hover** (200ms delay in `IconCard`) → fetches `https://itshover.com/r/{name}.json` (raw TSX source). Cached in `localStorage` for 7 days. **Drag requires hover first** — `dragstart` is synchronous so SVG must be preloaded.
4. **Click / drag** → `extractSVG` converts TSX string to plain `<svg>` → `insertToCanvas` calls `framer.addSVGNode()`. Clipboard copy is the fallback if the SDK call fails.

### SVG extraction

`src/utils/extractSVG.ts` — pure regex, no DOM. Strips `<motion.svg>` wrapper and React-specific attributes, reconstructs static SVG with user-supplied `stroke` color and `size`. Filters out background-clearing `<rect d="M0 0h24v24H0z">`. Returns an info-circle fallback SVG when no primitives are found.

### State / settings

`useSettings` persists insert mode, size, and color to `localStorage`. `useRegistry` holds the icon list + loading state. Both are custom hooks; no global state library.

### Framer SDK

Accessed via `window.framer` (typed as `any` in `vite-env.d.ts`). The `framer-plugin` v2 package provides `framer.addSVGNode()`. If unavailable, `insertToCanvas` falls back to `navigator.clipboard.writeText` and triggers a toast.

## File conventions

Memory files, plan files, and all Claude-generated artifacts go in `.claude/` inside this project directory — not in the global `~/.claude/` folder. Specifically:

- Memory → `.claude/memory/`
- Plans → `.claude/plans/`

## Changelog conventions

Every changelog bullet must begin with a single relevant emoji that reflects the nature of the change. One emoji per line, chosen for semantic fit — not decoration. This applies to:

- `CHANGELOG.md` entries
- Annotated git tag messages (`git tag -a`)
- GitHub Release body text (inline changelog)

Examples:

| Emoji | When to use |
|-------|-------------|
| 🗂️ | data, registry, storage |
| 🎨 | design, styling, UI layout |
| ⚙️ | settings, config |
| 📦 | dependencies, packaging |
| 🐙 | GitHub-related |
| 📌 | pinning, positioning |
| 🔗 | links, shared elements |
| ✏️ | renames, copy changes |
| 🔀 | modes, routing, branching |
| 🖱️ | interaction, drag, click |
| 📐 | spacing, alignment |
| 📏 | sizing, viewport |
| 🍞 | toasts, notifications |
| 🏷️ | labels, tags, filters |
| 🎬 | animation, motion, overlays |
| ℹ️ | info, documentation |
| 📌 | fixed positioning |
| 🔒 | security |
| 🚀 | performance |
| 🐛 | bug fix |

Pick the closest fit. If nothing fits well, use 🔧 as a fallback.

## Copy & positioning rule

**Before writing any user-facing copy** (UI labels, hints, descriptions, docs, info page, settings) — read `BRAND.md` first. All copy must be source-agnostic: never name a specific icon supplier (ItsHover etc.) in mode descriptions or feature copy. Sources change. The plugin's identity does not.

## Tone of voice

Write copy like the owner does — short, direct, no puffery.

**Rules:**
- No self-congratulatory language. Never: "genuine craft", "no VC", "no team, no budget", "built with love". Say the thing, stop.
- Short declarative sentences. "Plugin free to use, forever." not "This plugin will always remain free for everyone to use."
- If user provides exact copy, preserve it exactly — do not reformat, expand, or "improve" it.
- Playful is OK when brief. "(yet? ;))" is fine. A paragraph explaining the joke is not.
- No inflation of simple ideas. "deserves it" beats "deserves better tooling. No VC, no team, no budget — just genuine craft."
- Hints and labels: one line, fewest words that carry the meaning. Cut adjectives first.

## Key constraints

- **No `motion` package** — icons are fetched as TSX source but only the static SVG primitives are used. Motion stays server-side.
- **TypeScript strict mode** — `noUnusedLocals` and `noUnusedParameters` are on; imports must be clean.
- **CSS only** — plain CSS with CSS variables (`var(--text-muted)` etc.) in `App.css`. No CSS-in-JS or utility frameworks.
- **Bundle size target** — keep plugin bundle under ~100KB. Do not add heavy dependencies.
