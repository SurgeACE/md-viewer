import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch {}
    }
    try {
      return hljs.highlightAuto(code).value
    } catch {}
    return code
  }
})

// Custom renderer for checkboxes
const renderer = new marked.Renderer()
const originalListItem = renderer.listitem
renderer.listitem = function({ text, task, checked }) {
  if (task) {
    return `<li class="task-item"><input type="checkbox" ${checked ? 'checked' : ''} disabled /><span>${text}</span></li>`
  }
  return `<li>${text}</li>`
}

marked.use({ renderer })

export function renderMarkdown(content) {
  try {
    const raw = marked.parse(content || '')
    return DOMPurify.sanitize(raw, {
      ADD_TAGS: ['input'],
      ADD_ATTR: ['checked', 'disabled', 'type'],
    })
  } catch (err) {
    console.error('Markdown render error:', err)
    return `<p style="color:red;">Error rendering markdown</p>`
  }
}
