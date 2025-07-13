// Eat: Fork animation
document.getElementById("eat").addEventListener("click", () => {
  const fork = document.getElementById("fork-fly");
  fork.classList.remove("fork-animate");
  void fork.offsetWidth;
  fork.classList.add("fork-animate");
});

// Sleep: Z float animation (positioned above "Sleep")
document.getElementById("sleep").addEventListener("click", () => {
  const zBox = document.getElementById("z-animation");
  const sleepSpan = document.getElementById("sleep");

  const rect = sleepSpan.getBoundingClientRect();

  zBox.style.left = `${rect.left + rect.width / 2}px`;
  zBox.style.top = `${rect.top - 30 + window.scrollY}px`;

  zBox.innerHTML = "";

  for (let i = 0; i < 3; i++) {
    const z = document.createElement("span");
    z.classList.add("z");
    z.textContent = "Z";
    z.style.left = `${i * 20 - 20}px`;
    z.style.animationDelay = `${i * 0.3}s`;
    zBox.appendChild(z);
  }

  zBox.style.opacity = "1";

  setTimeout(() => {
    zBox.style.opacity = "0";
  }, 2500);
});

// Code: Toggle code editor popup
const codeBtn = document.getElementById("code");
const popup = document.getElementById("code-editor-popup");

codeBtn.addEventListener("click", () => {
  popup.classList.toggle("hidden");
});

// Close: Close button inside popup
const closeBtn = document.getElementById("close-editor");
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
  });
}

// Tab switching logic
const tabButtons = document.querySelectorAll(".tab-button");
const tabs = document.querySelectorAll(".editor-tab");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");

    tabButtons.forEach(b => b.classList.remove("active"));
    tabs.forEach(t => t.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(`tab-${target}`).classList.add("active");
  });
});

// Run code button logic
const runBtn = document.getElementById("run-code");
const outputFrame = document.getElementById("tab-output");

if (runBtn && outputFrame) {
  runBtn.addEventListener("click", () => {
    const html = document.getElementById("tab-html").value;
    const css = `<style>${document.getElementById("tab-css").value}</style>`;
    const js = `<script>${document.getElementById("tab-js").value}<\/script>`;
    const fullDoc = `${html}${css}${js}`;
    outputFrame.srcdoc = fullDoc;
  });
}

// Repeat: Float words to center + fade to black screen
document.getElementById("repeat").addEventListener("click", () => {
  const footerWords = ["eat", "sleep", "code", "repeat"].map(id =>
    document.getElementById(id)
  );

  const screenOverlay = document.createElement("div");
  screenOverlay.id = "fade-screen";
  document.body.appendChild(screenOverlay);

  // Ensure overlay is on top
  setTimeout(() => {
    screenOverlay.classList.add("fade-in");
  }, 800);

  // Animate each word toward center
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  footerWords.forEach(word => {
    const rect = word.getBoundingClientRect();
    const wordX = rect.left + rect.width / 2;
    const wordY = rect.top + rect.height / 2;

    const deltaX = centerX - wordX + (Math.random() - 0.5) * 100;
    const deltaY = centerY - wordY + (Math.random() - 0.5) * 100;

    word.classList.add("float-word");
    word.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${Math.random() * 360}deg)`;
  });

  // Fade back in after delay
  setTimeout(() => {
    screenOverlay.classList.remove("fade-in");
    screenOverlay.classList.add("fade-out");

    footerWords.forEach(word => {
      word.classList.remove("float-word");
      word.style.transform = "";
    });

    setTimeout(() => {
      screenOverlay.remove();
    }, 1000);
  }, 3000);
});
