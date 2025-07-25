document.addEventListener("DOMContentLoaded", () => {
  const collectionList = document.getElementById("collection-list");
  const createBtn = document.getElementById("create-collection-btn");

  let allNotes = [];

  const fetchNotes = async () => {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes");
      allNotes = await res.json();
      renderCollections();
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const renderCollections = () => {
    const collectionMap = new Map();
    const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");

    allNotes.forEach((note) => {
      const notebook = note.notebook?.trim();
      if (!collectionMap.has(notebook)) {
        collectionMap.set(notebook, []);
      }
      collectionMap.get(notebook).push(note);
    });

    saved.forEach((name) => {
      if (!collectionMap.has(name)) {
        collectionMap.set(name, []);
      }
    });

    collectionList.innerHTML = "";

    collectionMap.forEach((notes, notebook) => {
      const card = document.createElement("div");
      card.className =
        "bg-[#1f1f1f] rounded-lg shadow text-white cursor-pointer collection-card flex w-36 h-36 sm:w-40 sm:h-40 hover:shadow-lg transition-all overflow-hidden";
      card.dataset.notebook = notebook;

      card.innerHTML = `
  <div class="bg-purple-600 w-2 h-full"></div>
  <div class="flex flex-col justify-between p-3 w-full">
    <div>
      <h3 class="text-md font-semibold break-words border-b-2 border-[#b91c1c] pb-1">
        ${notebook || "Untitled"}
      </h3>
    </div>
    <p class="text-xs text-gray-400 mt-auto">${notes.length} note${notes.length !== 1 ? "s" : ""}</p>
  </div>
`;


      // Right-click delete popup
      card.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showCollectionOptions(notebook, e.clientX, e.clientY);
      });

      // Long-press for mobile delete popup
      let longPressTimer;
      card.addEventListener("touchstart", (e) => {
        longPressTimer = setTimeout(() => {
          const touch = e.touches[0];
          showCollectionOptions(notebook, touch.clientX, touch.clientY);
        }, 800);
      });

      card.addEventListener("touchend", () => clearTimeout(longPressTimer));
      collectionList.appendChild(card);
    });
  };

  const showCollectionOptions = (notebook, x, y) => {
    const popup = document.createElement("div");
    popup.className =
      "fixed z-50 bg-[#1f1f1f] border border-neutral-700 text-white rounded shadow-lg p-2 text-sm";
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

    popup.querySelector("[data-action='delete']").addEventListener("click", () => {
      if (confirm(`Delete collection "${notebook}"?`)) {
        const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");
        const updated = saved.filter((name) => name !== notebook);
        localStorage.setItem("emptyCollections", JSON.stringify(updated));
        renderCollections();
      }
      closePopup();
    });
  };

  createBtn.addEventListener("click", () => {
    const name = prompt("Enter new collection name:");
    if (!name) return;

    const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");
    if (!saved.includes(name)) {
      saved.push(name);
      localStorage.setItem("emptyCollections", JSON.stringify(saved));
    }

    renderCollections();
  });

  collectionList.addEventListener("click", (e) => {
    const card = e.target.closest(".collection-card");
    if (!card) return;

    const notebook = card.dataset.notebook;
    const notes = allNotes.filter((n) => (n.notebook || "").trim() === notebook);
    showCollectionPopup(notebook, notes);
  });

  const showCollectionPopup = (notebook, notes) => {
    let popup = document.getElementById("collection-popup");
    if (popup) popup.remove();

    popup = document.createElement("div");
    popup.id = "collection-popup";
    popup.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/60";

    popup.innerHTML = `
      <div class="bg-[#1f1f1f] text-white w-[90%] max-w-md max-h-[80vh] overflow-y-auto p-4 rounded-lg shadow-lg relative">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Collection: ${notebook}</h2>
          <button id="close-collection-popup" class="text-red-400 hover:text-red-600 text-xl">&times;</button>
        </div>
        <div class="flex flex-col gap-3" id="collection-popup-notes">
          ${
            notes.length === 0
              ? `<p class="text-sm text-gray-400">No notes in this collection.</p>`
              : notes
                  .map(
                    (note, i) => `
              <div class="bg-[#2b2b2b] p-3 rounded shadow text-sm cursor-pointer collection-note-card" data-index="${i}">
                <h4 class="font-semibold">${note.title}</h4>
                ${note.content ? `<p class="mt-1 text-neutral-300">${note.content}</p>` : ""}
                <p class="text-xs text-gray-400 mt-1">${note.prettyDate || ""}</p>
              </div>
            `
                  )
                  .join("")
          }
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    document.getElementById("close-collection-popup").addEventListener("click", () => {
      popup.remove();
    });

    popup.querySelectorAll(".collection-note-card").forEach((noteCard, i) => {
      noteCard.addEventListener("click", () => {
        const note = notes[i];
        document.getElementById("collection-popup-title").textContent = note.title || "(No Title)";
        document.getElementById("collection-popup-content").textContent = note.content || "";
        document.getElementById("collection-popup-tags").textContent = note.tags?.length
          ? `Tags: ${note.tags.join(", ")}`
          : "";
        document.getElementById("collection-note-preview").classList.remove("hidden");
      });
    });
  };

  fetchNotes();
});
