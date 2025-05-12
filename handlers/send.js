import { logMessage } from "../popup.js";
const BACKEND_URL = "https://upwork-helper.herokuapp.com";

export async function sendStatsToBackend(stats, freelancer) {
  try {
    logMessage("📤 Sending stats to backend...");

    const payload = {
      stats,
      freelancer,
    };

    const response = await fetch(`${BACKEND_URL}/my_stat/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    // Check if the response has a body
    let result = null;
    const contentLength = response.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength) > 0) {
      result = await response.json();
    }

    logMessage("✅ Stats sent to backend successfully.");
    return true;
  } catch (error) {
    logMessage(`❌ Failed to send stats to backend: ${error.message}`);
    return false;
  }
}
