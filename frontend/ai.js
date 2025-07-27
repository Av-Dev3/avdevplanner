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

// === AI Chat Logic (Both Desktop and Popup) ===
document.addEventListener("DOMContentLoaded", () => {
  const openAiPopupBtn = document.getElementById("openAiPopup");
  const aiPopup = document.getElementById("aiPopup");

  const floatingToggleBtn = document.getElementById("open-ai-chat");
  const floatingChatBox = document.getElementById("ai-chatbox");
  const chatForm = document.getElementById("ai-chat-form");
  const inputField = document.getElementById("ai-task-input");
  const chatMessages = document.getElementById("ai-chat-messages");

  // === AI Popup Form ===
  const aiPopupForm = document.getElementById("ai-form");
  const aiPopupInput = document.getElementById("ai-input");
  const aiPopupChatbox = document.getElementById("ai-popup-chatbox");

  // === Floating Bubble Toggle ===
  if (floatingToggleBtn && floatingChatBox) {
    floatingToggleBtn.addEventListener("click", () => {
      floatingChatBox.classList.toggle("hidden");
    });
  }

  // === Popup Dismiss Logic ===
  if (aiPopup) {
    aiPopup.addEventListener("click", (e) => {
      if (e.target === aiPopup) {
        aiPopup.classList.add("hidden");
      }
    });
  }

  // === AI Popup Form Submission ===
  if (aiPopupForm && aiPopupInput) {
    aiPopupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const prompt = aiPopupInput.value.trim();
      if (!prompt) return;

      console.log('AI Popup form submitted:', prompt);

      // Add user message to popup chatbox
      const userMessage = document.createElement("div");
      userMessage.className = "chat-message user";
      userMessage.textContent = prompt;
      aiPopupChatbox.appendChild(userMessage);

      // Clear input
      aiPopupInput.value = "";

      // Add thinking message
      const thinkingMessage = document.createElement("div");
      thinkingMessage.className = "chat-message thinking";
      thinkingMessage.textContent = "AI: Thinking...";
      aiPopupChatbox.appendChild(thinkingMessage);

      // Scroll to bottom
      aiPopupChatbox.scrollTop = aiPopupChatbox.scrollHeight;

      try {
        // Get AI response
        const response = await callAI(prompt);
        thinkingMessage.className = "chat-message ai";
        thinkingMessage.textContent = response;
        aiPopupChatbox.scrollTop = aiPopupChatbox.scrollHeight;
      } catch (error) {
        thinkingMessage.className = "chat-message ai";
        thinkingMessage.textContent = "Sorry, I couldn't process that.";
        aiPopupChatbox.scrollTop = aiPopupChatbox.scrollHeight;
      }
    });

    // Prevent enter key from closing modal
    aiPopupInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        aiPopupForm.dispatchEvent(new Event("submit"));
      }
    });
  }

  // === Form Submission Logic (Floating Chat) ===
  if (chatForm) {
    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const prompt = inputField.value.trim();
      if (!prompt) return;

      // Add user bubble
      const userBubble = document.createElement("div");
      userBubble.textContent = prompt;
      userBubble.className = "chat-bubble user bg-[#b91c1c] text-white p-2 mb-2 rounded";
      chatMessages.appendChild(userBubble);

      inputField.value = "";
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Add thinking bubble
      const thinkingBubble = document.createElement("div");
      thinkingBubble.textContent = "Thinking...";
      thinkingBubble.className = "chat-bubble ai bg-gray-300 dark:bg-gray-700 text-black dark:text-white p-2 mb-2 rounded";
      chatMessages.appendChild(thinkingBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Get AI response
      const response = await callAI(prompt);
      thinkingBubble.textContent = response;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }
});
