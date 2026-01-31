# Todo Management Website

A modern Todo Management application built with React and Vite.

## Environment Variables

### For Production (Vercel)

When deploying to Vercel, you need to set the following environment variable:

- **VITE_API_BASE_URL**: Set this to your production API URL
  - Example: `http://karimtodolistapi.runasp.net`

### How to set in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `http://karimtodolistapi.runasp.net`
   - **Environment**: Production (and Preview if needed)
4. Redeploy your application

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

