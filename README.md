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


## 🛠️ Technology Stack

### Frontend
- **HTML5 & CSS3**: Semantic page structures and custom, responsive styles featuring glassmorphism, responsive navigation menus, grid layouts, and print stylesheets.
- **JavaScript (ES6+)**: Powers client-side quiz wizards, real-time carbon clocks, ecological countdowns, and geocoding/atmospheric API integrations.
- **Chart.js**: Client-side charting engine for rendering responsive emission breakdown visualizations.
- **Google Fonts**: Modern, premium typography using *Outfit* and *Plus Jakarta Sans*.

### Backend
- **Node.js & Express.js**: Server-side REST API built to handle data aggregation, secure admin actions, and user pledges.
- **Firebase Admin SDK**: Secure serverless communication and CRUD database queries.

### Database
- **Google Cloud Firestore**: Real-time NoSQL document database used to store calculations, organization audits, and user pledges.

### Hosting & Infrastructure
- **Vercel**: Monorepo hosting serving static frontend assets and running the backend as serverless Node.js functions.


