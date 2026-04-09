# Rules

1. Always refer to `checkpoint.md` before starting any task.
2. Update `checkpoint.md` after every meaningful change — keep it dead simple.
3. Keep code modular: one component per file, one concern per module.
4. Dark mode is default. Light mode is secondary.
5. No boring UI — every screen must feel alive with subtle motion.
6. Mobile-first: vertical layout, thumb-friendly, no side-by-side panels.
7. Local-first: all data stays on device via localStorage.
8. Test on Android. iOS is bonus.
9. Keep dependencies minimal — don't bloat the app.
10. UX > aesthetics > features. Usability is king.
11. **Cache-busting on every change**: Bump `?v=N` on all CSS/JS refs in `index.html` AND bump `CACHE_VERSION` in `sw.js`. SW uses network-first strategy so refreshing always loads fresh assets.
12. **Dev server**: Always serve from `app/` directory: `cd app && python -m http.server 8080`. Never serve from project root.
13. **After making changes**: Kill old server, relaunch from `app/`, open browser with `?bustcache=N` to force reload past any residual cache.
