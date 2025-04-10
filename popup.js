const fetchBtn = document.getElementById("fetch-btn");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const freelancersContainer = document.getElementById("freelancers-container");

// Hardcoded freelancers array
const freelancers = [
  { id: 1, full_name: "John Doe" },
  { id: 2, full_name: "Jane Smith" },
  { id: 3, full_name: "Alice Johnson" },
];

// Populate checkboxes for freelancers
freelancers.forEach((freelancer) => {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.id = `freelancer-${freelancer.id}`;
  checkbox.value = freelancer.id;
  checkbox.checked = true; // Make checkbox checked by default

  const label = document.createElement("label");
  label.htmlFor = checkbox.id;
  label.textContent = freelancer.full_name;

  const container = document.createElement("div");
  container.appendChild(checkbox);
  container.appendChild(label);

  freelancersContainer.appendChild(container);
});

// Helper functions for cookies
function setCookie(name, value, days) {
  const expires = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

// Restore settings from cookies on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedStartDate = getCookie("startDate");
  const savedEndDate = getCookie("endDate");
  const savedFreelancers = JSON.parse(getCookie("selectedFreelancers") || "[]");

  // Set default values if cookies are not found
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  startDateInput.value =
    savedStartDate || oneWeekAgo.toISOString().split("T")[0];
  endDateInput.value = savedEndDate || today.toISOString().split("T")[0];

  freelancers.forEach((freelancer) => {
    const checkbox = document.getElementById(`freelancer-${freelancer.id}`);
    if (savedFreelancers.length > 0) {
      checkbox.checked = savedFreelancers.includes(freelancer.id);
    } else {
      checkbox.checked = true; // Default to checked if no data
    }
  });
});

// Save settings to cookies when inputs change
startDateInput.addEventListener("input", () => {
  setCookie("startDate", startDateInput.value, 7); // Save for 7 days
});

endDateInput.addEventListener("input", () => {
  setCookie("endDate", endDateInput.value, 7); // Save for 7 days
});

freelancersContainer.addEventListener("change", () => {
  const selectedFreelancers = freelancers
    .filter((freelancer) => {
      const checkbox = document.getElementById(`freelancer-${freelancer.id}`);
      return checkbox.checked;
    })
    .map((freelancer) => freelancer.id);

  setCookie("selectedFreelancers", JSON.stringify(selectedFreelancers), 7); // Save for 7 days
});

fetchBtn.addEventListener("click", handleFetchButtonClick);

async function handleFetchButtonClick() {
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

async function sendStatsToBackend(stats) {
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

async function parseUpworkStats(startDate, endDate, freelancerId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const variableToPass = await fetchCookies();

  variableToPass.start_date = startDate;
  variableToPass.end_date = endDate;

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (data) => {
      try {
        const response = await fetch(
          "https://www.upwork.com/api/graphql/v1?alias=gql-query-metrics",
          {
            headers: {
              accept: "*/*",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6",
              authorization: `bearer ${data.oauthToken}`,
              "content-type": "application/json",
              priority: "u=1, i",
              "sec-ch-ua":
                '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
              "sec-ch-ua-full-version-list":
                '"Chromium";v="134.0.6998.88", "Not:A-Brand";v="24.0.0.0", "Google Chrome";v="134.0.6998.88"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Linux"',
              "sec-ch-viewport-width": "1080",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "vnd-eo-parent-span-id": "9da6f472-9a22-4464-a28b-cf56cd7f1d0f",
              "vnd-eo-span-id": "3a8b8e78-e3d9-4e0a-8f1a-03b9d44ac1d9",
              "vnd-eo-trace-id": "92dacf35283bee42-SEA",
              "vnd-eo-visitorid": data.visitorId,
              "x-upwork-accept-language": "en-US",
              "x-upwork-api-tenantid": data.currentOrganizationUid,
            },
            referrer: "https://www.upwork.com/nx/my-stats/",
            referrerPolicy: "origin-when-cross-origin",
            body: `{"query":"query getUserMetrics($userId: ID, $freelancerId: ID!, $metrics: [String], $startTimestamp: String, $endTimestamp: String, $step: StepType) {\\n  metrics(\\n    userId: $userId\\n    freelancerId: $freelancerId\\n    metrics: $metrics\\n    startTimestamp: $startTimestamp\\n    endTimestamp: $endTimestamp\\n    step: $step\\n  ) {\\n    userMetrics {\\n      metric\\n      data {\\n        timestamp\\n        value\\n      }\\n    }\\n  }\\n}","variables":{"userId":"${data.user_uid}","freelancerId":"${freelancerId}","metrics":["PROPOSALS_HIRED_BOOSTED","PROPOSALS_HIRED_ORGANIC","PROPOSALS_INTERVIEWED_BOOSTED","PROPOSALS_INTERVIEWED_ORGANIC","PROPOSALS_SENT_BOOSTED","PROPOSALS_SENT_ORGANIC","PROPOSALS_VIEWED_BOOSTED","PROPOSALS_VIEWED_ORGANIC"],"startTimestamp":"${data.start_date}","endTimestamp":"${data.end_date}","step":"DAY"}}`,
            method: "POST",
            mode: "cors",
            credentials: "include",
          }
        );

        // Log the response
        const result = await response.json();
        const metrics = result.data.metrics.userMetrics;
        return JSON.stringify(metrics, null, 2);
      } catch (error) {
        console.error("Error sending POST request:", error);
      }
    },
    args: [variableToPass],
  });
  return result;
}

const formatDateToISOStringWithoutMs = (date) => {
  return date.toISOString().split(".")[0];
};

async function fetchCookies() {
  const result = {
    oauthToken: "",
    visitorId: "",
    currentOrganizationUid: "",
    user_uid: "",
  };
  const results = await getTargetCookies(".upwork.com", "/nx/my-stats");
  if (results.length === 0) {
    logMessage("No matching cookies found.");
  } else {
    result.oauthToken = results[0].value;
    logMessage(`OAuth Token: ${result["oauthToken"]}`);
  }
  const allCookies = await getTargetCookies(".upwork.com");
  if (allCookies.length === 0) {
    logMessage("No cookies found.");
  } else {
    result.visitorId = allCookies.find(
      (cookie) => cookie.name === "visitor_id"
    ).value;
    result.currentOrganizationUid = allCookies.find(
      (cookie) => cookie.name === "current_organization_uid"
    ).value;
    result.user_uid = allCookies.find(
      (cookie) => cookie.name === "user_uid"
    ).value;

    logMessage(
      `visitor_id: ${result.visitorId ? result.visitorId : "not found"}`
    );
    logMessage(
      `current_organization_uid: ${
        result.currentOrganizationUid
          ? result.currentOrganizationUid
          : "not found"
      }`
    );
    logMessage(`user_uid: ${result.user_uid ? result.user_uid : "not found"}`);
  }
  return result;
}

// 🔍 Fetch all cookies for .upwork.com and filter by path
async function getTargetCookies(domain, targetPath) {
  try {
    const allCookies = await chrome.cookies.getAll({ domain });

    if (targetPath === undefined) {
      return allCookies;
    }

    return allCookies.filter((cookie) => cookie.path === targetPath);
  } catch (error) {
    console.error("Error fetching cookies:", error);
    return [];
  }
}

function logMessage(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function ([tab]) {
    chrome.tabs.sendMessage(tab.id, {
      data: message,
    });
  });
}
