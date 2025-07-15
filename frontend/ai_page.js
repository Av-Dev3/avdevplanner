document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");
  const fileInput = document.getElementById("ai-image-input");
  const messages = document.getElementById("ai-chat-messages");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userText = input.value.trim();
    const imageFile = fileInput.files[0];

    if (!userText && !imageFile) return;

    if (userText) {
      addChatBubble(userText, "user");
    }

    input.value = "";
    fileInput.value = "";

    let payload = {
      prompt: userText || "",
      image: null
    };

    if (imageFile) {
      const base64 = await toBase64(imageFile);
      payload.image = {
        name: imageFile.name,
        data: base64
      };
    }

    try {
      const res = await fetch("https://avdevplanner.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.text();
        addChatBubble("⚠️ Error: " + err, "ai");
        return;
      }

      const data = await res.json();

      if (data.response) {
        addChatBubble(data.response, "ai");
      } else {
        addChatBubble("🤖 I didn't understand that. Try again!", "ai");
      }

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

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]); // Remove the data:...;base64, part
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});
