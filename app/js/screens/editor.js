/* ============================================
   .md viewer — Editor Screen
   Write markdown + preview + undo/redo + timer
   ============================================ */

const EditorScreen = (() => {
  let currentFile = null;
  let isPreview = false;
  let autoSaveTimer = null;
  let hasUnsavedChanges = false;

  // ── Undo/Redo ──
  let undoStack = [];
  let redoStack = [];
  let lastPushed = '';
  let undoDebounce = null;

  // ── Session timer ──
  let timerInterval = null;
  let timerSeconds = 0;

  // ── SVG Icons ──
  const ICONS = {
    eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    save: '<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
    download: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
    bold: '<svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>',
    italic: '<svg viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>',
    heading: '<svg viewBox="0 0 24 24"><path d="M6 4v16"/><path d="M18 4v16"/><path d="M6 12h12"/></svg>',
    list: '<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    code: '<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
    quote: '<svg viewBox="0 0 24 24"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    check: '<svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    table: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
    undo: '<svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    redo: '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10"/></svg>',
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    type: '<svg viewBox="0 0 24 24"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    hash: '<svg viewBox="0 0 24 24"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
    book: '<svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
  };

  function render(params = {}) {
    const fileId = params.fileId;
    currentFile = fileId ? Store.getFile(fileId) : null;

    if (!currentFile) {
      currentFile = Store.saveFile({
        id: Store.generateId(),
        title: 'Untitled',
        content: '',
        tags: [],
        folder: null
      });
    }

    // Track open tab
    Store.addTab(currentFile.id);
    Store.setActiveTab(currentFile.id);

    isPreview = false;
    hasUnsavedChanges = false;
    undoStack = [currentFile.content || ''];
    redoStack = [];
    lastPushed = currentFile.content || '';
    timerSeconds = 0;
    if (timerInterval) clearInterval(timerInterval);

    const tags = currentFile.tags || [];
    const text = currentFile.content || '';
    const isDark = Theme.isDark();

    return `
      <div class="editor-screen screen" id="editor-screen">
        <!-- Tab Bar -->
        ${TabBar.render()}

        <!-- Toolbar -->
        <div class="editor-toolbar anim-fade-in-down">
          <div class="editor-toolbar-left">
            <input class="editor-title-input" id="editor-title" value="${escapeAttr(currentFile.title)}" placeholder="Untitled" maxlength="48">
            <div class="save-dot" id="save-dot"></div>
          </div>
          <div class="editor-toolbar-right">
            <button class="btn-icon" id="btn-save" title="Save">${ICONS.save}</button>
            <button class="btn-icon" id="btn-actions" title="More">${ICONS.more}</button>
          </div>
        </div>

        <!-- Stats row -->
        <div class="editor-stats-row anim-fade-in-down stagger-1">
          <span class="stat-item stat-timer" id="stat-timer">
            ${ICONS.clock} <span id="timer-display">00:00</span>
          </span>
          <span class="stat-divider"></span>
          <span class="stat-item">
            ${ICONS.type} <span id="stat-words-val">${Store.getWordCount(text)}w</span>
          </span>
          <span class="stat-item">
            ${ICONS.hash} <span id="stat-chars-val">${Store.getCharCount(text)}c</span>
          </span>
          <span class="stat-item">
            ${ICONS.book} <span id="stat-read-val">${Store.getReadTime(text)}</span>
          </span>
          <span class="stat-spacer"></span>
          <button class="stat-theme-toggle" id="btn-theme-editor" title="Toggle theme">
            ${isDark ? ICONS.sun : ICONS.moon}
          </button>
        </div>

        <!-- Tags -->
        <div class="tag-input-row anim-fade-in-down stagger-1">
          ${tags.map(t => `
            <span class="tag-badge">${escapeHtml(t)}<button class="tag-remove" data-tag="${escapeAttr(t)}">×</button></span>
          `).join('')}
          <input class="tag-add-input" id="tag-input" placeholder="+ tag" maxlength="20" autocomplete="off">
        </div>

        <!-- Format bar with undo/redo -->
        <div class="format-bar anim-fade-in stagger-2">
          <button class="format-btn undo-redo" id="btn-undo" title="Undo">${ICONS.undo}</button>
          <button class="format-btn undo-redo" id="btn-redo" title="Redo">${ICONS.redo}</button>
          <div class="format-divider"></div>
          <button class="format-btn" data-format="heading" title="Heading">${ICONS.heading}</button>
          <button class="format-btn" data-format="bold" title="Bold">${ICONS.bold}</button>
          <button class="format-btn" data-format="italic" title="Italic">${ICONS.italic}</button>
          <div class="format-divider"></div>
          <button class="format-btn" data-format="code" title="Code">${ICONS.code}</button>
          <button class="format-btn" data-format="link" title="Link">${ICONS.link}</button>
          <button class="format-btn" data-format="quote" title="Blockquote">${ICONS.quote}</button>
          <div class="format-divider"></div>
          <button class="format-btn" data-format="list" title="List">${ICONS.list}</button>
          <button class="format-btn" data-format="check" title="Checkbox">${ICONS.check}</button>
          <button class="format-btn" data-format="table" title="Table">${ICONS.table}</button>
          <button class="format-btn" data-format="image" title="Image">${ICONS.image}</button>
        </div>

        <!-- Editor body -->
        <div class="editor-body">
          <textarea class="editor-textarea" id="editor-textarea" placeholder="Start writing markdown...">${escapeHtml(currentFile.content)}</textarea>

          <!-- Preview overlay -->
          <div class="preview-container" id="preview-container">
            <div class="md-content" id="preview-content"></div>
          </div>

          <!-- Preview toggle -->
          <button class="preview-toggle" id="btn-preview">
            ${ICONS.eye}
            <span>Preview</span>
          </button>
        </div>

        <!-- Status bar -->
        <div class="editor-status">
          <span id="stat-saved">Saved</span>
        </div>

        <!-- Actions sheet -->
        <div class="overlay" id="actions-overlay"></div>
        <div class="bottom-sheet" id="actions-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-title">Actions</div>
          <button class="sheet-option" id="action-save">${ICONS.save} <span>Save</span></button>
          <button class="sheet-option" id="action-export">${ICONS.download} <span>Export as .md</span></button>
          <button class="sheet-option" id="action-share">${ICONS.share} <span>Share</span></button>
        </div>
      </div>
    `;
  }

  function bind() {
    const textarea = document.getElementById('editor-textarea');
    const titleInput = document.getElementById('editor-title');
    const previewContainer = document.getElementById('preview-container');
    const previewContent = document.getElementById('preview-content');
    const previewBtn = document.getElementById('btn-preview');
    const saveDot = document.getElementById('save-dot');

    // Bind tab bar
    TabBar.bind();

    // Start session timer
    startTimer();

    // Auto-save on typing + undo push
    textarea?.addEventListener('input', () => {
      hasUnsavedChanges = true;
      saveDot?.classList.add('unsaved');
      updateStats();
      scheduleAutoSave();
      scheduleUndoPush();
    });

    titleInput?.addEventListener('input', () => {
      hasUnsavedChanges = true;
      saveDot?.classList.add('unsaved');
      scheduleAutoSave();
      updateTabTitle();
    });

    // Preview toggle
    previewBtn?.addEventListener('click', () => {
      isPreview = !isPreview;

      if (isPreview) {
        const md = textarea?.value || '';
        const html = Markdown.render(md);
        if (previewContent) previewContent.innerHTML = html;
        previewContainer?.classList.add('active');
        previewBtn.innerHTML = `${ICONS.edit}<span>Edit</span>`;
        previewBtn.classList.add('previewing');

        if (typeof hljs !== 'undefined') {
          previewContainer?.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
          });
        }
      } else {
        previewContainer?.classList.remove('active');
        previewBtn.innerHTML = `${ICONS.eye}<span>Preview</span>`;
        previewBtn.classList.remove('previewing');
        textarea?.focus();
      }
    });

    // Theme toggle
    document.getElementById('btn-theme-editor')?.addEventListener('click', () => {
      const next = Theme.toggle();
      const btn = document.getElementById('btn-theme-editor');
      if (btn) btn.innerHTML = next === 'dark' ? ICONS.sun : ICONS.moon;
    });

    // Undo/Redo buttons
    document.getElementById('btn-undo')?.addEventListener('click', () => performUndo(textarea));
    document.getElementById('btn-redo')?.addEventListener('click', () => performRedo(textarea));

    // Keyboard shortcuts
    textarea?.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        performUndo(textarea);
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey) || (e.key === 'Z' && e.shiftKey))) {
        e.preventDefault();
        performRedo(textarea);
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        hasUnsavedChanges = true;
        scheduleAutoSave();
        pushUndoState(textarea.value);
      }
    });

    // Format toolbar
    document.querySelectorAll('.format-btn:not(.undo-redo)').forEach(btn => {
      btn.addEventListener('click', () => {
        const format = btn.dataset.format;
        if (format) insertFormat(format, textarea);
      });
    });

    // Tag handling
    document.getElementById('tag-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const input = e.target;
        const tag = input.value.trim().replace(/,/g, '');
        if (tag && currentFile.tags.indexOf(tag) === -1) {
          currentFile.tags.push(tag);
          saveNow();
          refreshTags();
        }
        input.value = '';
      }
    });

    document.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        currentFile.tags = currentFile.tags.filter(t => t !== tag);
        saveNow();
        refreshTags();
      });
    });

    // Save button
    document.getElementById('btn-save')?.addEventListener('click', () => {
      saveNow();
      App.toast('Saved ✓');
    });

    // Actions sheet
    document.getElementById('btn-actions')?.addEventListener('click', () => {
      document.getElementById('actions-overlay')?.classList.add('active');
      document.getElementById('actions-sheet')?.classList.add('active');
    });
    document.getElementById('actions-overlay')?.addEventListener('click', closeActions);
    document.getElementById('action-save')?.addEventListener('click', () => {
      saveNow();
      closeActions();
      App.toast('Saved ✓');
    });
    document.getElementById('action-export')?.addEventListener('click', () => {
      exportFile();
      closeActions();
    });
    document.getElementById('action-share')?.addEventListener('click', () => {
      shareFile();
      closeActions();
    });

    updateUndoRedoButtons();
  }

  // ── Undo / Redo Engine ──
  function pushUndoState(text) {
    if (text === lastPushed) return;
    undoStack.push(text);
    redoStack = [];
    lastPushed = text;
    if (undoStack.length > 100) undoStack.shift();
    updateUndoRedoButtons();
  }

  function scheduleUndoPush() {
    if (undoDebounce) clearTimeout(undoDebounce);
    undoDebounce = setTimeout(() => {
      const textarea = document.getElementById('editor-textarea');
      if (textarea) pushUndoState(textarea.value);
    }, 500);
  }

  function performUndo(textarea) {
    if (!textarea || undoStack.length <= 1) return;
    const current = undoStack.pop();
    redoStack.push(current);
    const prev = undoStack[undoStack.length - 1];
    textarea.value = prev;
    lastPushed = prev;
    hasUnsavedChanges = true;
    document.getElementById('save-dot')?.classList.add('unsaved');
    updateStats();
    scheduleAutoSave();
    updateUndoRedoButtons();
  }

  function performRedo(textarea) {
    if (!textarea || redoStack.length === 0) return;
    const next = redoStack.pop();
    undoStack.push(next);
    textarea.value = next;
    lastPushed = next;
    hasUnsavedChanges = true;
    document.getElementById('save-dot')?.classList.add('unsaved');
    updateStats();
    scheduleAutoSave();
    updateUndoRedoButtons();
  }

  function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');
    if (undoBtn) undoBtn.classList.toggle('disabled', undoStack.length <= 1);
    if (redoBtn) redoBtn.classList.toggle('disabled', redoStack.length === 0);
  }

  // ── Session Timer ──
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerSeconds = 0;
    timerInterval = setInterval(() => {
      timerSeconds++;
      const display = document.getElementById('timer-display');
      if (display) {
        const m = Math.floor(timerSeconds / 60);
        const s = timerSeconds % 60;
        display.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }
    }, 1000);
  }

  function updateTabTitle() {
    const titleInput = document.getElementById('editor-title');
    if (!titleInput || !currentFile) return;
    const newTitle = titleInput.value.trim() || 'Untitled';
    const tabEl = document.querySelector('.tab[data-tab-id="' + currentFile.id + '"] .tab-title');
    if (tabEl) tabEl.textContent = newTitle;
  }

  // ── Formatting helpers ──
  function insertFormat(type, textarea) {
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let insert = '';
    let cursorOffset = 0;

    switch (type) {
      case 'heading':
        insert = '## ' + (selected || 'Heading');
        cursorOffset = selected ? insert.length : 3;
        break;
      case 'bold':
        insert = '**' + (selected || 'bold text') + '**';
        cursorOffset = selected ? insert.length : 2;
        break;
      case 'italic':
        insert = '*' + (selected || 'italic text') + '*';
        cursorOffset = selected ? insert.length : 1;
        break;
      case 'code':
        if (selected.includes('\n')) {
          insert = "```\n" + (selected || 'code') + "\n```";
        } else {
          insert = "`" + (selected || 'code') + "`";
        }
        cursorOffset = selected ? insert.length : 1;
        break;
      case 'link':
        insert = '[' + (selected || 'text') + '](url)';
        cursorOffset = selected ? insert.length - 5 : 1;
        break;
      case 'quote':
        insert = '> ' + (selected || 'quote');
        cursorOffset = selected ? insert.length : 2;
        break;
      case 'list':
        insert = '- ' + (selected || 'item');
        cursorOffset = selected ? insert.length : 2;
        break;
      case 'check':
        insert = '- [ ] ' + (selected || 'task');
        cursorOffset = selected ? insert.length : 6;
        break;
      case 'table':
        insert = '| Column 1 | Column 2 |\n| --- | --- |\n| Cell | Cell |';
        cursorOffset = 2;
        break;
      case 'image':
        insert = '![' + (selected || 'alt text') + '](url)';
        cursorOffset = selected ? insert.length : 2;
        break;
    }

    textarea.value = textarea.value.substring(0, start) + insert + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + cursorOffset;
    textarea.focus();
    hasUnsavedChanges = true;
    scheduleAutoSave();
    pushUndoState(textarea.value);
    updateStats();
  }

  // ── Auto-save ──
  function scheduleAutoSave() {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => saveNow(), 1500);
  }

  function saveNow() {
    if (!currentFile) return;
    const textarea = document.getElementById('editor-textarea');
    const titleInput = document.getElementById('editor-title');
    const saveDot = document.getElementById('save-dot');
    const statSaved = document.getElementById('stat-saved');

    currentFile.content = textarea?.value || '';
    currentFile.title = titleInput?.value.trim() || 'Untitled';
    Store.saveFile(currentFile);

    hasUnsavedChanges = false;
    saveDot?.classList.remove('unsaved');
    if (statSaved) statSaved.textContent = 'Saved';
  }

  function updateStats() {
    const textarea = document.getElementById('editor-textarea');
    const text = textarea?.value || '';
    const wordsEl = document.getElementById('stat-words-val');
    const charsEl = document.getElementById('stat-chars-val');
    const readEl = document.getElementById('stat-read-val');
    if (wordsEl) wordsEl.textContent = Store.getWordCount(text) + 'w';
    if (charsEl) charsEl.textContent = Store.getCharCount(text) + 'c';
    if (readEl) readEl.textContent = Store.getReadTime(text);
  }

  function refreshTags() {
    const row = document.querySelector('.tag-input-row');
    if (!row) return;
    const tags = currentFile.tags || [];
    row.innerHTML = tags.map(t =>
      '<span class="tag-badge">' + escapeHtml(t) + '<button class="tag-remove" data-tag="' + escapeAttr(t) + '">×</button></span>'
    ).join('') + '<input class="tag-add-input" id="tag-input" placeholder="+ tag" maxlength="20" autocomplete="off">';
    document.querySelectorAll('.tag-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const tag = btn.dataset.tag;
        currentFile.tags = currentFile.tags.filter(t => t !== tag);
        saveNow();
        refreshTags();
      });
    });
    document.getElementById('tag-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const input = e.target;
        const tag = input.value.trim().replace(/,/g, '');
        if (tag && currentFile.tags.indexOf(tag) === -1) {
          currentFile.tags.push(tag);
          saveNow();
          refreshTags();
        }
        input.value = '';
      }
    });
  }

  function closeActions() {
    document.getElementById('actions-overlay')?.classList.remove('active');
    document.getElementById('actions-sheet')?.classList.remove('active');
  }

  function exportFile() {
    if (!currentFile) return;
    const content = currentFile.content;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentFile.title || 'untitled') + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    App.toast('Exported ✓');
  }

  function shareFile() {
    if (!currentFile) return;
    const content = currentFile.content;
    const title = currentFile.title || 'Untitled';

    if (navigator.share) {
      navigator.share({
        title: title,
        text: content,
        files: [new File([content], title + '.md', { type: 'text/markdown' })]
      }).catch(() => {
        navigator.share({ title, text: content }).catch(() => {
          fallbackCopy(content);
        });
      });
    } else {
      fallbackCopy(content);
    }
  }

  function fallbackCopy(text) {
    navigator.clipboard?.writeText(text).then(() => {
      App.toast('Copied to clipboard');
    }).catch(() => {
      App.toast('Share not supported');
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function destroy() {
    if (timerInterval) clearInterval(timerInterval);
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    if (undoDebounce) clearTimeout(undoDebounce);
  }

  return { render, bind, destroy };
})();
