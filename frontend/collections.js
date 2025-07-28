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
        // Use the actual collections API route
        const res = await fetch("https://avdevplanner.onrender.com/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collection: collectionName,
            description: collectionDescription
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
      // Get collections from the API
      const res = await fetch("https://avdevplanner.onrender.com/collections");
      const collections = await res.json();
      
      if (!collections || Object.keys(collections).length === 0) {
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
      
      Object.entries(collections).forEach(([collectionName, noteIds]) => {
        console.log("Creating collection card for:", collectionName, "with", noteIds.length, "notes");
        const card = createCollectionCard(collectionName, noteIds);
        collectionList.appendChild(card);
      });
      
      console.log("Total collections rendered:", collectionList.children.length);
    } catch (error) {
      console.error("Error loading collections:", error);
      showErrorMessage("Error loading collections");
    }
  }

  function createCollectionCard(collectionName, noteIds) {
    const card = document.createElement("div");
    card.className = "collection-card";
    card.innerHTML = `
      <h3>📚 ${collectionName}</h3>
      <div class="collection-count">${noteIds.length} note${noteIds.length !== 1 ? "s" : ""}</div>
    `;
    
    card.addEventListener("click", () => {
      showCollectionNotes(collectionName, noteIds);
    });
    
    card.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (collectionName) {
        showCollectionOptions(collectionName, e.clientX, e.clientY);
      }
    });
    
    card.addEventListener("touchstart", (e) => {
      const touch = e.touches[0];
      setTimeout(() => {
        if (collectionName) {
          showCollectionOptions(collectionName, touch.clientX, touch.clientY);
        }
      }, 500);
    });
    
    return card;
  }

  function showCollectionNotes(collectionName, noteIds) {
    console.log('showCollectionNotes called with:', collectionName, noteIds);
    
    const popup = document.getElementById('collection-notes-popup');
    const titleEl = document.getElementById('collection-popup-title');
    const listEl = document.getElementById('collection-notes-list');
    
    if (!popup || !titleEl || !listEl) {
      console.error('Collection notes popup not found!');
      return;
    }
    
    titleEl.textContent = collectionName;
    
    if (!noteIds || noteIds.length === 0) {
      listEl.innerHTML = '<p class="text-center text-gray-400">No notes in this collection.</p>';
    } else {
      listEl.innerHTML = noteIds.map(noteId => `
        <div class="collection-note-item" onclick="showNotePreviewFromCollection(${JSON.stringify({id: noteId})})" style="cursor: pointer;">
          <h4>Note ${noteId}</h4>
          <p>Click to view note details</p>
        </div>
      `).join('');
    }
    
    popup.classList.remove('hidden');
    console.log('Collection notes popup opened');
  }

  function showCollectionOptions(collectionName, x, y) {
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
        if (confirm(`Delete collection "${collectionName}"? This will remove the collection.`)) {
          try {
            const res = await fetch(`https://avdevplanner.onrender.com/collections/${collectionName}`, {
              method: "DELETE",
            });
            
            if (res.ok) {
              showSuccessMessage("Collection deleted successfully!");
              if (typeof loadNotes === 'function') {
                await loadNotes();
              }
            } else {
              showErrorMessage("Failed to delete collection");
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
