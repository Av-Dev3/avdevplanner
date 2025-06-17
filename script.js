const form = document.getElementById('task-form'); if (form) { const textInput = document.getElementById('task-text'); const dateInput = document.getElementById('task-date'); const timeInput = document.getElementById('task-time');

form.addEventListener('submit', function (e) { e.preventDefault();

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

}); }

const container = document.getElementById('task-container');

if (container) { const rawData = localStorage.getItem('tasks'); let taskList = [];

try { taskList = JSON.parse(rawData) || []; } catch (err) { console.error("Failed to parse tasks from localStorage", err); taskList = []; }

// Auto-delete expired tasks const todayDateString = new Date().toISOString().split('T')[0]; taskList = taskList.filter(task => task.date >= todayDateString); localStorage.setItem('tasks', JSON.stringify(taskList));

function formatTime(timeStr) { if (!timeStr) return '';

const [hourStr, minute] = timeStr.split(":");
let hour = parseInt(hourStr, 10);
const ampm = hour >= 12 ? "PM" : "AM";

if (hour === 0) hour = 12;
else if (hour > 12) hour -= 12;

return `${hour}:${minute} ${ampm}`;

}

function formatDate(dateStr) { const dateObj = new Date(dateStr + 'T00:00'); const day = dateObj.getDate(); const month = dateObj.toLocaleString("default", { month: "long" }); const year = dateObj.getFullYear();

const suffix =
  day % 10 === 1 && day !== 11 ? "st" :
  day % 10 === 2 && day !== 12 ? "nd" :
  day % 10 === 3 && day !== 13 ? "rd" : "th";

return `${month} ${day}${suffix}, ${year}`;

}

function getLocalDateString(dateStr) { const local = new Date(dateStr + 'T00:00'); return local.toISOString().split('T')[0]; }

function getTodayDateString() { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; const localDate = new Date(now - offset); return localDate.toISOString().split('T')[0]; }

function showDateTime() { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; const localNow = new Date(now - offset); const formattedDate = formatDate(localNow.toISOString().split("T")[0]); const formattedTime = formatTime(localNow.toTimeString().slice(0, 5));

const dateEl = document.getElementById('current-date');
const timeEl = document.getElementById('current-time');
if (dateEl && timeEl) {
  dateEl.textContent = formattedDate;
  timeEl.textContent = formattedTime;
}

}

if (document.getElementById('current-date')) { showDateTime(); setInterval(showDateTime, 60000); }

const tasksByDate = {}; taskList.forEach(task => { const key = getLocalDateString(task.date); if (!tasksByDate[key]) { tasksByDate[key] = []; } tasksByDate[key].push(task); });

const sortedDates = Object.keys(tasksByDate).sort();

sortedDates.forEach(date => { const groupDiv = document.createElement('div'); groupDiv.className = 'task-date-group';

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

}); }

