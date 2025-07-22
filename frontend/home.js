document.addEventListener("DOMContentLoaded", () => {
  const pinnedContainer = document.getElementById("pinned-notes-container");
  const focusInput = document.getElementById("daily-focus-input");
  const saveBtn = document.getElementById("save-focus-btn");
  const savedFocusText = document.getElementById("saved-focus-text");

  const tasksCompletedEl = document.getElementById("tasks-completed");
  const goalsCompletedEl = document.getElementById("goals-completed");
  const lessonsCompletedEl = document.getElementById("lessons-completed");

  const taskStreakEl = document.getElementById("task-streak");
  const goalStreakEl = document.getElementById("goal-streak");
  const lessonStreakEl = document.getElementById("lesson-streak");

  const taskContainer = document.getElementById("tasks-container");
  const goalContainer = document.getElementById("goals-container");
  const lessonContainer = document.getElementById("lessons-container");

const todayPretty = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric"
});


  function createFullCard(title, notes, date, time) {
  const div = document.createElement("div");
  div.className =
    "snap-center shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm";

  const formattedDate = date || "";
  const formattedTime = time || "";

  div.innerHTML = `
    <h3 class="font-semibold mb-1">${title}</h3>
    ${notes ? `<p class="mb-1">${notes}</p>` : ""}
    ${formattedTime ? `<p><small>Time: ${formattedTime}</small></p>` : ""}
    ${formattedDate ? `<p><small>Date: ${formattedDate}</small></p>` : ""}
  `;
  return div;
}




  function formatTime12Hour(timeStr) {
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const adjustedHour = h % 12 === 0 ? 12 : h % 12;
    return `${adjustedHour}:${minute} ${suffix}`;
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

    // Desktop fallback: use grid layout if screen is wide enough
    if (window.innerWidth >= 768) {
      container.classList.remove("flex", "overflow-x-auto", "snap-x", "snap-mandatory", "scroll-smooth");
      container.style.overflow = "visible";
      container.style.display = "grid";
      container.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
      container.style.gap = "1rem";
    }
  }

  setupSwipeContainer(pinnedContainer);
  fetch("https://avdevplanner.onrender.com/notes")
    .then((res) => res.json())
    .then((notes) => {
      const pinned = notes.filter((note) => note.pinned);
      if (pinned.length === 0) {
        pinnedContainer.innerHTML = "<p>No pinned notes yet.</p>";
        return;
      }
      pinned.forEach((note) => {
        const card = createFullCard(
          note.title,
          note.content,
          note.date || new Date(note.created_at).toLocaleDateString()
        );
        pinnedContainer.appendChild(card);
      });
    })
    .catch((err) => {
      console.error("Failed to load pinned notes", err);
      pinnedContainer.innerHTML = "<p>Error loading pinned notes.</p>";
    });

  fetch(`https://avdevplanner.onrender.com/focus?date=${today}`)
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

    const payload = { date: today, focus };

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

  Promise.all([
    fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/lessons").then((res) =>
      res.json()
    ),
  ]).then(([tasks, goals, lessons]) => {
    const completedTasks = tasks.filter((t) => t.completed);
    const completedGoals = goals.filter((g) => g.completed);
    const completedLessons = lessons.filter((l) => l.completed);

    tasksCompletedEl.textContent = `Tasks Completed: ${completedTasks.length}`;
    goalsCompletedEl.textContent = `Goals Completed: ${completedGoals.length}`;
    lessonsCompletedEl.textContent = `Lessons Completed: ${completedLessons.length}`;

    taskStreakEl.textContent = `Task Streak: ${calculateStreak(
      completedTasks.map((t) => t.date)
    )} day(s)`;
    goalStreakEl.textContent = `Goal Streak: ${calculateStreak(
      completedGoals.map((g) => g.date)
    )} day(s)`;
    lessonStreakEl.textContent = `Lesson Streak: ${calculateStreak(
      completedLessons.map((l) => l.date)
    )} day(s)`;

    setupSwipeContainer(taskContainer);
    setupSwipeContainer(goalContainer);
    setupSwipeContainer(lessonContainer);

    const todayTasks = tasks.filter((t) => t.prettyDate === todayPretty);
const todayGoals = goals.filter((g) => g.prettyDate === todayPretty);
const todayLessons = lessons.filter((l) => l.prettyDate === todayPretty);


   todayTasks.forEach((task) =>
  taskContainer.appendChild(
createFullCard(task.text || task.title || "Untitled Task", task.notes, task.prettyDate, task.prettyTime)
  )
);

    todayGoals.forEach((goal) =>
      goalContainer.appendChild(
createFullCard(goal.title, goal.notes, goal.prettyDate)
      )
    );
    todayLessons.forEach((lesson) =>
      lessonContainer.appendChild(
        createFullCard(lesson.title, lesson.description || lesson.notes, lesson.prettyDate)

      )
    );
  });

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

  // === Submit Task Form ===
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
