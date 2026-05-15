import React from 'react'
import ReactDOM from 'react-dom/client'
import { framer } from 'framer-plugin'
import App from './App'
import './App.css'

try {
  framer.showUI({ width: 320, height: 600 })
} catch { /* not running inside Framer */ }

try {
  const stored = localStorage.getItem('animicon_settings')
  if (stored) {
    const parsed = JSON.parse(stored)
    document.documentElement.setAttribute('data-theme', parsed.theme || 'light')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
  }
} catch {
  document.documentElement.setAttribute('data-theme', 'light')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)