const form = document.getElementById("lesson-form");
const titleInput = document.getElementById("lesson-title");
const descriptionInput = document.getElementById("lesson-description");
const categoryInput = document.getElementById("lesson-category");
const dateInput = document.getElementById("lesson-date");
const priorityInput = document.getElementById("lesson-priority");
const notesInput = document.getElementById("lesson-notes");
const container = document.getElementById("lessons-container");

loadLessons();

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newLesson = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value.trim(),
    date: parseNaturalDate(dateInput.value),
    priority: priorityInput.value.trim(),
    notes: notesInput.value.trim(),
    completed: false
  };

  const res = await fetch("https://avdevplanner.onrender.com/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLesson)
  });

  if (res.ok) {
    form.reset();
    loadLessons();
  } else {
    console.error("Failed to save lesson");
  }
});

async function loadLessons() {
  container.innerHTML = "";

  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();

    if (lessons.length === 0) {
      container.innerHTML = "<p>No lessons saved yet.</p>";
      return;
    }

    lessons.forEach((lesson, index) => {
      const card = document.createElement("div");
      card.className = "lesson-card";

      const displayDate = formatPrettyDate(parseNaturalDate(lesson.date));

      card.innerHTML = `
        <h3>${lesson.title}</h3>
        <p><strong>Category:</strong> ${lesson.category}</p>
        <p><strong>Date:</strong> ${displayDate || "No date set"}</p>
        <p><strong>Priority:</strong> ${lesson.priority}</p>
        <p>${lesson.description}</p>
        ${lesson.notes ? `<p><em>${lesson.notes}</em></p>` : ""}
        <p><small>Status: ${lesson.completed ? "✅ Completed" : "🕒 In Progress"}</small></p>
        <button class="complete-lesson" data-index="${index}">
          ${lesson.completed ? "Undo Complete" : "Mark Complete"}
        </button>
      `;
      container.appendChild(card);
    });

    document.querySelectorAll(".complete-lesson").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const index = e.target.getAttribute("data-index");
        const lesson = lessons[index];
        const updated = { ...lesson, completed: !lesson.completed };

        const res = await fetch(`https://avdevplanner.onrender.com/lessons/${index}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated)
        });

        if (res.ok) {
          loadLessons();
        } else {
          console.error("Failed to update lesson");
        }
      });
    });

  } catch (err) {
    container.innerHTML = "<p>Error loading lessons.</p>";
    console.error(err);
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
  if (!dateStr || dateStr.length !== 10) return "(Invalid Date)";
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(+year, +month - 1, +day);

  if (isNaN(dateObj.getTime())) return "(Invalid Date)";

  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleString("default", { month: "long" });

  return `${monthName} ${dayNum}`;
}
