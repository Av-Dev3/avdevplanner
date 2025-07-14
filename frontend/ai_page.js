document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");
  const messages = document.getElementById("ai-chat-messages");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;

    addChatBubble(userText, "user");
    input.value = "";

    try {
      const res = await fetch("https://avdevplanner.onrender.com/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText })
      });

      if (!res.ok) {
        const err = await res.text();
        addChatBubble("⚠️ Error: " + err, "ai");
        return;
      }

      const data = await res.json();

      // Display AI's general reply
      if (data.reply) {
        addChatBubble(data.reply, "ai");
      }

      // === SAVE structured items ===
      await saveItems(data.tasks, "tasks");
      await saveItems(data.goals, "goals");
      await saveItems(data.lessons, "lessons");
      await saveItems(data.schedule, "schedule");

    } catch (err) {
      console.error("AI Error:", err);
      addChatBubble("⚠️ Something went wrong. Try again later.", "ai");
    }
  });

  function addChatBubble(text, type) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${type}`;
    bubble.textContent = text;
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
  }

  async function saveItems(items, type) {
    if (!items || !Array.isArray(items)) return;

    for (const item of items) {
      try {
        await fetch(`https://avdevplanner.onrender.com/${type}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
        addChatBubble(`✅ ${capitalize(type.slice(0, -1))} added: ${item.title || item.text}`, "ai");
      } catch (err) {
        console.error(`Failed to save ${type.slice(0, -1)}:`, err);
        addChatBubble(`⚠️ Failed to add ${type.slice(0, -1)}: ${item.title || item.text}`, "ai");
      }
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
});
