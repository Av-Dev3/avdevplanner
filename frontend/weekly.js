document.addEventListener("DOMContentLoaded", () => {
  const weekRangeEl = document.getElementById("week-range");
  const weeklyDaysContainer = document.getElementById("weekly-days");

  const today = new Date();
  const sunday = new Date(today);
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(today.getDate() - today.getDay());

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  weekRangeEl.textContent = `Week of ${formatDate(sunday)} – ${formatDate(saturday)}`;

  // Generate each day (Sun–Sat)
  for (let i = 0; i < 7; i++) {
    const current = new Date(sunday);
    current.setDate(sunday.getDate() + i);
    const dateStr = current.toISOString().split("T")[0];

    const template = document.getElementById("day-template");
    const clone = template.content.cloneNode(true);

    const toggleBtn = clone.querySelector(".day-toggle");
    toggleBtn.textContent = `${formatWeekday(current)}, ${formatDate(current)}`;

    const dayContent = clone.querySelector(".day-content");
    toggleBtn.addEventListener("click", () => {
      dayContent.classList.toggle("hidden");
    });

    const taskContainer = clone.querySelector(".task-container");
    const goalContainer = clone.querySelector(".goal-container");
    const lessonContainer = clone.querySelector(".lesson-container");

    loadItems("tasks", dateStr, taskContainer, renderTaskCard);
    loadItems("goals", dateStr, goalContainer, renderGoalCard);
    loadItems("lessons", dateStr, lessonContainer, renderLessonCard);

    weeklyDaysContainer.appendChild(clone);
  }

  // Load weekly reflection from localStorage
  loadReflections(sunday.toISOString().split("T")[0]);

  async function loadItems(type, dateStr, container, renderFn) {
    try {
      const res = await fetch(`https://avdevplanner.onrender.com/${type}`);
      const items = await res.json();

      const filtered = items.filter(item => item.date === dateStr);
      container.innerHTML = "";

      if (filtered.length === 0) {
        container.innerHTML = "<p class='text-sm text-gray-400'>No items.</p>";
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
    card.className = "min-w-[250px] bg-[#2b2b2b] p-4 rounded-lg shadow text-white snap-start";
    card.innerHTML = `
      <h3 class="font-semibold">${task.text || task.title}</h3>
      <p class="text-sm">Date: ${task.date}</p>
      <p class="text-sm">Time: ${task.time || "–"}</p>
      <p class="text-sm">Status: ${task.completed ? "✅" : "⏳"}</p>
      ${task.notes ? `<p class="text-sm">Notes: ${task.notes}</p>` : ""}
    `;
    return card;
  }

  function renderGoalCard(goal) {
    const card = document.createElement("div");
    card.className = "min-w-[250px] bg-[#2b2b2b] p-4 rounded-lg shadow text-white snap-start";
    card.innerHTML = `
      <h3 class="font-semibold">${goal.title}</h3>
      <p class="text-sm">Date: ${goal.date || "–"}</p>
      <p class="text-sm">Status: ${goal.completed ? "✅" : "⏳"}</p>
      ${goal.notes ? `<p class="text-sm">Notes: ${goal.notes}</p>` : ""}
    `;
    return card;
  }

  function renderLessonCard(lesson) {
    const card = document.createElement("div");
    card.className = "min-w-[250px] bg-[#2b2b2b] p-4 rounded-lg shadow text-white snap-start";
    card.innerHTML = `
      <h3 class="font-semibold">${lesson.title}</h3>
      <p class="text-sm">Category: ${lesson.category}</p>
      <p class="text-sm">Priority: ${lesson.priority}</p>
      <p class="text-sm">Date: ${lesson.date}</p>
      <p class="text-sm">Status: ${lesson.completed ? "✅" : "⏳"}</p>
      ${lesson.notes ? `<p class="text-sm">Notes: ${lesson.notes}</p>` : ""}
    `;
    return card;
  }

  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    });
  }

  function formatWeekday(d) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  function loadReflections(startDate) {
    const key = `reflection-${startDate}`;
    const textarea = document.getElementById("reflection-textarea");
    const saved = localStorage.getItem(key);
    if (saved) textarea.value = saved;

    document.getElementById("save-reflection").addEventListener("click", () => {
      localStorage.setItem(key, textarea.value.trim());
      alert("Reflection saved!");
    });
  }
});
