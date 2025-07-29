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

      // Debug modal content
      console.log("Modal content after population:");
      console.log("Tasks container:", document.getElementById("modal-tasks").innerHTML);
      console.log("Goals container:", document.getElementById("modal-goals").innerHTML);
      console.log("Lessons container:", document.getElementById("modal-lessons").innerHTML);

      // Show modal
      dayModal.classList.remove("hidden");
      console.log("Modal should now be visible");
      console.log("Modal element:", dayModal);
      console.log("Modal classes:", dayModal.className);
      console.log("Modal display:", dayModal.style.display);
      console.log("Modal visibility:", dayModal.style.visibility);
      console.log("Modal computed display:", window.getComputedStyle(dayModal).display);
      console.log("Modal computed visibility:", window.getComputedStyle(dayModal).visibility);
      console.log("Modal computed opacity:", window.getComputedStyle(dayModal).opacity);
      console.log("Modal computed z-index:", window.getComputedStyle(dayModal).zIndex);
      
      // Force modal to be visible on mobile
      dayModal.style.display = "flex";
      dayModal.style.visibility = "visible";
      dayModal.style.opacity = "1";
      dayModal.style.zIndex = "1000";
      
      // Additional mobile-specific styles
      dayModal.style.position = "fixed";
      dayModal.style.top = "0";
      dayModal.style.left = "0";
      dayModal.style.right = "0";
      dayModal.style.bottom = "0";
      dayModal.style.width = "100vw";
      dayModal.style.height = "100vh";
      dayModal.style.background = "rgba(0, 0, 0, 0.8)";
      dayModal.style.alignItems = "center";
      dayModal.style.justifyContent = "center";
      dayModal.style.transform = "none";

      // Debug modal visibility
      console.log("Modal final computed styles:");
      console.log("Display:", window.getComputedStyle(dayModal).display);
      console.log("Visibility:", window.getComputedStyle(dayModal).visibility);
      console.log("Opacity:", window.getComputedStyle(dayModal).opacity);
      console.log("Z-index:", window.getComputedStyle(dayModal).zIndex);
      console.log("Position:", window.getComputedStyle(dayModal).position);
      console.log("Top:", window.getComputedStyle(dayModal).top);
      console.log("Left:", window.getComputedStyle(dayModal).left);
      console.log("Width:", window.getComputedStyle(dayModal).width);
      console.log("Height:", window.getComputedStyle(dayModal).height);
      console.log("Background:", window.getComputedStyle(dayModal).background);
      console.log("Modal is in DOM:", document.body.contains(dayModal));

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
    console.log("Creating mobile list...");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    console.log(`Creating ${daysInMonth} mobile day items`);

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

      // Add click/touch event for mobile - single handler
      dayItem.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Mobile day clicked:", date);
        console.log("Event target:", e.target);
        console.log("Day item element:", dayItem);
        showDayDetails(date);
      });

      mobileScheduleList.appendChild(dayItem);
    }
    console.log("Mobile list created with", daysInMonth, "items");
    console.log("Mobile schedule list element:", mobileScheduleList);
  }
});
