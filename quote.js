async function loadQuote() {
  try {
    const res = await fetch(`/.netlify/functions/getQuote?cb=${Date.now()}`);
    const data = await res.json();

    document.getElementById('quote-text').textContent = `"${data.quote}"`;
    document.getElementById('quote-author').textContent = `– ${data.author}`;
  } catch (err) {
    console.error(err);
    document.getElementById('quote-text').textContent = "Stay motivated.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
