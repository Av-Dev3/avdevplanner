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

    // Group notes by notebook (collection)
    allNotes.forEach((note) => {
      const notebook = note.notebook?.trim();
      if (!collectionMap.has(notebook)) {
        collectionMap.set(notebook, []);
      }
      collectionMap.get(notebook).push(note);
    });

    // Check for empty collections saved locally
    const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");
    saved.forEach((name) => {
      if (!collectionMap.has(name)) {
        collectionMap.set(name, []);
      }
    });

    collectionList.innerHTML = "";

    collectionMap.forEach((notes, notebook) => {
      const card = document.createElement("div");
      card.className = "bg-[#1f1f1f] rounded p-4 shadow text-white";

      card.innerHTML = `
        <h3 class="text-lg font-semibold">${notebook || "Untitled"}</h3>
        <p class="text-sm text-gray-400">${notes.length} note${notes.length !== 1 ? "s" : ""}</p>
      `;

      collectionList.appendChild(card);
    });
  };

  // Add new empty collection
  createBtn.addEventListener("click", () => {
    const name = prompt("Enter new collection name:");
    if (!name) return;

    // Save to localStorage so we remember even if empty
    const saved = JSON.parse(localStorage.getItem("emptyCollections") || "[]");
    if (!saved.includes(name)) {
      saved.push(name);
      localStorage.setItem("emptyCollections", JSON.stringify(saved));
    }

    renderCollections();
  });

  fetchNotes();
});
