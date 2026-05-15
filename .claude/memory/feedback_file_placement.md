---
name: Memory and plan file placement
description: Where to save memory files, plans, and Claude artifacts for this user
type: feedback
---

Always write memory files and plan files to the **project's own `.claude/` folder**, not the global `~/.claude/projects/...` path.

**Why:** User wants all Claude artifacts self-contained per project, co-located with the code.

**How to apply:**
- Memory → `<project-root>/.claude/memory/`
- Plans → `<project-root>/.claude/plans/`
- MEMORY.md index → `<project-root>/.claude/memory/MEMORY.md`
- This rule is global (written to `~/.claude/CLAUDE.md`) — applies to every project.
