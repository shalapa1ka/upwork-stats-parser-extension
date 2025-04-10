import { logMessage } from "../popup.js";

export async function fetchCookies() {
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

export async function getTargetCookies(domain, targetPath) {
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
