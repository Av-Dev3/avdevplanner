async function loadQuote() {
  try {
    const res = await fetch('/.netlify/functions/getQuote');
    const data = await res.json();

    document.getElementById('quote-text').textContent = `"${data.quote}"`;
    document.getElementById('quote-author').textContent = `– ${data.author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
  }
}

loadQuote();
