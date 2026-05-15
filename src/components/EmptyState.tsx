import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  onClear: () => void
}

export function EmptyState({ onClear }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <SearchX size={32} />
      </div>
      <div className="empty-state-title">No icons found</div>
      <div className="empty-state-subtitle">Try a different search term</div>
      <button className="empty-state-btn" onClick={onClear}>
        Clear search
      </button>
    </div>
  )
}