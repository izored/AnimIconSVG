import { useState, useEffect } from 'react'
import fallbackRegistry from '../data/fallback-registry.json'
import type { IconMeta } from '../types'

const REGISTRY_URL = 'https://raw.githubusercontent.com/itshover/itshover/master/registry.json'
const CACHE_KEY = 'animicon_registry'
const CACHE_TTL = 24 * 60 * 60 * 1000

export function useRegistry() {
  const [icons, setIcons] = useState<IconMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          if (Date.now() - timestamp < CACHE_TTL && Array.isArray(data)) {
            setIcons(data)
            setLoading(false)
            return
          }
        }
      } catch {
        // localStorage disabled or corrupted
      }

      try {
        const res = await fetch(REGISTRY_URL)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const items: IconMeta[] = (data.items || []).map((item: any) => ({
          name: item.name,
        }))

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: items, timestamp: Date.now() }))
        } catch {
          // localStorage full or disabled
        }

        setIcons(items)
      } catch (err) {
        console.error('Registry fetch failed:', err)
        const items: IconMeta[] = (fallbackRegistry as any).items || []
        setIcons(items)
        setError('Using offline registry')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { icons, loading, error }
}