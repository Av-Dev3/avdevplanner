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
      // Open mobile drawer for notes page (not direct popup)
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
    } else if (isTasks) {
      // Open mobile drawer for tasks page (not direct popup)
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

  // Handle mobile drawer button clicks for all pages
  if (mobileDrawer) {
    const mobileDrawerButtons = mobileDrawer.querySelectorAll('.drawer__links button');
    mobileDrawerButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get the target popup from the onclick attribute
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr) {
          // Extract the popup ID from the onclick attribute
          const match = onclickAttr.match(/getElementById\('([^']+)'\)/);
          if (match) {
            const popupId = match[1];
            const popup = document.getElementById(popupId);
            if (popup) {
              // Close mobile drawer first
              mobileDrawer.classList.add('hidden');
              // Open the target popup
              popup.classList.remove('hidden');
            }
          }
        }
      });
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
