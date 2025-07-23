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
      date: parseNaturalDate(dateInput.value),
      completed: false
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
      if (goal.completed) {
        card.classList.add("completed");
      }

      const parsedGoalDate = parseNaturalDate((goal.date || "").trim());
      const displayDate = parsedGoalDate ? formatPrettyDate(parsedGoalDate) : "(No Date Set)";

      card.innerHTML = `
        <h3>${goal.title}</h3>
        ${goal.notes ? `<p><strong>Notes:</strong> ${goal.notes}</p>` : ""}
        ${displayDate ? `<p><strong>Target Date:</strong> ${displayDate}</p>` : ""}
        ${goal.completed ? `<p style="color:limegreen"><strong>✅ Completed</strong></p>` : ""}
      `;

      const buttonGroup = document.createElement("div");
      buttonGroup.className = "goal-button-group";

      if (!goal.completed) {
        const completeBtn = document.createElement("button");
        completeBtn.textContent = "Mark Complete";
        completeBtn.addEventListener("click", async () => {
          await fetch(`https://avdevplanner.onrender.com/goals/${index}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...goal, completed: true }),
          });
          loadGoals();
        });
        buttonGroup.appendChild(completeBtn);
      }

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
      buttonGroup.appendChild(deleteBtn);

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", async () => {
        const newTitle = prompt("Edit goal title:", goal.title);
        const newNotes = prompt("Edit notes:", goal.notes || "");
        const newDate = prompt("Edit date (YYYY-MM-DD or 'tomorrow'):", goal.date || "");

        if (newTitle !== null) {
          await fetch(`https://avdevplanner.onrender.com/goals/${index}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...goal,
              title: newTitle.trim(),
              notes: newNotes.trim(),
              date: parseNaturalDate(newDate.trim())
            }),
          });
          loadGoals();
        }
      });
      buttonGroup.appendChild(editBtn);

      card.appendChild(buttonGroup);
      container.appendChild(card);
    });
  }
}

// === Helpers ===

function parseNaturalDate(dateStr) {
  if (!dateStr) return null;

  const lowered = dateStr.toLowerCase();
  const today = new Date();

  if (lowered === "today") {
    return today.toISOString().split("T")[0];
  }

  if (lowered === "tomorrow") {
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return null;
}

function formatPrettyDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string" || dateStr.length !== 10 || dateStr.includes("NaN")) {
    return "(Invalid Date)";
  }

  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(+year, +month - 1, +day);

  if (isNaN(dateObj.getTime())) return "(Invalid Date)";

  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleString("default", { month: "long" });

  return `${monthName} ${dayNum}`;
}
