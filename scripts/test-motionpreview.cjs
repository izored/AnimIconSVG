const d = require('../src/data/icon-sources.json')

function extractBraceBlock(str, pos) {
  if (str[pos] !== '{') return null
  let depth = 0, i = pos
  while (i < str.length) {
    if (str[i] === '{') depth++
    else if (str[i] === '}') { depth--; if (depth === 0) return str.slice(pos, i + 1) }
    i++
  }
  return null
}

function parseObj(str) {
  try { return new Function('"use strict"; return (' + str + ')')() } catch { return {} }
}

function extractStartFunctionBody(tsxSource) {
  const startNameMatch = tsxSource.match(/\bstartAnimation\s*:\s*(\w+)/)
  const fnName = startNameMatch ? startNameMatch[1] : 'start'
  const fnDeclRE = new RegExp(`\\bconst\\s+${fnName}\\s*=`)
  const fnDeclMatch = fnDeclRE.exec(tsxSource)
  if (!fnDeclMatch) return tsxSource

  let pos = fnDeclMatch.index + fnDeclMatch[0].length
  while (pos < tsxSource.length && tsxSource[pos] !== '{') pos++
  if (pos >= tsxSource.length) return tsxSource
  return extractBraceBlock(tsxSource, pos) ?? tsxSource
}

function parseAnimateCalls(tsxSource) {
  const steps = []
  const searchSource = extractStartFunctionBody(tsxSource)
  const callRE = /\banimate\(\s*["']([^"'\n]+)["']\s*,\s*(\{)/g
  let m
  while ((m = callRE.exec(searchSource)) !== null) {
    const selector = m[1]
    const keyframeStart = m.index + m[0].length - 1
    const keyframeStr = extractBraceBlock(searchSource, keyframeStart)
    if (!keyframeStr) continue
    const keyframes = parseObj(keyframeStr)
    steps.push({ selector, keyframes })
  }
  return steps
}

const icons = ['angry-icon', 'ampersand-icon', 'alarm-clock-plus-icon', 'trash-icon', 'brain-circuit-icon']
for (const name of icons) {
  const steps = parseAnimateCalls(d[name])
  console.log(`\n${name}: ${steps.length} steps`)
  steps.forEach(s => console.log(`  "${s.selector}" ->`, JSON.stringify(s.keyframes)))
}
