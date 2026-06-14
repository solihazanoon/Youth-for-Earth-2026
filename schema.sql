-- Database Schema

-- Table: individual_calculations
-- Stores individual sustainability lifestyle assessments
CREATE TABLE IF NOT EXISTS individual_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_name TEXT NOT NULL,
    transport INTEGER,
    flights INTEGER,
    electricity INTEGER,
    diet INTEGER,
    recycle INTEGER,
    water INTEGER,
    plastic INTEGER,
    clothes INTEGER,
    reusable INTEGER,
    food_waste INTEGER,
    ac_usage INTEGER,
    energy_saving INTEGER,
    total_emissions REAL NOT NULL,
    eco_score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: institution_calculations
-- Stores institutional carbon emission audits
CREATE TABLE IF NOT EXISTS institution_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution_name TEXT NOT NULL,
    email TEXT,
    employees INTEGER,
    students INTEGER,
    electricity_usage REAL,
    transport_fleet REAL,
    waste_generated REAL,
    total_emissions REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: pledges
-- Stores green pledges signed by users
CREATE TABLE IF NOT EXISTS pledges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

