document.addEventListener("DOMContentLoaded", () => {
  const weekContainer = document.getElementById("weekly-page");
  const rangeEl = document.getElementById("week-range");

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

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sunday);
    currentDate.setDate(sunday.getDate() + i);
    const isoDate = currentDate.toISOString().split("T")[0];
    const displayDate = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const section = document.createElement("section");
    section.className = "bg-[#1f1f1f] text-[#e4e4e7] rounded-xl shadow-lg p-4 flex flex-col gap-3";

    const header = document.createElement("button");
    header.className = "text-left text-[#f0f0f0] text-base font-semibold";
    header.textContent = displayDate;
    header.addEventListener("click", () => {
      document.querySelectorAll(".day-expand").forEach(el => {
        if (el !== content) el.classList.add("hidden");
      });
      content.classList.toggle("hidden");
    });

    const content = document.createElement("div");
    content.className = "day-expand hidden flex flex-col gap-4";

    // Tasks + Goals Grid
    const topGrid = document.createElement("div");
    topGrid.className = "grid grid-cols-2 gap-4";

    const tasksBox = document.createElement("div");
    const goalsBox = document.createElement("div");

    tasksBox.innerHTML = `<h3 class="text-sm sm:text-base text-[#f0f0f0]">Tasks</h3>
      <div class="day-tasks flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3
                  sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:snap-none" data-date="${isoDate}"></div>`;

    goalsBox.innerHTML = `<h3 class="text-sm sm:text-base text-[#f0f0f0]">Goals</h3>
      <div class="day-goals flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3
                  sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:snap-none" data-date="${isoDate}"></div>`;

    topGrid.appendChild(tasksBox);
    topGrid.appendChild(goalsBox);

    const lessonsBox = document.createElement("div");
    lessonsBox.innerHTML = `<h3 class="text-sm sm:text-base text-[#f0f0f0]">Lessons</h3>
      <div class="day-lessons flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar gap-3
                   sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:snap-none" data-date="${isoDate}"></div>`;

    content.appendChild(topGrid);
    content.appendChild(lessonsBox);
    section.appendChild(header);
    section.appendChild(content);
    weekContainer.insertBefore(section, document.getElementById("weekly-reflections-section"));
  }

  loadWeekData("tasks", "day-tasks", renderTaskCard);
  loadWeekData("goals", "day-goals", renderGoalCard);
  loadWeekData("lessons", "day-lessons", renderLessonCard);
  loadReflections(startDateStr);

  async function loadWeekData(type, containerClass, renderFn) {
    try {
      const res = await fetch(`https://avdevplanner.onrender.com/${type}`);
      const items = await res.json();
      document.querySelectorAll(`.${containerClass}`).forEach(container => {
        const date = container.dataset.date;
        const filtered = items.filter(item => item.date === date);
        if (filtered.length === 0) {
          container.innerHTML = "<p class='text-sm text-gray-400'>No entries.</p>";
        } else {
          filtered.forEach(item => container.appendChild(renderFn(item)));
        }
      });
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
    }
  }

  function renderTaskCard(task) {
    const el = document.createElement("div");
    el.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
    const time = task.time
      ? new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : "";
    el.innerHTML = `
      <h3>${task.text || task.title}</h3>
      <p><strong>Date:</strong> ${task.date}</p>
      ${time ? `<p><strong>Time:</strong> ${time}</p>` : ""}
      <p><strong>Status:</strong> ${task.completed ? "✅" : "⏳"}</p>
      ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
    `;
    return el;
  }

  function renderGoalCard(goal) {
    const el = document.createElement("div");
    el.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
    el.innerHTML = `
      <h3>${goal.title}</h3>
      <p><strong>Date:</strong> ${goal.date}</p>
      <p><strong>Status:</strong> ${goal.completed ? "✅" : "⏳"}</p>
      ${goal.notes ? `<p><strong>Notes:</strong> ${goal.notes}</p>` : ""}
    `;
    return el;
  }

  function renderLessonCard(lesson) {
    const el = document.createElement("div");
    el.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
    el.innerHTML = `
      <h3>${lesson.title}</h3>
      <p><strong>Category:</strong> ${lesson.category}</p>
      <p><strong>Priority:</strong> ${lesson.priority}</p>
      <p><strong>Date:</strong> ${lesson.date}</p>
      <p><strong>Status:</strong> ${lesson.completed ? "✅" : "⏳"}</p>
      ${lesson.notes ? `<p><strong>Notes:</strong> ${lesson.notes}</p>` : ""}
    `;
    return el;
  }

  function formatDate(d) {
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
