import { useState, useRef, useCallback, useEffect } from 'react'
import { useMakeDraggable } from 'framer-plugin'
import { useSettings } from '../hooks/useSettings'
import { extractSVG } from '../utils/extractSVG'
import { insertToCanvas, insertMotionComponent } from '../utils/insertToCanvas'
import { fetchWithCache } from '../utils/fetchWithCache'

interface IconCardProps {
  name: string
  onToast: (msg: string) => void
  onMotionSuccess?: (name: string) => void
}

const CACHE_PREFIX = 'animicon_icon_'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000

export function IconCard({ name, onToast, onMotionSuccess }: IconCardProps) {
  const [settings] = useSettings()
  const [tsxSource, setTsxSource] = useState<string | null>(null)
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fetchedRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const fetchSource = useCallback(async (): Promise<string | null> => {
    if (fetchedRef.current) return tsxSource
    if (isLoading) return null

    setIsLoading(true)
    try {
      const data = await fetchWithCache<any>(
        `https://www.itshover.com/r/${name}.json`,
        `${CACHE_PREFIX}${name}`,
        CACHE_TTL
      )
      const source = data.files?.[0]?.content || null
      if (source) {
        fetchedRef.current = true
        setTsxSource(source)
        setPreviewSvg(extractSVG(source, 'currentColor', 24))
        return source
      }
    } catch (e) {
      console.error(`Failed to fetch ${name}:`, e)
    } finally {
      setIsLoading(false)
    }
    return null
  }, [name, tsxSource, isLoading])

  // Keep ref current so IntersectionObserver doesn't capture stale closure
  const fetchSourceRef = useRef(fetchSource)
  fetchSourceRef.current = fetchSource

  // Auto-fetch when card scrolls into view
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchedRef.current) {
          fetchSourceRef.current()
          observer.disconnect()
        }
      },
      { rootMargin: '50px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Stroke-draw animation on hover using getTotalLength
  const animatePaths = (drawing: boolean) => {
    const svgEl = previewRef.current?.querySelector('svg')
    if (!svgEl) return
    const els = svgEl.querySelectorAll('path, circle, ellipse, line, polyline, polygon')
    els.forEach((el, i) => {
      const geo = el as SVGGeometryElement
      if (drawing) {
        let length = 60
        try { length = geo.getTotalLength() } catch { /* fallback */ }
        geo.style.strokeDasharray = `${length}`
        geo.style.strokeDashoffset = `${length}`
        geo.style.animation = 'none'
        void geo.getBoundingClientRect()
        geo.style.animation = `animicon-draw 0.45s ease ${i * 0.07}s forwards`
      } else {
        geo.style.strokeDasharray = ''
        geo.style.strokeDashoffset = ''
        geo.style.animation = ''
      }
    })
  }

  useMakeDraggable(cardRef, () => {
    if (tsxSource) {
      return {
        type: 'svg' as const,
        svg: extractSVG(tsxSource, settings.defaultColor, settings.defaultSize, settings.insertMode === 'animated'),
        name,
      }
    }
    return { type: 'svg' as const, svg: previewSvg ?? '', name }
  })

  const handleMouseEnter = () => animatePaths(true)
  const handleMouseLeave = () => animatePaths(false)

  const handleClick = async () => {
    const source = tsxSource || await fetchSource()
    if (!source) {
      onToast('Failed to load icon')
      return
    }

    if (settings.insertMode === 'motion') {
      const ok = await insertMotionComponent(source, name)
      if (ok) onMotionSuccess?.(name)
      else onToast('Failed to create component')
      return
    }

    const svg = extractSVG(source, settings.defaultColor, settings.defaultSize, settings.insertMode === 'animated')
    const inserted = await insertToCanvas(svg, name)
    onToast(inserted ? `Added ${name}` : 'Failed to add icon')
  }

  const displayName = name
    .replace(/-icon$/, '')
    .replace(/-svg$/, '')
    .replace(/-/g, ' ')

  return (
    <div
      ref={cardRef}
      className={`icon-card${isLoading ? ' icon-card--loading' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={previewRef} className="icon-preview">
        {previewSvg ? (
          <div dangerouslySetInnerHTML={{ __html: previewSvg }} />
        ) : (
          <div className={`icon-skeleton${isLoading ? ' icon-skeleton--pulse' : ''}`} />
        )}
      </div>
      <span className="icon-label">{displayName}</span>
    </div>
  )
}
