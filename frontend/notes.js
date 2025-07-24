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
  const tagList = document.getElementById("tag-list");
  const collectionsContainer = document.getElementById("collection-list");

  let allNotes = [];

  // === Tab logic ===
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("text-white", "font-semibold"));
      contents.forEach((c) => c.classList.add("hidden"));

      tab.classList.add("text-white", "font-semibold");
      const tabName = tab.id.replace("tab-", "");
      document.getElementById(`${tabName}-tab`).classList.remove("hidden");

      activeBar.style.transform = `translateX(${tab.offsetLeft}px)`;
      activeBar.style.width = `${tab.offsetWidth}px`;

      if (tabName === "tags") renderTags();
      if (tabName === "collections") renderCollections();
    });
  });

  // === On page load, set active bar under default active tab ===
  const initialActive = document.querySelector(".tab-link.text-white");
  if (initialActive && activeBar) {
    activeBar.style.transform = `translateX(${initialActive.offsetLeft}px)`;
    activeBar.style.width = `${initialActive.offsetWidth}px`;
  }

  // === Open popup from FAB (mobile) ===
  const fab = document.getElementById("fab-notes");
  if (fab) {
    fab.addEventListener("click", () => {
      popup.classList.remove("hidden");
    });
  }

  // === Open popup from desktop button ===
  const desktopBtn = document.getElementById("add-note-desktop");
  if (desktopBtn) {
    desktopBtn.addEventListener("click", () => {
      popup.classList.remove("hidden");
    });
  }

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.classList.add("hidden");
  });

  const formatPrettyDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const groupNotesByWeek = (notes) => {
    const weeks = {};
    notes.forEach((note) => {
      const date = note.date || note.created_at;
      const d = new Date(date);
      const sunday = new Date(d);
      sunday.setDate(d.getDate() - d.getDay());
      const weekKey = sunday.toISOString().split("T")[0];
      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(note);
    });
    return weeks;
  };

  const createNoteCard = (note) => {
    const div = document.createElement("div");
    div.className =
      "shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm relative";

    div.innerHTML = `
      <h3 class="font-semibold mb-1">${note.title}</h3>
      ${note.content ? `<p class="mb-1">${note.content}</p>` : ""}
      ${
        note.date || note.created_at
          ? `<p><small>${formatPrettyDate(note.date || note.created_at)}</small></p>`
          : ""
      }
    `;

    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showNoteOptions(note);
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
      renderNotesByWeek();
    } catch (err) {
      console.error("Error loading notes:", err);
    }
  };

  const renderNotesByWeek = () => {
    const grouped = groupNotesByWeek(allNotes);
    notesContainer.innerHTML = "";

    Object.entries(grouped).forEach(([week, notes]) => {
      const group = document.createElement("div");
      group.className = "flex flex-col gap-3";
      group.innerHTML = `<h3 class="text-sm text-neutral-400 border-b border-neutral-700 pb-1">${formatPrettyDate(
        week
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

  const renderTags = () => {
    const tagSet = new Set();
    allNotes.forEach((n) => (n.tags || []).forEach((t) => tagSet.add(t)));

    tagList.innerHTML = "";
    tagSet.forEach((tag) => {
      const btn = document.createElement("button");
      btn.textContent = `#${tag}`;
      btn.className =
        "bg-[#333] text-white px-2 py-1 rounded hover:bg-[#b91c1c]";
      btn.addEventListener("click", () => {
        const filtered = allNotes.filter((n) => n.tags?.includes(tag));
        notesContainer.innerHTML = "";
        const grouped = groupNotesByWeek(filtered);
        Object.entries(grouped).forEach(([week, notes]) => {
          const group = document.createElement("div");
          group.className = "flex flex-col gap-3";
          group.innerHTML = `<h3 class="text-sm text-neutral-400 border-b border-neutral-700 pb-1">${formatPrettyDate(
            week
          )}</h3>`;
          const row = document.createElement("div");
          setupSwipeContainer(row);
          notes.forEach((note) => row.appendChild(createNoteCard(note)));
          group.appendChild(row);
          notesContainer.appendChild(group);
        });
      });
      tagList.appendChild(btn);
    });
  };

  const renderCollections = () => {
    const grouped = {};
    allNotes.forEach((note) => {
      const col = note.collection || "Unassigned";
      if (!grouped[col]) grouped[col] = [];
      grouped[col].push(note);
    });

    collectionsContainer.innerHTML = "";
    Object.entries(grouped).forEach(([name, notes]) => {
      const card = document.createElement("div");
      card.className = "bg-[#2b2b2b] p-4 rounded-lg shadow text-white";
      card.innerHTML = `<h4 class='font-semibold mb-1'>${name}</h4><p>${notes.length} notes</p>`;
      card.addEventListener("click", () => {
        // Optional: show collection notes
      });
      collectionsContainer.appendChild(card);
    });
  };

  const showNoteOptions = (note) => {
    alert(
      `Options for: ${note.title}\n(Pin/unpin, Delete, Add to Collection coming soon)`
    );
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
