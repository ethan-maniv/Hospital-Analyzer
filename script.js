let map;
let hospitalList = document.getElementById("hospital-list");

function initMap() {
    map = L.map("map").setView([0, 0], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
    }).addTo(map);
}

function showHospitalSelection() {
    const hospitalSelection = document.getElementById("hospital-selection");
    hospitalSelection.style.display = "block";
}

function addHospitalCheckbox(hospitalId, hospitalName) {
    const selectedHospitals = document.getElementById("selected-hospitals");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "hospital-checkbox";
    checkbox.value = hospitalId;
    selectedHospitals.appendChild(checkbox);

    const label = document.createElement("label");
    label.textContent = hospitalName;
    selectedHospitals.appendChild(label);

    selectedHospitals.appendChild(document.createElement("br"));
}

function createBarGraph(element, hospitalName, rate, metricName) {
    const barGraphContainer = document.getElementById(element);
    const barGraph = document.createElement("div");
    barGraph.className = "bar-graph";

    // Calculate the width of the colored bar based on the rate as a percentage of the maximum width
    const maxWidth = 200; // Maximum width in pixels, adjust as needed
    const coloredBarWidth = rate *80;

    barGraph.style.width = `${coloredBarWidth}%`



    barGraph.innerHTML = `
        <span class="bar-label">${hospitalName}:</span>
        <span>${metricName}: ${(rate * 100).toFixed(2)}%</span>`;
        console.log(coloredBarWidth)

    // Append the bar graph to the bar graph container
    barGraphContainer.appendChild(barGraph);
}
function scrollToComparison() {
    const hospitalComparisonSection = document.getElementById("hospital-comparison");
    hospitalComparisonSection.scrollIntoView({ behavior: 'smooth' });
}

function compareHospitals() {
    const selectedHospitalCheckboxes = document.querySelectorAll('input[name="hospital-checkbox"]:checked');

    if (selectedHospitalCheckboxes.length !== 2) {
        alert("Select exactly two hospitals to compare.");
        return;
    }

    // Read the CSV file and perform checks
    fetch("hospitals.csv")
        .then((response) => response.text())
        .then((csvData) => {
            const hospitals = csvData.split('\n');
            const selectedHospitals = [];

            selectedHospitalCheckboxes.forEach((checkbox) => {
                const hospitalId = checkbox.value;
                const hospitalName = checkbox.nextElementSibling.textContent;
                selectedHospitals.push({ id: hospitalId, name: hospitalName });
            });

            const metrics = selectedHospitals.map((hospital) => {
                const foundHospital = hospitals.find((line) => line.includes(hospital.name));
                if (foundHospital) {
                    const values = foundHospital.split(',');
                    const readmissionRate = parseFloat(values[2]);
                    const costEffectiveness = parseFloat(values[3]);
                    const patientSatisfaction = parseFloat(values[4]);
                    return { name: hospital.name, readmissionRate, costEffectiveness, patientSatisfaction };
                }
                return { name: hospital.name, readmissionRate: 0, costEffectiveness: 0, patientSatisfaction: 0 };
            });

            // Display metrics as bar graphs
            metrics.forEach((hospital) => {
                createBarGraph("readmission-rates", hospital.name, hospital.readmissionRate, "Readmission Rate");
                createBarGraph("cost-effectiveness", hospital.name, hospital.costEffectiveness, "Cost Effectiveness");
                createBarGraph("patient-satisfaction", hospital.name, hospital.patientSatisfaction, "Patient Satisfaction");
            });

            // Show the hospital comparison section
            const hospitalComparison = document.getElementById("hospital-comparison");
            hospitalComparison.style.display = "block";
        });
}

function scrollToBottom() {
    window.scrollTo({
        bottom: document.body.scrollHeight,
        behavior: 'smooth' // You can use 'auto' for instant scrolling
    });
}




function findHospitals() {
    const zipCode = document.getElementById("zip-code").value;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${zipCode}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                map.setView([lat, lon], 13);

                fetch(
                    `https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%3B%0A%28node%5B%22amenity%22%3D%22hospital%22%5D%28around%3A10000%2C${lat}%2C${lon}%29%3Bway%5B%22amenity%22%3D%22hospital%22%5D%28around%3A10000%2C${lat}%2C${lon}%29%3Brelation%5B%22amenity%22%3D%22hospital%22%5D%28around%3A10000%2C${lat}%2C${lon}%29%3B%29%3Bout%3B`
                )
                    .then((response) => response.json())
                    .then((data) => {
                        hospitalList.innerHTML = "";
                        data.elements.forEach((element) => {
                            if (element.tags.name) {
                                const hospitalName = element.tags.name;
                                const hospitalLat = element.lat;
                                const hospitalLon = element.lon;
                                const listItem = document.createElement("li");
                                listItem.innerHTML = `${hospitalName} - <a href="https://www.openstreetmap.org/?mlat=${hospitalLat}&mlon=${hospitalLon}">View on Map</a>`;
                                hospitalList.appendChild(listItem);

                                // Add checkboxes next to each hospital
                                addHospitalCheckbox(element.id, hospitalName);
                            }
                        });
                        // Show the selection options
                        showHospitalSelection();
                    });
            } else {
                alert("ZIP code not found or invalid.");
            }
        });
}

initMap();
