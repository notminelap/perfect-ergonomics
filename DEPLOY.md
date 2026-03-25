# 🚀 Deploying Perfect Ergonomics — 24/7 Guide

## Architecture
One single Render service runs the Express server, which:
- Hosts the Node.js API at `/api/...`
- Serves the built React frontend from `/dist/`

Data is stored in **MongoDB Atlas** (free, persistent forever).

---

## Step 1 — Create a Free MongoDB Atlas Database

1. Go to → **https://cloud.mongodb.com** and sign up (free)
2. Create a **Free Cluster** (M0, any region — Singapore is closest to India)
3. When prompted, add a **database user** (username + password — save these!)
4. Under **Network Access**, click **Add IP Address** → choose **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Connect** → **Drivers** → select **Node.js**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```
7. Change `/?` to `/perfect-ergonomics?` to specify the database name:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/perfect-ergonomics?retryWrites=true&w=majority
   ```
   ✅ Keep this string ready — you'll need it in Step 3.

---

## Step 2 — Migrate Your Existing Data

Run this once on your local machine to import all your current inventory into MongoDB:

```powershell
# In PowerShell, in the perfect-ergonomics folder:
$env:MONGODB_URI = "mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/perfect-ergonomics?retryWrites=true&w=majority"
node migrate.js
```

You should see: `🎉 Migration complete!`

---

## Step 3 — Push Code to GitHub

If you haven't already:

```powershell
cd "C:\Users\Radhesh Ranvijay\.gemini\antigravity\scratch\perfect-ergonomics"

git init
git add .
git commit -m "chore: prepare for Render deployment"
```

Then create a new repo on **https://github.com/new** and push:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/perfect-ergonomics.git
git branch -M main
git push -u origin main
```

---

## Step 4 — Deploy to Render

1. Go to → **https://render.com** and sign up (free)
2. Click **New** → **Web Service**
3. Connect your GitHub account and select the `perfect-ergonomics` repo
4. Render will auto-detect `render.yaml` — click **Apply**
5. Before deploying, go to **Environment** and add:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | *(paste your Atlas connection string)* |
6. Click **Deploy** — Render will run `npm install && npm run build`, then start the server

Your app will be live at:
```
https://perfect-ergonomics.onrender.com
```

---

## Step 5 — Access from Any Device

Open `https://perfect-ergonomics.onrender.com` on **any phone, tablet, or computer** — bookmarks it for quick access.

> **Note on Free Tier:** Render's free tier spins the service down after 15 minutes of inactivity. It wakes back up in ~30 seconds when you next visit. For always-on operation, upgrade to Render's **Starter** plan ($7/month).

---

## Local Development (unchanged)

```powershell
npm run dev
```
This still works exactly as before — it runs both the Vite dev server and the Node.js server concurrently using your local MongoDB (or set MONGODB_URI in a `.env` file).

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ Yes | MongoDB Atlas connection string |
| `PORT` | No | Server port (Render sets this automatically) |
