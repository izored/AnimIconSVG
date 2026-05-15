const FETCH_TIMEOUT_MS = 8000

export async function fetchWithCache<T>(url: string, cacheKey: string, ttlMs: number): Promise<T> {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < ttlMs) {
        return data as T
      }
    }
  } catch {
    // localStorage disabled or corrupted
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()

  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage full or disabled
  }

  return data as T
}
