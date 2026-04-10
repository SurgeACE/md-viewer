/**
 * Color Palette Dictionary for MDView
 * All color palettes used in the app for referencing during development.
 * Each folder gets a medium-dark bg; files inside get a lighter version.
 */

export const FOLDER_PALETTES = [
  { id: 'slate',   bg: '#1e293b', bgLight: '#1e293b33', accent: '#94a3b8', text: '#e2e8f0' },
  { id: 'zinc',    bg: '#27272a', bgLight: '#27272a33', accent: '#a1a1aa', text: '#e4e4e7' },
  { id: 'red',     bg: '#450a0a', bgLight: '#450a0a33', accent: '#f87171', text: '#fecaca' },
  { id: 'orange',  bg: '#431407', bgLight: '#43140733', accent: '#fb923c', text: '#fed7aa' },
  { id: 'amber',   bg: '#451a03', bgLight: '#451a0333', accent: '#fbbf24', text: '#fde68a' },
  { id: 'emerald', bg: '#022c22', bgLight: '#022c2233', accent: '#34d399', text: '#a7f3d0' },
  { id: 'teal',    bg: '#042f2e', bgLight: '#042f2e33', accent: '#2dd4bf', text: '#99f6e4' },
  { id: 'cyan',    bg: '#083344', bgLight: '#08334433', accent: '#22d3ee', text: '#a5f3fc' },
  { id: 'blue',    bg: '#172554', bgLight: '#17255433', accent: '#60a5fa', text: '#bfdbfe' },
  { id: 'indigo',  bg: '#1e1b4b', bgLight: '#1e1b4b33', accent: '#818cf8', text: '#c7d2fe' },
  { id: 'violet',  bg: '#2e1065', bgLight: '#2e106533', accent: '#a78bfa', text: '#ddd6fe' },
  { id: 'purple',  bg: '#3b0764', bgLight: '#3b076433', accent: '#c084fc', text: '#e9d5ff' },
  { id: 'fuchsia', bg: '#4a044e', bgLight: '#4a044e33', accent: '#e879f9', text: '#f5d0fe' },
  { id: 'rose',    bg: '#4c0519', bgLight: '#4c051933', accent: '#fb7185', text: '#fecdd3' },
]

/** Pick a folder color palette by index (wraps around). */
export function getFolderColor(index) {
  return FOLDER_PALETTES[index % FOLDER_PALETTES.length]
}

/** App-wide theme tokens (for reference only — actual usage in index.css) */
export const APP_TOKENS = {
  dark: {
    bg: '#0a0a0a',
    bgSecondary: '#111111',
    bgTertiary: '#1a1a1a',
    surface: '#1e1e1e',
    border: '#2a2a2a',
    text: '#e0e0e0',
    textSecondary: '#999',
    textMuted: '#666',
    accent: '#4fc3f7',
    accentSoft: 'rgba(79,195,247,0.12)',
  },
  light: {
    bg: '#f8f9fa',
    bgSecondary: '#ffffff',
    bgTertiary: '#f0f0f0',
    surface: '#ffffff',
    border: '#e0e0e0',
    text: '#1a1a2e',
    textSecondary: '#666',
    textMuted: '#999',
    accent: '#2196f3',
    accentSoft: 'rgba(33,150,243,0.1)',
  }
}
