import { fetchCookies } from "./cookies.js";

export async function parseUpworkStats(startDate, endDate, freelancerId) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const variableToPass = await fetchCookies();

  variableToPass.start_date = startDate;
  variableToPass.end_date = new Date().toISOString().replace(/\.\d{3}Z$/, "");
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

export async function parseFreelancerList() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const variableToPass = await fetchCookies();

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (data) => {
      try {
        const response = await fetch(
          "https://www.upwork.com/api/graphql/v1?alias=gql-query-currentcontext",
          {
            headers: {
              accept: "*/*",
              "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,uk;q=0.6",
              authorization: `bearer ${data.oauthToken}`,
              "content-type": "application/json",
              priority: "u=1, i",
              "sec-ch-ua":
                '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
              "sec-ch-ua-full-version-list":
                '"Google Chrome";v="135.0.7049.114", "Not-A.Brand";v="8.0.0.0", "Chromium";v="135.0.7049.114"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Linux"',
              "sec-ch-viewport-width": "1022",
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "vnd-eo-parent-span-id": "fdee44a0-cd39-4187-9136-ca973a6d817d",
              "vnd-eo-span-id": "122c6e74-40d0-445b-b815-eb99fc6c699f",
              "vnd-eo-trace-id": "9397b13128dd33bf-WAW",
              "vnd-eo-visitorid": data.visitorId,
              "x-upwork-accept-language": "en-US",
              "x-upwork-api-tenantid": data.currentOrganizationUid,
              cookie:
                "spt=4f1cbfbe-9f23-49b4-abef-b6c674243fe5; visitor_id=188.163.15.68.1744210862791000; OptanonAlertBoxClosed=2025-04-09T15:01:09.902Z; _cq_duid=1.1744211760.8jdQyn2G58FxDVXh; _tt_enable_cookie=1; _ttp=01JRDHYN7SFAFK3XVR90Q8JXZE_.tt.1; __podscribe_upwork_referrer=_; __podscribe_upwork_landing_url=https://www.upwork.com/nx/my-stats/; __podscribe_did=pscrb_517df8e8-e4a6-4966-fb98-e800a90dd6e6; __pdst=5dccb20b0ecf40439a20d5a24cc1e5a8; IR_PI=0b6519a0-0fa9-11f0-a306-75eddef5d75b%7C1744280203286; ftr_ncd=6; _mkto_trk=id:518-RKL-392&token:_mch-upwork.com-536b75abc0db2b89a2412263e7d581e6; device_view=full; _ga_SB157S2R94=GS1.2.1744728658.2.1.1744730000.60.0.0; _ga=GA1.1.1906525938.1744211761; G_ENABLED_IDPS=google; DA_1e3cd18c=620cd9799af59ff23f2b1a39dad5a3952551f5c0f018860ec285eadc1586b42a; enabled_ff=!CI10270Air2Dot5QTAllocations,!CI10857Air3Dot0,!CI12577UniversalSearch,!MP16400Air3Migration,!RMTAir3Hired,!RMTAir3Home,!RMTAir3Offer,!RMTAir3Offers,!RMTAir3Talent,!SSINavUser,!SecAIBnrOn,!air2Dot76Qt,!i18nGA,CI11132Air2Dot75,CI17409DarkModeUI,CI9570Air2Dot5,JPAir3,OTBnrOn,SSINavUserBpa,TONB2256Air3Migration,air2Dot76,i18nOn; cookie_prefix=; cookie_domain=.upwork.com; __cflb=02DiuEXPXZVk436fJfSVuuwDqLqkhavJarEHY6RfmbXab; _cq_suid=1.1745926431.Z9P7Zl8HTZKmGa7A; IR_gbd=upwork.com; _gcl_au=1.1.1397849781.1744211760; recognized=mozgin_vladimir; console_user=mozgin_vladimir; user_uid=738640947602931712; DA_mozgin_vladimir=2fbda319600742c0c2f4a04c0e7ed35d11de290cc40b55505484a1c20f6f05dc; uThemeNull=1; _gcl_au=1.1.1397849781.1744211760; current_organization_uid=798585683090853888; company_last_accessed=3500338; _cfuvid=lbl7dIiHXh5yE2AyyD61jiS68E4rwnv7PNXLjZpGb1I-1745936087636-0.0.1.1-604800000; country_code=UA; SZ=37f79154429d752aefb2a787e0e7ceb7ba5faba4a6023256ad5f1a49dcffa4a8; ttcsid=1746002555500::fi-zD-ZxBOKVY79n1qER.20.1746002558150; _rdt_uuid=1744211761205.cf8b37e2-dabb-49c8-bb8a-37ceb8d6f1ac; _rdt_em=:61e13d050b2c59a6b4ee8377f11a2e17139bb04a03f9fe4718aec5d2f173dde3,61e13d050b2c59a6b4ee8377f11a2e17139bb04a03f9fe4718aec5d2f173dde3,36416ad2366bd0b31589ee406eae1b21b9323a2d6325ebad011bcba757e78486,36416ad2366bd0b31589ee406eae1b21b9323a2d6325ebad011bcba757e78486,61048931eb5ed58055179d9667c62645bb3c962953e6a370dc9334a1ef614177; IR_13634=1746002558421%7Cc-42541%7C1746002558421%7C%7C; _uetvid=f533e7d00f9e11f09467f7c2f9b63089; ttcsid_CGCUGEBC77UAPU79F02G=1746002555500::QIJTZISueXzZw1ngIAxS.21.1746002559751; _ga_KSM221PNDX=GS1.1.1746012675.22.0.1746012675.0.0.0; master_access_token=2a50f29e.oauth2v2_a4259b2bf8bf71a7f9f28217f9e2350d; oauth2_global_js_token=oauth2v2_ecbfddedd1b173c989af5d7bdc3913c8; XSRF-TOKEN=f4ebd46a95c7f1cbe509550c80117566; feae8c24sb=oauth2v2_28f740fefc707f8eb750a35fc878f577; _upw_ses.5831=*; cf_clearance=u8svw1MuTMFg3fIKzJZepN.jDqw4GCs7fT46b03GNGg-1746190019-1.2.1.1-_o1pzQda3BWVj3TcK4ib9M8rTAS6Lullg4uJU2xpqMpwaZgRSWWRpvOvinUk2j2pdu2zu.9P42I4rmzQaRERfUy8sEklunGjZGxR0eW.NHWCLeIxUezaiDgRS1I46xQhdxDhNeqlyNT5fCfcyLvtXEr8vM3fWQ9R9LpXirzzO4FFfn6_KKFoRnu5GHaFcpb83oFMzBay568REGEICCGgRFT3WJNga6TWA91pIno569Q3c8SW5TS9I7idvhiBF2vwhb82g3ZT7TJoXVEYs2ugi09PQ8JPVX4LN4stbaVU4mBAqvJS4g2_Ix0M1P9SKHY0u4UMbTeLZLclNfr2G6tWgVxoMB2j24ZgqWZZBfWNXIE; __cf_bm=p43Mbb9VZDzDdMkxnOEcKYiozR9G9gQ.VmrSs1156WA-1746190089-1.0.1.1-apJtUjxIbC6Lzykhy.nsr1fPowG5_ZeFn6GPzCUugCkZmaSgKlYNudIWJQoZIBNYW51eW20HC17cSrM7qRuacbOhtw4qSG1t71IwHu9FM20; umq=1022; OptanonConsent=isGpcEnabled=0&datestamp=Fri+May+02+2025+15%3A58%3A49+GMT%2B0300+(Eastern+European+Summer+Time)&version=202305.1.0&browserGpcFlag=0&isIABGlobal=false&hosts=&consentId=b54e9a2c-26bb-4c35-b77b-e02c43430ef0&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A1%2CC0003%3A1%2CC0004%3A1&geolocation=UA%3B12&AwaitingReconsent=false; AWSALBTG=NvjxVKffEyEqDKbzdK5602Wz2podhfwfgUGF+1fzo7gdslgB56FPp0mud3BQ6jO2L9XegXAswBAUHywQsl+8psmaPOZGtMtKDSeQu9pegc2KWe1flLszVFTvcjLmHmyB/2ozLm5ag36X8+oZVOQDqxVSCPf3vCCXV2iFmIH1wzz5; AWSALBTGCORS=NvjxVKffEyEqDKbzdK5602Wz2podhfwfgUGF+1fzo7gdslgB56FPp0mud3BQ6jO2L9XegXAswBAUHywQsl+8psmaPOZGtMtKDSeQu9pegc2KWe1flLszVFTvcjLmHmyB/2ozLm5ag36X8+oZVOQDqxVSCPf3vCCXV2iFmIH1wzz5; forterToken=898cb1a6a9c043a5b45322bcafd7de39_1746190729865_596_UDF43-m4_23ck_1qC+6odu3K8%3D-12463-v2; forterToken=898cb1a6a9c043a5b45322bcafd7de39_1746190729865_596_UDF43-m4_23ck_1qC+6odu3K8%3D-12463-v2; _upw_id.5831=1b722b28-0631-4e94-a8d3-2f98a2817c36.1744210862.25.1746190869.1746012686.9a755daf-b2cd-41d6-98cc-536b2609ffbb.a8bcc44f-b1bc-46ea-9900-09e1400fafb3.303a5ae1-8d1f-4cd7-ab9d-aa6299a9dd5d.1746189193163.76; AWSALB=5jYZBpXby8C/7XVwxpmq8uyzSxNdsrCxRDtk7ygeHBQyQSwpTuy07eKnDE42eO5It1rW9CXaNnQ0JXefyxf43jSF21inQn+ibzJ4gWZUZ9KoFfzKYSVs5ZEo9t+b; AWSALBCORS=5jYZBpXby8C/7XVwxpmq8uyzSxNdsrCxRDtk7ygeHBQyQSwpTuy07eKnDE42eO5It1rW9CXaNnQ0JXefyxf43jSF21inQn+ibzJ4gWZUZ9KoFfzKYSVs5ZEo9t+b",
              Referer:
                "https://www.upwork.com/nx/my-stats/agency/rwd41gx0alssloinrvzlfq/freelancer/ed0569fc",
              "Referrer-Policy": "origin-when-cross-origin",
            },
            body: '{"query":"query GetCurrentContext {\\n  currentContext {\\n    isAgency: agency\\n    isAce: ace\\n    isAgencyOwner: agencyOwner\\n    teams {\\n      id\\n      name\\n      label\\n      companyId\\n      contractors {\\n        firstName\\n        lastName\\n        nid\\n        uid\\n        name\\n      }\\n    }\\n  }\\n}"}',
            method: "POST",
          }
        );

        const result = await response.json();
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        return result.data.currentContext.teams[0].contractors;
      } catch (error) {
        console.error("Error sending POST request:", error);
      }
    },
    args: [variableToPass],
  });
  return result;
}
