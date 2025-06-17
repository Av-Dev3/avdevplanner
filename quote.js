async function loadQuote() {
  try {
    const res = await fetch('https://programming-quotes-api.vercel.app/api/random');
    const data = await res.json();
    document.getElementById('quote-text').textContent = `"${data.en}"`;
    document.getElementById('quote-author').textContent = `– ${data.author}`;
  } catch (err) {
    document.getElementById('quote-text').textContent = "Code and conquer.";
    document.getElementById('quote-author').textContent = "";
  }
}

loadQuote();
