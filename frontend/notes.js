// === NOTES MANAGEMENT ===

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const notesContainer = document.getElementById("notes-by-week-container");
  const noteForm = document.getElementById("note-form");
  const titleInput = document.getElementById("note-title");
  const contentInput = document.getElementById("note-content");
  const tagsInput = document.getElementById("note-tags");
  const collectionSelect = document.getElementById("note-collection");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  let allNotes = [];
  let filteredNotes = [];
  let currentTab = 'notes';

  // === TAB NAVIGATION ===
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  function switchTab(tabName) {
    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update active tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');

    currentTab = tabName;
    
    // Reload content based on current tab
    if (tabName === 'notes') {
      renderNotes();
    } else if (tabName === 'tags') {
      renderTags();
    } else if (tabName === 'collections') {
      renderCollections();
    }
  }

  // === SEARCH FUNCTIONALITY ===
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      performSearch(searchTerm);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      filteredNotes = [...allNotes];
      renderNotes();
    });
  }

  function performSearch(searchTerm) {
    if (!searchTerm.trim()) {
      filteredNotes = [...allNotes];
      clearSearchBtn.classList.add('hidden');
    } else {
      filteredNotes = allNotes.filter(note => {
        const titleMatch = note.title?.toLowerCase().includes(searchTerm);
        const contentMatch = note.content?.toLowerCase().includes(searchTerm);
        const tagsMatch = note.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
        const collectionMatch = note.notebook?.toLowerCase().includes(searchTerm);
        
        return titleMatch || contentMatch || tagsMatch || collectionMatch;
      });
      clearSearchBtn.classList.remove('hidden');
    }
    
    renderNotes();
  }

  // === FORM SUBMISSION ===
  if (noteForm) {
    noteForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const newNote = {
        title: titleInput.value.trim(),
        content: contentInput.value.trim(),
        tags: tagsInput.value.trim() ? tagsInput.value.split(',').map(tag => tag.trim()) : [],
        notebook: collectionSelect.value || null,
        date: new Date().toISOString().split('T')[0],
        completed: false,
      };

      try {
        const res = await fetch("https://avdevplanner.onrender.com/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newNote),
        });

        if (res.ok) {
          noteForm.reset();
          document.getElementById("notePopup").classList.add("hidden");
          await loadNotes();
          showSuccessMessage("Note created successfully!");
        } else {
          console.error("Failed to save note");
          showErrorMessage("Failed to save note");
        }
      } catch (error) {
        console.error("Error saving note:", error);
        showErrorMessage("Error saving note");
      }
    });
  }

  // === LOAD NOTES ===
  async function loadNotes() {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes");
      allNotes = await res.json();
      
      // Filter out notes with undefined IDs and log them
      const validNotes = [];
      const invalidNotes = [];
      
      allNotes.forEach(note => {
        const noteId = note.id || note._id;
        if (noteId) {
          validNotes.push(note);
        } else {
          invalidNotes.push(note);
          console.warn("Found note with no ID:", note);
        }
      });
      
      if (invalidNotes.length > 0) {
        console.warn(`${invalidNotes.length} notes with no ID found and will be skipped`);
        showErrorMessage(`${invalidNotes.length} notes with invalid IDs found and skipped`);
      }
      
      allNotes = validNotes;
      filteredNotes = [...allNotes];
      
      // Update collection select options
      updateCollectionSelect();
      
      // Always render collections data (needed for all tabs)
      renderCollections();
      
      // Render based on current tab
      if (currentTab === 'notes') {
        renderNotes();
      } else if (currentTab === 'tags') {
        renderTags();
      } else if (currentTab === 'collections') {
        renderCollections();
      }
    } catch (err) {
      console.error("Error loading notes:", err);
      showErrorMessage("Error loading notes");
    }
  }

  // === RENDER NOTES ===
  function renderNotes() {
    if (!notesContainer) return;
    
    notesContainer.innerHTML = "";

    if (!filteredNotes.length) {
      notesContainer.innerHTML = `
        <div class="notes-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <h3>No Notes Found</h3>
          <p>${searchInput?.value ? 'Try adjusting your search terms.' : 'Start by creating your first note.'}</p>
        </div>
      `;
      return;
    }

    const grouped = groupNotesByDate(filteredNotes);
    
    Object.keys(grouped)
      .sort()
      .forEach((date) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "notes-week-group";

        const groupTitle = document.createElement("h3");
        groupTitle.textContent = formatPrettyDate(date);
        groupDiv.appendChild(groupTitle);

        const grid = document.createElement("div");
        grid.className = "notes-row";

        grouped[date].forEach((note) => {
          const card = createNoteCard(note);
          grid.appendChild(card);
        });

        groupDiv.appendChild(grid);
        notesContainer.appendChild(groupDiv);
      });
  }

  // === CREATE NOTE CARD ===
  function createNoteCard(note) {
    const card = document.createElement("div");
    card.className = "note-card";

    const tags = note.tags || [];
    const tagsHtml = tags.length > 0 
      ? `<div class="note-tags">${tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')}</div>`
      : '';

    card.innerHTML = `
      <h4>${note.title || "(No Title)"}</h4>
      <div class="note-content">${note.content || ""}</div>
      <div class="note-meta">
        <div class="note-date">${formatPrettyDate(note.date || note.created_at)}</div>
        ${note.notebook ? `<div class="note-collection">📚 ${note.notebook}</div>` : ''}
      </div>
      ${tagsHtml}
      <div class="note-actions">
        <button class="note-action-btn edit-btn" data-note-id="${note.id || note._id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit
        </button>
        <button class="note-action-btn delete-btn" data-note-id="${note.id || note._id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
          </svg>
          Delete
        </button>
      </div>
    `;

    // Add event listeners
    const editBtn = card.querySelector('.edit-btn');
    const deleteBtn = card.querySelector('.delete-btn');

    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editNote(note);
    });

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('Delete button clicked for note:', note);
      console.log('Note ID:', note.id || note._id);
      deleteNote(note);
    });

    // Click to preview
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on action buttons
      if (e.target.closest('.note-actions')) {
        return;
      }
      console.log('Note card clicked:', note);
      console.log('Calling showNotePreview...');
      showNotePreview(note);
    });

    return card;
  }

  // === NOTE ACTIONS ===
  function showNotePreview(note) {
    console.log('showNotePreview called with:', note);
    
    const titleEl = document.getElementById('popup-note-title');
    const contentEl = document.getElementById('popup-note-content');
    const tagsEl = document.getElementById('popup-note-tags');
    const popup = document.getElementById('note-preview-popup');

    console.log('Found elements:', { titleEl, contentEl, tagsEl, popup });

    if (titleEl) titleEl.textContent = note.title || "(No Title)";
    if (contentEl) contentEl.textContent = note.content || "";
    
    const tags = note.tags || [];
    if (tagsEl) {
      tagsEl.innerHTML = tags.length > 0 
        ? tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')
        : '<span style="color: #6c757d; font-style: italic;">No tags</span>';
    }

    // Add note date if available
    const dateEl = document.getElementById('popup-note-date');
    if (dateEl) {
      const date = note.date || note.created_at;
      dateEl.textContent = date ? formatPrettyDate(date) : '';
    }

    if (popup) {
      popup.classList.remove('hidden');
      console.log('Popup should now be visible');
    } else {
      console.error('Note preview popup not found!');
    }
  }

  function editNote(note) {
    // For now, just show a prompt - you can enhance this later
    const newTitle = prompt("Edit note title:", note.title);
    if (newTitle === null) return;

    const newContent = prompt("Edit note content:", note.content);
    if (newContent === null) return;

    const newTags = prompt("Edit tags (comma-separated):", note.tags?.join(', ') || '');
    if (newTags === null) return;

    updateNote(note, {
      title: newTitle.trim(),
      content: newContent.trim(),
      tags: newTags.trim() ? newTags.split(',').map(tag => tag.trim()) : []
    });
  }

  async function updateNote(note, updates) {
    try {
      const res = await fetch(`https://avdevplanner.onrender.com/notes/${note.id || note._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...note, ...updates }),
      });

      if (res.ok) {
        await loadNotes();
        showSuccessMessage("Note updated successfully!");
      } else {
        console.error("Failed to update note");
        showErrorMessage("Failed to update note");
      }
    } catch (error) {
      console.error("Error updating note:", error);
      showErrorMessage("Error updating note");
    }
  }

  async function deleteNote(note) {
    const confirmDelete = confirm("Are you sure you want to delete this note?");
    if (!confirmDelete) return;

    const noteId = note.id || note._id;
    console.log("Attempting to delete note:", note);
    console.log("Note ID:", noteId);
    
    if (!noteId) {
      console.error("Cannot delete note: No ID found", note);
      showErrorMessage("Cannot delete note: No ID found. This note may be corrupted.");
      return;
    }

    try {
      console.log("Sending DELETE request to:", `https://avdevplanner.onrender.com/notes/${noteId}`);
      const res = await fetch(`https://avdevplanner.onrender.com/notes/${noteId}`, {
        method: "DELETE"
      });

      console.log("Delete response:", res.status, res.statusText);

      if (res.ok) {
        await loadNotes();
        showSuccessMessage("Note deleted successfully!");
      } else {
        console.error("Failed to delete note:", res.status, res.statusText);
        showErrorMessage(`Failed to delete note: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      showErrorMessage("Error deleting note: " + error.message);
    }
  }

  // === UTILITY FUNCTIONS ===
  function formatPrettyDate(dateStr) {
    if (!dateStr) return "";
    
    try {
      // Handle different date formats
      let date;
      if (dateStr.includes('-')) {
        // Handle ISO date format (YYYY-MM-DD)
        const [year, month, day] = dateStr.split("-");
        if (year && month && day) {
          date = new Date(`${year}-${month}-${day}T00:00:00`);
        } else {
          date = new Date(dateStr);
        }
      } else {
        // Handle other date formats
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "No date";
      }
      
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return "No date";
    }
  }

  function groupNotesByDate(notes) {
    const groups = {};
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    notes.forEach((note) => {
      const rawDate = note.date || note.created_at;
      const parsed = new Date(rawDate);
      const vegasDateStr = formatter.format(parsed);
      if (!groups[vegasDateStr]) groups[vegasDateStr] = [];
      groups[vegasDateStr].push(note);
    });

    return groups;
  }

  function updateCollectionSelect() {
    if (!collectionSelect) return;
    
    const collections = new Set();
    allNotes.forEach(note => {
      if (note.notebook) collections.add(note.notebook);
    });

    // Clear existing options except the first one
    collectionSelect.innerHTML = '<option value="">No collection</option>';
    
    collections.forEach(collection => {
      const option = document.createElement('option');
      option.value = collection;
      option.textContent = collection;
      collectionSelect.appendChild(option);
    });
  }

  // === MESSAGE FUNCTIONS ===
  function showSuccessMessage(message) {
    const successDiv = document.createElement("div");
    successDiv.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  function showErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }

  // === RENDER TAGS ===
  function renderTags() {
    const tagList = document.getElementById("tag-list");
    if (!tagList) return;

    const tagMap = new Map();
    
    allNotes.forEach(note => {
      const tags = note.tags || [];
      tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag).push(note);
      });
    });

    if (tagMap.size === 0) {
      tagList.innerHTML = `
        <div class="tags-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <h3>No Tags Yet</h3>
          <p>Create notes with tags to see them here.</p>
        </div>
      `;
      return;
    }

    tagList.innerHTML = "";

    // Sort tags by number of notes (descending)
    const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1].length - a[1].length);

    sortedTags.forEach(([tag, notes]) => {
      const card = createTagCard(tag, notes);
      tagList.appendChild(card);
    });
  }

  function createTagCard(tag, notes) {
    const card = document.createElement("div");
    card.className = "tag-card";

    card.innerHTML = `
      <h3>#${tag}</h3>
      <div class="tag-count">${notes.length} note${notes.length !== 1 ? 's' : ''}</div>
    `;

    card.addEventListener('click', () => {
      showTaggedNotes(tag, notes);
    });

    return card;
  }

  function showTaggedNotes(tag, notes) {
    console.log('showTaggedNotes called with:', tag, notes);
    console.log('Creating tag popup...');
    
    // Create a temporary popup to show tagged notes
    const popup = document.createElement('div');
    popup.className = 'modal glass-modal';
    popup.style.cssText = 'display: flex; z-index: 9999; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); align-items: center; justify-content: center; padding: 1rem;';
    
    popup.innerHTML = `
      <div class="modal__content" style="z-index: 10000; width: 95%; max-width: 600px; max-height: 80vh; overflow: hidden; margin: 0 auto;">
        <button class="modal__close" onclick="this.closest('.modal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: white; font-size: 24px; cursor: pointer; z-index: 10001;">&times;</button>
        <h2 class="modal__title" style="margin-bottom: 20px; color: white; font-size: 1.5rem; font-weight: 600;">Notes tagged with #${tag}</h2>
        <div class="tagged-notes-list">
          ${notes.length === 0 ? '<p class="text-center text-gray-400">No notes found with this tag.</p>' : ''}
          ${notes.map(note => `
            <div class="collection-note-item" onclick="showNotePreviewFromTag(${JSON.stringify(note).replace(/"/g, '&quot;')}, this.closest('.modal'))" style="cursor: pointer;">
              <h4>${note.title || '(No Title)'}</h4>
              <p>${note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : ''}</p>
              <div class="note-meta">
                <small class="note-date">${formatPrettyDate(note.date || note.created_at)}</small>
                ${note.notebook ? `<small class="note-collection">📚 ${note.notebook}</small>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });

    // Close popup with Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // === RENDER COLLECTIONS ===
  function renderCollections() {
    const collectionList = document.getElementById("collection-list");
    if (!collectionList) {
      console.error("Collection list element not found!");
      return;
    }

    console.log("Rendering collections...");
    console.log("All notes:", allNotes);
    
    const collectionMap = new Map();
    const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");
    console.log("Saved empty collections:", saved);

    allNotes.forEach((note) => {
      const notebook = note.notebook?.trim();
      console.log("Note notebook:", notebook, "for note:", note.title);
      if (notebook) { // Only add if notebook exists and is not empty
        if (!collectionMap.has(notebook)) {
          collectionMap.set(notebook, []);
        }
        collectionMap.get(notebook).push(note);
      }
    });

    saved.forEach((name) => {
      if (name && !collectionMap.has(name)) {
        collectionMap.set(name, []);
      }
    });

    if (collectionMap.size === 0) {
      collectionList.innerHTML = `
        <div class="collections-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M3 3h18v18H3zM21 9H3M21 15H3M12 3v18"/>
          </svg>
          <h3>No Collections Yet</h3>
          <p>Create collections to organize your notes.</p>
        </div>
      `;
      return;
    }

    collectionList.innerHTML = "";

    console.log("Final collection map:", collectionMap);
    
    collectionMap.forEach((notes, notebook) => {
      if (notebook) { // Only create cards for valid notebook names
        console.log("Creating collection card for:", notebook, "with", notes.length, "notes");
        const card = createCollectionCard(notebook, notes);
        collectionList.appendChild(card);
      }
    });
  }

  function createCollectionCard(notebook, notes) {
    const card = document.createElement("div");
    card.className = "collection-card";

    const displayName = notebook || "Untitled";
    
    card.innerHTML = `
      <h3>${displayName}</h3>
      <div class="collection-count">${notes.length} note${notes.length !== 1 ? "s" : ""}</div>
    `;

    card.addEventListener('click', () => {
      showCollectionNotes(notebook, notes);
    });

    // Right-click delete popup
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (notebook) { // Only allow deletion of named collections
        showCollectionOptions(notebook, e.clientX, e.clientY);
      }
    });

    // Long-press for mobile delete popup
    let longPressTimer;
    card.addEventListener("touchstart", (e) => {
      longPressTimer = setTimeout(() => {
        if (notebook) { // Only allow deletion of named collections
          const touch = e.touches[0];
          showCollectionOptions(notebook, touch.clientX, touch.clientY);
        }
      }, 800);
    });

    card.addEventListener("touchend", () => clearTimeout(longPressTimer));

    return card;
  }

  function showCollectionNotes(notebook, notes) {
    const popup = document.getElementById('collection-notes-popup');
    const titleEl = document.getElementById('collection-popup-title');
    const listEl = document.getElementById('collection-notes-list');

    if (titleEl) titleEl.textContent = notebook || "Untitled";
    
    if (listEl) {
      if (notes.length === 0) {
        listEl.innerHTML = '<p class="text-center text-gray-400">No notes in this collection.</p>';
      } else {
        listEl.innerHTML = notes.map(note => `
          <div class="collection-note-item" onclick="showNotePreviewFromCollection(${JSON.stringify(note).replace(/"/g, '&quot;')})" style="cursor: pointer;">
            <h4>${note.title || '(No Title)'}</h4>
            <p>${note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : ''}</p>
            <div class="note-meta">
              <small class="note-date">${formatPrettyDate(note.date || note.created_at)}</small>
            </div>
          </div>
        `).join('');
      }
    }

    popup.classList.remove('hidden');
    popup.style.zIndex = '9999';
  }

  function showCollectionOptions(notebook, x, y) {
    const popup = document.createElement("div");
    popup.className = "fixed z-50 bg-[#1f1f1f] border border-neutral-700 text-white rounded shadow-lg p-2 text-sm";
    popup.style.top = `${y}px`;
    popup.style.left = `${x}px`;

    popup.innerHTML = `
      <button class="block w-full text-left px-2 py-1 hover:bg-[#b91c1c]" data-action="delete">Delete Collection</button>
    `;

    document.body.appendChild(popup);

    const closePopup = () => {
      popup.remove();
      document.removeEventListener("click", closePopup);
    };

    document.addEventListener("click", closePopup);

    popup.querySelector("[data-action='delete']").addEventListener("click", async () => {
      if (confirm(`Delete collection "${notebook}"? This will remove the collection from all notes.`)) {
        try {
          // Update all notes in this collection to remove the notebook field
          const notesToUpdate = allNotes.filter(note => note.notebook === notebook);
          let successCount = 0;
          let errorCount = 0;
          
          for (const note of notesToUpdate) {
            const noteId = note.id || note._id;
            if (!noteId) {
              console.warn("Skipping note with no ID:", note);
              errorCount++;
              continue;
            }
            
            try {
              const res = await fetch(`https://avdevplanner.onrender.com/notes/${noteId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...note, notebook: null }),
              });
              
              if (res.ok) {
                successCount++;
              } else {
                console.error(`Failed to update note ${noteId}:`, res.status, res.statusText);
                errorCount++;
              }
            } catch (error) {
              console.error(`Error updating note ${noteId}:`, error);
              errorCount++;
            }
          }
          
          // Remove from localStorage if it exists there
          const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");
          const updated = saved.filter((name) => name !== notebook);
          localStorage.setItem("emptyCollections", JSON.stringify(updated));
          
          // Reload notes and re-render
          await loadNotes();
          
          if (errorCount > 0) {
            showSuccessMessage(`Collection deleted! ${successCount} notes updated, ${errorCount} failed.`);
          } else {
            showSuccessMessage("Collection deleted successfully!");
          }
        } catch (error) {
          console.error("Error deleting collection:", error);
          showErrorMessage("Error deleting collection");
        }
      }
      closePopup();
    });
  }

  // === GLOBAL FUNCTIONS ===
  window.formatPrettyDate = formatPrettyDate;
  
  window.showNotePreview = function(note) {
    const titleEl = document.getElementById('popup-note-title');
    const contentEl = document.getElementById('popup-note-content');
    const tagsEl = document.getElementById('popup-note-tags');

    if (titleEl) titleEl.textContent = note.title || "(No Title)";
    if (contentEl) contentEl.textContent = note.content || "";
    
    const tags = note.tags || [];
    if (tagsEl) {
      tagsEl.innerHTML = tags.length > 0 
        ? tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')
        : '<span style="color: #6c757d; font-style: italic;">No tags</span>';
    }

    // Add note date if available
    const dateEl = document.getElementById('popup-note-date');
    if (dateEl) {
      const date = note.date || note.created_at;
      dateEl.textContent = date ? formatPrettyDate(date) : '';
    }

    const popup = document.getElementById('note-preview-popup');
    if (popup) {
      popup.classList.remove('hidden');
      popup.style.zIndex = '10001';
      console.log('Note preview popup opened');
    } else {
      console.error('Note preview popup not found!');
    }
  };

  window.showNotePreviewFromTag = function(note, tagPopup) {
    // Close the tag popup first
    if (tagPopup) {
      tagPopup.remove();
    }
    
    // Then show the note preview
    const titleEl = document.getElementById('popup-note-title');
    const contentEl = document.getElementById('popup-note-content');
    const tagsEl = document.getElementById('popup-note-tags');

    if (titleEl) titleEl.textContent = note.title || "(No Title)";
    if (contentEl) contentEl.textContent = note.content || "";
    
    const tags = note.tags || [];
    if (tagsEl) {
      tagsEl.innerHTML = tags.length > 0 
        ? tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')
        : '<span style="color: #6c757d; font-style: italic;">No tags</span>';
    }

    // Add note date if available
    const dateEl = document.getElementById('popup-note-date');
    if (dateEl) {
      const date = note.date || note.created_at;
      dateEl.textContent = date ? formatPrettyDate(date) : '';
    }

    const popup = document.getElementById('note-preview-popup');
    if (popup) {
      popup.classList.remove('hidden');
      popup.style.zIndex = '10001';
      console.log('Note preview popup opened from tag');
    } else {
      console.error('Note preview popup not found!');
    }
  };

  window.showNotePreviewFromCollection = function(note) {
    // Close the collection popup first
    const collectionPopup = document.getElementById('collection-notes-popup');
    if (collectionPopup) {
      collectionPopup.classList.add('hidden');
    }
    
    // Then show the note preview
    const titleEl = document.getElementById('popup-note-title');
    const contentEl = document.getElementById('popup-note-content');
    const tagsEl = document.getElementById('popup-note-tags');

    if (titleEl) titleEl.textContent = note.title || "(No Title)";
    if (contentEl) contentEl.textContent = note.content || "";
    
    const tags = note.tags || [];
    if (tagsEl) {
      tagsEl.innerHTML = tags.length > 0 
        ? tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')
        : '<span style="color: #6c757d; font-style: italic;">No tags</span>';
    }

    // Add note date if available
    const dateEl = document.getElementById('popup-note-date');
    if (dateEl) {
      const date = note.date || note.created_at;
      dateEl.textContent = date ? formatPrettyDate(date) : '';
    }

    const popup = document.getElementById('note-preview-popup');
    if (popup) {
      popup.classList.remove('hidden');
      popup.style.zIndex = '10001';
      console.log('Note preview popup opened from collection');
    } else {
      console.error('Note preview popup not found!');
    }
  };

  // === INITIALIZATION ===
  loadNotes();
});
