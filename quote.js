async function loadQuote() {
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const targetUrl = encodeURIComponent('https://zenquotes.io/api/random');
    const response = await fetch(`${proxyUrl}${targetUrl}`);
    const result = await response.json();
    const data = JSON.parse(result.contents);

    const quote = data[0].q;
    const author = data[0].a;

    document.getElementById('quote-text').textContent = `"${quote}"`;
    document.getElementById('quote-author').textContent = `– ${author}`;
  } catch (err) {
    console.error("Failed to load quote:", err);
    document.getElementById('quote-text').textContent = "Stay strong.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
