const express = require("express");
const fs = require("fs");
const path = require("path");

// Load environment variables from .env file if it exists (useful for local dev and persistent server config)
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    envConfig.split(/\r?\n/).forEach((line) => {
        // Simple key=value regex matcher
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || "";
            // Clean up surrounding quotes
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.substring(1, value.length - 1);
            } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
                value = value.substring(1, value.length - 1);
            }
            value = value.trim();
            // Assign to process.env if not already set
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

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

// Database Client Wrapper (Abstracting SQLite and MSSQL)
let db;

if (process.env.DB_TYPE === "mssql" || process.env.MSSQL_SERVER) {
    console.log("🔌 Using Microsoft SQL Server (MSSQL)");
    const sql = require("mssql");

    const config = {
        user: process.env.MSSQL_USER,
        password: process.env.MSSQL_PASSWORD,
        server: process.env.MSSQL_SERVER,
        database: process.env.MSSQL_DATABASE,
        options: {
            encrypt: true,
            trustServerCertificate: true
        }
    };

    const poolPromise = new sql.ConnectionPool(config)
        .connect()
        .then((pool) => {
            console.log("📂 Connected to MSSQL Database:", process.env.MSSQL_DATABASE);
            initializeMssqlDatabaseSchema(pool);
            return pool;
        })
        .catch((err) => {
            console.error("❌ MSSQL Connection Error:", err.message);
            process.exit(1);
        });

    db = {
        run: async (query, params, callback) => {
            try {
                let mssqlQuery = query;
                if (query.trim().toUpperCase().startsWith("INSERT INTO ")) {
                    mssqlQuery += "; SELECT SCOPE_IDENTITY() AS id";
                }
                
                let paramIndex = 0;
                mssqlQuery = mssqlQuery.replace(/\?/g, () => `@p${paramIndex++}`);

                const pool = await poolPromise;
                const request = pool.request();
                if (params) {
                    params.forEach((val, idx) => {
                        request.input(`p${idx}`, val);
                    });
                }
                const result = await request.query(mssqlQuery);
                if (callback) {
                    const context = {
                        lastID: result.recordset && result.recordset[0] ? result.recordset[0].id : null,
                        changes: result.rowsAffected ? result.rowsAffected[0] : 0
                    };
                    callback.call(context, null);
                }
            } catch (err) {
                console.error("❌ MSSQL Error running query:", err.message);
                if (callback) callback(err);
            }
        },
        all: async (query, params, callback) => {
            try {
                let mssqlQuery = query;
                if (query.toUpperCase().includes("LIMIT ")) {
                    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
                    if (limitMatch) {
                        const limit = limitMatch[1];
                        mssqlQuery = query.replace(/LIMIT\s+\d+/i, "");
                        mssqlQuery = mssqlQuery.replace(/SELECT\s+/i, `SELECT TOP ${limit} `);
                    }
                }

                let paramIndex = 0;
                mssqlQuery = mssqlQuery.replace(/\?/g, () => `@p${paramIndex++}`);

                const pool = await poolPromise;
                const request = pool.request();
                if (params) {
                    params.forEach((val, idx) => {
                        request.input(`p${idx}`, val);
                    });
                }
                const result = await request.query(mssqlQuery);
                if (callback) callback(null, result.recordset);
            } catch (err) {
                console.error("❌ MSSQL Error running query:", err.message);
                if (callback) callback(err);
            }
        },
        get: async (query, params, callback) => {
            try {
                let mssqlQuery = query;
                if (query.toUpperCase().includes("LIMIT ")) {
                    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
                    if (limitMatch) {
                        const limit = limitMatch[1];
                        mssqlQuery = query.replace(/LIMIT\s+\d+/i, "");
                        mssqlQuery = mssqlQuery.replace(/SELECT\s+/i, `SELECT TOP ${limit} `);
                    }
                }

                let paramIndex = 0;
                mssqlQuery = mssqlQuery.replace(/\?/g, () => `@p${paramIndex++}`);

                const pool = await poolPromise;
                const request = pool.request();
                if (params) {
                    params.forEach((val, idx) => {
                        request.input(`p${idx}`, val);
                    });
                }
                const result = await request.query(mssqlQuery);
                if (callback) callback(null, result.recordset ? result.recordset[0] : null);
            } catch (err) {
                console.error("❌ MSSQL Error running query:", err.message);
                if (callback) callback(err);
            }
        },
        serialize: (fn) => fn()
    };
} else {
    console.log("🔌 Using SQLite database");
    const sqlite3 = require("sqlite3").verbose();
    const localDb = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error("❌ Database connection error:", err.message);
        } else {
            console.log("📂 Connected to SQLite database:", DB_PATH);
            initializeDatabaseSchema();
        }
    });
    db = localDb;
}

// Initialize tables in MSSQL
function initializeMssqlDatabaseSchema(pool) {
    const checkAndCreateTables = async () => {
        try {
            const request = pool.request();
            
            // Check and create individual_calculations
            await request.query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='individual_calculations' AND xtype='U')
                CREATE TABLE individual_calculations (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_name NVARCHAR(255) NOT NULL,
                    transport INT,
                    flights INT,
                    electricity INT,
                    diet INT,
                    recycle INT,
                    water INT,
                    plastic INT,
                    clothes INT,
                    reusable INT,
                    food_waste INT,
                    ac_usage INT,
                    energy_saving INT,
                    total_emissions FLOAT NOT NULL,
                    eco_score INT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Check and create institution_calculations
            await request.query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='institution_calculations' AND xtype='U')
                CREATE TABLE institution_calculations (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    institution_name NVARCHAR(255) NOT NULL,
                    email NVARCHAR(255),
                    employees INT,
                    students INT,
                    electricity_usage FLOAT,
                    transport_fleet FLOAT,
                    waste_generated FLOAT,
                    total_emissions FLOAT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Check and create pledges
            await request.query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='pledges' AND xtype='U')
                CREATE TABLE pledges (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            console.log("✅ MSSQL Database schema verified/created successfully.");
        } catch (err) {
            console.error("❌ Error initializing MSSQL tables:", err.message);
        }
    };
    
    checkAndCreateTables();
}

// Initialize tables from schema.sql (for SQLite)
function initializeDatabaseSchema() {
    const schemaPath = path.join(__dirname, "schema.sql");
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
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
