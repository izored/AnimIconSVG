import { useState } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { PluginFooter } from './PluginFooter'

interface InfoPageProps {
  onBack: () => void
}

export function InfoPage({ onBack }: InfoPageProps) {
  const [donationOpen, setDonationOpen] = useState(false)

  return (
    <div className="info-page">
      <button className="back-btn" onClick={onBack}>
        <ChevronLeft size={16} />
        <span>Back</span>
      </button>

      <div className="info-section">
        <div className="info-title">AnimIconSVG</div>
        <div className="info-subtitle">by Reda Izo · izo.red</div>
        <div className="info-desc">
          Bridges open-source icon libraries and Framer's canvas. Animated, CSS animated, or static SVG — your choice. We curate and connect, we don't create.
        </div>
        <div className="info-links info-links--row">
          <a className="info-link" href="https://dev.izo.red" target="_blank" rel="noreferrer">
            dev.izo.red
          </a>
          <a className="info-link" href="https://github.com/izored" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
      </div>

      <div className="info-divider" />

      <div className="info-section">
        <div className="info-title">Icon Sources</div>
        <div className="info-desc">Fetched at runtime. No affiliation with any source.</div>
        <div className="source-list">
          <a className="source-row" href="https://itshover.com" target="_blank" rel="noreferrer">
            <span className="source-name">ItsHover</span>
            <span className="source-badge">Apache 2.0</span>
          </a>
          {/* add more sources here as rows */}
        </div>
      </div>

      <div className="info-bottom">
        <div className="info-attribution">
          Not affiliated with ItsHover or Framer (yet? ;))
          <br />
          Plugin free to use, forever.{' '}
          <button className="donation-trigger" onClick={() => setDonationOpen(true)}>
            Donations welcome.
          </button>
        </div>
        <PluginFooter />
      </div>
      {donationOpen && (
        <div className="donation-backdrop" onClick={() => setDonationOpen(false)}>
          <div className="donation-modal" onClick={e => e.stopPropagation()}>
            <button className="donation-close" onClick={() => setDonationOpen(false)}>
              <X size={14} />
            </button>
            <div className="donation-title">Support AnimIconSVG</div>
            <div className="donation-body">
              This plugin is built and maintained solo, for free, because the Framer community deserves it.
              <br /><br />
              If it saves you time on a project, a small contribution goes a long way.
            </div>
            <div className="donation-where">
              <div className="donation-where-label">Where to give</div>
              <div className="donation-where-hint">Links coming soon — checking the best platform.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
