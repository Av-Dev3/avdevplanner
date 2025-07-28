// === GOALS MANAGEMENT ===

// DOM Elements
const goalForm = document.getElementById("goal-form");
const goalsContainer = document.getElementById("goals-container");
const titleInput = document.getElementById("goal-title");
const notesInput = document.getElementById("goal-notes");
const dateInput = document.getElementById("goal-date");

// === FORM SUBMISSION ===
if (goalForm) {
  goalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newGoal = {
      title: titleInput.value.trim(),
      notes: notesInput.value.trim(),
      date: parseNaturalDate(dateInput.value),
      completed: false,
    };

    try {
      const res = await fetch("https://avdevplanner.onrender.com/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (res.ok) {
        goalForm.reset();
        document.getElementById("goalPopup").classList.add("hidden");
        loadGoals();
        
        // Show success message
        showSuccessMessage("Goal added successfully!");
      } else {
        console.error("Failed to save goal");
        showErrorMessage("Failed to save goal");
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      showErrorMessage("Error saving goal");
    }
  });
}

// === LOAD GOALS ===
async function loadGoals() {
  if (!goalsContainer) return;
  
  goalsContainer.innerHTML = "";

  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();

    if (!goals.length) {
      goalsContainer.innerHTML = `
        <div class="goals-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <h3>No Goals Yet</h3>
          <p>Start by adding your first goal to track your progress and achievements.</p>
        </div>
      `;
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
        groupDiv.className = "goal-date-group";

        const groupTitle = document.createElement("h3");
        groupTitle.textContent = formatPrettyDate(date);
        groupDiv.appendChild(groupTitle);

        const grid = document.createElement("div");
        grid.className = "goals-row";

        grouped[date].forEach((goal) => {
          const card = createGoalCard(goal);
          grid.appendChild(card);
        });

        groupDiv.appendChild(grid);
        goalsContainer.appendChild(groupDiv);
      });
  } catch (err) {
    goalsContainer.innerHTML = `
      <div class="goals-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <h3>Error Loading Goals</h3>
        <p>There was an error loading your goals. Please try again.</p>
      </div>
    `;
    console.error("Error loading goals:", err);
  }
}

// === CREATE GOAL CARD ===
function createGoalCard(goal) {
  const card = document.createElement("div");
  card.className = `goal-card ${goal.completed ? 'completed' : ''}`;

  card.innerHTML = `
    <h4>${goal.title}</h4>
    ${goal.notes ? `<div class="goal-description">${goal.notes}</div>` : ''}
    <div class="goal-meta">
      <div class="goal-meta-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M8 7V3m8 4V3m-9 10h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        ${formatPrettyDate(goal.date)}
      </div>
      <div class="goal-priority ${goal.priority || 'medium'}">
        ${goal.priority || 'medium'}
      </div>
    </div>
    <div class="goal-actions">
      <button class="goal-action-btn complete-btn" data-goal-id="${goal.index}">
        ${goal.completed ? 'Undo Complete' : 'Mark Complete'}
      </button>
      <button class="goal-action-btn edit-btn" data-goal-id="${goal.index}">
        Edit
      </button>
      <button class="goal-action-btn delete-btn" data-goal-id="${goal.index}">
        Delete
      </button>
    </div>
  `;

  // Add event listeners
  const completeBtn = card.querySelector('.complete-btn');
  const editBtn = card.querySelector('.edit-btn');
  const deleteBtn = card.querySelector('.delete-btn');

  completeBtn.addEventListener('click', () => toggleGoalComplete(goal));
  editBtn.addEventListener('click', () => editGoal(goal));
  deleteBtn.addEventListener('click', () => deleteGoal(goal));

  return card;
}

// === GOAL ACTIONS ===
async function toggleGoalComplete(goal) {
  try {
    const updated = { ...goal, completed: !goal.completed };
    const res = await fetch(
      `https://avdevplanner.onrender.com/goals/${goal.index}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }
    );
    
    if (res.ok) {
      loadGoals();
      showSuccessMessage(goal.completed ? "Goal marked as incomplete" : "Goal completed!");
    } else {
      console.error("Failed to update goal");
      showErrorMessage("Failed to update goal");
    }
  } catch (error) {
    console.error("Error updating goal:", error);
    showErrorMessage("Error updating goal");
  }
}

async function editGoal(goal) {
  const newTitle = prompt("Edit goal title:", goal.title);
  if (newTitle === null) return;

  const newNotes = prompt("Edit notes:", goal.notes || "");
  if (newNotes === null) return;

  const newDate = prompt("Edit date (YYYY-MM-DD or 'tomorrow'):", goal.date || "");
  if (newDate === null) return;

  try {
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
    
    if (res.ok) {
      loadGoals();
      showSuccessMessage("Goal updated successfully!");
    } else {
      console.error("Failed to update goal");
      showErrorMessage("Failed to update goal");
    }
  } catch (error) {
    console.error("Error updating goal:", error);
    showErrorMessage("Error updating goal");
  }
}

async function deleteGoal(goal) {
  const confirmDelete = confirm("Are you sure you want to delete this goal?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `https://avdevplanner.onrender.com/goals/${goal.index}`,
      { method: "DELETE" }
    );
    
    if (res.ok) {
      loadGoals();
      showSuccessMessage("Goal deleted successfully!");
    } else {
      console.error("Failed to delete goal");
      showErrorMessage("Failed to delete goal");
    }
  } catch (error) {
    console.error("Error deleting goal:", error);
    showErrorMessage("Error deleting goal");
  }
}

// === UTILITY FUNCTIONS ===
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

// === MESSAGE FUNCTIONS ===
function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement("div");
  successDiv.className = "fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function showErrorMessage(message) {
  // Create a temporary error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  loadGoals();
});
