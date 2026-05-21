import { useState, useRef, useCallback, useEffect } from 'react'
import { useMakeDraggable } from 'framer-plugin'
import { useSettings } from '../hooks/useSettings'
import { extractSVG, detectIconStyle } from '../utils/extractSVG'
import { extractMotionComponent } from '../utils/extractMotionComponent'
import { insertToCanvas, insertMotionComponent } from '../utils/insertToCanvas'
import { downloadText } from '../utils/downloadFile'
import { generateLicense } from '../utils/generateLicense'
import { playMotionPreview } from '../utils/motionPreview'
import iconSources from '../data/icon-sources.json'

interface IconCardProps {
  name: string
  onToast: (msg: string) => void
  onMotionSuccess?: (name: string) => void
}

const sources = iconSources as Record<string, string>

export function IconCard({ name, onToast, onMotionSuccess }: IconCardProps) {
  const [settings] = useSettings()
  const [tsxSource, setTsxSource] = useState<string | null>(null)
  const [previewSvg, setPreviewSvg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const fetchedRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const fetchSource = useCallback(async (): Promise<string | null> => {
    if (fetchedRef.current && tsxSource) return tsxSource
    if (isLoading) return null

    setIsLoading(true)
    try {
      // All icon sources are local — no network request needed.
      // IntersectionObserver still ensures we only process icons in viewport.
      const source = sources[name] ?? null
      if (source) {
        fetchedRef.current = true
        setTsxSource(source)
        // Always keep class attrs — motion preview needs them for animate() targeting,
        // and they're harmless for static preview. Re-extracted by useEffect on mode change.
        setPreviewSvg(extractSVG(source, 'currentColor', 24, false, undefined, true))
        return source
      } else {
        console.warn(`Icon not found in local sources: ${name}`)
      }
    } finally {
      setIsLoading(false)
    }
    return null
  }, [name, tsxSource, isLoading])

  // Re-extract preview SVG when tsxSource loads or insert mode changes.
  // keepClasses=true always — motion preview needs class attrs for animate() targeting.
  useEffect(() => {
    if (!tsxSource) return
    setPreviewSvg(extractSVG(tsxSource, 'currentColor', 24, false, undefined, true))
  }, [tsxSource, settings.insertMode])

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

  const toPascalCase = (kebab: string) =>
    kebab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')

  const handleCopySVG = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const source = tsxSource || await fetchSource()
    if (!source) { onToast('Source not loaded'); return }
    const svg = extractSVG(source, settings.defaultColor, settings.defaultSize, true, settings.defaultStyle)
    try {
      await navigator.clipboard.writeText(svg)
      onToast('Copied SVG')
    } catch {
      onToast('Copy failed')
    }
  }

  const handleDownloadTSX = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const source = tsxSource || await fetchSource()
    if (!source) { onToast('Source not loaded'); return }
    const componentName = toPascalCase(name)
    downloadText(`${componentName}.tsx`, extractMotionComponent(source))
    downloadText('LICENSE', generateLicense(name))
    onToast('Downloaded')
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (settings.insertMode === 'svg') return  // static mode — no animation

    const container = previewRef.current
    if (!container) return

    if (settings.insertMode === 'motion' && tsxSource) {
      // Play the actual ItsHover useAnimate animation on the SVG DOM elements
      playMotionPreview(container, tsxSource, 'start')
    } else {
      const isFill = tsxSource ? detectIconStyle(tsxSource) === 'fill' : false
      if (isFill) {
        const svgEl = container.querySelector('svg')
        if (svgEl) {
          svgEl.classList.remove('icon-fill-bounce')
          void svgEl.getBoundingClientRect()
          svgEl.classList.add('icon-fill-bounce')
        }
      } else {
        animatePaths(true)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    const container = previewRef.current
    if (!container) return

    if (settings.insertMode === 'motion' && tsxSource) {
      playMotionPreview(container, tsxSource, 'stop')
    } else {
      animatePaths(false)
      container.querySelector('svg')?.classList.remove('icon-fill-bounce')
    }
  }

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

    const svg = extractSVG(source, settings.defaultColor, settings.defaultSize, settings.insertMode === 'animated', settings.defaultStyle)
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
      {isHovered && tsxSource && (
        <div className="icon-actions" onClick={e => e.stopPropagation()}>
          <button className="icon-action-btn" onClick={handleCopySVG}>Copy SVG</button>
          <button className="icon-action-btn" onClick={handleDownloadTSX}>↓ TSX</button>
        </div>
      )}
    </div>
  )
}
