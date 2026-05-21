const d = require('../src/data/icon-sources.json')
const src = d['angry-icon']

const PRIMITIVES_BROKEN = 'path|circle|rect|line|polyline|polygon|ellipse|g'
const PRIMITIVES_FIXED  = 'path|circle|rect|line|polyline|polygon|ellipse'

function makeRE(prims) {
  return new RegExp(`<(?:motion\\.)?(?:${prims})\\s+[\\s\\S]*?\\/\\s*>`, 'g')
}

function extractAttrs(raw) {
  return [...raw.matchAll(/\b([\w-]+)="([^"]*)"/g)]
    .map(([,n,v]) => `${n}="${v}"`)
    .join(' ')
}

function extractAll(src, re) {
  const TAG = new RegExp(`<(?:motion\\.)?(?:${re})\\s+([\\s\\S]*?)\\/\\s*>`, 'g')
  const out = []
  let m
  while ((m = TAG.exec(src)) !== null) {
    const attrs = extractAttrs(m[1])
    if (attrs) out.push({ full: m[0].slice(0,80).replace(/\n/g,' '), attrs })
  }
  return out
}

console.log('=== BROKEN (with g) ===')
extractAll(src, PRIMITIVES_BROKEN).forEach(e => console.log(e.attrs.slice(0,80)))

console.log('\n=== FIXED (without g) ===')
extractAll(src, PRIMITIVES_FIXED).forEach(e => console.log(e.attrs.slice(0,80)))
