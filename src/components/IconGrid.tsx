import { useMemo } from 'react'
import { useRegistry } from '../hooks/useRegistry'
import { useDebounce } from '../hooks/useDebounce'
import { IconCard } from './IconCard'
import { EmptyState } from './EmptyState'
import type { Category } from '../types'

const SOCIAL_NAMES = new Set([
  'discord-icon', 'facebook-icon', 'github-icon', 'github-copilot-icon',
  'gitlab-icon', 'gmail-icon', 'instagram-icon', 'linkedin-icon',
  'pinterest-icon', 'slack-icon', 'snapchat-icon', 'spotify-icon',
  'twitter-icon', 'twitter-x-icon', 'whatsapp-icon', 'youtube-icon',
  'apple-brand-logo', 'figma-icon',
])

const TECH_KEYWORDS = [
  'code', 'cpu', 'docker', 'golang', 'javascript', 'mysql',
  'nodejs', 'python', 'terminal', 'typescript', 'router',
  'wifi', 'bluetooth', 'brain-circuit',
]

function matchesCategory(name: string, cat: Category): boolean {
  if (cat === 'all') return true
  if (cat === 'arrows') return name.includes('arrow') || name.includes('chevron')
  if (cat === 'brand') return name.startsWith('brand-')
  if (cat === 'social') return SOCIAL_NAMES.has(name)
  if (cat === 'letters') return name.startsWith('letter-') || name.includes('dialpad')
  if (cat === 'tech') return TECH_KEYWORDS.some((k) => name.includes(k))
  return true
}

interface IconGridProps {
  searchQuery: string
  activeCategory: Category
  onToast: (msg: string) => void
  onMotionSuccess: (name: string) => void
}

export function IconGrid({ searchQuery, activeCategory, onToast, onMotionSuccess }: IconGridProps) {
  const { icons, loading } = useRegistry()
  const debouncedQuery = useDebounce(searchQuery, 150)

  const filtered = useMemo(() => {
    return icons.filter((icon) => {
      if (!matchesCategory(icon.name, activeCategory)) return false
      if (!debouncedQuery.trim()) return true
      return icon.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    })
  }, [icons, debouncedQuery, activeCategory])

  if (loading) {
    return (
      <div className="icon-grid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading icons...</span>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="icon-grid">
        <EmptyState onClear={() => {}} />
      </div>
    )
  }

  return (
    <div className="icon-grid">
      {filtered.map((icon) => (
        <IconCard key={icon.name} name={icon.name} onToast={onToast} onMotionSuccess={onMotionSuccess} />
      ))}
    </div>
  )
}
