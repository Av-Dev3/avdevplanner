document.addEventListener("DOMContentLoaded", () => {
  const pinnedContainer = document.getElementById("pinned-notes-container");

  fetch("https://avdevplanner.onrender.com/notes")
    .then((res) => res.json())
    .then((notes) => {
      const pinned = notes.filter(note => note.pinned);

      if (pinned.length === 0) {
        pinnedContainer.innerHTML = "<p>No pinned notes yet.</p>";
        return;
      }

      pinned.forEach(note => {
        const card = document.createElement("div");
        card.className = "task-card"; // reuse your styles
        card.innerHTML = `
          <h3>${note.title}</h3>
          <p>${note.content}</p>
          <p><small>${note.date ? `Date: ${note.date}` : ""}</small></p>
          <p><small>Created: ${new Date(note.created_at).toLocaleString()}</small></p>
        `;
        pinnedContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Failed to load pinned notes", err);
      pinnedContainer.innerHTML = "<p>Error loading pinned notes.</p>";
    });
});
