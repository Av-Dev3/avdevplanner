// === COLLECTIONS MANAGEMENT ===

document.addEventListener("DOMContentLoaded", () => {
  // Collection form submission
  const collectionForm = document.getElementById("collection-form");
  if (collectionForm) {
    collectionForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const collectionName = document.getElementById("collection-name").value.trim();
      const collectionDescription = document.getElementById("collection-description").value.trim();

      if (!collectionName) {
        showErrorMessage("Collection name is required");
        return;
      }

      try {
        // Create a note with the collection name as the notebook field
        const res = await fetch("https://avdevplanner.onrender.com/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: collectionName,
            content: collectionDescription || "Collection created",
            notebook: collectionName,
            tags: ["collection"]
          }),
        });

        if (res.ok) {
          // Reset form and close popup
          collectionForm.reset();
          document.getElementById("collectionPopup").classList.add("hidden");
          
          // Reload notes to update collections
          if (typeof loadNotes === 'function') {
            await loadNotes();
          }
          showSuccessMessage("Collection created successfully!");
        } else {
          console.error("Failed to create collection");
          showErrorMessage("Failed to create collection");
        }
      } catch (error) {
        console.error("Error creating collection:", error);
        showErrorMessage("Error creating collection");
      }
    });
  }

  // Create Collection button in collections tab
  const createCollectionBtn = document.getElementById("create-collection-btn");
  if (createCollectionBtn) {
    createCollectionBtn.addEventListener("click", () => {
      document.getElementById("collectionPopup").classList.remove("hidden");
    });
  }

  // Render collections
  async function renderCollections() {
    const collectionList = document.getElementById("collection-list");
    if (!collectionList) {
      console.error("Collection list element not found!");
      return;
    }

    console.log("Rendering collections...");
    
    try {
      // Get all notes to extract collections
      const res = await fetch("https://avdevplanner.onrender.com/notes");
      const allNotes = await res.json();
      
      // Group notes by notebook field
      const collectionMap = new Map();
      
      allNotes.forEach(note => {
        const notebook = note.notebook?.trim();
        if (notebook) {
          if (!collectionMap.has(notebook)) {
            collectionMap.set(notebook, []);
          }
          collectionMap.get(notebook).push(note);
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
      
      collectionMap.forEach((notes, notebook) => {
        console.log("Creating collection card for:", notebook, "with", notes.length, "notes");
        const card = createCollectionCard(notebook, notes);
        collectionList.appendChild(card);
      });
      
      console.log("Total collections rendered:", collectionList.children.length);
    } catch (error) {
      console.error("Error loading collections:", error);
      showErrorMessage("Error loading collections");
    }
  }

  function createCollectionCard(notebook, notes) {
    const card = document.createElement("div");
    card.className = "collection-card";
    card.innerHTML = `
      <h3>📚 ${notebook}</h3>
      <div class="collection-count">${notes.length} note${notes.length !== 1 ? "s" : ""}</div>
    `;
    
    card.addEventListener("click", () => {
      showCollectionNotes(notebook, notes);
    });
    
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (notebook) {
        showCollectionOptions(notebook, e.clientX, e.clientY);
      }
    });
    
    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      setTimeout(() => {
        if (notebook) {
          showCollectionOptions(notebook, touch.clientX, touch.clientY);
        }
      }, 500);
    });
    
    return card;
  }

  function showCollectionNotes(notebook, notes) {
    console.log('showCollectionNotes called with:', notebook, notes);
    
    const popup = document.getElementById('collection-notes-popup');
    const titleEl = document.getElementById('collection-popup-title');
    const listEl = document.getElementById('collection-notes-list');
    
    if (!popup || !titleEl || !listEl) {
      console.error('Collection notes popup not found!');
      return;
    }
    
    titleEl.textContent = notebook;
    
    if (!notes || notes.length === 0) {
      listEl.innerHTML = '<p class="text-center text-gray-400">No notes in this collection.</p>';
    } else {
      listEl.innerHTML = notes.map(note => `
        <div class="collection-note-item" onclick="showNotePreviewFromCollection(${JSON.stringify(note).replace(/"/g, '&quot;')})" style="cursor: pointer;">
          <h4>${note.title || "(No Title)"}</h4>
          <p>${note.content ? note.content.substring(0, 100) + (note.content.length > 100 ? '...' : '') : "No content"}</p>
        </div>
      `).join('');
    }
    
    popup.classList.remove('hidden');
    console.log('Collection notes popup opened');
  }

  function showCollectionOptions(notebook, x, y) {
    const popup = document.createElement('div');
    popup.style.cssText = `
      position: fixed;
      top: ${y}px;
      left: ${x}px;
      background: var(--glass-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      padding: 0.5rem;
      z-index: 1000;
      box-shadow: var(--glass-shadow);
    `;
    
    popup.innerHTML = `
      <button class="block w-full text-left px-2 py-1 hover:bg-[#b91c1c]" data-action="delete">Delete Collection</button>
    `;
    
    document.body.appendChild(popup);
    
    const closePopup = () => {
      document.body.removeChild(popup);
    };
    
    popup.addEventListener('click', async (e) => {
      const action = e.target.dataset.action;
      if (action === 'delete') {
        if (confirm(`Delete collection "${notebook}"? This will remove the collection from all notes.`)) {
          try {
            // Get all notes in this collection
            const res = await fetch("https://avdevplanner.onrender.com/notes");
            const allNotes = await res.json();
            const notesToUpdate = allNotes.filter(note => note.notebook === notebook);
            
            let successCount = 0;
            let errorCount = 0;

            // Update each note to remove the notebook field
            for (const note of notesToUpdate) {
              try {
                const noteId = note.id || note._id;
                if (!noteId) {
                  console.error("Note has no ID:", note);
                  errorCount++;
                  continue;
                }

                const updateRes = await fetch(`https://avdevplanner.onrender.com/notes/${noteId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...note, notebook: null }),
                });

                if (updateRes.ok) {
                  successCount++;
                } else {
                  console.error(`Failed to update note ${noteId}:`, updateRes.status);
                  errorCount++;
                }
              } catch (error) {
                console.error(`Error updating note:`, error);
                errorCount++;
              }
            }

            // Reload notes and re-render
            if (typeof loadNotes === 'function') {
              await loadNotes();
            }
            
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
      }
      closePopup();
    });
    
    document.addEventListener('click', closePopup, { once: true });
  }

  // Make functions globally available
  window.renderCollections = renderCollections;
  window.showCollectionNotes = showCollectionNotes;
  window.showCollectionOptions = showCollectionOptions;
});
