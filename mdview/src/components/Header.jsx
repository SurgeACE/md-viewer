import { useState, useRef, useEffect } from 'react'

export default function Header({
  viewMode, onViewChange, onMenuClick,
  onImport, onExport, onCopy, onShare,
  onThemeToggle, onSyncToggle, syncScroll,
  splitOrientation, onSplitOrientationChange,
  theme, fileName, onAiRefine
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [splitMenuOpen, setSplitMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const splitTimerRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
        setExportOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [menuOpen])

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn header-menu-btn" onClick={onMenuClick} title="Files">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <span className="header-filename">{fileName}</span>
      </div>

      <div className="header-center">
        <div className="view-switcher">
          <div
            className="view-switcher-indicator"
            style={{
              transform: `translateX(${['editor', 'split', 'preview'].indexOf(viewMode) * 100}%)`
            }}
          />
          {['editor', 'split', 'preview'].map(mode => (
            <button
              key={mode}
              className={`view-btn ${viewMode === mode ? 'active' : ''} ${mode === 'split' ? 'split-view-btn' : ''}`}
              onClick={() => onViewChange(mode)}
              onPointerDown={mode === 'split' ? () => {
                splitTimerRef.current = setTimeout(() => setSplitMenuOpen(true), 500)
              } : undefined}
              onPointerUp={mode === 'split' ? () => clearTimeout(splitTimerRef.current) : undefined}
              onPointerLeave={mode === 'split' ? () => clearTimeout(splitTimerRef.current) : undefined}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {mode === 'split' && <svg className="split-triangle" width="6" height="6" viewBox="0 0 6 6"><polygon points="0,6 6,6 3,1" fill="currentColor"/></svg>}
            </button>
          ))}
        </div>
        {splitMenuOpen && (
          <>
            <div className="split-menu-overlay" onClick={() => setSplitMenuOpen(false)} />
            <div className="split-menu-popup desktop">
              <button
                className={`split-menu-option ${splitOrientation === 'horizontal' ? 'active' : ''}`}
                onClick={() => { onSplitOrientationChange('horizontal'); onViewChange('split'); setSplitMenuOpen(false) }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                Vertical
              </button>
              <button
                className={`split-menu-option ${splitOrientation === 'vertical' ? 'active' : ''}`}
                onClick={() => { onSplitOrientationChange('vertical'); onViewChange('split'); setSplitMenuOpen(false) }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
                Horizontal
              </button>
            </div>
          </>
        )}
      </div>

      <div className="header-right">
        <div className="dropdown" ref={menuRef}>
          <button className="icon-btn" onClick={() => setMenuOpen(!menuOpen)} title="Actions">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <button onClick={() => { onImport(); setMenuOpen(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Import
              </button>
              <div className="export-submenu-wrap">
                <button className="export-submenu-trigger" onClick={() => setExportOpen(!exportOpen)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Export
                  <svg className="export-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', transform: exportOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms ease' }}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {exportOpen && (
                  <div className="export-submenu">
                    <button onClick={() => { onExport('md'); setMenuOpen(false); setExportOpen(false) }}>.md</button>
                    <button onClick={() => { onExport('html'); setMenuOpen(false); setExportOpen(false) }}>.html</button>
                    <button onClick={() => { onExport('txt'); setMenuOpen(false); setExportOpen(false) }}>.txt</button>
                    <button onClick={() => { onExport('pdf'); setMenuOpen(false); setExportOpen(false) }}>.pdf</button>
                    <button onClick={() => { onExport('xml'); setMenuOpen(false); setExportOpen(false) }}>.xml</button>
                    <button onClick={() => { onExport('docx'); setMenuOpen(false); setExportOpen(false) }}>.docx</button>
                  </div>
                )}
              </div>
              <button onClick={() => { onCopy(); setMenuOpen(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
              <button onClick={() => { onAiRefine(); setMenuOpen(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18.5 18.5 22 17 15l5-5-7-1z"/></svg>
                AI Refine
              </button>
              {navigator.share && (
                <button onClick={() => { onShare(); setMenuOpen(false) }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Share
                </button>
              )}
              <div className="dropdown-divider" />
              <button onClick={() => { onSyncToggle(); setMenuOpen(false) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Sync Scroll {syncScroll ? '✓' : ''}
              </button>
              <button onClick={() => { onThemeToggle(); setMenuOpen(false) }}>
                {theme === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
