# 🚀 Vercel Deployment Guide for MediTatva

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository pushed to remote
- Gemini API key (get from https://makersuite.google.com/app/apikey)

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import your `meditatva-connect-ai` repository
   - Select the repository from your GitHub account

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (keep as root)
   - **Build Command**: `cd meditatva-frontend && npm run build`
   - **Output Directory**: `meditatva-frontend/dist`
   - **Install Command**: `cd meditatva-frontend && npm install`

3. **Set Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key
   VITE_API_URL=https://your-backend-url.com/api  (optional)
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /workspaces/meditatva-connect-ai
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? → Yes
   - Which scope? → Your account
   - Link to existing project? → No
   - Project name → meditatva-connect-ai
   - Directory → `./`
   - Override settings? → Yes
     - Build Command: `cd meditatva-frontend && npm run build`
     - Output Directory: `meditatva-frontend/dist`
     - Development Command: `cd meditatva-frontend && npm run dev`

5. **Set environment variables**
   ```bash
   vercel env add VITE_GEMINI_API_KEY
   # Enter your Gemini API key when prompted
   
   vercel env add VITE_API_URL
   # Enter your backend URL (or leave empty for default)
   ```

6. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Environment Variables Required

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_GEMINI_API_KEY` | Google Gemini AI API key for chatbot | Yes | `AIzaSyD...` |
| `VITE_API_URL` | Backend API endpoint | No | `http://localhost:3000/api` |

## Post-Deployment

### Update Environment Variables
```bash
vercel env add VITE_GEMINI_API_KEY production
vercel env add VITE_API_URL production
```

### Redeploy
Every push to `main` branch will trigger automatic deployment.

Or manually:
```bash
vercel --prod
```

### Check Deployment Status
- Visit your Vercel dashboard: https://vercel.com/dashboard
- View deployment logs and analytics
- Check build logs if deployment fails

## Common Issues & Solutions

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set correctly

### 404 on Routes
- Already configured in `vercel.json` with rewrites
- All routes will redirect to `index.html` for SPA routing

### Environment Variables Not Working
- Must prefix with `VITE_` for Vite to expose them
- Redeploy after adding/updating env vars
- Clear cache and rebuild

### API Calls Failing
- Update `VITE_API_URL` to point to your deployed backend
- Check CORS settings on backend
- Verify backend is deployed and accessible

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate to provision

## Performance Optimization

The `vercel.json` already includes:
- ✅ SPA routing with rewrites
- ✅ Asset caching (1 year for static assets)
- ✅ Automatic compression
- ✅ Edge network CDN

## Monitoring

- **Analytics**: Enable Vercel Analytics in project settings
- **Logs**: View real-time function logs in dashboard
- **Speed Insights**: Track Core Web Vitals

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html#vercel
- Need help? Check deployment logs first

---

**Note**: This deployment configuration assumes frontend-only deployment. If you need to deploy the backend (`meditatva-backend`), consider using a separate service like Railway, Render, or Vercel Serverless Functions.
