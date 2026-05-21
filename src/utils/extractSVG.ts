// NOTE: 'g' intentionally excluded — <motion.g> is an open tag (non-self-closing),
// so including it causes TAG_RE to consume child elements via lazy match.
// Child paths/circles inside <g> are still captured because TAG_RE scans the full source.
const PRIMITIVES = 'path|circle|rect|line|polyline|polygon|ellipse'

// Matches plain AND motion-prefixed SVG primitives, e.g. <path .../> and <motion.circle .../>
const TAG_RE = new RegExp(
  `<(?:motion\\.)?(${PRIMITIVES})\\s+([\\s\\S]*?)\\/\\s*>`,
  'g'
)

// Non-SVG / React-only attribute names to drop (always)
const DROP_ATTRS_ALWAYS = new Set([
  'ref', 'key', 'tabIndex', 'onClick', 'onMouseEnter', 'onMouseLeave',
])
// Additional attrs dropped unless keepClasses=true (motion preview needs className for animate() targeting)
const DROP_ATTRS_CLASS = new Set(['className', 'class', 'id'])

/**
 * Pre-substitute JSX expression props before extractAttrs regex runs.
 * extractAttrs only matches attr="string" — JSX {expressions} get dropped.
 * This causes fill icons to lose detail paths (stroke={color} → invisible).
 */
function substituteJSXProps(raw: string, color: string, sw: string): string {
  return raw
    .replace(/\bfill=\{color\}/g, `fill="${color}"`)
    .replace(/\bstroke=\{color\}/g, `stroke="${color}"`)
    .replace(/\bstrokeWidth=\{strokeWidth\}/g, `strokeWidth="${sw}"`)
    .replace(/\bstrokeWidth=\{([0-9.]+)\}/g, 'strokeWidth="$1"')
    .replace(/\bopacity=\{([0-9.]+)\}/g, 'opacity="$1"')
    .replace(/\bfillOpacity=\{([0-9.]+)\}/g, 'fillOpacity="$1"')
    .replace(/\bstrokeOpacity=\{([0-9.]+)\}/g, 'strokeOpacity="$1"')
    .replace(/\br=\{([0-9.]+)\}/g, 'r="$1"')
    .replace(/\bcx=\{([0-9.]+)\}/g, 'cx="$1"')
    .replace(/\bcy=\{([0-9.]+)\}/g, 'cy="$1"')
    .replace(/\bx=\{([0-9.]+)\}/g, 'x="$1"')
    .replace(/\by=\{([0-9.]+)\}/g, 'y="$1"')
}

function extractAttrs(raw: string, keepClasses = false): string {
  // Only capture attr="value" pairs — skips JSX {expression} props entirely
  const pairs = [...raw.matchAll(/\b([\w-]+)="([^"]*)"/g)]
  return pairs
    .filter(([, name]) => {
      if (DROP_ATTRS_ALWAYS.has(name)) return false
      if (!keepClasses && DROP_ATTRS_CLASS.has(name)) return false
      return true
    })
    .map(([, name, val]) => {
      // Convert camelCase SVG presentation attrs to kebab-case
      // BUT: keep 'class' as-is (className → class for SVG compat)
      if (name === 'className') return `class="${val}"`
      const kebab = name.replace(/[A-Z]/g, c => '-' + c.toLowerCase())
      return `${kebab}="${val}"`
    })
    .join(' ')
}

function buildAnimationStyle(count: number): string {
  const rules = Array.from({ length: count }, (_, i) => {
    const delay = (i * 0.07).toFixed(2)
    return `svg > *:nth-child(${i + 2}) { stroke-dasharray: 200; stroke-dashoffset: 200; animation: anim-draw 0.45s ease ${delay}s forwards; }`
  }).join(' ')
  return `<style> @keyframes anim-draw { to { stroke-dashoffset: 0; } } ${rules} </style>`
}

export function detectIconStyle(tsxSource: string): 'fill' | 'stroke' {
  // Check the root SVG element's primary color prop
  // fill={color} → fill icon, stroke={color} → stroke icon
  const svgTagMatch = tsxSource.match(/<(?:motion\.)?svg\b([^>]*?)>/)
  if (svgTagMatch) {
    const svgAttrs = svgTagMatch[1]
    if (/\bfill=\{color\}/.test(svgAttrs)) return 'fill'
    if (/\bstroke=\{color\}/.test(svgAttrs)) return 'stroke'
  }
  // Fallback: count fill vs stroke occurrences
  const fillCount = (tsxSource.match(/\bfill=/g) || []).length
  const strokeCount = (tsxSource.match(/\bstroke=/g) || []).length
  return fillCount >= strokeCount ? 'fill' : 'stroke'
}

/**
 * Extract flat SVG primitives from `source` into `out`.
 * Shared by both the flat path and the group-aware path.
 */
function extractFlatPrimitives(source: string, out: string[], keepClasses: boolean): void {
  const re = new RegExp(TAG_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(source)) !== null) {
    const tag = m[1]
    const attrs = extractAttrs(m[2], keepClasses)
    if (attrs) out.push(`<${tag} ${attrs} />`)
  }
}

/**
 * Group-aware extraction: wraps <motion.g className="X">…</motion.g> blocks
 * as <g class="X">…</g> in the output, preserving source order and nesting.
 * Only used when keepClasses=true (motion preview mode).
 */
function extractElementsWithGroups(source: string): string[] {
  // Find top-level <motion.g> / <g> blocks with a className attr.
  type GroupSeg = { start: number; end: number; className: string; inner: string }
  const groups: GroupSeg[] = []

  const openTagRE = /<((?:motion\.)?g)\b([^>]*)>/g
  let m: RegExpExecArray | null

  while ((m = openTagRE.exec(source)) !== null) {
    // Skip if already inside a found group
    if (groups.some(g => m!.index >= g.start && m!.index < g.end)) continue

    const tag = m[1]           // "motion.g" or "g"
    const attrStr = m[2]
    const classMatch = attrStr.match(/className=["']([^"']+)["']/)
    if (!classMatch) continue

    const className = classMatch[1]
    const innerStart = m.index + m[0].length
    const closeTag = `</${tag}>`

    // Depth-track to find matching close tag (handles nesting of same tag type)
    let depth = 1
    let i = innerStart
    while (i < source.length && depth > 0) {
      const openIdx = source.indexOf(`<${tag}`, i)
      const closeIdx = source.indexOf(closeTag, i)
      if (closeIdx === -1) break
      if (openIdx !== -1 && openIdx < closeIdx) {
        depth++
        i = openIdx + 1
      } else {
        depth--
        if (depth === 0) {
          groups.push({
            start: m.index,
            end: closeIdx + closeTag.length,
            className,
            inner: source.slice(innerStart, closeIdx),
          })
        }
        i = closeIdx + 1
      }
    }
  }

  groups.sort((a, b) => a.start - b.start)

  const elements: string[] = []
  let pos = 0

  for (const group of groups) {
    // Primitives in the gap before this group
    extractFlatPrimitives(source.slice(pos, group.start), elements, true)
    // Recurse for nested groups / primitives inside this group
    const children = extractElementsWithGroups(group.inner)
    if (children.length > 0) {
      elements.push(`<g class="${group.className}">${children.join('')}</g>`)
    }
    pos = group.end
  }

  // Trailing primitives after the last group
  extractFlatPrimitives(source.slice(pos), elements, true)

  return elements
}

export function extractSVG(
  tsxSource: string,
  color: string = 'currentColor',
  size: number = 24,
  animated: boolean = false,
  styleOverride?: 'fill' | 'stroke',
  keepClasses = false
): string {
  const viewBoxMatch = tsxSource.match(/viewBox=["']([^"']+)["']/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'

  const strokeWidthMatch = tsxSource.match(/strokeWidth=["'{]([0-9.]+)["'}]/)
  const strokeWidth = strokeWidthMatch ? strokeWidthMatch[1] : '1.5'

  const iconStyle = styleOverride ?? detectIconStyle(tsxSource)
  const isFill = iconStyle === 'fill'

  // Substitute JSX expression props before regex extraction
  // extractAttrs only captures attr="string" — JSX {expressions} would be dropped,
  // causing fill icon detail paths (stroke={color}, strokeWidth={n}) to vanish.
  const preprocessed = substituteJSXProps(tsxSource, color, strokeWidth)

  // When keepClasses=true (motion preview), use group-aware extraction so
  // <motion.g className="X"> becomes <g class="X"> in the SVG — animate() can then
  // target those elements by class.
  const rawElements = keepClasses
    ? extractElementsWithGroups(preprocessed)
    : (() => {
        const out: string[] = []
        extractFlatPrimitives(preprocessed, out, false)
        return out
      })()

  // Filter background-clearing rect
  const filtered = rawElements.filter(el => !el.includes('d="M0 0h24v24H0z"'))

  if (filtered.length === 0) {
    return fallbackSVG(viewBox, color, size)
  }

  const animStyle = animated ? buildAnimationStyle(filtered.length) : ''

  // Motion preview: SVG elements default transform-origin to 0 0 (SVG viewport origin).
  // This makes scale/translate animations apply from top-left, looking broken.
  // Inject a <style> block so all child elements use fill-box origin (element center).
  const motionStyle = keepClasses
    ? '<style>svg > *, svg > * > * { transform-box: fill-box; transform-origin: center; }</style>'
    : ''

  const svgAttrs = isFill
    ? `fill="${color}" stroke="none"`
    : `fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}px" height="${size}px" ${svgAttrs}>${motionStyle}${animStyle}${filtered.join('')}</svg>`
}

function fallbackSVG(viewBox: string, color: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}px" height="${size}px" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
}
