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

function getVegasTodayPretty() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const today = new Date().toISOString().split("T")[0]; // keep for backend use
const todayPretty = getVegasTodayPretty();
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

  // Parse string as if it's local Vegas date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // no timezone shift
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


function isSameDayInVegas(dateStr, targetDate = new Date()) {
  const parsed = parseNaturalDate(dateStr);
  if (!parsed) return false;

  const vegasToday = new Date(targetDate.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles"
  }));

  return (
    parsed.getFullYear() === vegasToday.getFullYear() &&
    parsed.getMonth() === vegasToday.getMonth() &&
    parsed.getDate() === vegasToday.getDate()
  );
}

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
  const isMobile = window.innerWidth < 768;

  if (isMobile) {
    container.classList.add(
      "flex",
      "overflow-x-auto",
      "snap-x",
      "snap-mandatory",
      "scroll-smooth",
      "no-scrollbar",
      "gap-3"
    );
    container.classList.remove("grid", "grid-cols-2", "lg:grid-cols-3");
  } else {
    container.classList.remove(
      "flex",
      "overflow-x-auto",
      "snap-x",
      "snap-mandatory",
      "scroll-smooth",
      "no-scrollbar"
    );
    container.classList.add("grid", "grid-cols-2", "lg:grid-cols-3");
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
    // Don't mutate the original date — keep raw ISO for filtering
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
    l._vegasDateStr = d ? vegasFormatter.format(d) : null;
  });

  // ✅ Now get today's pretty Vegas date string
  const todayPretty = vegasFormatter.format(new Date());

  console.log("Today's Pretty Date:", todayPretty);
  console.log("All Task Vegas Dates:", tasks.map(t => t._vegasDateStr));

  const todayTasks = tasks.filter(t => t._vegasDateStr === todayPretty);
  const todayGoals = goals.filter(g => g._vegasDateStr === todayPretty);
  const todayLessons = lessons.filter(l => l._vegasDateStr === todayPretty);


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

console.log("Today's Pretty Date:", todayPretty);
console.log("All Task Dates:", tasks.map(t => t.date));
console.log("All Task Dates (Pretty):", tasks.map(t => formatPrettyDate(t.date)));




   todayTasks.forEach((task) =>
  taskContainer.appendChild(
createFullCard(
  task.text || task.title || "Untitled Task",
  task.notes,
  task._vegasDateStr, // ✅ shows the correct Vegas date
  formatTime12Hour(task.time || "")
)

  )
);

   todayGoals.forEach((goal) =>
  goalContainer.appendChild(
    createFullCard(
      goal.title,
      goal.notes,
      goal._vegasDateStr // ✅ properly formatted Vegas date
    )
  )
);

todayLessons.forEach((lesson) =>
  lessonContainer.appendChild(
    createFullCard(
      lesson.title,
      lesson.description || lesson.notes,
      lesson._vegasDateStr // ✅ properly formatted Vegas date
    )
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
