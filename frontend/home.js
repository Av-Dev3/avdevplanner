document.addEventListener("DOMContentLoaded", () => {
  const pinnedContainer = document.getElementById("pinned-notes-container");
  const focusInput = document.getElementById("daily-focus-input");
  const saveBtn = document.getElementById("save-focus-btn");
  const savedFocusText = document.getElementById("saved-focus-text");

  const tasksCompletedEl = document.getElementById("tasks-completed");
  const goalsCompletedEl = document.getElementById("goals-completed");
  const lessonsCompletedEl = document.getElementById("lessons-completed");

  const taskStreakEl = document.getElementById("task-streak");
  const goalStreakEl = document.getElementById("goal-streak");
  const lessonStreakEl = document.getElementById("lesson-streak");

  const today = new Date().toISOString().split("T")[0];

  // === Load Pinned Notes ===
  fetch("https://avdevplanner.onrender.com/notes")
    .then(res => res.json())
    .then(notes => {
      const pinned = notes.filter(note => note.pinned);

      if (pinned.length === 0) {
        pinnedContainer.innerHTML = "<p>No pinned notes yet.</p>";
        return;
      }

      pinned.forEach(note => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.innerHTML = `
          <h3>${note.title}</h3>
          <p>${note.content}</p>
          <p><small>${note.date ? `Date: ${note.date}` : ""}</small></p>
          <p><small>Created: ${new Date(note.created_at).toLocaleString()}</small></p>
        `;
        pinnedContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Failed to load pinned notes", err);
      pinnedContainer.innerHTML = "<p>Error loading pinned notes.</p>";
    });

  // === Load Daily Focus ===
  fetch(`https://avdevplanner.onrender.com/focus?date=${today}`)
    .then(res => {
      if (!res.ok) throw new Error("No focus found");
      return res.json();
    })
    .then(data => {
      focusInput.value = data.focus || "";
      savedFocusText.textContent = data.focus ? `Saved focus: ${data.focus}` : "";
    })
    .catch(() => {
      savedFocusText.textContent = "No focus saved yet.";
    });

  // === Save Focus ===
  saveBtn.addEventListener("click", async () => {
    const focus = focusInput.value.trim();
    if (!focus) return alert("Please enter a focus.");

    const payload = { date: today, focus };

    const res = await fetch("https://avdevplanner.onrender.com/focus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      savedFocusText.textContent = `Saved focus: ${focus}`;
    } else {
      console.error("Failed to save focus");
      savedFocusText.textContent = "Error saving focus.";
    }
  });

  // === Load Stats & Streaks ===
  Promise.all([
    fetch("https://avdevplanner.onrender.com/tasks").then(res => res.json()),
    fetch("https://avdevplanner.onrender.com/goals").then(res => res.json()),
    fetch("https://avdevplanner.onrender.com/lessons").then(res => res.json())
  ]).then(([tasks, goals, lessons]) => {
    const completedTasks = tasks.filter(t => t.completed);
    const completedGoals = goals.filter(g => g.completed);
    const completedLessons = lessons.filter(l => l.completed);

    tasksCompletedEl.textContent = `Tasks Completed: ${completedTasks.length}`;
    goalsCompletedEl.textContent = `Goals Completed: ${completedGoals.length}`;
    lessonsCompletedEl.textContent = `Lessons Completed: ${completedLessons.length}`;

    const taskStreak = calculateStreak(completedTasks.map(t => t.date));
    const goalStreak = calculateStreak(completedGoals.map(g => g.date));
    const lessonStreak = calculateStreak(completedLessons.map(l => l.date));

    taskStreakEl.textContent = `Task Streak: ${taskStreak} day${taskStreak !== 1 ? "s" : ""}`;
    goalStreakEl.textContent = `Goal Streak: ${goalStreak} day${goalStreak !== 1 ? "s" : ""}`;
    lessonStreakEl.textContent = `Lesson Streak: ${lessonStreak} day${lessonStreak !== 1 ? "s" : ""}`;
  });

  function calculateStreak(datesArray) {
    if (!datesArray.length) return 0;

    const uniqueDates = [...new Set(datesArray)];
    const sortedDates = uniqueDates
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let d of sortedDates) {
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
});
