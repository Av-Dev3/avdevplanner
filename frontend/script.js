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

// === DESKTOP POPUP TRIGGER ===
const addTaskDesktopBtn = document.getElementById("add-task-desktop");
const taskFormPopup = document.getElementById("task-form-popup");

if (addTaskDesktopBtn && taskFormPopup) {
  addTaskDesktopBtn.addEventListener("click", () => {
    taskFormPopup.classList.remove("hidden");
  });

  taskFormPopup.addEventListener("click", (e) => {
    if (e.target === taskFormPopup) {
      taskFormPopup.classList.add("hidden");
    }
  });
}

// === FORM SUBMIT ===
if (form) {
  const textInput = document.getElementById("task-text");
  const dateInput = document.getElementById("task-date");
  const timeInput = document.getElementById("task-time");
  const notesInput = document.getElementById("task-notes");

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
      groupDiv.className = "mb-8";

      const heading = document.createElement("h2");
      heading.className = "text-xl font-semibold text-white mb-4";
      heading.textContent = formatDate(date);
      groupDiv.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "grid grid-cols-2 md:grid-cols-5 gap-4";

      tasksByDate[date].forEach((task) => {
        const card = document.createElement("div");
       card.className = "bg-zinc-800 text-white rounded-lg p-4 shadow-md flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(76,142,218,0.35)]";


        card.innerHTML = `
          <h3 class="text-lg font-semibold">${task.text}</h3>
          <p class="text-sm text-zinc-400">${formatTime(task.time)}</p>
          ${task.notes ? `<p class="text-sm">${task.notes}</p>` : ""}
          <p class="text-sm">${task.completed ? "✅ Done" : "⏳ Not done"}</p>
        `;

        // === Subtasks ===
        const subtaskList = document.createElement("ul");
        subtaskList.className = "text-sm pl-2 space-y-1";
        if (Array.isArray(task.subtasks)) {
          task.subtasks.forEach((sub, subIndex) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <label class="flex items-center gap-2">
                <input type="checkbox" class="accent-red-600" ${sub.done ? "checked" : ""}>
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
        card.appendChild(subtaskList);

        // === Subtask Input ===
        const subForm = document.createElement("form");
        subForm.className = "flex mt-2 gap-2";
        subForm.innerHTML = `
          <input type="text" placeholder="New subtask..." class="flex-1 px-2 py-1 rounded bg-zinc-700 text-white text-sm" required>
          <button type="submit" class="bg-red-700 px-2 rounded text-sm">Add</button>
        `;
        subForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          const input = subForm.querySelector("input");
          const newSub = { title: input.value.trim(), done: false };
          const updatedSubtasks = [...(task.subtasks || []), newSub];
          await updateTask(task.index, { ...task, subtasks: updatedSubtasks });
          loadTasks();
        });
        card.appendChild(subForm);

        // === Buttons ===
        const btnGroup = document.createElement("div");
        btnGroup.className = "flex justify-between mt-2";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Mark Incomplete" : "Mark Complete";
        completeBtn.className = "text-xs bg-purple-600 px-2 rounded";
        completeBtn.addEventListener("click", async () => {
          await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}/toggle`, {
            method: "PATCH"
          });
          loadTasks();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "text-xs bg-red-700 px-2 py-1 rounded";
        deleteBtn.addEventListener("click", async () => {
          await fetch(`https://avdevplanner.onrender.com/tasks/${task.index}`, {
            method: "DELETE"
          });
          loadTasks();
        });

        btnGroup.appendChild(completeBtn);
        btnGroup.appendChild(deleteBtn);
        card.appendChild(btnGroup);

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
