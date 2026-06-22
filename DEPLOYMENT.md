# Carbon Decode Deployment Guide

This guide provides step-by-step instructions for deploying the Carbon Decode project to **Vercel** and **SmarterASP.NET**.

---

## ⚡ Deployment to Vercel

Vercel is ideal for hosting frontend static assets and serverless Node.js endpoints.

> [!IMPORTANT]
> **Vercel SQLite Persistence Limitation**
> Vercel runs Node.js in a serverless environment with a read-only filesystem. 
> - Writing to a local SQLite database in the root folder will fail.
> - To make it work in Vercel's ephemeral environment, you must set the environment variable `DATABASE_PATH` to `/tmp/carbon_decode.db` in your Vercel Dashboard. 
> - *Note*: `/tmp` storage is ephemeral. The database will be recreated whenever the serverless function restarts, and data will not be permanently preserved. For persistent database hosting on Vercel, it is recommended to migrate the SQLite driver to a cloud-hosted database (such as Neon PostgreSQL or Supabase) or deploy on a persistent server like SmarterASP.NET.

### Option A: Using the Vercel Git Integration (Recommended)
1. Commit and push your changes to your Git repository (GitHub, GitLab, or Bitbucket).
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New** > **Project**.
4. Import your Git repository.
5. In the **Configure Project** step:
   - Keep the default build settings (Vercel automatically detects Node.js and static files based on `vercel.json`).
   - Expand the **Environment Variables** section and add:
     - **Key**: `DATABASE_PATH`
     - **Value**: `/tmp/carbon_decode.db`
6. Click **Deploy**.

### Option B: Using the Vercel CLI
1. Install the Vercel CLI globally if you haven't already:
   ```bash
   npm install -g vercel
   ```
2. Log in to your Vercel account:
   ```bash
   vercel login
   ```
3. Run the deployment command from the project root:
   ```bash
   vercel
   ```
4. Set up the `DATABASE_PATH` environment variable under your Vercel project settings page, then redeploy:
   ```bash
   vercel --prod
   ```

---

## 🌐 Deployment to SmarterASP.NET

SmarterASP.NET provides traditional, persistent IIS web hosting. This is perfect for Node.js apps using local SQLite databases since the files are persistent.

### Step 1: Create a Node.js Website on SmarterASP.NET
1. Log in to your SmarterASP.NET Control Panel.
2. Under **Websites**, click **Add New Website** or choose an existing domain.
3. In the website settings, change the **App Pool** mode to support Node.js (ensure Node.js hosting is enabled on your plan).

### Step 2: Upload Files via FTP
1. Connect to your site's FTP server using an FTP client (such as FileZilla).
2. Upload all project files to the root directory (`/` or `/site1` depending on your setup).
3. **Important**: Make sure to upload:
   - `web.config`
   - `vercel.json`
   - `server.js`
   - `schema.sql`
   - `package.json`
   - All static pages (`index.html`, `admin.html`, `awareness.html`, `individual.html`, `organization.html`, `about.html`)
   - All client-side JavaScript (`script.js`, `admin.js`, `awareness.js`, `home.js`, `organization.js`)
   - `style.css` and any image assets.
4. **Note on `node_modules`**: It is recommended *not* to upload the `node_modules` folder via FTP as it contains thousands of small files and is very slow. Instead, use SmarterASP.NET's control panel Node.js installer or package manager tool to run `npm install` on the server. If that is unavailable, zip the `node_modules` folder, upload it, and extract it via the SmarterASP.NET file manager.

### Step 3: Run `npm install` on the Server
1. Go to the SmarterASP.NET Control Panel.
2. Open the **Node.js Package Manager** or **Terminal** console for your site.
3. Run the installation command:
   ```bash
   npm install --production
   ```

### Step 4: Verify Folder Permissions
1. The SQLite database `carbon_decode.db` will be created in the website root directory by default.
2. In the SmarterASP.NET File Manager, verify that the website directory has **Write Permissions** enabled for the IIS user. (If writes fail, you can set write permissions on the directory or create a directory called `App_Data`, enable write permission on it, and set the `DATABASE_PATH` environment variable in `web.config` to point to `C:\...\App_Data\carbon_decode.db`).

---

## 🔍 Local Verification

Before deploying, you can verify your changes run correctly locally:
1. Start the server:
   ```bash
   node server.js
   ```
2. Open your browser and navigate to `http://localhost:3000`.
3. Verify that pages load and database interactions (like pledges or calculations) are correctly recorded in the SQLite database.
