const scheduleContainer = document.getElementById('schedule-container');
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed

const monthStart = new Date(year, month, 1);
const monthEnd = new Date(year, month + 1, 0);
const daysInMonth = monthEnd.getDate();

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

// Format date as "Month 16th, 2025"
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

// Build day cards
for (let day = 1; day <= daysInMonth; day++) {
  const date = new Date(year, month, day);
  const isoDate = date.toISOString().split("T")[0];

  const dayCard = document.createElement('div');
  dayCard.className = 'day-card';

  const heading = document.createElement('h2');
  heading.textContent = formatDate(isoDate);
  dayCard.appendChild(heading);

  if (taskMap[isoDate]) {
    // Make day clickable if it has tasks
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
    const empty = document.createElement('p');
    empty.textContent = "No tasks";
    empty.style.opacity = "0.5";
    dayCard.appendChild(empty);
  }

  scheduleContainer.appendChild(dayCard);
}