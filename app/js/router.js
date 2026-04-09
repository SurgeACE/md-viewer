/* ============================================
   .md viewer — Simple Client-side Router
   Hash-based routing for SPA
   ============================================ */

const Router = (() => {
  const screens = {
    profile: ProfileScreen,
    home: HomeScreen,
    editor: EditorScreen
  };

  let currentScreen = null;
  let currentParams = {};

  function navigate(screen, params = {}) {
    // Cleanup previous screen
    if (currentScreen === 'editor' && EditorScreen.destroy) {
      EditorScreen.destroy();
    }

    currentScreen = screen;
    currentParams = params;

    const app = document.getElementById('app');
    if (!app) return;

    const renderer = screens[screen];
    if (!renderer) return;

    // Render screen
    app.innerHTML = renderer.render(params);

    // Bind events
    renderer.bind();

    // Update hash (don't store editor params in URL for cleanliness)
    if (screen !== 'editor') {
      window.location.hash = screen;
    } else {
      window.location.hash = 'editor';
    }
  }

  function init() {
    // Determine initial screen
    if (!Store.hasProfile()) {
      navigate('profile');
    } else {
      navigate('home');
    }
  }

  function getCurrentScreen() {
    return currentScreen;
  }

  return { navigate, init, getCurrentScreen };
})();
