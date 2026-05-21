const d = require('../src/data/icon-sources.json')

function detectIconStyle(src) {
  const svgTagMatch = src.match(/<(?:motion\.)?svg\b([^>]*?)>/)
  if (svgTagMatch) {
    const a = svgTagMatch[1]
    if (/\bfill=\{color\}/.test(a)) return 'fill (primary)'
    if (/\bstroke=\{color\}/.test(a)) return 'stroke (primary)'
  }
  const fillCount = (src.match(/\bfill=/g) || []).length
  const strokeCount = (src.match(/\bstroke=/g) || []).length
  return `${fillCount >= strokeCount ? 'fill' : 'stroke'} (fallback fill=${fillCount} stroke=${strokeCount})`
}

const icons = ['angry-icon', 'annoyed-icon', 'alarm-clock-plus-icon', 'airplane-icon', 'accessibility-icon']
for (const name of icons) {
  const src = d[name]
  if (!src) { console.log(name + ': NOT FOUND'); continue }
  const result = detectIconStyle(src)
  console.log(name + ': ' + result)
}
