import { parseUpworkStats } from "./fetch.js";
import { sendStatsToBackend } from "./send.js";
import { logMessage } from "../popup.js";

export async function handleFetchButtonClick(
  startDateInput,
  endDateInput,
  freelancers
) {
  const fetchStatBtn = document.getElementById("fetch-stat-btn"); // Reference to the button
  const originalText = fetchStatBtn.textContent; // Save the original button text

  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  const selectedFreelancers = freelancers.filter((freelancer) => {
    const checkbox = document.getElementById(`freelancer-${freelancer.uid}`);
    return checkbox.checked;
  });

  if (selectedFreelancers.length === 0) {
    alert("Please select at least one freelancer.");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const { url } = tab;

  if (url.includes("upwork.com/nx/my-stats")) {
    fetchStatBtn.disabled = true;
    fetchStatBtn.textContent = "Loading...";

    logMessage("Fetching Upwork stats...");
    for (const freelancer of selectedFreelancers) {
      logMessage(`Fetching stats for ${freelancer.name}...`);
      const result = await parseUpworkStats(startDate, endDate, freelancer.uid);
      logMessage(result);
      if (result) {
        logMessage(`Stats fetched successfully for ${freelancer.name}.`);
        try {
          await sendStatsToBackend(result, freelancer);
        } catch (error) {
          logMessage(`Error sending stats for ${freelancer.name}:`, error);
        }
      } else {
        logMessage(`Failed to fetch stats for ${freelancer.name}.`);
      }
    }

    fetchStatBtn.disabled = false;
    fetchStatBtn.textContent = originalText;

    alert(
      "Stats fetched and sent to the backend successfully. Check the console for details."
    );
  } else if (
    confirm(
      "Please navigate to the Upwork My Stats page. Would you like to go there now?"
    )
  ) {
    window.open("https://www.upwork.com/nx/my-stats/", "_blank");
  }
}
