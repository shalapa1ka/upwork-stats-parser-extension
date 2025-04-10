(async () => {
  // The data (cookies etc.) passed from the popup
  const [data] = arguments;

  try {
    const response = await fetch(
      "https://www.upwork.com/api/graphql/v1?alias=gql-query-metrics",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          authorization: `bearer ${data.oauthToken}`,
          "content-type": "application/json",
          "x-upwork-api-tenantid": data.currentOrganizationUid,
          "x-upwork-accept-language": "en-US",
          "vnd-eo-visitorid": data.visitorId,
        },
        referrer: "https://www.upwork.com/nx/my-stats/",
        body: JSON.stringify({
          query: `query getUserMetrics($userId: ID, $freelancerId: ID!, $metrics: [String], $startTimestamp: String, $endTimestamp: String, $step: StepType) {
          metrics(userId: $userId, freelancerId: $freelancerId, metrics: $metrics, startTimestamp: $startTimestamp, endTimestamp: $endTimestamp, step: $step) {
            userMetrics {
              metric
              data {
                timestamp
                value
              }
            }
          }
        }`,
          variables: {
            userId: data.user_uid,
            freelancerId: data.user_uid,
            metrics: [
              "PROPOSALS_HIRED_BOOSTED",
              "PROPOSALS_HIRED_ORGANIC",
              "PROPOSALS_INTERVIEWED_BOOSTED",
              "PROPOSALS_INTERVIEWED_ORGANIC",
              "PROPOSALS_SENT_BOOSTED",
              "PROPOSALS_SENT_ORGANIC",
              "PROPOSALS_VIEWED_BOOSTED",
              "PROPOSALS_VIEWED_ORGANIC",
            ],
            startTimestamp: data.start_date,
            endTimestamp: data.end_date,
            step: "DAY",
          },
        }),
        credentials: "include",
      }
    );

    const json = await response.json();

    chrome.runtime.sendMessage({
      type: "STATS_FETCHED",
      payload: json.data.metrics.userMetrics,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    chrome.runtime.sendMessage({
      type: "STATS_FETCHED",
      payload: null,
    });
  }
})();
