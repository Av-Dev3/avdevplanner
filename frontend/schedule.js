document.addEventListener("DOMContentLoaded", () => {
  const scheduleContainer = document.getElementById("schedule-container");
  const dayTemplate = document.getElementById("day-expand-template");

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${suffix}`;
  }

  function formatCardDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function createFullCard(title, notes, date, time) {
    const div = document.createElement("div");
    div.className =
      "snap-center shrink-0 w-full sm:w-[240px] bg-[#2b2b2b] rounded-lg p-4 shadow-inner text-sm";

    const timeDisplay = time ? `<p><small>Time: ${formatTime(time)}</small></p>` : "";
    const dateDisplay = date ? `<p><small>Date: ${formatCardDate(date)}</small></p>` : "";

    div.innerHTML = `
      <h3 class="font-semibold mb-1">${title}</h3>
      ${notes ? `<p class="mb-1">${notes}</p>` : ""}
      ${timeDisplay}
      ${dateDisplay}
    `;
    return div;
  }

  function setupSwipeContainer(container) {
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

  function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatHeaderDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }

  async function renderSchedule() {
    const [tasks, goals, lessons, notes] = await Promise.all([
      fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
      fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
      fetch("https://avdevplanner.onrender.com/lessons").then((res) => res.json()),
      fetch("https://avdevplanner.onrender.com/notes").then((res) => res.json()),
    ]);

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const isoDate = getLocalDateString(date);

      // === Day Card ===
      const dayCard = document.createElement("div");
      dayCard.className =
        "bg-[#1f1f1f] rounded-xl shadow-md p-4 cursor-pointer transition hover:bg-[#2a2a2a]";

      const heading = document.createElement("h2");
      heading.className = "text-base font-semibold mb-2 text-white";
      heading.textContent = formatHeaderDate(isoDate);
      dayCard.appendChild(heading);

      const expandSection = dayTemplate.content.cloneNode(true);
      const expandWrapper = document.createElement("div");
      expandWrapper.className = "hidden";
      expandWrapper.appendChild(expandSection);

      let isExpanded = false;
      dayCard.addEventListener("click", async () => {
        if (isExpanded) {
          expandWrapper.classList.add("hidden");
          isExpanded = false;
        } else {
          await populateDayContent(
            expandWrapper,
            isoDate,
            tasks,
            goals,
            lessons,
            notes
          );
          expandWrapper.classList.remove("hidden");
          isExpanded = true;
        }
      });

      scheduleContainer.appendChild(dayCard);
      scheduleContainer.appendChild(expandWrapper);
    }
  }

  async function populateDayContent(wrapper, isoDate, tasks, goals, lessons, notes) {
    const taskC = wrapper.querySelector(".task-container");
    const goalC = wrapper.querySelector(".goal-container");
    const lessonC = wrapper.querySelector(".lesson-container");
    const noteC = wrapper.querySelector(".note-container");

    taskC.innerHTML = "";
    goalC.innerHTML = "";
    lessonC.innerHTML = "";
    noteC.innerHTML = "";

    const todayTasks = tasks.filter((t) => t.date === isoDate);
    const todayGoals = goals.filter((g) => g.date === isoDate);
    const todayLessons = lessons.filter((l) => l.date === isoDate);
    const todayNotes = notes.filter((n) => n.date === isoDate);

    if (todayTasks.length) {
      todayTasks.forEach((t) => {
        const card = createFullCard(
          t.text || t.title,
          t.notes,
          t.prettyDate,
          t.time
        );
        taskC.appendChild(card);
      });
    } else {
      taskC.innerHTML = "<p class='text-gray-400'>No tasks.</p>";
    }

    if (todayGoals.length) {
      todayGoals.forEach((g) => {
        const card = createFullCard(g.title, g.notes, g.prettyDate);
        goalC.appendChild(card);
      });
    } else {
      goalC.innerHTML = "<p class='text-gray-400'>No goals.</p>";
    }

    if (todayLessons.length) {
      todayLessons.forEach((l) => {
        const content = `${l.description || ""}${l.notes ? ` (${l.notes})` : ""}`;
        const card = createFullCard(
          l.title,
          `Category: ${l.category || "N/A"} | Priority: ${l.priority || "Normal"} | ${content}`,
          l.prettyDate
        );
        lessonC.appendChild(card);
      });
    } else {
      lessonC.innerHTML = "<p class='text-gray-400'>No lessons.</p>";
    }

    if (todayNotes.length) {
      todayNotes.forEach((n) => {
        const card = createFullCard(n.title, n.content, n.prettyDate);
        noteC.appendChild(card);
      });
    } else {
      noteC.innerHTML = "<p class='text-gray-400'>No notes.</p>";
    }

    setupSwipeContainer(taskC);
    setupSwipeContainer(goalC);
    setupSwipeContainer(lessonC);
    setupSwipeContainer(noteC);
  }

  renderSchedule();
});
