# Checkpoint

## Persona:
- Role: Senior Full-stack Android Developer who builds and pushes to production multiple times a day. Values speed, simplicity, and usability over flashy features. Hates bloated apps with too many dependencies. Wants a clean, intuitive interface that just works.

## Status: v2.0 — React/Vite + Capacitor Android (Play Store Ready)

## What exists

### Legacy (app/)
- Old vanilla PWA (HTML/CSS/JS) with hash-based SPA routing — **deprecated, kept for reference**

### Current (mdview/)
- React 19 + Vite 8 single-page app with split editor/preview
- GitHub-style markdown rendering (marked + highlight.js + DOMPurify)
- Dark/light theme toggle with pure black & white palette
- File drawer (sidebar) with file management (create, rename, delete, import .md)
- Live split-view editor with sync scrolling between editor and preview
- Content statistics bar: word count, character count, line count, estimated read time
- Export to .md and .html (full standalone HTML with inline styles)
- Copy to clipboard with toast notifications
- Capacitor Android wrapper — native Android app shell
- StatusBar & SplashScreen plugins configured for native feel
- Intent filters for opening .md files from other apps
- Production-optimized: minified, tree-shaken, ProGuard enabled
- localStorage persistence via custom useLocalStorage hook

## Architecture
- **Approach**: React SPA wrapped in Capacitor for native Android
- **Stack**: React 19.2.4 + Vite 8.0.8 (build) + Capacitor 7 (native wrapper)
- **Fonts**: Inter (system-like) via Google Fonts CDN
- **Markdown**: marked@18.0.0 (parser) + dompurify@3.3.3 (sanitizer) + highlight.js@11.11.1 (syntax)
- **Data**: localStorage via `useLocalStorage` hook — keys: `mdview-files`, `mdview-active`, `mdview-theme`, `mdview-view`, `mdview-sync-scroll`
- **Entry**: `mdview/src/main.jsx` → `App.jsx` renders Header, Editor, Preview, FileDrawer, StatsBar
- **Build**: `npx vite build` → `dist/` → `npx cap sync android` → Android project
- **Android**: Capacitor wraps `dist/` into a WebView-based Android app
  - App ID: `com.mdview.app`
  - minSdk 24, targetSdk 36, compileSdk 36
  - versionName `2.0.0`, versionCode `1`
  - ProGuard + shrinkResources enabled for release builds

### Component Tree
```
App.jsx
├── Header.jsx       — file name, view switcher, action menu (export/copy/import), sync scroll toggle, theme toggle
├── FileDrawer.jsx   — sidebar with file list, create/rename/delete/import
├── Editor.jsx       — textarea with formatting toolbar (bold/italic/heading/list/link/image/code), forwardRef for sync scroll
├── Preview.jsx      — rendered markdown with highlight.js, forwardRef for sync scroll
└── StatsBar.jsx     — word count, char count, line count, read time (bottom bar)
```

### Key Files
- `capacitor.config.json` — Capacitor project config (appId, webDir, plugins)
- `android/app/build.gradle` — Android build config (version, ProGuard, lint)
- `android/app/src/main/AndroidManifest.xml` — Activity config, .md intent filters
- `android/app/src/main/res/values/styles.xml` — Dark theme colors for native chrome

## Design System
- **Palette (dark)**: bg #0a0a0a, surface #111, border #222, text #e0e0e0, accent #4fc3f7
- **Palette (light)**: bg #f8f9fa, surface #fff, border #e0e0e0, text #1a1a2e, accent #2196f3
- **Style**: Clean minimal — dark-first, no unnecessary color. Accent blue for interactive elements.
- **Typography**: Inter for UI, monospace for editor/stats
- **Stats bar**: 28px fixed bottom bar, monospace, dimmed text
- **Toast**: Fixed bottom-center, 3s auto-dismiss, fade-in animation

## Dev Workflow
- **Dev server**: `cd mdview && npx vite --host --port 8080`
- **Production build**: `cd mdview && npx vite build`
- **Android sync**: `npx cap sync android`
- **Android build (requires JDK 17+ & Android SDK)**:
  ```
  cd android
  ./gradlew assembleDebug     # debug APK
  ./gradlew assembleRelease   # release APK (needs signing config)
  ./gradlew bundleRelease     # AAB for Play Store
  ```
- **Open in Android Studio**: `npx cap open android`
- **Testing**: open `http://localhost:8080` — HMR enabled, changes instant

### Android Build Prerequisites
- JDK 17 or later (set JAVA_HOME)
- Android SDK with API 36 (set ANDROID_HOME)
- Android Build Tools, Platform Tools
- For Play Store: create keystore and configure signing in `android/app/build.gradle`

## Roadmap
1. ~~Setup~~ → PWA scaffold (v1.0)
2. ~~Theme~~ → Dark/light toggle
3. ~~Profile~~ → Landing page, localStorage
4. ~~Home~~ → File organizer
5. ~~Editor~~ → MD writing + preview
6. ~~Actions~~ → Save, Export, Share
7. ~~Polish~~ → Design overhaul B&W
8. ~~Tab Bar~~ → Chrome-like tabs, undo/redo, stats
9. ~~React Rewrite~~ → Migrated to React 19 + Vite 8 (mdview/)
10. ~~Android App~~ → Capacitor wrapper, native plugins, intent filters
11. ~~Feature Parity~~ → Sync scroll, HTML export, stats bar, toast notifications
12. **Next** → APK build (install JDK + Android SDK), Play Store signing, app icons, splash screen assets

## Done

### Phase 1 — Vanilla PWA (app/) [LEGACY]
- [x] PWA scaffold (index.html, manifest, SW, icons)
- [x] Theme system (dark/light CSS variables, toggle)
- [x] Profile screen (create/edit profile, avatar, localStorage)
- [x] Home screen (file list, folders, FAB for new file)
- [x] Editor screen (textarea, preview toggle, format bar, auto-save)
- [x] Save/export/share actions
- [x] Design overhaul v1 (sage green) → v2 (pure B&W)
- [x] Chrome-like tab bar with drag-reorder and drop bucket
- [x] Undo/redo engine (100-item stack)
- [x] Editor stats (word count, char count, read time, session timer)

### Phase 2 — React/Vite Rewrite (mdview/)
- [x] Project scaffolded with Vite + React 19
- [x] Component architecture: App, Header, Editor, Preview, FileDrawer
- [x] marked@18 + DOMPurify + highlight.js for GitHub-style rendering
- [x] Custom useLocalStorage hook for persistence
- [x] File drawer with create, rename, delete, import functionality
- [x] Split-view editor/preview with view mode toggle (edit/preview/split)
- [x] Formatting toolbar (bold, italic, heading, list, link, image, code block)
- [x] Dark/light theme toggle with CSS custom properties
- [x] Export to .md file download
- [x] Copy markdown to clipboard
- [x] Default content with markdown tutorial

### Phase 3 — Android App + Feature Parity (v2.0)
- [x] StatsBar component: word count, char count, line count, read time
- [x] Sync scrolling between editor and preview (forwardRef + scroll handlers)
- [x] HTML export with full standalone template (inline CSS + highlight.js)
- [x] Toast notification system (copy confirmation, 3s auto-dismiss)
- [x] Header: sync scroll toggle, split export menu (Export .md / Export .html)
- [x] Editor/Preview converted to forwardRef for scroll sync
- [x] Code block button (```) added to formatting toolbar
- [x] Capacitor initialized (com.mdview.app, webDir: dist)
- [x] Android platform added and synced
- [x] StatusBar plugin: dark style, #0a0a0a background
- [x] SplashScreen plugin: 1500ms duration, #0a0a0a background
- [x] Android build.gradle: v2.0.0, ProGuard + shrinkResources for release
- [x] AndroidManifest: .md file intent filters, adjustResize soft input
- [x] Android styles.xml: dark theme colors (#0a0a0a status/nav bars)
- [x] Safe area insets (env()) for Capacitor/Android
- [x] Production build verified (dist/ ~1.2MB JS, 13.8KB CSS)
- [x] Capacitor sync verified (2 plugins: splash-screen, status-bar)
- [x] checkpoint.md updated to v2.0

### Pending
- [ ] Install JDK 17+ and Android SDK on build machine
- [ ] Build debug APK: `cd android && ./gradlew assembleDebug`
- [ ] Build release AAB for Play Store: `cd android && ./gradlew bundleRelease`
- [ ] Generate app icons (adaptive icons for Android 8+)
- [ ] Create splash screen assets
- [ ] Configure release signing keystore
- [ ] Play Store listing (screenshots, description, privacy policy)
- [ ] PDF export support
- [ ] Emoji rendering support
