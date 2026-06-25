const API_BASE_URL = "";

// Form elements
const institutionForm = document.getElementById("institutionForm");

// Chart instance
let institutionChart;

// AI message generator
function generateAIMessage(total, employees, students, electricity, transportFleet, wasteGenerated, orgType) {

    let level = "";
    let levelClass = "";
    let suggestion = "";
    let insightCategory = "";

    // Determine tier based on total
    if (total < 5000) {
        level = "Sustainable";
        levelClass = "tier-low";
    } 
    else if (total < 10000) {
        level = "Moderate";
        levelClass = "tier-moderate";
    } 
    else {
        level = "High Impact";
        levelClass = "tier-high";
    }

    // Calculate category impacts
    const employeeImpact = employees * 15;
    const studentImpact = students * 10;
    const electricityImpact = electricity * 0.5;
    const transportImpact = transportFleet * 20;
    const wasteImpact = wasteGenerated * 2;

    const maxImpact = Math.max(
        employeeImpact,
        studentImpact,
        electricityImpact,
        transportImpact,
        wasteImpact
    );

    // Generate suggestions based on primary driver
    if (maxImpact === electricityImpact) {
        insightCategory = "Electricity Consumption";
        suggestion = "To reduce electricity footprint, shift to on-site renewable energy like solar panels, install intelligent motion-sensor LED lighting throughout campus facilities, optimize HVAC runtime schedules, and transition to Energy Star certified office devices.";
    } 
    else if (maxImpact === transportImpact) {
        insightCategory = "Transport Fleet Operations";
        suggestion = "Your primary driver is transport fleet. Try scheduling route optimisations to cut down miles, phase out older diesel/petrol vehicles to introduce utility electric vehicles, and encourage carbon-neutral staff mobility programs.";
    } 
    else if (maxImpact === wasteImpact) {
        insightCategory = "Waste & Recycling Generation";
        suggestion = "Waste generation has the highest footprint. Partner with local organic recyclers to audit student and staff cafeteria waste, initiate zero-single-use campus plastic rules, and set up clear multi-compartment recycling kiosks.";
    } 
    else if (maxImpact === studentImpact){
        insightCategory = orgType === "company" ? "Client & Visitor Commuting" : "Student Activities & Commuting";
        suggestion = orgType === "company" 
            ? "Client and daily visitor commuting is the leading driver. Promote digital client consultations, launch incentives for public transit commuting, install secure bike racks, and setup energy-efficient smart chargers."
            : "Student-related commuting and daily tasks are the leading driver. Organize ride-sharing apps, provide secure indoor bike racks, launch energetic sustainability awareness weeks, and install automated sleep-mode setups on public computer terminals.";
    }
    else {
        insightCategory = "Employee Operations";
        suggestion = "Employee operations contribute the largest share. Encourage smart telecommuting where possible, convert to a paperless cloud administration, establish office temperature control protocols, and run department-level green challenges.";
    }

    const orgLabel = orgType === "company" ? "company's" : "institution's";

    return `
        <div class="modern-insight-container">
            <div class="insight-overview-row">
                <div class="insight-tier-badge ${levelClass}">
                    <span class="badge-label">Operational Tier</span>
                    <span class="badge-value">${level}</span>
                </div>
                <p class="insight-intro-text">
                    Based on current audits, the ${orgLabel} estimated carbon output is <strong>${Math.round(total).toLocaleString()} kg CO₂</strong>. 
                    Targeted adjustments in key departments are recommended below to align with net-zero guidelines.
                </p>
            </div>
            
            <div class="insight-grid">
                <div class="insight-subcard hotspot-card">
                    <div class="subcard-header">
                        <span class="card-icon">🏢</span>
                        <h4>Primary Emission Driver</h4>
                    </div>
                    <div class="hotspot-highlight">
                        <span class="hotspot-name">${insightCategory}</span>
                        <span class="hotspot-value">${Math.round(maxImpact).toLocaleString()} kg CO₂</span>
                    </div>
                    <p>This category forms the largest portion of the ${orgLabel} carbon output metrics.</p>
                </div>

                <div class="insight-subcard action-card">
                    <div class="subcard-header">
                        <span class="card-icon">🌿</span>
                        <h4>Strategic Action Plan</h4>
                    </div>
                    <p>${suggestion}</p>
                </div>
            </div>
        </div>
    `;
}

// Render initial chart
window.onload = function () {

    const ctx = document.getElementById("institutionChart").getContext("2d");
    const isMobile = window.innerWidth <= 576;
    const initialLabels = isMobile ? 
        ["Staff", "Students", "Energy", "Fleet", "Waste"] : 
        ["Employees", "Students", "Electricity", ["Transport", "Fleet"], "Waste"];

    institutionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: initialLabels,
            datasets: [{
                label: "Carbon Impact",
                data: [0, 0, 0, 0, 0],
                backgroundColor: [
                    "#163e26",
                    "#2e7d5c",
                    "#52b788",
                    "#74c69d",
                    "#95d5b2"
                ],
                borderRadius: 8,
                hoverBackgroundColor: [
                    "#1b4e2f",
                    "#3a9b73",
                    "#6cd4a4",
                    "#95d5b2",
                    "#b7e4c7"
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "rgba(11, 37, 22, 0.95)",
                    titleFont: {
                        family: "'Outfit', sans-serif",
                        size: 14,
                        weight: "bold"
                    },
                    bodyFont: {
                        family: "'Plus Jakarta Sans', sans-serif",
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 30,
                        minRotation: 0,
                        padding: 6,
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            weight: 600,
                            size: isMobile ? 9 : 11
                        },
                        color: "#52635a"
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(11, 37, 22, 0.05)" },
                    ticks: {
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 12
                        },
                        color: "#52635a"
                    }
                }
            }
        }
    });
};

// Form submit handler
institutionForm.addEventListener("submit", function (e) {

    e.preventDefault();

    // Show loader
    const loading = document.getElementById("loadingSection");
    loading.style.display = "flex";
    loading.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {

        // Retrieve input values
        const email = document.getElementById("userEmail").value;
        const orgType = document.getElementById("orgType").value;
        const employees = Number(document.getElementById("employees").value);
        const students = Number(document.getElementById("students").value);
        const electricity = Number(document.getElementById("electricityUsage").value);
        const transportFleet = Number(document.getElementById("transportFleet").value);
        const wasteGenerated = Number(document.getElementById("wasteGenerated").value);

        // Calculate total emissions
        const total =
            (employees * 15) +
            (students * 10) +
            (electricity * 0.5) +
            (transportFleet * 20) +
            (wasteGenerated * 2);

        // Hide loader
        loading.style.display = "none";

        // Display total emissions
        document.getElementById("institutionEmission").innerHTML =
            Math.round(total).toLocaleString() + " kg CO₂";

        // Display offset trees
        const treesNeeded = Math.round(total / 22);
        const treesElement = document.getElementById("treesNeeded");
        const offsetCardElement = document.getElementById("offsetCard");
        if (treesElement && offsetCardElement) {
            treesElement.textContent = treesNeeded.toLocaleString();
            offsetCardElement.style.display = "block";
        }

        // Generate advice card
        document.getElementById("combinedInsight").innerHTML =
            generateAIMessage(
                total,
                employees,
                students,
                electricity,
                transportFleet,
                wasteGenerated,
                orgType
            );

        // Update chart data
        const isCompany = orgType === "company";
        updateChartConfig(isCompany);
        if (isCompany) {
            institutionChart.data.datasets[0].data = [
                employees * 15,
                electricity * 0.5,
                transportFleet * 20,
                wasteGenerated * 2
            ];
        } else {
            institutionChart.data.datasets[0].data = [
                employees * 15,
                students * 10,
                electricity * 0.5,
                transportFleet * 20,
                wasteGenerated * 2
            ];
        }

        institutionChart.update();

        // Save to database
        const institutionName = document.getElementById("userName").value;

        const record = {
            institution_name: institutionName,
            email: email,
            employees: employees,
            students: students,
            electricity_usage: electricity,
            transport_fleet: transportFleet,
            waste_generated: wasteGenerated,
            total_emissions: total,
            created_at: new Date().toISOString()
        };

        if (window.location.protocol === "file:") {
            saveToLocal("institution", record);
            fetchHistory();
        } else {
            fetch(`${API_BASE_URL}/api/calculations/institution`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    institutionName,
                    email,
                    employees,
                    students,
                    electricityUsage: electricity,
                    transportFleet,
                    wasteGenerated,
                    totalEmissions: total
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Server responded with error status");
                return res.json();
            })
            .then(data => {
                console.log("Institution DB Success:", data);
                fetchHistory(); // refresh logs
            })
            .catch(err => {
                console.warn("Institution DB Save failed, falling back to LocalStorage:", err);
                saveToLocal("institution", record);
                fetchHistory();
            });
        }

        // Scroll to results section
        document.getElementById("chartSection")
            .scrollIntoView({ behavior: "smooth" });

    }, 1500);
});

// Local storage fallbacks

function saveToLocal(type, record) {
    try {
        const key = `carbon_decode_${type}_logs`;
        const existing = JSON.parse(localStorage.getItem(key)) || [];
        existing.unshift(record); // add new record to start
        if (existing.length > 10) existing.pop(); // limit to 10
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
        console.error("Local storage save failed:", e);
    }
}

function getFromLocal(type) {
    try {
        const key = `carbon_decode_${type}_logs`;
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
        console.error("Local storage load failed:", e);
        return [];
    }
}

function updateStatusBadge(isConnected) {
    const badge = document.getElementById("dbStatusBadge");
    if (!badge) return;
    if (isConnected) {
        badge.textContent = "Database Connected";
        badge.className = "status-badge connected";
    } else {
        badge.textContent = "Local Storage (Offline)";
        badge.className = "status-badge offline";
    }
}

// History logs

function fetchHistory() {
    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody) return;

    if (window.location.protocol === "file:") {
        updateStatusBadge(false);
        const localData = getFromLocal("institution");
        renderHistoryRows(localData);
        return;
    }

    fetch(`${API_BASE_URL}/api/calculations/institution`)
        .then(res => {
            if (!res.ok) throw new Error("Fetch failed");
            return res.json();
        })
        .then(data => {
            updateStatusBadge(true);
            renderHistoryRows(data);
        })
        .catch(err => {
            console.warn("Could not connect to database server. Loading from LocalStorage:", err);
            updateStatusBadge(false);
            const localData = getFromLocal("institution");
            renderHistoryRows(localData);
        });
}

function renderHistoryRows(data) {
    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody) return;

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="padding: 20px; text-align: center; color: var(--text-muted);">No assessments logged yet. Try completing the assessment above!</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map(row => {
        const dateStr = new Date(row.created_at).toLocaleDateString();
        const timeStr = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
            <tr style="border-bottom: 1px solid rgba(11, 37, 22, 0.05);">
                <td style="padding: 15px 20px; font-weight: 600; color: var(--primary);">${escapeHTML(row.institution_name)}</td>
                <td style="padding: 15px 20px;">${Math.round(row.total_emissions).toLocaleString()} kg CO₂</td>
                <td style="padding: 15px 20px; font-size: 13px; color: var(--text-muted);">${dateStr} at ${timeStr}</td>
            </tr>
        `;
    }).join("");
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Update chart configuration
function updateChartConfig(isCompany) {
    if (!institutionChart) return;
    
    const isMobile = window.innerWidth <= 576;
    
    if (isCompany) {
        institutionChart.data.labels = isMobile ?
            ["Staff", "Energy", "Fleet", "Waste"] :
            ["Employees", "Electricity", ["Transport", "Fleet"], "Waste"];
        institutionChart.data.datasets[0].backgroundColor = [
            "#163e26",
            "#52b788",
            "#74c69d",
            "#95d5b2"
        ];
        institutionChart.data.datasets[0].hoverBackgroundColor = [
            "#1b4e2f",
            "#6cd4a4",
            "#95d5b2",
            "#b7e4c7"
        ];
    } else {
        institutionChart.data.labels = isMobile ?
            ["Staff", "Students", "Energy", "Fleet", "Waste"] :
            ["Employees", "Students", "Electricity", ["Transport", "Fleet"], "Waste"];
        institutionChart.data.datasets[0].backgroundColor = [
            "#163e26",
            "#2e7d5c",
            "#52b788",
            "#74c69d",
            "#95d5b2"
        ];
        institutionChart.data.datasets[0].hoverBackgroundColor = [
            "#1b4e2f",
            "#3a9b73",
            "#6cd4a4",
            "#95d5b2",
            "#b7e4c7"
        ];
    }
    
    institutionChart.options.scales.x.ticks.font.size = isMobile ? 9 : 11;
    institutionChart.options.scales.x.ticks.maxRotation = 30;
}

// Dynamic Label, Visibility & Placeholder Toggles for Company audits
const orgTypeSelect = document.getElementById("orgType");
if (orgTypeSelect) {
    orgTypeSelect.addEventListener("change", function() {
        const isCompany = this.value === "company";
        const nameLabel = document.querySelector("label[for='userName']");
        const nameInput = document.getElementById("userName");
        const studentsLabel = document.querySelector("label[for='students']");
        const studentsInput = document.getElementById("students");
        
        if (isCompany) {
            if (nameLabel) nameLabel.textContent = "Company Name";
            if (nameInput) nameInput.placeholder = "Enter Company or Brand Name";
            
            // Hide the member/student input section completely for companies
            if (studentsLabel) studentsLabel.style.display = "none";
            if (studentsInput) {
                studentsInput.style.display = "none";
                studentsInput.required = false;
                studentsInput.value = "0"; // Set to 0 so calculations and DB insert pass successfully
            }
        } else {
            if (nameLabel) nameLabel.textContent = "Institution Name";
            if (nameInput) nameInput.placeholder = "Enter School or Office Name";
            
            // Show the member/student input section for institutions
            if (studentsLabel) {
                studentsLabel.style.display = "block";
                studentsLabel.textContent = "Number of Students / Members";
            }
            if (studentsInput) {
                studentsInput.style.display = "block";
                studentsInput.required = true;
                studentsInput.placeholder = "Number of Students";
                studentsInput.value = "";
            }
        }
        
        // Dynamically adjust the chart labels and categories
        updateChartConfig(isCompany);
        if (institutionChart) {
            institutionChart.data.datasets[0].data = isCompany ? [0, 0, 0, 0] : [0, 0, 0, 0, 0];
            institutionChart.update();
        }
    });
}

// Reset event handler to restore default state styling
if (institutionForm) {
    institutionForm.addEventListener("reset", function() {
        setTimeout(() => {
            const nameLabel = document.querySelector("label[for='userName']");
            const nameInput = document.getElementById("userName");
            const studentsLabel = document.querySelector("label[for='students']");
            const studentsInput = document.getElementById("students");
            const offsetCardElement = document.getElementById("offsetCard");
            const treesElement = document.getElementById("treesNeeded");
            
            if (nameLabel) nameLabel.textContent = "Organization Name";
            if (nameInput) nameInput.placeholder = "Enter Organization Name";
            
            if (studentsLabel) {
                studentsLabel.style.display = "none";
            }
            if (studentsInput) {
                studentsInput.style.display = "none";
                studentsInput.required = false;
                studentsInput.value = "";
            }
            
            if (offsetCardElement) offsetCardElement.style.display = "none";
            if (treesElement) treesElement.textContent = "0";
            
            updateChartConfig(false);
            if (institutionChart) {
                institutionChart.data.datasets[0].data = [0, 0, 0, 0, 0];
                institutionChart.update();
            }
        }, 0);
    });
}

// Print Report Button Handler
const printReportBtn = document.getElementById("printReportBtn");
if (printReportBtn) {
    printReportBtn.addEventListener("click", function() {
        window.print();
    });
}

// Initial fetch on page load
fetchHistory();