import { setCookie, getCookie } from "../helpers/cookies.js";
import { getDefaultDates } from "../helpers/defaults.js";

export function restoreSettings(startDateInput, endDateInput, freelancers) {
  const savedStartDate = getCookie("startDate");
  const savedEndDate = getCookie("endDate");
  const savedFreelancers = JSON.parse(getCookie("selectedFreelancers") || "[]");

  const { startDate, endDate } = getDefaultDates();

  startDateInput.value = savedStartDate || startDate;
  endDateInput.value = savedEndDate || endDate;

  freelancers.forEach((freelancer) => {
    const checkbox = document.getElementById(`freelancer-${freelancer.id}`);
    if (savedFreelancers.length > 0) {
      checkbox.checked = savedFreelancers.includes(freelancer.id);
    } else {
      checkbox.checked = true; // Default to checked
    }
  });
}

export function saveSettings(startDateInput, endDateInput, freelancers) {
  startDateInput.addEventListener("input", () => {
    setCookie("startDate", startDateInput.value, 7);
  });

  endDateInput.addEventListener("input", () => {
    setCookie("endDate", endDateInput.value, 7);
  });

  const container = document.getElementById("freelancers-container");
  container.addEventListener("change", () => {
    const selectedFreelancers = freelancers
      .filter((freelancer) => {
        const checkbox = document.getElementById(`freelancer-${freelancer.id}`);
        return checkbox.checked;
      })
      .map((freelancer) => freelancer.id);

    setCookie("selectedFreelancers", JSON.stringify(selectedFreelancers), 7);
  });
}
