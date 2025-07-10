const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const saveBtn = document.getElementById("save-note-btn");
const editorContainer = document.querySelector(".note-input-editor");
const toggleEditorBtn = document.getElementById("toggle-note-editor");
const container = document.getElementById("notes-by-date-container");

if (toggleEditorBtn) {
  toggleEditorBtn.addEventListener("click", () => {
    editorContainer.classList.toggle("hidden");
    toggleEditorBtn.textContent = editorContainer.classList.contains("hidden")
      ? "Create New Note"
      : "Hide Editor";
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const newNote = {
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
      date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
      pinned: false
    };

    const res = await fetch("https://avdevplanner.onrender.com/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newNote)
    });

    if (res.ok) {
      titleInput.value = "";
      contentInput.value = "";
      loadNotes();
    } else {
      console.error("Failed to save note:", await res.text());
    }
  });

  loadNotes();
}

async function loadNotes() {
  container.innerHTML = "";

  try {
    const res = await fetch("https://avdevplanner.onrender.com/notes");
    const notes = await res.json();

    if (notes.length === 0) {
      container.innerHTML = "<p>No notes saved yet.</p>";
      return;
    }

    // Group notes by date
    const grouped = notes.reduce((acc, note) => {
      if (!acc[note.date]) acc[note.date] = [];
      acc[note.date].push(note);
      return acc;
    }, {});

    for (const date in grouped) {
      const group = document.createElement("div");
      group.className = "note-date-group";
      group.innerHTML = `<h3>${date}</h3>`;

      grouped[date].forEach((note, index) => {
        const card = document.createElement("div");
        card.className = "note-card";
        card.innerHTML = `
          <h4>${note.title}</h4>
          <p>${note.content}</p>
          <small>Created: ${new Date(note.created_at).toLocaleString()}</small>
          <div class="note-actions">
            <button class="pin-note" data-index="${index}" data-date="${note.date}">
              ${note.pinned ? "Unpin" : "Pin"}
            </button>
            <button class="delete-note" data-index="${index}" data-date="${note.date}">
              Delete
            </button>
          </div>
        `;
        group.appendChild(card);
      });

      container.appendChild(group);
    }

    document.querySelectorAll(".delete-note").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const index = e.target.getAttribute("data-index");
        const confirmDelete = confirm("Delete this note?");
        if (!confirmDelete) return;

        const res = await fetch(`https://avdevplanner.onrender.com/notes/${index}`, {
          method: "DELETE"
        });

        if (res.ok) {
          loadNotes();
        } else {
          console.error("Failed to delete note");
        }
      });
    });

    document.querySelectorAll(".pin-note").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const index = e.target.getAttribute("data-index");
        const res = await fetch("https://avdevplanner.onrender.com/notes");
        const notes = await res.json();
        const note = notes[index];
        const updatedNote = { ...note, pinned: !note.pinned };

        const updateRes = await fetch(`https://avdevplanner.onrender.com/notes/${index}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedNote)
        });

        if (updateRes.ok) {
          loadNotes();
        } else {
          console.error("Failed to update pin status");
        }
      });
    });

  } catch (err) {
    container.innerHTML = "<p>Error loading notes.</p>";
    console.error(err);
  }
}
