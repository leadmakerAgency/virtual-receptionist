# Digital Ocean Deployment Guide

## Issue: Default Next.js Page Showing

If you're seeing the default Next.js welcome page instead of your custom application, follow these steps:

## Step 1: Verify Your Repository Connection

1. Go to Digital Ocean App Platform → Your App → Settings → App-Level Settings
2. Verify that:
   - **Source**: Points to the correct GitHub/GitLab repository
   - **Branch**: Points to the branch with your code (usually `main` or `master`)
   - **Root Directory**: Should be empty (or `.` if your app is in the root)

## Step 2: Check Build Settings

In Digital Ocean App Platform → Your App → Settings → App-Level Settings:

1. **Build Command**: Should be `npm run build`
2. **Run Command**: Should be `npm start`
3. **Environment**: Should be `Node.js`

## Step 3: Verify All Files Are Committed

Make sure all your custom files are committed to your repository:

```bash
git add .
git commit -m "Deploy virtual receptionist app"
git push origin main
```

## Step 4: Check Build Logs

1. Go to Digital Ocean App Platform → Your App → Runtime Logs
2. Look for any build errors
3. Check if the build completed successfully

## Step 5: Force a New Deployment

1. Go to Digital Ocean App Platform → Your App
2. Click "Actions" → "Force Rebuild"
3. Wait for the deployment to complete

## Step 6: Verify Environment Variables

Make sure all required environment variables are set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ELEVENLABS_API_KEY`

## Common Issues

### Issue: Build succeeds but shows default page
**Solution**: The repository might not be connected correctly, or the wrong branch is selected.

### Issue: Build fails
**Solution**: Check the build logs for specific errors. Common issues:
- Missing dependencies (check `package.json`)
- TypeScript errors
- Missing environment variables

### Issue: App runs but shows 404
**Solution**: Verify the `run_command` is set to `npm start` and the port is `3000`.

## Manual Verification

To verify your code is correct locally:

```bash
npm install
npm run build
npm start
```

Then visit `http://localhost:3000` - you should see your custom homepage, not the default Next.js page.

If it works locally but not on Digital Ocean, the issue is with the deployment configuration, not your code.
