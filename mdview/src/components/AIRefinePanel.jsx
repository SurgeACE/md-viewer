import { useState, useRef, useEffect, useCallback } from 'react'
import { refineContent, REFINE_MODES } from '../utils/ai'

export default function AIRefinePanel({ open, onClose, content, onApply, apiKey, onOpenSettings }) {
  const [mode, setMode] = useState('clarity')
  const [customPrompt, setCustomPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showDiff, setShowDiff] = useState(false)
  const panelRef = useRef(null)
  const customInputRef = useRef(null)

  // Reset when panel opens
  useEffect(() => {
    if (open) {
      setResult(null)
      setError(null)
      setLoading(false)
      setShowDiff(false)
    }
  }, [open])

  const handleRefine = useCallback(async () => {
    if (!apiKey) {
      setError('No API key set. Tap Settings to add your Gemini API key.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const refined = await refineContent(content, mode, apiKey, customPrompt)
      setResult(refined)
      setShowDiff(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [content, mode, apiKey, customPrompt])

  const handleApply = useCallback(() => {
    if (result) {
      onApply(result)
      onClose()
    }
  }, [result, onApply, onClose])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const modeEntries = Object.entries(REFINE_MODES)

  return (
    <>
      <div className="ai-overlay" onClick={onClose} />
      <div className={`ai-panel ${open ? 'open' : ''}`} ref={panelRef}>
        <div className="ai-panel-header">
          <div className="ai-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18.5 18.5 22 17 15l5-5-7-1z" />
            </svg>
            AI Refine
          </div>
          <button className="ai-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {!apiKey && (
          <div className="ai-key-banner">
            <span>⚠️ No API key configured</span>
            <button className="ai-key-btn" onClick={onOpenSettings}>Add Gemini Key</button>
          </div>
        )}

        {/* Mode selector */}
        <div className="ai-modes">
          {modeEntries.map(([key, cfg]) => (
            <button
              key={key}
              className={`ai-mode-btn ${mode === key ? 'active' : ''}`}
              onClick={() => { setMode(key); setResult(null); setError(null) }}
              disabled={loading}
            >
              <span className="ai-mode-icon">{cfg.icon}</span>
              <span className="ai-mode-label">{cfg.label}</span>
            </button>
          ))}
          <button
            className={`ai-mode-btn ${mode === 'custom' ? 'active' : ''}`}
            onClick={() => { setMode('custom'); setResult(null); setError(null); setTimeout(() => customInputRef.current?.focus(), 100) }}
            disabled={loading}
          >
            <span className="ai-mode-icon">💬</span>
            <span className="ai-mode-label">Custom</span>
          </button>
        </div>

        {/* Custom instruction input */}
        {mode === 'custom' && (
          <div className="ai-custom-wrap">
            <textarea
              ref={customInputRef}
              className="ai-custom-input"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe how to refine... e.g. 'Add XML tags around each section' or 'Make it sound more authoritative'"
              rows={3}
              disabled={loading}
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="ai-actions">
          <button
            className="ai-refine-btn"
            onClick={handleRefine}
            disabled={loading || (mode === 'custom' && !customPrompt.trim())}
          >
            {loading ? (
              <>
                <span className="ai-spinner" />
                Refining...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18.5 18.5 22 17 15l5-5-7-1z" />
                </svg>
                Refine
              </>
            )}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="ai-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Result / Diff view */}
        {result && (
          <div className="ai-result">
            <div className="ai-result-header">
              <div className="ai-result-tabs">
                <button
                  className={`ai-result-tab ${showDiff ? '' : 'active'}`}
                  onClick={() => setShowDiff(false)}
                >
                  Result
                </button>
                <button
                  className={`ai-result-tab ${showDiff ? 'active' : ''}`}
                  onClick={() => setShowDiff(true)}
                >
                  Diff
                </button>
              </div>
              <div className="ai-result-actions">
                <button className="ai-apply-btn" onClick={handleApply}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Apply
                </button>
                <button className="ai-retry-btn" onClick={handleRefine} disabled={loading}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
            <div className="ai-result-content">
              {showDiff ? (
                <DiffView original={content} refined={result} />
              ) : (
                <pre className="ai-result-text">{result}</pre>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/** Simple line-by-line diff view */
function DiffView({ original, refined }) {
  const origLines = original.split('\n')
  const refLines = refined.split('\n')
  const maxLen = Math.max(origLines.length, refLines.length)

  const lines = []
  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i] ?? ''
    const r = refLines[i] ?? ''
    if (o === r) {
      lines.push({ type: 'same', text: o })
    } else {
      if (origLines[i] !== undefined) {
        lines.push({ type: 'removed', text: o })
      }
      if (refLines[i] !== undefined) {
        lines.push({ type: 'added', text: r })
      }
    }
  }

  return (
    <pre className="ai-diff">
      {lines.map((line, i) => (
        <div key={i} className={`ai-diff-line ${line.type}`}>
          <span className="ai-diff-marker">
            {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
          </span>
          <span className="ai-diff-text">{line.text || ' '}</span>
        </div>
      ))}
    </pre>
  )
}
