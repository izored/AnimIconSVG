import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { IconGrid } from './components/IconGrid'
import { SettingsPage } from './components/SettingsPage'
import { InfoPage } from './components/InfoPage'
import { Toast } from './components/Toast'
import { MotionGuide } from './components/MotionGuide'
import { useSettings } from './hooks/useSettings'
import type { View, Category } from './types'

export default function App() {
  const [view, setView] = useState<View>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [toast, setToast] = useState<string | null>(null)
  const [guideName, setGuideName] = useState<string | null>(null)
  const [settings, updateSettings] = useSettings()

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const showMotionGuide = useCallback((name: string) => setGuideName(name), [])

  const goBack = useCallback(() => setView('grid'), [])

  const handleToggleMode = useCallback(() => {
    updateSettings({ insertMode: settings.insertMode === 'svg' ? 'motion' : 'svg' })
  }, [settings.insertMode, updateSettings])

  return (
    <div className="app">
      <Header
        currentView={view}
        onChangeView={setView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        insertMode={settings.insertMode}
        onToggleMode={handleToggleMode}
      />
      <main className="main-content">
        {view === 'grid' && <IconGrid searchQuery={searchQuery} activeCategory={activeCategory} onToast={showToast} onMotionSuccess={showMotionGuide} />}
        {view === 'settings' && <SettingsPage onBack={goBack} />}
        {view === 'info' && <InfoPage onBack={goBack} />}
      </main>
      {toast && <Toast message={toast} />}
      {guideName && <MotionGuide componentName={guideName} onDismiss={() => setGuideName(null)} />}
    </div>
  )
}
