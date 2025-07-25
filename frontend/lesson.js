// === ELEMENTS ===
const form = document.getElementById("lesson-form");
const titleInput = document.getElementById("lesson-title");
const descriptionInput = document.getElementById("lesson-description");
const categoryInput = document.getElementById("lesson-category");
const dateInput = document.getElementById("lesson-date");
const priorityInput = document.getElementById("lesson-priority");
const notesInput = document.getElementById("lesson-notes");
const container = document.getElementById("lessons-container");
const addLessonDesktopBtn = document.getElementById("add-lesson-desktop");
const lessonFormPopup = document.getElementById("lesson-form-popup");

// === EVENT: Desktop FAB opens popup ===
if (addLessonDesktopBtn && lessonFormPopup) {
  addLessonDesktopBtn.addEventListener("click", () => {
    lessonFormPopup.classList.remove("hidden");
  });

  lessonFormPopup.addEventListener("click", (e) => {
    if (e.target === lessonFormPopup) {
      lessonFormPopup.classList.add("hidden");
    }
  });
}

// === FORM SUBMIT ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newLesson = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value.trim(),
    date: parseNaturalDate(dateInput.value),
    priority: priorityInput.value.trim(),
    notes: notesInput.value.trim(),
    completed: false,
  };

  const res = await fetch("https://avdevplanner.onrender.com/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newLesson),
  });

  if (res.ok) {
    form.reset();
    lessonFormPopup?.classList.add("hidden");
    loadLessons();
  } else {
    console.error("Failed to save lesson");
  }
});

// === LOAD LESSONS ===
async function loadLessons() {
  container.innerHTML = "";
  container.classList.add("mt-4");

  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();

    if (lessons.length === 0) {
      container.innerHTML = "<p class='text-white'>No lessons saved yet.</p>";
      return;
    }

    // Group lessons by date
    const grouped = {};
    lessons.forEach((lesson) => {
      const dateKey = parseNaturalDate(lesson.date);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(lesson);
    });

    Object.keys(grouped)
      .sort()
      .forEach((date) => {
        const groupDiv = document.createElement("div");

        const title = document.createElement("h3");
        title.className = "text-lg font-semibold text-white mb-2";
        title.textContent = formatPrettyDate(date);
        groupDiv.appendChild(title);

        const grid = document.createElement("div");
        grid.className = "grid grid-cols-2 xl:grid-cols-5 gap-4";

        grouped[date].forEach((lesson) => {
          const card = document.createElement("div");
          card.className =
"bg-[#1f1f1f] text-white p-4 rounded-lg shadow transition-all transform hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(76,142,218,0.35)]"

          card.innerHTML = `
            <h4 class="text-base font-bold mb-1">${lesson.title}</h4>
            <p class="text-sm"><strong>Category:</strong> ${lesson.category}</p>
            <p class="text-sm"><strong>Date:</strong> ${formatPrettyDate(
              lesson.date
            )}</p>
            <p class="text-sm"><strong>Priority:</strong> ${lesson.priority}</p>
            <p class="text-sm">${lesson.description}</p>
            ${
              lesson.notes
                ? `<p class="text-xs italic text-gray-300">${lesson.notes}</p>`
                : ""
            }
            <p class="text-xs mt-1 text-gray-400">Status: ${
              lesson.completed ? "✅ Completed" : "🕒 In Progress"
            }</p>
          `;

          // Buttons
          const btnGroup = document.createElement("div");
          btnGroup.className = "flex justify-between mt-3";

          const completeBtn = document.createElement("button");
          completeBtn.textContent = lesson.completed
            ? "Undo Complete"
            : "Mark Complete";
          completeBtn.className =
            "text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded";
          completeBtn.addEventListener("click", async () => {
            const updated = { ...lesson, completed: !lesson.completed };
            const res = await fetch(
              `https://avdevplanner.onrender.com/lessons/${lesson.id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
              }
            );
            if (res.ok) loadLessons();
            else console.error("Failed to update lesson");
          });

          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Delete";
          deleteBtn.className =
            "text-xs bg-red-700 hover:bg-red-800 text-white px-2 py-1 rounded";
          deleteBtn.addEventListener("click", async () => {
            const confirmDelete = confirm("Delete this lesson?");
            if (!confirmDelete) return;

            const res = await fetch(
              `https://avdevplanner.onrender.com/lessons/${lesson.id}`,
              {
                method: "DELETE",
              }
            );
            if (res.ok) loadLessons();
            else console.error("Failed to delete lesson");
          });

          btnGroup.appendChild(completeBtn);
          btnGroup.appendChild(deleteBtn);
          card.appendChild(btnGroup);

          grid.appendChild(card);
        });

        groupDiv.appendChild(grid);
        container.appendChild(groupDiv);
      });
  } catch (err) {
    container.innerHTML =
      "<p class='text-red-500'>Error loading lessons.</p>";
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
  if (!dateStr || dateStr.length !== 10) return "(Invalid Date)";
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(+year, +month - 1, +day);
  if (isNaN(dateObj.getTime())) return "(Invalid Date)";
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleString("default", { month: "long" });
  return `${monthName} ${dayNum}`;
}

// === INIT ===
loadLessons();
