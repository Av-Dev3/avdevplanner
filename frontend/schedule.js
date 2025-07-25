document.addEventListener("DOMContentLoaded", async () => {
  const scheduleContainer = document.getElementById("schedule-container");
  const template = document.getElementById("day-expand-template");

  const todayStr = new Date().toLocaleDateString("en-CA");

  const [tasks, goals, lessons, notes] = await Promise.all([
    fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/lessons").then((res) => res.json()),
    fetch("https://avdevplanner.onrender.com/notes").then((res) => res.json()),
  ]);

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateStr = date.toLocaleDateString("en-CA");
    const pretty = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    const dayCard = document.createElement("div");
    dayCard.className = "bg-[#1f1f1f] rounded-xl p-4 shadow-md transition-all transform hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(76,142,218,0.35)]";
;
    dayCard.innerHTML = `<h3 class="text-lg font-semibold">${pretty}</h3>`;

    const expandContent = template.content.cloneNode(true);

    const taskContainer = expandContent.querySelector(".task-container");
    const goalContainer = expandContent.querySelector(".goal-container");
    const lessonContainer = expandContent.querySelector(".lesson-container");
    const noteContainer = expandContent.querySelector(".note-container");

    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const dayGoals = goals.filter((g) => g.date === dateStr);
    const dayLessons = lessons.filter((l) => l.date === dateStr);
    const dayNotes = notes.filter((n) => n.date === dateStr);

    appendCards(dayTasks, taskContainer);
    appendCards(dayGoals, goalContainer);
    appendLessonCards(dayLessons, lessonContainer);
    appendNoteCards(dayNotes, noteContainer);

    setupSwipe(taskContainer);
    setupSwipe(goalContainer);
    setupSwipe(lessonContainer);
    setupSwipe(noteContainer);

    const expander = document.createElement("div");
    expander.classList.add("day-expanded");
    expander.appendChild(expandContent);
    expander.style.display = "none";
    dayCard.appendChild(expander);

    dayCard.addEventListener("click", (e) => {
      const isOpen = expander.style.display === "block";
      document.querySelectorAll(".day-expanded").forEach((el) => (el.style.display = "none"));
      if (!isOpen) {
        expander.style.display = "block";
      } else {
        expander.style.display = "none";
      }
      e.stopPropagation();
    });

    scheduleContainer.appendChild(dayCard);
  }
});

function appendCards(items, container) {
  if (!items.length) {
    container.innerHTML = "<p class='text-xs'>No entries.</p>";
    return;
  }

  items.forEach((item) => {
    const card = createFullCard(
      item.text || item.title || "Untitled",
      item.notes,
      item.prettyDate,
      item.time
    );
    container.appendChild(card);
  });
}

function appendLessonCards(lessons, container) {
  if (!lessons.length) {
    container.innerHTML = "<p class='text-xs'>No lessons.</p>";
    return;
  }
  lessons.forEach((lesson) => {
    const content = `${lesson.description || ""}${lesson.notes ? ` (${lesson.notes})` : ""}`;
    const card = createFullCard(
      lesson.title,
      `Category: ${lesson.category || "N/A"} | Priority: ${lesson.priority || "Normal"} | ${content}`,
      lesson.prettyDate
    );
    container.appendChild(card);
  });
}

function appendNoteCards(notes, container) {
  if (!notes.length) {
    container.innerHTML = "<p class='text-xs'>No notes.</p>";
    return;
  }
  notes.forEach((note) => {
    const card = createFullCard(note.title, note.content, note.date);
    container.appendChild(card);
  });
}

function createFullCard(title, notes, date, time) {
  const div = document.createElement("div");
  div.className =
    "snap-center shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm";

  const timeDisplay =
    time && time.includes("M")
      ? `<p><small>Time: ${time}</small></p>`
      : time
      ? `<p><small>Time: ${formatTime(time)}</small></p>`
      : "";

  const dateDisplay =
    date && date.includes(",")
      ? `<p><small>Date: ${date}</small></p>`
      : date
      ? `<p><small>Date: ${formatPrettyDate(date)}</small></p>`
      : "";

  div.innerHTML = `
    <h3 class="font-semibold mb-1">${title}</h3>
    ${notes ? `<p class="mb-1">${notes}</p>` : ""}
    ${timeDisplay}
    ${dateDisplay}
  `;
  return div;
}

function formatPrettyDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr) {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const adjusted = hour % 12 === 0 ? 12 : hour % 12;
  return `${adjusted}:${m} ${suffix}`;
}

function setupSwipe(container) {
  container.classList.add(
    "flex",
    "overflow-x-auto",
    "snap-x",
    "snap-mandatory",
    "scroll-smooth",
    "no-scrollbar",
    "gap-3"
  );
  container.style.scrollbarWidth = "none";
  container.style.msOverflowStyle = "none";
  container.style.overflowY = "hidden";
  container.style.webkitOverflowScrolling = "touch";

  if (window.innerWidth >= 768) {
    container.classList.remove(
      "flex",
      "overflow-x-auto",
      "snap-x",
      "snap-mandatory",
      "scroll-smooth"
    );
    container.style.overflow = "visible";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(200px, 1fr))";
    container.style.gap = "1rem";
  }
}

// === Close expanded sections when clicking outside any card ===
document.addEventListener("click", (event) => {
  const insideAnyDay = event.target.closest("#schedule-container > div");
  if (!insideAnyDay) {
    document.querySelectorAll(".day-expanded").forEach((el) => {
      el.style.display = "none";
    });
  }
});
