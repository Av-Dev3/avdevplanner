// === MODERN NOTES APP ===
// Professional note-taking application with notebooks, tags, and advanced features

document.addEventListener("DOMContentLoaded", () => {
  // === STATE MANAGEMENT ===
  let state = {
    notes: [],
    notebooks: [],
    tags: [],
    currentNote: null,
    currentNotebook: null,
    currentView: 'all',
    searchQuery: '',
    sortBy: 'modified',
    filterBy: 'all',
    isFullscreen: false,
    isPreview: false,
    autoSaveTimeout: null
  };

  // === DOM ELEMENTS ===
  const elements = {
    // Sidebar
    notebooksList: document.getElementById('notebooks-list'),
    notebooksCount: document.getElementById('notebooks-count'),
    tagsCloud: document.getElementById('tags-cloud'),
    globalSearch: document.getElementById('global-search'),
    searchFilters: document.getElementById('search-filters'),
    sortBy: document.getElementById('sort-by'),
    
    // Notes Panel
    currentViewTitle: document.getElementById('current-view-title'),
    notesCount: document.getElementById('notes-count'),
    notesListContainer: document.getElementById('notes-list-container'),
    viewBtns: document.querySelectorAll('.view-btn'),
    
    // Editor
    welcomeState: document.getElementById('welcome-state'),
    noteEditor: document.getElementById('note-editor'),
    noteTitle: document.getElementById('note-title'),
    notePath: document.getElementById('note-path'),
    editorDropdown: document.getElementById('editor-dropdown'),
    
    // Toolbar
    fontFamily: document.getElementById('font-family'),
    fontSize: document.getElementById('font-size'),
    headingLevel: document.getElementById('heading-level'),
    toolbarBtns: document.querySelectorAll('.toolbar-btn'),
    
    // Tags
    tagsInput: document.getElementById('tags-input'),
    currentTags: document.getElementById('current-tags'),
    
    // Content
    noteContent: document.getElementById('note-content'),
    
    // Status Bar
    lastSaved: document.getElementById('last-saved'),
    wordCount: document.getElementById('word-count'),
    charCount: document.getElementById('char-count'),
    createdDate: document.getElementById('created-date'),
    modifiedDate: document.getElementById('modified-date')
  };

  // === INITIALIZATION ===
  async function init() {
    await loadData();
    setupEventListeners();
    setupToolbar();
    setupAutoSave();
    renderAll();
    
    // Show welcome state initially
    showWelcomeState();
  }

  // === DATA MANAGEMENT ===
  async function loadData() {
    try {
      // Load notes from backend
      const notesResponse = await fetch('/notes');
      if (notesResponse.ok) {
        state.notes = await notesResponse.json();
      }
      
      // Create default notebooks (stored in frontend state only for organization)
      state.notebooks = [
        { id: 'general', name: 'General', color: '#9b59b6', noteCount: 0 },
        { id: 'personal', name: 'Personal', color: '#e74c3c', noteCount: 0 },
        { id: 'work', name: 'Work', color: '#27ae60', noteCount: 0 }
      ];
      
      // Extract tags from notes
      state.tags = extractTags();
      
      updateCounts();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  function extractTags() {
    const tagSet = new Set();
    state.notes.forEach(note => {
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).map(tag => ({
      name: tag,
      count: state.notes.filter(note => note.tags && note.tags.includes(tag)).length
    }));
  }

  function updateCounts() {
    // Update notebook counts
    state.notebooks.forEach(notebook => {
      notebook.noteCount = state.notes.filter(note => 
        note.notebook === notebook.id || (notebook.id === 'general' && !note.notebook)
      ).length;
    });
    
    // Update tag counts
    state.tags.forEach(tag => {
      tag.count = state.notes.filter(note => 
        note.tags && note.tags.includes(tag.name)
      ).length;
    });
  }

  // === EVENT LISTENERS ===
  function setupEventListeners() {
    // Search
    elements.globalSearch.addEventListener('input', handleSearch);
    elements.sortBy.addEventListener('change', handleSortChange);
    
    // Filter tags
    document.querySelectorAll('.filter-tag').forEach(btn => {
      btn.addEventListener('click', handleFilterChange);
    });
    
    // View toggle
    elements.viewBtns.forEach(btn => {
      btn.addEventListener('click', handleViewChange);
    });
    
    // Note title
    if (elements.noteTitle) {
      elements.noteTitle.addEventListener('input', handleTitleChange);
    }
    
    // Tags input
    if (elements.tagsInput) {
      elements.tagsInput.addEventListener('keydown', handleTagsInput);
    }
    
    // Content editor
    if (elements.noteContent) {
      elements.noteContent.addEventListener('input', handleContentChange);
      elements.noteContent.addEventListener('paste', handlePaste);
    }
    
    // Font controls
    if (elements.fontFamily) elements.fontFamily.addEventListener('change', handleFontFamilyChange);
    if (elements.fontSize) elements.fontSize.addEventListener('change', handleFontSizeChange);
    if (elements.headingLevel) elements.headingLevel.addEventListener('change', handleHeadingChange);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save on page unload
    window.addEventListener('beforeunload', saveCurrentNote);
  }

  function setupToolbar() {
    elements.toolbarBtns.forEach(btn => {
      const command = btn.getAttribute('data-command');
      if (command) {
        btn.addEventListener('click', () => executeCommand(command));
      }
    });
  }

  function setupAutoSave() {
    // Auto-save every 30 seconds
    setInterval(() => {
      if (state.currentNote) {
        saveCurrentNote();
      }
    }, 30000);
  }

  // === EVENT HANDLERS ===
  function handleSearch(e) {
    state.searchQuery = e.target.value.toLowerCase();
    filterAndRenderNotes();
  }

  function handleSortChange(e) {
    state.sortBy = e.target.value;
    filterAndRenderNotes();
  }

  function handleFilterChange(e) {
    document.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    state.filterBy = e.target.getAttribute('data-filter');
    filterAndRenderNotes();
  }

  function handleViewChange(e) {
    elements.viewBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    const view = e.target.getAttribute('data-view');
    toggleNotesView(view);
  }

  function handleTitleChange(e) {
    if (state.currentNote) {
      state.currentNote.title = e.target.value || 'Untitled Note';
      updateNotePath();
      scheduleAutoSave();
    }
  }

  function handleTagsInput(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = e.target.value.trim();
      if (tag && state.currentNote) {
        addTag(tag);
        e.target.value = '';
      }
    } else if (e.key === 'Backspace' && e.target.value === '') {
      removeLastTag();
    }
  }

  function handleContentChange(e) {
    if (state.currentNote) {
      state.currentNote.content = e.target.innerHTML;
      state.currentNote.modified_at = new Date().toISOString();
      updateWordCount();
      updateStatusBar();
      scheduleAutoSave();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }

  function handleFontFamilyChange(e) {
    const fontFamily = e.target.value;
    applyFontFamily(fontFamily);
  }

  function handleFontSizeChange(e) {
    const fontSize = e.target.value + 'px';
    document.execCommand('fontSize', false, '7');
    const fontElements = document.querySelectorAll('font[size="7"]');
    fontElements.forEach(el => {
      el.removeAttribute('size');
      el.style.fontSize = fontSize;
    });
  }

  function handleHeadingChange(e) {
    const heading = e.target.value;
    if (heading) {
      document.execCommand('formatBlock', false, heading);
    } else {
      document.execCommand('formatBlock', false, 'div');
    }
  }

  function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'k':
          e.preventDefault();
          insertLink();
          break;
        case 's':
          e.preventDefault();
          saveCurrentNote();
          break;
        case 'n':
          e.preventDefault();
          createNewNote();
          break;
      }
    }
    
    if (e.key === 'F11') {
      e.preventDefault();
      toggleFullscreen();
    }
  }

  // === RENDERING ===
  function renderAll() {
    renderNotebooks();
    renderTags();
    filterAndRenderNotes();
  }

  function renderNotebooks() {
    if (!elements.notebooksList) return;
    
    elements.notebooksList.innerHTML = state.notebooks.map(notebook => `
      <div class="notebook-item ${state.currentNotebook === notebook.id ? 'active' : ''}" 
           onclick="selectNotebook('${notebook.id}')">
        <div class="notebook-icon" style="background: ${notebook.color}"></div>
        <div class="notebook-info">
          <div class="notebook-name">${notebook.name}</div>
          <div class="notebook-count">${notebook.noteCount} notes</div>
        </div>
      </div>
    `).join('');
    
    if (elements.notebooksCount) {
      elements.notebooksCount.textContent = state.notebooks.length;
    }
  }

  function renderTags() {
    if (!elements.tagsCloud) return;
    
    elements.tagsCloud.innerHTML = state.tags.map(tag => `
      <span class="tag-item" onclick="filterByTag('${tag.name}')" title="${tag.count} notes">
        ${tag.name}
      </span>
    `).join('');
  }

  function filterAndRenderNotes() {
    let filteredNotes = [...state.notes];
    
    // Apply search filter
    if (state.searchQuery) {
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(state.searchQuery) ||
        note.content.toLowerCase().includes(state.searchQuery) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(state.searchQuery)))
      );
    }
    
    // Apply category filter
    switch (state.filterBy) {
      case 'pinned':
        filteredNotes = filteredNotes.filter(note => note.pinned);
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredNotes = filteredNotes.filter(note => 
          new Date(note.modified_at || note.created_at) > weekAgo
        );
        break;
      case 'archived':
        filteredNotes = filteredNotes.filter(note => note.archived);
        break;
    }
    
    // Apply notebook filter
    if (state.currentNotebook) {
      filteredNotes = filteredNotes.filter(note => 
        note.notebook === state.currentNotebook ||
        (state.currentNotebook === 'general' && !note.notebook)
      );
    }
    
    // Sort notes
    filteredNotes.sort((a, b) => {
      switch (state.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'size':
          return (b.content?.length || 0) - (a.content?.length || 0);
        case 'modified':
        default:
          return new Date(b.modified_at || b.created_at) - new Date(a.modified_at || a.created_at);
      }
    });
    
    renderNotesList(filteredNotes);
  }

  function renderNotesList(notes) {
    if (!elements.notesListContainer) return;
    
    if (notes.length === 0) {
      elements.notesListContainer.innerHTML = `
        <div class="empty-state">
          <p>No notes found</p>
        </div>
      `;
      if (elements.notesCount) elements.notesCount.textContent = '0 notes';
      return;
    }
    
    const isGridView = document.querySelector('.view-btn[data-view="grid"]')?.classList.contains('active');
    
    elements.notesListContainer.innerHTML = notes.map(note => {
      const preview = stripHtml(note.content || '').substring(0, 150);
      const modifiedDate = formatDate(note.modified_at || note.created_at);
      
      return `
        <div class="note-list-item ${state.currentNote?.id === note.id ? 'active' : ''} ${isGridView ? 'grid-view' : 'list-view'}" 
             onclick="selectNote(${note.id})">
          <div class="note-header">
            <h4 class="note-title">${note.title || 'Untitled Note'}</h4>
            <div class="note-actions">
              ${note.pinned ? '<span class="pin-indicator">📌</span>' : ''}
              <button class="note-menu-btn" onclick="event.stopPropagation(); toggleNoteMenu(${note.id})">⋯</button>
            </div>
          </div>
          <p class="note-preview">${preview}${preview.length >= 150 ? '...' : ''}</p>
          <div class="note-meta">
            <span class="note-date">${modifiedDate}</span>
            ${note.tags && note.tags.length > 0 ? 
              `<div class="note-tags">${note.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : 
              ''
            }
          </div>
        </div>
      `;
    }).join('');
    
    if (elements.notesCount) {
      elements.notesCount.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
    }
  }

  // === NOTE MANAGEMENT ===
  async function createNewNote() {
    const note = {
      title: 'Untitled Note',
      content: '',
      notebook: state.currentNotebook || 'general',
      tags: [],
      pinned: false,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString()
    };
    
    try {
      const response = await fetch('/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note)
      });
      
      if (response.ok) {
        const savedNote = await response.json();
        // Add the ID from backend response
        note.id = savedNote.id || savedNote.note_id;
        state.notes.unshift(note);
        selectNote(note.id);
        updateCounts();
        renderAll();
        
        // Focus on title input
        setTimeout(() => {
          if (elements.noteTitle) {
            elements.noteTitle.focus();
            elements.noteTitle.select();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }

  function selectNote(noteId) {
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Save current note before switching
    if (state.currentNote) {
      saveCurrentNote();
    }
    
    state.currentNote = note;
    showNoteEditor();
    loadNoteIntoEditor(note);
    updateActiveNoteInList();
  }

  function loadNoteIntoEditor(note) {
    if (elements.noteTitle) {
      elements.noteTitle.value = note.title || '';
    }
    
    if (elements.noteContent) {
      elements.noteContent.innerHTML = note.content || '';
    }
    
    updateNotePath();
    loadNoteTags(note);
    updateStatusBar();
    updateWordCount();
  }

  function updateNotePath() {
    if (!elements.notePath || !state.currentNote) return;
    
    const notebook = state.notebooks.find(nb => nb.id === state.currentNote.notebook) || 
                    state.notebooks.find(nb => nb.id === 'general');
    const noteName = state.currentNote.title || 'Untitled Note';
    
    elements.notePath.innerHTML = `
      <span class="notebook-name">${notebook.name}</span> / <span class="note-name">${noteName}</span>
    `;
  }

  function loadNoteTags(note) {
    if (!elements.currentTags) return;
    
    elements.currentTags.innerHTML = (note.tags || []).map(tag => `
      <span class="current-tag">
        ${tag}
        <button onclick="removeTag('${tag}')" class="remove-tag">×</button>
      </span>
    `).join('');
  }

  async function saveCurrentNote() {
    if (!state.currentNote) return;
    
    await saveNote(state.currentNote);
    updateStatusBar();
    if (elements.lastSaved) {
      elements.lastSaved.textContent = 'Saved';
    }
  }

  async function saveNote(note) {
    if (!note.id) return; // Don't save notes without ID
    
    try {
      const response = await fetch(`/notes/${note.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          pinned: note.pinned || false,
          tags: note.tags || [],
          notebook: note.notebook || '',
          modified_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        updateCounts();
        // Update the note in local state
        const noteIndex = state.notes.findIndex(n => n.id === note.id);
        if (noteIndex !== -1) {
          state.notes[noteIndex] = { ...note };
        }
        renderAll();
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  }

  function scheduleAutoSave() {
    clearTimeout(state.autoSaveTimeout);
    state.autoSaveTimeout = setTimeout(() => {
      saveCurrentNote();
    }, 2000);
    
    if (elements.lastSaved) {
      elements.lastSaved.textContent = 'Saving...';
    }
  }

  // === UI MANAGEMENT ===
  function showWelcomeState() {
    if (elements.welcomeState) elements.welcomeState.classList.remove('hidden');
    if (elements.noteEditor) elements.noteEditor.classList.add('hidden');
  }

  function showNoteEditor() {
    if (elements.welcomeState) elements.welcomeState.classList.add('hidden');
    if (elements.noteEditor) elements.noteEditor.classList.remove('hidden');
  }

  function updateActiveNoteInList() {
    document.querySelectorAll('.note-list-item').forEach(item => {
      item.classList.remove('active');
    });
    
    if (state.currentNote) {
      const activeItem = document.querySelector(`[onclick="selectNote(${state.currentNote.id})"]`);
      if (activeItem) {
        activeItem.classList.add('active');
      }
    }
  }

  function updateWordCount() {
    if (!elements.wordCount || !elements.charCount || !state.currentNote) return;
    
    const text = stripHtml(state.currentNote.content || '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    elements.wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    elements.charCount.textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
  }

  function updateStatusBar() {
    if (!state.currentNote) return;
    
    if (elements.createdDate) {
      elements.createdDate.textContent = `Created ${formatDate(state.currentNote.created_at)}`;
    }
    
    if (elements.modifiedDate) {
      elements.modifiedDate.textContent = `Modified ${formatDate(state.currentNote.modified_at)}`;
    }
  }

  // === TOOLBAR FUNCTIONS ===
  function executeCommand(command) {
    document.execCommand(command, false, null);
    elements.noteContent.focus();
    
    // Update button states
    updateToolbarStates();
    
    // Trigger content change
    if (state.currentNote) {
      handleContentChange({ target: elements.noteContent });
    }
  }

  function updateToolbarStates() {
    elements.toolbarBtns.forEach(btn => {
      const command = btn.getAttribute('data-command');
      if (command && document.queryCommandState(command)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function applyFontFamily(fontFamily) {
    let fontFamilyValue;
    switch (fontFamily) {
      case 'serif':
        fontFamilyValue = 'Georgia, serif';
        break;
      case 'mono':
        fontFamilyValue = 'Monaco, Consolas, monospace';
        break;
      default:
        fontFamilyValue = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    }
    
    if (elements.noteContent) {
      elements.noteContent.style.fontFamily = fontFamilyValue;
    }
  }

  // === TAG MANAGEMENT ===
  function addTag(tagName) {
    if (!state.currentNote || !tagName) return;
    
    if (!state.currentNote.tags) {
      state.currentNote.tags = [];
    }
    
    if (!state.currentNote.tags.includes(tagName)) {
      state.currentNote.tags.push(tagName);
      loadNoteTags(state.currentNote);
      scheduleAutoSave();
      
      // Update tags state
      state.tags = extractTags();
      renderTags();
    }
  }

  function removeTag(tagName) {
    if (!state.currentNote || !state.currentNote.tags) return;
    
    state.currentNote.tags = state.currentNote.tags.filter(tag => tag !== tagName);
    loadNoteTags(state.currentNote);
    scheduleAutoSave();
    
    // Update tags state
    state.tags = extractTags();
    renderTags();
  }

  function removeLastTag() {
    if (!state.currentNote || !state.currentNote.tags || state.currentNote.tags.length === 0) return;
    
    state.currentNote.tags.pop();
    loadNoteTags(state.currentNote);
    scheduleAutoSave();
  }

  // === UTILITY FUNCTIONS ===
  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // === GLOBAL FUNCTIONS (called from HTML) ===
  window.createNewNote = createNewNote;
  window.selectNote = selectNote;
  window.togglePin = () => {
    if (state.currentNote) {
      state.currentNote.pinned = !state.currentNote.pinned;
      scheduleAutoSave();
      filterAndRenderNotes();
    }
  };
  
  window.deleteNote = async () => {
    if (!state.currentNote || !confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`/notes/${state.currentNote.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        state.notes = state.notes.filter(note => note.id !== state.currentNote.id);
        state.currentNote = null;
        showWelcomeState();
        updateCounts();
        renderAll();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('Failed to delete note. Please try again.');
    }
  };

  window.toggleSearchFilters = () => {
    if (elements.searchFilters) {
      elements.searchFilters.classList.toggle('hidden');
    }
  };

  window.toggleEditorMenu = () => {
    if (elements.editorDropdown) {
      elements.editorDropdown.classList.toggle('hidden');
    }
  };

  window.insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  window.insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      document.execCommand('insertImage', false, url);
    }
  };

  window.toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  window.togglePreview = () => {
    // Preview functionality would be implemented here
    console.log('Preview mode toggle');
  };

  // Additional missing functions
  window.selectNotebook = (notebookId) => {
    state.currentNotebook = notebookId;
    filterAndRenderNotes();
    renderNotebooks();
  };

  window.filterByTag = (tagName) => {
    elements.globalSearch.value = tagName;
    state.searchQuery = tagName.toLowerCase();
    filterAndRenderNotes();
  };

  window.createNewNotebook = () => {
    const name = prompt('Enter notebook name:');
    if (name && name.trim()) {
      const colors = ['#9b59b6', '#e74c3c', '#27ae60', '#f39c12', '#3498db'];
      const newNotebook = {
        id: Date.now().toString(),
        name: name.trim(),
        color: colors[Math.floor(Math.random() * colors.length)],
        noteCount: 0
      };
      state.notebooks.push(newNotebook);
      renderNotebooks();
    }
  };

  window.toggleSidebarView = () => {
    // Toggle between list and compact view
    console.log('Toggle sidebar view');
  };

  window.selectAllNotes = () => {
    console.log('Select all notes');
  };

  window.exportSelected = () => {
    console.log('Export selected notes');
  };



  window.manageTagsModal = () => {
    showTagsManager();
  };

  function showTagsManager() {
    const modal = document.getElementById('tagsModal');
    const tagsList = document.getElementById('tags-manager-list');
    const totalTagsCount = document.getElementById('total-tags-count');
    const taggedNotesCount = document.getElementById('tagged-notes-count');
    
    if (!modal || !tagsList) return;
    
    // Update stats
    const taggedNotes = state.notes.filter(note => note.tags && note.tags.length > 0);
    totalTagsCount.textContent = state.tags.length;
    taggedNotesCount.textContent = taggedNotes.length;
    
    // Render tags list
    if (state.tags.length === 0) {
      tagsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No tags found. Create some notes with tags to manage them here.</p>';
    } else {
      tagsList.innerHTML = state.tags.map(tag => `
        <div class="tag-manager-item">
          <div class="tag-info">
            <span class="tag-name">${tag.name}</span>
            <span class="tag-count">${tag.count} note${tag.count !== 1 ? 's' : ''}</span>
          </div>
          <div class="tag-actions">
            <button class="tag-action-btn" onclick="renameTag('${tag.name}')">Rename</button>
            <button class="tag-action-btn delete" onclick="deleteTag('${tag.name}')">Delete</button>
          </div>
        </div>
      `).join('');
    }
    
    modal.classList.remove('hidden');
  }

  window.renameTag = async (oldName) => {
    const newName = prompt(`Rename tag "${oldName}" to:`, oldName);
    if (!newName || newName.trim() === '' || newName === oldName) return;
    
    const trimmedName = newName.trim();
    
    // Check if new name already exists
    if (state.tags.some(tag => tag.name === trimmedName)) {
      alert('A tag with that name already exists!');
      return;
    }
    
    // Update all notes with this tag
    let updatedCount = 0;
    for (const note of state.notes) {
      if (note.tags && note.tags.includes(oldName)) {
        note.tags = note.tags.map(tag => tag === oldName ? trimmedName : tag);
        await saveNote(note);
        updatedCount++;
      }
    }
    
    // Refresh tags and UI
    state.tags = extractTags();
    renderTags();
    showTagsManager(); // Refresh the modal
    
    alert(`Renamed "${oldName}" to "${trimmedName}" in ${updatedCount} note${updatedCount !== 1 ? 's' : ''}.`);
  };

  window.deleteTag = async (tagName) => {
    const tagInfo = state.tags.find(tag => tag.name === tagName);
    if (!tagInfo) return;
    
    if (!confirm(`Delete tag "${tagName}"? This will remove it from ${tagInfo.count} note${tagInfo.count !== 1 ? 's' : ''}.`)) return;
    
    // Remove tag from all notes
    let updatedCount = 0;
    for (const note of state.notes) {
      if (note.tags && note.tags.includes(tagName)) {
        note.tags = note.tags.filter(tag => tag !== tagName);
        await saveNote(note);
        updatedCount++;
      }
    }
    
    // Refresh tags and UI
    state.tags = extractTags();
    renderTags();
    showTagsManager(); // Refresh the modal
    filterAndRenderNotes(); // Update notes list
    
    alert(`Deleted tag "${tagName}" from ${updatedCount} note${updatedCount !== 1 ? 's' : ''}.`);
  };

  window.cleanupUnusedTags = () => {
    const unusedTags = state.tags.filter(tag => tag.count === 0);
    
    if (unusedTags.length === 0) {
      alert('No unused tags found!');
      return;
    }
    
    if (!confirm(`Remove ${unusedTags.length} unused tag${unusedTags.length !== 1 ? 's' : ''}?`)) return;
    
    // Since tags are extracted from notes, unused tags are already not included
    // This is more of a UI refresh
    state.tags = extractTags();
    renderTags();
    showTagsManager();
    
    alert(`Cleaned up ${unusedTags.length} unused tag${unusedTags.length !== 1 ? 's' : ''}!`);
  };

  window.shareNote = () => {
    if (state.currentNote) {
      console.log('Share note:', state.currentNote.title);
    }
  };

  window.showNoteInfo = () => {
    if (state.currentNote) {
      alert(`Note: ${state.currentNote.title}\nCreated: ${formatDate(state.currentNote.created_at)}\nModified: ${formatDate(state.currentNote.modified_at)}\nWords: ${stripHtml(state.currentNote.content || '').trim().split(/\s+/).length}`);
    }
  };

  window.duplicateNote = () => {
    if (state.currentNote) {
      const duplicate = {
        ...state.currentNote,
        title: state.currentNote.title + ' (Copy)',
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString()
      };
      delete duplicate.id;
      createNewNote();
      // Set the duplicated content after creation
      setTimeout(() => {
        if (elements.noteTitle) elements.noteTitle.value = duplicate.title;
        if (elements.noteContent) elements.noteContent.innerHTML = duplicate.content;
        if (state.currentNote) {
          state.currentNote.title = duplicate.title;
          state.currentNote.content = duplicate.content;
          state.currentNote.tags = [...duplicate.tags];
        }
      }, 200);
    }
  };

  window.moveToNotebook = () => {
    if (state.currentNote) {
      const notebookNames = state.notebooks.map(nb => nb.name);
      const choice = prompt(`Move to notebook:\n${notebookNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}\n\nEnter number:`);
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < state.notebooks.length) {
        state.currentNote.notebook = state.notebooks[index].id;
        updateNotePath();
        saveCurrentNote();
      }
    }
  };

  window.exportNote = () => {
    if (state.currentNote) {
      const content = `# ${state.currentNote.title}\n\n${stripHtml(state.currentNote.content || '')}`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${state.currentNote.title || 'note'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  window.archiveNote = () => {
    if (state.currentNote) {
      state.currentNote.archived = !state.currentNote.archived;
      saveCurrentNote();
      filterAndRenderNotes();
    }
  };

  window.insertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      let table = '<table border="1"><tbody>';
      for (let i = 0; i < parseInt(rows); i++) {
        table += '<tr>';
        for (let j = 0; j < parseInt(cols); j++) {
          table += '<td>&nbsp;</td>';
        }
        table += '</tr>';
      }
      table += '</tbody></table>';
      document.execCommand('insertHTML', false, table);
    }
  };

  window.insertCodeBlock = () => {
    const code = prompt('Enter code:');
    if (code) {
      document.execCommand('insertHTML', false, `<pre><code>${code}</code></pre>`);
    }
  };

  window.insertCheckList = () => {
    document.execCommand('insertHTML', false, '<input type="checkbox"> ');
  };

  // === INITIALIZE APP ===
  init();
});