async function loadQuote() {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();
    const quote = data[0]; // The first (and only) quote returned

    document.getElementById('quote-text').textContent = `"${quote.q}"`;
    document.getElementById('quote-author').textContent = `— ${quote.a}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = `"Stay focused. Even slow progress is still progress."`;
    document.getElementById('quote-author').textContent = `— Unknown`;
  }
}

loadQuote();
