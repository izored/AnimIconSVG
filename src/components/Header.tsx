import { LayoutGrid, Settings, Info, X } from 'lucide-react'
import type { View, Category, Settings as AppSettings } from '../types'

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all',     label: 'All'     },
  { id: 'arrows',  label: 'Arrows'  },
  { id: 'brand',   label: 'Brand'   },
  { id: 'social',  label: 'Social'  },
  { id: 'letters', label: 'Letters' },
  { id: 'tech',    label: 'Tech'    },
]

interface HeaderProps {
  currentView: View
  onChangeView: (view: View) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  activeCategory: Category
  onCategoryChange: (c: Category) => void
  insertMode: AppSettings['insertMode']
  onToggleMode: () => void
}

export function Header({ currentView, onChangeView, searchQuery, onSearchChange, activeCategory, onCategoryChange, insertMode, onToggleMode }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-top">
        <div className="header-brand">
          <button
            className="mode-toggle"
            onClick={onToggleMode}
            type="button"
            title={`Switch to ${insertMode === 'svg' ? 'Motion' : 'SvgIcon'}`}
          >
            <span className={`mode-toggle-segment${insertMode === 'motion' ? ' mode-toggle-segment--active' : ''}`}>
              <span className="mode-toggle-dot-pill"><span className="mode-toggle-dot" /></span>
              <span className="mode-toggle-label">Motion</span>
            </span>
            <span className={`mode-toggle-segment${insertMode === 'svg' ? ' mode-toggle-segment--active' : ''}`}>
              <span className="mode-toggle-dot-pill"><span className="mode-toggle-dot" /></span>
              <span className="mode-toggle-label">SvgIcon</span>
            </span>
          </button>
        </div>

        <div className="header-search">
          <input
            type="text"
            placeholder="Search 263 icons..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="header-search-clear" onClick={() => onSearchChange('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <nav className="header-nav">
          <button
            className={`nav-btn ${currentView === 'grid' ? 'active' : ''}`}
            onClick={() => onChangeView('grid')}
            title="Grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => onChangeView('settings')}
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button
            className={`nav-btn ${currentView === 'info' ? 'active' : ''}`}
            onClick={() => onChangeView('info')}
            title="Info"
          >
            <Info size={16} />
          </button>
        </nav>
      </div>

      <div className="category-chips">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-chip${activeCategory === cat.id ? ' category-chip--active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  )
}
