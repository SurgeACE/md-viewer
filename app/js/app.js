/* ============================================
   MDView — App Entry Point
   ============================================ */

const App = (() => {
  let toastTimer = null;

  function init() {
    // Global error handler — catch silent JS errors
    window.onerror = function(msg, src, line, col, err) {
      console.error('[MDView Error]', msg, 'at', src, line + ':' + col, err);
      toast('Error: ' + msg, 4000);
      return false;
    };
    window.addEventListener('unhandledrejection', function(e) {
      console.error('[MDView Promise Error]', e.reason);
    });

    // Init subsystems
    Markdown.init();
    Theme.init();

    // Start router
    Router.init();

    // Service worker DISABLED during dev — re-enable for production
    // The SW was causing stale cache issues. The inline <script> in
    // index.html already unregisters any old SWs on every load.
    // To re-enable: uncomment the block below and remove the
    // nuclear-cache-clear script from index.html.
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(reg => {
        reg.update();
      }).catch(() => {});
    }
    */

    // Handle back button on Android
    window.addEventListener('popstate', () => {
      const current = Router.getCurrentScreen();
      if (current === 'editor') {
        Router.navigate('home');
      }
    });
  }

  function toast(message, duration = 2500) {
    // Remove existing toast
    let existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);

    // Trigger animation
    requestAnimationFrame(() => {
      el.classList.add('show');
    });

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 400);
    }, duration);
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { toast };
})();
