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
  const [tasks, goals, lessons, schedule] = await Promise.all([
    fetch("https://avdevplanner.onrender.com/tasks").then(res => res.json()),
    fetch("https://avdevplanner.onrender.com/goals").then(res => res.json()),
    fetch("https://avdevplanner.onrender.com/lessons").then(res => res.json()),
    fetch("https://avdevplanner.onrender.com/schedule").then(res => res.json())
  ]);

  // === Group by date ===
  const map = {};

  const addToMap = (item, type) => {
    const date = item.date;
    if (!date) return;
    if (!map[date]) map[date] = [];
    map[date].push({ ...item, type });
  };

  tasks.forEach(t => addToMap({ ...t, text: t.text || t.title }, "task"));
  goals.forEach(g => addToMap({ ...g, text: g.title }, "goal"));
  lessons.forEach(l => addToMap({ ...l, text: l.title }, "lesson"));
  schedule.forEach(s => addToMap({ ...s, text: s.title }, "event"));

  // === Build UI ===
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const localDateStr = getLocalDateString(date);

    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';

    const heading = document.createElement('h2');
    heading.textContent = formatDate(localDateStr);
    dayCard.appendChild(heading);

    const dayItems = map[localDateStr];

    if (dayItems && dayItems.length > 0) {
      dayCard.classList.add("has-tasks");
      dayCard.style.cursor = "pointer";
      dayCard.addEventListener("click", () => {
        localStorage.setItem("selectedDate", localDateStr);
        sessionStorage.setItem("cameFromSchedule", "true");
        window.location.href = "tasks.html";
      });

      dayItems.forEach(item => {
        const p = document.createElement("p");
        p.textContent = `• [${item.type}] ${item.text}`;
        if (item.completed) {
          p.style.textDecoration = "line-through";
          p.style.opacity = "0.6";
        }
        dayCard.appendChild(p);
      });
    } else {
      const noTask = document.createElement('p');
      noTask.textContent = "No entries";
      noTask.style.opacity = "0.4";
      dayCard.appendChild(noTask);
    }

    scheduleContainer.appendChild(dayCard);
  }
}

renderSchedule();
