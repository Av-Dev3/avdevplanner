window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const aiBubble = document.getElementById('ai-chatbox-wrapper');

  if (sessionStorage.getItem('splashShown')) {
    splash.remove();
    if (aiBubble) aiBubble.classList.remove('hidden');
  } else {
    sessionStorage.setItem('splashShown', 'true');

    const animationDuration = 7500; // 7.5 seconds for the splash image

    if (aiBubble) aiBubble.classList.add('hidden'); // hide bubble during splash

    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
        if (aiBubble) aiBubble.classList.remove('hidden'); // show bubble after splash
      }, 2000);
    }, animationDuration);
  }
});
