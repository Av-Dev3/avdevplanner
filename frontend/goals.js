const form = document.getElementById("weekly-goal-form");
const container = document.getElementById("weekly-goals-container");

if (form && container) {
  const titleInput = document.getElementById("goal-title");
  const notesInput = document.getElementById("goal-notes");
  const dateInput = document.getElementById("goal-date");

  loadGoals();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newGoal = {
      title: titleInput.value.trim(),
      notes: notesInput.value.trim(),
      date: dateInput.value, // Add selected date
      created_at: new Date().toISOString(),
    };

    const res = await fetch("https://avdevplanner.onrender.com/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGoal),
    });

    if (res.ok) {
      form.reset();
      loadGoals();
    } else {
      console.error("Error saving goal:", await res.text());
    }
  });

  async function loadGoals() {
    container.innerHTML = "";
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();

    if (!goals.length) {
      container.innerHTML = "<p>No weekly goals yet.</p>";
      return;
    }

    goals.forEach((goal, index) => {
      const card = document.createElement("div");
      card.className = "goal-card";
      card.innerHTML = `
        <h3>${goal.title}</h3>
        ${goal.notes ? `<p><strong>Notes:</strong> ${goal.notes}</p>` : ""}
        ${goal.date ? `<p><strong>Target Date:</strong> ${goal.date}</p>` : ""}
        <p><small>Added: ${new Date(goal.created_at).toLocaleDateString()}</small></p>
      `;

      // DELETE button
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("Delete this goal?");
        if (!confirmDelete) return;

        await fetch(`https://avdevplanner.onrender.com/goals/${index}`, {
          method: "DELETE",
        });
        loadGoals();
      });
      card.appendChild(deleteBtn);

      // EDIT button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", async () => {
        const newTitle = prompt("Edit goal title:", goal.title);
        const newNotes = prompt("Edit notes:", goal.notes || "");
        const newDate = prompt("Edit date (YYYY-MM-DD):", goal.date || "");

        if (newTitle !== null) {
          await fetch(`https://avdevplanner.onrender.com/goals/${index}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...goal,
              title: newTitle.trim(),
              notes: newNotes.trim(),
              date: newDate.trim(),
            }),
          });
          loadGoals();
        }
      });
      card.appendChild(editBtn);

      container.appendChild(card);
    });
  }
}
