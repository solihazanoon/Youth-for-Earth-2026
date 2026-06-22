const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, "carbon_decode.db");

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

// Initialize database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("❌ Database connection error:", err.message);
    } else {
        console.log("📂 Connected to SQLite database:", DB_PATH);
        initializeDatabaseSchema();
    }
});

// Initialize tables from schema.sql
function initializeDatabaseSchema() {
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        // Split schema by semicolons to execute statements individually
        const statements = schemaSql
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

        db.serialize(() => {
            statements.forEach((statement) => {
                db.run(statement, (err) => {
                    if (err) {
                        console.error("❌ Error running SQL schema statement:", err.message);
                    }
                });
            });
            
            // Add email column if not exists
            db.run("ALTER TABLE institution_calculations ADD COLUMN email TEXT", (err) => {
                if (err) {
                    if (err.message.includes("duplicate column name") || err.message.includes("already exists")) {
                        // Already exists
                    } else {
                        console.warn("⚠️ Warning checking/altering database column:", err.message);
                    }
                } else {
                    console.log("✅ Successfully added 'email' column to institution_calculations table.");
                }
            });

            console.log("✅ SQL Database schema tables verified/created successfully.");
        });
    } else {
        console.warn("⚠️ schema.sql not found! Skipping table auto-creation.");
    }
}

// Static files
app.use(express.static(__dirname));

// API routes

// Save individual calculation
app.post("/api/calculations/individual", (req, res) => {
    const {
        userName, transport, flights, electricity, diet, recycle,
        water, plastic, clothes, reusable, foodWaste, acUsage,
        energySaving, totalEmissions, ecoScore
    } = req.body;

    if (!userName || totalEmissions === undefined || ecoScore === undefined) {
        return res.status(400).json({ error: "Missing required assessment parameters." });
    }

    const query = `
        INSERT INTO individual_calculations (
            user_name, transport, flights, electricity, diet, recycle,
            water, plastic, clothes, reusable, food_waste, ac_usage,
            energy_saving, total_emissions, eco_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        userName, transport, flights, electricity, diet, recycle,
        water, plastic, clothes, reusable, foodWaste, acUsage,
        energySaving, totalEmissions, ecoScore
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error("❌ SQL insertion error (individual):", err.message);
            return res.status(500).json({ error: "Could not write calculation to database." });
        }
        res.status(201).json({ message: "Individual report saved successfully.", recordId: this.lastID });
    });
});

// Get recent individual calculations (limit to 10)
app.get("/api/calculations/individual", (req, res) => {
    const query = `
        SELECT * 
        FROM individual_calculations 
        ORDER BY created_at DESC 
        LIMIT 10
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ SQL selection error (individual):", err.message);
            return res.status(500).json({ error: "Could not read records from database." });
        }
        res.status(200).json(rows);
    });
});

// Save organization calculation
app.post("/api/calculations/institution", (req, res) => {
    const {
        institutionName, email, employees, students, electricityUsage,
        transportFleet, wasteGenerated, totalEmissions
    } = req.body;

    if (!institutionName || totalEmissions === undefined) {
        return res.status(400).json({ error: "Missing required institutional parameters." });
    }

    const query = `
        INSERT INTO institution_calculations (
            institution_name, email, employees, students, electricity_usage,
            transport_fleet, waste_generated, total_emissions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        institutionName, email, employees, students, electricityUsage,
        transportFleet, wasteGenerated, totalEmissions
    ];

    db.run(query, params, function (err) {
        if (err) {
            console.error("❌ SQL insertion error (institution):", err.message);
            return res.status(500).json({ error: "Could not write audit to database." });
        }
        res.status(201).json({ message: "Institutional audit saved successfully.", recordId: this.lastID });
    });
});

// Get recent organization audits (limit to 10)
app.get("/api/calculations/institution", (req, res) => {
    const query = `
        SELECT id, institution_name, total_emissions, created_at 
        FROM institution_calculations 
        ORDER BY created_at DESC 
        LIMIT 10
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ SQL selection error (institution):", err.message);
            return res.status(500).json({ error: "Could not read audit logs." });
        }
        res.status(200).json(rows);
    });
});

// Admin endpoints

// Get all individual records
app.get("/api/admin/calculations/individual", (req, res) => {
    const query = `
        SELECT * 
        FROM individual_calculations 
        ORDER BY created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ SQL selection error (admin individual):", err.message);
            return res.status(500).json({ error: "Could not read records from database." });
        }
        res.status(200).json(rows);
    });
});

// Get all organization records
app.get("/api/admin/calculations/institution", (req, res) => {
    const query = `
        SELECT * 
        FROM institution_calculations 
        ORDER BY created_at DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ SQL selection error (admin institution):", err.message);
            return res.status(500).json({ error: "Could not read audits from database." });
        }
        res.status(200).json(rows);
    });
});

// Delete individual record
app.delete("/api/admin/calculations/individual/:id", (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM individual_calculations WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            console.error("❌ SQL delete error (individual):", err.message);
            return res.status(500).json({ error: "Could not delete record from database." });
        }
        res.status(200).json({ message: "Record deleted successfully.", changes: this.changes });
    });
});

// Delete organization record
app.delete("/api/admin/calculations/institution/:id", (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM institution_calculations WHERE id = ?`;

    db.run(query, [id], function (err) {
        if (err) {
            console.error("❌ SQL delete error (institution):", err.message);
            return res.status(500).json({ error: "Could not delete audit from database." });
        }
        res.status(200).json({ message: "Audit deleted successfully.", changes: this.changes });
    });
});

// Create new pledge
app.post("/api/pledges", (req, res) => {
    const query = "INSERT INTO pledges (created_at) VALUES (?)";
    const timestamp = new Date().toISOString();
    db.run(query, [timestamp], function(err) {
        if (err) {
            console.error("❌ SQL insertion error (pledge):", err.message);
            return res.status(500).json({ error: "Could not save pledge." });
        }
        res.status(201).json({ message: "Pledge saved successfully.", recordId: this.lastID });
    });
});

// Get total pledge count
app.get("/api/pledges/count", (req, res) => {
    const query = "SELECT COUNT(*) as count FROM pledges";
    db.get(query, [], (err, row) => {
        if (err) {
            console.error("❌ SQL selection error (pledge count):", err.message);
            return res.status(500).json({ error: "Could not read pledge count." });
        }
        res.status(200).json({ count: row ? (row.count || 0) : 0 });
    });
});

// Start server
if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`🚀 Carbon Decode Backend Server started on http://localhost:${PORT}`);
    });
}

module.exports = app;
