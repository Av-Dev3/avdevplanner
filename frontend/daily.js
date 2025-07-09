const tasksContainer = document.getElementById("log-tasks-container");
const goalsContainer = document.getElementById("log-goals-container");
const logForm = document.getElementById("daily-log-form");
const logEntries = document.getElementById("daily-log-entries");

const todayStr = new Date().toLocaleDateString("en-CA");

// Load data on page load
loadTodayTasks();
loadGoals();
loadLogs();

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
      el.className = "task-card";

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

// === Load Weekly Goals ===
async function loadGoals() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();

    goalsContainer.innerHTML = "";

    if (goals.length === 0) {
      goalsContainer.innerHTML = "<p>No weekly goals yet.</p>";
      return;
    }

    goals.forEach(goal => {
      const el = document.createElement("div");
      el.className = "task-card";
      el.innerHTML = `<h3>${goal.title}</h3><p>${goal.notes || ""}</p>`;
      goalsContainer.appendChild(el);
    });
  } catch (err) {
    goalsContainer.innerHTML = "<p>Error loading goals.</p>";
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
      card.className = "task-card";
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
