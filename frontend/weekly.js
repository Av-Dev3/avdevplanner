document.addEventListener("DOMContentLoaded", () => {
  const rangeEl = document.getElementById("week-range");
  const taskContainer = document.getElementById("weekly-tasks-container");
  const goalContainer = document.getElementById("weekly-goals-container");
  const lessonContainer = document.getElementById("weekly-lessons-container");
  const reflectionsContainer = document.getElementById("weekly-reflections-section");

  const today = new Date();
  const sunday = new Date(today);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(today.getDate() - today.getDay());

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  const startDateStr = sunday.toISOString().split("T")[0];
  const endDateStr = saturday.toISOString().split("T")[0];

  rangeEl.textContent = `Week of ${formatDate(sunday)} – ${formatDate(saturday)}`;

  loadSection("tasks", startDateStr, endDateStr, taskContainer, renderTaskCard);
  loadSection("goals", startDateStr, endDateStr, goalContainer, renderGoalCard);
  loadSection("lessons", startDateStr, endDateStr, lessonContainer, renderLessonCard);
  loadReflections(startDateStr);

  async function loadSection(type, start, end, container, renderFn) {
    try {
      const res = await fetch(`https://avdevplanner.onrender.com/${type}`);
      const items = await res.json();
      const filtered = items.filter(item => {
        const d = new Date(item.date);
        return d >= new Date(start) && d <= new Date(end);
      });

      container.innerHTML = "";

      if (filtered.length === 0) {
        container.innerHTML = "<p>No items for this week.</p>";
      } else {
        filtered.forEach(item => {
          const card = renderFn(item);
          container.appendChild(card);
        });
      }
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
    }
  }

  function renderTaskCard(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <h3>${task.text || task.title}</h3>
      <p><strong>Date:</strong> ${task.date}</p>
      <p><strong>Time:</strong> ${task.time || ""}</p>
      <p><strong>Status:</strong> ${task.completed ? "✅" : "⏳"}</p>
      ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
    `;
    return card;
  }

  function renderGoalCard(goal) {
    const card = document.createElement("div");
    card.className = "goal-card";
    card.innerHTML = `
      <h3>${goal.title}</h3>
      <p><strong>Date:</strong> ${goal.date || ""}</p>
      <p><strong>Status:</strong> ${goal.completed ? "✅" : "⏳"}</p>
      ${goal.notes ? `<p><strong>Notes:</strong> ${goal.notes}</p>` : ""}
    `;
    return card;
  }

  function renderLessonCard(lesson) {
    const card = document.createElement("div");
    card.className = "lesson-card";
    card.innerHTML = `
      <h3>${lesson.title}</h3>
      <p><strong>Category:</strong> ${lesson.category}</p>
      <p><strong>Priority:</strong> ${lesson.priority}</p>
      <p><strong>Date:</strong> ${lesson.date}</p>
      <p><strong>Status:</strong> ${lesson.completed ? "✅" : "⏳"}</p>
      ${lesson.notes ? `<p><strong>Notes:</strong> ${lesson.notes}</p>` : ""}
    `;
    return card;
  }

  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  async function loadReflections(startDate) {
    const reflectionsKey = `reflection-${startDate}`;
    const textarea = document.getElementById("reflection-textarea");
    const saved = localStorage.getItem(reflectionsKey);
    if (saved) textarea.value = saved;

    document.getElementById("save-reflection").addEventListener("click", () => {
      localStorage.setItem(reflectionsKey, textarea.value.trim());
      alert("Reflection saved!");
    });
  }
});
