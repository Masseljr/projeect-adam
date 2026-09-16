# Render Deployment Guide

## Quick Deployment to Render

### Prerequisites
- GitHub account
- Render account (free): https://render.com

### Step 1: Push to GitHub

```bash
# If you haven't already, add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/diagram-essay-grading-system.git

# Push your code
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

#### Option A: Automatic Deployment (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select `diagram-essay-grading-system`
5. Render will auto-detect the `render.yaml` file
6. Click "Apply"
7. Wait for deployment (2-5 minutes)

#### Option B: Manual Configuration

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `diagram-essay-grading-system`
   - **Region**: Frankfurt (or closest to you)
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
6. Click "Create Web Service"

### Step 3: Access Your App

Once deployed, Render will give you a URL like:
```
https://diagram-essay-grading-system.onrender.com
```

Your app is now live! 🚀

## Important Notes

### Free Tier Limitations

⚠️ **Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds to wake up
- 750 hours/month (enough for one service running 24/7)

### Uploads Directory

The `/uploads` directory is ephemeral on Render's free tier. Files uploaded will be lost when the service restarts. For production, consider:
- Cloudinary (image hosting)
- AWS S3 (file storage)
- Render Disks (paid feature)

### Database (Optional)

For persistent storage of models and results, add a database:

1. In Render Dashboard, create a new PostgreSQL database (free tier available)
2. Add the database URL to your web service environment variables
3. Update your code to use the database instead of in-memory storage

## Troubleshooting

### Build Fails

Check Render logs:
1. Go to your web service in Render Dashboard
2. Click "Logs" tab
3. Look for errors in the build process

Common fixes:
```bash
# Ensure package.json has all dependencies
npm install

# Test build locally
npm run build

# Test start locally
npm start
```

### Service Won't Start

1. Check the logs in Render Dashboard
2. Verify `PORT` environment variable is set
3. Ensure `npm start` works locally

### API Not Responding

1. Check health endpoint: `https://your-app.onrender.com/api/health`
2. Verify CORS is enabled in `src/server.ts`
3. Check browser console for CORS errors

## Monitoring

### View Logs

```bash
# In Render Dashboard → Your Service → Logs
```

### Health Check

Render automatically monitors: `https://your-app.onrender.com/api/health`

If health check fails 3 times, Render will restart the service.

## Custom Domain (Optional)

1. Go to your web service settings
2. Click "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Automatic Deployments

Render automatically deploys when you push to your `main` branch on GitHub.

```bash
# Make changes
git add .
git commit -m "Your changes"
git push

# Render will automatically rebuild and redeploy!
```

## Environment Variables

To add environment variables:
1. Go to web service settings
2. Click "Environment"
3. Add key-value pairs
4. Save (triggers automatic redeploy)

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Your repository issues page

---

Your diagram-essay grading system is now deployed on Render! 🎓
