async function loadQuote() {
  try {
    // Add cache buster to force fresh response
    const response = await fetch(`/.netlify/functions/getQuote?cb=${Date.now()}`);
    const data = await response.json();

    const quote = data.quote;
    const author = data.author;

    document.getElementById('quote-text').textContent = `"${quote}"`;
    document.getElementById('quote-author').textContent = `– ${author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Stay strong. Keep going.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote(); // Run once on page load
