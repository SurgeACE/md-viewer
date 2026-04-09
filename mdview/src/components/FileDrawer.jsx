import { useState, useRef, useEffect } from 'react'

export default function FileDrawer({
  open, onClose, files, activeFileId,
  onSelect, onCreate, onDelete, onRename, onImport
}) {
  const [newFileName, setNewFileName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const inputRef = useRef(null)
  const drawerRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const handleCreate = () => {
    const name = newFileName.trim()
    if (!name) return
    onCreate(name)
    setNewFileName('')
  }

  const handleRename = (id) => {
    const name = editName.trim()
    if (!name) { setEditingId(null); return }
    onRename(id, name)
    setEditingId(null)
  }

  const sorted = [...files].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} ref={drawerRef}>
        <div className="drawer-header">
          <h2>Files</h2>
          <button className="icon-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="drawer-create">
          <input
            ref={inputRef}
            type="text"
            placeholder="New file name..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button className="btn-primary" onClick={handleCreate} disabled={!newFileName.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        <button className="drawer-import-btn" onClick={onImport}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Import .md file
        </button>

        <ul className="file-list">
          {sorted.map(file => (
            <li
              key={file.id}
              className={`file-item ${file.id === activeFileId ? 'active' : ''}`}
            >
              {editingId === file.id ? (
                <div className="file-rename">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(file.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    onBlur={() => handleRename(file.id)}
                  />
                </div>
              ) : (
                <button className="file-select-btn" onClick={() => onSelect(file.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <span className="file-name">{file.name}</span>
                  <span className="file-date">{formatDate(file.updatedAt)}</span>
                </button>
              )}
              <div className="file-actions">
                <button
                  className="icon-btn-sm"
                  onClick={(e) => { e.stopPropagation(); setEditingId(file.id); setEditName(file.name.replace('.md', '')) }}
                  title="Rename"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className="icon-btn-sm danger"
                  onClick={(e) => { e.stopPropagation(); onDelete(file.id) }}
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="drawer-footer">
          <span className="drawer-footer-text">MDView v2.0</span>
        </div>
      </aside>
    </>
  )
}

function formatDate(ts) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString()
}
