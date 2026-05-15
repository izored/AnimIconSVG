# Framer Plugin Developer Handbook

> **There is almost no public documentation for troubleshooting Framer plugin development.**
>
> Framer's official docs cover the happy path. When things break — SSL cipher mismatches,
> `window.framer` that doesn't exist, a plugin that silently never handshakes — you're mostly on
> your own. This handbook is what I wish existed when I started. Every section below is a real
> problem encountered during development, with the actual root cause and fix.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [The `framer.json` Manifest — Strict Validation](#2-the-framerjson-manifest--strict-validation)
3. [HTTPS / Localhost — The #1 Blocker](#3-https--localhost--the-1-blocker)
4. [The `framer-plugin` v2 SDK — What Actually Exists](#4-the-framer-plugin-v2-sdk--what-actually-exists)
5. [The Plugin Handshake — Why "Failed to Load" Happens](#5-the-plugin-handshake--why-failed-to-load-happens)
6. [Correct API Surface](#6-correct-api-surface)
7. [TypeScript Strict Mode Traps](#7-typescript-strict-mode-traps)
8. [Vite Cache — Stale Builds and Port Collisions](#8-vite-cache--stale-builds-and-port-collisions)
9. [CSS Layout in the Plugin Iframe](#9-css-layout-in-the-plugin-iframe)
10. [localStorage Cross-Component Sync](#10-localstorage-cross-component-sync)
11. [Browser vs Framer Iframe — Testing Strategy](#11-browser-vs-framer-iframe--testing-strategy)
12. [Accessing the Plugin Developer Console](#12-accessing-the-plugin-developer-console)
13. [Community Resources](#13-community-resources)

---

## 1. Project Setup

### Minimum working scaffold

```bash
npm create vite@latest my-plugin -- --template react-ts
cd my-plugin
npm install framer-plugin
npm install -D vite-plugin-framer
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import framer from 'vite-plugin-framer'

export default defineConfig({
  plugins: [react(), framer()],
  build: {
    outDir: 'dist',
    rollupOptions: { input: 'index.html' },
  },
  base: './',
})
```

`base: './'` is mandatory. Without it, the built plugin fails when loaded from a hosted URL because asset paths are absolute and break outside localhost.

---

## 2. The `framer.json` Manifest — Strict Validation

Framer validates `framer.json` before loading your plugin. Every property has hard rules. Violations produce cryptic errors.

### Working example

```json
{
  "id": "myplugin",
  "name": "My Plugin",
  "description": "Does something useful.",
  "version": "1.0.0",
  "author": "Your Name <you@example.com>",
  "icon": "https://example.com/icon.png",
  "entryPoint": "dist/index.html",
  "permissions": ["read:canvas", "write:canvas"],
  "width": 320,
  "height": 600,
  "modes": ["canvas"]
}
```

### Validation rules

| Property | Rule | Error |
|---|---|---|
| `id` | **Exactly 6 characters** | `"id" property must be 6 characters long` |
| `modes` | **Must be an array** | `"modes" property must be an array` |
| `modes[]` | **Must be valid enum values** | `"modes" property contains invalid value: default` |
| `entryPoint` | Path relative to manifest location | Plugin fails silently |

### Valid `modes` values

`canvas` `image` `editImage` `configureManagedCollection` `syncManagedCollection` `collection` `localization` `code` `api`

For a sidebar plugin that inserts content onto the canvas: `"modes": ["canvas"]`.

---

## 3. HTTPS / Localhost — The #1 Blocker

Framer runs on HTTPS. Your Vite dev server runs on HTTP. Browsers block mixed content (an HTTPS page loading an HTTP iframe). This is the first wall every Framer plugin developer hits.

### Failed attempts (documented for reference)

| Attempt | Result | Why |
|---|---|---|
| `http://localhost:5173` | "Unable to connect" | Mixed content — HTTPS page cannot load HTTP iframe |
| `server: { https: true }` in vite.config | `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` | Vite's auto-cert is broken on Windows |
| `http://127.0.0.1:5173` | "Unable to connect" | Same mixed-content issue |

### Working solution: `vite-plugin-framer`

The official Framer Vite plugin handles HTTPS certificate generation correctly.

```bash
npm install -D vite-plugin-framer
```

Add to `vite.config.ts` (see §1). Then:

```bash
npm run dev
# In Framer: Plugins → Create Plugin → Load URL → https://localhost:5173
```

You may still need to visit `https://localhost:5173/framer.json` once in your browser to accept the self-signed certificate before Framer's iframe will load it.

---

## 4. The `framer-plugin` v2 SDK — What Actually Exists

### `window.framer` does not exist

Previous Framer plugin versions injected a `window.framer` global. **In `framer-plugin` v2, this global does not exist.** Any code using `window.framer?.anything` is a silent no-op.

```ts
// ❌ Always undefined — no-op
window.framer?.showUI?.({ width: 320, height: 600 })
window.framer?.addSVGNode({ svg })

// ✅ Correct — named export from the package
import { framer } from 'framer-plugin'
framer.showUI({ width: 320, height: 600 })
await framer.addSVG({ svg: svgString, name: 'icon-name' })
```

---

## 5. The Plugin Handshake — Why "Failed to Load" Happens

### Root cause

`framer-plugin` v2 communicates with Framer via `postMessage`. When you call `framer.showUI()`, the SDK posts a `pluginReadySignal` message to `window.parent`. Framer waits for this signal. If it never arrives, Framer times out and shows "Failed to load."

```
Plugin loads → framer.showUI() → SDK posts pluginReadySignal → Framer shows panel ✓
Plugin loads → no showUI() call → Framer times out → "Failed to load" ✗
```

### Rules

- `framer.showUI()` **must** be called via the SDK import
- Call it at **module level** in `main.tsx` — not inside `useEffect`
- `useEffect` fires after React's first render; Framer may have already timed out

```tsx
// src/main.tsx — correct pattern
import React from 'react'
import ReactDOM from 'react-dom/client'
import { framer } from 'framer-plugin'
import App from './App'
import './App.css'

try {
  framer.showUI({ width: 320, height: 600 })
} catch { /* not running inside Framer */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

### "Invalid mode: null" in browser — expected, not a bug

The SDK reads `?mode=canvas` from the URL. In a standalone browser tab, that param is absent, mode is `null`, and the SDK throws. When loaded inside Framer, the param is appended automatically. Do not suppress this error.

---

## 6. Correct API Surface

### Insert SVG onto canvas

```ts
// ❌ Wrong method name
framer.addSVGNode({ svg, name })

// ✅ Correct
await framer.addSVG({ svg: svgString, name: 'icon-name' })
```

### Show / resize the plugin panel

```ts
framer.showUI({ width: 320, height: 600 })
// Also: resizable: true | false | "width" | "height"
```

### Drag to canvas

```ts
import { useMakeDraggable } from 'framer-plugin'

// Inside a component (ref = useRef<HTMLDivElement>):
useMakeDraggable(ref, () => ({
  type: 'svg' as const,
  svg: svgString,
  name: 'icon-name',
  // invertInDarkMode: true  (default — inverts black SVG in dark mode)
}))
```

The callback runs at drag-start (synchronous), not at registration time. SVG must already be in memory — you cannot fetch it during drag.

### Create a code component in the Framer project

```ts
// Install dependency FIRST — Framer compiles the file immediately on creation
await framer.unstable_ensureMinimumDependencyVersion('motion', '11.0.0')
await framer.unstable_createCodeFile('MyComponent.tsx', tsxSource)
```

**Order matters.** If the package isn't installed before `createCodeFile`, Framer throws "Unable to resolve package" immediately.

Related:
```ts
framer.unstable_getCodeFileContent(name)     // → Promise<string | null>
framer.unstable_setCodeFileContent(name, code)
framer.unstable_removeCodeFile(name)
framer.unstable_renameCodeFile(name, newName)
```

### CORS issue with ItsHover (and similar CDNs)

`itshover.com` returns a 307 redirect to `www.itshover.com`. The 307 response has no CORS headers — the browser blocks the redirect before it reaches the destination. Always fetch from the exact CORS-enabled subdomain:

```ts
// ❌ Triggers 307 — no CORS headers on redirect
`https://itshover.com/r/${name}.json`

// ✅ Direct CORS-enabled endpoint
`https://www.itshover.com/r/${name}.json`
```

---

## 7. TypeScript Strict Mode Traps

Standard Framer plugin templates enable strict TypeScript. Common issues:

### `Cannot find name '__dirname'`

`"type": "module"` in `package.json` enables ESM. `__dirname` is CommonJS only.

```ts
// ❌ BAD
input: resolve(__dirname, 'index.html')

// ✅ GOOD
input: 'index.html'
```

### Double angle brackets `<<` in generics

Code generation sometimes produces `<<Type>` instead of `<Type>`:

```ts
// ❌ BAD
useRef<<ReturnType<<typeof setTimeout> | null>(null)

// ✅ GOOD
useRef<ReturnType<typeof setTimeout> | null>(null)
```

### Unused locals / parameters

`noUnusedLocals` and `noUnusedParameters` are on by default. Every import must be used. Every parameter must be referenced. Remove unused params rather than prefixing with `_` — whether `_` is allowed depends on the project's eslint/ts config.

### `localStorage` migration for renamed enum values

Settings keys persist across sessions. When you rename a union value, add a migration on read:

```ts
// In useSettings.ts — handle old stored key
if (parsed.insertMode === 'code') parsed.insertMode = 'animated'
```

---

## 8. Vite Cache — Stale Builds and Port Collisions

### Stale compiled output

After replacing source files, Vite's dependency pre-bundle cache can serve old compiled code. Force a clean restart:

```bash
rm -rf node_modules/.vite
rm -rf dist
npm run dev -- --force
```

### Port collisions

If port 5173 is in use, Vite picks the next available port and logs it. Update the URL in Framer's plugin loader to match.

### Note for Windows paths with spaces

`Remove-Item` in PowerShell can be blocked on paths containing spaces in some environments. Use Git Bash / WSL instead:

```bash
rm -rf "D:/path with spaces/node_modules/.vite"
```

---

## 9. CSS Layout in the Plugin Iframe

### `showUI` height and CSS height are independent

`framer.showUI({ width: 320, height: 600 })` sets the Framer panel chrome size. Your CSS must separately fill that panel:

```css
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

.app {
  height: 100%;
  min-height: 0;
}
```

If `html/body/#root` have `height: 100%` but `.app` has a fixed pixel height, the iframe will show a black gap below your content (Framer's default iframe background is black).

### Flex scroll requires `min-height: 0`

In a flex column, items default to `min-height: auto` — they refuse to shrink below their content size. A flex child that should scroll must have `min-height: 0`:

```css
.scrollable-area {
  flex: 1;
  min-height: 0;    /* canonical fix — without this, overflow-y: auto never triggers */
  overflow-y: auto;
}
```

This is the most common CSS gotcha in Framer plugin layouts.

### SVG overflow bleeds between grid cells

SVG elements default to `overflow: visible`. Paths drawn near the viewBox edge bleed into adjacent cells.

```css
.icon-card {
  overflow: hidden;
  contain: paint;    /* stronger — prevents all ink from escaping border-box */
}

.icon-preview svg {
  overflow: hidden;
}
```

---

## 10. localStorage Cross-Component Sync

`localStorage.setItem` dispatches a `storage` window event — **but only to other tabs/windows, never the current page.** Same-page listeners on `window` do not fire.

When multiple independent instances of a custom hook share one `localStorage` key, you need a custom event:

```ts
// In the write path:
window.dispatchEvent(new CustomEvent('my-settings-change', { detail: next }))

// In each hook instance's useEffect:
const handleExternalUpdate = (e: Event) => {
  setSettings((e as CustomEvent<Settings>).detail)
}
window.addEventListener('my-settings-change', handleExternalUpdate)
return () => window.removeEventListener('my-settings-change', handleExternalUpdate)
```

The cleanup return is mandatory. Hook instances mount and unmount as the user scrolls (e.g. virtualized lists). Without cleanup, stale listeners accumulate.

---

## 11. Browser vs Framer Iframe — Testing Strategy

`http://localhost:5173` in a browser renders at full viewport (1000px+). The plugin in Framer is 320×600px. What looks correct in browser may break in Framer.

**Workarounds:**
- Add `max-width: 320px` to `.app` during dev to simulate sidebar width
- Use browser devtools device emulation to constrain viewport
- `document.body.style.zoom = '2'` in console to inspect icon quality at 2×
- Always do a final visual check in a real Framer instance before shipping

**Lesson:** The browser preview speeds up iteration. Real Framer testing is required before any release.

### localStorage cache invalidation during dev

After changing SVG extraction logic, old extracted SVGs are still cached. Clear them:

```js
// Browser console inside Framer's plugin panel
Object.keys(localStorage)
  .filter(k => k.startsWith('my_icon_'))
  .forEach(k => localStorage.removeItem(k))
```

---

## 12. Accessing the Plugin Developer Console

When Framer shows "Failed to load," the real error is hidden. Access it:

1. Load the plugin in Framer (even if it fails to open)
2. **View → Toggle Plugin Developer Tools** — or right-click the plugin panel → Inspect
3. Check the **Console** tab

What to look for:
- `Failed to load framer.json` → manifest validation error (check `id` length, `modes` array)
- `Cannot find module` → missing dependency or wrong import path
- `TypeError: window.framer is undefined` → you're using the wrong API
- Network errors (red) → CORS issue or wrong URL
- `Error: Assertion Error: Invalid mode: null` → expected in standalone browser, not in Framer

---

## 13. Community Resources

| Resource | URL | What it covers |
|---|---|---|
| Framer Official Troubleshooting | framer.com/developers/troubleshooting | "Failed to load Development Plugin," port conflicts, mode errors |
| Framer Community — Plugins Not Loading | framer.community/c/plugins/plugins-not-loading | General plugin loading failures |
| Reddit — Local Works, Dashboard Fails | reddit.com/r/framer/comments/1pg6pan/ | `base: "./"` fix for deployed plugins |
| Framer Community — Unable to Connect | framer.community/c/developers/unable-to-connect | "Unable to connect to development plugin" |
| Vite Troubleshooting | vite.dev/guide/troubleshooting | Dev server, HMR, CORS, case sensitivity |
| motion/react docs | motion.dev/docs/react | Correct import for `motion/react` in Framer code components |

---

*This handbook is a living document. Add to it as you encounter new issues.*
