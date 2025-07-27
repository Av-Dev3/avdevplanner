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
        </div>
        
        <div class="day-content-full">
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
    const card = document.createElement('div');
    card.className = 'carousel__card';
    
    const taskId = task.id || task._id || task.taskId || index;
    const statusClass = task.completed ? 'completed' : 'pending';
    const statusText = task.completed ? 'Completed' : 'Pending';
    
    card.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${task.text || task.title || 'Untitled Task'}</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        ${task.notes ? `<p class="card-description">${task.notes}</p>` : ''}
        <div class="card-meta">
          ${task.time ? `<span class="meta-item">Time: ${formatTime(task.time)}</span>` : ''}
          ${task.prettyDate ? `<span class="meta-item">Date: ${formatCardDate(task.prettyDate)}</span>` : ''}
        </div>
        <button class="mark-complete-btn" data-type="task" data-id="${taskId}">
          Mark Complete
        </button>
      </div>
    `;
    
    return card;
  }

  function createGoalCard(goal, index) {
    const card = document.createElement('div');
    card.className = 'carousel__card';
    
    const goalId = goal.id || goal._id || goal.goalId || index;
    const statusClass = goal.completed ? 'completed' : 'pending';
    const statusText = goal.completed ? 'Completed' : 'Pending';
    
    card.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${goal.title || 'Untitled Goal'}</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        ${goal.notes ? `<p class="card-description">${goal.notes}</p>` : ''}
        <div class="card-meta">
          ${goal.prettyDate ? `<span class="meta-item">Date: ${formatCardDate(goal.prettyDate)}</span>` : ''}
        </div>
        <button class="mark-complete-btn" data-type="goal" data-id="${goalId}">
          Mark Complete
        </button>
      </div>
    `;
    
    return card;
  }

  function createLessonCard(lesson, index) {
    const card = document.createElement('div');
    card.className = 'carousel__card';
    
    const lessonId = lesson.id || lesson._id || lesson.lessonId || index;
    const statusClass = lesson.completed ? 'completed' : 'pending';
    const statusText = lesson.completed ? 'Completed' : 'Pending';
    
    card.innerHTML = `
      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">${lesson.title || 'Untitled Lesson'}</h3>
          <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        ${lesson.description ? `<p class="card-description">${lesson.description}</p>` : ''}
        ${lesson.notes ? `<p class="card-notes">${lesson.notes}</p>` : ''}
        <div class="card-meta">
          ${lesson.category ? `<span class="meta-item">Category: ${lesson.category}</span>` : ''}
          ${lesson.priority ? `<span class="meta-item">Priority: ${lesson.priority}</span>` : ''}
          ${lesson.prettyDate ? `<span class="meta-item">Date: ${formatCardDate(lesson.prettyDate)}</span>` : ''}
        </div>
        <button class="mark-complete-btn" data-type="lesson" data-id="${lessonId}">
          Mark Complete
        </button>
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
