# Checkpoint

## Persona:
- Role: Senior Full-stack Android Developer who builds and pushes to production multiple times a day. Values speed, simplicity, and usability over flashy features. Hates bloated apps with too many dependencies. Wants a clean, intuitive interface that just works.

## Status: MVP v1.2 — Tab Bar + Undo/Redo + Editor Stats

## What exists
- Full PWA (vanilla HTML/CSS/JS) with hash-based SPA routing
- Profile screen, Home screen (file organizer), Editor screen (write/preview toggle)
- Dark/light theme with pure black & white palette (no color accents)
- Folder icons with bright colored tabs (blue, purple, green, orange, pink, yellow)
- localStorage persistence (profile, files, folders, settings) with migration system
- Service Worker **disabled during dev** — network-first strategy ready for production
- Nuclear cache-clear inline script in index.html (unregisters old SWs + purges caches)
- Cache-busting via `?v=4` query strings and no-cache meta headers
- Chrome-like tab bar for open files with drag-reorder and drop bucket for importing
- Undo/redo engine in editor (100-item stack, Ctrl+Z / Ctrl+Shift+Z)
- Session timer, word count, char count, read time stats in editor
- Inline theme toggle in editor stats row
- App renamed to ".md viewer"
- Global error handler — shows JS errors as toasts for debugging
- Custom bottom-sheet dialog for new file creation (no prompt())
- Installable on Android via manifest.json

## Architecture
- **Approach**: PWA (Progressive Web App) — Expo/React Native skipped (no Node.js)
- **Stack**: Vanilla HTML + CSS + JS, no build tools
- **Fonts**: Outfit (display) + JetBrains Mono (mono) via Google Fonts CDN
- **Markdown**: marked.js v12.0.2 (pinned) + highlight.js 11.9.0 from CDN
- **Data**: localStorage with keys `mdview_profile`, `mdview_files`, `mdview_folders`, `mdview_settings`, `mdview_version`, `mdview_open_tabs`, `mdview_active_tab`
- **Tabs**: tabs.js (TabBar module) + tabs.css — Chrome-style tab bar with drag/drop reorder and drop bucket for file import
- **Entry**: `app/index.html`, served via `cd app && python -m http.server 8080`
- **SW**: Network-first fetch strategy. Bump `CACHE_VERSION` in sw.js on every deploy.

## Design System
- **Palette (dark)**: bg #0a0a0a, surface #141414, accent #ffffff (white)
- **Palette (light)**: bg #f5f5f5, surface #ffffff, accent #111111 (black)
- **Style**: Pure B&W — no color accents. Only color is folder tabs.
- **Folder colors**: #5b8def (blue), #a855f7 (purple), #34d399 (green), #f97316 (orange), #ec4899 (pink), #eab308 (yellow) — auto-cycled on folder creation
- **Animations**: Gentle bounceIn (scale 0.8→1.0), fab-pulse with thin border, no shimmer.

## Dev Workflow
- Server: `cd app && python -m http.server 8080 --bind 0.0.0.0`
- **SW is DISABLED during dev** (commented out in app.js). Re-enable for production.
- Nuclear cache-clear runs on every page load (inline script in index.html unregisters SWs + purges caches)
- Cache-bust: bump `?v=N` on all CSS/JS refs in index.html
- Global error handler: JS errors show as toast notifications
- Testing: open `http://localhost:8080` — changes visible on reload, NO caching during dev

## Roadmap
1. ~~Setup~~ → PWA scaffold
2. ~~Theme~~ → Dark/light toggle, CSS variables
3. ~~Profile~~ → Landing page, local profile creation, localStorage
4. ~~Home~~ → Recent files, folders, organizer
5. ~~Editor~~ → MD writing + preview toggle
6. ~~Actions~~ → Save, Export (.md), Share
7. ~~Polish~~ → Design overhaul v1 (sage), v2 (B&W)
8. ~~Caching~~ → Nuclear cache-clear, SW disabled for dev, no-cache headers
9. ~~Robustness~~ → Error handler, custom dialogs, version indicator
10. ~~Tab Bar~~ → Chrome-like tabs, undo/redo, editor stats, theme toggle
11. **Next** → UX refinements, re-enable SW for production

## Done
- [x] rules.md created
- [x] checkpoint.md created
- [x] PWA scaffold (index.html, manifest, SW, icons)
- [x] Theme system (dark/light CSS variables, toggle)
- [x] Profile screen (create/edit profile, avatar, localStorage)
- [x] Home screen (file list, folders, FAB for new file)
- [x] Editor screen (textarea, preview toggle, format bar, auto-save)
- [x] Save/export/share actions
- [x] Design overhaul v1: sage green palette
- [x] Design overhaul v2: pure B&W, no color accents
- [x] Folder icons with CSS-drawn folder shapes + colored tabs
- [x] Default folders removed — only "All" by default
- [x] marked.js pinned to v12.0.2, API updated for v12+ (marked.use())
- [x] Store migration system (v2 clears old default folders)
- [x] Nuclear cache-clear: inline script unregisters SWs + purges all caches on every load
- [x] SW disabled during dev (app.js), network-first strategy ready for prod (sw.js)
- [x] Cache-busting: ?v=3 on all local CSS/JS, no-cache meta headers
- [x] FAB uses custom bottom-sheet dialog (replaced unreliable prompt())
- [x] Global error handler — JS errors shown as toast notifications
- [x] Version indicator: v1.1 in profile screen
- [x] Icons/manifest updated to B&W (#111111)
- [x] theme.js meta colors fixed (#0a0a0a/#f5f5f5)
- [x] Chrome-like tab bar: open files as tabs, drag to reorder, close tabs, "+" for new tab
- [x] Drop bucket tab: dashed-border last tab for importing .md/.txt files via drag-drop or click
- [x] Undo/redo engine: 100-item stack, debounced push, Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y shortcuts
- [x] Undo/redo buttons in format toolbar with disabled state
- [x] Session timer in editor stats row (top, MM:SS format)
- [x] Editor stats: word count, char count, estimated read time
- [x] Inline theme toggle (sun/moon icon) in editor stats row
- [x] EditorScreen.destroy() cleanup on navigation (clears timers)
- [x] Tab state persisted in localStorage (mdview_open_tabs, mdview_active_tab)
- [x] App renamed from "MDView" to ".md viewer" (title, profile, version)
- [x] Version bumped to v1.2, cache-bust bumped to ?v=4
- [x] Back button removed from editor — navigation via tab bar + new tab button
