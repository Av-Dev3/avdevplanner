document.addEventListener("DOMContentLoaded", () => {
  const notesContainer = document.getElementById("notes-by-week-container");
  const popup = document.getElementById("noteFormPopup");
  const titleInput = document.getElementById("note-title");
  const contentInput = document.getElementById("note-content");
  const tagsInput = document.getElementById("note-tags");
  const saveBtn = document.getElementById("save-note-btn");
  const tabs = document.querySelectorAll(".tab-link");
  const contents = document.querySelectorAll(".tab-content");
  const activeBar = document.getElementById("active-tab-bar");

  let allNotes = [];

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("text-white", "font-semibold"));
      contents.forEach((c) => c.classList.add("hidden"));

      tab.classList.add("text-white", "font-semibold");
      const tabName = tab.id.replace("tab-", "");
      document.getElementById(`${tabName}-tab`).classList.remove("hidden");

      activeBar.style.transform = `translateX(${tab.offsetLeft}px)`;
      activeBar.style.width = `${tab.offsetWidth}px`;
    });
  });

  const initialActive = document.querySelector(".tab-link.text-white");
  if (initialActive && activeBar) {
    activeBar.style.transform = `translateX(${initialActive.offsetLeft}px)`;
    activeBar.style.width = `${initialActive.offsetWidth}px`;
  }

  const fab = document.getElementById("fab-notes");
  if (fab) {
    fab.addEventListener("click", () => {
      popup.classList.remove("hidden");
    });
  }

  const desktopBtn = document.getElementById("add-note-desktop");
  if (desktopBtn) {
    desktopBtn.addEventListener("click", () => {
      popup.classList.remove("hidden");
    });
  }

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.add("hidden");
  });

  function formatPrettyDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    const date = new Date(`${year}-${month}-${day}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const groupNotesByDate = (notes) => {
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
  };

  const createNoteCard = (note) => {
    const div = document.createElement("div");
    div.className =
      "shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm relative text-white";

    div.innerHTML = `
      <h3 class="font-semibold mb-1">${note.title}</h3>
      ${note.content ? `<p class="mb-1">${note.content}</p>` : ""}
      ${note.prettyDate ? `<p><small>${note.prettyDate}</small></p>` : ""}
    `;

    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showNoteOptions(note, e.clientX, e.clientY);
    });

    return div;
  };

  const setupSwipeContainer = (container) => {
    container.classList.add(
      "flex",
      "overflow-x-auto",
      "snap-x",
      "snap-mandatory",
      "scroll-smooth",
      "no-scrollbar",
      "gap-3"
    );
    container.style.scrollbarWidth = "none";
    container.style.msOverflowStyle = "none";
    container.style.overflowY = "hidden";
    container.style.webkitOverflowScrolling = "touch";

    if (window.innerWidth >= 768) {
      container.classList.remove(
        "flex",
        "overflow-x-auto",
        "snap-x",
        "snap-mandatory",
        "scroll-smooth"
      );
      container.style.overflow = "visible";
      container.style.display = "grid";
      container.style.gridTemplateColumns =
        "repeat(auto-fit, minmax(200px, 1fr))";
      container.style.gap = "1rem";
    }
  };

  const loadNotes = async () => {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes");
      allNotes = await res.json();
      renderNotesByDate();
    } catch (err) {
      console.error("Error loading notes:", err);
    }
  };

  const renderNotesByDate = () => {
    const grouped = groupNotesByDate(allNotes);
    notesContainer.innerHTML = "";

    Object.entries(grouped).forEach(([dateStr, notes]) => {
      const group = document.createElement("div");
      group.className = "flex flex-col gap-3";
      group.innerHTML = `<h3 class="text-sm text-neutral-400 border-b border-neutral-700 pb-1">${formatPrettyDate(
        dateStr
      )}</h3>`;

      const cardRow = document.createElement("div");
      setupSwipeContainer(cardRow);

      notes.forEach((note) => {
        cardRow.appendChild(createNoteCard(note));
      });

      group.appendChild(cardRow);
      notesContainer.appendChild(group);
    });
  };

  const showNoteOptions = (note, x, y) => {
    const popup = document.createElement("div");
    popup.className =
      "fixed z-50 bg-[#1f1f1f] border border-neutral-700 text-white rounded shadow-lg p-2 text-sm";
    popup.style.top = `${y}px`;
    popup.style.left = `${x}px`;

    popup.innerHTML = `
      <button class="block w-full text-left px-2 py-1 hover:bg-[#b91c1c]" data-action="pin">${note.pinned ? "Unpin" : "Pin"}</button>
      <button class="block w-full text-left px-2 py-1 hover:bg-[#b91c1c]" data-action="delete">Delete</button>
      <button class="block w-full text-left px-2 py-1 hover:bg-[#b91c1c]" data-action="add-to-collection">Add to Collection</button>
    `;

    document.body.appendChild(popup);

    const closePopup = () => {
      if (popup && popup.parentNode) popup.remove();
      document.removeEventListener("click", closePopup);
    };

    document.addEventListener("click", closePopup);

    popup.addEventListener("click", async (e) => {
      const action = e.target.dataset.action;
      if (action === "pin") {
        await togglePin(note);
      } else if (action === "delete") {
        await deleteNote(note);
      } else if (action === "add-to-collection") {
        const notebook = prompt("Enter collection name:");
        if (notebook) {
          await updateNotebook(note, notebook);
        }
      }
      closePopup();
      loadNotes();
    });
  };

  const updateNotebook = async (note, notebook) => {
    try {
      const res = await fetch(
        `https://avdevplanner.onrender.com/notes/${note.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...note, notebook }),
        }
      );
      if (!res.ok) throw new Error("Failed to update notebook");
    } catch (err) {
      console.error("Notebook update error:", err);
    }
  };

  const togglePin = async (note) => {
    try {
      const res = await fetch(
        `https://avdevplanner.onrender.com/notes/${note.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...note, pinned: !note.pinned }),
        }
      );
      if (!res.ok) throw new Error("Failed to toggle pin");
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  const deleteNote = async (note) => {
    if (!confirm(`Delete note "${note.title}"?`)) return;
    try {
      const res = await fetch(
        `https://avdevplanner.onrender.com/notes/${note.id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  saveBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const tags = tagsInput.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const date = new Date().toISOString();

    if (!title && !content) return;

    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          tags,
          pinned: false,
          date,
          created_at: date,
          notebook: "",
        }),
      });

      if (res.ok) {
        titleInput.value = "";
        contentInput.value = "";
        tagsInput.value = "";
        popup.classList.add("hidden");
        await loadNotes();
      } else {
        alert("Error saving note.");
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
  });

  loadNotes();
});
