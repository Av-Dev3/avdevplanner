document.addEventListener("DOMContentLoaded", () => {
  const weekRange = document.getElementById("week-range");
  const daysContainer = document.getElementById("weekly-days");
  const template = document.getElementById("day-template");
  const today = new Date();

  const sunday = new Date(today);
  sunday.setDate(sunday.getDate() - sunday.getDay());

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const formatDate = (d) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const getISO = (d) => d.toISOString().split("T")[0];

  const end = new Date(sunday);
  end.setDate(end.getDate() + 6);
  weekRange.textContent = `Week of ${formatDate(sunday)} – ${formatDate(end)}`;

  let expanded = null;

  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(date.getDate() + i);
    const dateStr = getISO(date);
    const dayName = dayNames[date.getDay()];
    const fullDate = `${dayName}, ${formatDate(date)}`;

    const clone = template.content.cloneNode(true);
    const section = clone.querySelector(".day-section");
    const button = clone.querySelector(".day-toggle");
    const content = clone.querySelector(".day-content");
    const taskContainer = clone.querySelector(".task-container");
    const goalContainer = clone.querySelector(".goal-container");
    const lessonContainer = clone.querySelector(".lesson-container");

    button.textContent = fullDate;

    button.addEventListener("click", () => {
      if (expanded && expanded !== content) {
        expanded.classList.add("hidden");
      }
      content.classList.toggle("hidden");
      expanded = content.classList.contains("hidden") ? null : content;
    });

    loadData("tasks", dateStr, taskContainer, renderCard);
    loadData("goals", dateStr, goalContainer, renderCard);
    loadData("lessons", dateStr, lessonContainer, renderCard);

    daysContainer.appendChild(clone);
  }

  // Render all card types the same
  function renderCard(item) {
    const div = document.createElement("div");
    div.className = "bg-[#2b2b2b] text-white p-3 rounded-lg shadow flex-shrink-0 snap-start";
    div.style.minWidth = "250px";

    div.innerHTML = `
      <h3 class="text-base font-semibold">${item.title || item.text}</h3>
      ${item.date ? `<p class="text-sm"><strong>Date:</strong> ${item.date}</p>` : ""}
      ${item.time ? `<p class="text-sm"><strong>Time:</strong> ${item.time}</p>` : ""}
      ${item.notes ? `<p class="text-sm"><strong>Notes:</strong> ${item.notes}</p>` : ""}
      ${typeof item.completed !== "undefined"
        ? `<p class="text-sm"><strong>Status:</strong> ${item.completed ? "✅" : "⏳"}</p>`
        : ""}
      ${item.category ? `<p class="text-sm"><strong>Category:</strong> ${item.category}</p>` : ""}
      ${item.priority ? `<p class="text-sm"><strong>Priority:</strong> ${item.priority}</p>` : ""}
    `;

    return div;
  }

  async function loadData(type, dateStr, container, renderFn) {
    try {
      const res = await fetch(`https://avdevplanner.onrender.com/${type}`);
      const items = await res.json();
      const filtered = items.filter((item) => item.date === dateStr);

      container.innerHTML = "";
      if (filtered.length === 0) {
        container.innerHTML = "<p class='text-sm text-gray-400'>No items.</p>";
      } else {
        filtered.forEach((item) => container.appendChild(renderFn(item)));
      }
    } catch (err) {
      console.error(`Failed to load ${type} for ${dateStr}:`, err);
    }
  }

  // === Weekly Reflection ===
  const textarea = document.getElementById("reflection-textarea");
  const saveBtn = document.getElementById("save-reflection");
  const key = `reflection-${getISO(sunday)}`;

  textarea.value = localStorage.getItem(key) || "";

  saveBtn.addEventListener("click", () => {
    localStorage.setItem(key, textarea.value.trim());
    alert("Reflection saved!");
  });
});
