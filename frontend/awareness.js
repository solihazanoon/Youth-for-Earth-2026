const API_BASE_URL = "";

// Counter animation

const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {

    const target = +counter.getAttribute("data-target");

    let count = 0;

    const updateCounter = () => {

        const increment = target / 100;

        if (count < target) {

            count += increment;

            counter.innerText = Math.ceil(count);

            setTimeout(updateCounter, 20);

        } else {

            counter.innerText = target;
        }
    };

    updateCounter();

});

// Green pledge tracker

const pledgeBtn = document.getElementById("pledgeBtn");
const pledgeCountText = document.getElementById("pledgeCountText");

function updatePledgeCountDisplay(count) {
    if (pledgeCountText) {
        pledgeCountText.textContent = `🌱 Join ${count.toLocaleString()} others who have taken the pledge!`;
    }
}

function fetchPledgeCount() {
    if (window.location.protocol === "file:") {
        const localCount = Number(localStorage.getItem("carbon_decode_local_pledges_count") || "0");
        updatePledgeCountDisplay(localCount);
        return;
    }

    fetch(`${API_BASE_URL}/api/pledges/count`)
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            updatePledgeCountDisplay(data.count);
        })
        .catch(() => {
            // Local fallback
            const localCount = Number(localStorage.getItem("carbon_decode_local_pledges_count") || "0");
            updatePledgeCountDisplay(localCount);
        });
}

if (pledgeBtn) {
    // Check if already taken locally
    if (localStorage.getItem("greenPledgeTaken") === "true") {
        pledgeBtn.innerHTML = "🌱 Pledge Taken";
        pledgeBtn.disabled = true;
        pledgeBtn.style.opacity = "0.8";
        pledgeBtn.style.cursor = "default";
    }

    pledgeBtn.addEventListener("click", function() {
        const message = document.getElementById("pledgeMessage");
        if (message) {
            message.innerHTML = "✅ Thank you for taking the Green Pledge! Together we can create a cleaner and more sustainable future.";
            message.style.color = "#ffffff";
        }

        pledgeBtn.innerHTML = "🌱 Pledge Taken";
        pledgeBtn.disabled = true;
        pledgeBtn.style.opacity = "0.8";
        pledgeBtn.style.cursor = "default";
        
        localStorage.setItem("greenPledgeTaken", "true");

        if (window.location.protocol === "file:") {
            const localCount = Number(localStorage.getItem("carbon_decode_local_pledges_count") || "0") + 1;
            localStorage.setItem("carbon_decode_local_pledges_count", String(localCount));
            updatePledgeCountDisplay(localCount);
            return;
        }

        fetch(`${API_BASE_URL}/api/pledges`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
        .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
        })
        .then(data => {
            console.log("Pledge saved to DB successfully:", data);
            fetchPledgeCount(); // Refresh count
        })
        .catch(() => {
            console.warn("Could not save pledge to server. Incrementing local count fallback.");
            const localCount = Number(localStorage.getItem("carbon_decode_local_pledges_count") || "0") + 1;
            localStorage.setItem("carbon_decode_local_pledges_count", String(localCount));
            updatePledgeCountDisplay(localCount);
        });
    });

    // Load initial count
    fetchPledgeCount();
}


// Quiz handler

function answerQuiz(correct){

    const result =
    document.getElementById("quizResult");

    if(correct){

        result.innerHTML =
        "✅ Correct! Cars generally emit more CO₂ per passenger than buses.";

        result.style.color = "#2d6a4f";

    }else{

        result.innerHTML =
        "❌ Incorrect. Cars usually emit more CO₂ per passenger than buses.";

        result.style.color = "#c62828";
    }
}

// Real-time air quality tracker

document.addEventListener("DOMContentLoaded", function () {
    const aqiSearchBtn = document.getElementById("aqiSearchBtn");
    const aqiCityInput = document.getElementById("aqiCityInput");
    const dropdown = document.getElementById("aqiAutocompleteDropdown");
    let debounceTimer;
    
    if (aqiSearchBtn && aqiCityInput) {
        aqiSearchBtn.addEventListener("click", performAQISearch);
        aqiCityInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                performAQISearch();
            }
        });
        
        // Setup click listeners for AQI suggestion chips
        const aqiChips = document.querySelectorAll(".aqi-chip");
        aqiChips.forEach(chip => {
            chip.addEventListener("click", function () {
                aqiCityInput.value = this.getAttribute("data-city");
                if (dropdown) dropdown.style.display = "none";
                performAQISearch();
            });
        });

        const geocodeCache = {};

        function renderSuggestions(results) {
            if (dropdown && results && results.length > 0) {
                dropdown.innerHTML = "";
                results.forEach(loc => {
                    const formattedName = `${loc.name}, ${loc.admin1 ? loc.admin1 + ", " : ""}${loc.country}`;
                    const item = document.createElement("div");
                    item.className = "aqi-autocomplete-item";
                    item.textContent = formattedName;
                    item.addEventListener("click", function () {
                        aqiCityInput.value = formattedName;
                        dropdown.style.display = "none";
                        fetchAQIData(loc.latitude, loc.longitude, formattedName);
                    });
                    dropdown.appendChild(item);
                });
                dropdown.style.display = "block";
            } else {
                if (dropdown) dropdown.style.display = "none";
            }
        }

        // Setup input listener for dynamic autocomplete suggestions
        aqiCityInput.addEventListener("input", function () {
            clearTimeout(debounceTimer);
            const query = aqiCityInput.value.trim();
            if (query.length < 2) {
                if (dropdown) dropdown.style.display = "none";
                return;
            }

            const cacheKey = query.toLowerCase();
            if (geocodeCache[cacheKey]) {
                renderSuggestions(geocodeCache[cacheKey]);
                return;
            }

            debounceTimer = setTimeout(async function () {
                try {
                    const searchUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=3&format=json`;
                    const res = await fetch(searchUrl);
                    const data = await res.json();

                    const results = (data.results || []).slice(0, 3);
                    geocodeCache[cacheKey] = results;
                    renderSuggestions(results);
                } catch (err) {
                    console.warn("Geocoding auto-complete error:", err);
                }
            }, 250);
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
            if (dropdown && e.target !== aqiCityInput && e.target !== dropdown) {
                dropdown.style.display = "none";
            }
        });
    }

    async function fetchAQIData(lat, lon, formattedName) {
        const aqiLoading = document.getElementById("aqiLoading");
        const aqiResultsCard = document.getElementById("aqiResultsCard");
        const aqiError = document.getElementById("aqiError");

        aqiError.style.display = "none";
        aqiResultsCard.style.display = "none";
        aqiLoading.style.display = "block";

        try {
            const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,carbon_monoxide,nitrogen_dioxide&timezone=auto`;
            const aqiRes = await fetch(aqiUrl);
            const aqiData = await aqiRes.json();

            if (!aqiData.current) {
                throw new Error("No current air quality data returned from the weather grid.");
            }

            displayAQIResults(formattedName, aqiData.current);
        } catch (error) {
            showAQIError(error.message || "An error occurred while fetching atmospheric data.");
        } finally {
            aqiLoading.style.display = "none";
        }
    }

    async function performAQISearch() {
        const cityName = aqiCityInput.value.trim();
        if (!cityName) {
            showAQIError("Please enter a city name.");
            return;
        }

        const aqiLoading = document.getElementById("aqiLoading");
        const aqiResultsCard = document.getElementById("aqiResultsCard");
        const aqiError = document.getElementById("aqiError");

        // Clean query: split and use the first token (city name) if commas exist
        const searchName = cityName.includes(",") ? cityName.split(",")[0].trim() : cityName;

        aqiError.style.display = "none";
        aqiResultsCard.style.display = "none";
        aqiLoading.style.display = "block";

        try {
            const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=1&format=json`;
            const geocodeRes = await fetch(geocodeUrl);
            const geocodeData = await geocodeRes.json();

            if (!geocodeData.results || geocodeData.results.length === 0) {
                throw new Error(`Could not find coordinates for "${cityName}". Please check the spelling.`);
            }

            const location = geocodeData.results[0];
            const lat = location.latitude;
            const lon = location.longitude;
            const formattedName = `${location.name}, ${location.admin1 ? location.admin1 + ", " : ""}${location.country}`;

            await fetchAQIData(lat, lon, formattedName);
        } catch (error) {
            showAQIError(error.message || "An error occurred while fetching atmospheric data.");
            aqiLoading.style.display = "none";
        }
    }

    function showAQIError(message) {
        const aqiError = document.getElementById("aqiError");
        aqiError.textContent = `⚠️ ${message}`;
        aqiError.style.display = "block";
    }

    function displayAQIResults(cityName, currentData) {
        const aqiResultsCard = document.getElementById("aqiResultsCard");
        const aqiCityNameEl = document.getElementById("aqiCityName");
        const aqiTimeEl = document.getElementById("aqiTime");
        const aqiValueEl = document.getElementById("aqiValue");
        const aqiPm25El = document.getElementById("aqiPm25");
        const aqiCoEl = document.getElementById("aqiCo");
        const aqiNo2El = document.getElementById("aqiNo2");
        const aqiBadge = document.getElementById("aqiBadge");
        const aqiRecBox = document.getElementById("aqiRecBox");
        const aqiRecEl = document.getElementById("aqiRecommendation");

        // Set Basic Text
        aqiCityNameEl.textContent = cityName;
        
        // Format ISO timestamp to readable format
        const dateObj = new Date(currentData.time);
        aqiTimeEl.textContent = `Last updated: ${dateObj.toLocaleDateString()} at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        // US AQI Index
        const aqi = Math.round(currentData.us_aqi || 0);
        aqiValueEl.textContent = aqi;

        // Pollutants
        aqiPm25El.textContent = `${(currentData.pm2_5 || 0).toFixed(1)} µg/m³`;
        aqiCoEl.textContent = `${(currentData.carbon_monoxide || 0).toFixed(0)} µg/m³`;
        aqiNo2El.textContent = `${(currentData.nitrogen_dioxide || 0).toFixed(1)} µg/m³`;

        // Determine air quality tier and recommendation
        // Reset classes
        aqiBadge.className = "aqi-badge";
        aqiRecBox.className = "aqi-recommendation-box";

        let status = "Good";
        let badgeClass = "good";
        let recommendation = "Air quality is satisfactory, and air pollution poses little or no risk. It's a great day for outdoor activities!";

        if (aqi > 100) {
            status = "Unhealthy";
            badgeClass = "unhealthy";
            recommendation = "Active children and adults, and people with respiratory disease, such as asthma, should limit prolonged outdoor exertion. Consider keeping windows closed and wearing protective masks outside.";
        } else if (aqi > 50) {
            status = "Moderate";
            badgeClass = "moderate";
            recommendation = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution.";
        }

        aqiBadge.textContent = status;
        aqiBadge.classList.add(badgeClass);
        aqiRecBox.classList.add(badgeClass);
        aqiRecEl.textContent = recommendation;

        // Reveal Card
        aqiResultsCard.style.display = "block";
        aqiResultsCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
});