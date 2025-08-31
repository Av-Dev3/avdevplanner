window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const aiBubble = document.getElementById('ai-chatbox-wrapper');

  if (sessionStorage.getItem('splashShown')) {
    splash.remove();
    if (aiBubble) aiBubble.classList.remove('hidden');
  } else {
    sessionStorage.setItem('splashShown', 'true');

    const animationDuration = 5000; // 5 seconds for the splash image

    if (aiBubble) aiBubble.classList.add('hidden'); // hide bubble during splash

    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
        if (aiBubble) aiBubble.classList.remove('hidden'); // show bubble after splash
      }, 1000); // Reduced fade-out time to 1 second
    }, animationDuration);
  }
});
