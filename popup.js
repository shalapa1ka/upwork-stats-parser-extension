import { populateFreelancers, freelancerList } from "./handlers/freelancers.js";
import { restoreSettings, saveSettings } from "./handlers/settings.js";
import { handleFetchButtonClick } from "./handlers/handler.js";
import { setCookie } from "./helpers/cookies.js";

const fetchStatBtn = document.getElementById("fetch-stat-btn");
const checkAllBtn = document.getElementById("check-all-btn");
const uncheckAllBtn = document.getElementById("uncheck-all-btn");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const freelancersContainer = document.getElementById("freelancers-container");
let freelancers = [];

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const { url } = tab;

if (url.includes("upwork.com/nx/my-stats")) {
  freelancers = await freelancerList();

  populateFreelancers(freelancers, freelancersContainer);
  restoreSettings(startDateInput, endDateInput, freelancers);
  saveSettings(startDateInput, endDateInput, freelancers);
}

fetchStatBtn.addEventListener("click", () =>
  handleFetchButtonClick(startDateInput, endDateInput, freelancers)
);

checkAllBtn.addEventListener("click", () => {
  const checkboxes = freelancersContainer.querySelectorAll(
    "input[type='checkbox']"
  );
  checkboxes.forEach((checkbox) => (checkbox.checked = true));

  // Collect all freelancer IDs and save them in a cookie
  const selectedFreelancers = Array.from(checkboxes).map((checkbox) =>
    checkbox.id.replace("freelancer-", "")
  );
  setCookie("selectedFreelancers", JSON.stringify(selectedFreelancers), 7); // Save for 7 days
});

uncheckAllBtn.addEventListener("click", () => {
  const checkboxes = freelancersContainer.querySelectorAll(
    "input[type='checkbox']"
  );
  checkboxes.forEach((checkbox) => (checkbox.checked = false));

  // Save an empty array in the cookie
  setCookie("selectedFreelancers", JSON.stringify([]), 7); // Save for 7 days
});

export function logMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
    chrome.tabs.sendMessage(tab.id, {
      data: message,
    });
  });
}
