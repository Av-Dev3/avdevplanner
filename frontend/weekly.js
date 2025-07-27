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
    const dayClass = dayName.toLowerCase();
    
    dayCard.innerHTML = `
      <div class="day-header ${dayClass} ${isToday ? 'today' : ''}">
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
      <div class="day-content" style="display: none;">
        <!-- Tasks Carousel -->
        <div class="content-card tasks-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22,4 12,14.01 9,11.01"/>
                </svg>
              </div>
              <h3>Tasks</h3>
            </div>
            <div class="card-actions">
              <button class="carousel-arrow prev" data-carousel="tasks-${isoDate}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <button class="carousel-arrow next" data-carousel="tasks-${isoDate}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="carousel__container" id="tasks-${isoDate}">
              <!-- JS will populate tasks here -->
            </div>
          </div>
        </div>
        
        <!-- Goals Carousel -->
        <div class="content-card goals-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3>Goals</h3>
            </div>
            <div class="card-actions">
              <button class="carousel-arrow prev" data-carousel="goals-${isoDate}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <button class="carousel-arrow next" data-carousel="goals-${isoDate}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="carousel__container" id="goals-${isoDate}">
              <!-- JS will populate goals here -->
            </div>
          </div>
        </div>
        
        <!-- Lessons Carousel -->
        <div class="content-card lessons-card">
          <div class="card-header">
            <div class="card-title">
              <div class="title-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                  <path d="M2 17L12 22L22 17"/>
                  <path d="M2 12L12 17L22 12"/>
                </svg>
              </div>
              <h3>Lessons</h3>
            </div>
            <div class="card-actions">
              <button class="carousel-arrow prev" data-carousel="lessons-${isoDate}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15,18 9,12 15,6"/>
                </svg>
              </button>
              <button class="carousel-arrow next" data-carousel="lessons-${isoDate}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="card-content">
            <div class="carousel__container" id="lessons-${isoDate}">
              <!-- JS will populate lessons here -->
            </div>
          </div>
        </div>
      </div>
    `;

    const dayHeader = dayCard.querySelector(".day-header");
    const toggle = dayCard.querySelector(".day-toggle");
    const content = dayCard.querySelector(".day-content");
    
    dayHeader.addEventListener("click", () => {
      if (content.style.display === "none" || content.style.display === "") {
        content.style.display = "block";
        toggle.classList.add("expanded");
      } else {
        content.style.display = "none";
        toggle.classList.remove("expanded");
      }
    });

    daysContainer.appendChild(dayCard);
    
    // Load data for this day
    loadDayData(isoDate);
  }

  // Carousel setup functions (copied from dashboard)
  function setupCarousel(containerId, items, createCardFunction) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    
    if (!items || items.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-text">No items for this day</div>
          <div class="empty-state-subtext">Items will appear here when added</div>
        </div>
      `;
      return;
    }

    items.forEach((item, index) => {
      const card = createCardFunction(item, index);
      container.appendChild(card);
    });

    // Setup carousel functionality
    let currentIndex = 0;
    const cards = container.querySelectorAll('.carousel__card');
    const totalCards = cards.length;

    if (totalCards === 0) return;

    function updateCarouselDisplay() {
      cards.forEach((card, index) => {
        card.style.display = index === currentIndex ? 'block' : 'none';
        card.style.opacity = index === currentIndex ? '1' : '0';
      });
    }

    // Setup arrow buttons
    const prevBtn = document.querySelector(`[data-carousel="${containerId}"].prev`);
    const nextBtn = document.querySelector(`[data-carousel="${containerId}"].next`);

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalCards - 1;
        updateCarouselDisplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = currentIndex < totalCards - 1 ? currentIndex + 1 : 0;
        updateCarouselDisplay();
      });
    }

    // Setup touch/swipe for mobile
    let startX = 0;
    let endX = 0;

    container.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });

    container.addEventListener('touchend', (e) => {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
    });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = startX - endX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next
          currentIndex = currentIndex < totalCards - 1 ? currentIndex + 1 : 0;
        } else {
          // Swipe right - previous
          currentIndex = currentIndex > 0 ? currentIndex - 1 : totalCards - 1;
        }
        updateCarouselDisplay();
      }
    }

    // Initialize display
    updateCarouselDisplay();
  }

  function createTaskCard(task, index) {
    const div = document.createElement("div");
    div.className = "carousel__card";
    const taskId = task.originalIndex !== undefined ? task.originalIndex : (task.id || task._id || task.taskId || '');
    div.innerHTML = `
      <h3 class="font-semibold mb-1">${task.text || task.title || "Untitled Task"}</h3>
      ${task.notes ? `<p class="mb-1">${task.notes}</p>` : ""}
      ${task.time ? `<p><small>Time: ${formatTime(task.time)}</small></p>` : ""}
      <p class="text-xs text-gray-400">${task._vegasDateStr || ""}</p>
      ${
        !task.completed && taskId
          ? `<button class="mark-complete-btn mt-2" data-type="task" data-id="${taskId}">Mark Complete</button>`
          : !task.completed && !taskId
          ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
          : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
      }
    `;
    return div;
  }

  function createGoalCard(goal, index) {
    const div = document.createElement("div");
    div.className = "carousel__card";
    const goalId = goal.originalIndex !== undefined ? goal.originalIndex : (goal.index || goal.id || goal._id || goal.goalId || '');
    div.innerHTML = `
      <h3 class="font-semibold mb-1">${goal.title}</h3>
      ${goal.notes ? `<p class="mb-1">${goal.notes}</p>` : ""}
      <p class="text-xs text-gray-400">${goal._vegasDateStr || ""}</p>
      ${
        !goal.completed && goalId !== ''
          ? `<button class="mark-complete-btn mt-2" data-type="goal" data-id="${goalId}">Mark Complete</button>`
          : !goal.completed && goalId === ''
          ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
          : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
      }
    `;
    return div;
  }

  function createLessonCard(lesson, index) {
    const div = document.createElement("div");
    div.className = "carousel__card";
    const lessonId = lesson.id || lesson._id || lesson.lessonId || '';
    div.innerHTML = `
      <h3 class="font-semibold mb-1">${lesson.title}</h3>
      ${lesson.description ? `<p class="mb-1">${lesson.description}</p>` : ""}
      <p class="text-xs text-gray-400">${lesson._vegasDateStr || ""}</p>
      ${
        !lesson.completed && lessonId
          ? `<button class="mark-complete-btn mt-2" data-type="lesson" data-id="${lessonId}">Mark Complete</button>`
          : !lesson.completed && !lessonId
          ? `<span class="text-yellow-500 font-semibold block mt-2">No ID available</span>`
          : `<span class="text-green-500 font-semibold block mt-2">Completed</span>`
      }
    `;
    return div;
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

      const todayTasks = tasks
        .map((task, index) => ({ ...task, originalIndex: index }))
        .filter((t) => t.date === isoDate);
      const todayGoals = goals
        .map((goal, index) => ({ ...goal, originalIndex: index }))
        .filter((g) => g.date === isoDate);
      const todayLessons = lessons
        .map((lesson, index) => ({ ...lesson, originalIndex: index }))
        .filter((l) => l.date === isoDate);

      // Setup carousels using the dashboard system
      setupCarousel(`tasks-${isoDate}`, todayTasks, createTaskCard);
      setupCarousel(`goals-${isoDate}`, todayGoals, createGoalCard);
      setupCarousel(`lessons-${isoDate}`, todayLessons, createLessonCard);

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
          <div class="daily-empty">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <h3>No Reflections Yet</h3>
            <p>Add a weekly reflection to track your progress</p>
          </div>
        `;
        return;
      }

      for (const [week, data] of Object.entries(reflections)) {
        const entry = document.createElement("div");
        entry.className = "log-entry-card";
        entry.innerHTML = `
          <h4>Week of ${formatCardDate(week)}</h4>
          <div class="reflection-content">
            <p><strong>What went well:</strong> ${data.what_went_well || "—"}</p>
            <p><strong>What to improve:</strong> ${data.what_to_improve || "—"}</p>
          </div>
          <div class="entry-meta">
            <div>${formatCardDate(week)}</div>
          </div>
        `;
        reflectionsContainer.appendChild(entry);
      }
    } catch (err) {
      console.error("Failed to load reflections:", err);
      reflectionsContainer.innerHTML = `
        <div class="daily-empty">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <h3>Error Loading Reflections</h3>
          <p>There was an error loading your reflections</p>
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

  // Handle mark complete buttons
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('mark-complete-btn')) {
      const type = e.target.getAttribute('data-type');
      const id = e.target.getAttribute('data-id');
      
      if (!id || id === 'undefined') {
        console.log('No ID available for mark complete');
        return;
      }

      try {
        const endpoint = `https://avdevplanner.onrender.com/${type}s/${id}/toggle`;
        const response = await fetch(endpoint, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Reload the specific day's data
          const container = e.target.closest('.carousel__container');
          if (container) {
            const containerId = container.id;
            const isoDate = containerId.replace('tasks-', '').replace('goals-', '').replace('lessons-', '');
            await loadDayData(isoDate);
          }
        } else {
          console.error('Failed to mark item complete');
        }
      } catch (error) {
        console.error('Error marking item complete:', error);
      }
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
