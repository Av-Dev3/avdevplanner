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
    return data.message || data.response || "AI responded, but something was unexpected.";
  } catch (error) {
    console.error('AI error:', error);
    return "Sorry, I couldn't process that.";
  }
}

// === AI Button Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const aiButton = document.getElementById("ask-ai-btn");
  const inputField = document.getElementById("ai-task-input");
  const resultBox = document.getElementById("ai-result");

  if (aiButton && inputField && resultBox) {
    aiButton.addEventListener("click", async () => {
      const prompt = inputField.value.trim();
      if (!prompt) return;

      resultBox.textContent = "Thinking...";
      const response = await callAI(prompt);
      resultBox.textContent = response;
      inputField.value = "";
    });
  }
});
