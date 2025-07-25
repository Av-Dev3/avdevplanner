document.addEventListener("DOMContentLoaded", () => {
  const formPopup = document.getElementById("lesson-form-popup");
  const form = document.getElementById("lesson-form");
  const container = document.getElementById("lessons-container");
  const desktopBtn = document.getElementById("add-lesson-desktop");

  // === LOAD LESSONS ===
  async function loadLessons() {
    container.innerHTML = "";
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();

    const grouped = {};
    lessons.forEach((l) => {
      if (!grouped[l.date]) grouped[l.date] = [];
      grouped[l.date].push(l);
    });

    const sortedDates = Object.keys(grouped).sort();

    sortedDates.forEach((date) => {
      const group = document.createElement("div");
      group.className = "mb-6";
      const dateHeader = document.createElement("h3");
      dateHeader.className = "text-white text-lg font-bold mb-2";
      dateHeader.textContent = formatPrettyDate(date);
      group.appendChild(dateHeader);

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 xl:grid-cols-5 gap-4";

      grouped[date].forEach((lesson) => {
        const card = createLessonCard(lesson);
        grid.appendChild(card);
      });

      group.appendChild(grid);
      container.appendChild(group);
    });
  }

  // === CREATE CARD ===
  function createLessonCard(lesson) {
    const card = document.createElement("div");
    card.className =
      "bg-[#1f1f1f] rounded-lg p-4 shadow text-white flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all";

    card.innerHTML = `
      <h3 class="text-md font-semibold mb-1 break-words">${lesson.title}</h3>
      <p class="text-sm text-gray-400 mb-1"><span class="font-bold">Category:</span> ${lesson.category}</p>
      <p class="text-sm text-gray-400 mb-1"><span class="font-bold">Date:</span> ${formatPrettyDate(lesson.date)}</p>
      <p class="text-sm text-gray-400 mb-1"><span class="font-bold">Priority:</span> ${lesson.priority}</p>
      <p class="text-sm text-gray-400 mb-2">${lesson.description || ""}</p>
      <p class="text-xs text-gray-500 mb-2">Status: ${
        lesson.completed ? "✅ Completed" : "🕓 In Progress"
      }</p>
      <div class="flex gap-2 text-sm mt-auto">
        ${
          !lesson.completed
            ? `<button class="text-green-400 hover:underline complete-btn">Mark Complete</button>`
            : ""
        }
        <button class="text-yellow-400 hover:underline edit-btn">Edit</button>
        <button class="text-red-500 hover:underline delete-btn">Delete</button>
      </div>
    `;

    // Buttons
    const completeBtn = card.querySelector(".complete-btn");
    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    if (completeBtn) {
      completeBtn.addEventListener("click", async () => {
        await fetch(`https://avdevplanner.onrender.com/lessons/${lesson.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: true }),
        });
        loadLessons();
      });
    }

    if (editBtn) {
      editBtn.addEventListener("click", () => {
        form["lesson-title"].value = lesson.title;
        form["lesson-category"].value = lesson.category;
        form["lesson-date"].value = lesson.date;
        form["lesson-priority"].value = lesson.priority;
        form["lesson-description"].value = lesson.description || "";
        form["lesson-notes"].value = lesson.notes || "";
        form.dataset.editing = lesson.id;
        formPopup.classList.remove("hidden");
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        await fetch(`https://avdevplanner.onrender.com/lessons/${lesson.id}`, {
          method: "DELETE",
        });
        loadLessons();
      });
    }

    return card;
  }

  // === FORM SUBMIT ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      title: form["lesson-title"].value,
      category: form["lesson-category"].value,
      date: parseNaturalDate(form["lesson-date"].value),
      priority: form["lesson-priority"].value,
      description: form["lesson-description"].value,
      notes: form["lesson-notes"].value,
      completed: false,
    };

    const isEditing = form.dataset.editing;
    if (isEditing) {
      await fetch(`https://avdevplanner.onrender.com/lessons/${isEditing}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      delete form.dataset.editing;
    } else {
      await fetch("https://avdevplanner.onrender.com/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    form.reset();
    formPopup.classList.add("hidden");
    loadLessons();
  });

  // === DESKTOP BUTTON ===
  if (desktopBtn) {
    desktopBtn.addEventListener("click", () => {
      form.reset();
      delete form.dataset.editing;
      formPopup.classList.remove("hidden");
    });
  }

  // === CLOSE ON BACKDROP CLICK ===
  if (formPopup) {
    formPopup.addEventListener("click", (e) => {
      if (e.target === formPopup) {
        formPopup.classList.add("hidden");
        form.reset();
        delete form.dataset.editing;
      }
    });
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
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
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

  loadLessons();
});
