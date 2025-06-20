import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://hrlctpqyckkltfuagsxq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybGN0cHF5Y2trbHRmdWFnc3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODkwNDMsImV4cCI6MjA2NTg2NTA0M30.FCxdMd6vh8C_YEp-Mf67TNOR7mtxkVlJSSFxSc8Y78k"
);

const form = document.getElementById("task-form");

if (form) {
  const textInput = document.getElementById("task-text");
  const dateInput = document.getElementById("task-date");
  const timeInput = document.getElementById("task-time");
  const notesInput = document.getElementById("task-notes");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const taskText = textInput.value.trim();
    const taskDate = dateInput.value;
    const taskTime = timeInput.value;
    const taskNotes = notesInput.value.trim();

    const { error } = await supabase.from("tasks").insert([
      {
        text: taskText,
        date: taskDate,
        time: taskTime,
        notes: taskNotes,
        completed: false,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) console.error("Insert error:", error);
    else form.reset();

    location.reload();
  });
}

const container = document.getElementById("task-container");

if (container) {
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
    const dateObj = new Date(+year, +month - 1, +day); // local date
    const dayNum = dateObj.getDate();
    const monthName = dateObj.toLocaleString("default", { month: "long" });
    const yearNum = dateObj.getFullYear();
    const suffix =
      dayNum % 10 === 1 && dayNum !== 11
        ? "st"
        : dayNum % 10 === 2 && dayNum !== 12
        ? "nd"
        : dayNum % 10 === 3 && dayNum !== 13
        ? "rd"
        : "th";
    return `${monthName} ${dayNum}${suffix}, ${yearNum}`;
  }

  function showDateTime() {
    const now = new Date();
    const dateEl = document.getElementById("current-date");
    const timeEl = document.getElementById("current-time");

    const formattedDate = formatDate(
      now.toLocaleDateString("en-CA") // YYYY-MM-DD
    );

    const hour = now.getHours();
    const minute = now.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const formattedTime = `${hour12}:${minute
      .toString()
      .padStart(2, "0")} ${ampm}`;

    if (dateEl && timeEl) {
      dateEl.textContent = formattedDate;
      timeEl.textContent = formattedTime;
    }
  }

  if (document.getElementById("current-date")) {
    showDateTime();
    setInterval(showDateTime, 60000);
  }

  async function loadTasks() {
    const { data: tasks, error } = await supabase.from("tasks").select("*");

    if (error) {
      console.error("Fetch error:", error);
      return;
    }

    const today = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD

    const futureTasks = tasks.filter((t) => t.date >= today);
    const historyTasks = tasks.filter((t) => t.date < today);

    const tasksByDate = {};
    futureTasks.forEach((task) => {
      if (!tasksByDate[task.date]) tasksByDate[task.date] = [];
      tasksByDate[task.date].push(task);
    });

    const sortedDates = Object.keys(tasksByDate).sort();

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
          <p><strong>Status:</strong> ${
            task.completed ? "✅ Done" : "⏳ Not done"
          }</p>
        `;

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed
          ? "Mark Incomplete"
          : "Mark Complete";
        completeBtn.addEventListener("click", async () => {
          const { error } = await supabase
            .from("tasks")
            .update({ completed: !task.completed })
            .eq("id", task.id);
          if (error) console.error("Update error:", error);
          else location.reload();
        });
        taskDiv.appendChild(completeBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", async () => {
          const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", task.id);
          if (error) console.error("Delete error:", error);
          else location.reload();
        });
        taskDiv.appendChild(deleteBtn);

        grid.appendChild(taskDiv);
      });

      groupDiv.appendChild(grid);
      container.appendChild(groupDiv);
    });

    const historyContainer = document.getElementById("task-history");
    if (historyContainer) {
      const historyByDate = {};
      historyTasks.forEach((task) => {
        if (!historyByDate[task.date]) historyByDate[task.date] = [];
        historyByDate[task.date].push(task);
      });

      const sortedHistory = Object.keys(historyByDate).sort().reverse();

      sortedHistory.forEach((date) => {
        const groupDiv = document.createElement("div");
        groupDiv.className = "task-date-group";

        const heading = document.createElement("h2");
        heading.className = "task-date-heading";
        heading.textContent = formatDate(date);
        groupDiv.appendChild(heading);

        const grid = document.createElement("div");
        grid.className = "task-grid";

        historyByDate[date].forEach((task) => {
          const taskDiv = document.createElement("div");
          taskDiv.classList.add("task-card");

          taskDiv.innerHTML = `
            <h3>${task.text}</h3>
            <p><strong>Date:</strong> ${formatDate(task.date)}</p>
            <p><strong>Time:</strong> ${formatTime(task.time)}</p>
            ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
            <p><strong>Status:</strong> ${
              task.completed ? "✅ Done" : "⏳ Not done"
            }</p>
          `;

          grid.appendChild(taskDiv);
        });

        groupDiv.appendChild(grid);
        historyContainer.appendChild(groupDiv);
      });
    }
  }

  loadTasks();
}

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("task-form");
  if (!form) return;

  // Hide form with CSS class
  form.classList.add("hidden");

  // Create toggle button
  const toggleBtn = document.createElement("button");
  toggleBtn.textContent = "Create New Task";
  toggleBtn.id = "toggle-task-form";
  toggleBtn.style.margin = "1rem 0";
  toggleBtn.addEventListener("click", () => {
    form.classList.toggle("hidden");
  });

 const buttonWrapper = document.createElement("div");
buttonWrapper.id = "toggle-task-wrapper";
buttonWrapper.appendChild(toggleBtn);
form.parentNode.insertBefore(buttonWrapper, form);



  // Create Today’s Tasks section
  const todayTasksDiv = document.createElement("div");
  todayTasksDiv.id = "today-tasks";
  todayTasksDiv.innerHTML = "<h2>Today's Tasks</h2>";
  form.parentNode.insertBefore(todayTasksDiv, form.nextSibling);

  // Load today’s tasks
  const { data: tasks, error } = await supabase.from("tasks").select("*");

  if (error) {
    console.error("Failed to load today’s tasks:", error);
    return;
  }

  const todayStr = new Date().toLocaleDateString("en-CA");
  const todays = tasks.filter(t => t.date === todayStr);

  if (todays.length === 0) {
    todayTasksDiv.innerHTML += `<p>No tasks for today.</p>`;
  } else {
    todays.forEach(task => {
      const taskEl = document.createElement("div");
      taskEl.className = "task-card";
      taskEl.innerHTML = `
        <h3>${task.text}</h3>
        <p><strong>Time:</strong> ${task.time || "N/A"}</p>
        ${task.notes ? `<p><strong>Notes:</strong> ${task.notes}</p>` : ""}
        <p><strong>Status:</strong> ${task.completed ? "✅ Done" : "⏳ Not done"}</p>
      `;
      todayTasksDiv.appendChild(taskEl);
    });
  }
});
