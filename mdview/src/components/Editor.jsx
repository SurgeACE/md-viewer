import { useRef, useEffect, useCallback } from 'react'

const TOOLBAR_ACTIONS = [
  { icon: 'H', label: 'Heading', prefix: '## ', suffix: '' },
  { icon: 'B', label: 'Bold', prefix: '**', suffix: '**' },
  { icon: 'I', label: 'Italic', prefix: '*', suffix: '*' },
  { icon: '~', label: 'Strike', prefix: '~~', suffix: '~~' },
  { icon: '<>', label: 'Code', prefix: '`', suffix: '`' },
  { icon: '[]', label: 'Link', prefix: '[', suffix: '](url)' },
  { icon: '""', label: 'Quote', prefix: '> ', suffix: '' },
  { icon: '\u2014', label: 'Rule', prefix: '\n---\n', suffix: '' },
  { icon: '\u2022', label: 'List', prefix: '- ', suffix: '' },
  { icon: '\u2611', label: 'Task', prefix: '- [ ] ', suffix: '' },
  { icon: '\u229e', label: 'Table', prefix: '\n| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', suffix: '' },
]

export default function Editor({ content, onChange, isFullWidth }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [])

  const insertFormat = useCallback((prefix, suffix) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = content.substring(start, end)
    const before = content.substring(0, start)
    const after = content.substring(end)
    const newContent = before + prefix + selected + suffix + after
    onChange(newContent)
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      ta.focus()
      const cursorPos = start + prefix.length + selected.length + suffix.length
      ta.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      )
    })
  }, [content, onChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const before = content.substring(0, start)
      const after = content.substring(ta.selectionEnd)
      onChange(before + '  ' + after)
      requestAnimationFrame(() => {
        ta.setSelectionRange(start + 2, start + 2)
      })
    }
  }, [content, onChange])

  return (
    <div className={`editor-pane ${isFullWidth ? 'full' : ''}`}>
      <div className="toolbar">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="toolbar-btn"
            onClick={() => insertFormat(action.prefix, action.suffix)}
            title={action.label}
          >
            {action.icon}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start writing Markdown..."
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
      />
    </div>
  )
}
