async function loadQuote() {
  try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();

    const quote = data[0].q;
    const author = data[0].a;

    document.getElementById('quote-text').textContent = `"${quote}"`;
    document.getElementById('quote-author').textContent = `– ${author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Keep pushing forward.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote(); // Runs once on page load
