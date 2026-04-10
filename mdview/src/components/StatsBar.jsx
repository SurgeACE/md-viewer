import { useMemo } from 'react'

export default function StatsBar({ content }) {
  const stats = useMemo(() => {
    const text = (content || '').trim()
    if (!text) return { words: 0, chars: 0, lines: 0, readTime: '0 min' }

    const words = text.split(/\s+/).filter(Boolean).length
    const chars = text.length
    const lines = text.split('\n').length
    const minutes = Math.max(1, Math.ceil(words / 200))
    const readTime = minutes === 1 ? '1 min read' : `${minutes} min read`

    return { words, chars, lines, readTime }
  }, [content])

  return (
    <div className="stats-bar">
      <span className="stat-item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        {stats.words} words
      </span>
      <span className="stat-item">{stats.chars} chars</span>
      <span className="stat-item">{stats.lines} lines</span>
      <span className="stat-item stat-read">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        {stats.readTime}
      </span>
    </div>
  )
}
