import { useMemo, useEffect, useRef } from 'react'
import { renderMarkdown } from '../utils/markdown'

export default function Preview({ content, isFullWidth }) {
  const previewRef = useRef(null)
  const html = useMemo(() => renderMarkdown(content), [content])

  useEffect(() => {
    if (previewRef.current) {
      // Apply syntax highlighting to code blocks after render
      previewRef.current.querySelectorAll('pre code:not(.hljs)').forEach(block => {
        try {
          import('highlight.js').then(hljs => {
            hljs.default.highlightElement(block)
          })
        } catch {}
      })
    }
  }, [html])

  return (
    <div className={`preview-pane ${isFullWidth ? 'full' : ''}`}>
      <div
        ref={previewRef}
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
