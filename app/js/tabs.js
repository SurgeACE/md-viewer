/* ============================================
   .md viewer — Tab Bar Controller
   Chrome-style tab management with drag & drop
   ============================================ */

const TabBar = (() => {
  let dragSrcIndex = null;

  const ICONS = {
    import: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
  };

  function render() {
    const tabs = Store.getOpenTabs();
    const activeId = Store.getActiveTab();

    return `
      <div class="tab-bar" id="tab-bar">
        <div class="tab-bar-brand">.md</div>
        <div class="tab-bar-scroll" id="tab-bar-scroll">
          ${tabs.map((tabId, i) => {
            const file = Store.getFile(tabId);
            if (!file) return '';
            return `
              <div class="tab ${tabId === activeId ? 'active' : ''}" data-tab-id="${tabId}" data-tab-index="${i}" draggable="true">
                <span class="tab-title">${_escTabHtml(file.title || 'Untitled')}</span>
                <button class="tab-close" data-close-tab="${tabId}">×</button>
              </div>
            `;
          }).join('')}
          <button class="tab-new" id="tab-new-btn" title="New tab">+</button>
          <div class="tab-drop-bucket" id="tab-drop-bucket" title="Drop .md file here">
            ${ICONS.import}
          </div>
        </div>
      </div>
    `;
  }

  function bind() {
    // Tab click — switch to that file
    document.querySelectorAll('.tab[data-tab-id]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close')) return;
        const id = tab.dataset.tabId;
        Store.setActiveTab(id);
        Router.navigate('editor', { fileId: id });
      });
    });

    // Close tab
    document.querySelectorAll('.tab-close[data-close-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.closeTab;
        _closeTab(id);
      });
    });

    // New tab
    document.getElementById('tab-new-btn')?.addEventListener('click', () => {
      Store.setActiveTab(null);
      Router.navigate('home');
    });

    // Drag & drop reorder
    _initDragDrop();

    // Drop bucket for importing files
    _initDropBucket();
  }

  function _closeTab(fileId) {
    Store.closeTab(fileId);
    const tabs = Store.getOpenTabs();
    const wasActive = Store.getActiveTab() === fileId || Store.getActiveTab() === null;

    if (wasActive || fileId === Store.getActiveTab()) {
      if (tabs.length > 0) {
        const nextTab = tabs[tabs.length - 1];
        Store.setActiveTab(nextTab);
        Router.navigate('editor', { fileId: nextTab });
      } else {
        Store.setActiveTab(null);
        Router.navigate('home');
      }
    } else {
      // Refresh current view
      const activeId = Store.getActiveTab();
      if (activeId) {
        Router.navigate('editor', { fileId: activeId });
      } else {
        Router.navigate('home');
      }
    }
  }

  function _initDragDrop() {
    const tabs = document.querySelectorAll('.tab[draggable]');

    tabs.forEach(tab => {
      let touchStartX = 0;
      let isDragging = false;

      // Touch events (mobile)
      tab.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        isDragging = false;
        dragSrcIndex = parseInt(tab.dataset.tabIndex);
      }, { passive: true });

      tab.addEventListener('touchmove', (e) => {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        if (dx > 12) {
          isDragging = true;
          tab.classList.add('dragging');
          e.preventDefault();

          const overTab = document.elementFromPoint(
            e.touches[0].clientX, e.touches[0].clientY
          )?.closest('.tab[data-tab-index]');

          if (overTab && overTab !== tab) {
            const overIndex = parseInt(overTab.dataset.tabIndex);
            _reorderTab(dragSrcIndex, overIndex);
            dragSrcIndex = overIndex;
          }
        }
      }, { passive: false });

      tab.addEventListener('touchend', () => {
        tab.classList.remove('dragging');
        isDragging = false;
      });

      // Desktop drag events
      tab.addEventListener('dragstart', (e) => {
        dragSrcIndex = parseInt(tab.dataset.tabIndex);
        tab.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      tab.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      tab.addEventListener('drop', (e) => {
        e.preventDefault();
        const targetIndex = parseInt(tab.dataset.tabIndex);
        if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
          _reorderTab(dragSrcIndex, targetIndex);
        }
      });

      tab.addEventListener('dragend', () => {
        tab.classList.remove('dragging');
        dragSrcIndex = null;
      });
    });
  }

  function _reorderTab(fromIndex, toIndex) {
    const tabs = Store.getOpenTabs();
    if (fromIndex < 0 || fromIndex >= tabs.length) return;
    if (toIndex < 0 || toIndex >= tabs.length) return;

    const [moved] = tabs.splice(fromIndex, 1);
    tabs.splice(toIndex, 0, moved);
    Store.setOpenTabs(tabs);

    // Re-render tab bar content
    const activeId = Store.getActiveTab();
    const scrollEl = document.getElementById('tab-bar-scroll');
    if (scrollEl) {
      scrollEl.innerHTML = tabs.map((tabId, i) => {
        const file = Store.getFile(tabId);
        if (!file) return '';
        return `
          <div class="tab ${tabId === activeId ? 'active' : ''}" data-tab-id="${tabId}" data-tab-index="${i}" draggable="true">
            <span class="tab-title">${_escTabHtml(file.title || 'Untitled')}</span>
            <button class="tab-close" data-close-tab="${tabId}">×</button>
          </div>
        `;
      }).join('') + `
        <button class="tab-new" id="tab-new-btn" title="New tab">+</button>
        <div class="tab-drop-bucket" id="tab-drop-bucket" title="Drop .md file here">
          ${ICONS.import}
        </div>
      `;
      bind(); // Re-bind events
    }
  }

  function _initDropBucket() {
    const bucket = document.getElementById('tab-drop-bucket');
    if (!bucket) return;

    bucket.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      bucket.classList.add('drag-over');
    });

    bucket.addEventListener('dragleave', () => {
      bucket.classList.remove('drag-over');
    });

    bucket.addEventListener('drop', (e) => {
      e.preventDefault();
      bucket.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        _importFile(files[0]);
      }
    });

    // Clickable fallback for import
    bucket.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt';
      input.addEventListener('change', (ev) => {
        const file = ev.target.files[0];
        if (file) _importFile(file);
      });
      input.click();
    });
  }

  function _importFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target.result;
      const name = file.name.replace(/\.(md|markdown|txt)$/, '');
      const saved = Store.saveFile({
        id: Store.generateId(),
        title: name,
        content: content,
        tags: [],
        folder: null
      });
      Store.addTab(saved.id);
      Store.setActiveTab(saved.id);
      Router.navigate('editor', { fileId: saved.id });
      App.toast('Imported: ' + name);
    };
    reader.readAsText(file);
  }

  function _escTabHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, bind };
})();
