const scheduleContainer = document.getElementById('schedule-container');
const today = new Date();

// Load tasks from localStorage
let tasks = [];
try {
  const raw = localStorage.getItem('tasks');
  tasks = JSON.parse(raw) || [];
} catch {
  tasks = [];
}

// Group tasks by date string (YYYY-MM-DD)
const taskMap = {};
tasks.forEach(task => {
  if (!taskMap[task.date]) taskMap[task.date] = [];
  taskMap[task.date].push(task);
});

// Format readable date like June 16th, 2025
function formatDate(dateStr) {
  const dateObj = new Date(dateStr);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("default", { month: "long" });
  const year = dateObj.getFullYear();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" :
    day % 10 === 2 && day !== 12 ? "nd" :
    day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${month} ${day}${suffix}, ${year}`;
}

// Get local date string in YYYY-MM-DD format
function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Show today + next 29 days
for (let i = 0; i < 30; i++) {
  const date = new Date();
  date.setDate(today.getDate() + i);

  const isoDate = getLocalDateString(date);

  const dayCard = document.createElement('div');
  dayCard.className = 'day-card';

  const heading = document.createElement('h2');
  heading.textContent = formatDate(isoDate);
  dayCard.appendChild(heading);

  if (taskMap[isoDate]) {
    dayCard.style.cursor = "pointer";
    dayCard.addEventListener('click', () => {
      localStorage.setItem('selectedDate', isoDate);
      window.location.href = 'tasks.html';
    });

    taskMap[isoDate].forEach(task => {
      const taskEl = document.createElement('p');
      taskEl.textContent = `• ${task.text}`;
      if (task.completed) {
        taskEl.style.textDecoration = "line-through";
        taskEl.style.opacity = "0.6";
      }
      dayCard.appendChild(taskEl);
    });
  } else {
    const noTask = document.createElement('p');
    noTask.textContent = "No tasks";
    noTask.style.opacity = "0.5";
    dayCard.appendChild(noTask);
  }

  scheduleContainer.appendChild(dayCard);
}