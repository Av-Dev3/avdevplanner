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

// === FORM TOGGLE ===
if (form) {
  form.style.display = "none";

  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Create New Task";
  toggleBtn.id = "toggle-task-form";
  toggleBtn.style.display = "block";
  toggleBtn.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "flex" : "none";
  });

  form.parentNode.insertBefore(toggleBtn, form);

  const textInput = document.getElementById("task-text");
  const dateInput = document.getElementById("task-date");
  const timeInput = document.getElementById("task-time");
  const notesInput = document.getElementById("task-notes");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newTask = {
      text: textInput.value.trim(),
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

    if (res.ok) form.reset();
    else console.error("Insert error:", await res.text());

    location.reload();
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
      const actualIndex = tasks.findIndex(t => t.text === task.text && parseNaturalDate(t.date) === task.date && t.time === task.time);
     const normalizedTask = {
  ...task,
  index: actualIndex,
  text: task.text?.trim() || task.title?.trim() || "(No Title)"
};


      if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
      tasksByDate[task.date].push(normalizedTask);
    });

    container.innerHTML = "";

    const sortedDates = Object.keys(tasksByDate).sort();

    if (selectedDate) {
      const viewAllBtn = document.createElement("button");
      viewAllBtn.textContent = "View All Tasks";
      viewAllBtn.id = "view-all-btn";
      viewAllBtn.style.marginBottom = "1rem";
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
      grid.className = "task-grid";

      tasksByDate[date].forEach((task) => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task-card");

        taskDiv.innerHTML = `
          <h3>${task.text}</h3>
          <p><strong>Date:</strong> ${formatDate(task.date)}</p>
          <p><strong>Time:</strong> ${formatTime(task.time)}</p>
          ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
          <p><strong>Status:</strong> ${task.completed ? "✅ Done" : "⏳ Not done"}</p>
        `;

        // === Subtasks Section ===
        const subtaskList = document.createElement("ul");
        subtaskList.className = "subtask-list";
        if (Array.isArray(task.subtasks)) {
          task.subtasks.forEach((sub, subIndex) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <label>
                <input type="checkbox" ${sub.done ? "checked" : ""}>
                ${sub.title}
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
        }
        taskDiv.appendChild(subtaskList);

        // Add Subtask Form
        const subForm = document.createElement("form");
        subForm.className = "subtask-form";
        subForm.innerHTML = `
          <input type="text" placeholder="New subtask..." required>
          <button type="submit">Add</button>
        `;
        subForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const input = subForm.querySelector("input");
          const newSub = { title: input.value.trim(), done: false };
          const updatedSubtasks = [...(task.subtasks || []), newSub];
          await updateTask(task.index, { ...task, subtasks: updatedSubtasks });
          loadTasks();
        });
        taskDiv.appendChild(subForm);

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Mark Incomplete" : "Mark Complete";
        completeBtn.addEventListener("click", async () => {
          await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}/toggle`, {
            method: "PATCH"
          });
          location.reload();
        });
        taskDiv.appendChild(completeBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async () => {
          await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}`, {
            method: "DELETE"
          });
          location.reload();
        });
        taskDiv.appendChild(deleteBtn);

        grid.appendChild(taskDiv);
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
    const suffix =
      dayNum % 10 === 1 && dayNum !== 11 ? "st" :
      dayNum % 10 === 2 && dayNum !== 12 ? "nd" :
      dayNum % 10 === 3 && dayNum !== 13 ? "rd" : "th";

    return `${monthName} ${dayNum}${suffix}, ${year}`;
  }

  loadTasks();
}
