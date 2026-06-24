const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? ""
    : "/api";

document.addEventListener("DOMContentLoaded", function () {
    let currentTab = "individual"; // "individual" or "institution"
    let individualData = [];
    let institutionData = [];
    let isOffline = false;

    // DOM elements
    const dbStatusEl = document.getElementById("adminDbStatus");
    const kpiTotalUsers = document.getElementById("kpiTotalUsers");
    const kpiAvgIndividual = document.getElementById("kpiAvgIndividual");
    const kpiTotalInst = document.getElementById("kpiTotalInst");
    const kpiAvgInst = document.getElementById("kpiAvgInst");
    const kpiTotalPledges = document.getElementById("kpiTotalPledges");
    
    const tabIndividual = document.getElementById("tabIndividual");
    const tabInstitution = document.getElementById("tabInstitution");
    
    const individualContainer = document.getElementById("individualContainer");
    const institutionContainer = document.getElementById("institutionContainer");
    
    const individualTableBody = document.getElementById("individualTableBody");
    const institutionTableBody = document.getElementById("institutionTableBody");
    
    const searchInput = document.getElementById("adminSearchInput");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    
    const adminModal = document.getElementById("adminModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");
    const closeModalBtn = document.getElementById("closeAdminModal");

    // Initialize page
    checkServerConnection();

    // Check connection and load data
    function checkServerConnection() {
        if (window.location.protocol === "file:") {
            isOffline = true;
            dbStatusEl.textContent = "Local Storage (Offline)";
            dbStatusEl.className = "db-status-badge offline";
            loadAllDataFromLocalStorage();
            return;
        }

        fetch(`${API_BASE_URL}/api/admin/calculations/individual`)
            .then(res => {
                if (!res.ok) throw new Error("Server response not ok");
                return res.json();
            })
            .then(data => {
                isOffline = false;
                dbStatusEl.textContent = "Database Connected";
                dbStatusEl.className = "db-status-badge active";
                loadAllDataFromDb();
            })
            .catch(err => {
                console.warn("⚠️ Admin Console running in offline fallback mode.");
                isOffline = true;
                dbStatusEl.textContent = "Local Storage (Offline)";
                dbStatusEl.className = "db-status-badge offline";
                loadAllDataFromLocalStorage();
            });
    }

    // Load records from database
    function loadAllDataFromDb() {
        // Fetch Individual Records
        const fetchInd = fetch(`${API_BASE_URL}/api/admin/calculations/individual`).then(r => r.json());
        // Fetch Institutional Records
        const fetchInst = fetch(`${API_BASE_URL}/api/admin/calculations/institution`).then(r => r.json());
        // Fetch Pledge Count
        const fetchPledges = fetch(`${API_BASE_URL}/api/pledges/count`).then(r => r.json()).catch(() => ({ count: 0 }));

        Promise.all([fetchInd, fetchInst, fetchPledges])
            .then(([indRecords, instRecords, pledgeData]) => {
                individualData = indRecords;
                institutionData = instRecords;
                calculateStats(pledgeData.count);
                renderCurrentTab();
            })
            .catch(err => {
                console.error("❌ Failed to fetch database admin logs:", err);
                loadAllDataFromLocalStorage();
            });
    }

    // Load records from local storage
    function loadAllDataFromLocalStorage() {
        individualData = JSON.parse(localStorage.getItem("individual_calculations") || "[]");
        institutionData = JSON.parse(localStorage.getItem("institution_calculations") || "[]");
        const localPledgesCount = Number(localStorage.getItem("carbon_decode_local_pledges_count") || "0");
        calculateStats(localPledgesCount);
        renderCurrentTab();
    }

    // Calculate summary statistics
    function calculateStats(pledgeCount) {
        // Individual Stats
        const totalUsers = individualData.length;
        kpiTotalUsers.textContent = totalUsers;
        if (totalUsers > 0) {
            const sumInd = individualData.reduce((sum, item) => sum + item.total_emissions, 0);
            kpiAvgIndividual.textContent = Math.round(sumInd / totalUsers).toLocaleString();
        } else {
            kpiAvgIndividual.textContent = "0";
        }

        // Institutional Stats
        const totalInsts = institutionData.length;
        kpiTotalInst.textContent = totalInsts;
        if (totalInsts > 0) {
            const sumInst = institutionData.reduce((sum, item) => sum + item.total_emissions, 0);
            kpiAvgInst.textContent = (sumInst / totalInsts).toFixed(1);
        } else {
            kpiAvgInst.textContent = "0";
        }

        // Pledge Stats
        if (kpiTotalPledges) {
            kpiTotalPledges.textContent = (pledgeCount !== undefined) ? pledgeCount.toLocaleString() : "0";
        }
    }

    // Tab switching
    tabIndividual.addEventListener("click", () => {
        currentTab = "individual";
        tabIndividual.className = "btn";
        tabInstitution.className = "btn secondary-btn";
        individualContainer.style.display = "block";
        institutionContainer.style.display = "none";
        searchInput.value = "";
        renderCurrentTab();
    });

    tabInstitution.addEventListener("click", () => {
        currentTab = "institution";
        tabIndividual.className = "btn secondary-btn";
        tabInstitution.className = "btn";
        individualContainer.style.display = "none";
        institutionContainer.style.display = "block";
        searchInput.value = "";
        renderCurrentTab();
    });

    // Render tables
    function renderCurrentTab() {
        const query = searchInput.value.trim().toLowerCase();
        
        if (currentTab === "individual") {
            const filtered = individualData.filter(item => 
                item.user_name.toLowerCase().includes(query)
            );
            renderIndividualTable(filtered);
        } else {
            const filtered = institutionData.filter(item => 
                item.institution_name.toLowerCase().includes(query)
            );
            renderInstitutionTable(filtered);
        }
    }

    // Render individual table
    function renderIndividualTable(data) {
        individualTableBody.innerHTML = "";
        if (data.length === 0) {
            individualTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 25px;">No individual records found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const dateStr = new Date(item.created_at || Date.now()).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${item.id || "L"}</td>
                <td><strong>${escapeHtml(item.user_name)}</strong></td>
                <td><span style="font-weight: 800; color: var(--accent);">${item.eco_score}</span>/100</td>
                <td><strong>${item.total_emissions.toLocaleString()} kg</strong> CO₂/yr</td>
                <td>${dateStr}</td>
                <td>
                    <button class="btn details-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px; margin: 2px;">View Details</button>
                    <button class="btn delete-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px; margin: 2px; background-color: #c62828;">Delete</button>
                </td>
            `;
            individualTableBody.appendChild(tr);
        });

        attachActionListeners("individual");
    }

    // Render organization table
    function renderInstitutionTable(data) {
        institutionTableBody.innerHTML = "";
        if (data.length === 0) {
            institutionTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 25px;">No organizational records found.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const dateStr = new Date(item.created_at || Date.now()).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric"
            });
            const sizeStr = item.students ? `${item.employees || 0} Staff / ${item.students || 0} Students` : `${item.employees || 0} Staff`;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${item.id || "L"}</td>
                <td><strong>${escapeHtml(item.institution_name)}</strong></td>
                <td>${sizeStr}</td>
                <td><strong>${item.total_emissions.toFixed(1)} tons</strong> CO₂/yr</td>
                <td>${dateStr}</td>
                <td>
                    <button class="btn details-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px; margin: 2px;">View Details</button>
                    <button class="btn delete-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 12px; margin: 2px; background-color: #c62828;">Delete</button>
                </td>
            `;
            institutionTableBody.appendChild(tr);
        });

        attachActionListeners("institution");
    }

    // Attach view/delete listeners
    function attachActionListeners(type) {
        // Details
        const detailsBtns = document.querySelectorAll(".details-btn");
        detailsBtns.forEach(btn => {
            btn.onclick = function () {
                const id = btn.getAttribute("data-id");
                showDetailsModal(type, id);
            };
        });

        // Delete
        const deleteBtns = document.querySelectorAll(".delete-btn");
        deleteBtns.forEach(btn => {
            btn.onclick = function () {
                const id = btn.getAttribute("data-id");
                const name = type === "individual" ? 
                    individualData.find(x => String(x.id) === String(id))?.user_name :
                    institutionData.find(x => String(x.id) === String(id))?.institution_name;

                if (confirm(`⚠️ Are you sure you want to permanently delete the audit record for "${name}"?`)) {
                    deleteRecord(type, id);
                }
            };
        });
    }

    // Delete record from database/local storage
    function deleteRecord(type, id) {
        if (isOffline) {
            // Delete from LocalStorage
            if (type === "individual") {
                individualData = individualData.filter(x => String(x.id) !== String(id));
                localStorage.setItem("individual_calculations", JSON.stringify(individualData));
            } else {
                institutionData = institutionData.filter(x => String(x.id) !== String(id));
                localStorage.setItem("institution_calculations", JSON.stringify(institutionData));
            }
            calculateStats();
            renderCurrentTab();
            alert("Record removed from local storage.");
        } else {
            // Delete from Database Server
            fetch(`${API_BASE_URL}/api/admin/calculations/${type}/${id}`, { method: "DELETE" })
                .then(res => {
                    if (!res.ok) throw new Error("Delete failed");
                    return res.json();
                })
                .then(data => {
                    if (type === "individual") {
                        individualData = individualData.filter(x => String(x.id) !== String(id));
                    } else {
                        institutionData = institutionData.filter(x => String(x.id) !== String(id));
                    }
                    calculateStats();
                    renderCurrentTab();
                    alert("Record deleted from SQL database.");
                })
                .catch(err => {
                    console.error("❌ Delete error:", err);
                    alert("Error: Could not delete record. Attempting local removal...");
                });
        }
    }

    // Render details modal
    function showDetailsModal(type, id) {
        modalBody.innerHTML = "";
        
        if (type === "individual") {
            const item = individualData.find(x => String(x.id) === String(id));
            if (!item) return;

            modalTitle.textContent = `Footprint details: ${item.user_name}`;
            modalBody.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 8px;">🚗 Transport Details</h4>
                        <p style="margin: 4px 0;"><strong>Annual Car Travel:</strong> ${item.transport || 0} km</p>
                        <p style="margin: 4px 0;"><strong>Annual Flights:</strong> ${item.flights || 0} hrs</p>
                    </div>
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 8px;">⚡ Utilities & Energy</h4>
                        <p style="margin: 4px 0;"><strong>Monthly Electricity:</strong> ${item.electricity || 0} kWh</p>
                        <p style="margin: 4px 0;"><strong>AC Usage:</strong> ${item.ac_usage || 0} hrs/day</p>
                        <p style="margin: 4px 0;"><strong>Energy Saving Appliances:</strong> ${item.energy_saving ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 8px;">🥗 Diet & Consumption</h4>
                        <p style="margin: 4px 0;"><strong>Daily Diet Style:</strong> ${escapeHtml(item.diet || 'Average')}</p>
                        <p style="margin: 4px 0;"><strong>Daily Food Waste:</strong> ${item.food_waste || 0} kg</p>
                        <p style="margin: 4px 0;"><strong>Water Conservation:</strong> ${item.water ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 8px;">♻️ Waste & Recycling</h4>
                        <p style="margin: 4px 0;"><strong>Weekly Trash Bags:</strong> ${item.plastic || 0} bags</p>
                        <p style="margin: 4px 0;"><strong>Weekly Recycled items:</strong> ${item.recycle || 0} items</p>
                        <p style="margin: 4px 0;"><strong>Reusable Bag usage:</strong> ${item.reusable ? 'Yes' : 'No'}</p>
                        <p style="margin: 4px 0;"><strong>Eco Clothes Shopping:</strong> ${item.clothes ? 'Yes' : 'No'}</p>
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(11, 37, 22, 0.08); margin-top: 20px; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div><strong>Eco Score Card:</strong> <span style="font-size: 20px; font-weight: 800; color: var(--accent);">${item.eco_score}</span>/100</div>
                    <div style="font-size: 16px;"><strong>Annual Emissions:</strong> <span style="font-weight: 700; color: var(--primary);">${item.total_emissions.toLocaleString()} kg CO₂</span></div>
                </div>
            `;
        } else {
            const item = institutionData.find(x => String(x.id) === String(id));
            if (!item) return;

            const studentRow = item.students ? `<p style="margin: 4px 0;"><strong>Students/Members count:</strong> ${item.students}</p>` : "";
            const emailRow = `<p style="margin: 4px 0;"><strong>Contact Email:</strong> ${item.email ? escapeHtml(item.email) : 'Not Provided'}</p>`;

            modalTitle.textContent = `Audit details: ${item.institution_name}`;
            modalBody.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 8px;">🏢 Organization Overview</h4>
                        <p style="margin: 4px 0;"><strong>Organization Name:</strong> ${escapeHtml(item.institution_name)}</p>
                        ${emailRow}
                        <p style="margin: 4px 0;"><strong>Employees/Staff count:</strong> ${item.employees || 0}</p>
                        ${studentRow}
                    </div>
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 8px;">⚡ Operational Footprint</h4>
                        <p style="margin: 4px 0;"><strong>Monthly Utilities:</strong> ${item.electricity_usage || 0} kWh</p>
                        <p style="margin: 4px 0;"><strong>Organization Fleet:</strong> ${item.transport_fleet || 0} liters/mo</p>
                        <p style="margin: 4px 0;"><strong>Waste Generated:</strong> ${item.waste_generated || 0} tons/mo</p>
                    </div>
                </div>
                <div style="border-top: 1px solid rgba(11, 37, 22, 0.08); margin-top: 20px; padding-top: 15px; text-align: right;">
                    <div style="font-size: 18px;"><strong>Organization Footprint:</strong> <span style="font-weight: 800; color: var(--primary);">${item.total_emissions.toFixed(1)} Tons CO₂/year</span></div>
                </div>
            `;
        }

        adminModal.style.display = "block";
    }

    // Modal close action
    closeModalBtn.onclick = function () {
        adminModal.style.display = "none";
    };

    window.onclick = function (e) {
        if (e.target === adminModal) {
            adminModal.style.display = "none";
        }
    };

    // Search input listener
    searchInput.addEventListener("input", renderCurrentTab);

    // Clear search
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        renderCurrentTab();
    });

    // Logout handler
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            sessionStorage.removeItem("adminLoggedIn");
            window.location.replace("login.html");
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(str) {
        if (!str) return "";
        return str
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
