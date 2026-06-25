# Carbon Decode

Carbon Decode is a comprehensive, interactive web platform designed to estimate, analyze, and offset carbon footprints. Built on a modern visual aesthetic, the application provides individual citizens and organizations with the tools to calculate their ecological impact, learn about environmental milestones, and take actionable pledges toward sustainability.

---

## 🌟 Key Features

### 1. Interactive Step-by-Step Quiz
- **Sleek UX Wizard**: Replaces static form inputs with an elegant, card-based question-and-answer flow.
- **Dynamic Charting**: Employs Chart.js to render real-time breakdowns of emissions across commuting, energy, diet, waste, and consumption.
- **AI-Powered Recommendations**: Automatically calculates the user's primary "carbon hotspot" and returns personalized, actionable reduction strategies.

### 2. Organizational Carbon Audits
- **Dual-Mode Profiles**: Customized audit streams for public institutions (schools, universities) and private corporations (corporate offices).
- **Emissions Reporting**: Computes total operational footprint and offsets it against mature tree-planting targets (assuming 22 kg CO₂ absorption per tree per year).
- **PDF Report Printing**: Includes customized print stylesheets to generate clean, professional physical or PDF report documents.

### 3. Live Environmental Dashboard
- **Carbon Clocks**: Displays a real-time running counter of global CO₂ emissions and atmospheric CO₂ concentrations (Keeling Curve estimation).
- **Threshold Countdown**: Shows a ticking countdown to the 1.5°C global warming limit.
- **Regional Spotlight**: Features Jammu and Kashmir's ecological pulse with live regional news tickers and Dal Lake wetland conservation indicators.
- **Global News Ticker**: Rotates through key scientific facts and positive milestones on clean technology and energy.

### 4. Real-Time Air Quality Index (AQI)
- **API Integrations**: Leverages geocoding and atmospheric APIs to fetch live PM2.5, nitrogen dioxide (NO₂), carbon monoxide (CO), and US-AQI metrics for any searched city.
- **Health Advisories**: Classifies air quality and offers health-conscious outdoor recommendation cards.

### 5. Persistent Green Pledges
- **Commitment Tracker**: Allows users to join a collective Green Pledge.
- **Live Counter**: Displays current participant counts fetched from the central database.

### 6. Secure Admin Console
- **Gated Access**: Secured behind session-controlled authentication.
- **Data Management**: Allows administrators to view granular audit fields, monitor pledge counts, and delete database records.

---

## 📂 Project Structure

The codebase is organized into clean, modular subdirectories:

```
carbon-decode/
├── frontend/
│   ├── images/         # Image assets (Dal Lake, heatmaps, illustrations)
│   ├── *.html          # HTML pages (home, calculator, awareness, admin)
│   ├── *.js            # Client-side scripts (Chart.js controls, tickers)
│   └── style.css       # Main stylesheet (premium responsive theme)
├── backend/
│   ├── server.js       # Node/Express backend server
│   └── *.json          # Firebase service account credentials JSON keys (git-ignored)
├── package.json        # Dependencies list (firebase-admin, express)
└── vercel.json         # Vercel deployment routing configurations
```

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), Chart.js
- **Backend**: Node.js, Express.js
- **Database**: Google Cloud Firestore (NoSQL Document Store)

---

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
1. **Node.js** (v18 or higher recommended) installed on your system.
2. A **Google Firebase** project with a Cloud Firestore database set up.

### Installation
1. Clone this repository to your local machine.
2. Install the necessary dependencies from the root directory:
   ```bash
   npm install
   ```

### Database Key Configuration
1. Generate and download the Firebase service account private key JSON file from the Firebase Console (under **Project Settings** > **Service Accounts**).
2. Save this `.json` file in the `backend/` directory. The project is pre-configured to load it automatically during local development.

### Running the App
To run the full app locally with active serverless routing matching Vercel's behavior:
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run the development environment:
   ```bash
   vercel dev
   ```
3. Open `http://localhost:3000` in your web browser.

*Alternatively, to start only the backend Express API server directly:*
```bash
npm start
```

