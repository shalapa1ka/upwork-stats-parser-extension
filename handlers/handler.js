import { parseUpworkStats } from "./fetch.js";
import { sendStatsToBackend } from "./send.js";
import { logMessage } from "../popup.js";

export async function handleFetchButtonClick(
  startDateInput,
  endDateInput,
  freelancers
) {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  const selectedFreelancers = freelancers.filter((freelancer) => {
    const checkbox = document.getElementById(`freelancer-${freelancer.id}`);
    return checkbox.checked;
  });

  if (selectedFreelancers.length === 0) {
    alert("Please select at least one freelancer.");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab.url;

  if (url.includes("upwork.com/nx/my-stats")) {
    logMessage("Fetching Upwork stats...");
    for (const freelancer of selectedFreelancers) {
      logMessage(`Fetching stats for ${freelancer.full_name}...`);
      const result = await parseUpworkStats(startDate, endDate, freelancer.id);
      logMessage(result);
      if (result) {
        logMessage(`Stats fetched successfully for ${freelancer.full_name}.`);
        await sendStatsToBackend(result);
      } else {
        logMessage(`Failed to fetch stats for ${freelancer.full_name}.`);
      }
    }
  } else {
    if (
      confirm(
        "Please navigate to the Upwork My Stats page. Would you like to go there now?"
      )
    ) {
      window.open("https://www.upwork.com/nx/my-stats/", "_blank");
    }
  }
}
