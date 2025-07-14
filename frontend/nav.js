document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".main-nav");
  const submenu = document.getElementById("submenu");
  const dropdownToggle = document.querySelector(".dropdown-toggle");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
    document.body.style.overflowX = navMenu.classList.contains("open") ? "hidden" : "";

    // Reset submenu when nav is closed
    if (!navMenu.classList.contains("open")) {
      submenu.classList.remove("open");
    }
  });

  // Toggle submenu panel on mobile
  dropdownToggle.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      submenu.classList.toggle("open");
    }
  });
});
