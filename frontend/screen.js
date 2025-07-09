document.addEventListener("DOMContentLoaded", () => {
  const alreadyLoaded = sessionStorage.getItem("lifeOS_loaded");

  if (!alreadyLoaded) {
    sessionStorage.setItem("lifeOS_loaded", "true");
    const loader = document.getElementById("loading-screen");

    // Automatically remove the loader after the animation
    setTimeout(() => {
      loader.style.display = "none";
    }, 2600); // Matches the fadeOut delay + animation time
  } else {
    const loader = document.getElementById("loading-screen");
    if (loader) loader.style.display = "none";
  }
});
