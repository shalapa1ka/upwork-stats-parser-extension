import { populateFreelancers } from "./handlers/freelancers.js";
import { restoreSettings, saveSettings } from "./handlers/settings.js";
import { handleFetchButtonClick } from "./handlers/handler.js";

const fetchBtn = document.getElementById("fetch-btn");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const freelancersContainer = document.getElementById("freelancers-container");

const freelancers = [
  { id: "1768661465047580672", full_name: "Bohdan Popovych" },
  { id: 2, full_name: "Jane Smith" },
  { id: 3, full_name: "Alice Johnson" },
];

populateFreelancers(freelancers, freelancersContainer);
restoreSettings(startDateInput, endDateInput, freelancers);
saveSettings(startDateInput, endDateInput, freelancers);

fetchBtn.addEventListener("click", () =>
  handleFetchButtonClick(startDateInput, endDateInput, freelancers)
);

export function logMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
    chrome.tabs.sendMessage(tab.id, {
      message: message,
    });
  });
}
