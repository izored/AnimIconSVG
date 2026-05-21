import { useSettings } from '../hooks/useSettings'
import { ChevronLeft, Sun, Moon, Zap, PenLine, Square, CircleDot, Circle } from 'lucide-react'
import { PluginFooter } from './PluginFooter'

const INSERT_MODES = [
  {
    value: 'motion' as const,
    label: 'Motion',
    icon: Zap,
    hint: 'Animated code component, hover to play',
  },
  {
    value: 'animated' as const,
    label: 'CSS Stroke',
    icon: PenLine,
    hint: 'CSS stroke animation, no packages',
  },
  {
    value: 'svg' as const,
    label: 'Static',
    icon: Square,
    hint: 'Plain SVG, no animation',
  },
]

const ICON_STYLES = [
  {
    value: 'fill' as const,
    label: 'Fill',
    icon: CircleDot,
    hint: 'Solid filled, best for brand icons',
  },
  {
    value: 'stroke' as const,
    label: 'Stroke',
    hint: 'Outlined, best for UI icons',
    icon: Circle,
  },
]

const PRESET_COLORS = [
  { label: 'White', value: '#f5f5f5' },
  { label: 'Black', value: '#0a0a0a' },
  { label: 'Orange', value: '#ff6b35' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
]

interface SettingsPageProps {
  onBack: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const [settings, updateSettings] = useSettings()

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark'
    const updates: Partial<typeof settings> = { theme: next }
    if (settings.defaultColor === '#0a0a0a' || settings.defaultColor === '#f5f5f5') {
      updates.defaultColor = next === 'dark' ? '#f5f5f5' : '#0a0a0a'
    }
    updateSettings(updates)
    document.documentElement.setAttribute('data-theme', next)
  }

  const handleClearCache = () => {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith('animicon_')) {
          localStorage.removeItem(key)
        }
      })
      alert('Cache cleared')
    } catch {
      alert('Could not clear cache')
    }
  }

  return (
    <div className="settings-page">
      <button className="back-btn" onClick={onBack}>
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>

      <div className="settings-row-pair">
        <div className="settings-section settings-section--half">
          <div className="settings-section-title">Theme</div>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {settings.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
            <span>{settings.theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>

        <div className="settings-section settings-section--half">
          <div className="settings-section-title">Cache</div>
          <button className="settings-btn settings-btn--small" onClick={handleClearCache}>
            Clear cache
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Insert Mode</div>
        <div className="mode-btn-group">
          {INSERT_MODES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`mode-btn${settings.insertMode === value ? ' mode-btn--active' : ''}`}
              onClick={() => updateSettings({ insertMode: value })}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="mode-hint">
          {INSERT_MODES.find(m => m.value === settings.insertMode)?.hint}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Icon Style</div>
        <div className="mode-btn-group">
          {ICON_STYLES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`mode-btn${settings.defaultStyle === value ? ' mode-btn--active' : ''}`}
              onClick={() => updateSettings({ defaultStyle: value })}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="mode-hint">
          {ICON_STYLES.find(s => s.value === settings.defaultStyle)?.hint}
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Default Size</div>
        <div className="settings-size-row">
          <input
            type="range"
            className="settings-slider"
            min={16}
            max={64}
            step={2}
            value={settings.defaultSize}
            onChange={(e) => updateSettings({ defaultSize: Number(e.target.value) })}
          />
          <span className="settings-size-value">{settings.defaultSize}px</span>
        </div>
        <div className="settings-size-hints">
          <span>16px</span>
          <span>64px</span>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Default Color</div>
        <div className="settings-color-row">
          <input
            type="color"
            className="settings-color-input"
            value={settings.defaultColor}
            onChange={(e) => updateSettings({ defaultColor: e.target.value })}
          />
          <div className="settings-swatches">
            {PRESET_COLORS.map((c) => (
              <div
                key={c.value}
                className={`swatch ${settings.defaultColor === c.value ? 'active' : ''}`}
                style={{ background: c.value }}
                onClick={() => updateSettings({ defaultColor: c.value })}
                title={c.label}
              />
            ))}
          </div>
          <span className="settings-color-hex">{settings.defaultColor}</span>
        </div>
      </div>

      <PluginFooter />
    </div>
  )
}
