import { useState, useEffect, useCallback } from 'react'
import type { Settings } from '../types'

const SETTINGS_KEY = 'animicon_settings'
const DEFAULTS: Settings = {
  insertMode: 'motion',
  defaultSize: 24,
  defaultColor: '#0a0a0a',
  defaultStyle: 'fill',
  theme: 'light',
}

function loadFromStorage(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const merged: Settings = { ...DEFAULTS, ...parsed }
      if ((merged.insertMode as string) === 'code') merged.insertMode = 'motion'
      return merged
    }
  } catch {
    // ignore
  }
  return DEFAULTS
}

export function useSettings(): [Settings, (partial: Partial<Settings>) => void] {
  // Lazy initializer reads localStorage synchronously — first render always has
  // correct saved settings, no flash of wrong insert mode / style on remount.
  const [settings, setSettings] = useState<Settings>(loadFromStorage)

  useEffect(() => {
    // Apply theme to DOM on mount (can't do in loadFromStorage — no DOM during SSR)
    document.documentElement.setAttribute('data-theme', settings.theme)

    const handleExternalUpdate = (e: Event) => {
      setSettings((e as CustomEvent<Settings>).detail)
    }
    window.addEventListener('animicon-settings-change', handleExternalUpdate)
    return () => window.removeEventListener('animicon-settings-change', handleExternalUpdate)
  }, [])

  const updateSettings = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      } catch (e) {
        console.error('Failed to save settings:', e)
      }
      if (partial.theme) {
        document.documentElement.setAttribute('data-theme', partial.theme)
      }
      window.dispatchEvent(new CustomEvent('animicon-settings-change', { detail: next }))
      return next
    })
  }, [])

  return [settings, updateSettings]
}