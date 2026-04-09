/* ============================================
   MDView — Theme Controller
   Dark-first with smooth transitions
   ============================================ */

const Theme = (() => {
  function init() {
    const settings = Store.getSettings();
    apply(settings.theme || 'dark');
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === 'dark' ? '#0a0a0a' : '#f5f5f5';
    }
    // Update highlight.js theme
    const hljsLink = document.getElementById('hljs-theme');
    if (hljsLink) {
      hljsLink.href = theme === 'dark'
        ? 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css'
        : 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css';
    }
    Store.updateSettings({ theme });
  }

  function toggle() {
    const current = Store.getSettings().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    // Add transition class for smooth morphing
    document.documentElement.classList.add('theme-transition');
    apply(next);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);
    return next;
  }

  function current() {
    return Store.getSettings().theme || 'dark';
  }

  function isDark() {
    return current() === 'dark';
  }

  return { init, apply, toggle, current, isDark };
})();
