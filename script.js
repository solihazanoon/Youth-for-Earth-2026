const carbonForm = document.getElementById("carbonForm");
const canvasEl = document.getElementById("carbonChart");
const ctx = canvasEl ? canvasEl.getContext("2d") : null;

let chart;

// Create chart

function createChart(transport, flights, energy, diet, waste, consumption) {

    if (typeof Chart === "undefined" || !ctx) {
        console.warn("Chart.js is not loaded or canvas context is unavailable.");
        return;
    }

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [
                ["Transport", "Commuting"],
                ["Air Travel", "(Flights)"],
                ["Home", "Energy"],
                ["Diet &", "Food Waste"],
                ["Waste &", "Recycling"],
                ["Consumption", "& Water"]
            ],

            datasets: [{
                data: [
                    transport,
                    flights,
                    energy,
                    diet,
                    waste,
                    consumption
                ],
                backgroundColor: [
                    "#163e26",
                    "#2a523a",
                    "#2e7d5c",
                    "#52b788",
                    "#74c69d",
                    "#95d5b2"
                ],
                borderRadius: 8,
                hoverBackgroundColor: [
                    "#1b4e2f",
                    "#356649",
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
                legend: {
                    display: false
                },
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
                    grid: {
                        display: false
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 6,
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            weight: 600,
                            size: 11
                        },
                        color: "#52635a"
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(11, 37, 22, 0.05)"
                    },
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
}

// Default empty chart

createChart(0, 0, 0, 0, 0, 0);

// Update UI display based on assessment record
function updateUIDisplay(record) {
    const transportVal = Number(record.transport || 0);
    const electricityVal = Number(record.electricity || 0);
    const flightsVal = Number(record.flights || 0);
    const dietVal = Number(record.diet || 0);
    const recycleVal = Number(record.recycle !== undefined ? record.recycle : 0);
    const waterVal = Number(record.water || 0);
    const plasticVal = Number(record.plastic !== undefined ? record.plastic : 60);
    const clothesVal = Number(record.clothes !== undefined ? record.clothes : 60);
    const reusableVal = Number(record.reusable !== undefined ? record.reusable : 30);
    const foodWasteVal = Number(record.food_waste !== undefined ? record.food_waste : (record.foodWaste || 40));
    const acUsageVal = Number(record.ac_usage !== undefined ? record.ac_usage : (record.acUsage || 150));
    const energySavingVal = Number(record.energy_saving !== undefined ? record.energy_saving : (record.energySaving || 30));

    // Emission calculations for the quiz steps
    const transportEmission = transportVal * 0.2;
    const flightEmission = flightsVal;
    
    // Step 4: Home Energy (Electricity + AC - Energy Saving)
    const energyEmission = Math.max(0, (electricityVal * 0.5) + (acUsageVal * 0.4) - (energySavingVal * 0.5));
    
    // Step 5: Diet & Food (Diet + Food Waste)
    const dietEmission = dietVal + (foodWasteVal * 1.5);
    
    // Step 6: Waste & Recycling (Recycling + Reusables + Single-use Plastics)
    const wasteEmission = (recycleVal * 1.2) + (reusableVal * 0.8) + (plasticVal * 1.0);
    
    // Step 7: Consumption (Water shower + Clothing purchases)
    const consumptionEmission = (waterVal * 1.5) + (clothesVal * 1.2);

    const total = Number(record.total_emissions !== undefined ? record.total_emissions : (transportEmission + flightEmission + energyEmission + dietEmission + wasteEmission + consumptionEmission));
    
    // Eco score calculation (scaled to realistic total emission values)
    const ecoScore = record.eco_score !== undefined ? record.eco_score : Math.max(0, Math.min(100, Math.round(100 - total / 22)));

    // Update Result elements
    const emissionValEl = document.getElementById("emissionValue");
    if (emissionValEl) emissionValEl.innerHTML = Math.round(total).toLocaleString() + " kg CO₂";

    // Update trees offset card
    const individualOffsetCard = document.getElementById("individualOffsetCard");
    const individualTreesNeeded = document.getElementById("individualTreesNeeded");
    if (individualOffsetCard && individualTreesNeeded) {
        const treesNeeded = Math.round(total / 22);
        individualTreesNeeded.textContent = treesNeeded.toLocaleString();
        individualOffsetCard.style.display = "block";
    }
    let level = "";
    let levelClass = "";
    if (total < 600) {
        level = "Low";
        levelClass = "tier-low";
    } else if (total < 1400) {
        level = "Moderate";
        levelClass = "tier-moderate";
    } else {
        level = "High";
        levelClass = "tier-high";
    }
    const emissionLevelEl = document.getElementById("emissionLevel");
    if (emissionLevelEl) emissionLevelEl.innerHTML = level;

    const ecoScoreEl = document.getElementById("ecoScore");
    if (ecoScoreEl) ecoScoreEl.innerHTML = ecoScore;

    const scoreEl = document.getElementById("score");
    if (scoreEl) scoreEl.innerHTML = ecoScore + "/100";

    // Generate dynamic suggestions based on hotspot
    let hotspot = "";
    let maxEmission = 0;
    
    if (transportEmission > maxEmission) { maxEmission = transportEmission; hotspot = "Transport Commuting"; }
    if (flightEmission > maxEmission) { maxEmission = flightEmission; hotspot = "Air Travel (Flights)"; }
    if (energyEmission > maxEmission) { maxEmission = energyEmission; hotspot = "Home Energy"; }
    if (dietEmission > maxEmission) { maxEmission = dietEmission; hotspot = "Diet & Food Waste"; }
    if (wasteEmission > maxEmission) { maxEmission = wasteEmission; hotspot = "Waste & Recycling"; }
    if (consumptionEmission > maxEmission) { maxEmission = consumptionEmission; hotspot = "Consumption & Water"; }

    let userName = record.user_name || "Eco-citizen";
    // Capitalize first letter of name for premium feel
    userName = userName.charAt(0).toUpperCase() + userName.slice(1);

    let intro = "";
    let advice = "";
    
    if (total < 600) {
        intro = `Excellent work, "${userName}"! Your annual carbon footprint is outstandingly low. Your lifestyle choices show a very strong commitment to sustainability.`;
    } else if (total < 1400) {
        intro = `Good effort, "${userName}". Your carbon footprint is moderate. You are on the right track, but some targeted lifestyle adjustments can help you lower your carbon impact significantly.`;
    } else {
        intro = `Hello "${userName}". Your carbon footprint is currently higher than recommended for sustainable living. Shifting some of your habits can make a dramatic difference.`;
    }

    if (hotspot === "Air Travel (Flights)" && flightEmission > 0) {
        advice = `Your primary carbon hotspot is "Air Travel (Flights)" (${flightEmission.toFixed(0)} kg CO₂). Aviation emits massive amounts of greenhouse gases directly into the atmosphere. Consider reducing non-essential flights, choosing local travel destinations, or switching to rail travel where possible.`;
    } else if (hotspot === "Transport Commuting" && transportEmission > 0) {
        advice = `Your primary carbon hotspot is "Transport Commuting" (${transportEmission.toFixed(0)} kg CO₂). Commuting in combustion vehicles is a leading driver of private emissions. Swapping some car trips for public transit, joining a carpool, cycling, or upgrading to an electric vehicle (EV) will help lower this impact.`;
    } else if (hotspot === "Home Energy" && energyEmission > 0) {
        advice = `Your primary carbon hotspot is "Home Energy" (${energyEmission.toFixed(0)} kg CO₂). To reduce energy emissions, switch to energy-efficient LED lighting, install smart power strips to prevent phantom power draw, utilize programmable thermostats, and consider looking into solar panel installations.`;
    } else if (hotspot === "Diet & Food Waste" && dietEmission > 0) {
        advice = `Your primary carbon hotspot is your "Dietary & Food Waste impact" (${dietEmission.toFixed(0)} kg CO₂). Livestock farming and food waste rotting in landfills have high greenhouse impacts. Transitioning to plant-forward meals, choosing local seasonal produce, and minimizing food waste will greatly reduce this hotspot.`;
    } else if (hotspot === "Waste & Recycling" && wasteEmission > 0) {
        advice = `Your primary carbon hotspot is "Waste & Recycling" (${wasteEmission.toFixed(0)} kg CO₂). Producing plastics and manufacturing consumer packaging are carbon-intensive processes. You can lower this by consistently recycling, carrying reusable bags/bottles, and actively avoiding single-use plastics.`;
    } else if (hotspot === "Consumption & Water" && consumptionEmission > 0) {
        advice = `Your primary carbon hotspot is "Consumption & Water" (${consumptionEmission.toFixed(0)} kg CO₂). Heating water for long showers and manufacturing/transporting new apparel requires significant energy. Try reducing shower durations to under 5-10 minutes and buying new clothing items only when necessary.`;
    } else {
        advice = "Your footprint is well-distributed. Continually recycling, utilizing reusable bags and bottles, and minimizing single-use plastics will help maintain your low-impact ecological baseline.";
    }

    const insightHtml = `
        <div class="modern-insight-container">
            <div class="insight-overview-row">
                <div class="insight-tier-badge ${levelClass}">
                    <span class="badge-label">Footprint Tier</span>
                    <span class="badge-value">${level}</span>
                </div>
                <p class="insight-intro-text">${intro}</p>
            </div>
            
            <div class="insight-grid">
                <div class="insight-subcard hotspot-card">
                    <div class="subcard-header">
                        <span class="card-icon">🚨</span>
                        <h4>Primary Hotspot</h4>
                    </div>
                    <div class="hotspot-highlight">
                        <span class="hotspot-name">${hotspot}</span>
                        <span class="hotspot-value">${Math.round(maxEmission).toLocaleString()} kg CO₂</span>
                    </div>
                    <p>This category accounts for the largest share of your personal emissions footprint.</p>
                </div>

                <div class="insight-subcard action-card">
                    <div class="subcard-header">
                        <span class="card-icon">💡</span>
                        <h4>AI Recommendation</h4>
                    </div>
                    <p>${advice}</p>
                </div>
            </div>
        </div>
    `;

    const insightEl = document.getElementById("individual-combinedInsight");
    if (insightEl) insightEl.innerHTML = insightHtml;

    // Breakdown Impact cards
    const transportImpactEl = document.getElementById("transportImpact");
    if (transportImpactEl) transportImpactEl.innerHTML = Math.round(transportEmission).toLocaleString() + " kg CO₂";

    const flightImpactEl = document.getElementById("flightImpact");
    if (flightImpactEl) flightImpactEl.innerHTML = Math.round(flightEmission).toLocaleString() + " kg CO₂";

    const energyImpactEl = document.getElementById("energyImpact");
    if (energyImpactEl) energyImpactEl.innerHTML = Math.round(energyEmission).toLocaleString() + " kg CO₂";

    const dietImpactEl = document.getElementById("dietImpact");
    if (dietImpactEl) dietImpactEl.innerHTML = Math.round(dietEmission).toLocaleString() + " kg CO₂";

    const wasteImpactEl = document.getElementById("wasteImpact");
    if (wasteImpactEl) wasteImpactEl.innerHTML = Math.round(wasteEmission).toLocaleString() + " kg CO₂";

    const consumptionImpactEl = document.getElementById("consumptionImpact");
    if (consumptionImpactEl) consumptionImpactEl.innerHTML = Math.round(consumptionEmission).toLocaleString() + " kg CO₂";

    // Update chart
    createChart(transportEmission, flightEmission, energyEmission, dietEmission, wasteEmission, consumptionEmission);

    // Populate/sync Form inputs
    const inputMapping = {
        userName: record.user_name || "",
        transport: record.transport || "",
        flights: record.flights !== undefined ? record.flights : "",
        electricity: record.electricity || "",
        diet: record.diet || "",
        recycle: record.recycle !== undefined ? record.recycle : "",
        water: record.water || "",
        plastic: record.plastic || "",
        clothes: record.clothes || "",
        reusable: record.reusable !== undefined ? record.reusable : "",
        foodWaste: record.food_waste !== undefined ? record.food_waste : (record.foodWaste || ""),
        acUsage: record.ac_usage !== undefined ? record.ac_usage : (record.acUsage || ""),
        energySaving: record.energy_saving !== undefined ? record.energy_saving : (record.energySaving || "")
    };

    for (const [id, val] of Object.entries(inputMapping)) {
        const el = document.getElementById(id);
        if (el) {
            el.value = val;
        }
    }

    // Visually highlight quiz cards to match the record data
    if (typeof highlightQuizCard === "function") {
        if (record.transport !== undefined) highlightQuizCard("transport", record.transport);
        if (record.flights !== undefined) highlightQuizCard("flights", record.flights);
        
        const elec = Number(record.electricity || 0);
        if (elec <= 100) highlightQuizCard("energy", "low");
        else if (elec <= 250) highlightQuizCard("energy", "moderate");
        else if (elec <= 400) highlightQuizCard("energy", "high");
        else highlightQuizCard("energy", "very_high");

        const dietVal = Number(record.diet || 0);
        if (dietVal <= 100) highlightQuizCard("diet", "vegan");
        else if (dietVal <= 180) highlightQuizCard("diet", "vegetarian");
        else if (dietVal <= 350) highlightQuizCard("diet", "mixed");
        else highlightQuizCard("diet", "high_meat");

        const rec = Number(record.recycle !== undefined ? record.recycle : 0);
        if (rec <= 0) highlightQuizCard("waste", "always");
        else if (rec <= 40) highlightQuizCard("waste", "sometimes");
        else if (rec <= 80) highlightQuizCard("waste", "rarely");
        else highlightQuizCard("waste", "never");

        const wat = Number(record.water || 0);
        if (wat <= 20) highlightQuizCard("consumption", "eco");
        else if (wat <= 50) highlightQuizCard("consumption", "moderate");
        else highlightQuizCard("consumption", "heavy");
    }
}

// Form submission handler

carbonForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const loading = document.getElementById("loadingSection");

    // Show loading indicator

    loading.style.display = "flex";

    loading.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    setTimeout(() => {

        const userName = document.getElementById("userName").value;
        const rawTransport = Number(document.getElementById("transport").value);
        const rawFlights = Number(document.getElementById("flights").value);
        const rawElectricity = Number(document.getElementById("electricity").value);
        const rawDiet = Number(document.getElementById("diet").value);
        const rawRecycle = Number(document.getElementById("recycle").value);
        const rawWater = Number(document.getElementById("water").value);
        const rawPlastic = Number(document.getElementById("plastic").value);
        const rawClothes = Number(document.getElementById("clothes").value);
        const rawReusable = Number(document.getElementById("reusable").value);
        const rawFoodWaste = Number(document.getElementById("foodWaste").value);
        const rawAcUsage = Number(document.getElementById("acUsage").value);
        const rawEnergySaving = Number(document.getElementById("energySaving").value);

        // Calculate emissions
        const transportEmission = rawTransport * 0.2;
        const flightEmission = rawFlights;
        const energyEmission = Math.max(0, (rawElectricity * 0.5) + (rawAcUsage * 0.4) - (rawEnergySaving * 0.5));
        const dietEmission = rawDiet + (rawFoodWaste * 1.5);
        const wasteEmission = (rawRecycle * 1.2) + (rawReusable * 0.8) + (rawPlastic * 1.0);
        const consumptionEmission = (rawWater * 1.5) + (rawClothes * 1.2);

        const total = transportEmission + flightEmission + energyEmission + dietEmission + wasteEmission + consumptionEmission;

        // Calculate eco score

        let ecoScore = Math.max(
            0,
            Math.min(
                100,
                Math.round(100 - total / 22)
            )
        );

        // Hide loading indicator

        loading.style.display = "none";

        const record = {
            user_name: userName,
            transport: rawTransport,
            flights: rawFlights,
            electricity: rawElectricity,
            diet: rawDiet,
            recycle: rawRecycle,
            water: rawWater,
            plastic: rawPlastic,
            clothes: rawClothes,
            reusable: rawReusable,
            food_waste: rawFoodWaste,
            ac_usage: rawAcUsage,
            energy_saving: rawEnergySaving,
            total_emissions: total,
            eco_score: ecoScore,
            created_at: new Date().toISOString()
        };

        // Update UI display
        updateUIDisplay(record);

        // Save to database
        fetch("/api/calculations/individual", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userName,
                transport: rawTransport,
                flights: rawFlights,
                electricity: rawElectricity,
                diet: rawDiet,
                recycle: rawRecycle,
                water: rawWater,
                plastic: rawPlastic,
                clothes: rawClothes,
                reusable: rawReusable,
                foodWaste: rawFoodWaste,
                acUsage: rawAcUsage,
                energySaving: rawEnergySaving,
                totalEmissions: total,
                ecoScore
            })
        })
        .then(res => {
            if (!res.ok) throw new Error("Server responded with error status");
            return res.json();
        })
        .then(data => {
            console.log("DB Success:", data);
            fetchHistory(); // refresh logs
        })
        .catch(err => {
            console.warn("DB Save failed, falling back to LocalStorage:", err);
            saveToLocal("individual", record);
            fetchHistory();
        });

        // Scroll to results section

        document.querySelector(
            ".individual-result-section"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }, 1200);
});


// Reset button handler

const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {

    resetBtn.addEventListener("click", function () {

        createChart(0, 0, 0, 0, 0, 0);

        document.getElementById("emissionValue").innerHTML =
            "0";

        document.getElementById("emissionLevel").innerHTML =
            "-";

        document.getElementById("score").innerHTML =
            "-";

        document.getElementById("ecoScore").innerHTML =
            "0";

        document.getElementById("individual-combinedInsight").innerHTML =
            "-";

        const transportImpactEl = document.getElementById("transportImpact");
        if (transportImpactEl) transportImpactEl.innerHTML = "-";

        const flightImpactEl = document.getElementById("flightImpact");
        if (flightImpactEl) flightImpactEl.innerHTML = "-";

        const energyImpactEl = document.getElementById("energyImpact");
        if (energyImpactEl) energyImpactEl.innerHTML = "-";

        const dietImpactEl = document.getElementById("dietImpact");
        if (dietImpactEl) dietImpactEl.innerHTML = "-";

        const wasteImpactEl = document.getElementById("wasteImpact");
        if (wasteImpactEl) wasteImpactEl.innerHTML = "-";

        const consumptionImpactEl = document.getElementById("consumptionImpact");
        if (consumptionImpactEl) consumptionImpactEl.innerHTML = "-";
    });
}

// Local storage fallback helpers

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

    fetch("/api/calculations/individual")
        .then(res => {
            if (!res.ok) throw new Error("Fetch failed");
            return res.json();
        })
        .then(data => {
            updateStatusBadge(true);
            window.lastFetchedHistory = data;
            renderHistoryRows(data);
        })
        .catch(err => {
            console.warn("Could not connect to database server. Loading from LocalStorage:", err);
            updateStatusBadge(false);
            const localData = getFromLocal("individual");
            window.lastFetchedHistory = localData;
            renderHistoryRows(localData);
        });
}

function renderHistoryRows(data) {
    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody) return;

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: var(--text-muted);">No assessments logged yet. Try completing the assessment above!</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = data.map((row, index) => {
        const dateStr = new Date(row.created_at).toLocaleDateString();
        const timeStr = new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
            <tr data-index="${index}" style="border-bottom: 1px solid rgba(11, 37, 22, 0.05);">
                <td style="padding: 15px 20px; font-weight: 600; color: var(--primary);">${escapeHTML(row.user_name)}</td>
                <td style="padding: 15px 20px;">${Math.round(row.total_emissions).toLocaleString()} kg CO₂</td>
                <td style="padding: 15px 20px; font-weight: 700; color: var(--accent);">${row.eco_score}/100</td>
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

// Click listener for history rows to load calculations dynamically
const tableBody = document.getElementById("historyTableBody");
if (tableBody) {
    tableBody.addEventListener("click", function (e) {
        const row = e.target.closest("tr");
        if (!row) return;
        const index = row.getAttribute("data-index");
        if (index === null) return;

        const record = window.lastFetchedHistory && window.lastFetchedHistory[Number(index)];
        if (!record) return;

        // Add selection styling
        tableBody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");

        // Load the record into the UI
        updateUIDisplay(record);

        // Smooth scroll to the result section
        document.querySelector(".individual-result-section").scrollIntoView({
            behavior: "smooth"
        });
    });
}

// Quiz control logic

let currentStep = 1;
const totalSteps = 7;

function updateQuizProgress() {
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const progressBar = document.getElementById("quizProgressBar");
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

function showStep(step) {
    const steps = document.querySelectorAll(".quiz-step");
    steps.forEach(s => {
        const stepNum = Number(s.getAttribute("data-step"));
        if (stepNum === step) {
            s.style.display = "block";
            s.classList.add("active");
        } else {
            s.style.display = "none";
            s.classList.remove("active");
        }
    });

    // Show/hide progress bar
    const progressContainer = document.querySelector(".quiz-progress-container");
    if (progressContainer) {
        progressContainer.style.display = "block";
    }

    currentStep = step;
    updateQuizProgress();
}

// Start Quiz Button
const quizStartBtn = document.getElementById("quizStartBtn");
if (quizStartBtn) {
    quizStartBtn.addEventListener("click", function () {
        const userNameInput = document.getElementById("userName");
        if (userNameInput && userNameInput.value.trim() !== "") {
            showStep(2);
        } else {
            if (userNameInput) userNameInput.reportValidity();
        }
    });
}

// Next Step Buttons
document.querySelectorAll(".next-step-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    });
});

// Previous Step Buttons
document.querySelectorAll(".prev-step-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });
});

// Helper to highlight a quiz card visually
function highlightQuizCard(field, value) {
    const cards = document.querySelectorAll(`.quiz-option-card[data-field="${field}"]`);
    cards.forEach(card => {
        if (String(card.getAttribute("data-value")) === String(value)) {
            card.classList.add("selected-card");
            // Enable Next/Submit buttons for this step
            const stepEl = card.closest(".quiz-step");
            if (stepEl) {
                const nextBtn = stepEl.querySelector(".next-step-btn");
                if (nextBtn) nextBtn.disabled = false;
                const submitBtn = stepEl.querySelector("#submitBtn");
                if (submitBtn) submitBtn.disabled = false;
            }
        } else {
            card.classList.remove("selected-card");
        }
    });
}

// Handle Option Card Clicks
document.querySelectorAll(".quiz-option-card").forEach(card => {
    card.addEventListener("click", function () {
        const field = this.getAttribute("data-field");
        const val = this.getAttribute("data-value");

        // Clear siblings and highlight this card
        const stepEl = this.closest(".quiz-step");
        if (stepEl) {
            stepEl.querySelectorAll(`.quiz-option-card[data-field="${field}"]`).forEach(c => c.classList.remove("selected-card"));
        }
        this.classList.add("selected-card");

        // Set hidden select values based on field selection
        if (field === "transport") {
            const hiddenSelect = document.getElementById("transport");
            if (hiddenSelect) hiddenSelect.value = val;
        } else if (field === "flights") {
            const hiddenSelect = document.getElementById("flights");
            if (hiddenSelect) hiddenSelect.value = val;
        } else if (field === "energy") {
            const hiddenElec = document.getElementById("electricity");
            const hiddenAc = document.getElementById("acUsage");
            const hiddenSaving = document.getElementById("energySaving");
            
            if (val === "low") {
                if (hiddenElec) hiddenElec.value = "100";
                if (hiddenAc) hiddenAc.value = "50";
                if (hiddenSaving) hiddenSaving.value = "0";
            } else if (val === "moderate") {
                if (hiddenElec) hiddenElec.value = "250";
                if (hiddenAc) hiddenAc.value = "150";
                if (hiddenSaving) hiddenSaving.value = "30";
            } else if (val === "high") {
                if (hiddenElec) hiddenElec.value = "400";
                if (hiddenAc) hiddenAc.value = "250";
                if (hiddenSaving) hiddenSaving.value = "70";
            } else if (val === "very_high") {
                if (hiddenElec) hiddenElec.value = "600";
                if (hiddenAc) hiddenAc.value = "400";
                if (hiddenSaving) hiddenSaving.value = "120";
            }
        } else if (field === "diet") {
            const hiddenDiet = document.getElementById("diet");
            const hiddenFoodWaste = document.getElementById("foodWaste");
            
            if (val === "vegan") {
                if (hiddenDiet) hiddenDiet.value = "100";
                if (hiddenFoodWaste) hiddenFoodWaste.value = "10";
            } else if (val === "vegetarian") {
                if (hiddenDiet) hiddenDiet.value = "180";
                if (hiddenFoodWaste) hiddenFoodWaste.value = "40";
            } else if (val === "mixed") {
                if (hiddenDiet) hiddenDiet.value = "350";
                if (hiddenFoodWaste) hiddenFoodWaste.value = "80";
            } else if (val === "high_meat") {
                if (hiddenDiet) hiddenDiet.value = "500";
                if (hiddenFoodWaste) hiddenFoodWaste.value = "120";
            }
        } else if (field === "waste") {
            const hiddenRecycle = document.getElementById("recycle");
            const hiddenReusable = document.getElementById("reusable");
            const hiddenPlastic = document.getElementById("plastic");
            
            if (val === "always") {
                if (hiddenRecycle) hiddenRecycle.value = "0";
                if (hiddenReusable) hiddenReusable.value = "0";
                if (hiddenPlastic) hiddenPlastic.value = "20";
            } else if (val === "sometimes") {
                if (hiddenRecycle) hiddenRecycle.value = "40";
                if (hiddenReusable) hiddenReusable.value = "30";
                if (hiddenPlastic) hiddenPlastic.value = "60";
            } else if (val === "rarely") {
                if (hiddenRecycle) hiddenRecycle.value = "80";
                if (hiddenReusable) hiddenReusable.value = "70";
                if (hiddenPlastic) hiddenPlastic.value = "100";
            } else if (val === "never") {
                if (hiddenRecycle) hiddenRecycle.value = "120";
                if (hiddenReusable) hiddenReusable.value = "120";
                if (hiddenPlastic) hiddenPlastic.value = "150";
            }
        } else if (field === "consumption") {
            const hiddenWater = document.getElementById("water");
            const hiddenClothes = document.getElementById("clothes");
            
            if (val === "eco") {
                if (hiddenWater) hiddenWater.value = "20";
                if (hiddenClothes) hiddenClothes.value = "20";
            } else if (val === "moderate") {
                if (hiddenWater) hiddenWater.value = "50";
                if (hiddenClothes) hiddenClothes.value = "60";
            } else if (val === "heavy") {
                if (hiddenWater) hiddenWater.value = "120";
                if (hiddenClothes) hiddenClothes.value = "150";
            }
        }

        // Enable next/submit button for this step
        if (stepEl) {
            const nextBtn = stepEl.querySelector(".next-step-btn");
            if (nextBtn) nextBtn.disabled = false;
            const submitBtn = stepEl.querySelector("#submitBtn");
            if (submitBtn) submitBtn.disabled = false;
        }

        // Auto-advance to the next step after a short delay for fluid experience
        if (currentStep < totalSteps) {
            setTimeout(() => {
                // Ensure the user hasn't already clicked "Back" during the timeout
                const activeStepNum = Number(stepEl.getAttribute("data-step"));
                if (activeStepNum === currentStep) {
                    showStep(currentStep + 1);
                }
            }, 350);
        }
    });
});

// Reset Quiz logic
function resetQuizWizard() {
    // Reset wizard variables
    currentStep = 1;
    updateQuizProgress();

    // Show step 1, hide others
    const steps = document.querySelectorAll(".quiz-step");
    steps.forEach(s => {
        const stepNum = Number(s.getAttribute("data-step"));
        if (stepNum === 1) {
            s.style.display = "block";
            s.classList.add("active");
        } else {
            s.style.display = "none";
            s.classList.remove("active");
        }
    });

    // Remove selections
    document.querySelectorAll(".quiz-option-card").forEach(c => c.classList.remove("selected-card"));
    
    // Disable next & submit buttons
    document.querySelectorAll(".next-step-btn").forEach(btn => btn.disabled = true);
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) submitBtn.disabled = true;

    // Reset hidden dropdowns to disabled/empty state
    const hiddenInputs = document.querySelectorAll("#hiddenCalculatorInputs select");
    hiddenInputs.forEach(select => {
        select.selectedIndex = 0;
    });

    // Clear name
    const userNameInput = document.getElementById("userName");
    if (userNameInput) userNameInput.value = "";
}

// Connect Reset Buttons
const hiddenResetBtn = document.getElementById("resetBtn");
if (hiddenResetBtn) {
    hiddenResetBtn.addEventListener("click", resetQuizWizard);
}
const uiResetBtn = document.getElementById("uiResetBtn");
if (uiResetBtn) {
    uiResetBtn.addEventListener("click", function() {
        // Trigger hidden form reset
        const resetBtnEl = document.getElementById("resetBtn");
        if (resetBtnEl) resetBtnEl.click();

        // Reset display results to defaults
        createChart(0, 0, 0, 0, 0, 0);
        document.getElementById("emissionValue").innerHTML = "0";
        document.getElementById("emissionLevel").innerHTML = "-";
        document.getElementById("score").innerHTML = "-";
        document.getElementById("ecoScore").innerHTML = "0";
        document.getElementById("individual-combinedInsight").innerHTML = "-";

        const individualOffsetCard = document.getElementById("individualOffsetCard");
        if (individualOffsetCard) individualOffsetCard.style.display = "none";
        const individualTreesNeeded = document.getElementById("individualTreesNeeded");
        if (individualTreesNeeded) individualTreesNeeded.textContent = "0";

        const transportImpactEl = document.getElementById("transportImpact");
        if (transportImpactEl) transportImpactEl.innerHTML = "-";

        const flightImpactEl = document.getElementById("flightImpact");
        if (flightImpactEl) flightImpactEl.innerHTML = "-";

        const energyImpactEl = document.getElementById("energyImpact");
        if (energyImpactEl) energyImpactEl.innerHTML = "-";

        const dietImpactEl = document.getElementById("dietImpact");
        if (dietImpactEl) dietImpactEl.innerHTML = "-";

        const wasteImpactEl = document.getElementById("wasteImpact");
        if (wasteImpactEl) wasteImpactEl.innerHTML = "-";

        const consumptionImpactEl = document.getElementById("consumptionImpact");
        if (consumptionImpactEl) consumptionImpactEl.innerHTML = "-";

        // Remove active class from history logs
        const tableBody = document.getElementById("historyTableBody");
        if (tableBody) {
            tableBody.querySelectorAll("tr").forEach(r => r.classList.remove("selected"));
        }

        // Scroll back to quiz form
        document.querySelector(".individual-form-section").scrollIntoView({
            behavior: "smooth"
        });
    });
}

// Print Report Button Handler
const individualPrintReportBtn = document.getElementById("individualPrintReportBtn");
if (individualPrintReportBtn) {
    individualPrintReportBtn.addEventListener("click", function() {
        window.print();
    });
}

// Initial fetch on page load
fetchHistory();