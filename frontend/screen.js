window.addEventListener('DOMContentLoaded', () => {
  const splash = document.getElementById('splash-screen');

  if (sessionStorage.getItem('splashShown')) {
    splash.remove();
  } else {
    sessionStorage.setItem('splashShown', 'true');

    setTimeout(() => {
      splash.classList.add('fade-out');

      // Remove after fade-out duration (match this to your CSS)
      setTimeout(() => splash.remove(), 2000);
    }, 4000);
  }
});
