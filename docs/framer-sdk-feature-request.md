# Framer Plugin SDK — Feature Request

**Title:** Allow programmatic canvas insertion of code components created via `unstable_createCodeFile`

**Submitted by:** Reda Izo — dev.izo.red  
**Plugin:** -ItsHover- Animated Icon integration plugin  
**SDK version:** framer-plugin ^2.0.0

---

## Summary

The current SDK makes it impossible to insert a freshly created code component onto
the canvas from a plugin. We can create the file, but we cannot place it — the user
must manually find it in the Components panel and drag it themselves.

---

## What we are building

A Framer sidebar plugin that fetches animated React icon components from ItsHover
(itshover.com) and inserts them into the user's project. Each icon is a `motion/react`
component with `useAnimate` hover interactions authored by the ItsHover team.

The desired user flow:

1. User clicks an icon in the plugin
2. Plugin creates the code component via `unstable_createCodeFile`
3. Plugin immediately places it on the canvas at the cursor position
4. User sees the animated icon on their page, ready to use

---

## What the SDK currently provides

```typescript
// Creates the file — works perfectly
await framer.unstable_createCodeFile('GithubIcon.tsx', code)

// Insert a component instance — requires a module URL
await framer.addComponentInstance({ url: '???' })
```

`addComponentInstance` and `addDetachedComponentLayers` both require a **component
module URL** ("can be copied from the components panel"). This URL is not returned by
`unstable_createCodeFile` (returns `void`), and there is no SDK method to derive or
look it up from a filename.

**No existing API solves this:**

| Method | Returns |
|--------|---------|
| `unstable_createCodeFile(name, code)` | `Promise<void>` |
| `unstable_getCodeFileContent(name)` | `Promise<string \| null>` (code only) |
| `getNodesWithType("ComponentNode")` | Design components only, not code components |

---

## What is missing

### Option A — Preferred: return an insertable reference from `unstable_createCodeFile`

```typescript
// Current
unstable_createCodeFile(name: string, code: string): Promise<void>

// Proposed
unstable_createCodeFile(name: string, code: string): Promise<{ insertURL: string }>
```

The returned `insertURL` could then be passed directly to `addComponentInstance`:

```typescript
const { insertURL } = await framer.unstable_createCodeFile('GithubIcon.tsx', code)
await framer.addComponentInstance({ url: insertURL })
```

---

### Option B: A lookup method for code file module URLs

```typescript
// Proposed new method
unstable_getCodeFileInsertURL(name: string): Promise<string | null>
```

Usage:

```typescript
await framer.unstable_createCodeFile('GithubIcon.tsx', code)
const url = await framer.unstable_getCodeFileInsertURL('GithubIcon.tsx')
if (url) await framer.addComponentInstance({ url })
```

---

### Option C: Direct code component insertion (no URL needed)

```typescript
// Proposed new method
unstable_addCodeComponentInstance(name: string, attributes?: Partial<EditableComponentInstanceNodeAttributes>): Promise<ComponentInstanceNode>
```

Usage:

```typescript
await framer.unstable_createCodeFile('GithubIcon.tsx', code)
await framer.unstable_addCodeComponentInstance('GithubIcon.tsx', { width: 24, height: 24 })
```

---

## Current workaround and its UX cost

Without this API, our plugin creates the file and shows a guide card telling the user
to manually find the component in the Components panel and drag it to their page.
This adds friction that breaks the "click to insert" promise of the plugin.

```
Plugin creates GithubIcon.tsx
       ↓
Shows: "Open the Components panel → Drag GithubIcon onto your page"
       ↓
User must switch focus, search, drag manually
```

For comparison: `addSVG` inserts a static SVG with a single call. Code components
deserve the same capability.

---

## Why this matters beyond our plugin

Any plugin that generates code components (icon libraries, component scaffolders,
AI component generators, design-to-code tools) hits this same wall. The `unstable_`
prefix on `createCodeFile` suggests this API is still evolving — adding an insert
path now would unlock a whole class of plugins that are currently impossible to
build with great UX.

---

## Contact

hello@izo.studio  
Plugin repo / feedback: dev.izo.red
