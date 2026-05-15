import { useState, useEffect, useCallback } from 'react'
import type { Settings } from '../types'

const SETTINGS_KEY = 'animicon_settings'
const DEFAULTS: Settings = {
  insertMode: 'motion',
  defaultSize: 24,
  defaultColor: '#0a0a0a',
  theme: 'light',
}

export function useSettings(): [Settings, (partial: Partial<Settings>) => void] {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const merged: Settings = { ...DEFAULTS, ...parsed }
        if ((merged.insertMode as string) === 'code') merged.insertMode = 'motion'
        setSettings(merged)
        document.documentElement.setAttribute('data-theme', merged.theme)
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
      }
    } catch (e) {
      console.error('Failed to load settings:', e)
      document.documentElement.setAttribute('data-theme', 'light')
    }

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