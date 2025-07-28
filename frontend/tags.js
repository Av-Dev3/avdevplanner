// === TAGS MANAGEMENT ===

document.addEventListener("DOMContentLoaded", () => {
  // Render tags
  function renderTags() {
    const tagList = document.getElementById("tag-list");
    if (!tagList) {
      console.error("Tag list element not found!");
      return;
    }

    console.log("Rendering tags...");
    
    // Get all notes to extract tags
    fetch("https://avdevplanner.onrender.com/notes")
      .then(res => res.json())
      .then(allNotes => {
        // Group notes by tags
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
              <p>Add tags to your notes to organize them.</p>
            </div>
          `;
          return;
        }
        
        tagList.innerHTML = "";
        
        tagMap.forEach((notes, tag) => {
          console.log("Creating tag card for:", tag, "with", notes.length, "notes");
          const card = createTagCard(tag, notes);
          tagList.appendChild(card);
        });
        
        console.log("Total tags rendered:", tagList.children.length);
      })
      .catch(error => {
        console.error("Error loading notes for tags:", error);
        showErrorMessage("Error loading tags");
      });
  }

  function createTagCard(tag, notes) {
    const card = document.createElement("div");
    card.className = "tag-card";
    card.innerHTML = `
      <h3>#${tag}</h3>
      <div class="tag-count">${notes.length} note${notes.length !== 1 ? "s" : ""}</div>
    `;
    
    card.addEventListener("click", () => {
      showTaggedNotes(tag, notes);
    });
    
    return card;
  }

  function showTaggedNotes(tag, notes) {
    console.log('showTaggedNotes called with:', tag, notes);
    
    const popup = document.getElementById('collection-notes-popup');
    const titleEl = document.getElementById('collection-popup-title');
    const listEl = document.getElementById('collection-notes-list');
    
    if (!popup || !titleEl || !listEl) {
      console.error('Collection notes popup not found!');
      return;
    }
    
    titleEl.textContent = `#${tag}`;
    
    if (!notes || notes.length === 0) {
      listEl.innerHTML = '<p class="text-center text-gray-400">No notes with this tag.</p>';
    } else {
      listEl.innerHTML = notes.map(note => `
        <div class="collection-note-item" onclick="showNotePreviewFromTag(${JSON.stringify(note).replace(/"/g, '&quot;')})" style="cursor: pointer;">
          <h4>${note.title || "(No Title)"}</h4>
          <p>${note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : "No content"}</p>
          ${note.notebook ? `<small class="note-collection">📚 ${note.notebook}</small>` : ''}
        </div>
      `).join('');
    }
    
    popup.classList.remove('hidden');
    console.log('Tagged notes popup opened');
  }

  // Make functions globally available
  window.renderTags = renderTags;
  window.showTaggedNotes = showTaggedNotes;
});
