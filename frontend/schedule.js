document.addEventListener("DOMContentLoaded", async () => {
  const scheduleContainer = document.getElementById("schedule-container");
  const template = document.getElementById("day-expand-template");

  // Initialize quick actions
  initializeQuickActions();

  const todayStr = new Date().toLocaleDateString("en-CA");

  try {
    const [tasks, goals, lessons] = await Promise.all([
      fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
      fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
      fetch("https://avdevplanner.onrender.com/lessons").then((res) => res.json()),
    ]);

    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toLocaleDateString("en-CA");
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const pretty = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });

      const dayCard = document.createElement("div");
      dayCard.className = "day-card";
      
      const dayHeader = document.createElement("div");
      dayHeader.className = `day-header ${dayName.toLowerCase()}`;
      dayHeader.innerHTML = `
        <div>
          <h3 class="day-title">${dayName}</h3>
          <p class="day-date">${pretty}</p>
        </div>
        <span class="day-toggle">▼</span>
      `;

      const expandContent = template.content.cloneNode(true);
      const dayContent = document.createElement("div");
      dayContent.className = "day-content";
      dayContent.appendChild(expandContent);

      const taskContainer = dayContent.querySelector(".task-container");
      const goalContainer = dayContent.querySelector(".goal-container");
      const lessonContainer = dayContent.querySelector(".lesson-container");

      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const dayGoals = goals.filter((g) => g.date === dateStr);
      const dayLessons = lessons.filter((l) => l.date === dateStr);

      appendCards(dayTasks, taskContainer, "task");
      appendCards(dayGoals, goalContainer, "goal");
      appendLessonCards(dayLessons, lessonContainer);

      dayCard.appendChild(dayHeader);
      dayCard.appendChild(dayContent);

      // Toggle functionality
      dayHeader.addEventListener("click", () => {
        const isExpanded = dayContent.classList.contains("expanded");
        const toggle = dayHeader.querySelector(".day-toggle");
        
        // Close all other day cards
        document.querySelectorAll(".day-content").forEach(content => {
          content.classList.remove("expanded");
        });
        document.querySelectorAll(".day-toggle").forEach(t => {
          t.classList.remove("expanded");
        });
        
        // Toggle current card
        if (!isExpanded) {
          dayContent.classList.add("expanded");
          toggle.classList.add("expanded");
        }
      });

      scheduleContainer.appendChild(dayCard);
    }
  } catch (error) {
    console.error("Error loading schedule data:", error);
    scheduleContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">Unable to load schedule</div>
        <div class="empty-state-subtext">Please check your connection and try again</div>
      </div>
    `;
  }
});

function appendCards(items, container, type) {
  if (!items.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">${type === 'task' ? '📝' : type === 'goal' ? '🎯' : '📚'}</div>
        <div class="empty-state-text">No ${type}s for this day</div>
        <div class="empty-state-subtext">Add some ${type}s to get started</div>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const card = createItemCard(item, type);
    container.appendChild(card);
  });
}

function appendLessonCards(lessons, container) {
  if (!lessons.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">No lessons for this day</div>
        <div class="empty-state-subtext">Add some lessons to get started</div>
      </div>
    `;
    return;
  }
  
  lessons.forEach((lesson) => {
    const card = createItemCard(lesson, "lesson");
    container.appendChild(card);
  });
}

function createItemCard(item, type) {
  const card = document.createElement("div");
  card.className = "day-item-card";
  
  const title = item.text || item.title || "Untitled";
  const description = item.notes || item.description || "";
  const time = item.time ? formatTime(item.time) : "";
  const status = item.completed ? "completed" : "pending";
  const statusText = item.completed ? "Completed" : "Pending";
  
  let metaContent = "";
  if (type === "lesson") {
    const category = item.category || "N/A";
    const priority = item.priority || "Normal";
    metaContent = `
      <span>📚 ${category}</span>
      <span>⭐ ${priority}</span>
    `;
  } else {
    metaContent = `
      <span>🕐 ${time || "No time set"}</span>
      <span class="day-item-status ${status}">${statusText}</span>
    `;
  }

  card.innerHTML = `
    <h4 class="day-item-title">${title}</h4>
    ${description ? `<p class="day-item-description">${description}</p>` : ""}
    <div class="day-item-meta">
      ${metaContent}
    </div>
  `;
  
  return card;
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  const adjusted = hour % 12 === 0 ? 12 : hour % 12;
  return `${adjusted}:${m} ${suffix}`;
}

function formatPrettyDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Quick Actions Functionality
function initializeQuickActions() {
  const quickActionsBtn = document.getElementById("quick-actions-btn");
  const fab = document.getElementById("fab");
  const desktopDrawer = document.getElementById("desktopDrawer");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const desktopDrawerClose = document.getElementById("desktop-drawer-close");
  const mobileDrawerClose = document.getElementById("mobile-drawer-close");

  // Desktop quick actions
  quickActionsBtn.addEventListener("click", () => {
    desktopDrawer.classList.remove("hidden");
  });

  desktopDrawerClose.addEventListener("click", () => {
    desktopDrawer.classList.add("hidden");
  });

  // Mobile quick actions
  fab.addEventListener("click", () => {
    mobileDrawer.classList.remove("hidden");
  });

  mobileDrawerClose.addEventListener("click", () => {
    mobileDrawer.classList.add("hidden");
  });

  // Action buttons
  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener("click", (e) => {
      const action = e.currentTarget.getAttribute("data-action");
      openModal(action);
      
      // Close drawers
      desktopDrawer.classList.add("hidden");
      mobileDrawer.classList.add("hidden");
    });
  });

  // Modal functionality
  initializeModals();
}

function openModal(type) {
  const modal = document.getElementById(`${type}Popup`);
  const closeBtn = document.getElementById(`${type}-close`);
  const form = document.getElementById(`${type}Form`);
  const input = document.getElementById(`${type}Input`);

  modal.classList.remove("hidden");
  input.focus();

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    try {
      const response = await fetch(`https://avdevplanner.onrender.com/${type}s`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          date: new Date().toLocaleDateString("en-CA"),
          completed: false,
        }),
      });

      if (response.ok) {
        modal.classList.add("hidden");
        input.value = "";
        // Reload the page to show new item
        location.reload();
      } else {
        console.error("Failed to add item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

function initializeModals() {
  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.add("hidden");
      });
    }
  });
}

// Close expanded sections when clicking outside
document.addEventListener("click", (event) => {
  const insideAnyDay = event.target.closest(".day-card");
  if (!insideAnyDay) {
    document.querySelectorAll(".day-content").forEach((content) => {
      content.classList.remove("expanded");
    });
    document.querySelectorAll(".day-toggle").forEach((toggle) => {
      toggle.classList.remove("expanded");
    });
  }
});
