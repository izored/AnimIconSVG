# Plan: Header Mode Toggle (AnimIcon ↔ SvgIcon)

## Context
Replace the static orange dot + "AnimIcon" text in the header brand area with a vertical segmented pill toggle. Clicking toggles between **AnimIcon** (CSS-animated SVG on insert) and **SvgIcon** (static SVG). Both modes use drag-and-drop via `useMakeDraggable`. Plugin handles all insertion — no clipboard copy, no code component creation by user.

---

## Critical Pre-Fix: useSettings State Sync

Each component calls `useSettings()` independently with isolated local state. The `useEffect` in `useSettings` only reads localStorage on mount, so toggling from `App.tsx` header won't update `IconCard` state.

**Fix:** Add a custom `window` event to broadcast settings changes across all instances.

In `useSettings.ts`, modify `updateSettings`:
```ts
window.dispatchEvent(new CustomEvent('animicon-settings-change', { detail: next }))
```

And add a listener in the `useEffect`:
```ts
const handleExternalUpdate = (e: Event) => {
  setSettings((e as CustomEvent<Settings>).detail)
}
window.addEventListener('animicon-settings-change', handleExternalUpdate)
return () => window.removeEventListener('animicon-settings-change', handleExternalUpdate)
```

---

## File Changes (in order)

### 1. `src/types.ts`
Rename `'code'` → `'animated'`:
```ts
insertMode: 'svg' | 'animated';
```

### 2. `src/hooks/useSettings.ts`
- Add custom event sync (see above)
- Migration guard after `const merged = { ...DEFAULTS, ...parsed }`:
```ts
if ((merged.insertMode as string) === 'code') merged.insertMode = 'animated'
```
- Default stays `'svg'`

### 3. `src/utils/extractSVG.ts`
Add `animated: boolean = false` param. When true, inject `<style>` with CSS stroke-draw animation:

```ts
function buildAnimationStyle(count: number): string {
  const rules = Array.from({ length: count }, (_, i) => {
    const delay = (i * 0.07).toFixed(2)
    // +2 because style tag is child index 1; shape elements start at 2
    return `svg > *:nth-child(${i + 2}) { stroke-dasharray: 200; stroke-dashoffset: 200; animation: anim-draw 0.45s ease ${delay}s forwards; }`
  }).join(' ')
  return `<style> @keyframes anim-draw { to { stroke-dashoffset: 0; } } ${rules} </style>`
}

export function extractSVG(tsxSource: string, color = 'currentColor', size = 24, animated = false): string {
  // ... existing logic ...
  const animStyle = animated ? buildAnimationStyle(filtered.length) : ''
  return `<svg ...>${animStyle}${filtered.join('')}</svg>`
}
```

### 4. `src/components/SettingsPage.tsx`
Line 76: `'code'` → `'animated'`  
Line 79: Label "Code Component" → "AnimIcon — Animated"  
Line 80: Hint "Animated, requires Motion" → "CSS stroke-draw animation on insert"  
Line 67: Label "SVG Vector" → "SvgIcon — Static"

### 5. `src/components/IconCard.tsx`
**Drag callback** — use animated SVG if mode is animated and source loaded:
```tsx
useMakeDraggable(cardRef, () => {
  if (settings.insertMode === 'animated' && tsxSource) {
    return { type: 'svg' as const, svg: extractSVG(tsxSource, settings.defaultColor, settings.defaultSize, true), name }
  }
  return { type: 'svg' as const, svg: previewSvg ?? '', name }
})
```
Edge case: `tsxSource` null at drag-start → falls back to static `previewSvg`. Acceptable (card not loaded yet).

**Click handler** — remove `'code'` clipboard branch entirely; both modes call `insertToCanvas`:
```tsx
const handleClick = async () => {
  const source = tsxSource || await fetchSource()
  if (!source) { onToast('Failed to load icon'); return }
  const svg = extractSVG(source, settings.defaultColor, settings.defaultSize, settings.insertMode === 'animated')
  const inserted = await insertToCanvas(svg, name)
  onToast(inserted ? `Added ${name}` : 'Failed to add icon')
}
```

### 6. `src/components/Header.tsx`
Add props to interface:
```ts
insertMode: 'svg' | 'animated'
onToggleMode: () => void
```

Replace brand div (lines 26–29):
```tsx
<div className="header-brand">
  <button className="mode-toggle" onClick={onToggleMode} type="button"
    title={`Switch to ${insertMode === 'animated' ? 'SvgIcon' : 'AnimIcon'}`}>
    <span className={`mode-toggle-segment${insertMode === 'animated' ? ' mode-toggle-segment--active' : ''}`}>
      <span className="mode-toggle-dot" />
      AnimIcon
    </span>
    <span className={`mode-toggle-segment${insertMode === 'svg' ? ' mode-toggle-segment--active' : ''}`}>
      <span className="mode-toggle-dot" />
      SvgIcon
    </span>
  </button>
</div>
```

### 7. `src/App.tsx`
Add `useSettings` import + hook call. Add `handleToggleMode` callback. Pass new props to `<Header>`:
```tsx
const [settings, updateSettings] = useSettings()
const handleToggleMode = useCallback(() => {
  updateSettings({ insertMode: settings.insertMode === 'animated' ? 'svg' : 'animated' })
}, [settings.insertMode, updateSettings])

// <Header ... insertMode={settings.insertMode} onToggleMode={handleToggleMode} />
```

### 8. `src/App.css`
Delete `.header-brand-dot` rule (lines 83–88). Add:
```css
.mode-toggle {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 2px;
  gap: 1px;
  cursor: pointer;
  outline: none;
  transition: border-color 150ms ease;
  width: 80px;
  flex-shrink: 0;
}
.mode-toggle:hover { border-color: var(--border-hover); }

.mode-toggle-segment {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 6px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  transition: background 150ms ease, color 150ms ease;
  white-space: nowrap;
  user-select: none;
}
.mode-toggle-segment--active {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.mode-toggle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 150ms ease;
}
.mode-toggle-segment--active .mode-toggle-dot { opacity: 1; }
```

---

## Critical Files
- `itshover-framer-plugin - ALPHA/src/types.ts`
- `itshover-framer-plugin - ALPHA/src/hooks/useSettings.ts`
- `itshover-framer-plugin - ALPHA/src/utils/extractSVG.ts`
- `itshover-framer-plugin - ALPHA/src/components/Header.tsx`
- `itshover-framer-plugin - ALPHA/src/components/IconCard.tsx`
- `itshover-framer-plugin - ALPHA/src/components/SettingsPage.tsx`
- `itshover-framer-plugin - ALPHA/src/App.tsx`
- `itshover-framer-plugin - ALPHA/src/App.css`

## Verification
1. `npm run dev` → load plugin URL in Framer
2. Header shows vertical pill with "AnimIcon" (orange dot active) and "SvgIcon"
3. Click toggle → dot moves to SvgIcon row
4. Drag icon in SvgIcon mode → static SVG lands on canvas
5. Toggle to AnimIcon → drag icon → SVG with stroke-draw animation lands on canvas (plays once on drop)
6. Click icon in both modes → inserts to canvas (no clipboard prompt)
7. `npx tsc --noEmit` → zero errors
