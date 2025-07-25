document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('fab');
  const drawer = document.getElementById('drawer');
  const siteLinksDrawer = document.getElementById('siteLinksDrawer');

  const path = window.location.pathname;
  const isHome = path.includes('index.html') || path === '/';
  const isNotes = path.includes('notes') && !path.includes('notes.css');
  const isTasks = path.includes('tasks') && !path.includes('tasks.css');
  const isLessons = path.includes('lesson') || path.includes('lessons');
  const isGoals = path.includes('goals');

  let isDrawerOpen = false;
  let longPressTriggered = false;
  let pressTimer;

  if (!fab) {
    console.warn('FAB not found.');
    return;
  }

  fab.addEventListener('click', () => {
    if (longPressTriggered) {
      longPressTriggered = false;
      return;
    }

    isDrawerOpen = !isDrawerOpen;

    if (isHome && drawer) {
      drawer.classList.toggle('drawer-visible', isDrawerOpen);
      siteLinksDrawer?.classList.remove('drawer-visible');
    } else if (isNotes) {
      const notePopup = document.getElementById('noteFormPopup');
      if (notePopup) {
        notePopup.classList.remove('hidden');
        notePopup.addEventListener('click', (e) => {
          if (e.target === notePopup) notePopup.classList.add('hidden');
        });
      }
    } else if (isTasks) {
      const taskPopup = document.getElementById('task-form-popup');
      if (taskPopup) {
        taskPopup.classList.remove('hidden');
        taskPopup.addEventListener('click', (e) => {
          if (e.target === taskPopup) taskPopup.classList.add('hidden');
        });
      }
    } else if (isLessons) {
      const lessonPopup = document.getElementById('lesson-form-popup');
      if (lessonPopup) {
        lessonPopup.classList.remove('hidden');
        lessonPopup.addEventListener('click', (e) => {
          if (e.target === lessonPopup) lessonPopup.classList.add('hidden');
        });
      }
    } else if (isGoals) {
      const goalPopup = document.getElementById('goal-form-popup');
      if (goalPopup) {
        goalPopup.classList.remove('hidden');
        goalPopup.addEventListener('click', (e) => {
          if (e.target === goalPopup) goalPopup.classList.add('hidden');
        });
      }
    } else if (siteLinksDrawer) {
      siteLinksDrawer.classList.toggle('drawer-visible', isDrawerOpen);
      drawer?.classList.remove('drawer-visible');
    }
  });

  if ((isHome || isNotes || isTasks || isLessons || isGoals) && siteLinksDrawer) {
    const startLongPress = () => {
      pressTimer = setTimeout(() => {
        longPressTriggered = true;
        drawer?.classList.remove('drawer-visible');
        siteLinksDrawer.classList.add('drawer-visible');
      }, 600);
    };

    const cancelLongPress = () => clearTimeout(pressTimer);

    fab.addEventListener('mousedown', startLongPress);
    fab.addEventListener('mouseup', cancelLongPress);
    fab.addEventListener('mouseleave', cancelLongPress);
    fab.addEventListener('touchstart', startLongPress);
    fab.addEventListener('touchend', cancelLongPress);
  }

  document.addEventListener('click', (e) => {
    const insideFab = fab.contains(e.target);
    const insideDrawer = drawer?.contains(e.target);
    const insideLinks = siteLinksDrawer?.contains(e.target);

    if (!insideFab && !insideDrawer && !insideLinks) {
      drawer?.classList.remove('drawer-visible');
      siteLinksDrawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    }
  });

  const taskBtn = document.getElementById('addTaskBtn');
  const goalBtn = document.getElementById('addGoalBtn');
  const lessonBtn = document.getElementById('addLessonBtn');

  const showPopup = (id) => {
    const popup = document.getElementById(id);
    if (!popup) return;
    popup.classList.remove('hidden');
    popup.addEventListener('click', (e) => {
      if (e.target === popup) popup.classList.add('hidden');
    });
  };

  if (taskBtn) {
    taskBtn.addEventListener('click', () => {
      showPopup('taskPopup');
      drawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  if (goalBtn) {
    goalBtn.addEventListener('click', () => {
      showPopup('goalPopup');
      drawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  if (lessonBtn) {
    lessonBtn.addEventListener('click', () => {
      showPopup('lessonPopup');
      drawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  const openAiBtn = document.getElementById('openAiPopup');
  const aiPopup = document.getElementById('aiPopup');

  if (openAiBtn && aiPopup) {
    openAiBtn.addEventListener('click', () => {
      aiPopup.classList.remove('hidden');
      drawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }
});
