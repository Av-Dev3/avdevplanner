window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');

  if (sessionStorage.getItem('splashShown')) {
    splash.remove();
  } else {
    sessionStorage.setItem('splashShown', 'true');

    // Adjust to match your WebP animation duration
    const animationDuration = 5000;

    setTimeout(() => {
      splash.classList.add('fade-out');
      setTimeout(() => splash.remove(), 2000);
    }, animationDuration);
  }
});
