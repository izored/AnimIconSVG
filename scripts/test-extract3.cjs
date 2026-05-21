const d = require('../src/data/icon-sources.json')

// Replicate extractSVG WITH 'g' in PRIMITIVES (current broken code)
const PRIMS = 'path|circle|rect|line|polyline|polygon|ellipse|g'
const TAG_RE = new RegExp(`<(?:motion\\.)?(?:${PRIMS})\\s+([\\s\\S]*?)\\/\\s*>`, 'g')

const DROP_ATTRS = new Set(['className','class','ref','key','id','tabIndex','onClick','onMouseEnter','onMouseLeave'])

function extractAttrs(raw) {
  const pairs = [...raw.matchAll(/\b([\w-]+)="([^"]*)"/g)]
  return pairs
    .filter(([,n]) => !DROP_ATTRS.has(n))
    .map(([,n,v]) => {
      const k = n.replace(/[A-Z]/g, c => '-' + c.toLowerCase())
      return `${k}="${v}"`
    })
    .join(' ')
}

function substituteJSXProps(raw, color, sw) {
  return raw
    .replace(/\bfill=\{color\}/g, `fill="${color}"`)
    .replace(/\bstroke=\{color\}/g, `stroke="${color}"`)
    .replace(/\bstrokeWidth=\{strokeWidth\}/g, `strokeWidth="${sw}"`)
    .replace(/\bstrokeWidth=\{([0-9.]+)\}/g, 'strokeWidth="$1"')
}

function extract(src, color='currentColor') {
  const viewBox = src.match(/viewBox=["']([^"']+)["']/)?.[1] ?? '0 0 24 24'
  const sw = src.match(/strokeWidth=["'{]([0-9.]+)["'}]/)?.[1] ?? '1.5'
  const preprocessed = substituteJSXProps(src, color, sw)

  const elements = []
  TAG_RE.lastIndex = 0
  let m
  while ((m = TAG_RE.exec(preprocessed)) !== null) {
    const tag = m[0].match(/^<(?:motion\.)?(\w+)/)?.[1]
    const attrs = extractAttrs(m[1])
    if (attrs) elements.push(`<${tag} ${attrs} />`)
  }

  const filtered = elements.filter(el => !el.includes('d="M0 0h24v24H0z"'))
  console.log(`  ${filtered.length} elements:`)
  filtered.forEach(el => console.log('   ', el.slice(0,100)))
  return `<svg viewBox="${viewBox}" fill="none" stroke="${color}" stroke-width="${sw}">${filtered.join('')}</svg>`
}

const icons = ['angry-icon', 'alarm-clock-plus-icon']
for (const name of icons) {
  console.log('\n=== ' + name + ' ===')
  extract(d[name])
}
