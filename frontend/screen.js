window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');
  const splashVideo = document.getElementById('splash-video');
  const aiBubble = document.getElementById('ai-chatbox-wrapper');

  if (sessionStorage.getItem('splashShown')) {
    splash.remove();
    if (aiBubble) aiBubble.classList.remove('hidden');
  } else {
    sessionStorage.setItem('splashShown', 'true');

    if (aiBubble) aiBubble.classList.add('hidden'); // hide bubble during splash

    // Listen for when the video ends
    splashVideo.addEventListener('ended', () => {
      // Video finished playing, fade out the splash screen
      splash.classList.add('fade-out');
      setTimeout(() => {
        splash.remove();
        if (aiBubble) aiBubble.classList.remove('hidden'); // show bubble after splash
      }, 2000);
    });

    // Fallback: if video doesn't play or takes too long, use timeout
    const fallbackTimeout = setTimeout(() => {
      if (splash.parentNode) { // Only if splash still exists
        splash.classList.add('fade-out');
        setTimeout(() => {
          splash.remove();
          if (aiBubble) aiBubble.classList.remove('hidden');
        }, 2000);
      }
    }, 15000); // 15 second fallback

    // Clear fallback if video ends normally
    splashVideo.addEventListener('ended', () => {
      clearTimeout(fallbackTimeout);
    });
  }
});
