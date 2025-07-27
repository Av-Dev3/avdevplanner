// === ELEMENTS ===
const lessonForm = document.getElementById("lesson-form");
const titleInput = document.getElementById("lesson-title");
const descriptionInput = document.getElementById("lesson-description");
const categoryInput = document.getElementById("lesson-category");
const dateInput = document.getElementById("lesson-date");
const priorityInput = document.getElementById("lesson-priority");
const notesInput = document.getElementById("lesson-notes");
const lessonsContainer = document.getElementById("lessons-container");
const lessonPopup = document.getElementById("lessonPopup");

// === FORM SUBMIT ===
lessonForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newLesson = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    category: categoryInput.value.trim(),
    date: parseNaturalDate(dateInput.value),
    priority: priorityInput.value.trim(),
    notes: notesInput.value.trim(),
    completed: false,
  };

  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLesson),
    });

    if (res.ok) {
      lessonForm.reset();
      lessonPopup?.classList.add("hidden");
      loadLessons();
    } else {
      console.error("Failed to save lesson");
    }
  } catch (error) {
    console.error("Error saving lesson:", error);
  }
});

// === LOAD LESSONS ===
async function loadLessons() {
  lessonsContainer.innerHTML = "";
  
  // Removed loading state - no more yellow circle

  try {
    const res = await fetch("https://avdevplanner.onrender.com/lessons");
    const lessons = await res.json();

    if (lessons.length === 0) {
      lessonsContainer.innerHTML = `
        <div class="lessons-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>No Lessons Yet</h3>
          <p>Start tracking your learning journey by adding your first lesson.</p>
        </div>
      `;
      return;
    }

    // Group lessons by date
    const grouped = {};
    lessons.forEach((lesson) => {
      const dateKey = parseNaturalDate(lesson.date);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(lesson);
    });

    Object.keys(grouped)
      .sort()
      .reverse() // Show most recent first
      .forEach((date) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "lesson-date-group";

        const title = document.createElement("h3");
        title.textContent = formatPrettyDate(date);
        groupDiv.appendChild(title);

        const grid = document.createElement("div");
        grid.className = "lessons-row";

        grouped[date].forEach((lesson) => {
          const card = createLessonCard(lesson);
          grid.appendChild(card);
        });

        groupDiv.appendChild(grid);
        lessonsContainer.appendChild(groupDiv);
      });
  } catch (err) {
    lessonsContainer.innerHTML = `
      <div class="lessons-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>Error Loading Lessons</h3>
        <p>There was an error loading your lessons. Please try again.</p>
      </div>
    `;
    console.error(err);
  }
}

// === CREATE LESSON CARD ===
function createLessonCard(lesson) {
  const card = document.createElement("div");
  card.className = `lesson-card ${lesson.completed ? 'completed' : ''}`;
  card.setAttribute('data-lesson-id', lesson.id || lesson._id);

  const priorityClass = getPriorityClass(lesson.priority);
  
  card.innerHTML = `
    <h4>${escapeHtml(lesson.title)}</h4>
    ${lesson.category ? `<span class="lesson-category">${escapeHtml(lesson.category)}</span>` : ''}
    ${lesson.description ? `<p class="lesson-description">${escapeHtml(lesson.description)}</p>` : ''}
    
    <div class="lesson-meta">
      <div class="lesson-meta-item">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 7V3m8 4V3m-9 10h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${formatPrettyDate(lesson.date)}
      </div>
      ${lesson.priority ? `<span class="lesson-priority ${priorityClass}">${escapeHtml(lesson.priority)}</span>` : ''}
    </div>
    
    ${lesson.notes ? `<div class="lesson-notes">${escapeHtml(lesson.notes)}</div>` : ''}
    
    <div class="lesson-actions">
      <button class="lesson-action-btn complete-btn" data-lesson-id="${lesson.id || lesson._id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        ${lesson.completed ? 'Undo Complete' : 'Mark Complete'}
      </button>
      <button class="lesson-action-btn delete" data-lesson-id="${lesson.id || lesson._id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Delete
      </button>
    </div>
  `;

  // Add event listeners
  const completeBtn = card.querySelector('.complete-btn');
  const deleteBtn = card.querySelector('.delete');

  completeBtn.addEventListener('click', async () => {
    await toggleLessonComplete(lesson);
  });

  deleteBtn.addEventListener('click', async () => {
    await deleteLesson(lesson);
  });

  return card;
}

// === TOGGLE LESSON COMPLETE ===
async function toggleLessonComplete(lesson) {
  try {
    const updated = { ...lesson, completed: !lesson.completed };
    const res = await fetch(
      `https://avdevplanner.onrender.com/lessons/${lesson.id || lesson._id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }
    );
    
    if (res.ok) {
      loadLessons();
    } else {
      console.error("Failed to update lesson");
    }
  } catch (error) {
    console.error("Error updating lesson:", error);
  }
}

// === DELETE LESSON ===
async function deleteLesson(lesson) {
  const confirmDelete = confirm("Are you sure you want to delete this lesson?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `https://avdevplanner.onrender.com/lessons/${lesson.id || lesson._id}`,
      {
        method: "DELETE",
      }
    );
    
    if (res.ok) {
      loadLessons();
    } else {
      console.error("Failed to delete lesson");
    }
  } catch (error) {
    console.error("Error deleting lesson:", error);
  }
}

// === HELPERS ===
function parseNaturalDate(dateStr) {
  if (!dateStr) return null;
  const lowered = dateStr.toLowerCase();
  const today = new Date();

  if (lowered === "today") return today.toISOString().split("T")[0];
  if (lowered === "tomorrow") {
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  }

  const parsed = new Date(dateStr);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : null;
}

function formatPrettyDate(dateStr) {
  if (!dateStr || dateStr.length !== 10) return "(Invalid Date)";
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(+year, +month - 1, +day);
  if (isNaN(dateObj.getTime())) return "(Invalid Date)";
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (dateStr === today.toISOString().split("T")[0]) {
    return "Today";
  } else if (dateStr === tomorrow.toISOString().split("T")[0]) {
    return "Tomorrow";
  } else {
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    return `${monthName} ${dayNum}`;
  }
}

function getPriorityClass(priority) {
  if (!priority) return '';
  const lower = priority.toLowerCase();
  if (lower.includes('high')) return 'high';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('low')) return 'low';
  return 'medium';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
  loadLessons();
});
