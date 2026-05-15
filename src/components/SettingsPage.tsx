import { useSettings } from '../hooks/useSettings'
import { ChevronLeft, Sun, Moon } from 'lucide-react'

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
        <div className="settings-radio-group">
          <label className="settings-radio">
            <input
              type="radio"
              name="insertMode"
              checked={settings.insertMode === 'motion'}
              onChange={() => updateSettings({ insertMode: 'motion' })}
            />
            <div>
              <div>Motion — ItsHover Animated</div>
              <div className="settings-radio-hint">Adds motion/react component to your project</div>
            </div>
          </label>
          <label className="settings-radio">
            <input
              type="radio"
              name="insertMode"
              checked={settings.insertMode === 'svg'}
              onChange={() => updateSettings({ insertMode: 'svg' })}
            />
            <div>
              <div>SvgIcon — Static</div>
              <div className="settings-radio-hint">Plain SVG node, no animation</div>
            </div>
          </label>
          <label className="settings-radio">
            <input
              type="radio"
              name="insertMode"
              checked={settings.insertMode === 'animated'}
              onChange={() => updateSettings({ insertMode: 'animated' })}
            />
            <div>
              <div>CSS Stroke — Basic</div>
              <div className="settings-radio-hint">Generic stroke-draw animation, SVG only</div>
            </div>
          </label>
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

      <div className="settings-footer">
        <span>AnimIconSVG v1.0.0 · </span>
        <a href="https://dev.izo.red" target="_blank" rel="noreferrer">dev.izo.red</a>
        <span> · Icons </span>
        <a href="https://itshover.com" target="_blank" rel="noreferrer">ItsHover</a>
        <span>, Apache 2.0</span>
      </div>
    </div>
  )
}
