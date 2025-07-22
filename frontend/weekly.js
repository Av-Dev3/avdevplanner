document.addEventListener("DOMContentLoaded", () => {
  const weekRange = document.getElementById("week-range");
  const daysContainer = document.getElementById("weekly-days");
  const whatWentWellInput = document.getElementById("what-went-well");
  const whatToImproveInput = document.getElementById("what-to-improve");
  const saveReflectionBtn = document.getElementById("save-reflection");
  const reflectionsContainer = document.getElementById("saved-reflections");

  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - sunday.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return date;
  });

  const start = formatDate(weekDates[0]);
  const end = formatDate(weekDates[6]);
  const weekId = weekDates[0].toISOString().split("T")[0];

  weekRange.textContent = `Week of ${start} – ${end}`;

  weekDates.forEach((date) => {
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const isoDate = date.toISOString().split("T")[0];
    createDaySection(formatted, isoDate);
  });

  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

  function createFullCard(title, notes, date, time) {
    const div = document.createElement("div");
    div.className =
      "snap-center shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm";

    const timeDisplay = time
      ? `<p><small>Time: ${formatTime(time)}</small></p>`
      : "";
    const dateDisplay = date
      ? `<p><small>Date: ${date}</small></p>`
      : "";

    div.innerHTML = `
      <h3 class="font-semibold mb-1">${title}</h3>
      ${notes ? `<p class="mb-1">${notes}</p>` : ""}
      ${timeDisplay}
      ${dateDisplay}
    `;
    return div;
  }

  function formatTime(timeStr) {
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjusted = hour % 12 === 0 ? 12 : hour % 12;
    return `${adjusted}:${m} ${suffix}`;
  }

  async function createDaySection(dayLabel, isoDate) {
    const template = document.getElementById("day-template");
    const clone = template.content.cloneNode(true);
    const toggle = clone.querySelector(".day-toggle");
    const content = clone.querySelector(".day-content");
    const taskContainer = clone.querySelector(".task-container");
    const goalContainer = clone.querySelector(".goal-container");
    const lessonContainer = clone.querySelector(".lesson-container");

    toggle.textContent = dayLabel;
    toggle.addEventListener("click", () => {
      content.classList.toggle("hidden");
    });

    daysContainer.appendChild(clone);

    try {
      const [tasksRes, goalsRes, lessonsRes] = await Promise.all([
        fetch("https://avdevplanner.onrender.com/tasks"),
        fetch("https://avdevplanner.onrender.com/goals"),
        fetch("https://avdevplanner.onrender.com/lessons"),
      ]);

      const tasks = await tasksRes.json();
      const goals = await goalsRes.json();
      const lessons = await lessonsRes.json();

      const todayTasks = tasks.filter((t) => t.date === isoDate);
      const todayGoals = goals.filter((g) => g.date === isoDate);
      const todayLessons = lessons.filter((l) => l.date === isoDate);

      if (todayTasks.length === 0) {
        taskContainer.innerHTML = "<p>No tasks.</p>";
      } else {
        todayTasks.forEach((t) => {
          const card = createFullCard(t.text || t.title, t.notes, t.date, t.time);
          taskContainer.appendChild(card);
        });
      }

      if (todayGoals.length === 0) {
        goalContainer.innerHTML = "<p>No goals.</p>";
      } else {
        todayGoals.forEach((g) => {
          const card = createFullCard(g.title, g.notes, g.date);
          goalContainer.appendChild(card);
        });
      }

      if (todayLessons.length === 0) {
        lessonContainer.innerHTML = "<p>No lessons.</p>";
      } else {
        todayLessons.forEach((l) => {
          const content = `${l.description || ""}${l.notes ? ` (${l.notes})` : ""}`;
          const card = createFullCard(
            l.title,
            `Category: ${l.category || "N/A"} | Priority: ${l.priority || "Normal"} | ${content}`,
            l.date
          );
          lessonContainer.appendChild(card);
        });
      }

      setupSwipeContainer(taskContainer);
      setupSwipeContainer(goalContainer);
      setupSwipeContainer(lessonContainer);
    } catch (err) {
      console.error("Error loading items:", err);
    }
  }

  async function loadReflections() {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/reflections");
      const reflections = await res.json();

      reflectionsContainer.innerHTML = "";

      for (const [week, data] of Object.entries(reflections)) {
        const div = document.createElement("div");
        div.className =
          "bg-[#2b2b2b] text-white p-4 rounded-md shadow-md text-sm flex flex-col gap-2";
        div.innerHTML = `
          <h3 class="font-semibold text-base">Week of ${week}</h3>
          <p><strong>What went well:</strong> ${data.what_went_well || "—"}</p>
          <p><strong>What to improve:</strong> ${data.what_to_improve || "—"}</p>
        `;
        reflectionsContainer.appendChild(div);
      }
    } catch (err) {
      console.error("Failed to load reflections:", err);
      reflectionsContainer.innerHTML =
        "<p class='text-red-400'>Error loading reflections.</p>";
    }
  }

  saveReflectionBtn.addEventListener("click", async () => {
    const whatWentWell = whatWentWellInput.value.trim();
    const whatToImprove = whatToImproveInput.value.trim();

    if (!whatWentWell && !whatToImprove) return;

    try {
      const res = await fetch("https://avdevplanner.onrender.com/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: weekId,
          what_went_well: whatWentWell,
          what_to_improve: whatToImprove,
        }),
      });

      if (res.ok) {
        whatWentWellInput.value = "";
        whatToImproveInput.value = "";
        await loadReflections();
      } else {
        alert("Error saving reflection.");
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  });

  loadReflections();
});
