/* ============================================
   .md viewer — Home Screen
   Recent files, folders, tags, organizer
   ============================================ */

const HomeScreen = (() => {
  let activeFolder = 'all';
  let searchQuery = '';

  // ── SVG Icons ──
  const ICONS = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    file: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    feather: '<svg viewBox="0 0 24 24"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    folderPlus: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
    import: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  };

  function render() {
    const profile = Store.getProfile();
    const folders = Store.getFolders();
    const files = getFilteredFiles();
    const isDark = Theme.isDark();

    const greeting = getGreeting();

    return `
      <div class="home-screen screen" id="home-screen">
        <!-- Header -->
        <div class="home-header anim-fade-in-down">
          <div class="home-greeting">
            <div class="home-avatar">${profile ? profile.avatar : '✍️'}</div>
            <div>
              <div class="home-name">${greeting}, ${profile ? profile.name : 'Writer'}</div>
              <div class="home-date">${formatToday()}</div>
            </div>
          </div>
          <div class="home-actions">
            <button class="btn-icon" id="btn-theme" title="Toggle theme">
              ${isDark ? ICONS.sun : ICONS.moon}
            </button>
            <button class="btn-icon" id="btn-import" title="Import .md file">
              ${ICONS.import}
            </button>
          </div>
        </div>

        <!-- Search -->
        <div class="home-search anim-fade-in-up stagger-1">
          ${ICONS.search}
          <input type="text" id="home-search-input" placeholder="Search files, tags..." autocomplete="off" value="${searchQuery}">
        </div>

        <!-- Folders -->
        <div class="section-header anim-fade-in-up stagger-2">
          <span class="section-title">Folders</span>
          <button class="section-action" id="btn-add-folder">+ New</button>
        </div>
        <div class="folder-row anim-fade-in-up stagger-2">
          <button class="folder-icon-btn ${activeFolder === 'all' ? 'active' : ''}" data-folder="all">
            <div class="folder-icon" style="--folder-color: var(--text-secondary)">
              <div class="folder-tab"></div>
              <div class="folder-body">
                <span class="folder-count-inner">${Store.getFiles().length}</span>
              </div>
            </div>
            <span class="folder-label">All</span>
          </button>
          ${folders.map(f => `
            <button class="folder-icon-btn ${activeFolder === f.id ? 'active' : ''}" data-folder="${f.id}">
              <div class="folder-icon" style="--folder-color: ${f.color || '#5b8def'}">
                <div class="folder-tab"></div>
                <div class="folder-body">
                  <span class="folder-count-inner">${Store.getFilesByFolder(f.id).length}</span>
                </div>
              </div>
              <span class="folder-label">${f.name}</span>
            </button>
          `).join('')}
        </div>

        <!-- Recent files -->
        <div class="section-header anim-fade-in-up stagger-3">
          <span class="section-title">${searchQuery ? 'Search Results' : 'Recent'}</span>
          <span class="section-action">${files.length} files</span>
        </div>

        ${files.length > 0 ? `
          <div class="file-list">
            ${files.map((f, i) => `
              <div class="file-card anim-fade-in-up stagger-${Math.min(i + 3, 8)}" data-file-id="${f.id}">
                <div class="file-card-icon">
                  ${ICONS.file}
                </div>
                <div class="file-card-info">
                  <div class="file-card-title">${escapeHtml(f.title)}</div>
                  <div class="file-card-meta">
                    <span>${Store.formatDate(f.updatedAt)}</span>
                    <span>·</span>
                    <span>${Store.getWordCount(f.content)} words</span>
                    ${f.tags && f.tags.length > 0 ? `<span class="file-card-tag">${f.tags[0]}</span>` : ''}
                  </div>
                </div>
                <button class="btn-icon file-card-more" data-file-menu="${f.id}">
                  ${ICONS.more}
                </button>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state anim-fade-in-up stagger-4">
            <div class="empty-state-icon">
              ${ICONS.feather}
            </div>
            <div class="empty-state-title">No files yet</div>
            <div class="empty-state-desc">Tap the + button to create your first markdown file</div>
          </div>
        `}

        <!-- FAB -->
        <button class="fab anim-bounce-in stagger-5" id="btn-new-file">
          ${ICONS.plus}
        </button>

        <!-- File context menu (bottom sheet) -->
        <div class="overlay" id="file-menu-overlay"></div>
        <div class="bottom-sheet" id="file-menu-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-title" id="file-menu-title">File Options</div>
          <button class="sheet-option" id="file-menu-open">
            ${ICONS.file} <span>Open</span>
          </button>
          <button class="sheet-option" id="file-menu-move">
            ${ICONS.folder} <span>Move to folder</span>
          </button>
          <button class="sheet-option" id="file-menu-delete" style="color: var(--danger)">
            ${ICONS.trash} <span>Delete</span>
          </button>
        </div>

        <!-- New file dialog -->
        <div class="overlay" id="newfile-dialog-overlay"></div>
        <div class="bottom-sheet" id="newfile-dialog-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-title">New File</div>
          <input class="dialog-input" id="newfile-name-input" placeholder="File name" maxlength="48" autocomplete="off">
          <div class="dialog-actions">
            <button class="btn-secondary" id="newfile-dialog-cancel">Cancel</button>
            <button class="btn-primary" id="newfile-dialog-create" style="padding:10px 20px; font-size:13px;">Create</button>
          </div>
        </div>

        <!-- New folder dialog -->
        <div class="overlay" id="folder-dialog-overlay"></div>
        <div class="bottom-sheet" id="folder-dialog-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-title">New Folder</div>
          <input class="dialog-input" id="folder-name-input" placeholder="Folder name" maxlength="24" autocomplete="off">
          <div class="dialog-actions">
            <button class="btn-secondary" id="folder-dialog-cancel">Cancel</button>
            <button class="btn-primary" id="folder-dialog-save" style="padding:10px 20px; font-size:13px;">Create</button>
          </div>
        </div>

        <!-- Move to folder dialog -->
        <div class="overlay" id="move-dialog-overlay"></div>
        <div class="bottom-sheet" id="move-dialog-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-title">Move to folder</div>
          <div id="move-folder-list"></div>
        </div>
      </div>
    `;
  }

  function bind() {
    let menuFileId = null;

    // Theme toggle
    document.getElementById('btn-theme')?.addEventListener('click', () => {
      Theme.toggle();
      HomeScreen.refresh();
    });

    // Import .md file
    document.getElementById('btn-import')?.addEventListener('click', importFile);

    // New file — show dialog, then open editor
    document.getElementById('btn-new-file')?.addEventListener('click', () => {
      const input = document.getElementById('newfile-name-input');
      if (input) input.value = '';
      openSheet('newfile-dialog');
      setTimeout(() => input?.focus(), 300);
    });

    // New file dialog
    document.getElementById('newfile-dialog-overlay')?.addEventListener('click', () => closeSheet('newfile-dialog'));
    document.getElementById('newfile-dialog-cancel')?.addEventListener('click', () => closeSheet('newfile-dialog'));
    document.getElementById('newfile-dialog-create')?.addEventListener('click', () => {
      createNewFileFromDialog();
    });
    document.getElementById('newfile-name-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        createNewFileFromDialog();
      }
    });

    function createNewFileFromDialog() {
      const input = document.getElementById('newfile-name-input');
      const title = (input?.value || '').trim() || 'Untitled';
      closeSheet('newfile-dialog');
      const file = Store.saveFile({
        id: Store.generateId(),
        title: title,
        content: '',
        tags: [],
        folder: activeFolder !== 'all' ? activeFolder : null
      });
      Store.addTab(file.id);
      Store.setActiveTab(file.id);
      Router.navigate('editor', { fileId: file.id });
    }

    // Search
    document.getElementById('home-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      refreshFileList();
    });

    // Folder tabs
    document.querySelectorAll('.folder-icon-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        activeFolder = chip.dataset.folder;
        searchQuery = '';
        const searchInput = document.getElementById('home-search-input');
        if (searchInput) searchInput.value = '';
        HomeScreen.refresh();
      });
    });

    // File cards — open on tap (add to tab bar)
    document.querySelectorAll('.file-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.file-card-more')) return;
        const id = card.dataset.fileId;
        Store.addTab(id);
        Store.setActiveTab(id);
        Router.navigate('editor', { fileId: id });
      });
    });

    // File context menu
    document.querySelectorAll('[data-file-menu]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuFileId = btn.dataset.fileMenu;
        const file = Store.getFile(menuFileId);
        document.getElementById('file-menu-title').textContent = file ? file.title : 'File Options';
        openSheet('file-menu');
      });
    });

    document.getElementById('file-menu-overlay')?.addEventListener('click', () => closeSheet('file-menu'));
    document.getElementById('file-menu-open')?.addEventListener('click', () => {
      closeSheet('file-menu');
      if (menuFileId) {
        Store.addTab(menuFileId);
        Store.setActiveTab(menuFileId);
        Router.navigate('editor', { fileId: menuFileId });
      }
    });
    document.getElementById('file-menu-delete')?.addEventListener('click', () => {
      if (menuFileId) {
        Store.deleteFile(menuFileId);
        closeSheet('file-menu');
        App.toast('File deleted');
        HomeScreen.refresh();
      }
    });
    document.getElementById('file-menu-move')?.addEventListener('click', () => {
      closeSheet('file-menu');
      showMoveDialog(menuFileId);
    });

    // New folder dialog
    document.getElementById('btn-add-folder')?.addEventListener('click', () => openSheet('folder-dialog'));
    document.getElementById('folder-dialog-overlay')?.addEventListener('click', () => closeSheet('folder-dialog'));
    document.getElementById('folder-dialog-cancel')?.addEventListener('click', () => closeSheet('folder-dialog'));
    document.getElementById('folder-dialog-save')?.addEventListener('click', () => {
      const input = document.getElementById('folder-name-input');
      const name = input?.value.trim();
      if (name) {
        Store.addFolder({ name, icon: '📁' });
        closeSheet('folder-dialog');
        App.toast('Folder created');
        HomeScreen.refresh();
      }
    });

    // Move dialog
    document.getElementById('move-dialog-overlay')?.addEventListener('click', () => closeSheet('move-dialog'));
  }

  function showMoveDialog(fileId) {
    const folders = Store.getFolders();
    const list = document.getElementById('move-folder-list');
    if (!list) return;

    list.innerHTML = [{ id: null, name: 'No folder', icon: '📄' }, ...folders].map(f => `
      <button class="sheet-option move-folder-option" data-target-folder="${f.id}">
        <span>${f.icon}</span> <span>${f.name}</span>
      </button>
    `).join('');

    list.querySelectorAll('.move-folder-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const file = Store.getFile(fileId);
        if (file) {
          let targetFolder = opt.dataset.targetFolder;
          if (targetFolder === 'null') targetFolder = null;
          file.folder = targetFolder;
          Store.saveFile(file);
          closeSheet('move-dialog');
          App.toast('Moved');
          HomeScreen.refresh();
        }
      });
    });

    openSheet('move-dialog');
  }

  function openSheet(name) {
    document.getElementById(`${name}-overlay`)?.classList.add('active');
    document.getElementById(`${name}-sheet`)?.classList.add('active');
  }

  function closeSheet(name) {
    document.getElementById(`${name}-overlay`)?.classList.remove('active');
    document.getElementById(`${name}-sheet`)?.classList.remove('active');
  }

  function getFilteredFiles() {
    if (searchQuery) {
      return Store.searchFiles(searchQuery);
    }
    if (activeFolder === 'all') {
      return Store.getRecentFiles(50);
    }
    return Store.getFilesByFolder(activeFolder);
  }

  function refreshFileList() {
    // Re-render just the file list section
    const files = getFilteredFiles();
    const listContainer = document.querySelector('.file-list') || document.querySelector('.empty-state');
    if (!listContainer) return;

    // Just do a full refresh for simplicity
    HomeScreen.refresh();
  }

  function refresh() {
    const app = document.getElementById('app');
    app.innerHTML = render();
    bind();
  }

  function importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        const name = file.name.replace(/\.(md|markdown|txt)$/, '');
        const saved = Store.saveFile({
          id: Store.generateId(),
          title: name,
          content: content,
          tags: [],
          folder: activeFolder !== 'all' ? activeFolder : null
        });
        App.toast('Imported: ' + name);
        HomeScreen.refresh();
      };
      reader.readAsText(file);
    });
    input.click();
  }

  // Helpers
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Morning';
    if (h < 17) return 'Afternoon';
    return 'Evening';
  }

  function formatToday() {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { render, bind, refresh };
})();
