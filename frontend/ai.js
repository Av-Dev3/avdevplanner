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

// === AI Chat Logic ===
document.addEventListener("DOMContentLoaded", () => {
  const toggleChatBtn = document.getElementById("open-ai-chat");
  const chatBox = document.getElementById("ai-chatbox");
  const chatForm = document.getElementById("ai-chat-form");
  const inputField = document.getElementById("ai-task-input");
  const chatMessages = document.getElementById("ai-chat-messages");

  // Toggle chat visibility
  toggleChatBtn.addEventListener("click", () => {
    chatBox.classList.toggle("hidden");
  });

  // Handle form submission
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = inputField.value.trim();
    if (!prompt) return;

    // Add user's message to chat
    const userBubble = document.createElement("div");
    userBubble.textContent = prompt;
    userBubble.className = "chat-bubble user";
    chatMessages.appendChild(userBubble);

    chatMessages.scrollTop = chatMessages.scrollHeight;
    inputField.value = "";

    // Show "thinking..." message
    const thinkingBubble = document.createElement("div");
    thinkingBubble.textContent = "Thinking...";
    thinkingBubble.className = "chat-bubble ai";
    chatMessages.appendChild(thinkingBubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Call AI and update response
    const response = await callAI(prompt);
    thinkingBubble.textContent = response;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
});
