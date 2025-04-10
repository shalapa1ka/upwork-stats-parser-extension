export function populateFreelancers(freelancers, container) {
  freelancers.forEach((freelancer) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `freelancer-${freelancer.id}`;
    checkbox.value = freelancer.id;
    checkbox.checked = true; // Default to checked

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = freelancer.full_name;

    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);

    container.appendChild(div);
  });
}
