import { useMemo, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { renderMarkdown } from '../utils/markdown'

const Preview = forwardRef(function Preview({ content, isFullWidth, syncScroll, editorRef }, ref) {
  const previewRef = useRef(null)
  const scrollRef = useRef(null)
  const isSyncing = useRef(false)
  const html = useMemo(() => renderMarkdown(content), [content])

  useImperativeHandle(ref, () => ({
    getScrollElement: () => scrollRef.current
  }))

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.querySelectorAll('pre code:not(.hljs)').forEach(block => {
        try {
          import('highlight.js').then(hljs => {
            hljs.default.highlightElement(block)
          })
        } catch {}
      })
    }
  }, [html])

  const handleScroll = useCallback(() => {
    if (!syncScroll || isSyncing.current) return
    const preview = scrollRef.current
    const editor = editorRef?.current?.getScrollElement?.()
    if (!preview || !editor) return

    isSyncing.current = true
    const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1)
    editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight)
    requestAnimationFrame(() => { isSyncing.current = false })
  }, [syncScroll, editorRef])

  return (
    <div className={`preview-pane ${isFullWidth ? 'full' : ''}`} ref={scrollRef} onScroll={handleScroll}>
      <div
        ref={previewRef}
        className="markdown-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
})

export default Preview
