document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('fab');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const siteLinksDrawer = document.getElementById('siteLinksDrawer');

  const path = window.location.pathname;
  const isHome = path.includes('index.html') || path === '/' || path === '/index.html';
  const isNotes = path.includes('notes') && !path.includes('notes.css');
  const isTasks = path.includes('tasks') && !path.includes('tasks.css');
  const isLessons = path.includes('lesson') || path.includes('lessons');
  const isGoals = path.includes('goals');
  const isDaily = path.includes('daily') && !path.includes('daily.css');
  const isWeekly = path.includes('weekly') && !path.includes('weekly.css');

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

    // ===== ONLY THIS BLOCK IS UPDATED =====
    if (isHome && mobileDrawer) {
      // Show/hide mobile drawer using modal style
      if (mobileDrawer.classList.contains('hidden')) {
        mobileDrawer.classList.remove('hidden');
        setTimeout(() => mobileDrawer.classList.add('drawer-visible'), 10); // Animate in
      } else {
        mobileDrawer.classList.remove('drawer-visible');
        setTimeout(() => mobileDrawer.classList.add('hidden'), 300); // Animate out
      }
      siteLinksDrawer?.classList.remove('drawer-visible');
    } 
    // ===== END OF UPDATED BLOCK =====
    else if (isNotes) {
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
      // Open mobile drawer for lessons page (not direct popup)
      if (mobileDrawer) {
        if (mobileDrawer.classList.contains('hidden')) {
          mobileDrawer.classList.remove('hidden');
          setTimeout(() => mobileDrawer.classList.add('drawer-visible'), 10);
        } else {
          mobileDrawer.classList.remove('drawer-visible');
          setTimeout(() => mobileDrawer.classList.add('hidden'), 300);
        }
        siteLinksDrawer?.classList.remove('drawer-visible');
      }
    } else if (isGoals) {
      // Open mobile drawer for goals page (not direct popup)
      if (mobileDrawer) {
        if (mobileDrawer.classList.contains('hidden')) {
          mobileDrawer.classList.remove('hidden');
          setTimeout(() => mobileDrawer.classList.add('drawer-visible'), 10);
        } else {
          mobileDrawer.classList.remove('drawer-visible');
          setTimeout(() => mobileDrawer.classList.add('hidden'), 300);
        }
        siteLinksDrawer?.classList.remove('drawer-visible');
      }
    } else if (isDaily) {
      // Daily page: only open site links (no quick actions)
      if (siteLinksDrawer) {
        siteLinksDrawer.classList.add('drawer-visible');
        siteLinksDrawer.classList.remove('hidden');
      }
    } else if (isWeekly) {
      // Weekly page: only open site links (no quick actions)
      if (siteLinksDrawer) {
        siteLinksDrawer.classList.add('drawer-visible');
        siteLinksDrawer.classList.remove('hidden');
      }
    } else if (siteLinksDrawer) {
      siteLinksDrawer.classList.toggle('drawer-visible', isDrawerOpen);
      drawer?.classList.remove('drawer-visible');
    }
  });

  if ((isHome || isNotes || isTasks || isLessons || isGoals || isDaily || isWeekly) && siteLinksDrawer) {
    const startLongPress = () => {
      pressTimer = setTimeout(() => {
        longPressTriggered = true;
              mobileDrawer?.classList.remove('drawer-visible');
      siteLinksDrawer.classList.add('drawer-visible');
      siteLinksDrawer.classList.remove('hidden');
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
    const insideDrawer = mobileDrawer?.contains(e.target);
    const insideLinks = siteLinksDrawer?.contains(e.target);

    if (!insideFab && !insideDrawer && !insideLinks) {
      mobileDrawer?.classList.remove('drawer-visible');
      siteLinksDrawer?.classList.remove('drawer-visible');
      // Hide modal drawer for homepage
      if (isHome && mobileDrawer && !mobileDrawer.classList.contains('hidden')) {
        setTimeout(() => mobileDrawer.classList.add('hidden'), 300);
      }
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
      mobileDrawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  if (goalBtn) {
    goalBtn.addEventListener('click', () => {
      showPopup('goalPopup');
      mobileDrawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  if (lessonBtn) {
    lessonBtn.addEventListener('click', () => {
      showPopup('lessonPopup');
      mobileDrawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  const openAiBtn = document.getElementById('openAiPopup');
  const aiPopup = document.getElementById('aiPopup');

  if (openAiBtn && aiPopup) {
    openAiBtn.addEventListener('click', () => {
      aiPopup.classList.remove('hidden');
      mobileDrawer?.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }
});
