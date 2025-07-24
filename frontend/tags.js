document.addEventListener("DOMContentLoaded", async () => {
  const tagList = document.getElementById("tag-list");
  const tagPopup = document.getElementById("tag-popup");
  const tagPopupNotes = document.getElementById("tag-popup-notes");
  const closeTagPopup = document.getElementById("close-tag-popup");

  let allNotes = [];

  const fetchNotes = async () => {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes");
      allNotes = await res.json();
      renderTags();
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const renderTags = () => {
    const tagSet = new Set();
    allNotes.forEach((n) => (n.tags || []).forEach((t) => tagSet.add(t)));

    tagList.innerHTML = "";
    tagSet.forEach((tag) => {
      const btn = document.createElement("button");
      btn.textContent = `#${tag}`;
      btn.className =
        "bg-[#333] text-white px-3 py-1 rounded hover:bg-[#b91c1c]";
      btn.addEventListener("click", () => openTagPopup(tag));
      tagList.appendChild(btn);
    });
  };

  const openTagPopup = (tag) => {
    const filtered = allNotes.filter((n) => n.tags?.includes(tag));
    tagPopupNotes.innerHTML = "";

    filtered.forEach((note) => {
      const card = document.createElement("div");
      card.className =
        "bg-[#2b2b2b] p-3 rounded shadow text-sm flex flex-col gap-1";
      card.innerHTML = `
        <h4 class="font-semibold">${note.title}</h4>
        ${note.content ? `<p>${note.content}</p>` : ""}
        <p class="text-xs text-gray-400">${note.prettyDate || ""}</p>
      `;
      tagPopupNotes.appendChild(card);
    });

    tagPopup.classList.remove("hidden");
  };

  closeTagPopup.addEventListener("click", () => {
    tagPopup.classList.add("hidden");
  });

  tagPopup.addEventListener("click", (e) => {
    if (e.target === tagPopup) tagPopup.classList.add("hidden");
  });

  fetchNotes();
});
