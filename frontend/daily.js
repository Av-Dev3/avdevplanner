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

// Load data on page load
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

// === Load Today's Tasks ===
async function loadTodayTasks() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/tasks");
    const tasks = await res.json();
    const todayTasks = tasks.filter(task => task.date === todayStr);

    tasksContainer.innerHTML = "";

    if (todayTasks.length === 0) {
      tasksContainer.innerHTML = "<p>No tasks for today.</p>";
      return;
    }

    todayTasks.forEach(task => {
      const el = document.createElement("div");
      el.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";

      const formattedTime = task.time
        ? new Date(`1970-01-01T${task.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : "";

      el.innerHTML = `
        <h3>${task.text || task.title || "(Untitled Task)"}</h3>
        <p><strong>Date:</strong> ${task.date || todayStr}</p>
        ${formattedTime ? `<p><strong>Time:</strong> ${formattedTime}</p>` : ""}
        ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
      `;

      tasksContainer.appendChild(el);
    });
  } catch (err) {
    tasksContainer.innerHTML = "<p>Error loading tasks.</p>";
  }
}

// === Load Goals for Today ===
async function loadGoals() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();
    const todayGoals = goals.filter(goal => goal.date === todayStr);

    goalsContainer.innerHTML = "";

    if (todayGoals.length === 0) {
      goalsContainer.innerHTML = "<p>No goals for today.</p>";
      return;
    }

    todayGoals.forEach(goal => {
      const el = document.createElement("div");
      el.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
      el.innerHTML = `
        <h3>${goal.title}</h3>
        ${goal.notes ? `<p><strong>Notes:</strong> ${goal.notes}</p>` : ""}
        <p><small>Date: ${goal.date}</small></p>
      `;
      goalsContainer.appendChild(el);
    });
  } catch (err) {
    goalsContainer.innerHTML = "<p>Error loading goals.</p>";
  }
}

// === Load Lessons for Today ===
async function loadLessons() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();
    const todayLessons = lessons.filter(lesson => lesson.date === todayStr);

    lessonsContainer.innerHTML = "";

    if (todayLessons.length === 0) {
      lessonsContainer.innerHTML = "<p>No lessons for today.</p>";
      return;
    }

    todayLessons.forEach(lesson => {
      const card = document.createElement("div");
      card.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
      card.innerHTML = `
        <h3>${lesson.title}</h3>
        <p><strong>Category:</strong> ${lesson.category || "N/A"}</p>
        <p><strong>Priority:</strong> ${lesson.priority || "Normal"}</p>
        <p>${lesson.description}</p>
        ${lesson.notes ? `<p><em>${lesson.notes}</em></p>` : ""}
      `;
      lessonsContainer.appendChild(card);
    });
  } catch (err) {
    lessonsContainer.innerHTML = "<p>Error loading lessons.</p>";
  }
}

// === Load Notes for Today ===
async function loadNotes() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/notes");
    const notes = await res.json();
    const todayNotes = notes.filter(note => note.date === todayStr);

    notesContainer.innerHTML = "";

    if (todayNotes.length === 0) {
      notesContainer.innerHTML = "<p>No notes for today.</p>";
      return;
    }

    todayNotes.forEach(note => {
      const card = document.createElement("div");
      card.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
      card.innerHTML = `
        <h3>${note.title || "(Untitled Note)"}</h3>
        <p>${note.content || ""}</p>
        <p><small>${note.date}</small></p>
      `;
      notesContainer.appendChild(card);
    });
  } catch (err) {
    notesContainer.innerHTML = "<p>Error loading notes.</p>";
  }
}

// === Personal Daily Log ===
if (logForm) {
  logForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("log-title").value.trim();
    const content = document.getElementById("log-content").value.trim();

    const log = {
      date: todayStr,
      title,
      content,
      timestamp: new Date().toISOString()
    };

    try {
      const res = await fetch("https://avdevplanner.onrender.com/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log)
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

    todayLogs.forEach(log => {
      const card = document.createElement("div");
      card.className = "min-w-[250px] snap-start bg-[#2b2b2b] text-white p-4 rounded-xl shadow";
      card.innerHTML = `
        <h3>${log.title || "(Untitled Log)"}</h3>
        <p>${log.content}</p>
        <p><small>${new Date(log.timestamp).toLocaleString()}</small></p>
      `;
      logEntries.appendChild(card);
    });
  } catch (err) {
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
        body: JSON.stringify({ date: todayStr, minutes })
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
      const res = await fetch(`https://avdevplanner.onrender.com/time`);
      const timeData = await res.json();
      const todayTime = timeData[todayStr];
      if (todayTime) {
        savedTimeText.textContent = `You logged ${todayTime} minutes of focused work today.`;
      }
    } catch (err) {
      console.error("Error loading time data:", err);
    }
  }
}
