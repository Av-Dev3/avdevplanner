document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".main-nav");
  const submenu = document.getElementById("submenu");
  const dropdownToggle = document.querySelector(".dropdown-toggle");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
    document.body.style.overflowX = navMenu.classList.contains("open") ? "hidden" : "";

    if (!navMenu.classList.contains("open")) {
      submenu.classList.remove("open");
    }
  });

  dropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    submenu.classList.toggle("open");
  });
});
