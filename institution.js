// ================= FORM =================
const institutionForm = document.getElementById("institutionForm");

// ================= CHART VARIABLE =================
let institutionChart;

// ================= AI MESSAGE SYSTEM =================
function generateAIMessage(total, employees,students, electricity, transportFleet, wasteGenerated) {

    let level = "";
    let insight = "";
    let suggestion = "";

    // LEVEL SYSTEM
    if (total < 5000) {
        level = "Low Emission (Sustainable)";
    } 
    else if (total < 10000) {
        level = "Moderate Emission";
    } 
    else {
        level = "High Emission (Critical)";
    }

    // IMPACT CALCULATION
    const employeeImpact = employees * 15;
    const studentImpact = students * 15;
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

    // AI LOGIC
    if (maxImpact === electricityImpact) {
        insight = "Electricity usage is your biggest emission source.";
        suggestion = "Switch to renewable energy and improve efficiency.";
    } 
    else if (maxImpact === transportImpact) {
        insight = "Transport fleet is your biggest emission source.";
        suggestion = "Optimize routes and use electric vehicles.";
    } 
    else if (maxImpact === wasteImpact) {
        insight = "Waste generation is your biggest emission source.";
        suggestion = "Improve recycling and reduce waste production.";
    } 
    else if (maxImpact === studentImpact){
    insight = "Student activities are your biggest emission source.";
    suggestion = "Promote sustainable transport, awareness programs, and energy-saving practices among students.";
    }
    else {
        insight = "Employee operations are your main emission source.";
        suggestion = "Improve operational efficiency and reduce energy usage.";
    }

    return `
        <strong>${level}</strong><br><br>
        ${insight}<br><br>
        <b>Recommendation:</b> ${suggestion}
    `;
}

// ================= INITIAL CHART =================
window.onload = function () {

    const ctx = document.getElementById("institutionChart").getContext("2d");

    institutionChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Employees", "student", "Electricity", "Transport Fleet", "Waste"],
            datasets: [{
                label: "Carbon Impact",
                data: [0, 0, 0, 0],
                backgroundColor: [
                    "#1b4332",
                    "#2d6a4f",
                    "#40916c",
                    "#74c69d"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
};

// ================= FORM SUBMIT =================
institutionForm.addEventListener("submit", function (e) {

    e.preventDefault();

    // SHOW LOADING
    const loading = document.getElementById("loadingSection");
    loading.style.display = "flex";
    loading.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => {

        // INPUT VALUES (MATCH HTML IDS)
        const employees = Number(document.getElementById("employees").value);
        const students =Number(document.getElementById("students").value);
        const electricity = Number(document.getElementById("electricityUsage").value);
        const transportFleet = Number(document.getElementById("transportFleet").value);
        const wasteGenerated = Number(document.getElementById("wasteGenerated").value);

        // TOTAL EMISSION
        const total =
            (employees * 15) +
            (students * 10) +
            (electricity * 0.5) +
            (transportFleet * 20) +
            (wasteGenerated * 2);

        // HIDE LOADING
        loading.style.display = "none";

        // SHOW TOTAL
        document.getElementById("institutionEmission").innerHTML =
            total.toFixed(2) + " kg CO₂";

        // AI MESSAGE
        document.getElementById("combinedInsight").innerHTML =
            generateAIMessage(
                total,
                employees,
                students,
                electricity,
                transportFleet,
                wasteGenerated
            );

        // UPDATE CHART
        institutionChart.data.datasets[0].data = [
            employees * 15,
            students * 10,
            electricity * 0.5,
            transportFleet * 20,
            wasteGenerated * 2
        ];

        institutionChart.update();

        // SCROLL TO RESULT
        document.getElementById("chartSection")
            .scrollIntoView({ behavior: "smooth" });

    }, 1500);
});