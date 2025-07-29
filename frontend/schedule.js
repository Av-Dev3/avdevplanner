document.addEventListener("DOMContentLoaded", async () => {
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  const calendarDays = document.getElementById("calendar-days");
  const mobileScheduleList = document.getElementById("mobile-schedule-list");
  const currentMonthElement = document.getElementById("current-month");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const dayModal = document.getElementById("dayModal");
  const dayModalClose = document.getElementById("day-modal-close");
  const modalDayTitle = document.getElementById("modal-day-title");

  // Initialize calendar
  updateCalendar();

  // Event listeners
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateCalendar();
  });

  dayModalClose.addEventListener("click", () => {
    dayModal.classList.add("hidden");
  });

  // Close modal when clicking outside
  dayModal.addEventListener("click", (e) => {
    if (e.target === dayModal) {
      dayModal.classList.add("hidden");
    }
  });

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !dayModal.classList.contains("hidden")) {
      dayModal.classList.add("hidden");
    }
  });

  async function updateCalendar() {
    // Update month title
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Clear calendar
    calendarDays.innerHTML = "";
    mobileScheduleList.innerHTML = "";

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Create calendar grid for desktop
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = createDayElement(date);
      calendarDays.appendChild(dayElement);
    }

    // Create mobile list view
    createMobileList();

    // Load data for the current month
    await loadMonthData();
  }

  function createDayElement(date) {
    const dayElement = document.createElement("div");
    const dayNumber = date.getDate();
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = date.toDateString() === new Date().toDateString();
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    dayElement.className = "calendar-day";
    dayElement.setAttribute("data-day", dayOfWeek.toString());
    
    if (!isCurrentMonth) {
      dayElement.classList.add("other-month");
    }
    if (isToday) {
      dayElement.classList.add("today");
    }

    dayElement.innerHTML = `
      <div class="day-number">${dayNumber}</div>
      <div class="day-events" id="events-${date.toISOString().split('T')[0]}">
        <!-- Events will be populated here -->
      </div>
    `;

    // Enhanced touch and click handling for mobile and desktop
    dayElement.addEventListener("click", (e) => {
      console.log("Click event triggered for date:", date);
      e.preventDefault();
      e.stopPropagation();
      showDayDetails(date);
    });

    // Touch handling for mobile
    dayElement.addEventListener("touchend", (e) => {
      console.log("Touch end event triggered for date:", date);
      e.preventDefault();
      e.stopPropagation();
      showDayDetails(date);
    });

    // Also add touchstart to prevent default behavior
    dayElement.addEventListener("touchstart", (e) => {
      console.log("Touch start event triggered for date:", date);
    }, { passive: true });

    return dayElement;
  }

  async function loadMonthData() {
    try {
      const [tasks, goals, lessons] = await Promise.all([
        fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
        fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
        fetch("https://avdevplanner.onrender.com/lessons").then((res) => res.json()),
      ]);

      // Group data by date
      const dataByDate = {};

      // Process tasks
      tasks.forEach(task => {
        const date = task.date;
        if (!dataByDate[date]) {
          dataByDate[date] = { tasks: [], goals: [], lessons: [] };
        }
        dataByDate[date].tasks.push(task);
      });

      // Process goals
      goals.forEach(goal => {
        const date = goal.date;
        if (!dataByDate[date]) {
          dataByDate[date] = { tasks: [], goals: [], lessons: [] };
        }
        dataByDate[date].goals.push(goal);
      });

      // Process lessons
      lessons.forEach(lesson => {
        const date = lesson.date;
        if (!dataByDate[date]) {
          dataByDate[date] = { tasks: [], goals: [], lessons: [] };
        }
        dataByDate[date].lessons.push(lesson);
      });

      // Populate calendar with events
      Object.keys(dataByDate).forEach(date => {
        const eventsContainer = document.getElementById(`events-${date}`);
        if (eventsContainer) {
          const dayData = dataByDate[date];
          const totalEvents = dayData.tasks.length + dayData.goals.length + dayData.lessons.length;
          
          if (totalEvents > 0) {
            // Add has-events class to the day
            const dayElement = eventsContainer.closest('.calendar-day');
            dayElement.classList.add('has-events');

            // Show event indicators
            if (dayData.tasks.length > 0) {
              const taskIndicator = document.createElement("div");
              taskIndicator.className = "event-indicator task";
              taskIndicator.textContent = `${dayData.tasks.length} task${dayData.tasks.length > 1 ? 's' : ''}`;
              eventsContainer.appendChild(taskIndicator);
            }

            if (dayData.goals.length > 0) {
              const goalIndicator = document.createElement("div");
              goalIndicator.className = "event-indicator goal";
              goalIndicator.textContent = `${dayData.goals.length} goal${dayData.goals.length > 1 ? 's' : ''}`;
              eventsContainer.appendChild(goalIndicator);
            }

            if (dayData.lessons.length > 0) {
              const lessonIndicator = document.createElement("div");
              lessonIndicator.className = "event-indicator lesson";
              lessonIndicator.textContent = `${dayData.lessons.length} lesson${dayData.lessons.length > 1 ? 's' : ''}`;
              eventsContainer.appendChild(lessonIndicator);
            }
          }
        }

        // Populate mobile list with events
        const mobileDayItem = document.querySelector(`[data-date="${date}"]`);
        if (mobileDayItem) {
          const dayData = dataByDate[date];
          const totalEvents = dayData.tasks.length + dayData.goals.length + dayData.lessons.length;
          
          if (totalEvents > 0) {
            const eventsContainer = mobileDayItem.querySelector('.mobile-day-events');
            eventsContainer.innerHTML = ''; // Clear "No events scheduled"
            
            if (dayData.tasks.length > 0) {
              const taskBadge = document.createElement("div");
              taskBadge.className = "mobile-event-badge task";
              taskBadge.textContent = `${dayData.tasks.length} task${dayData.tasks.length > 1 ? 's' : ''}`;
              eventsContainer.appendChild(taskBadge);
            }

            if (dayData.goals.length > 0) {
              const goalBadge = document.createElement("div");
              goalBadge.className = "mobile-event-badge goal";
              goalBadge.textContent = `${dayData.goals.length} goal${dayData.goals.length > 1 ? 's' : ''}`;
              eventsContainer.appendChild(goalBadge);
            }

            if (dayData.lessons.length > 0) {
              const lessonBadge = document.createElement("div");
              lessonBadge.className = "mobile-event-badge lesson";
              lessonBadge.textContent = `${dayData.lessons.length} lesson${dayData.lessons.length > 1 ? 's' : ''}`;
              eventsContainer.appendChild(lessonBadge);
            }
          }
        }
      });

    } catch (error) {
      console.error("Error loading month data:", error);
    }
  }

  async function showDayDetails(date) {
    console.log("showDayDetails called for date:", date);
    
    const dateStr = date.toLocaleDateString("en-CA");
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    modalDayTitle.textContent = formattedDate;

    try {
      const [tasks, goals, lessons] = await Promise.all([
        fetch("https://avdevplanner.onrender.com/tasks").then((res) => res.json()),
        fetch("https://avdevplanner.onrender.com/goals").then((res) => res.json()),
        fetch("https://avdevplanner.onrender.com/lessons").then((res) => res.json()),
      ]);

      const dayTasks = tasks.filter(t => t.date === dateStr);
      const dayGoals = goals.filter(g => g.date === dateStr);
      const dayLessons = lessons.filter(l => l.date === dateStr);

      console.log("Day data loaded:", { dayTasks, dayGoals, dayLessons });

      // Populate modal sections
      populateModalSection("modal-tasks", dayTasks, "task");
      populateModalSection("modal-goals", dayGoals, "goal");
      populateModalSection("modal-lessons", dayLessons, "lesson");

      // Show modal
      dayModal.classList.remove("hidden");
      console.log("Modal should now be visible");
      
      // Force modal to be visible on mobile
      dayModal.style.display = "flex";
      dayModal.style.visibility = "visible";
      dayModal.style.opacity = "1";
      dayModal.style.zIndex = "1000";

    } catch (error) {
      console.error("Error loading day details:", error);
    }
  }

  function populateModalSection(containerId, items, type) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (items.length === 0) {
      container.innerHTML = `<div class="empty-detail">No ${type}s for this day</div>`;
      return;
    }

    items.forEach(item => {
      const itemElement = createDetailItem(item, type);
      container.appendChild(itemElement);
    });
  }

  function createDetailItem(item, type) {
    const itemElement = document.createElement("div");
    itemElement.className = "detail-item";

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
        <span class="detail-item-status ${status}">${statusText}</span>
      `;
    }

    itemElement.innerHTML = `
      <div class="detail-item-title">${title}</div>
      ${description ? `<div class="detail-item-description">${description}</div>` : ""}
      <div class="detail-item-meta">
        ${metaContent}
      </div>
    `;

    return itemElement;
  }

  function formatTime(timeStr) {
    if (!timeStr) return "";
    const time = new Date(`2000-01-01T${timeStr}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function createMobileList() {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayName = dayNames[date.getDay()];
      const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });

      const dayItem = document.createElement("div");
      dayItem.className = "mobile-day-item";
      dayItem.setAttribute("data-date", date.toISOString().split('T')[0]);
      dayItem.setAttribute("data-day", date.getDay().toString());

      dayItem.innerHTML = `
        <div class="mobile-day-header">
          <div class="mobile-day-date">${formattedDate}</div>
          <div class="mobile-day-name">${dayName}</div>
        </div>
        <div class="mobile-day-events">
          <div class="mobile-no-events">No events scheduled</div>
        </div>
      `;

      // Add click event for mobile
      dayItem.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Mobile day clicked:", date);
        showDayDetails(date);
      });

      // Add touch event for mobile
      dayItem.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Mobile day touched:", date);
        showDayDetails(date);
      }, { passive: false });

      mobileScheduleList.appendChild(dayItem);
    }
  }
});
