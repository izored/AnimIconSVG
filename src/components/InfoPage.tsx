import { ChevronLeft } from 'lucide-react'

interface InfoPageProps {
  onBack: () => void
}

export function InfoPage({ onBack }: InfoPageProps) {
  return (
    <div className="info-page">
      <button className="back-btn" onClick={onBack}>
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>

      <div className="info-section">
        <div className="info-title">DIR</div>
        <div className="info-subtitle">dev.izo.red</div>
        <div className="info-desc">
          Framer plugin for animated icons.
        </div>
        <div className="info-links info-links--row">
          <a className="info-link" href="https://dev.izo.red" target="_blank" rel="noreferrer">
            dev.izo.red
          </a>
          <a className="info-link" href="https://github.com/izored" target="_blank" rel="noreferrer">
            github.com/izored
          </a>
        </div>
      </div>

      <div className="info-divider" />

      <div className="info-section">
        <div className="info-title">ItsHover Icons</div>
        <div className="info-desc">
          Animated icon library built with Motion.
          <br />
          Drag and drop into your Framer projects.
        </div>
        <div className="info-links info-links--row">
          <a className="info-link" href="https://itshover.com" target="_blank" rel="noreferrer">
            itshover.com
          </a>
          <a className="info-link" href="https://github.com/itshover/itshover" target="_blank" rel="noreferrer">
            github.com/itshover
          </a>
        </div>
      </div>

      <div className="info-bottom">
        <div className="info-attribution">
          Plugin by <a href="https://dev.izo.red" target="_blank" rel="noreferrer">DIR / dev.izo.red</a>. Not affiliated with ItsHover.
          <br />
          Icons by <a href="https://itshover.com" target="_blank" rel="noreferrer">ItsHover</a>, licensed under{' '}
          <a href="https://github.com/itshover/itshover?tab=Apache-2.0-1-ov-file#readme" target="_blank" rel="noreferrer">Apache 2.0</a>.
        </div>
        <div className="settings-footer">
          <span>AnimIconSVG v1.0.0 · </span>
          <a href="https://dev.izo.red" target="_blank" rel="noreferrer">dev.izo.red</a>
          <span> · Icons </span>
          <a href="https://itshover.com" target="_blank" rel="noreferrer">ItsHover</a>
          <span>, Apache 2.0</span>
        </div>
      </div>
    </div>
  )
}
