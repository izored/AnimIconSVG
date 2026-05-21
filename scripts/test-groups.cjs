const d = require('../src/data/icon-sources.json')

const PRIMITIVES = 'path|circle|rect|line|polyline|polygon|ellipse'
const TAG_RE = new RegExp(`<(?:motion\\.)?(${PRIMITIVES})\\s+([\\s\\S]*?)\\/\\s*>`, 'g')

const DROP_ATTRS_ALWAYS = new Set(['ref','key','tabIndex','onClick','onMouseEnter','onMouseLeave'])
const DROP_ATTRS_CLASS = new Set(['className','class','id'])

function extractAttrs(raw, keepClasses = false) {
  const pairs = [...raw.matchAll(/\b([\w-]+)="([^"]*)"/g)]
  return pairs
    .filter(([, name]) => {
      if (DROP_ATTRS_ALWAYS.has(name)) return false
      if (!keepClasses && DROP_ATTRS_CLASS.has(name)) return false
      return true
    })
    .map(([, name, val]) => {
      if (name === 'className') return `class="${val}"`
      const kebab = name.replace(/[A-Z]/g, c => '-' + c.toLowerCase())
      return `${kebab}="${val}"`
    })
    .join(' ')
}

function extractFlatPrimitives(source, out, keepClasses) {
  const re = new RegExp(TAG_RE.source, 'g')
  let m
  while ((m = re.exec(source)) !== null) {
    const tag = m[1]
    const attrs = extractAttrs(m[2], keepClasses)
    if (attrs) out.push(`<${tag} ${attrs} />`)
  }
}

function extractElementsWithGroups(source) {
  const groups = []
  const openTagRE = /<((?:motion\.)?g)\b([^>]*)>/g
  let m
  while ((m = openTagRE.exec(source)) !== null) {
    if (groups.some(g => m.index >= g.start && m.index < g.end)) continue
    const tag = m[1]
    const attrStr = m[2]
    const classMatch = attrStr.match(/className=["']([^"']+)["']/)
    if (!classMatch) continue
    const className = classMatch[1]
    const innerStart = m.index + m[0].length
    const closeTag = `</${tag}>`
    let depth = 1, i = innerStart
    while (i < source.length && depth > 0) {
      const openIdx = source.indexOf(`<${tag}`, i)
      const closeIdx = source.indexOf(closeTag, i)
      if (closeIdx === -1) break
      if (openIdx !== -1 && openIdx < closeIdx) { depth++; i = openIdx + 1 }
      else {
        depth--
        if (depth === 0) groups.push({ start: m.index, end: closeIdx + closeTag.length, className, inner: source.slice(innerStart, closeIdx) })
        i = closeIdx + 1
      }
    }
  }
  groups.sort((a, b) => a.start - b.start)
  const elements = []
  let pos = 0
  for (const group of groups) {
    extractFlatPrimitives(source.slice(pos, group.start), elements, true)
    const children = extractElementsWithGroups(group.inner)
    if (children.length > 0) elements.push(`<g class="${group.className}">${children.join('')}</g>`)
    pos = group.end
  }
  extractFlatPrimitives(source.slice(pos), elements, true)
  return elements
}

function substituteJSXProps(raw, color, sw) {
  return raw
    .replace(/\bfill=\{color\}/g, `fill="${color}"`)
    .replace(/\bstroke=\{color\}/g, `stroke="${color}"`)
    .replace(/\bstrokeWidth=\{strokeWidth\}/g, `strokeWidth="${sw}"`)
    .replace(/\bstrokeWidth=\{([0-9.]+)\}/g, 'strokeWidth="$1"')
}

for (const name of ['angry-icon', 'currency-bitcoin-icon', 'alarm-clock-plus-icon']) {
  console.log(`\n=== ${name} ===`)
  const src = d[name]
  const preprocessed = substituteJSXProps(src, 'currentColor', '1.5')
  const els = extractElementsWithGroups(preprocessed).filter(el => !el.includes('d="M0 0h24v24H0z"'))
  els.forEach(el => console.log(' ', el.slice(0, 140)))
}
