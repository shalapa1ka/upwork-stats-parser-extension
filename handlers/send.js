import { logMessage } from "../popup.js";

export async function sendStatsToBackend(stats) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (data) => {
      try {
        const response = await fetch(
          "https://e46d-188-163-15-68.ngrok-free.app/my_stat/parse",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        logMessage("✅ Stats sent to backend successfully.");
        console.log("🧾 Backend response:", result);
      } catch (error) {
        logMessage("❌ Failed to send stats to backend.");
        console.error("Error sending stats:", error);
      }
    },
    args: [stats],
  });
}
