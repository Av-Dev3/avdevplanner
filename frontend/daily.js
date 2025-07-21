const tasksContainer = document.getElementById("log-tasks-container");
const goalsContainer = document.getElementById("log-goals-container");
const lessonsContainer = document.getElementById("log-lessons-container");
const notesContainer = document.getElementById("log-notes-container");
const logForm = document.getElementById("daily-log-form");
const logEntries = document.getElementById("daily-log-entries");

const todayStr = new Date().toLocaleDateString("en-CA");

// === Setup Swipe Behavior (like homepage) ===
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

// === Card Builder (matches homepage card style) ===
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

// === Load Everything ===
loadTodayTasks();
loadGoals();
loadLessons();
loadNotes();
loadLogs();

setupSwipeContainer(tasksContainer);
setupSwipeContainer(goalsContainer);
setupSwipeContainer(lessonsContainer);
setupSwipeContainer(notesContainer);
setupSwipeContainer(logEntries);

// === Load Tasks ===
async function loadTodayTasks() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/tasks");
    const tasks = await res.json();
    const todayTasks = tasks.filter((t) => t.date === todayStr);
    tasksContainer.innerHTML = "";

    if (todayTasks.length === 0) {
      tasksContainer.innerHTML = "<p>No tasks for today.</p>";
      return;
    }

    todayTasks.forEach((task) => {
      const card = createFullCard(
        task.text || task.title || "Untitled Task",
        task.notes,
        task.date,
        task.time
      );
      tasksContainer.appendChild(card);
    });
  } catch {
    tasksContainer.innerHTML = "<p>Error loading tasks.</p>";
  }
}

// === Load Goals ===
async function loadGoals() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();
    const todayGoals = goals.filter((g) => g.date === todayStr);
    goalsContainer.innerHTML = "";

    if (todayGoals.length === 0) {
      goalsContainer.innerHTML = "<p>No goals for today.</p>";
      return;
    }

    todayGoals.forEach((goal) => {
      const card = createFullCard(goal.title, goal.notes, goal.date);
      goalsContainer.appendChild(card);
    });
  } catch {
    goalsContainer.innerHTML = "<p>Error loading goals.</p>";
  }
}

// === Load Lessons ===
async function loadLessons() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();
    const todayLessons = lessons.filter((l) => l.date === todayStr);
    lessonsContainer.innerHTML = "";

    if (todayLessons.length === 0) {
      lessonsContainer.innerHTML = "<p>No lessons for today.</p>";
      return;
    }

    todayLessons.forEach((lesson) => {
      const content = `${lesson.description || ""}${
        lesson.notes ? ` (${lesson.notes})` : ""
      }`;
      const card = createFullCard(
        lesson.title,
        `Category: ${lesson.category || "N/A"} | Priority: ${lesson.priority || "Normal"} | ${content}`,
        lesson.date
      );
      lessonsContainer.appendChild(card);
    });
  } catch {
    lessonsContainer.innerHTML = "<p>Error loading lessons.</p>";
  }
}

// === Load Notes ===
async function loadNotes() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/notes");
    const notes = await res.json();
    const todayNotes = notes.filter((n) => n.date === todayStr);
    notesContainer.innerHTML = "";

    if (todayNotes.length === 0) {
      notesContainer.innerHTML = "<p>No notes for today.</p>";
      return;
    }

    todayNotes.forEach((note) => {
      const card = createFullCard(note.title, note.content, note.date);
      notesContainer.appendChild(card);
    });
  } catch {
    notesContainer.innerHTML = "<p>Error loading notes.</p>";
  }
}

// === Log Form ===
if (logForm) {
  logForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("log-title").value.trim();
    const content = document.getElementById("log-content").value.trim();

    const log = {
      date: todayStr,
      title,
      content,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch("https://avdevplanner.onrender.com/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log),
      });

      if (res.ok) {
        logForm.reset();
        loadLogs();
      } else {
        console.error("Log POST error:", await res.text());
      }
    } catch (err) {
      console.error("Submit failed:", err);
    }
  });
}

// === Load Logs ===
async function loadLogs() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/logs");
    const logs = await res.json();
    const todayLogs = logs[todayStr] || [];
    logEntries.innerHTML = "";

    if (todayLogs.length === 0) {
      logEntries.innerHTML = "<p>No personal logs for today.</p>";
      return;
    }

    todayLogs.forEach((log) => {
      const card = createFullCard(
        log.title,
        log.content,
        new Date(log.timestamp).toLocaleDateString()
      );
      logEntries.appendChild(card);
    });
  } catch {
    logEntries.innerHTML = "<p>Error loading logs.</p>";
  }
}

// === Time Tracker ===
const saveTimeBtn = document.getElementById("save-time-btn");
const timeInput = document.getElementById("time-spent");
const savedTimeText = document.getElementById("saved-time-text");

if (saveTimeBtn && timeInput && savedTimeText) {
  loadTime();

  saveTimeBtn.addEventListener("click", async () => {
    const minutes = parseInt(timeInput.value);
    if (isNaN(minutes) || minutes < 0) {
      savedTimeText.textContent = "Please enter a valid number of minutes.";
      return;
    }

    try {
      const res = await fetch("https://avdevplanner.onrender.com/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr, minutes }),
      });

      if (res.ok) {
        savedTimeText.textContent = `Saved: ${minutes} minutes of focused work.`;
        timeInput.value = "";
      } else {
        savedTimeText.textContent = "Error saving time.";
      }
    } catch (err) {
      savedTimeText.textContent = "Failed to save time.";
      console.error(err);
    }
  });

  async function loadTime() {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/time");
      const data = await res.json();
      const todayTime = data[todayStr];
      if (todayTime) {
        savedTimeText.textContent = `You logged ${todayTime} minutes of focused work today.`;
      }
    } catch (err) {
      console.error("Error loading time data:", err);
    }
  }
}
