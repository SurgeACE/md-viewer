import { useState, useCallback } from 'react'
import Header from './components/Header'
import Editor from './components/Editor'
import Preview from './components/Preview'
import FileDrawer from './components/FileDrawer'
import { useLocalStorage } from './hooks/useLocalStorage'
import { DEFAULT_CONTENT } from './utils/defaults'

const VIEW_MODES = { editor: 'editor', split: 'split', preview: 'preview' }

export default function App() {
  const [files, setFiles] = useLocalStorage('mdview_files', [
    { id: '1', name: 'Welcome.md', content: DEFAULT_CONTENT, updatedAt: Date.now() }
  ])
  const [activeFileId, setActiveFileId] = useLocalStorage('mdview_active', '1')
  const [viewMode, setViewMode] = useState(
    window.innerWidth < 768 ? VIEW_MODES.editor : VIEW_MODES.split
  )
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useLocalStorage('mdview_theme', 'dark')

  const activeFile = files.find(f => f.id === activeFileId) || files[0]

  const updateContent = useCallback((content) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, content, updatedAt: Date.now() } : f
    ))
  }, [activeFileId, setFiles])

  const createFile = useCallback((name) => {
    const newFile = {
      id: Date.now().toString(),
      name: name.endsWith('.md') ? name : name + '.md',
      content: `# ${name.replace('.md', '')}\n\n`,
      updatedAt: Date.now()
    }
    setFiles(prev => [...prev, newFile])
    setActiveFileId(newFile.id)
    setDrawerOpen(false)
    setViewMode(VIEW_MODES.editor)
  }, [setFiles, setActiveFileId])

  const deleteFile = useCallback((id) => {
    setFiles(prev => {
      const next = prev.filter(f => f.id !== id)
      if (next.length === 0) {
        const fallback = { id: Date.now().toString(), name: 'Untitled.md', content: '# Untitled\n\n', updatedAt: Date.now() }
        return [fallback]
      }
      return next
    })
    if (activeFileId === id) {
      setActiveFileId(files.find(f => f.id !== id)?.id || '')
    }
  }, [activeFileId, files, setFiles, setActiveFileId])

  const renameFile = useCallback((id, newName) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, name: newName.endsWith('.md') ? newName : newName + '.md', updatedAt: Date.now() } : f
    ))
  }, [setFiles])

  const importFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const newFile = {
          id: Date.now().toString(),
          name: file.name,
          content: ev.target.result,
          updatedAt: Date.now()
        }
        setFiles(prev => [...prev, newFile])
        setActiveFileId(newFile.id)
        setDrawerOpen(false)
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setFiles, setActiveFileId])

  const exportFile = useCallback(() => {
    if (!activeFile) return
    const blob = new Blob([activeFile.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = activeFile.name
    a.click()
    URL.revokeObjectURL(url)
  }, [activeFile])

  const copyContent = useCallback(async () => {
    if (!activeFile) return
    try {
      await navigator.clipboard.writeText(activeFile.content)
    } catch {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = activeFile.content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }, [activeFile])

  const shareContent = useCallback(async () => {
    if (!activeFile || !navigator.share) return
    try {
      await navigator.share({
        title: activeFile.name,
        text: activeFile.content,
      })
    } catch { /* user cancelled */ }
  }, [activeFile])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      <Header
        viewMode={viewMode}
        onViewChange={setViewMode}
        onMenuClick={() => setDrawerOpen(true)}
        onImport={importFile}
        onExport={exportFile}
        onCopy={copyContent}
        onShare={shareContent}
        onThemeToggle={toggleTheme}
        theme={theme}
        fileName={activeFile?.name || 'Untitled.md'}
      />

      <main className="workspace">
        {(viewMode === 'editor' || viewMode === 'split') && (
          <Editor
            content={activeFile?.content || ''}
            onChange={updateContent}
            isFullWidth={viewMode === 'editor'}
          />
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Preview
            content={activeFile?.content || ''}
            isFullWidth={viewMode === 'preview'}
          />
        )}
      </main>

      {/* Mobile bottom nav for view switching */}
      <nav className="mobile-nav">
        <button
          className={`mobile-nav-btn ${viewMode === 'editor' ? 'active' : ''}`}
          onClick={() => setViewMode('editor')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span>Edit</span>
        </button>
        <button
          className={`mobile-nav-btn ${viewMode === 'split' ? 'active' : ''}`}
          onClick={() => setViewMode('split')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
          <span>Split</span>
        </button>
        <button
          className={`mobile-nav-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span>Preview</span>
        </button>
        <button
          className="mobile-nav-btn"
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Files</span>
        </button>
      </nav>

      <FileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        files={files}
        activeFileId={activeFileId}
        onSelect={(id) => { setActiveFileId(id); setDrawerOpen(false) }}
        onCreate={createFile}
        onDelete={deleteFile}
        onRename={renameFile}
        onImport={importFile}
      />
    </div>
  )
}
