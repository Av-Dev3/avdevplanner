async function loadQuote() {
  try {
    const res = await fetch('https://quote-garden.herokuapp.com/api/v3/quotes/random');
    const data = await res.json();

    const quoteObj = data.data[0];
    document.getElementById('quote-text').textContent = `"${quoteObj.quoteText}"`;
    document.getElementById('quote-author').textContent = `– ${quoteObj.quoteAuthor}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Stay motivated.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
