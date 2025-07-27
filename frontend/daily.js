// === DOM Elements ===
const tasksContainer = document.getElementById("log-tasks-container");
const goalsContainer = document.getElementById("log-goals-container");
const lessonsContainer = document.getElementById("log-lessons-container");
const notesContainer = document.getElementById("log-notes-container");
const logForm = document.getElementById("daily-log-form");
const logEntries = document.getElementById("daily-log-entries");
const todayStr = new Date().toLocaleDateString("en-CA");

// === UTILITY FUNCTIONS ===
function formatPrettyDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const adjusted = hour % 12 === 0 ? 12 : hour % 12;
  return `${adjusted}:${m} ${suffix}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === CREATE DAILY ITEM CARD ===
function createDailyItemCard(title, notes, date, time, type = 'task', completed = false) {
  const card = document.createElement("div");
  card.className = `daily-item-card ${type}-item ${completed ? 'completed' : ''}`;
  
  const timeDisplay = time ? `<div class="item-time">${formatTime(time)}</div>` : "";
  const dateDisplay = date ? `<div class="item-date">${formatPrettyDate(date)}</div>` : "";
  
  card.innerHTML = `
    <h4>${escapeHtml(title)}</h4>
    ${notes ? `<p>${escapeHtml(notes)}</p>` : ""}
    <div class="item-meta">
      ${timeDisplay}
      ${dateDisplay}
    </div>
  `;
  
  return card;
}

// === CREATE LOG ENTRY CARD ===
function createLogEntryCard(title, content, date, time) {
  const card = document.createElement("div");
  card.className = "log-entry-card";
  
  const timeDisplay = time ? `<div>${formatTime(time)}</div>` : "";
  const dateDisplay = date ? `<div>${formatPrettyDate(date)}</div>` : "";
  
  card.innerHTML = `
    <h4>${escapeHtml(title)}</h4>
    <p>${escapeHtml(content)}</p>
    <div class="entry-meta">
      ${timeDisplay}
      ${dateDisplay}
    </div>
  `;
  
  return card;
}

// === LOAD TODAY'S TASKS ===
async function loadTodayTasks() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/tasks");
    const tasks = await res.json();
    const todayTasks = tasks
      .map((task, index) => ({ ...task, index }))
      .filter((t) => t.date === todayStr);
    
    tasksContainer.innerHTML = "";

    if (!todayTasks.length) {
      tasksContainer.innerHTML = `
        <div class="daily-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
          <h3>No Tasks Today</h3>
          <p>Add some tasks to get started</p>
        </div>
      `;
      return;
    }

    todayTasks.forEach((task) => {
      const card = createDailyItemCard(
        task.text || task.title || "Untitled Task",
        task.notes,
        task.prettyDate,
        task.time,
        'task',
        task.completed
      );

      const completeBtn = document.createElement("button");
      completeBtn.textContent = task.completed ? "Undo Complete" : "Mark Complete";
      completeBtn.className = "mark-complete-btn";
      completeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}/toggle`, {
            method: "PATCH",
          });
          if (res.ok) loadTodayTasks();
          else console.error("Failed to update task");
        } catch (err) {
          console.error("Task complete error:", err);
        }
      });

      card.appendChild(completeBtn);
      tasksContainer.appendChild(card);
    });
  } catch (err) {
    tasksContainer.innerHTML = `
      <div class="daily-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3>Error Loading Tasks</h3>
        <p>There was an error loading your tasks</p>
      </div>
    `;
    console.error(err);
  }
}

// === LOAD TODAY'S GOALS ===
async function loadGoals() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();
    const todayGoals = goals
      .map((goal, index) => ({ ...goal, index }))
      .filter((g) => g.date === todayStr);
    
    goalsContainer.innerHTML = "";

    if (!todayGoals.length) {
      goalsContainer.innerHTML = `
        <div class="daily-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <h3>No Goals Today</h3>
          <p>Set some goals to track your progress</p>
        </div>
      `;
      return;
    }

    todayGoals.forEach((goal) => {
      const card = createDailyItemCard(
        goal.text || goal.title || "Untitled Goal",
        goal.notes,
        goal.prettyDate,
        goal.time,
        'goal',
        goal.completed
      );

      const completeBtn = document.createElement("button");
      completeBtn.textContent = goal.completed ? "Undo Complete" : "Mark Complete";
      completeBtn.className = "mark-complete-btn";
      completeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`https://avdevplanner.onrender.com/goals/${goal.index}/toggle`, {
            method: "PATCH",
          });
          if (res.ok) loadGoals();
          else console.error("Failed to update goal");
        } catch (err) {
          console.error("Goal complete error:", err);
        }
      });

      card.appendChild(completeBtn);
      goalsContainer.appendChild(card);
    });
  } catch (err) {
    goalsContainer.innerHTML = `
      <div class="daily-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3>Error Loading Goals</h3>
        <p>There was an error loading your goals</p>
      </div>
    `;
    console.error(err);
  }
}

// === LOAD TODAY'S LESSONS ===
async function loadLessons() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();
    const todayLessons = lessons
      .map((lesson, index) => ({ ...lesson, index }))
      .filter((l) => l.date === todayStr);
    
    lessonsContainer.innerHTML = "";

    if (!todayLessons.length) {
      lessonsContainer.innerHTML = `
        <div class="daily-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
          <h3>No Lessons Today</h3>
          <p>Record what you learned today</p>
        </div>
      `;
      return;
    }

    todayLessons.forEach((lesson) => {
      const card = createDailyItemCard(
        lesson.title || "Untitled Lesson",
        lesson.description || lesson.notes,
        lesson.prettyDate,
        lesson.time,
        'lesson',
        lesson.completed
      );

      const completeBtn = document.createElement("button");
      completeBtn.textContent = lesson.completed ? "Undo Complete" : "Mark Complete";
      completeBtn.className = "mark-complete-btn";
      completeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`https://avdevplanner.onrender.com/lessons/${lesson.index}/toggle`, {
            method: "PATCH",
          });
          if (res.ok) loadLessons();
          else console.error("Failed to update lesson");
        } catch (err) {
          console.error("Lesson complete error:", err);
        }
      });

      card.appendChild(completeBtn);
      lessonsContainer.appendChild(card);
    });
  } catch (err) {
    lessonsContainer.innerHTML = `
      <div class="daily-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3>Error Loading Lessons</h3>
        <p>There was an error loading your lessons</p>
      </div>
    `;
    console.error(err);
  }
}

// === LOAD TODAY'S NOTES ===
async function loadNotes() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/notes");
    const notes = await res.json();
    const todayNotes = notes
      .map((note, index) => ({ ...note, index }))
      .filter((n) => n.date === todayStr);
    
    notesContainer.innerHTML = "";

    if (!todayNotes.length) {
      notesContainer.innerHTML = `
        <div class="daily-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <h3>No Notes Today</h3>
          <p>Add some notes to remember important things</p>
        </div>
      `;
      return;
    }

    todayNotes.forEach((note) => {
      const card = createDailyItemCard(
        note.title || "Untitled Note",
        note.content || note.notes,
        note.prettyDate,
        note.time,
        'note',
        note.completed
      );

      const completeBtn = document.createElement("button");
      completeBtn.textContent = note.completed ? "Undo Complete" : "Mark Complete";
      completeBtn.className = "mark-complete-btn";
      completeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`https://avdevplanner.onrender.com/notes/${note.index}/toggle`, {
            method: "PATCH",
          });
          if (res.ok) loadNotes();
          else console.error("Failed to update note");
        } catch (err) {
          console.error("Note complete error:", err);
        }
      });

      card.appendChild(completeBtn);
      notesContainer.appendChild(card);
    });
  } catch (err) {
    notesContainer.innerHTML = `
      <div class="daily-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3>Error Loading Notes</h3>
        <p>There was an error loading your notes</p>
      </div>
    `;
    console.error(err);
  }
}

// === LOAD TODAY'S LOG ENTRIES ===
async function loadLogs() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/logs");
    const logs = await res.json();
    const todayLogs = logs.filter((log) => log.date === todayStr);
    
    logEntries.innerHTML = "";

    if (!todayLogs.length) {
      logEntries.innerHTML = `
        <div class="daily-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <h3>No Log Entries Today</h3>
          <p>Add a personal log entry to reflect on your day</p>
        </div>
      `;
      return;
    }

    todayLogs.forEach((log) => {
      const card = createLogEntryCard(
        log.title,
        log.content,
        log.prettyDate,
        log.time
      );
      logEntries.appendChild(card);
    });
  } catch (err) {
    logEntries.innerHTML = `
      <div class="daily-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3>Error Loading Logs</h3>
        <p>There was an error loading your log entries</p>
      </div>
    `;
    console.error(err);
  }
}

// === TIME TRACKER ===
async function loadTime() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/time");
    const timeData = await res.json();
    const todayTime = timeData.find((t) => t.date === todayStr);
    
    if (todayTime) {
      document.getElementById("saved-time-text").textContent = `Today's focused time: ${todayTime.minutes} minutes`;
    }
  } catch (err) {
    console.error("Error loading time:", err);
  }
}

// === EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", () => {
  // Load all data
  loadTodayTasks();
  loadGoals();
  loadLessons();
  loadNotes();
  loadLogs();
  loadTime();

  // Time tracker form
  const saveTimeBtn = document.getElementById("save-time-btn");
  const timeSpentInput = document.getElementById("time-spent");
  
  saveTimeBtn.addEventListener("click", async () => {
    const minutes = parseInt(timeSpentInput.value);
    if (!minutes || minutes < 0) {
      alert("Please enter a valid number of minutes");
      return;
    }

    try {
      const res = await fetch("https://avdevplanner.onrender.com/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayStr, minutes }),
      });

      if (res.ok) {
        document.getElementById("saved-time-text").textContent = `Saved: ${minutes} minutes of focused work`;
        timeSpentInput.value = "";
        loadTime();
      } else {
        console.error("Failed to save time");
      }
    } catch (err) {
      console.error("Error saving time:", err);
    }
  });

  // Personal log form
  logForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("log-title").value;
    const content = document.getElementById("log-content").value;
    
    if (!title || !content) {
      alert("Please fill in both title and content");
      return;
    }

    try {
      const res = await fetch("https://avdevplanner.onrender.com/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          date: todayStr,
          time: new Date().toLocaleTimeString("en-CA", { hour12: false }),
        }),
      });

      if (res.ok) {
        logForm.reset();
        loadLogs();
      } else {
        console.error("Failed to save log");
      }
    } catch (err) {
      console.error("Error saving log:", err);
    }
  });

  // Form submissions for popups
  const taskForm = document.getElementById("task-form");
  const goalForm = document.getElementById("goal-form");
  const lessonForm = document.getElementById("lesson-form");
  const noteForm = document.getElementById("note-form");

  // Task form
  taskForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("task-title").value;
    const notes = document.getElementById("task-notes").value;
    const date = document.getElementById("task-date").value;
    const time = document.getElementById("task-time").value;
    
    try {
      const res = await fetch("https://avdevplanner.onrender.com/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: title, notes, date, time }),
      });

      if (res.ok) {
        taskForm.reset();
        document.getElementById("taskPopup").classList.add("hidden");
        loadTodayTasks();
      } else {
        console.error("Failed to save task");
      }
    } catch (err) {
      console.error("Error saving task:", err);
    }
  });

  // Goal form
  goalForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("goal-title").value;
    const notes = document.getElementById("goal-notes").value;
    const date = document.getElementById("goal-date").value;
    const time = document.getElementById("goal-time").value;
    
    try {
      const res = await fetch("https://avdevplanner.onrender.com/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: title, notes, date, time }),
      });

      if (res.ok) {
        goalForm.reset();
        document.getElementById("goalPopup").classList.add("hidden");
        loadGoals();
      } else {
        console.error("Failed to save goal");
      }
    } catch (err) {
      console.error("Error saving goal:", err);
    }
  });

  // Lesson form
  lessonForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("lesson-title").value;
    const description = document.getElementById("lesson-description").value;
    const category = document.getElementById("lesson-category").value;
    const date = document.getElementById("lesson-date").value;
    const priority = document.getElementById("lesson-priority").value;
    const notes = document.getElementById("lesson-notes").value;
    
    try {
      const res = await fetch("https://avdevplanner.onrender.com/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category, date, priority, notes }),
      });

      if (res.ok) {
        lessonForm.reset();
        document.getElementById("lessonPopup").classList.add("hidden");
        loadLessons();
      } else {
        console.error("Failed to save lesson");
      }
    } catch (err) {
      console.error("Error saving lesson:", err);
    }
  });

  // Note form
  noteForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("note-title").value;
    const content = document.getElementById("note-content").value;
    const date = document.getElementById("note-date").value;
    const time = document.getElementById("note-time").value;
    
    try {
      const res = await fetch("https://avdevplanner.onrender.com/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, date, time }),
      });

      if (res.ok) {
        noteForm.reset();
        document.getElementById("notePopup").classList.add("hidden");
        loadNotes();
      } else {
        console.error("Failed to save note");
      }
    } catch (err) {
      console.error("Error saving note:", err);
    }
  });
});
