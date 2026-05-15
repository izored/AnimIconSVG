# Plan: Licensing Q + Category Filter + User Flow

## 1. Licensing — Advisory (No Code)

**Can you bulk-download all SVGs and JSX animations?**

Technically yes — every icon is fetched from `https://www.itshover.com/r/{name}.json` which returns TSX source. A loop over the 263 registry names could pull them all. But **this is a licensing question, not a code question**. The plugin's design is "fetch on demand," not "bulk export." ItsHover's terms of service govern whether you're allowed to download and redistribute their icon set. You need to check itshover.com's ToS or contact them directly before building any bulk-download feature.

---

## 2. User Flow — Explanation

### Technical flow
1. **Plugin mounts** → `useRegistry` fetches `registry.json` from GitHub (263 icon names). Cached 24h in localStorage. Offline fallback = bundled `fallback-registry.json`.
2. **Grid renders** → 263 `IconCard` components. Each card is a skeleton until it scrolls into view.
3. **Scroll into view** → `IntersectionObserver` (50px margin) triggers `fetchWithCache()` → GET `https://www.itshover.com/r/{name}.json` → parses TSX, extracts static SVG via regex, renders preview. Cached 7 days per icon.
4. **Hover** → `animatePaths(true)` queries SVG primitives, calls `getTotalLength()` per element, sets `strokeDasharray/strokeDashoffset`, fires staggered CSS animation `animicon-draw` (0.45s, each element +0.07s delay). Mouse leave resets styles.
5. **Click** →
   - Mode `svg`: `extractSVG(source, color, size)` → `framer.addSVG({ svg, name })` → icon lands on canvas. Clipboard fallback if Framer API fails.
   - Mode `code`: `navigator.clipboard.writeText(tsxSource)` → user pastes into Framer code component.
6. **Drag** → `useMakeDraggable(cardRef)` passes `{ type: 'svg', svg: previewSvg, name }` to Framer plugin. **Note:** drag uses the 24px `currentColor` preview SVG, not the user-configured size/color. Must hover first (fetch is async, drag is sync).

### Plain English
Open the plugin and you see a grid of ~260 icons. As you scroll, each icon quietly loads its shape in the background. Hover one and it draws itself with a stroke animation. Click it and it appears directly on your Framer canvas as an SVG node. Or drag it straight onto the canvas. In Settings you can switch to "code mode" — then clicking copies the animated TSX code to your clipboard so you can paste it into a Framer code component and get the real motion animation.

---

## 3. Category Filter Feature

### Context
Icons are a flat list with no categories. Names follow predictable patterns that map to clear groups. Adding 6 filter chips below the search bar gives users a fast visual browse path without typing.

### Categories (derived from name patterns)

| Label | Pattern match | ~Count |
|-------|--------------|--------|
| All | (none — show everything) | 263 |
| Arrows | name includes `arrow` or `chevron` | ~23 |
| Brand | name starts with `brand-` | ~29 |
| Social | name in social platform set (discord, facebook, github, instagram, linkedin, pinterest, slack, snapchat, spotify, twitter, twitter-x, whatsapp, youtube, apple-brand-logo, figma, gmail) | ~17 |
| Letters | name starts with `letter-` or includes `dialpad` | ~27 |
| Tech | name includes: code, cpu, docker, golang, javascript, mysql, nodejs, python, terminal, typescript, router, wifi, bluetooth, brain-circuit | ~14 |

### Implementation

**Files to change:**

`src/types.ts`
- Add `export type Category = 'all' | 'arrows' | 'brand' | 'social' | 'letters' | 'tech'`

`src/App.tsx`
- Add `const [activeCategory, setActiveCategory] = useState<Category>('all')`
- Pass `activeCategory` and `setActiveCategory` to `<Header>` and `<IconGrid>`

`src/components/Header.tsx`
- Add `activeCategory: Category` and `onCategoryChange: (c: Category) => void` to props
- Below search input, render 6 chip buttons: All / Arrows / Brand / Social / Letters / Tech
- Active chip gets `category-chip--active` class

`src/components/IconGrid.tsx`
- Add `activeCategory: Category` prop
- In `useMemo` filter: apply category check after search filter
- Category matching logic (pure function, no deps):
  ```ts
  function matchesCategory(name: string, cat: Category): boolean {
    if (cat === 'all') return true
    if (cat === 'arrows') return name.includes('arrow') || name.includes('chevron')
    if (cat === 'brand') return name.startsWith('brand-')
    if (cat === 'social') return SOCIAL_NAMES.has(name)
    if (cat === 'letters') return name.startsWith('letter-') || name.includes('dialpad')
    if (cat === 'tech') return TECH_KEYWORDS.some(k => name.includes(k))
    return true
  }
  const SOCIAL_NAMES = new Set(['discord-icon','facebook-icon','github-icon','github-copilot-icon','gitlab-icon','gmail-icon','instagram-icon','linkedin-icon','pinterest-icon','slack-icon','snapchat-icon','spotify-icon','twitter-icon','twitter-x-icon','whatsapp-icon','youtube-icon','apple-brand-logo','figma-icon'])
  const TECH_KEYWORDS = ['code','cpu','docker','golang','javascript','mysql','nodejs','python','terminal','typescript','router','wifi','bluetooth','brain-circuit']
  ```

`src/App.css`
- Add `.category-chips` flex row (gap 6px, overflow-x auto, padding 0 12px 8px)
- Add `.category-chip` small pill button (font-size 11px, padding 3px 10px, border-radius 99px, border 1px solid var(--border), background transparent)
- Add `.category-chip--active` (background var(--accent), color white, border-color var(--accent))
- No scroll bar visible (`scrollbar-width: none`)

### Pre-implementation: Backup
Before touching any files, copy the entire alpha folder:
```
xcopy "itshover-framer-plugin - ALPHA" "itshover-framer-plugin - ALPHA_BACKUP" /E /I /H
```

### Verification
1. `npm run dev` in `itshover-framer-plugin - ALPHA/`
2. Load `http://localhost:5173` in Framer plugin panel
3. Filter chips appear below search bar
4. Clicking "Brand" shows only brand-* icons (~29), count matches table
5. Search + category filter compose correctly (e.g. Brand + "openai" shows only brand-openai-icon)
6. "All" resets to full list
7. `npx tsc --noEmit` — no errors
