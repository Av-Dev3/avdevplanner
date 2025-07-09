const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const dateInput = document.getElementById("note-date");
const saveBtn = document.getElementById("save-note-btn");
const container = document.getElementById("notes-container");

if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const newNote = {
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
      date: dateInput.value || new Date().toISOString().split("T")[0],
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
      dateInput.value = "";
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

    notes.forEach((note, index) => {
      const card = document.createElement("div");
      card.className = "note-card";
      card.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <p><small>${note.date ? `Date: ${note.date}` : ""}</small></p>
        <p><small>Created: ${new Date(note.created_at).toLocaleString()}</small></p>
        <button class="pin-note" data-index="${index}">${note.pinned ? "Unpin" : "Pin"}</button>
        <button class="delete-note" data-index="${index}">Delete</button>
      `;

      container.appendChild(card);
    });

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
        const note = notes[index];
        const updatedNote = {
          ...note,
          pinned: !note.pinned
        };

        const res = await fetch(`https://avdevplanner.onrender.com/notes/${index}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedNote)
        });

        if (res.ok) {
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
