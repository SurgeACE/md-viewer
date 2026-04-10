import { useState, useCallback, useRef } from 'react'
import Header from './components/Header'
import Editor from './components/Editor'
import Preview from './components/Preview'
import FileDrawer from './components/FileDrawer'
import StatsBar from './components/StatsBar'
import { useLocalStorage } from './hooks/useLocalStorage'
import { renderMarkdown } from './utils/markdown'
import { DEFAULT_CONTENT } from './utils/defaults'

const VIEW_MODES = { editor: 'editor', split: 'split', preview: 'preview' }

export default function App() {
  const [files, setFiles] = useLocalStorage('mdview_files', [
    { id: '1', name: 'Welcome.md', content: DEFAULT_CONTENT, updatedAt: Date.now(), folderId: null }
  ])
  const [folders, setFolders] = useLocalStorage('mdview_folders', [])
  const [activeFileId, setActiveFileId] = useLocalStorage('mdview_active', '1')
  const [viewMode, setViewMode] = useState(
    window.innerWidth < 768 ? VIEW_MODES.editor : VIEW_MODES.split
  )
  const [splitOrientation, setSplitOrientation] = useLocalStorage('mdview_split_orient', 'horizontal')
  const [splitSize, setSplitSize] = useState(50) // percent for first pane
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [theme, setTheme] = useLocalStorage('mdview_theme', 'dark')
  const [syncScroll, setSyncScroll] = useLocalStorage('mdview_sync_scroll', true)
  const [toast, setToast] = useState(null)
  const [splitMenuOpen, setSplitMenuOpen] = useState(false)
  const editorRef = useRef(null)
  const previewRef = useRef(null)
  const splitLongPressTimer = useRef(null)
  const isDraggingSplit = useRef(false)

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }, [])

  const activeFile = files.find(f => f.id === activeFileId) || files[0]

  const updateContent = useCallback((content) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, content, updatedAt: Date.now() } : f
    ))
  }, [activeFileId, setFiles])

  const createFile = useCallback((name, folderId = null) => {
    const newFile = {
      id: Date.now().toString(),
      name: name.endsWith('.md') ? name : name + '.md',
      content: `# ${name.replace('.md', '')}\n\n`,
      updatedAt: Date.now(),
      folderId,
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

  const createFolder = useCallback((name) => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      colorIndex: folders.length,
      createdAt: Date.now(),
    }
    setFolders(prev => [...prev, newFolder])
  }, [folders.length, setFolders])

  const deleteFolder = useCallback((folderId) => {
    // Move all files in the folder back to root
    setFiles(prev => prev.map(f => f.folderId === folderId ? { ...f, folderId: null } : f))
    setFolders(prev => prev.filter(f => f.id !== folderId))
  }, [setFiles, setFolders])

  const moveFile = useCallback((fileId, targetFolderId, beforeFileId = null) => {
    setFiles(prev => {
      const updated = prev.map(f =>
        f.id === fileId ? { ...f, folderId: targetFolderId || null } : f
      )
      // If beforeFileId provided, reorder
      if (beforeFileId && beforeFileId !== fileId) {
        const file = updated.find(f => f.id === fileId)
        const without = updated.filter(f => f.id !== fileId)
        const idx = without.findIndex(f => f.id === beforeFileId)
        if (idx >= 0) {
          without.splice(idx, 0, file)
          return without
        }
      }
      return updated
    })
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

  const exportFile = useCallback((format = 'md') => {
    if (!activeFile) return
    let blob, filename, mimeType
    switch (format) {
      case 'html': {
        const html = renderMarkdown(activeFile.content)
        const fullHtml = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${activeFile.name}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.7;color:#1a1a1a}
pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow-x:auto}code{font-family:'JetBrains Mono',monospace;font-size:0.9em}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #e0e0e0;padding:8px 12px}th{background:#f0f0f0;font-weight:600}
blockquote{border-left:3px solid #ccc;margin:12px 0;padding:8px 16px;color:#666}img{max-width:100%}
h1,h2{border-bottom:1px solid #eee;padding-bottom:6px}</style></head>
<body>${html}</body></html>`
        blob = new Blob([fullHtml], { type: 'text/html' })
        filename = activeFile.name.replace('.md', '.html')
        showToast('Exported as HTML')
        break
      }
      case 'txt': {
        blob = new Blob([activeFile.content], { type: 'text/plain' })
        filename = activeFile.name.replace('.md', '.txt')
        showToast('Exported as TXT')
        break
      }
      case 'xml': {
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<document>\n  <title>${activeFile.name}</title>\n  <content><![CDATA[${activeFile.content}]]></content>\n</document>`
        blob = new Blob([xmlContent], { type: 'application/xml' })
        filename = activeFile.name.replace('.md', '.xml')
        showToast('Exported as XML')
        break
      }
      case 'pdf': {
        // Use browser print-to-PDF
        const html = renderMarkdown(activeFile.content)
        const printWin = window.open('', '_blank')
        printWin.document.write(`<!DOCTYPE html><html><head><title>${activeFile.name}</title>
          <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.7;color:#1a1a1a}
          pre{background:#f4f4f4;padding:16px;border-radius:8px;overflow-x:auto}code{font-family:monospace;font-size:0.9em}
          table{border-collapse:collapse;width:100%}th,td{border:1px solid #e0e0e0;padding:8px 12px}</style>
          </head><body>${html}</body></html>`)
        printWin.document.close()
        printWin.focus()
        setTimeout(() => { printWin.print(); printWin.close() }, 500)
        showToast('Print/PDF dialog opened')
        return
      }
      case 'docx': {
        // Export as HTML with .doc extension (Word-compatible)
        const htmlDoc = renderMarkdown(activeFile.content)
        const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8"><title>${activeFile.name}</title>
          <style>body{font-family:Calibri,sans-serif;font-size:11pt;line-height:1.6}
          pre{background:#f4f4f4;padding:10px;font-family:Consolas,monospace;font-size:10pt}
          table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px}</style>
          </head><body>${htmlDoc}</body></html>`
        blob = new Blob([wordHtml], { type: 'application/msword' })
        filename = activeFile.name.replace('.md', '.doc')
        showToast('Exported as DOC')
        break
      }
      default: {
        blob = new Blob([activeFile.content], { type: 'text/markdown' })
        filename = activeFile.name
        showToast('Exported as Markdown')
        break
      }
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [activeFile, showToast])

  const copyContent = useCallback(async () => {
    if (!activeFile) return
    try {
      await navigator.clipboard.writeText(activeFile.content)
      showToast('Copied to clipboard')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = activeFile.content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showToast('Copied to clipboard')
    }
  }, [activeFile, showToast])

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
        splitOrientation={splitOrientation}
        onSplitOrientationChange={setSplitOrientation}
        onMenuClick={() => setDrawerOpen(true)}
        onImport={importFile}
        onExport={exportFile}
        onCopy={copyContent}
        onShare={shareContent}
        onThemeToggle={toggleTheme}
        onSyncToggle={() => setSyncScroll(p => !p)}
        syncScroll={syncScroll}
        theme={theme}
        fileName={activeFile?.name || 'Untitled.md'}
      />

      <main className={`workspace ${viewMode === 'split' && splitOrientation === 'vertical' ? 'vertical' : ''}`}>
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className="split-pane" style={viewMode === 'split' ? {
            [splitOrientation === 'vertical' ? 'height' : 'width']: `${splitSize}%`,
            flex: 'none'
          } : { flex: 1 }}>
            <Editor
              ref={editorRef}
              content={activeFile?.content || ''}
              onChange={updateContent}
              isFullWidth={viewMode === 'editor'}
              syncScroll={syncScroll}
              previewRef={previewRef}
            />
          </div>
        )}
        {viewMode === 'split' && (
          <div
            className={`split-handle ${splitOrientation === 'vertical' ? 'vertical' : ''}`}
            onPointerDown={(e) => {
              isDraggingSplit.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              const workspace = e.currentTarget.parentElement
              const rect = workspace.getBoundingClientRect()
              const onMove = (ev) => {
                if (!isDraggingSplit.current) return
                let pct
                if (splitOrientation === 'vertical') {
                  pct = ((ev.clientY - rect.top) / rect.height) * 100
                } else {
                  pct = ((ev.clientX - rect.left) / rect.width) * 100
                }
                setSplitSize(Math.max(20, Math.min(80, pct)))
              }
              const onUp = () => {
                isDraggingSplit.current = false
                document.removeEventListener('pointermove', onMove)
                document.removeEventListener('pointerup', onUp)
              }
              document.addEventListener('pointermove', onMove)
              document.addEventListener('pointerup', onUp)
            }}
          >
            <div className="split-handle-bar" />
          </div>
        )}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="split-pane" style={viewMode === 'split' ? {
            flex: 1, minWidth: 0, minHeight: 0
          } : { flex: 1 }}>
            <Preview
              ref={previewRef}
              content={activeFile?.content || ''}
              isFullWidth={viewMode === 'preview'}
              syncScroll={syncScroll}
              editorRef={editorRef}
            />
          </div>
        )}
      </main>

      <StatsBar content={activeFile?.content || ''} />

      {/* Mobile bottom nav with iOS-style sliding indicator */}
      <nav className="mobile-nav">
        <div className="mobile-nav-track">
          <div
            className="mobile-nav-indicator"
            style={{
              transform: `translateX(${['editor', 'split', 'preview'].indexOf(viewMode) * 100}%)`
            }}
          />
          <button
            className={`mobile-nav-btn ${viewMode === 'editor' ? 'active' : ''}`}
            onClick={() => setViewMode('editor')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
          <button
            className={`mobile-nav-btn split-nav-btn ${viewMode === 'split' ? 'active' : ''}`}
            onClick={() => setViewMode('split')}
            onPointerDown={() => {
              splitLongPressTimer.current = setTimeout(() => setSplitMenuOpen(true), 500)
            }}
            onPointerUp={() => clearTimeout(splitLongPressTimer.current)}
            onPointerLeave={() => clearTimeout(splitLongPressTimer.current)}
          >
            {splitOrientation === 'vertical' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
            )}
            <span>Split</span>
            <svg className="split-triangle" width="6" height="6" viewBox="0 0 6 6"><polygon points="0,6 6,6 3,1" fill="currentColor"/></svg>
          </button>
          <button
            className={`mobile-nav-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Preview</span>
          </button>
        </div>
        <button
          className="mobile-nav-btn mobile-nav-files"
          onClick={() => setDrawerOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Files</span>
        </button>
      </nav>

      {/* Split orientation popup */}
      {splitMenuOpen && (
        <>
          <div className="split-menu-overlay" onClick={() => setSplitMenuOpen(false)} />
          <div className="split-menu-popup">
            <button
              className={`split-menu-option ${splitOrientation === 'horizontal' ? 'active' : ''}`}
              onClick={() => { setSplitOrientation('horizontal'); setViewMode('split'); setSplitMenuOpen(false) }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
              Vertical
            </button>
            <button
              className={`split-menu-option ${splitOrientation === 'vertical' ? 'active' : ''}`}
              onClick={() => { setSplitOrientation('vertical'); setViewMode('split'); setSplitMenuOpen(false) }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
              Horizontal
            </button>
          </div>
        </>
      )}

      <FileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        files={files}
        folders={folders}
        activeFileId={activeFileId}
        onSelect={(id) => { setActiveFileId(id); setDrawerOpen(false) }}
        onCreate={createFile}
        onDelete={deleteFile}
        onRename={renameFile}
        onImport={importFile}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        onMoveFile={moveFile}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
