async function loadQuote() {
  try {
    const res = await fetch('https://quoteslate.vercel.app/api/random');
    const data = await res.json();
    document.getElementById('quote-text').textContent = `"${data.quoteText}"`;
    document.getElementById('quote-author').textContent = `– ${data.quoteAuthor}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Keep going.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
