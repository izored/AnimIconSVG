/**
 * motionPreview.ts
 *
 * Parses ItsHover TSX source for imperative animate() calls (useAnimate pattern)
 * and replays them on the actual DOM elements in the plugin preview card.
 *
 * No Babel, no eval, no CDN. Uses framer-motion's imperative animate() API
 * which accepts DOM elements directly — same call signature as useAnimate.
 *
 * ItsHover pattern:
 *   useImperativeHandle(ref, () => ({ startAnimation: <fnName>, stopAnimation: <fnName> }))
 *   const <fnName> = async () => { animate(".selector", {...}, {...}); ... }
 *
 * We locate only the startAnimation function body, parse its animate() calls,
 * and replay them on DOM elements in the preview card.
 */

import { animate } from 'framer-motion'

interface AnimStep {
  selector: string
  keyframes: Record<string, unknown>
  options: Record<string, unknown>
}

// Safely evaluate a JS object literal string (no JSX, no imports — safe subset).
function parseObj(str: string): Record<string, unknown> {
  try {
    return new Function(`"use strict"; return (${str})`)() as Record<string, unknown>
  } catch {
    return {}
  }
}

// Extract { ... } block starting at `pos` in `str`, handling nested braces.
function extractBraceBlock(str: string, pos: number): string | null {
  if (str[pos] !== '{') return null
  let depth = 0
  let i = pos
  while (i < str.length) {
    if (str[i] === '{') depth++
    else if (str[i] === '}') {
      depth--
      if (depth === 0) return str.slice(pos, i + 1)
    }
    i++
  }
  return null
}

/**
 * Extract only the body of the startAnimation function.
 *
 * ItsHover uses useImperativeHandle to expose startAnimation and stopAnimation.
 * We read the function name from useImperativeHandle, then find that function's
 * body (the first { ... } block after `const <name> = ...`).
 *
 * This prevents us from also running the stop/reset animate() calls on hover start,
 * which would immediately cancel the start animation.
 */
function extractStartFunctionBody(tsxSource: string): string {
  // Read startAnimation function name from useImperativeHandle block.
  // Pattern: startAnimation: <fnName>   or   startAnimation: start  (most common)
  const startNameMatch = tsxSource.match(/\bstartAnimation\s*:\s*(\w+)/)
  const fnName = startNameMatch ? startNameMatch[1] : 'start'

  // Find `const <fnName> = ` declaration
  const fnDeclRE = new RegExp(`\\bconst\\s+${fnName}\\s*=`)
  const fnDeclMatch = fnDeclRE.exec(tsxSource)
  if (!fnDeclMatch) return tsxSource  // fallback: use whole source

  // Scan forward from declaration to find the opening { of the function body.
  // Works for: `() => {`, `useCallback(async () => {`, `useCallback(() => {`
  let pos = fnDeclMatch.index + fnDeclMatch[0].length
  while (pos < tsxSource.length && tsxSource[pos] !== '{') pos++
  if (pos >= tsxSource.length) return tsxSource

  const body = extractBraceBlock(tsxSource, pos)
  return body ?? tsxSource
}

export function parseAnimateCalls(tsxSource: string): AnimStep[] {
  const steps: AnimStep[] = []

  // Only search inside the startAnimation function body — not the stop/reset handler.
  const searchSource = extractStartFunctionBody(tsxSource)

  // Match: animate("any-selector", {...}, {...})
  // Accepts class selectors (.foo), tag selectors (path, circle), pseudo-selectors
  // (path:nth-of-type(2)), compound (path.cloud-path), and multi-selectors.
  const callRE = /\banimate\(\s*["']([^"'\n]+)["']\s*,\s*(\{)/g
  let m: RegExpExecArray | null

  while ((m = callRE.exec(searchSource)) !== null) {
    const selector = m[1]
    const keyframeStart = m.index + m[0].length - 1  // position of opening {

    const keyframeStr = extractBraceBlock(searchSource, keyframeStart)
    if (!keyframeStr) continue

    const keyframes = parseObj(keyframeStr)

    // Look for optional 3rd arg (transition options) after keyframe block
    const afterKeyframe = keyframeStart + keyframeStr.length
    const optionsMatch = searchSource.slice(afterKeyframe).match(/^\s*,\s*(\{)/)
    let options: Record<string, unknown> = {}
    if (optionsMatch) {
      const optStart = afterKeyframe + optionsMatch.index! + optionsMatch[0].length - 1
      const optStr = extractBraceBlock(searchSource, optStart)
      if (optStr) options = parseObj(optStr)
    }

    steps.push({ selector, keyframes, options })
  }

  return steps
}

export function playMotionPreview(
  container: HTMLElement,
  tsxSource: string,
  direction: 'start' | 'stop'
): void {
  const steps = parseAnimateCalls(tsxSource)
  if (steps.length === 0) return

  for (const step of steps) {
    // querySelectorAll handles class selectors (.foo), tag selectors (path, circle),
    // pseudo-selectors (path:nth-of-type(2)), compound (path.cloud-path), etc.
    let els: Element[]
    try {
      els = Array.from(container.querySelectorAll(step.selector))
    } catch {
      // Malformed or browser-unsupported selector — skip
      continue
    }
    if (els.length === 0) continue

    if (direction === 'start') {
      for (const el of els) {
        animate(
          el as Element,
          step.keyframes as Record<string, unknown>,
          { duration: 0.3, ...step.options } as Record<string, unknown>
        )
      }
    } else {
      // Reverse: animate back to neutral transforms/opacity
      const resetKeyframes: Record<string, unknown> = {}
      for (const key of Object.keys(step.keyframes)) {
        const val = step.keyframes[key]
        if (key === 'x' || key === 'y') resetKeyframes[key] = 0
        else if (key === 'scale' || key === 'scaleX' || key === 'scaleY') resetKeyframes[key] = 1
        else if (key === 'rotate') resetKeyframes[key] = 0
        else if (key === 'opacity') {
          // If animated from 0 (e.g. [0, 1]), reset to 0; otherwise reset to 1
          resetKeyframes[key] = Array.isArray(val) ? val[0] : 1
        }
        else if (key === 'pathLength') {
          // pathLength: [0, 1] → reset to 0 (hidden); pathLength: 1 → reset to 0
          resetKeyframes[key] = Array.isArray(val) ? val[0] : 0
        }
      }
      if (Object.keys(resetKeyframes).length > 0) {
        for (const el of els) {
          animate(el as Element, resetKeyframes as Record<string, unknown>, { duration: 0.2 })
        }
      }
    }
  }
}
