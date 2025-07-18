document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('fab');
  const drawer = document.getElementById('drawer');
  const bottomNav = document.getElementById('bottomNav');

  let isDrawerOpen = false;

  // Toggle drawer with FAB
  fab.addEventListener('click', () => {
    isDrawerOpen = !isDrawerOpen;
    drawer.classList.toggle('drawer-visible', isDrawerOpen);
  });

  // Utility: Show popup by ID
  const showPopup = (popupId) => {
    const popup = document.getElementById(popupId);
    if (!popup) return;
    popup.classList.remove('hidden');

    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.add('hidden');
      }
    });
  };

  // Bind popup buttons
  const taskBtn = document.getElementById('addTaskBtn');
  const goalBtn = document.getElementById('addGoalBtn');
  const lessonBtn = document.getElementById('addLessonBtn');

  if (taskBtn) {
    taskBtn.addEventListener('click', () => {
      showPopup('taskPopup');
      drawer.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  if (goalBtn) {
    goalBtn.addEventListener('click', () => {
      showPopup('goalPopup');
      drawer.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  if (lessonBtn) {
    lessonBtn.addEventListener('click', () => {
      showPopup('lessonPopup');
      drawer.classList.remove('drawer-visible');
      isDrawerOpen = false;
    });
  }

  // === OPEN AI CHAT POPUP ===
  const openAiBtn = document.getElementById("openAiPopup");
  const aiPopup = document.getElementById("aiPopup");

  if (openAiBtn && aiPopup) {
    openAiBtn.addEventListener("click", () => {
      aiPopup.classList.remove("hidden");
      drawer.classList.remove("drawer-visible");
      isDrawerOpen = false;
    });
  }
});
