const form = document.getElementById("task-form");
const container = document.getElementById("task-container");

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
  const cameFromSchedule = document.referrer.includes("schedule.html");

  // Only preserve selectedDate if came directly from schedule
  if (!cameFromSchedule) {
    localStorage.removeItem("selectedDate");
  }

  const selectedDate = localStorage.getItem("selectedDate");

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
    const [year, month, day] = dateStr.split("-");
    const dateObj = new Date(+year, +month - 1, +day);
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    const suffix =
      dayNum % 10 === 1 && dayNum !== 11 ? "st" :
      dayNum % 10 === 2 && dayNum !== 12 ? "nd" :
      dayNum % 10 === 3 && dayNum !== 13 ? "rd" : "th";
    return `${monthName} ${dayNum}${suffix}, ${year}`;
  }

  async function loadTasks() {
    const res = await fetch("https://avdevplanner.onrender.com/tasks");
    const tasks = await res.json();
    const today = new Date().toLocaleDateString("en-CA");

    const filteredTasks = selectedDate
      ? tasks.filter((t) => t.date === selectedDate)
      : tasks.filter((t) => t.date >= today);

    const tasksByDate = {};
    filteredTasks.forEach((task, index) => {
      if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
      tasksByDate[task.date].push({ ...task, index });
    });

    container.innerHTML = "";

    const sortedDates = Object.keys(tasksByDate).sort();

    // "View All Tasks" button if viewing from schedule
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

  loadTasks();
}
