#!/usr/bin/env node
/**
 * download-icons.js
 *
 * Fetches every ItsHover icon's TSX source and saves locally.
 * Run once: node scripts/download-icons.js
 *
 * Output:
 *   src/data/icon-sources.json   — { "icon-name": "...tsx..." }
 *   scripts/download-report.txt  — per-icon status log
 *
 * Requirements: Node 18+ (native fetch). No extra deps.
 */

const fs = require('fs')
const path = require('path')

const REGISTRY_PATH = path.join(__dirname, '../src/data/fallback-registry.json')
const OUT_PATH = path.join(__dirname, '../src/data/icon-sources.json')
const REPORT_PATH = path.join(__dirname, 'download-report.txt')

const BASE_URL = 'https://www.itshover.com/r'
const DELAY_MS = 80        // polite crawl delay between requests
const MAX_RETRIES = 2

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function fetchIcon(name, attempt = 0) {
  try {
    const res = await fetch(`${BASE_URL}/${name}.json`, {
      headers: { 'User-Agent': 'AnimIconSVG-plugin-downloader/1.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const content = data.files?.[0]?.content ?? null
    return { ok: !!content, content, status: res.status }
  } catch (err) {
    if (attempt < MAX_RETRIES) {
      await sleep(500)
      return fetchIcon(name, attempt + 1)
    }
    return { ok: false, content: null, error: err.message }
  }
}

async function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'))
  const names = registry.items.map(i => i.name)

  console.log(`Downloading ${names.length} icons from ItsHover…\n`)

  const results = {}
  const report = []
  let ok = 0, fail = 0

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const { ok: success, content, error, status } = await fetchIcon(name)

    if (success) {
      results[name] = content
      ok++
      process.stdout.write('.')
      report.push(`OK   ${name}`)
    } else {
      fail++
      process.stdout.write('x')
      report.push(`FAIL ${name}${error ? ` — ${error}` : ` — HTTP ${status}`}`)
    }

    if ((i + 1) % 50 === 0) process.stdout.write(` ${i + 1}/${names.length}\n`)
    await sleep(DELAY_MS)
  }

  console.log(`\n\nDone. ${ok} ok / ${fail} failed.\n`)

  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2))
  fs.writeFileSync(REPORT_PATH, report.join('\n'))

  const sizeKB = Math.round(fs.statSync(OUT_PATH).size / 1024)
  console.log(`Saved → src/data/icon-sources.json (${sizeKB} KB)`)
  console.log(`Report → scripts/download-report.txt`)

  if (fail > 0) {
    console.log(`\nFailed icons:`)
    report.filter(l => l.startsWith('FAIL')).forEach(l => console.log(' ', l))
  }
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
