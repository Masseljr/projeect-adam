# Deployment Guide - Render

## Push to GitHub

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `diagram-essay-grading-system`
3. Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Step 2: Add Remote and Push

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/diagram-essay-grading-system.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

---

## Deploy to Render

### Step 1: Sign Up for Render

1. Go to [Render](https://render.com)
2. Sign up with GitHub (recommended) or email
3. Free tier is sufficient for this project

### Step 2: Deploy Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Web Service"**
3. Click **"Connect GitHub"** and authorize Render
4. Select your `diagram-essay-grading-system` repository
5. Render will auto-detect configuration from `render.yaml`
6. Click **"Apply"** or **"Create Web Service"**

### Step 3: Wait for Build

- Build process takes 2-5 minutes
- Watch the logs in real-time
- Once complete, you'll get a live URL

---

## Your Live URL

After deployment, your app will be available at:
```
https://diagram-essay-grading-system.onrender.com
```

Or a custom subdomain you choose during setup.

---

## Automatic Deployments

Every time you push to the `main` branch, Render automatically:
1. Pulls latest code
2. Runs `npm install && npm run build`
3. Restarts the service with `npm start`

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Render automatically redeploys! 🚀
```

---

## Important Free Tier Limitations

⚠️ **Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- `/uploads` folder is ephemeral (files reset on restart)

For production with persistent file storage, upgrade to paid tier or use cloud storage (S3, Cloudinary).

---

## Monitoring

### View Logs
1. Go to Render Dashboard
2. Select your web service
3. Click "Logs" tab

### Health Check
Render monitors: `https://your-app.onrender.com/api/health`

---

## Troubleshooting

### Build Fails

Check logs in Render Dashboard. Common fixes:

```bash
# Test locally first
npm install
npm run build
npm start
```

### Service Won't Start

1. Verify `render.yaml` configuration
2. Check that port 3000 is used
3. Ensure all dependencies are in `package.json`

### API Not Working

1. Test health endpoint: `/api/health`
2. Check browser console for CORS errors
3. Verify environment variables are set

---

## Next Steps

✅ Push to GitHub  
✅ Deploy to Render  
✅ Test the live URL  
✅ Share with users  

Your grading system is now live! 🎓
