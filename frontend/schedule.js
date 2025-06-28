const scheduleContainer = document.getElementById('schedule-container');

// Clear selectedDate if coming directly to schedule
localStorage.removeItem("selectedDate");

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
  const res = await fetch("https://avdevplanner.onrender.com/tasks");
  const tasks = await res.json();

  const taskMap = {};
  tasks.forEach(task => {
    if (!taskMap[task.date]) taskMap[task.date] = [];
    taskMap[task.date].push(task);
  });

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const localDateStr = getLocalDateString(date);

    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';

    const heading = document.createElement('h2');
    heading.textContent = formatDate(localDateStr);
    dayCard.appendChild(heading);

    if (taskMap[localDateStr]) {
      dayCard.classList.add("has-tasks");
      dayCard.style.cursor = "pointer";
      dayCard.addEventListener("click", () => {
        localStorage.setItem("selectedDate", localDateStr);
        window.location.href = "tasks.html";
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
      noTask.style.opacity = "0.4";
      dayCard.appendChild(noTask);
    }

    scheduleContainer.appendChild(dayCard);
  }
}

renderSchedule();
