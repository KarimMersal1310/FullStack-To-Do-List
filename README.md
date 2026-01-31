# Todo Management Website

A modern Todo Management application built with React and Vite.

## Environment Variables

### For Production (Vercel)

When deploying to Vercel, you need to set the following environment variable:

- **VITE_API_BASE_URL**: Set this to your production API URL
  - Example: `http://karimtodolistapi.runasp.net`

### How to set in Vercel:

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project: `full-stack-to-do-list-beige`
3. Navigate to **Settings** → **Environment Variables**
4. Click **Add New** and add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `http://karimtodolistapi.runasp.net`
   - **Environment**: Select **Production** (and **Preview** if you want it for preview deployments too)
5. Click **Save**
6. **IMPORTANT**: Go to **Deployments** tab and click **Redeploy** on your latest deployment (or trigger a new deployment)
   - ⚠️ **You MUST redeploy after adding environment variables** - Vite reads env vars at build time, so existing deployments won't have the new variable

### Verify it's working:

After redeploying, open your browser console. You should see:
- ✅ `API Base URL configured: http://karimtodolistapi.runasp.net`

If you see a warning instead, the environment variable is not set correctly.

### For Local Development

The application uses Vite's proxy configuration for local development. No environment variable is needed for local development - it will automatically proxy API requests to `https://localhost:7226`.

If you want to use a different API URL locally, create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://your-api-url.com
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

