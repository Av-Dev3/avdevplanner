document.addEventListener("DOMContentLoaded", () => {
  const weekRange = document.getElementById("week-range");
  const daysContainer = document.getElementById("weekly-days");
  const reflectionForm = document.getElementById("weekly-reflection-form");
  const whatWentWellInput = document.getElementById("what-went-well");
  const whatToImproveInput = document.getElementById("what-to-improve");
  const reflectionsContainer = document.getElementById("weekly-reflection-entries");

  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - sunday.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return date;
  });

  const start = formatDate(weekDates[0]);
  const end = formatDate(weekDates[6]);
  const weekId = weekDates[0].toISOString().split("T")[0];

  if (weekRange) weekRange.textContent = `Week of ${start} – ${end}`;

  // Create day cards
  weekDates.forEach((date) => {
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const isoDate = date.toLocaleDateString("en-CA"); // yyyy-mm-dd
    createDayCard(formatted, isoDate, date);
  });

  function formatDate(d) {
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${suffix}`;
  }

  function createDayCard(dayLabel, isoDate, date) {
    const dayCard = document.createElement("div");
    dayCard.className = "day-card";
    
    const isToday = date.toDateString() === today.toDateString();
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = date.getDate();
    
    dayCard.innerHTML = `
      <div class="day-header ${isToday ? 'today' : ''}">
        <div class="day-title">
          <span class="day-name">${dayName}</span>
          <span class="day-number">${dayNumber}</span>
        </div>
        <div class="day-date">${dayLabel}</div>
        <button class="day-toggle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6,9 12,15 18,9"/>
          </svg>
        </button>
      </div>
      <div class="day-content">
        <div class="day-content-grid">
          <div class="day-section-card">
            <div class="day-section-title">
              <svg class="day-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              Tasks
            </div>
            <div class="day-items" id="tasks-${isoDate}">
              <div class="empty-state">
                <div class="empty-state-text">Loading tasks...</div>
              </div>
            </div>
          </div>
          
          <div class="day-section-card">
            <div class="day-section-title">
              <svg class="day-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Goals
            </div>
            <div class="day-items" id="goals-${isoDate}">
              <div class="empty-state">
                <div class="empty-state-text">Loading goals...</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="day-content-full">
          <div class="day-section-card">
            <div class="day-section-title">
              <svg class="day-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                <path d="M2 17L12 22L22 17"/>
                <path d="M2 12L12 17L22 12"/>
              </svg>
              Lessons
            </div>
            <div class="day-items" id="lessons-${isoDate}">
              <div class="empty-state">
                <div class="empty-state-text">Loading lessons...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const toggle = dayCard.querySelector(".day-toggle");
    const content = dayCard.querySelector(".day-content");
    
    toggle.addEventListener("click", () => {
      content.classList.toggle("expanded");
      toggle.classList.toggle("expanded");
    });

    daysContainer.appendChild(dayCard);
    
    // Load data for this day
    loadDayData(isoDate);
  }

  function createDayItemCard(item, type) {
    const card = document.createElement("div");
    card.className = "day-item-card";
    
    let title, description, meta = [];
    
    switch(type) {
      case 'task':
        title = item.text || item.title || 'Untitled Task';
        description = item.notes || '';
        if (item.time) meta.push(`Time: ${formatTime(item.time)}`);
        if (item.prettyDate) meta.push(`Date: ${formatCardDate(item.prettyDate)}`);
        break;
      case 'goal':
        title = item.title || 'Untitled Goal';
        description = item.notes || '';
        if (item.prettyDate) meta.push(`Date: ${formatCardDate(item.prettyDate)}`);
        break;
      case 'lesson':
        title = item.title || 'Untitled Lesson';
        description = `${item.description || ''}${item.notes ? ` (${item.notes})` : ''}`;
        if (item.category) meta.push(`Category: ${item.category}`);
        if (item.priority) meta.push(`Priority: ${item.priority}`);
        if (item.prettyDate) meta.push(`Date: ${formatCardDate(item.prettyDate)}`);
        break;
    }
    
    const statusClass = item.completed ? 'completed' : 'pending';
    const statusText = item.completed ? 'Completed' : 'Pending';
    
    card.innerHTML = `
      <div class="day-item-title">${title}</div>
      ${description ? `<div class="day-item-description">${description}</div>` : ''}
      <div class="day-item-meta">
        ${meta.map(m => `<span>${m}</span>`).join('')}
        <span class="day-item-status ${statusClass}">${statusText}</span>
      </div>
    `;
    
    return card;
  }

  async function loadDayData(isoDate) {
    try {
      const [tasksRes, goalsRes, lessonsRes] = await Promise.all([
        fetch("https://avdevplanner.onrender.com/tasks"),
        fetch("https://avdevplanner.onrender.com/goals"),
        fetch("https://avdevplanner.onrender.com/lessons"),
      ]);

      const tasks = await tasksRes.json();
      const goals = await goalsRes.json();
      const lessons = await lessonsRes.json();

      const todayTasks = tasks.filter((t) => t.date === isoDate);
      const todayGoals = goals.filter((g) => g.date === isoDate);
      const todayLessons = lessons.filter((l) => l.date === isoDate);

      // Populate tasks
      const tasksContainer = document.getElementById(`tasks-${isoDate}`);
      if (todayTasks.length === 0) {
        tasksContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-text">No tasks for this day</div>
            <div class="empty-state-subtext">Tasks will appear here when added</div>
          </div>
        `;
      } else {
        tasksContainer.innerHTML = '';
        todayTasks.forEach((task) => {
          tasksContainer.appendChild(createDayItemCard(task, 'task'));
        });
      }

      // Populate goals
      const goalsContainer = document.getElementById(`goals-${isoDate}`);
      if (todayGoals.length === 0) {
        goalsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-text">No goals for this day</div>
            <div class="empty-state-subtext">Goals will appear here when added</div>
          </div>
        `;
      } else {
        goalsContainer.innerHTML = '';
        todayGoals.forEach((goal) => {
          goalsContainer.appendChild(createDayItemCard(goal, 'goal'));
        });
      }

      // Populate lessons
      const lessonsContainer = document.getElementById(`lessons-${isoDate}`);
      if (todayLessons.length === 0) {
        lessonsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-text">No lessons for this day</div>
            <div class="empty-state-subtext">Lessons will appear here when added</div>
          </div>
        `;
      } else {
        lessonsContainer.innerHTML = '';
        todayLessons.forEach((lesson) => {
          lessonsContainer.appendChild(createDayItemCard(lesson, 'lesson'));
        });
      }

    } catch (err) {
      console.error("Error loading day data:", err);
      const containers = [
        document.getElementById(`tasks-${isoDate}`),
        document.getElementById(`goals-${isoDate}`),
        document.getElementById(`lessons-${isoDate}`)
      ];
      
      containers.forEach(container => {
        if (container) {
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-state-text">Error loading data</div>
              <div class="empty-state-subtext">Please try refreshing the page</div>
            </div>
          `;
        }
      });
    }
  }

  async function loadReflections() {
    try {
      const res = await fetch("https://avdevplanner.onrender.com/reflections");
      const reflections = await res.json();

      reflectionsContainer.innerHTML = "";

      if (Object.keys(reflections).length === 0) {
        reflectionsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-text">No reflections yet</div>
            <div class="empty-state-subtext">Your weekly reflections will appear here</div>
          </div>
        `;
        return;
      }

      for (const [week, data] of Object.entries(reflections)) {
        const entry = document.createElement("div");
        entry.className = "reflection-entry";
        entry.innerHTML = `
          <div class="reflection-date">Week of ${formatCardDate(week)}</div>
          <div class="reflection-content">
            <div class="reflection-section-title">What went well:</div>
            <div>${data.what_went_well || "—"}</div>
            <div class="reflection-section-title">What to improve:</div>
            <div>${data.what_to_improve || "—"}</div>
          </div>
        `;
        reflectionsContainer.appendChild(entry);
      }
    } catch (err) {
      console.error("Failed to load reflections:", err);
      reflectionsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-text">Error loading reflections</div>
          <div class="empty-state-subtext">Please try refreshing the page</div>
        </div>
      `;
    }
  }

  // Handle reflection form submission
  reflectionForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const whatWentWell = whatWentWellInput?.value.trim();
    const whatToImprove = whatToImproveInput?.value.trim();

    if (!whatWentWell && !whatToImprove) {
      alert("Please fill in at least one field.");
      return;
    }

    const submitBtn = reflectionForm.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
      const res = await fetch("https://avdevplanner.onrender.com/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week: weekId,
          what_went_well: whatWentWell,
          what_to_improve: whatToImprove,
        }),
      });

      if (res.ok) {
        whatWentWellInput.value = "";
        whatToImproveInput.value = "";
        await loadReflections();
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Reflection saved successfully!';
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--success-bg);
          color: var(--success-text);
          padding: 1rem;
          border-radius: var(--border-radius-sm);
          z-index: 1000;
          animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      } else {
        alert("Error saving reflection. Please try again.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving reflection. Please check your connection and try again.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

  // Load initial reflections
  loadReflections();

  // Add CSS for success message animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
});
