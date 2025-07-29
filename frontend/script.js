const form = document.getElementById("task-form");
const container = document.getElementById("task-container");

// === Helper: Convert natural dates ===
function parseNaturalDate(dateStr) {
  if (!dateStr) return null;

  const lowered = dateStr.toLowerCase();
  const today = new Date();

  if (lowered === "today") {
    return today.toISOString().split("T")[0];
  }

  if (lowered === "tomorrow") {
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return null;
}

// === POPUP HANDLING ===
document.addEventListener('DOMContentLoaded', function() {
  // Handle popup close buttons
  const closeButtons = document.querySelectorAll('.modal__close');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const popup = this.closest('.modal');
      if (popup) {
        popup.classList.add('hidden');
      }
    });
  });
  
  // Handle popup background clicks
  const popups = document.querySelectorAll('.modal');
  popups.forEach(popup => {
    popup.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });
  
  // === DRAWER HANDLING ===
  const desktopDrawer = document.getElementById('drawer');
  const quickActionsBtn = document.getElementById('quick-actions-btn');
  
  // Quick Actions button handler - opens appropriate drawer based on screen size
  if (quickActionsBtn) {
    quickActionsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if we're on mobile or desktop
      if (window.innerWidth < 768) {
        // Mobile - open mobile drawer
        if (mobileDrawer) {
          mobileDrawer.classList.remove('hidden');
        }
      } else {
        // Desktop - open desktop drawer
        if (desktopDrawer) {
          console.log('Opening desktop drawer');
          desktopDrawer.classList.remove('hidden');
          // Force reflow to ensure animation triggers
          void desktopDrawer.offsetWidth;
        }
      }
    });
  }
  
  // Desktop drawer handling
  if (desktopDrawer) {
    const desktopDrawerContent = desktopDrawer.querySelector('.desktop-drawer__content');
    
    // Prevent desktop drawer from closing when clicking inside
    if (desktopDrawerContent) {
      desktopDrawerContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
    
    // Close desktop drawer when clicking outside
    desktopDrawer.addEventListener('click', function(e) {
      if (e.target === desktopDrawer) {
        desktopDrawer.classList.add('hidden');
      }
    });
  }
  
  // Mobile drawer handling
  if (mobileDrawer) {
    // Close mobile drawer when clicking outside
    mobileDrawer.addEventListener('click', function(e) {
      if (e.target === mobileDrawer) {
        mobileDrawer.classList.add('hidden');
      }
    });
  }
  
  // Site Links drawer handling
  if (siteLinksDrawer) {
    const siteLinksDrawerContent = siteLinksDrawer.querySelector('.drawer__content');
    
    // Prevent site links drawer from closing when clicking inside
    if (siteLinksDrawerContent) {
      siteLinksDrawerContent.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
    
    // Close site links drawer when clicking outside
    siteLinksDrawer.addEventListener('click', function(e) {
      if (e.target === siteLinksDrawer) {
        siteLinksDrawer.classList.add('hidden');
      }
    });
  }
});

// === FORM SUBMIT ===
if (form) {
  const textInput = document.getElementById("task-text");
  const dateInput = document.getElementById("task-date");
  const timeInput = document.getElementById("task-time");
  const notesInput = document.getElementById("task-notes");
  const taskPopup = document.getElementById("taskPopup");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newTask = {
      title: textInput.value.trim(),
      date: dateInput.value,
      time: timeInput.value,
      notes: notesInput.value.trim(),
      completed: false,
      created_at: new Date().toISOString(),
      subtasks: []
    };

    const res = await fetch("https://avdevplanner.onrender.com/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    if (res.ok) {
      form.reset();
      // Close the popup
      if (taskPopup) {
        taskPopup.classList.add('hidden');
      }
      // Reload the page to show the new task
      location.reload();
    } else {
      console.error("Insert error:", await res.text());
    }
  });
}

// === DISPLAY TASKS ===
if (container) {
  const cameFromSchedule = sessionStorage.getItem("cameFromSchedule");
  sessionStorage.removeItem("cameFromSchedule");

  const selectedDate = localStorage.getItem("selectedDate");
  if (!cameFromSchedule) {
    localStorage.removeItem("selectedDate");
  }

  async function loadTasks() {
    const res = await fetch("https://avdevplanner.onrender.com/tasks");
    const tasks = await res.json();
    const today = new Date().toLocaleDateString("en-CA");

    const sanitizedTasks = tasks.map((t) => ({
      ...t,
      date: parseNaturalDate(t.date)
    }));

    const filteredTasks = selectedDate
      ? sanitizedTasks.filter((t) => t.date === selectedDate)
      : sanitizedTasks.filter((t) => t.date >= today);

    const tasksByDate = {};
    filteredTasks.forEach((task) => {
      const actualIndex = tasks.findIndex(t =>
        t.text === task.text &&
        parseNaturalDate(t.date) === task.date &&
        t.time === task.time
      );

      const normalizedTask = {
        ...task,
        index: actualIndex,
        text: task.text?.trim() || task.title?.trim() || "(No Title)"
      };

      if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
      tasksByDate[task.date].push(normalizedTask);
    });

    container.innerHTML = "";

    // Check if no tasks
    if (Object.keys(tasksByDate).length === 0) {
      container.innerHTML = `
        <div class="tasks-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          <h3>No Tasks Yet</h3>
          <p>Start by adding your first task to manage your daily activities and stay organized.</p>
        </div>
      `;
      return;
    }

    const sortedDates = Object.keys(tasksByDate).sort();

    if (selectedDate) {
      const viewAllBtn = document.createElement("button");
      viewAllBtn.textContent = "View All Tasks";
      viewAllBtn.className = "mb-4 bg-gray-800 text-white px-4 py-2 rounded";
      viewAllBtn.addEventListener("click", () => {
        localStorage.removeItem("selectedDate");
        location.reload();
      });
      container.appendChild(viewAllBtn);
    }

    sortedDates.forEach((date) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "task-date-group";

      const heading = document.createElement("h2");
      heading.className = "task-date-heading";
      heading.textContent = formatDate(date);
      groupDiv.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "tasks-row";

      tasksByDate[date].forEach((task) => {
        const card = document.createElement("div");
        card.className = "task-card";

        card.innerHTML = `
          <h3>${task.text}</h3>
          <div class="task-meta">
            <span class="task-time">🕐 ${formatTime(task.time)}</span>
            <span class="task-status">${task.completed ? "✅ Completed" : "⏳ Pending"}</span>
          </div>
          ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ""}
        `;

        // === Subtasks ===
        if (Array.isArray(task.subtasks) && task.subtasks.length > 0) {
          const subtaskList = document.createElement("ul");
          subtaskList.className = "subtask-list";
          task.subtasks.forEach((sub, subIndex) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <label class="subtask-item">
                <input type="checkbox" ${sub.done ? "checked" : ""}>
                <span>${sub.title}</span>
              </label>
            `;
            li.querySelector("input").addEventListener("change", async () => {
              const updatedSubtasks = [...task.subtasks];
              updatedSubtasks[subIndex].done = !updatedSubtasks[subIndex].done;
              await updateTask(task.index, { ...task, subtasks: updatedSubtasks });
              loadTasks();
            });
            subtaskList.appendChild(li);
          });
          card.appendChild(subtaskList);
        }

        // === Subtask Input ===
        const subForm = document.createElement("form");
        subForm.className = "subtask-form";
        subForm.innerHTML = `
          <input type="text" placeholder="Add subtask..." required>
          <button type="submit">Add</button>
        `;
        subForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const input = subForm.querySelector("input");
          const newSub = { title: input.value.trim(), done: false };
          const updatedSubtasks = [...(task.subtasks || []), newSub];
          await updateTask(task.index, { ...task, subtasks: updatedSubtasks });
          input.value = '';
          loadTasks();
        });
        card.appendChild(subForm);

        // === Action Buttons ===
        const actionButtons = document.createElement("div");
        actionButtons.className = "task-actions";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Mark Incomplete" : "Mark Complete";
        completeBtn.className = `task-action-btn complete`;
        completeBtn.addEventListener("click", async () => {
          await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}/toggle`, {
            method: "PATCH"
          });
          loadTasks();
        });
        actionButtons.appendChild(completeBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "task-action-btn delete";
        deleteBtn.addEventListener("click", async () => {
          if (confirm("Are you sure you want to delete this task?")) {
            await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}`, {
              method: "DELETE"
            });
            loadTasks();
          }
        });
        actionButtons.appendChild(deleteBtn);

        card.appendChild(actionButtons);

        grid.appendChild(card);
      });

      groupDiv.appendChild(grid);
      container.appendChild(groupDiv);
    });
  }

  async function updateTask(index, updatedTask) {
    await fetch(`https://avdevplanner.onrender.com/tasks/${index}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
  }

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
  }

  function formatDate(dateStr) {
    if (!dateStr || dateStr.includes("NaN") || dateStr.length !== 10) return "(Invalid Date)";
    const [year, month, day] = dateStr.split("-");
    const dateObj = new Date(+year, +month - 1, +day);
    if (isNaN(dateObj.getTime())) return "(Invalid Date)";
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    const suffix = (dayNum % 10 === 1 && dayNum !== 11)
      ? "st"
      : (dayNum % 10 === 2 && dayNum !== 12)
      ? "nd"
      : (dayNum % 10 === 3 && dayNum !== 13)
      ? "rd"
      : "th";
    return `${monthName} ${dayNum}${suffix}, ${year}`;
  }

  loadTasks();
}
