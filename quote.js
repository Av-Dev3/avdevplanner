async function loadQuote() {
  try {
    const res = await fetch("https://quotes.rest/qod?category=inspire");
    const data = await res.json();

    const quote = data.contents.quotes[0].quote;
    const author = data.contents.quotes[0].author;

    document.getElementById('quote-text').textContent = `"${quote}"`;
    document.getElementById('quote-author').textContent = `– ${author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Stay focused. You're doing great.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
