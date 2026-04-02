# Deployment Guide

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

### Step 3: Verify

Visit `https://github.com/YOUR_USERNAME/diagram-essay-grading-system` to confirm your code is there.

---

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel
```

Follow the prompts:
- Link to existing project? → No
- Set project name → `diagram-essay-grading-system`
- Set project root → `./`
- Override settings → No

### Option 2: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Import"
6. Configure project settings:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
7. Click "Deploy"

### Option 3: Deploy via GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Connect your GitHub account
4. Select the `diagram-essay-grading-system` repository
5. Vercel will auto-detect settings
6. Click "Deploy"

---

## Post-Deployment Configuration

### Update API URL in Frontend

After deployment, update the API URL in `public/app.js`:

```javascript
// Change this line:
const API_URL = 'http://localhost:3000/api';

// To your Vercel domain:
const API_URL = 'https://your-project-name.vercel.app/api';
```

Then push the changes:

```bash
git add public/app.js
git commit -m "Update API URL for production"
git push
```

Vercel will automatically redeploy.

---

## Environment Variables (if needed)

Create a `.env.production` file for production-specific variables:

```
NODE_ENV=production
```

Add to Vercel dashboard:
1. Go to Project Settings
2. Click "Environment Variables"
3. Add your variables
4. Redeploy

---

## Monitoring & Logs

### View Deployment Logs

```bash
# Using Vercel CLI
vercel logs
```

Or visit your Vercel dashboard to view logs in real-time.

### Monitor Performance

- Vercel Dashboard shows analytics
- Check build times and function execution
- Monitor bandwidth usage

---

## Troubleshooting

### Build Fails

1. Check build logs in Vercel dashboard
2. Ensure `npm run build` works locally
3. Verify all dependencies are in `package.json`

### API Not Working

1. Check that API URL is correct in frontend
2. Verify environment variables are set
3. Check Vercel function logs

### File Upload Issues

1. Ensure `/uploads` directory exists
2. Check file size limits (10MB default)
3. Verify CORS is enabled

---

## Continuous Deployment

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to `main` branch
- Create preview deployments for pull requests
- Show deployment status in GitHub

---

## Custom Domain (Optional)

1. Go to Vercel Project Settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Rollback

If something goes wrong:

```bash
# View deployment history
vercel list

# Rollback to previous deployment
vercel rollback
```

Or use Vercel dashboard to select a previous deployment.

---

## Next Steps

1. ✅ Push to GitHub
2. ✅ Deploy to Vercel
3. ✅ Update API URL
4. ✅ Test in production
5. ✅ Share with users

Your application is now live! 🚀
