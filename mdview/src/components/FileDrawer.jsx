import { useState, useRef, useCallback, useEffect } from 'react'
import { getFolderColor } from '../utils/colors'

export default function FileDrawer({
  files, folders = [], activeFileId,
  onSelect, onCreate, onRename, onDelete, onImport,
  onCreateFolder, onDeleteFolder, onMoveFile,
  open, onClose,
  aiSettingsOpen, onAiSettingsClose,
  geminiApiKey, onGeminiApiKeyChange
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState({})
  const [showAiSettings, setShowAiSettings] = useState(false)
  const [tempApiKey, setTempApiKey] = useState('')
  const folderInputRef = useRef(null)

  // Touch drag state
  const [touchDragId, setTouchDragId] = useState(null)
  const [touchDragOverId, setTouchDragOverId] = useState(null)
  const [touchDragOverFolder, setTouchDragOverFolder] = useState(null)
  const touchStartTimer = useRef(null)
  const touchStartPos = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)

  // Desktop drag state
  const [dragId, setDragId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const [dragOverFolder, setDragOverFolder] = useState(null)

  // Recent files: up to 4, sorted by most recently updated
  const recentFiles = [...files]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 4)

  const unfolderedFiles = files.filter(f => !f.folderId)
  const filesInFolder = (folderId) => files.filter(f => f.folderId === folderId)

  const filtered = searchQuery
    ? files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null

  const toggleFolder = (id) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Reset search when drawer closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setCreatingFolder(false)
      setEditingId(null)
      setShowAiSettings(false)
    }
  }, [open])

  // Open AI settings when triggered from AI panel
  useEffect(() => {
    if (aiSettingsOpen && open) {
      setShowAiSettings(true)
      setTempApiKey(geminiApiKey || '')
    }
  }, [aiSettingsOpen, open, geminiApiKey])

  // Rename
  const startRename = (file) => {
    setEditingId(file.id)
    setEditName(file.name)
  }

  const commitRename = () => {
    if (editingId && editName.trim()) {
      const name = editName.trim().endsWith('.md') ? editName.trim() : editName.trim() + '.md'
      onRename(editingId, name)
    }
    setEditingId(null)
    setEditName('')
  }

  // Create folder
  const handleCreateFolder = () => {
    if (newFolderName.trim() && onCreateFolder) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setCreatingFolder(false)
    }
  }

  // Move file to folder (or to root with null)
  const handleMoveFile = useCallback((fileId, targetFolderId, beforeFileId = null) => {
    if (onMoveFile) {
      onMoveFile(fileId, targetFolderId, beforeFileId)
    }
  }, [onMoveFile])

  // === Desktop Drag & Drop ===
  const handleDragStart = (e, fileId) => {
    setDragId(fileId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, targetId, isFolder = false) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (isFolder) { setDragOverFolder(targetId); setDragOverId(null) }
    else { setDragOverId(targetId); setDragOverFolder(null) }
  }

  const handleDrop = (e, targetId, isFolder = false) => {
    e.preventDefault()
    if (!dragId) return
    if (isFolder) {
      handleMoveFile(dragId, targetId)
    } else {
      const targetFile = files.find(f => f.id === targetId)
      handleMoveFile(dragId, targetFile?.folderId || null, targetId)
    }
    setDragId(null); setDragOverId(null); setDragOverFolder(null)
  }

  const handleDragEnd = () => {
    setDragId(null); setDragOverId(null); setDragOverFolder(null)
  }

  // === Touch Long Press Drag ===
  const handleTouchStart = useCallback((e, fileId) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }
    touchStartTimer.current = setTimeout(() => {
      isDraggingRef.current = true
      setTouchDragId(fileId)
      if (navigator.vibrate) navigator.vibrate(30)
    }, 400)
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (!isDraggingRef.current) {
      const touch = e.touches[0]
      const dx = Math.abs(touch.clientX - touchStartPos.current.x)
      const dy = Math.abs(touch.clientY - touchStartPos.current.y)
      if (dx > 10 || dy > 10) {
        clearTimeout(touchStartTimer.current)
      }
      return
    }
    e.preventDefault()
    const touch = e.touches[0]
    const elem = document.elementFromPoint(touch.clientX, touch.clientY)
    if (!elem) return

    const fileItem = elem.closest('[data-file-id]')
    const folderItem = elem.closest('[data-folder-id]')

    if (folderItem) {
      setTouchDragOverFolder(folderItem.dataset.folderId)
      setTouchDragOverId(null)
    } else if (fileItem) {
      setTouchDragOverId(fileItem.dataset.fileId)
      setTouchDragOverFolder(null)
    } else {
      setTouchDragOverId(null)
      setTouchDragOverFolder(null)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    clearTimeout(touchStartTimer.current)
    if (isDraggingRef.current && touchDragId) {
      if (touchDragOverFolder) {
        handleMoveFile(touchDragId, touchDragOverFolder)
      } else if (touchDragOverId) {
        const targetFile = files.find(f => f.id === touchDragOverId)
        handleMoveFile(touchDragId, targetFile?.folderId || null, touchDragOverId)
      }
    }
    isDraggingRef.current = false
    setTouchDragId(null)
    setTouchDragOverId(null)
    setTouchDragOverFolder(null)
  }, [touchDragId, touchDragOverFolder, touchDragOverId, files, handleMoveFile])

  // Render a single file row
  const renderFile = (file, folderColor = null, showDrag = true) => {
    const isBeingDragged = touchDragId === file.id || dragId === file.id
    const isDragTarget = touchDragOverId === file.id || dragOverId === file.id

    return (
      <div
        key={file.id}
        data-file-id={file.id}
        className={`file-item ${file.id === activeFileId ? 'active' : ''} ${isDragTarget ? 'drag-over' : ''} ${isBeingDragged ? 'dragging' : ''}`}
        style={folderColor ? { background: folderColor.bgLight } : undefined}
        draggable={showDrag}
        onDragStart={(e) => handleDragStart(e, file.id)}
        onDragOver={(e) => handleDragOver(e, file.id)}
        onDrop={(e) => handleDrop(e, file.id)}
        onDragEnd={handleDragEnd}
        onTouchStart={showDrag ? (e) => handleTouchStart(e, file.id) : undefined}
        onTouchMove={showDrag ? handleTouchMove : undefined}
        onTouchEnd={showDrag ? handleTouchEnd : undefined}
      >
        {editingId === file.id ? (
          <input
            className="file-rename-input"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null) }}
            autoFocus
          />
        ) : (
          <>
            <button className="file-select-btn" onClick={() => onSelect(file.id)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <span className="file-name">{file.name}</span>
            </button>
            <div className="file-actions">
              <button className="icon-btn-sm" onClick={() => startRename(file)} title="Rename">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button className="icon-btn-sm" onClick={() => onDelete(file.id)} title="Delete">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Files</h2>
          <div className="drawer-header-actions">
            <button className="icon-btn-sm" onClick={() => onCreate('Untitled.md')} title="New File">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <button className="icon-btn-sm" onClick={onImport} title="Import">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button className="icon-btn-sm" onClick={onClose} title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Search — NOT auto-focused so keyboard doesn't pop up */}
        <div className="drawer-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={false}
          />
        </div>

        <div className="drawer-content">
          {filtered ? (
            <div className="file-section">
              {filtered.length === 0 ? (
                <div className="drawer-empty">No files found</div>
              ) : (
                filtered.map(f => renderFile(f, null, false))
              )}
            </div>
          ) : (
            <>
              {/* Recent Files (up to 4) */}
              {recentFiles.length > 0 && (
                <div className="file-section">
                  <div className="section-label">Recent</div>
                  {recentFiles.map(f => renderFile(f, null, false))}
                </div>
              )}

              <div className="drawer-divider" />

              {/* Create Folder + Folder list */}
              <div className="file-section">
                <div className="section-label-row">
                  <span className="section-label">Folders</span>
                  <button
                    className="icon-btn-sm"
                    onClick={() => { setCreatingFolder(true); setTimeout(() => folderInputRef.current?.focus(), 50) }}
                    title="New Folder"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                      <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
                    </svg>
                  </button>
                </div>

                {creatingFolder && (
                  <div className="folder-create-row">
                    <input
                      ref={folderInputRef}
                      className="folder-name-input"
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setCreatingFolder(false) }}
                      onBlur={() => { if (!newFolderName.trim()) setCreatingFolder(false) }}
                    />
                    <button className="icon-btn-sm" onClick={handleCreateFolder}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  </div>
                )}

                {folders.map((folder, idx) => {
                  const color = getFolderColor(folder.colorIndex ?? idx)
                  const folderFiles = filesInFolder(folder.id)
                  const isExpanded = expandedFolders[folder.id] !== false
                  const isDragTarget = touchDragOverFolder === folder.id || dragOverFolder === folder.id

                  return (
                    <div
                      key={folder.id}
                      data-folder-id={folder.id}
                      className={`folder-group ${isDragTarget ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, folder.id, true)}
                      onDrop={(e) => handleDrop(e, folder.id, true)}
                    >
                      <button
                        className="folder-header"
                        style={{ background: color.bg, borderLeft: `3px solid ${color.accent}` }}
                        onClick={() => toggleFolder(folder.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color.accent} strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span className="folder-name" style={{ color: color.text }}>{folder.name}</span>
                        <span className="folder-count" style={{ color: color.accent }}>{folderFiles.length}</span>
                        <svg className={`folder-chevron ${isExpanded ? 'expanded' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color.text} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        <button
                          className="icon-btn-sm folder-delete"
                          onClick={(e) => { e.stopPropagation(); if (onDeleteFolder) onDeleteFolder(folder.id) }}
                          title="Delete folder"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </button>
                      {isExpanded && (
                        <div className="folder-files">
                          {folderFiles.length === 0 ? (
                            <div className="folder-empty">Drop files here</div>
                          ) : (
                            folderFiles.map(f => renderFile(f, color))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="drawer-divider" />

              {/* All unfoldered files */}
              <div className="file-section">
                <div className="section-label">All Files</div>
                {unfolderedFiles.map(f => renderFile(f))}
              </div>
            </>
          )}
        </div>

        {/* AI Settings Section */}
        <div className="ai-settings-section">
          <button
            className="ai-settings-toggle"
            onClick={() => { setShowAiSettings(p => !p); setTempApiKey(geminiApiKey || '') }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
              padding: '8px 0', background: 'none', border: 'none', color: 'var(--text-secondary)',
              fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-sans)', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18.5 18.5 22 17 15l5-5-7-1z" />
            </svg>
            AI Settings
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ marginLeft: 'auto', transform: showAiSettings ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {showAiSettings && (
            <div style={{ paddingTop: '4px' }}>
              <div className="ai-key-input-wrap">
                <input
                  type="password"
                  className="ai-key-input"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="Gemini API key..."
                />
                <button
                  className="ai-key-save-btn"
                  onClick={() => {
                    onGeminiApiKeyChange(tempApiKey)
                    if (onAiSettingsClose) onAiSettingsClose()
                    setShowAiSettings(false)
                  }}
                >
                  Save
                </button>
              </div>
              <div className="ai-key-hint">
                Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com</a>
              </div>
              {geminiApiKey && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#4ade80' }}>
                  ✓ Key configured
                </div>
              )}
            </div>
          )}
        </div>

        <div className="drawer-footer">
          <span className="drawer-footer-text">MDView betaV5</span>
        </div>
      </aside>
    </>
  )
}
