import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  "https://hrlctpqyckkltfuagsxq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybGN0cHF5Y2trbHRmdWFnc3hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyODkwNDMsImV4cCI6MjA2NTg2NTA0M30.FCxdMd6vh8C_YEp-Mf67TNOR7mtxkVlJSSFxSc8Y78k"
);

const scheduleContainer = document.getElementById('schedule-container');

// Format readable date like "June 17th, 2025"
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-");
  const dateObj = new Date(+year, +month - 1, +day);
  const suffix =
    day % 10 === 1 && day !== "11" ? "st" :
    day % 10 === 2 && day !== "12" ? "nd" :
    day % 10 === 3 && day !== "13" ? "rd" : "th";
  const monthName = dateObj.toLocaleString("default", { month: "long" });
  return `${monthName} ${+day}${suffix}, ${year}`;
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function renderSchedule() {
  const { data: tasks, error } = await supabase.from('tasks').select('*');
  if (error) {
    console.error("Error loading tasks:", error);
    return;
  }

  // Group tasks by date
  const taskMap = {};
  tasks.forEach(task => {
    if (!taskMap[task.date]) taskMap[task.date] = [];
    taskMap[task.date].push(task);
  });

  // Generate cards for today + 29 more days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + i);

    const localDateStr = getLocalDateString(date);

    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';

    const heading = document.createElement('h2');
    heading.textContent = formatDate(localDateStr);
    dayCard.appendChild(heading);

    if (taskMap[localDateStr]) {
      dayCard.style.cursor = "pointer";
      dayCard.addEventListener('click', () => {
        localStorage.setItem('selectedDate', localDateStr);
        window.location.href = 'tasks.html';
      });

      taskMap[localDateStr].forEach(task => {
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
}

renderSchedule();
