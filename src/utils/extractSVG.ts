const PRIMITIVES = 'path|circle|rect|line|polyline|polygon|ellipse'

// Matches plain AND motion-prefixed SVG primitives, e.g. <path .../> and <motion.circle .../>
const TAG_RE = new RegExp(
  `<(?:motion\\.)?(${PRIMITIVES})\\s+([\\s\\S]*?)\\/\\s*>`,
  'g'
)

// Non-SVG / React-only attribute names to drop
const DROP_ATTRS = new Set([
  'className', 'class', 'ref', 'key', 'id', 'tabIndex',
  'onClick', 'onMouseEnter', 'onMouseLeave',
])

function extractAttrs(raw: string): string {
  // Only capture attr="value" pairs — skips JSX {expression} props entirely
  const pairs = [...raw.matchAll(/\b([\w-]+)="([^"]*)"/g)]
  return pairs
    .filter(([, name]) => !DROP_ATTRS.has(name))
    .map(([, name, val]) => {
      // Convert camelCase SVG presentation attrs to kebab-case
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

export function extractSVG(tsxSource: string, color: string = 'currentColor', size: number = 24, animated: boolean = false): string {
  const viewBoxMatch = tsxSource.match(/viewBox=["']([^"']+)["']/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'

  const strokeWidthMatch = tsxSource.match(/strokeWidth=["']([^"']+)["']/)
  const strokeWidth = strokeWidthMatch ? strokeWidthMatch[1] : '2'

  const elements: string[] = []
  TAG_RE.lastIndex = 0
  let match
  while ((match = TAG_RE.exec(tsxSource)) !== null) {
    const tag = match[1]
    const attrs = extractAttrs(match[2])
    if (attrs) elements.push(`<${tag} ${attrs} />`)
  }

  // Filter background-clearing rect
  const filtered = elements.filter(el => !el.includes('d="M0 0h24v24H0z"'))

  if (filtered.length === 0) {
    return fallbackSVG(viewBox, color, size)
  }

  const animStyle = animated ? buildAnimationStyle(filtered.length) : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}px" height="${size}px" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${animStyle}${filtered.join('')}</svg>`
}

function fallbackSVG(viewBox: string, color: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}px" height="${size}px" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
}
