// === TAGS MANAGEMENT ===

document.addEventListener("DOMContentLoaded", () => {
  const tagList = document.getElementById("tag-list");
  let allNotes = [];

  // === LOAD TAGS ===
  async function loadTags() {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes");
      allNotes = await res.json();
      renderTags();
    } catch (err) {
      console.error("Failed to fetch notes:", err);
      showErrorMessage("Error loading tags");
    }
  }

  // === RENDER TAGS ===
  function renderTags() {
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

  // === CREATE TAG CARD ===
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

  // === SHOW TAGGED NOTES ===
  function showTaggedNotes(tag, notes) {
    // Create a temporary popup to show tagged notes
    const popup = document.createElement('div');
    popup.className = 'modal glass-modal';
    popup.style.display = 'flex';
    
    popup.innerHTML = `
      <div class="modal__content">
        <button class="modal__close" onclick="this.closest('.modal').remove()">&times;</button>
        <h2 class="modal__title">Notes tagged with #${tag}</h2>
        <div class="tagged-notes-list">
          ${notes.length === 0 ? '<p class="text-center text-gray-400">No notes found with this tag.</p>' : ''}
          ${notes.map(note => `
            <div class="collection-note-item" onclick="showNotePreview(${JSON.stringify(note).replace(/"/g, '&quot;')})">
              <h4>${note.title || '(No Title)'}</h4>
              <p>${note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : ''}</p>
              <div class="note-meta">
                <small class="note-date">${formatPrettyDate(note.date || note.created_at)}</small>
                ${note.notebook ? `<small class="note-collection">📁 ${note.notebook}</small>` : ''}
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
  }

  // === UTILITY FUNCTIONS ===
  function formatPrettyDate(dateStr) {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  // === INITIALIZATION ===
  loadTags();
});

// === GLOBAL FUNCTIONS ===
function showNotePreview(note) {
  const titleEl = document.getElementById('popup-note-title');
  const contentEl = document.getElementById('popup-note-content');
  const tagsEl = document.getElementById('popup-note-tags');

  if (titleEl) titleEl.textContent = note.title || "(No Title)";
  if (contentEl) contentEl.textContent = note.content || "";
  
  const tags = note.tags || [];
  if (tagsEl) {
    tagsEl.innerHTML = tags.length > 0 
      ? tags.map(tag => `<span class="note-tag">#${tag}</span>`).join('')
      : '';
  }

  document.getElementById('note-preview-popup').classList.remove('hidden');
}
