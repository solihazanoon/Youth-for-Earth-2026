document.addEventListener("DOMContentLoaded", function () {
    // Environmental indicators

    // Time Constants
    const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
    const startOfYear = new Date("2026-01-01T00:00:00Z").getTime();
    
    // 1. GLOBAL CARBON CLOCK
    // Baseline: Global CO2 emissions are roughly 40 Billion (40,000,000,000) Metric Tons per year.
    const tonsPerYear = 40000000000;
    const carbonRatePerMs = tonsPerYear / msPerYear;
    const carbonClockEl = document.getElementById("globalCarbonClock");

    // 2. ATMOSPHERIC CO2 LEVEL (Keeling Curve estimation)
    // Baseline in Jan 2026: ~427.15 ppm. Rises by ~2.45 ppm per year.
    const co2Baseline = 427.15;
    const co2RatePerMs = 2.45 / msPerYear;
    const co2El = document.getElementById("co2Concentration");

    // 3. CLIMATE COUNTDOWN TIMER (1.5°C Warming Limit Threshold)
    // According to the IPCC Carbon Budget / Climate Clock, estimated deadline is around July 2029.
    const climateTargetDate = new Date("2029-07-22T17:00:00Z").getTime();
    const countdownEl = document.getElementById("climateCountdown");

    // Carbon facts ticker
    const globalFacts = [
        "Industrial operations and global energy production account for over 70% of global greenhouse emissions.",
        "Global atmospheric CO₂ concentration is currently rising by approximately 2.45 ppm per year.",
        "Deforestation and land clearance represent around 10-15% of all global human-caused carbon emissions.",
        "The top three carbon emitters (China, United States, and EU) contribute more than half of the world's total CO₂ emissions.",
        "Shifting to renewable solar and wind utilities can cut electricity sector emissions by more than 80% by 2030.",
        "Limiting global warming to 1.5°C requires cutting global net greenhouse emissions by 45% by 2030."
    ];

    let currentFactIndex = 0;
    const factTextEl = document.getElementById("worldFactText");
    const factTimeEl = document.getElementById("worldTime");

    function updateGlobalFact() {
        if (!factTextEl) return;

        factTextEl.style.opacity = 0;

        setTimeout(() => {
            factTextEl.textContent = globalFacts[currentFactIndex];
            
            const minutesAgo = Math.floor(Math.random() * 10) + 1;
            if (factTimeEl) {
                factTimeEl.textContent = `Updated ${minutesAgo}m ago`;
            }

            factTextEl.style.opacity = 1;
            currentFactIndex = (currentFactIndex + 1) % globalFacts.length;
        }, 500);
    }

    if (factTextEl) {
        updateGlobalFact();
        setInterval(updateGlobalFact, 7000);
    }

    // Kashmir news ticker
    const kashmirNews = [
        "Forest Department launches massive afforestation drive, planting over 1.3 million saplings across denuded hillsides in Kashmir.",
        "Migratory bird arrivals at Hokersar Wetland sanctuary hit record levels following successful restoration of lake water channels.",
        "Conservationists report accelerated retreat of Kolahoi Glacier, raising siltation concerns for the Jhelum river basin.",
        "Srinagar Smart City introduces eco-friendly electric bus fleets to reduce urban emission levels and air pollution.",
        "Massive Dal Lake cleanliness campaigns successfully extract invasive weed species and retrieve plastic deposits.",
        "J&K Pollution Control Board deploys real-time water quality monitoring sensors across key river checkpoints."
    ];

    let currentNewsIndex = 0;
    const newsTextEl = document.getElementById("newsText");
    const newsTimeEl = document.getElementById("newsTime");

    function updateKashmirNews() {
        if (!newsTextEl) return;

        // Apply a smooth fade out transition
        newsTextEl.style.opacity = 0;

        setTimeout(() => {
            // Update the text content
            newsTextEl.textContent = kashmirNews[currentNewsIndex];
            
            // Set timestamp (e.g. Just Now, 5m ago, etc. randomly for live feel)
            const minutesAgo = Math.floor(Math.random() * 10) + 1;
            if (newsTimeEl) {
                newsTimeEl.textContent = `Updated ${minutesAgo}m ago`;
            }

            // Fade back in
            newsTextEl.style.opacity = 1;

            // Shift index
            currentNewsIndex = (currentNewsIndex + 1) % kashmirNews.length;
        }, 500); // Wait for fade out to complete before swapping text
    }

    // Initial load
    if (newsTextEl) {
        updateKashmirNews();
        // Rotate news every 7 seconds
        setInterval(updateKashmirNews, 7000);
    }

    function updateLiveStats() {
        const now = Date.now();
        const elapsed = now - startOfYear;

        // Update Carbon Clock
        if (carbonClockEl) {
            const currentEmissions = elapsed * carbonRatePerMs;
            carbonClockEl.textContent = Math.floor(currentEmissions).toLocaleString() + " tons";
        }

        // Update CO2 Concentration
        if (co2El) {
            const currentCO2 = co2Baseline + (elapsed * co2RatePerMs);
            co2El.textContent = currentCO2.toFixed(6) + " ppm";
        }

        // Update Countdown Timer
        if (countdownEl) {
            const diff = climateTargetDate - now;

            if (diff <= 0) {
                countdownEl.textContent = "0y 000d 00:00:00";
            } else {
                const years = Math.floor(diff / msPerYear);
                const elapsedInYear = diff % msPerYear;
                
                const days = Math.floor(elapsedInYear / (24 * 60 * 60 * 1000));
                const elapsedInDay = elapsedInYear % (24 * 60 * 60 * 1000);
                
                const hours = Math.floor(elapsedInDay / (60 * 60 * 1000));
                const elapsedInHour = elapsedInDay % (60 * 60 * 1000);
                
                const minutes = Math.floor(elapsedInHour / (60 * 1000));
                const seconds = Math.floor((elapsedInHour % (60 * 1000)) / 1000);

                countdownEl.textContent = `${years}y ${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
            }
        }
    }

    // Refresh every 50 milliseconds for high-speed dynamic response of climate clocks
    setInterval(updateLiveStats, 50);
    updateLiveStats();
});
