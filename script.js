const carbonForm = document.getElementById("carbonForm");
const ctx = document.getElementById("carbonChart").getContext("2d");

let chart;

// CREATE CHART FUNCTION

function createChart(transport, electricity, flights, diet) {

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [
                "Transport",
                "Electricity",
                "Flights",
                "Diet"
            ],

            datasets: [{
                data: [
                    transport,
                    electricity,
                    flights,
                    diet
                ],

                backgroundColor: [
                    "#4f7942",
                    "#5c8d50",
                    "#739e65",
                    "#8ab17d"
                ],

                borderRadius: 8
            }]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    display: false
                }
            },

            scales: {

                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// DEFAULT EMPTY CHART

createChart(0, 0, 0, 0);


// FORM SUBMIT

carbonForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const loading = document.getElementById("loadingSection");

    // SHOW LOADER

    loading.style.display = "flex";

    loading.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    setTimeout(() => {

        const transport =
            Number(document.getElementById("transport").value);

        const electricity =
            Number(document.getElementById("electricity").value);

        const flights =
            Number(document.getElementById("flights").value);

        const diet =
            Number(document.getElementById("diet").value);

        // EMISSION CALCULATIONS

        const transportEmission =
            transport * 0.2;

        const electricityEmission =
            electricity * 0.5;

        const flightEmission =
            flights * 50;

        const dietEmission =
            diet;

        const total =
            transportEmission +
            electricityEmission +
            flightEmission +
            dietEmission;

        // HIDE LOADER

        loading.style.display = "none";

        // TOTAL EMISSION

        document.getElementById("emissionValue").innerHTML =
            total.toFixed(2) + " kg CO₂";

        // EMISSION LEVEL

        let level = "";

        if (total < 500) {

            level = "Low";

        } else if (total < 1200) {

            level = "Moderate";

        } else {

            level = "High";
        }

        document.getElementById("emissionLevel").innerHTML =
            level;

        // ECO SCORE

        let ecoScore = Math.max(
            0,
            Math.min(
                100,
                Math.round(100 - total / 50)
            )
        );

        document.getElementById("ecoScore").innerHTML =
            ecoScore;

        document.getElementById("score").innerHTML =
            ecoScore + "/100";

        // AI INSIGHT

        let insight = "";

        if (total < 500) {

            insight =
                "Your carbon footprint is relatively low. Your lifestyle choices reflect strong sustainability practices. Continue using public transport, conserving energy, and supporting eco-friendly habits.";

        } else if (total < 1200) {

            insight =
                "Your carbon footprint is moderate. Small improvements in transportation, electricity consumption, and travel habits can significantly increase your sustainability score.";

        } else {

            insight =
                "Your carbon footprint is higher than recommended. Reducing electricity usage, minimizing unnecessary travel, and adopting greener lifestyle choices can substantially lower your environmental impact.";
        }

        document.getElementById("individual-combinedInsight").innerHTML =
            insight;

        // BREAKDOWN

        document.getElementById("transportImpact").innerHTML =
            transportEmission.toFixed(1) + " kg CO₂";

        document.getElementById("electricityImpact").innerHTML =
            electricityEmission.toFixed(1) + " kg CO₂";

        document.getElementById("flightImpact").innerHTML =
            flightEmission.toFixed(1) + " kg CO₂";

        document.getElementById("dietImpact").innerHTML =
            dietEmission.toFixed(1) + " kg CO₂";

        // UPDATE CHART

        createChart(
            transportEmission,
            electricityEmission,
            flightEmission,
            dietEmission
        );

        // SCROLL TO RESULT

        document.querySelector(
            ".individual-result-section"
        ).scrollIntoView({
            behavior: "smooth"
        });

    }, 1200);
});


// RESET BUTTON

const resetBtn = document.getElementById("resetBtn");

if (resetBtn) {

    resetBtn.addEventListener("click", function () {

        createChart(0, 0, 0, 0);

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

        document.getElementById("transportImpact").innerHTML =
            "-";

        document.getElementById("electricityImpact").innerHTML =
            "-";

        document.getElementById("flightImpact").innerHTML =
            "-";

        document.getElementById("dietImpact").innerHTML =
            "-";
    });
}