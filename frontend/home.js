document.addEventListener("DOMContentLoaded", () => {
  // === DOM Elements ===
  const pinnedContainer = document.getElementById("pinned-notes-container");
  const focusInput = document.getElementById("daily-focus-input");
  const saveBtn = document.getElementById("save-focus-btn");
  const savedFocusText = document.getElementById("saved-focus-text");

  // Stats & streaks card containers (new IDs)
  const statTasksEl = document.getElementById("stat-tasks-completed");
  const statGoalsEl = document.getElementById("stat-goals-completed");
  const statLessonsEl = document.getElementById("stat-lessons-completed");
  const streakTasksEl = document.getElementById("streak-tasks");
  const streakGoalsEl = document.getElementById("streak-goals");
  const streakLessonsEl = document.getElementById("streak-lessons");

  // Carousel containers (new IDs)
  const tasksCarousel = document.getElementById("tasks-carousel-container");
  const goalsCarousel = document.getElementById("goals-carousel-container");
  const lessonsCarousel = document.getElementById("lessons-carousel-container");

  // Date/format helpers
  function getVegasTodayPretty() {
    return new Date().toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  const todayISO = new Date().toISOString().split("T")[0];
  const vegasFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  function parseNaturalDate(dateStr) {
    if (!dateStr) return null;
    const lowered = dateStr.toLowerCase();
    const today = new Date();

    if (lowered === "today") return today;
    if (lowered === "tomorrow") {
      today.setDate(today.getDate() + 1);
      return today;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    const parsed = new Date(dateStr);
    return !isNaN(parsed.getTime()) ? parsed : null;
  }

  function formatPrettyDate(dateStr) {
    const dateObj = parseNaturalDate(dateStr);
    if (!dateObj) return "Invalid Date";
    const vegasDate = new Date(dateObj.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    }));
    return vegasDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function formatTime12Hour(timeStr) {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const adjustedHour = h % 12 === 0 ? 12 : h % 12;
    return `${adjustedHour}:${minute} ${suffix}`;
  }

  // --- Carousel/Swipe Logic ---
  function setupCarousel(container, items, createCardFn, arrowPrev, arrowNext) {
    let idx = 0;
    function renderCard() {
      container.innerHTML = "";
      if (!items.length) {
        container.innerHTML = `<div class="carousel__card card__empty">No items for today.</div>`;
        return;
      }
      container.appendChild(createCardFn(items[idx]));
    }
    function prev() {
      idx = (idx - 1 + items.length) % items.length;
      renderCard();
    }
    function next() {
      idx = (idx + 1) % items.length;
      renderCard();
    }
    if (arrowPrev && arrowNext) {
      arrowPrev.onclick = prev;
      arrowNext.onclick = next;
    }
    let startX = null;
    container.ontouchstart = (e) => { startX = e.touches[0].clientX; };
    container.ontouchend = (e) => {
      if (startX == null) return;
      let diff = e.changedTouches[0].clientX - startX;
      if (diff > 50) prev();
      else if (diff < -50) next();
      startX = null;
    };
    renderCard();
  }

  // --- Mark Complete Helpers ---
  async function markTaskComplete(id) {
    const res = await fetch(`https://avdevplanner.onrender.com/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    if (res.ok) location.reload();
    else alert("Error marking task complete.");
  }
  async function markGoalComplete(id) {
    const res = await fetch(`https://avdevplanner.onrender.com/goals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    if (res.ok) location.reload();
    else alert("Error marking goal complete.");
  }
  async function markLessonComplete(id) {
    const res = await fetch(`https://avdevplanner.onrender.com/lessons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    if (res.ok) location.reload();
    else alert("Error marking lesson complete.");
  }

  // --- Card Creators (with mark complete button) ---
  function createTaskCard(task) {
    const div = document.createElement("div");
    div.className = "carousel__card";
    div.innerHTML = `
      <h3 class="font-semibold mb-1">${task.text || task.title || "Untitled Task"}</h3>
      ${task.notes ? `<p class="mb-1">${task.notes}</p>` : ""}
      ${task.time ? `<p><small>Time: ${formatTime12Hour(task.time)}</small></p>` : ""}
      <p class="text-xs text-gray-400">${task._vegasDateStr || ""}</p>
      ${
        !task.completed
          ? `<button class="complete-btn mt-2" data-id="${task.id}">Mark Complete</button>`
          : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
      }
    `;
    setTimeout(() => {
      const btn = div.querySelector('.complete-btn');
      if (btn) btn.onclick = () => markTaskComplete(task.id);
    }, 0);
    return div;
  }

  function createGoalCard(goal) {
    const div = document.createElement("div");
    div.className = "carousel__card";
    div.innerHTML = `
      <h3 class="font-semibold mb-1">${goal.title}</h3>
      ${goal.notes ? `<p class="mb-1">${goal.notes}</p>` : ""}
      <p class="text-xs text-gray-400">${goal._vegasDateStr || ""}</p>
      ${
        !goal.completed
          ? `<button class="complete-btn mt-2" data-id="${goal.id}">Mark Complete</button>`
          : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
      }
    `;
    setTimeout(() => {
      const btn = div.querySelector('.complete-btn');
      if (btn) btn.onclick = () => markGoalComplete(goal.id);
    }, 0);
    return div;
  }

  function createLessonCard(lesson) {
    const div = document.createElement("div");
    div.className = "carousel__card";
    div.innerHTML = `
      <h3 class="font-semibold mb-1">${lesson.title}</h3>
      ${lesson.description ? `<p class="mb-1">${lesson.description}</p>` : ""}
      <p class="text-xs text-gray-400">${lesson._vegasDateStr || ""}</p>
      ${
        !lesson.completed
          ? `<button class="complete-btn mt-2" data-id="${lesson.id}">Mark Complete</button>`
          : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
      }
    `;
    setTimeout(() => {
      const btn = div.querySelector('.complete-btn');
      if (btn) btn.onclick = () => markLessonComplete(lesson.id);
    }, 0);
    return div;
  }

  // --- Stats/Streaks Calculation ---
  function calculateStreak(datesArray) {
    if (!datesArray.length) return 0;
    const uniqueDates = [...new Set(datesArray)];
    const sortedDates = uniqueDates
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b - a);
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    for (let d of sortedDates) {
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // === PINNED NOTES ===
  fetch("https://avdevplanner.onrender.com/notes")
    .then((res) => res.json())
    .then((notes) => {
      const pinned = notes.filter((note) => note.pinned);
      pinnedContainer.innerHTML = "";
      if (pinned.length === 0) {
        pinnedContainer.innerHTML = "<p>No pinned notes yet.</p>";
        return;
      }
      pinned.forEach((note) => {
        const card = document.createElement("div");
        card.className = "pinned-note-card";
        card.innerHTML = `
          <div class="font-semibold">${note.title}</div>
          <div class="text-sm">${note.content}</div>
          <div class="text-xs text-gray-400">${note.date || new Date(note.created_at).toLocaleDateString()}</div>
        `;
        pinnedContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Failed to load pinned notes", err);
      pinnedContainer.innerHTML = "<p>Error loading pinned notes.</p>";
    });

  // === DAILY FOCUS ===
  fetch(`https://avdevplanner.onrender.com/focus?date=${todayISO}`)
    .then((res) => {
      if (!res.ok) throw new Error("No focus found");
      return res.json();
    })
    .then((data) => {
      focusInput.value = data.focus || "";
      savedFocusText.textContent = data.focus
        ? `Saved focus: ${data.focus}`
        : "";
    })
    .catch(() => {
      savedFocusText.textContent = "No focus saved yet.";
    });

  saveBtn.addEventListener("click", async () => {
    const focus = focusInput.value.trim();
    if (!focus) return alert("Please enter a focus.");
    const payload = { date: todayISO, focus };
    const res = await fetch("https://avdevplanner.onrender.com/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      savedFocusText.textContent = `Saved focus: ${focus}`;
    } else {
      console.error("Failed to save focus");
      savedFocusText.textContent = "Error saving focus.";
    }
  });

  // === LOAD DATA & RENDER DASHBOARD ===
  Promise.all([
    fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/lessons").then((res) => res.json()),
  ]).then(([tasks, goals, lessons]) => {
    tasks.forEach(t => {
      const d = parseNaturalDate(t.date);
      t._vegasDateStr = d ? vegasFormatter.format(d) : null;
    });
    goals.forEach(g => {
      const d = parseNaturalDate(g.date);
      g._vegasDateStr = d ? vegasFormatter.format(d) : null;
    });
    lessons.forEach(l => {
      const d = parseNaturalDate(l.date);
      l._vegasDateStr = d ? vegasFormatter.format(l.date) : null;
    });
    const todayPretty = vegasFormatter.format(new Date());

    // === STATS CARDS ===
    statTasksEl.innerHTML = `
      <div class="card__header"><span class="card__title">Tasks Completed</span></div>
      <div class="card__stat-value">${tasks.filter((t) => t.completed && t._vegasDateStr === todayPretty).length}</div>
    `;
    statGoalsEl.innerHTML = `
      <div class="card__header"><span class="card__title">Goals Completed</span></div>
      <div class="card__stat-value">${goals.filter((g) => g.completed && g._vegasDateStr === todayPretty).length}</div>
    `;
    statLessonsEl.innerHTML = `
      <div class="card__header"><span class="card__title">Lessons Completed</span></div>
      <div class="card__stat-value">${lessons.filter((l) => l.completed && l._vegasDateStr === todayPretty).length}</div>
    `;
    // === STREAKS CARDS ===
    streakTasksEl.innerHTML = `
      <div class="card__header"><span class="card__title">Task Streak</span></div>
      <div class="card__stat-value">${calculateStreak(tasks.filter((t) => t.completed).map((t) => t.date))} days</div>
    `;
    streakGoalsEl.innerHTML = `
      <div class="card__header"><span class="card__title">Goal Streak</span></div>
      <div class="card__stat-value">${calculateStreak(goals.filter((g) => g.completed).map((g) => g.date))} days</div>
    `;
    streakLessonsEl.innerHTML = `
      <div class="card__header"><span class="card__title">Lesson Streak</span></div>
      <div class="card__stat-value">${calculateStreak(lessons.filter((l) => l.completed).map((l) => l.date))} days</div>
    `;

    // === CAROUSEL SETUP (one card at a time, arrows/swipe) ===
    const todayTasks = tasks.filter(t => t._vegasDateStr === todayPretty);
    const todayGoals = goals.filter(g => g._vegasDateStr === todayPretty);
    const todayLessons = lessons.filter(l => l._vegasDateStr === todayPretty);

    // Arrow buttons for each carousel
    const tasksPrev = document.querySelector('.carousel-arrow.prev[data-carousel="tasks"]');
    const tasksNext = document.querySelector('.carousel-arrow.next[data-carousel="tasks"]');
    const goalsPrev = document.querySelector('.carousel-arrow.prev[data-carousel="goals"]');
    const goalsNext = document.querySelector('.carousel-arrow.next[data-carousel="goals"]');
    const lessonsPrev = document.querySelector('.carousel-arrow.prev[data-carousel="lessons"]');
    const lessonsNext = document.querySelector('.carousel-arrow.next[data-carousel="lessons"]');

    setupCarousel(tasksCarousel, todayTasks, createTaskCard, tasksPrev, tasksNext);
    setupCarousel(goalsCarousel, todayGoals, createGoalCard, goalsPrev, goalsNext);
    setupCarousel(lessonsCarousel, todayLessons, createLessonCard, lessonsPrev, lessonsNext);
  });

  // === FORM SUBMITS (keep as-is, triggers popups) ===
  const taskForm = document.getElementById("task-form");
  if (taskForm) {
    taskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const task = {
        title: document.getElementById("task-text").value,
        date: document.getElementById("task-date").value,
        time: document.getElementById("task-time").value,
        notes: document.getElementById("task-notes").value,
      };
      const res = await fetch("https://avdevplanner.onrender.com/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        alert("Task added!");
        taskForm.reset();
        document.getElementById("taskPopup").classList.add("hidden");
      } else {
        alert("Error adding task.");
      }
    });
  }
  const goalForm = document.getElementById("weekly-goal-form");
  if (goalForm) {
    goalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const goal = {
        title: document.getElementById("goal-title").value,
        date: document.getElementById("goal-date").value,
        notes: document.getElementById("goal-notes").value,
      };
      const res = await fetch("https://avdevplanner.onrender.com/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (res.ok) {
        alert("Goal added!");
        goalForm.reset();
        document.getElementById("goalPopup").classList.add("hidden");
      } else {
        alert("Error adding goal.");
      }
    });
  }
  const lessonForm = document.getElementById("lesson-form");
  if (lessonForm) {
    lessonForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const lesson = {
        title: document.getElementById("lesson-title").value,
        description: document.getElementById("lesson-description").value,
        category: document.getElementById("lesson-category").value,
        date: document.getElementById("lesson-date").value,
        priority: document.getElementById("lesson-priority").value,
        notes: document.getElementById("lesson-notes").value,
      };
      const res = await fetch("https://avdevplanner.onrender.com/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lesson),
      });
      if (res.ok) {
        alert("Lesson added!");
        lessonForm.reset();
        document.getElementById("lessonPopup").classList.add("hidden");
      } else {
        alert("Error adding lesson.");
      }
    });
  }
});
