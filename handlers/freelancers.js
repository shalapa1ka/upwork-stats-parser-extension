import { parseFreelancerList } from "./fetch.js";
import { setCookie, getCookie } from "../helpers/cookies.js";

export async function populateFreelancers(freelancers, container) {
  freelancers.forEach((freelancer) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `freelancer-${freelancer.uid}`;
    checkbox.value = freelancer.uid;
    // checkbox.checked = true; // Default to checked

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = freelancer.name;

    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);

    container.appendChild(div);
  });
}

export async function freelancerList() {
  const cachedFreelancers = getCookie("freelancers");
  if (cachedFreelancers) {
    return JSON.parse(cachedFreelancers);
  }

  const freelancers = await parseFreelancerList();
  const freelancerData = freelancers.map((freelancer) => ({
    uid: freelancer.uid,
    name: freelancer.name,
  }));

  setCookie("freelancers", JSON.stringify(freelancerData), 1); // Store for 1 day
  return freelancerData;
}
