async function loadQuote() {
  try {
    const response = await fetch('https://goquotes-api.herokuapp.com/api/v1/random?count=1');
    const data = await response.json();
    const quote = data.quotes[0].text;
    const author = data.quotes[0].author;

    document.getElementById('quote-text').textContent = `"${quote}"`;
    document.getElementById('quote-author').textContent = `– ${author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Stay strong.";
    document.getElementById('quote-author').textContent = "";
  }
}
loadQuote();
