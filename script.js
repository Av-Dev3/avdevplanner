const form = document.getElementById('task-form');

if (form) {
  const textInput = document.getElementById('task-text');
  const dateInput = document.getElementById('task-date');
  const timeInput = document.getElementById('task-time');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const taskText = textInput.value.trim();
    const taskDate = dateInput.value;
    const taskTime = timeInput.value;

    const task = {
      id: Date.now(),
      text: taskText,
      date: taskDate,
      time: taskTime,
      completed: false,
      createdAt: new Date().toISOString()
    };

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    form.reset();
  });
}

const container = document.getElementById('task-container');

if (container) {
  const rawData = localStorage.getItem('tasks');
  let taskList = [];

  try {
    taskList = JSON.parse(rawData) || [];
  } catch (err) {
    console.error("Failed to parse tasks from localStorage", err);
    taskList = [];
  }

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }

  function formatDate(dateStr) {
    const dateObj = new Date(dateStr + 'T00:00');
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "long" });
    const year = dateObj.getFullYear();

    const suffix =
      day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
      day % 10 === 3 && day !== 13 ? "rd" : "th";

    return `${month} ${day}${suffix}, ${year}`;
  }

  function showDateTime() {
    const now = new Date();
    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');

    const formattedDate = formatDate(now.toISOString().split("T")[0]);

    const hour = now.getHours();
    const minute = now.getMinutes();
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const formattedTime = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;

    if (dateEl && timeEl) {
      dateEl.textContent = formattedDate;
      timeEl.textContent = formattedTime;
    }
  }

  if (document.getElementById('current-date')) {
    showDateTime();
    setInterval(showDateTime, 60000);
  }

  // Group tasks by date
  const tasksByDate = {};
  taskList.forEach(task => {
    if (!tasksByDate[task.date]) {
      tasksByDate[task.date] = [];
    }
    tasksByDate[task.date].push(task);
  });

  const sortedDates = Object.keys(tasksByDate).sort();

  sortedDates.forEach(date => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'task-date-group';

    const heading = document.createElement('h2');
    heading.className = 'task-date-heading';
    heading.textContent = formatDate(date);
    groupDiv.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'task-grid';

    tasksByDate[date].forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.classList.add('task-card');

      taskDiv.innerHTML = `
        <h3>${task.text}</h3>
        <p><strong>Date:</strong> ${formatDate(task.date)}</p>
        <p><strong>Time:</strong> ${formatTime(task.time)}</p>
        <p><strong>Status:</strong> ${task.completed ? '✅ Done' : '⏳ Not done'}</p>
      `;

      if (!task.completed) {
        const completeBtn = document.createElement('button');
        completeBtn.textContent = "Mark Complete";
        completeBtn.addEventListener('click', () => {
          task.completed = true;
          const updatedTasks = taskList.map(t => t.id === task.id ? task : t);
          localStorage.setItem('tasks', JSON.stringify(updatedTasks));
          location.reload();
        });
        taskDiv.appendChild(completeBtn);
      } else {
        const unmarkBtn = document.createElement('button');
        unmarkBtn.textContent = "Mark Incomplete";
        unmarkBtn.addEventListener('click', () => {
          task.completed = false;
          const updatedTasks = taskList.map(t => t.id === task.id ? task : t);
          localStorage.setItem('tasks', JSON.stringify(updatedTasks));
          location.reload();
        });
        taskDiv.appendChild(unmarkBtn);
      }

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener('click', () => {
        const updatedTasks = taskList.filter(t => t.id !== task.id);
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
        location.reload();
      });
      taskDiv.appendChild(deleteBtn);

      grid.appendChild(taskDiv);
    });

    groupDiv.appendChild(grid);
    container.appendChild(groupDiv);
  });
}