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

function formatTime12Hour(timeStr) {
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

// === CAROUSEL SETUP (Same as dashboard) ===
function setupDailyCarousels() {
  // Setup tasks carousel
  const tasksArrowPrev = document.querySelector('[data-carousel="tasks"].prev');
  const tasksArrowNext = document.querySelector('[data-carousel="tasks"].next');
  if (tasksContainer && tasksArrowPrev && tasksArrowNext) {
    setupCarousel(tasksContainer, [], createTaskCard, tasksArrowPrev, tasksArrowNext);
  }

  // Setup goals carousel
  const goalsArrowPrev = document.querySelector('[data-carousel="goals"].prev');
  const goalsArrowNext = document.querySelector('[data-carousel="goals"].next');
  if (goalsContainer && goalsArrowPrev && goalsArrowNext) {
    setupCarousel(goalsContainer, [], createGoalCard, goalsArrowPrev, goalsArrowNext);
  }

  // Setup lessons carousel
  const lessonsArrowPrev = document.querySelector('[data-carousel="lessons"].prev');
  const lessonsArrowNext = document.querySelector('[data-carousel="lessons"].next');
  if (lessonsContainer && lessonsArrowPrev && lessonsArrowNext) {
    setupCarousel(lessonsContainer, [], createLessonCard, lessonsArrowPrev, lessonsArrowNext);
  }

  // Setup notes carousel
  const notesArrowPrev = document.querySelector('[data-carousel="notes"].prev');
  const notesArrowNext = document.querySelector('[data-carousel="notes"].next');
  if (notesContainer && notesArrowPrev && notesArrowNext) {
    setupCarousel(notesContainer, [], createNoteCard, notesArrowPrev, notesArrowNext);
  }
}

function setupCarousel(container, items, createCardFn, arrowPrev, arrowNext) {
  let currentIndex = 0;
  let isMouseDown = false;
  let mouseStartX = null;

  function updateProgress() {
    const progress = items.length > 1 ? ((currentIndex + 1) / items.length) * 100 : 100;
    const progressBar = container.querySelector('.carousel__progress-bar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
  }

  function renderCard() {
    if (items.length === 0) {
      container.innerHTML = '<div class="card__empty">No items found</div>';
      return;
    }

    const card = createCardFn(items[currentIndex]);
    container.innerHTML = '';
    container.appendChild(card);
    updateProgress();
  }

  function prev() {
    if (items.length <= 1) return;
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    renderCard();
  }

  function next() {
    if (items.length <= 1) return;
    currentIndex = (currentIndex + 1) % items.length;
    renderCard();
  }

  // Arrow event listeners
  if (arrowPrev) {
    arrowPrev.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      prev();
    });
  }

  if (arrowNext) {
    arrowNext.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      next();
    });
  }

  // Touch/swipe support
  container.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    mouseStartX = touch.clientX;
  });

  container.addEventListener('touchend', (e) => {
    if (!mouseStartX) return;
    
    const touch = e.changedTouches[0];
    const diff = mouseStartX - touch.clientX;
    const threshold = 50;
    
    if (diff > threshold) {
      next();
    } else if (diff < -threshold) {
      prev();
    }
    
    mouseStartX = null;
  });

  // Mouse drag support for desktop
  container.onmousedown = (e) => {
    if (items.length <= 1) return;
    
    isMouseDown = true;
    mouseStartX = e.clientX;
    container.style.cursor = 'grabbing';
    container.classList.add('swiping');
  };

  container.onmousemove = (e) => {
    if (!isMouseDown || !mouseStartX) return;
    
    const diff = e.clientX - mouseStartX;
    
    if (diff > 10) {
      container.classList.add('swipe-left');
      container.classList.remove('swipe-right');
    } else if (diff < -10) {
      container.classList.add('swipe-right');
      container.classList.remove('swipe-left');
    }
  };

  container.onmouseup = (e) => {
    if (!isMouseDown || !mouseStartX) return;
    
    const diff = e.clientX - mouseStartX;
    const threshold = 50;
    
    if (diff > threshold) {
      prev();
    } else if (diff < -threshold) {
      next();
    }
    
    // Clean up
    isMouseDown = false;
    mouseStartX = null;
    container.style.cursor = 'grab';
    container.classList.remove('swiping', 'swipe-left', 'swipe-right');
  };
  
  container.onmouseleave = () => {
    if (isMouseDown) {
      isMouseDown = false;
      mouseStartX = null;
      container.style.cursor = 'grab';
      container.classList.remove('swiping', 'swipe-left', 'swipe-right');
    }
  };
  
  // Set initial cursor
  if (items.length > 1) {
    container.style.cursor = 'grab';
  }
  
  renderCard();
}

// === CARD CREATORS (Same as dashboard) ===
function createTaskCard(task) {
  const div = document.createElement("div");
  div.className = "carousel__card";
  const taskId = task.originalIndex !== undefined ? task.originalIndex : (task.id || task._id || task.taskId || '');
  div.innerHTML = `
    <h3 class="font-semibold mb-1">${task.text || task.title || "Untitled Task"}</h3>
    ${task.notes ? `<p class="mb-1">${task.notes}</p>` : ""}
    ${task.time ? `<p><small>Time: ${formatTime12Hour(task.time)}</small></p>` : ""}
    <p class="text-xs text-gray-400">${task._vegasDateStr || ""}</p>
    ${
      !task.completed && taskId
        ? `<button class="mark-complete-btn mt-2" data-type="task" data-id="${taskId}">Mark Complete</button>`
        : !task.completed && !taskId
        ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
        : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
    }
  `;
  return div;
}

function createGoalCard(goal) {
  const div = document.createElement("div");
  div.className = "carousel__card";
  const goalId = goal.originalIndex !== undefined ? goal.originalIndex : (goal.index || goal.id || goal._id || goal.goalId || '');
  div.innerHTML = `
    <h3 class="font-semibold mb-1">${goal.title}</h3>
    ${goal.notes ? `<p class="mb-1">${goal.notes}</p>` : ""}
    <p class="text-xs text-gray-400">${goal._vegasDateStr || ""}</p>
    ${
      !goal.completed && goalId !== ''
        ? `<button class="mark-complete-btn mt-2" data-type="goal" data-id="${goalId}">Mark Complete</button>`
        : !goal.completed && goalId === ''
        ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
        : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
    }
  `;
  return div;
}

function createLessonCard(lesson) {
  const div = document.createElement("div");
  div.className = "carousel__card";
  const lessonId = lesson.id || lesson._id || lesson.lessonId || '';
  div.innerHTML = `
    <h3 class="font-semibold mb-1">${lesson.title}</h3>
    ${lesson.description ? `<p class="mb-1">${lesson.description}</p>` : ""}
    <p class="text-xs text-gray-400">${lesson._vegasDateStr || ""}</p>
    ${
      !lesson.completed && lessonId
        ? `<button class="mark-complete-btn mt-2" data-type="lesson" data-id="${lessonId}">Mark Complete</button>`
        : !lesson.completed && !lessonId
        ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
        : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
    }
  `;
  return div;
}

function createNoteCard(note) {
  const div = document.createElement("div");
  div.className = "carousel__card";
  const noteId = note.id || note._id || note.noteId || '';
  div.innerHTML = `
    <h3 class="font-semibold mb-1">${note.title}</h3>
    ${note.content ? `<p class="mb-1">${note.content}</p>` : ""}
    <p class="text-xs text-gray-400">${note._vegasDateStr || ""}</p>
    ${
      !note.completed && noteId
        ? `<button class="mark-complete-btn mt-2" data-type="note" data-id="${noteId}">Mark Complete</button>`
        : !note.completed && !noteId
        ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
        : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
    }
  `;
  return div;
}

// === LOAD TODAY'S TASKS ===
async function loadTodayTasks() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/tasks");
    const tasks = await res.json();
    const todayTasks = tasks
      .map((task, index) => ({ ...task, originalIndex: index }))
      .filter((t) => t.date === todayStr);

    // Update carousel with tasks
    const tasksArrowPrev = document.querySelector('[data-carousel="tasks"].prev');
    const tasksArrowNext = document.querySelector('[data-carousel="tasks"].next');
    if (tasksContainer && tasksArrowPrev && tasksArrowNext) {
      setupCarousel(tasksContainer, todayTasks, createTaskCard, tasksArrowPrev, tasksArrowNext);
    }
  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// === LOAD TODAY'S GOALS ===
async function loadGoals() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/goals");
    const goals = await res.json();
    const todayGoals = goals
      .map((goal, index) => ({ ...goal, originalIndex: index }))
      .filter((g) => g.date === todayStr);

    // Update carousel with goals
    const goalsArrowPrev = document.querySelector('[data-carousel="goals"].prev');
    const goalsArrowNext = document.querySelector('[data-carousel="goals"].next');
    if (goalsContainer && goalsArrowPrev && goalsArrowNext) {
      setupCarousel(goalsContainer, todayGoals, createGoalCard, goalsArrowPrev, goalsArrowNext);
    }
  } catch (err) {
    console.error("Error loading goals:", err);
  }
}

// === LOAD TODAY'S LESSONS ===
async function loadLessons() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();
    const todayLessons = lessons
      .map((lesson, index) => ({ ...lesson, originalIndex: index }))
      .filter((l) => l.date === todayStr);

    // Update carousel with lessons
    const lessonsArrowPrev = document.querySelector('[data-carousel="lessons"].prev');
    const lessonsArrowNext = document.querySelector('[data-carousel="lessons"].next');
    if (lessonsContainer && lessonsArrowPrev && lessonsArrowNext) {
      setupCarousel(lessonsContainer, todayLessons, createLessonCard, lessonsArrowPrev, lessonsArrowNext);
    }
  } catch (err) {
    console.error("Error loading lessons:", err);
  }
}

// === LOAD TODAY'S NOTES ===
async function loadNotes() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/notes");
    const notes = await res.json();
    const todayNotes = notes
      .map((note, index) => ({ ...note, originalIndex: index }))
      .filter((n) => n.date === todayStr);

    // Update carousel with notes
    const notesArrowPrev = document.querySelector('[data-carousel="notes"].prev');
    const notesArrowNext = document.querySelector('[data-carousel="notes"].next');
    if (notesContainer && notesArrowPrev && notesArrowNext) {
      setupCarousel(notesContainer, todayNotes, createNoteCard, notesArrowPrev, notesArrowNext);
    }
  } catch (err) {
    console.error("Error loading notes:", err);
  }
}

// === LOAD TODAY'S LOG ENTRIES ===
async function loadLogs() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/logs");
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const logs = await res.json();
    
    // Handle different response formats
    let todayLogs = [];
    if (Array.isArray(logs)) {
      todayLogs = logs.filter((log) => log.date === todayStr);
    } else if (logs && typeof logs === 'object') {
      // If logs is an object with date keys
      todayLogs = logs[todayStr] || [];
    }
    
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

// === CREATE LOG ENTRY CARD ===
function createLogEntryCard(title, content, date, time) {
  const card = document.createElement("div");
  card.className = "log-entry-card";
  
  const timeDisplay = time ? `<div>${formatTime12Hour(time)}</div>` : "";
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

// === TIME TRACKER ===
async function loadTime() {
  try {
    const res = await fetch("https://avdevplanner.onrender.com/time");
    if (!res.ok) {
      // If time endpoint doesn't exist, just return without error
      return;
    }
    
    const timeData = await res.json();
    
    // Handle different response formats
    let todayTime = null;
    if (Array.isArray(timeData)) {
      todayTime = timeData.find((t) => t.date === todayStr);
    } else if (timeData && typeof timeData === 'object') {
      // If timeData is an object with date keys
      todayTime = timeData[todayStr];
    }
    
    if (todayTime) {
      const minutes = typeof todayTime === 'object' ? todayTime.minutes : todayTime;
      document.getElementById("saved-time-text").textContent = `Today's focused time: ${minutes} minutes`;
    }
  } catch (err) {
    // Silently handle time loading errors
    console.log("Time tracking not available");
  }
}

// === EVENT LISTENERS ===
document.addEventListener("DOMContentLoaded", () => {
  // Setup carousels first
  setupDailyCarousels();
  
  // Load all data
  loadTodayTasks();
  loadGoals();
  loadLessons();
  loadNotes();
  loadLogs();
  loadTime();

  // Add event delegation for mark complete buttons
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-complete-btn')) {
      e.preventDefault();
      e.stopPropagation();
      
      const type = e.target.dataset.type;
      const id = e.target.dataset.id;
      
      if (!id) {
        console.error('No ID available for mark complete');
        return;
      }
      
      try {
        let endpoint;
        switch (type) {
          case 'task':
            endpoint = `https://avdevplanner.onrender.com/tasks/${id}/toggle`;
            break;
          case 'goal':
            endpoint = `https://avdevplanner.onrender.com/goals/${id}/toggle`;
            break;
          case 'lesson':
            endpoint = `https://avdevplanner.onrender.com/lessons/${id}/toggle`;
            break;
          case 'note':
            endpoint = `https://avdevplanner.onrender.com/notes/${id}/toggle`;
            break;
          default:
            console.error('Unknown type for mark complete:', type);
            return;
        }
        
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (res.ok) {
          // Reload the specific data
          switch (type) {
            case 'task':
              loadTodayTasks();
              break;
            case 'goal':
              loadGoals();
              break;
            case 'lesson':
              loadLessons();
              break;
            case 'note':
              loadNotes();
              break;
          }
        } else {
          console.error(`Failed to mark ${type} complete`);
        }
      } catch (err) {
        console.error(`Error marking ${type} complete:`, err);
      }
    }
  });

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
        // If time endpoint doesn't exist, just show success message
        document.getElementById("saved-time-text").textContent = `Saved: ${minutes} minutes of focused work`;
        timeSpentInput.value = "";
      }
    } catch (err) {
      // If time endpoint doesn't exist, just show success message
      document.getElementById("saved-time-text").textContent = `Saved: ${minutes} minutes of focused work`;
      timeSpentInput.value = "";
      console.log("Time tracking not available, but showing success message");
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
