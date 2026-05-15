# Plan: Publish to GitHub (AnimIconSVG)

## Context

Plugin is stable (all TypeScript clean, Framer SDK integration working). Moving from local alpha folder to a proper GitHub repo at https://github.com/izored/AnimIconSVG for iterative development. User hasn't decided on open vs closed source — plan uses "All Rights Reserved" placeholder. ItsHover icons are Apache 2.0 and require attribution + a NOTICE file.

---

## Steps

### 1. Copy source files to `github/` folder

Copy from `itshover-framer-plugin - ALPHA/` to `github/` — **exclude**:
- `node_modules/`
- `.claude/`
- `dist/`
- `fix-plugin.ps1` (Windows-only dev tool, not repo material)

Files to copy:
```
src/                    (all files, all subfolders)
framer.json
index.html
package.json
package-lock.json
tsconfig.json
tsconfig.node.json
vite.config.ts
```

### 2. Create `.gitignore` in `github/`

```
node_modules/
dist/
.env
*.local.md
*.local.json
.claude/
```

### 3. Create `NOTICE` file (Apache 2.0 compliance for ItsHover)

Required by Apache 2.0 when redistributing derived works. Content:
```
AnimIconSVG — Framer Plugin
Copyright (c) 2026 Reda Izo (dev.izo.red)

This plugin fetches icons at runtime from ItsHover (https://itshover.com).
ItsHover icons are licensed under the Apache License, Version 2.0.
Copyright (c) ItsHover contributors.

Full Apache 2.0 license text: https://www.apache.org/licenses/LICENSE-2.0

SVG representations extracted from ItsHover's animated TSX components
are derived works of those components.
```

### 4. Create `LICENSE` file (placeholder — user undecided)

```
Copyright (c) 2026 Reda Izo (dev.izo.red)
All Rights Reserved.

This software is not yet licensed for redistribution.
See NOTICE for third-party attributions.
```

User can replace with MIT/Apache/ISC later when decision is made.

### 5. Create `README.md`

Sections:
- Plugin name + short description (AnimIcon — ItsHover animated icons for Framer)
- Screenshot placeholder (`<!-- add screenshot -->`)
- Features: 3 insert modes (Motion, SVG, CSS Stroke), 263+ icons, search, drag-drop
- Install / dev setup (`npm install`, `npm run dev`, Load URL in Framer)
- ItsHover attribution (required by Apache 2.0)
- Author credit: Reda Izo / dev.izo.red
- License status note

### 6. Create `FRAMER-DEV-HANDBOOK.md`

Curated developer handbook from `FRAMER-PLUGIN-DEV-REPORT.md` — written as a general reference for any Framer plugin developer, not just this project. Covers:

- **Preface**: almost no Framer plugin troubleshooting docs exist publicly
- `framer.json` manifest gotchas (6-char ID, modes array, valid mode values)
- HTTPS/localhost solution (`vite-plugin-framer`)
- `framer-plugin` v2 SDK: `window.framer` doesn't exist, import from package
- Correct `showUI()` call location (module level, not useEffect)
- `framer.addSVG()` not `addSVGNode()`
- `useMakeDraggable` hook
- `unstable_createCodeFile` + install dependency order
- TypeScript strict mode traps
- Vite cache reset procedure
- localStorage cross-component sync gotcha
- CSS height / flex scroll (min-height: 0)
- Browser vs Framer iframe testing strategy
- Community resources table

### 7. Git init + remote + initial commit

```bash
cd "D:/APPS - 2026/Framer Animated Icon Plugin/github"
git init
git remote add origin https://github.com/izored/AnimIconSVG.git
git add .
git commit -m "Initial commit — AnimIconSVG Framer plugin alpha"
git branch -M main
git push -u origin main
```

---

## Critical files to create/copy

| File | Action |
|------|--------|
| `github/src/**` | Copy from alpha |
| `github/framer.json` | Copy from alpha |
| `github/package.json` | Copy from alpha |
| `github/index.html` + config files | Copy from alpha |
| `github/.gitignore` | Create new |
| `github/NOTICE` | Create new (Apache 2.0 compliance) |
| `github/LICENSE` | Create new (All Rights Reserved placeholder) |
| `github/README.md` | Create new |
| `github/FRAMER-DEV-HANDBOOK.md` | Create new (from dev report) |

---

## Verification

1. `git status` in `github/` shows no untracked surprises (no `node_modules`, no `.claude`)
2. `cat github/NOTICE` — ItsHover attribution present
3. Push succeeds: https://github.com/izored/AnimIconSVG shows all files
4. After push: `npm install && npm run dev` from `github/` — plugin boots at `https://localhost:5173`
