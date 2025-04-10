import { fetchCookies } from "./cookies.js";

export async function parseUpworkStats(startDate, endDate, freelancerId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const variableToPass = await fetchCookies();

  variableToPass.start_date = startDate;
  variableToPass.end_date = endDate;
  variableToPass.freelancer_id = freelancerId;

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
            body: `{"query":"query getUserMetrics($userId: ID, $freelancerId: ID!, $metrics: [String], $startTimestamp: String, $endTimestamp: String, $step: StepType) {\\n  metrics(\\n    userId: $userId\\n    freelancerId: $freelancerId\\n    metrics: $metrics\\n    startTimestamp: $startTimestamp\\n    endTimestamp: $endTimestamp\\n    step: $step\\n  ) {\\n    userMetrics {\\n      metric\\n      data {\\n        timestamp\\n        value\\n      }\\n    }\\n  }\\n}","variables":{"userId":"${data.user_uid}","freelancerId":"${data.freelancer_id}","metrics":["PROPOSALS_HIRED_BOOSTED","PROPOSALS_HIRED_ORGANIC","PROPOSALS_INTERVIEWED_BOOSTED","PROPOSALS_INTERVIEWED_ORGANIC","PROPOSALS_SENT_BOOSTED","PROPOSALS_SENT_ORGANIC","PROPOSALS_VIEWED_BOOSTED","PROPOSALS_VIEWED_ORGANIC"],"startTimestamp":"${data.start_date}","endTimestamp":"${data.end_date}","step":"DAY"}}`,
            method: "POST",
            mode: "cors",
            credentials: "include",
          }
        );

        const result = await response.json();
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
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
