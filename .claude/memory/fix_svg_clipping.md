---
name: SVG Icon Clipping Fix
description: Root cause and fix for icons showing as partial strokes in plugin grid
type: project
---

## The Problem (3 sessions, ~500k context to diagnose)

Icons rendered as partial strokes — bent paths, single arcs, horizontal lines — not complete icon shapes. Looked like fragments of each icon bleeding through.

## Root Cause

Two clip layers on `.icon-card` worked together to cut SVG content:

1. `overflow: hidden` — clips anything outside the card's border-box
2. `contain: paint` — even more aggressive, clips to border-box regardless of overflow rules

SVG icons use `stroke-linecap="round"` and paths that land at or near the viewBox edges (e.g. `viewBox="0 0 24 24"` with a path at x=0 or y=0). The stroke extends ~1px beyond the viewBox boundary. Both clip layers cut that 1px → only the interior portion of each stroke survived → icons appeared as broken fragments.

Additionally, `.icon-preview svg` had `flex-shrink: 0` forcing 46px in a ~44px space, compounding the overflow.

## The Fix

```css
/* REMOVED from .icon-card: */
overflow: hidden;
contain: paint;

/* ADDED to .icon-preview svg: */
overflow: visible;
```

Removing `contain: paint` was the key unlock. It's a very aggressive containment property — not appropriate for icon display cards where SVG strokes need to breathe at their edges.

## Why It Took So Long

- Visual symptom (partial strokes) looked like a rendering/extraction bug, not a CSS clip
- `contain: paint` is rarely-used and easy to overlook
- Multiple red herrings: SVG size (48px → 24px), flex-shrink, grid column count
- The actual fix was 2 lines of CSS deletion

## Other Fixes Applied Same Session

- 4 cols → 3 cols (320px panel: 72px cards were too small for legible strokes)
- Card zone separation: `justify-content: flex-start`, icon fills top, label anchored bottom with own padding
- `max-width/height: 52px` on SVG to use extra space from wider cells
- Grid columns: `repeat(3, minmax(0, 1fr))` — `1fr` has implicit `min-width: auto` causing grid blowout; `minmax(0, 1fr)` forces min to 0
- `overflow-x: hidden` on grid to kill horizontal bleed from scrollbar
- `min-width: 0` on `.icon-card` as belt-and-suspenders against grid blowout
