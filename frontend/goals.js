const form = document.getElementById("weekly-goal-form");
const container = document.getElementById("weekly-goals-container");
const titleInput = document.getElementById("goal-title");
const notesInput = document.getElementById("goal-notes");
const dateInput = document.getElementById("goal-date");
const addGoalDesktopBtn = document.getElementById("add-goal-desktop");
const goalFormPopup = document.getElementById("goal-form-popup");

// === OPEN/CLOSE POPUP ===
if (addGoalDesktopBtn && goalFormPopup) {
  addGoalDesktopBtn.addEventListener("click", () => {
    goalFormPopup.classList.remove("hidden");
  });

  goalFormPopup.addEventListener("click", (e) => {
    if (e.target === goalFormPopup) {
      goalFormPopup.classList.add("hidden");
    }
  });
}

// === SUBMIT FORM ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newGoal = {
    title: titleInput.value.trim(),
    notes: notesInput.value.trim(),
    date: parseNaturalDate(dateInput.value),
    completed: false,
  };

  const res = await fetch("https://avdevplanner.onrender.com/goals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newGoal),
  });

  if (res.ok) {
    form.reset();
    goalFormPopup.classList.add("hidden");
    loadGoals();
  } else {
    console.error("Failed to save goal");
  }
});

// === LOAD GOALS ===
async function loadGoals() {
  container.innerHTML = "";

  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();

    if (!goals.length) {
      container.innerHTML = "<p class='text-white'>No weekly goals yet.</p>";
      return;
    }

    const grouped = {};
    goals.forEach((goal, index) => {
      goal.index = index; // Inject index
      const dateKey = parseNaturalDate(goal.date);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(goal);
    });

    Object.keys(grouped)
      .sort()
      .forEach((date) => {
        const groupDiv = document.createElement("div");

        const groupTitle = document.createElement("h3");
        groupTitle.className = "text-lg font-semibold text-white mb-2";
        groupTitle.textContent = formatPrettyDate(date);
        groupDiv.appendChild(groupTitle);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-2 xl:grid-cols-5 gap-4";

        grouped[date].forEach((goal) => {
          const card = document.createElement("div");
          card.className =
            "bg-[#1f1f1f] text-white p-4 rounded-lg shadow transition-all transform hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(76,142,218,0.35)]";

          card.innerHTML = `
            <h4 class="text-base font-bold mb-1">${goal.title}</h4>
            <p class="text-sm"><strong>Date:</strong> ${formatPrettyDate(goal.date)}</p>
            ${
              goal.notes
                ? `<p class="text-sm italic text-gray-300 mt-1">${goal.notes}</p>`
                : ""
            }
            <p class="text-xs mt-2 text-gray-400">Status: ${
              goal.completed ? "✅ Completed" : "🕒 In Progress"
            }</p>
          `;

          const btnGroup = document.createElement("div");
          btnGroup.className = "flex flex-wrap gap-2 mt-3";

          const completeBtn = document.createElement("button");
          completeBtn.textContent = goal.completed ? "Undo Complete" : "Mark Complete";
          completeBtn.className =
            "text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded";
          completeBtn.addEventListener("click", async () => {
            const updated = { ...goal, completed: !goal.completed };
            const res = await fetch(
              `https://avdevplanner.onrender.com/goals/${goal.index}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              }
            );
            if (res.ok) loadGoals();
            else console.error("Failed to update goal");
          });

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.className =
            "text-xs bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded";
          deleteBtn.addEventListener("click", async () => {
            const confirmDelete = confirm("Delete this goal?");
            if (!confirmDelete) return;
            const res = await fetch(
              `https://avdevplanner.onrender.com/goals/${goal.index}`,
              { method: "DELETE" }
            );
            if (res.ok) loadGoals();
            else console.error("Failed to delete goal");
          });

          const editBtn = document.createElement("button");
          editBtn.textContent = "Edit";
          editBtn.className =
            "text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded ml-2";
          editBtn.addEventListener("click", async () => {
            const newTitle = prompt("Edit goal title:", goal.title);
            const newNotes = prompt("Edit notes:", goal.notes || "");
            const newDate = prompt("Edit date (YYYY-MM-DD or 'tomorrow'):", goal.date || "");

            if (newTitle !== null) {
              const updated = {
                ...goal,
                title: newTitle.trim(),
                notes: newNotes.trim(),
                date: parseNaturalDate(newDate.trim()),
              };
              const res = await fetch(
                `https://avdevplanner.onrender.com/goals/${goal.index}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updated),
                }
              );
              if (res.ok) loadGoals();
              else console.error("Failed to update goal");
            }
          });

          btnGroup.appendChild(completeBtn);
          btnGroup.appendChild(deleteBtn);
          btnGroup.appendChild(editBtn);
          card.appendChild(btnGroup);
          grid.appendChild(card);
        });

        groupDiv.appendChild(grid);
        container.appendChild(groupDiv);
      });
  } catch (err) {
    container.innerHTML = "<p class='text-red-500'>Error loading goals.</p>";
    console.error(err);
  }
}

// === HELPERS ===
function parseNaturalDate(dateStr) {
  if (!dateStr) return null;
  const lowered = dateStr.toLowerCase();
  const today = new Date();

  if (lowered === "today") return today.toISOString().split("T")[0];
  if (lowered === "tomorrow") {
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  }

  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : null;
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

// === INIT ===
loadGoals();
