const express = require("express");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file if it exists (useful for local dev and persistent server config)
const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || "";
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.substring(1, value.length - 1);
            } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
                value = value.substring(1, value.length - 1);
            }
            value = value.trim();
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("../carbon-decode-firebase-adminsdk-fbsvc-585c18a6f3.json");

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
console.log("🔌 Connected to Google Cloud Firestore database successfully.");

// JSON body parsing
app.use(express.json());

// Enable CORS middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// Root endpoint for API check
app.get("/", (req, res) => {
    res.json({ status: "online", message: "Carbon Decode API Backend Server is running." });
});

// API routes

// Save individual calculation
app.post("/api/calculations/individual", async (req, res) => {
    const {
        userName, transport, flights, electricity, diet, recycle,
        water, plastic, clothes, reusable, foodWaste, acUsage,
        energySaving, totalEmissions, ecoScore
    } = req.body;

    if (!userName || totalEmissions === undefined || ecoScore === undefined) {
        return res.status(400).json({ error: "Missing required assessment parameters." });
    }

    try {
        const docRef = await db.collection("individual_calculations").add({
            user_name: userName,
            transport: Number(transport || 0),
            flights: Number(flights || 0),
            electricity: Number(electricity || 0),
            diet: Number(diet || 0),
            recycle: Number(recycle || 0),
            water: Number(water || 0),
            plastic: Number(plastic || 0),
            clothes: Number(clothes || 0),
            reusable: Number(reusable || 0),
            food_waste: Number(foodWaste || 0),
            ac_usage: Number(acUsage || 0),
            energy_saving: Number(energySaving || 0),
            total_emissions: Number(totalEmissions || 0),
            eco_score: Number(ecoScore || 0),
            created_at: new Date().toISOString()
        });
        res.status(201).json({ message: "Individual report saved successfully.", recordId: docRef.id });
    } catch (err) {
        console.error("❌ Firestore insertion error (individual):", err.message);
        res.status(500).json({ error: "Could not write calculation to database." });
    }
});

// Get recent individual calculations (limit to 10)
app.get("/api/calculations/individual", async (req, res) => {
    try {
        const snapshot = await db.collection("individual_calculations")
            .orderBy("created_at", "desc")
            .limit(10)
            .get();
        const rows = [];
        snapshot.forEach((doc) => {
            rows.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(rows);
    } catch (err) {
        console.error("❌ Firestore selection error (individual):", err.message);
        res.status(500).json({ error: "Could not read records from database." });
    }
});

// Save organization calculation
app.post("/api/calculations/institution", async (req, res) => {
    const {
        institutionName, email, employees, students, electricityUsage,
        transportFleet, wasteGenerated, totalEmissions
    } = req.body;

    if (!institutionName || totalEmissions === undefined) {
        return res.status(400).json({ error: "Missing required institutional parameters." });
    }

    try {
        const docRef = await db.collection("institution_calculations").add({
            institution_name: institutionName,
            email: email || "",
            employees: Number(employees || 0),
            students: Number(students || 0),
            electricity_usage: Number(electricityUsage || 0),
            transport_fleet: Number(transportFleet || 0),
            waste_generated: Number(wasteGenerated || 0),
            total_emissions: Number(totalEmissions || 0),
            created_at: new Date().toISOString()
        });
        res.status(201).json({ message: "Institutional audit saved successfully.", recordId: docRef.id });
    } catch (err) {
        console.error("❌ Firestore insertion error (institution):", err.message);
        res.status(500).json({ error: "Could not write audit to database." });
    }
});

// Get recent organization audits (limit to 10)
app.get("/api/calculations/institution", async (req, res) => {
    try {
        const snapshot = await db.collection("institution_calculations")
            .orderBy("created_at", "desc")
            .limit(10)
            .get();
        const rows = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            rows.push({
                id: doc.id,
                institution_name: data.institution_name,
                total_emissions: data.total_emissions,
                created_at: data.created_at
            });
        });
        res.status(200).json(rows);
    } catch (err) {
        console.error("❌ Firestore selection error (institution):", err.message);
        res.status(500).json({ error: "Could not read audit logs." });
    }
});

// Admin endpoints

// Get all individual records
app.get("/api/admin/calculations/individual", async (req, res) => {
    try {
        const snapshot = await db.collection("individual_calculations")
            .orderBy("created_at", "desc")
            .get();
        const rows = [];
        snapshot.forEach((doc) => {
            rows.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(rows);
    } catch (err) {
        console.error("❌ Firestore selection error (admin individual):", err.message);
        res.status(500).json({ error: "Could not read records from database." });
    }
});

// Get all organization records
app.get("/api/admin/calculations/institution", async (req, res) => {
    try {
        const snapshot = await db.collection("institution_calculations")
            .orderBy("created_at", "desc")
            .get();
        const rows = [];
        snapshot.forEach((doc) => {
            rows.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(rows);
    } catch (err) {
        console.error("❌ Firestore selection error (admin institution):", err.message);
        res.status(500).json({ error: "Could not read audits from database." });
    }
});

// Delete individual record
app.delete("/api/admin/calculations/individual/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection("individual_calculations").doc(id).delete();
        res.status(200).json({ message: "Record deleted successfully.", changes: 1 });
    } catch (err) {
        console.error("❌ Firestore delete error (individual):", err.message);
        res.status(500).json({ error: "Could not delete record from database." });
    }
});

// Delete organization record
app.delete("/api/admin/calculations/institution/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await db.collection("institution_calculations").doc(id).delete();
        res.status(200).json({ message: "Audit deleted successfully.", changes: 1 });
    } catch (err) {
        console.error("❌ Firestore delete error (institution):", err.message);
        res.status(500).json({ error: "Could not delete audit from database." });
    }
});

// Create new pledge
app.post("/api/pledges", async (req, res) => {
    try {
        const timestamp = new Date().toISOString();
        const docRef = await db.collection("pledges").add({
            created_at: timestamp
        });
        res.status(201).json({ message: "Pledge saved successfully.", recordId: docRef.id });
    } catch (err) {
        console.error("❌ Firestore insertion error (pledge):", err.message);
        res.status(500).json({ error: "Could not save pledge." });
    }
});

// Get total pledge count
app.get("/api/pledges/count", async (req, res) => {
    try {
        const snapshot = await db.collection("pledges").count().get();
        res.status(200).json({ count: snapshot.data().count });
    } catch (err) {
        console.error("❌ Firestore selection error (pledge count):", err.message);
        res.status(500).json({ error: "Could not read pledge count." });
    }
});

// Start server
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`🚀 Carbon Decode Backend Server started on http://localhost:${PORT}`);
    });
}

module.exports = app;
