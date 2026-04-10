/* ============================================
   MDView — Markdown Parser Config
   Uses marked.js + highlight.js
   ============================================ */

const Markdown = (() => {
  function init() {
    if (typeof marked === 'undefined') return;

    try {
      // marked v12+ uses marked.use() instead of setOptions
      if (typeof marked.use === 'function') {
        marked.use({ breaks: true, gfm: true });
      } else {
        marked.setOptions({ breaks: true, gfm: true });
      }
    } catch(e) {
      console.warn('Markdown init:', e);
    }
  }

  function render(mdText) {
    if (typeof marked === 'undefined') return escapeForPreview(mdText);
    try {
      const html = marked.parse(mdText || '');
      return html;
    } catch (e) {
      return `<p style="color:var(--danger)">${e.message}</p>`;
    }
  }

  function escapeForPreview(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  return { init, render };
})();
