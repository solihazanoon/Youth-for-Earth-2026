# Carbon Decode Deployment Guide

This guide provides step-by-step instructions for setting up and deploying the Carbon Decode project to **Vercel** with a **Google Cloud Firestore** backend database.

---

## 🗄️ Database Setup (Google Cloud Firestore)

Carbon Decode uses Google Cloud Firestore (NoSQL document store) to persist calculations, organizational audits, and green pledges.

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** (or select an existing one) and follow the setup wizard.
3. Once created, navigate to the project dashboard.

### Step 2: Enable Cloud Firestore
1. In the Firebase console sidebar, click **Build** > **Firestore Database**.
2. Click **Create Database**.
3. Choose a starting location close to your users.
4. Select **Production Mode** or **Test Mode** (Production Mode is recommended; the backend handles secure queries server-side).

### Step 3: Generate a Private Key
1. Click the gear icon next to **Project Overview** in the sidebar, and select **Project Settings**.
2. Go to the **Service Accounts** tab.
3. Click the **Generate New Private Key** button at the bottom of the page.
4. Confirm by clicking **Generate Key**. This downloads a private key `.json` file to your computer.
5. **Security Warning**: Keep this file secure! Do not share it publicly or commit it to version control.

---

## 💻 Local Development Setup

To run and test Carbon Decode locally:

### Step 1: Install Dependencies
Open your terminal in the project root directory and install dependencies:
```bash
npm install
```

### Step 2: Configure Service Account Key for Local Testing
1. Move the downloaded Firebase Service Account `.json` file into the `backend/` directory.
2. Rename it, or ensure it matches the pattern `*firebase-adminsdk*.json` (e.g. `backend/carbon-decode-firebase-adminsdk-fbsvc-585c18a6f3.json`).
3. *Note*: The `.gitignore` is pre-configured to ignore files matching this pattern, ensuring your private keys are never pushed to Git.

### Step 3: Run the Application
For local testing, the recommended tool is the **Vercel CLI** because it simulates Vercel's routing rules (`vercel.json` rewrites) locally:

1. Install the Vercel CLI globally if you haven't already:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Start the local server with routing configurations simulated:
   ```bash
   vercel dev
   ```
4. Access the application in your browser at `http://localhost:3000`.

*Alternatively*, if you only want to run the Express API server directly without Vercel routing simulation:
```bash
npm start
```
This runs the API on `http://localhost:3000`.

---

## ⚡ Production Deployment to Vercel

Vercel is used to host static frontend assets and run the Node.js backend serverless functions.

> [!IMPORTANT]
> **Environment Variables on Vercel**
> Because your service account credentials file is git-ignored, Vercel cannot access it directly. You must configure the environment variable `FIREBASE_SERVICE_ACCOUNT` on Vercel, containing the exact text of your downloaded `.json` credentials.

### Option A: Using the Vercel Dashboard (Recommended)

1. Commit and push your changes to your remote Git repository (GitHub, GitLab, or Bitbucket).
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New** > **Project**.
4. Import your Carbon Decode Git repository.
5. In the **Configure Project** step, expand the **Environment Variables** section:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: Copy and paste the entire, raw JSON content of your downloaded service account private key file.
6. Click **Deploy**.
7. Once deployed, Vercel will build and serve your static frontend from `/frontend/` and route API traffic to `/backend/server.js`.

### Option B: Using the Vercel CLI

1. Deploy the project to Vercel interactively:
   ```bash
   vercel
   ```
2. Link the project and complete the prompts.
3. Set up the environment variable via the Vercel dashboard, or using the CLI command:
   ```bash
   vercel env add FIREBASE_SERVICE_ACCOUNT
   ```
   *When prompted, select the environment (Production, Preview, Development) and paste the raw service account JSON string as the value.*
4. Deploy to production:
   ```bash
   vercel --prod
   ```
