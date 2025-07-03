document.addEventListener("DOMContentLoaded", () => {
  const quotes = [
    "Small steps every day lead to big changes.",
    "Discipline beats motivation.",
    "Done is better than perfect.",
    "Keep going, even if it's slow.",
    "One task at a time. One day at a time.",
  ];

  const quoteBox = document.getElementById("quote-box");
  if (quoteBox) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteBox.textContent = quotes[randomIndex];
  }
});
