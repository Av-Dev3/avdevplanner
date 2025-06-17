async function loadQuote() {
  try {
    const proxyUrl = 'https://corsproxy.io/?';
    const targetUrl = 'https://api.quotable.io/random?tags=inspirational';

    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl));
    const data = await response.json();

    const quote = data.content;
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
