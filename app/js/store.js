/* ============================================
   MDView — Local Storage Manager
   All data stays on device
   ============================================ */

const Store = (() => {
  const KEYS = {
    PROFILE: 'mdview_profile',
    FILES: 'mdview_files',
    FOLDERS: 'mdview_folders',
    SETTINGS: 'mdview_settings',
    VERSION: 'mdview_version'
  };

  // Migrate: clear old default folders from v1
  (function migrate() {
    const ver = localStorage.getItem(KEYS.VERSION);
    if (!ver || parseInt(ver) < 2) {
      // Remove old default folders (Notes, Projects, AI Prompts)
      const raw = localStorage.getItem(KEYS.FOLDERS);
      if (raw) {
        try {
          const folders = JSON.parse(raw);
          const cleaned = folders.filter(f => !['notes','projects','ai-prompts'].includes(f.id));
          localStorage.setItem(KEYS.FOLDERS, JSON.stringify(cleaned));
        } catch {}
      }
      localStorage.setItem(KEYS.VERSION, '2');
    }
  })();

  // ── Helpers ──
  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ── Profile ──
  function getProfile() {
    return get(KEYS.PROFILE, null);
  }

  function saveProfile(profile) {
    set(KEYS.PROFILE, {
      name: profile.name,
      avatar: profile.avatar,
      createdAt: new Date().toISOString()
    });
  }

  function hasProfile() {
    return !!getProfile();
  }

  // ── Files ──
  function getFiles() {
    return get(KEYS.FILES, []);
  }

  function getFile(id) {
    return getFiles().find(f => f.id === id) || null;
  }

  function saveFile(file) {
    const files = getFiles();
    const idx = files.findIndex(f => f.id === file.id);

    const entry = {
      id: file.id || generateId(),
      title: file.title || 'Untitled',
      content: file.content || '',
      tags: file.tags || [],
      folder: file.folder || null,
      createdAt: file.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (idx >= 0) {
      files[idx] = entry;
    } else {
      files.unshift(entry);
    }

    set(KEYS.FILES, files);
    return entry;
  }

  function deleteFile(id) {
    const files = getFiles().filter(f => f.id !== id);
    set(KEYS.FILES, files);
  }

  function searchFiles(query) {
    const q = query.toLowerCase();
    return getFiles().filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.content.toLowerCase().includes(q) ||
      (f.tags && f.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  function getFilesByFolder(folder) {
    if (!folder || folder === 'all') return getFiles();
    return getFiles().filter(f => f.folder === folder);
  }

  function getRecentFiles(limit = 10) {
    return getFiles()
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, limit);
  }

  // ── Folders ──
  const FOLDER_COLORS = ['#5b8def', '#a855f7', '#34d399', '#f97316', '#ec4899', '#eab308'];
  let colorIndex = 0;

  function getFolders() {
    return get(KEYS.FOLDERS, []);
  }

  function getNextFolderColor() {
    const color = FOLDER_COLORS[colorIndex % FOLDER_COLORS.length];
    colorIndex++;
    return color;
  }

  function addFolder(folder) {
    const folders = getFolders();
    folders.push({
      id: folder.id || generateId(),
      name: folder.name,
      icon: folder.icon || '📁',
      color: folder.color || getNextFolderColor()
    });
    set(KEYS.FOLDERS, folders);
  }

  function deleteFolder(id) {
    const folders = getFolders().filter(f => f.id !== id);
    set(KEYS.FOLDERS, folders);
    // Move files from deleted folder to no folder
    const files = getFiles().map(f => {
      if (f.folder === id) f.folder = null;
      return f;
    });
    set(KEYS.FILES, files);
  }

  // ── Settings ──
  function getSettings() {
    return get(KEYS.SETTINGS, {
      theme: 'dark',
      fontSize: 14,
      autoSave: true
    });
  }

  function updateSettings(updates) {
    const settings = { ...getSettings(), ...updates };
    set(KEYS.SETTINGS, settings);
    return settings;
  }

  // ── Utils ──
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getWordCount(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  function getCharCount(text) {
    return text.length;
  }

  function exportAsMarkdown(file) {
    return file.content;
  }

  // ── Open Tabs ──
  function getOpenTabs() {
    return get('mdview_open_tabs', []);
  }

  function setOpenTabs(tabs) {
    set('mdview_open_tabs', tabs);
  }

  function addTab(fileId) {
    const tabs = getOpenTabs();
    if (!tabs.includes(fileId)) {
      tabs.push(fileId);
      setOpenTabs(tabs);
    }
  }

  function closeTab(fileId) {
    const tabs = getOpenTabs().filter(id => id !== fileId);
    setOpenTabs(tabs);
    // If closing the active tab, clear it
    if (getActiveTab() === fileId) {
      setActiveTab(null);
    }
  }

  function getActiveTab() {
    return localStorage.getItem('mdview_active_tab') || null;
  }

  function setActiveTab(id) {
    if (id) {
      localStorage.setItem('mdview_active_tab', id);
    } else {
      localStorage.removeItem('mdview_active_tab');
    }
  }

  // ── Read time estimation ──
  function getReadTime(text) {
    const words = getWordCount(text);
    const mins = Math.ceil(words / 200);
    return mins < 1 ? '< 1 min' : mins + ' min';
  }

  return {
    getProfile, saveProfile, hasProfile,
    getFiles, getFile, saveFile, deleteFile, searchFiles,
    getFilesByFolder, getRecentFiles,
    getFolders, addFolder, deleteFolder,
    getSettings, updateSettings,
    getOpenTabs, setOpenTabs, addTab, closeTab,
    getActiveTab, setActiveTab,
    generateId, formatDate, getWordCount, getCharCount, getReadTime,
    exportAsMarkdown
  };
})();
