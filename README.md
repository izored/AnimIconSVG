# AnimIconSVG - A Framer plugin

A Framer sidebar plugin that brings [ItsHover](https://itshover.com) animated icons directly to your canvas. Search 263+ icons, preview them with a stroke-draw hover animation, and insert onto the canvas in three modes.

<!-- add screenshot -->

---

## Features

- **Motion mode** — creates a full `motion/react` code component in your Framer project (animated on hover)
- **SVG mode** — inserts a static SVG node directly onto the canvas
- **CSS Stroke mode** — inserts SVG with a built-in `@keyframes` draw animation (no extra packages)
- Search across all icons, live filtered as you type
- Category chips: All / Arrows / Brand / Social / Letters / Tech
- Drag-and-drop or click to insert
- Respects your color and size settings from the Settings panel
- Dark / light theme that syncs with your Framer workspace

---

## Dev Setup

```bash
cd animiconsVG          # this folder
npm install
npm run dev
```

In Framer: **Plugins → Create Plugin → Load URL** → paste `https://localhost:5173` → Open.

> You may need to visit `https://localhost:5173/framer.json` once in your browser to accept the self-signed certificate before Framer can load it.

### Build

```bash
npm run build           # output → /dist
```

### TypeScript check

```bash
npx tsc --noEmit
```

---

## Project Structure

```
src/
├── main.tsx                    ← React mount + framer.showUI()
├── App.tsx                     ← View router (grid / settings / info)
├── App.css                     ← All styles (CSS variables, dark theme)
├── types.ts                    ← Shared interfaces
├── components/
│   ├── Header.tsx              ← Search + mode toggle + category chips
│   ├── IconGrid.tsx            ← Scrollable 5-col grid
│   ├── IconCard.tsx            ← Hover-fetch, drag, click, draw animation
│   ├── SettingsPage.tsx        ← Size, color, mode, theme, cache clear
│   ├── InfoPage.tsx            ← Credits
│   ├── MotionGuide.tsx         ← Bottom-sheet guide for Motion mode
│   ├── EmptyState.tsx          ← No results UI
│   └── Toast.tsx               ← Floating notifications
├── hooks/
│   ├── useRegistry.ts          ← Fetch + cache icon list
│   ├── useSettings.ts          ← Persisted preferences (localStorage)
│   └── useDebounce.ts          ← 150ms search debounce
├── utils/
│   ├── extractSVG.ts           ← TSX string → plain SVG
│   ├── extractMotionComponent.ts ← TSX → Framer-compatible code component
│   ├── insertToCanvas.ts       ← Framer SDK + clipboard fallback
│   └── fetchWithCache.ts       ← Network + localStorage TTL
└── data/
    └── fallback-registry.json  ← 263 icon names (offline fallback)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 6 + `vite-plugin-framer` |
| Framer SDK | `framer-plugin` v2 |
| UI Icons | `lucide-react` |
| Styling | Plain CSS (CSS variables) |
| Data | ItsHover CDN + GitHub Raw |

---

## Attribution

Icons provided by **[ItsHover](https://itshover.com)** — open source animated icon library.  
ItsHover icons are licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).  
See [NOTICE](./NOTICE) for full third-party attribution.

---

## Author

Built by **Reda Izo** — [dev.izo.red](https://dev.izo.red) · [@izored](https://github.com/izored)

---

## License

See [LICENSE](./LICENSE). Not yet licensed for redistribution — license TBD.
