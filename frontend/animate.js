// Enhanced Footer Animations - Modern Glass Morphism Style

// === EAT ANIMATION - Donut Being Eaten ===
document.getElementById("eat").addEventListener("click", () => {
  const fork = document.getElementById("fork-fly");
  const eatSpan = document.getElementById("eat");
  
  // Add click feedback
  eatSpan.style.transform = "scale(0.95)";
  setTimeout(() => {
    eatSpan.style.transform = "scale(1)";
  }, 150);
  
  // Reset and trigger animation
  fork.classList.remove("fork-animate");
  void fork.offsetWidth; // Force reflow
  fork.classList.add("fork-animate");
  
  // Add sound effect (optional)
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  audio.volume = 0.1;
  audio.play().catch(() => {}); // Ignore if audio fails
});

// === SLEEP ANIMATION - Enhanced Z's Rising Higher ===
document.getElementById("sleep").addEventListener("click", () => {
  const zBox = document.getElementById("z-animation");
  const sleepSpan = document.getElementById("sleep");
  
  // Add click feedback
  sleepSpan.style.transform = "scale(0.95)";
  setTimeout(() => {
    sleepSpan.style.transform = "scale(1)";
  }, 150);

  const rect = sleepSpan.getBoundingClientRect();
  
  // Position Z animation above "Sleep"
  zBox.style.left = `${rect.left + rect.width / 2}px`;
  zBox.style.top = `${rect.top - 50 + window.scrollY}px`;
  zBox.innerHTML = "";

  // Create multiple Z's with different delays and positions
  for (let i = 0; i < 7; i++) {
    const z = document.createElement("span");
    z.classList.add("z");
    z.textContent = "Z";
    z.style.left = `${(i - 3) * 30}px`;
    z.style.animationDelay = `${i * 0.15}s`;
    z.style.fontSize = `${40 - i * 3}px`;
    zBox.appendChild(z);
  }

  zBox.style.opacity = "1";
  
  // Add sound effect (optional)
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  audio.volume = 0.05;
  audio.play().catch(() => {});

  setTimeout(() => {
    zBox.style.opacity = "0";
  }, 4000);
});

// === CODE EDITOR POPUP ===
const codeBtn = document.getElementById("code");
const popup = document.getElementById("code-editor-popup");

if (codeBtn && popup) {
  codeBtn.addEventListener("click", () => {
    popup.classList.toggle("hidden");
    
    // Add click feedback
    codeBtn.style.transform = "scale(0.95)";
    setTimeout(() => {
      codeBtn.style.transform = "scale(1)";
    }, 150);
  });
}

// Close button inside popup
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

// === REPEAT ANIMATION - Sun Setting and Rising ===
document.getElementById("repeat").addEventListener("click", () => {
  const repeatSpan = document.getElementById("repeat");
  
  // Add click feedback
  repeatSpan.style.transform = "scale(0.95)";
  setTimeout(() => {
    repeatSpan.style.transform = "scale(1)";
  }, 150);

  // Create sun animation element if it doesn't exist
  let sunAnimation = document.getElementById("sun-animation");
  if (!sunAnimation) {
    sunAnimation = document.createElement("div");
    sunAnimation.id = "sun-animation";
    document.body.appendChild(sunAnimation);
  }

  // Trigger sun animation
  sunAnimation.classList.remove("sun-animate");
  void sunAnimation.offsetWidth; // Force reflow
  sunAnimation.classList.add("sun-animate");

  // Enhanced word floating animation
  const footerWords = ["eat", "sleep", "repeat"].map(id =>
    document.getElementById(id)
  ).filter(word => word);

  const screenOverlay = document.createElement("div");
  screenOverlay.id = "fade-screen";
  document.body.appendChild(screenOverlay);

  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  footerWords.forEach((word, index) => {
    const rect = word.getBoundingClientRect();
    const wordX = rect.left + rect.width / 2;
    const wordY = rect.top + rect.height / 2;

    // Calculate random offset for more natural movement
    const deltaX = centerX - wordX + (Math.random() - 0.5) * 200;
    const deltaY = centerY - wordY + (Math.random() - 0.5) * 200;
    const rotation = (Math.random() - 0.5) * 720; // Random rotation

    // Set CSS custom properties for the animation
    word.style.setProperty('--deltaX', `${deltaX}px`);
    word.style.setProperty('--deltaY', `${deltaY}px`);
    word.style.setProperty('--rotation', `${rotation}deg`);

    word.classList.add("float-word");
  });

  // Enhanced fade screen with pulse effect
  setTimeout(() => {
    screenOverlay.classList.add("fade-in");
  }, 2000);

  // Add dramatic sound effect (optional)
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
  audio.volume = 0.2;
  audio.play().catch(() => {});

  // Reset everything after animation
  setTimeout(() => {
    screenOverlay.classList.remove("fade-in");
    screenOverlay.classList.add("fade-out");

    footerWords.forEach(word => {
      word.classList.remove("float-word");
      word.style.removeProperty('--deltaX');
      word.style.removeProperty('--deltaY');
      word.style.removeProperty('--rotation');
    });

    setTimeout(() => {
      screenOverlay.remove();
    }, 1500);
  }, 6000);
});

// === ADDITIONAL ENHANCEMENTS ===

// Add hover effects to footer words
document.addEventListener('DOMContentLoaded', () => {
  const footerSpans = document.querySelectorAll('.footer span');
  
  footerSpans.forEach(span => {
    span.addEventListener('mouseenter', () => {
      // Add subtle glow effect
      span.style.textShadow = '0 0 15px rgba(231, 76, 60, 0.6)';
    });
    
    span.addEventListener('mouseleave', () => {
      // Remove glow effect
      span.style.textShadow = '';
    });
  });
});

// Add keyboard shortcuts for animations
document.addEventListener('keydown', (e) => {
  // E for Eat, S for Sleep, R for Repeat
  if (e.key.toLowerCase() === 'e') {
    document.getElementById("eat")?.click();
  } else if (e.key.toLowerCase() === 's') {
    document.getElementById("sleep")?.click();
  } else if (e.key.toLowerCase() === 'r') {
    document.getElementById("repeat")?.click();
  }
});
