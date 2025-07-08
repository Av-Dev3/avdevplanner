// === AI Helper Function ===
async function callAI(prompt) {
  try {
    const response = await fetch('https://avdevplanner.onrender.com/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch AI response');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI error:', error);
    return "Sorry, I couldn't process that.";
  }
}

// === AI Button Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const aiButton = document.getElementById("ask-ai-btn");
  const resultBox = document.getElementById("ai-result");

  if (aiButton && resultBox) {
    aiButton.addEventListener("click", async () => {
      resultBox.textContent = "Thinking...";
      const prompt = "What are 3 good goals I can set for this week?";
      const response = await callAI(prompt);
      resultBox.textContent = response;
    });
  }
});
