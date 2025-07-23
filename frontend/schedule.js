document.addEventListener("DOMContentLoaded", () => {
  const scheduleGrid = document.getElementById("schedule-grid");
  const template = document.getElementById("day-template");

  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() + i);
    return date;
  });

  function formatDisplayDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  function getISODate(date) {
    return date.toLocaleDateString("en-CA");
  }

  function formatCardDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${suffix}`;
  }

  function setupSwipeContainer(container) {
    container.classList.add(
      "flex",
      "overflow-x-auto",
      "snap-x",
      "snap-mandatory",
      "scroll-smooth",
      "no-scrollbar",
      "gap-3"
    );
    container.style.scrollbarWidth = "none";
    container.style.msOverflowStyle = "none";
    container.style.overflowY = "hidden";
    container.style.webkitOverflowScrolling = "touch";

    if (window.innerWidth >= 768) {
      container.classList.remove(
        "flex",
        "overflow-x-auto",
        "snap-x",
        "snap-mandatory",
        "scroll-smooth"
      );
      container.style.overflow = "visible";
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
      container.style.gap = "1rem";
    }
  }

  function createCard(title, notes, date, time) {
    const div = document.createElement("div");
    div.className =
      "snap-center shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm";

    const timeDisplay = time ? `<p><small>Time: ${formatTime(time)}</small></p>` : "";
    const dateDisplay = date ? `<p><small>Date: ${formatCardDate(date)}</small></p>` : "";

    div.innerHTML = `
      <h3 class="font-semibold mb-1">${title}</h3>
      ${notes ? `<p class="mb-1">${notes}</p>` : ""}
      ${timeDisplay}
      ${dateDisplay}
    `;
    return div;
  }

  async function createDayCard(dateObj) {
    const isoDate = getISODate(dateObj);
    const displayDate = formatDisplayDate(dateObj);
    const clone = template.content.cloneNode(true);
    const toggle = clone.querySelector(".day-toggle");
    const content = clone.querySelector(".day-content");
    const taskContainer = clone.querySelector(".task-container");
    const goalContainer = clone.querySelector(".goal-container");
    const lessonContainer = clone.querySelector(".lesson-container");
    const noteContainer = clone.querySelector(".note-container");

    toggle.textContent = displayDate;
    toggle.addEventListener("click", () => {
      content.classList.toggle("hidden");
    });

    try {
      const [tasksRes, goalsRes, lessonsRes, notesRes] = await Promise.all([
        fetch("https://avdevplanner.onrender.com/tasks"),
        fetch("https://avdevplanner.onrender.com/goals"),
        fetch("https://avdevplanner.onrender.com/lessons"),
        fetch("https://avdevplanner.onrender.com/notes"),
      ]);

      const tasks = await tasksRes.json();
      const goals = await goalsRes.json();
      const lessons = await lessonsRes.json();
      const notes = await notesRes.json();

      const dayTasks = tasks.filter((t) => t.date === isoDate);
      const dayGoals = goals.filter((g) => g.date === isoDate);
      const dayLessons = lessons.filter((l) => l.date === isoDate);
      const dayNotes = notes.filter((n) => n.date === isoDate);

      if (dayTasks.length === 0) {
        taskContainer.innerHTML = "<p>No tasks.</p>";
      } else {
        dayTasks.forEach((t) => {
          const card = createCard(t.text || t.title, t.notes, t.prettyDate, t.time);
          taskContainer.appendChild(card);
        });
      }

      if (dayGoals.length === 0) {
        goalContainer.innerHTML = "<p>No goals.</p>";
      } else {
        dayGoals.forEach((g) => {
          const card = createCard(g.title, g.notes, g.prettyDate);
          goalContainer.appendChild(card);
        });
      }

      if (dayLessons.length === 0) {
        lessonContainer.innerHTML = "<p>No lessons.</p>";
      } else {
        dayLessons.forEach((l) => {
          const extra = `${l.description || ""}${l.notes ? ` (${l.notes})` : ""}`;
          const card = createCard(
            l.title,
            `Category: ${l.category || "N/A"} | Priority: ${l.priority || "Normal"} | ${extra}`,
            l.prettyDate
          );
          lessonContainer.appendChild(card);
        });
      }

      if (dayNotes.length === 0) {
        noteContainer.innerHTML = "<p>No notes.</p>";
      } else {
        dayNotes.forEach((n) => {
          const card = createCard(n.title, n.content, n.date);
          noteContainer.appendChild(card);
        });
      }

      setupSwipeContainer(taskContainer);
      setupSwipeContainer(goalContainer);
      setupSwipeContainer(lessonContainer);
      setupSwipeContainer(noteContainer);
    } catch (err) {
      console.error("Error loading day content:", err);
    }

    scheduleGrid.appendChild(clone);
  }

  dates.forEach((dateObj) => {
    createDayCard(dateObj);
  });
});
