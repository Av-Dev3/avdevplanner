document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('fab');
  const drawer = document.getElementById('drawer'); // only on homepage
  const siteLinksDrawer = document.getElementById('siteLinksDrawer');
  const isHome = window.location.pathname.includes('index.html') || window.location.pathname === '/';

  let isDrawerOpen = false;
  let longPressTriggered = false;
  let pressTimer;

  if (!fab) {
    console.warn('FAB not found.');
    return;
  }

  // === FAB click (short press) ===
  fab.addEventListener('click', () => {
    if (longPressTriggered) {
      longPressTriggered = false;
      return;
    }

    isDrawerOpen = !isDrawerOpen;

    if (isHome && drawer) {
      drawer.classList.toggle('drawer-visible', isDrawerOpen);
      siteLinksDrawer?.classList.remove('drawer-visible');
    } else if (siteLinksDrawer) {
      siteLinksDrawer.classList.toggle('drawer-visible', isDrawerOpen);
      drawer?.classList.remove('drawer-visible');
    }
  });

  // === Long press on homepage only ===
  if (isHome && drawer && siteLinksDrawer) {
    const startLongPress = () => {
      pressTimer = setTimeout(() => {
        longPressTriggered = true;
        drawer.classList.remove('drawer-visible');
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

  // === Click outside closes drawers
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

  // === Popup buttons only on homepage ===
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

  // === AI Chat Popup ===
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
