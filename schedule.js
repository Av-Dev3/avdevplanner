const scheduleContainer = document.getElementById('schedule-container');
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth(); // 0-indexed

const monthStart = new Date(year, month, 1);
const monthEnd = new Date(year, month + 1, 0);
const daysInMonth = monthEnd.getDate();
const startDay = monthStart.getDay(); // 0 = Sunday

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

// Create weekday headers
const weekdayHeader = document.createElement('div');
weekdayHeader.className = 'calendar-header';
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

weekdays.forEach(day => {
  const dayEl = document.createElement('div');
  dayEl.className = 'calendar-day-label';
  dayEl.textContent = day;
  weekdayHeader.appendChild(dayEl);
});
scheduleContainer.appendChild(weekdayHeader);

// Create the main calendar grid
const calendarGrid = document.createElement('div');
calendarGrid.className = 'calendar-grid';

// Add blank cells to align the first day
for (let i = 0; i < startDay; i++) {
  const blank = document.createElement('div');
  blank.className = 'calendar-cell empty';
  calendarGrid.appendChild(blank);
}

// Add day cells with tasks
for (let day = 1; day <= daysInMonth; day++) {
  const cell = document.createElement('div');
  cell.className = 'calendar-cell';

  const date = new Date(year, month, day);
  const isoDate = date.toISOString().split("T")[0];

  const title = document.createElement('strong');
  title.textContent = day;
  cell.appendChild(title);

  if (taskMap[isoDate]) {
    // Make day clickable if it has tasks
    cell.style.cursor = "pointer";
    cell.addEventListener('click', () => {
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
      cell.appendChild(taskEl);
    });
  }

  calendarGrid.appendChild(cell);
}

scheduleContainer.appendChild(calendarGrid);
