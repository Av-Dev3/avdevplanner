async function loadQuote() {
  try {
    const response = await fetch('https://api.themotivate365.com/stoic-quote');
    const data = await response.json();

    const quote = data.quote;
    const author = data.author;

    document.getElementById('quote-text').textContent = `"${quote}"`;
    document.getElementById('quote-author').textContent = `– ${author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Keep pushing forward.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
