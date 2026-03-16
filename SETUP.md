# Quick Setup Guide

## 1. Environment Variables

Create `.env.local` in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bcvcfqyymwypwclsdeog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdmNmcXl5bXd5cHdjbHNkZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NzgwMjYsImV4cCI6MjA4MjE1NDAyNn0.bs12rMG_YZ4u_wrKCpqoCbsYr6uhIv4QGHhfVtbtQOE
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Get your Supabase service role key from the Supabase dashboard (Settings > API > service_role key).

## 2. Database

The database migration has already been applied. The `virtual_receptionists` table is ready to use.

## 3. Admin User

Create an admin user in Supabase:
1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" or "Invite user"
3. Create a user with email and password
4. Use these credentials to log in at `/admin/login`

## 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000`

## 5. Create Your First Receptionist

1. Go to `/admin/login` and sign in
2. Click "Create New"
3. Fill in the form:
   - **Slug**: e.g., "john" (will be accessible at `/john`)
   - **Name**: Display name
   - **Prompt**: System prompt for the AI agent
   - **First Message**: Initial greeting
   - **Voice ID**: ElevenLabs voice ID (default: `21m00Tcm4TlvDq8ikWAM`)
4. Click "Create"
5. Visit `/{slug}` to test the receptionist

## Notes

- The application creates an ElevenLabs agent automatically when you create a receptionist
- Make sure your ElevenLabs API key has sufficient credits
- For production, ensure HTTPS is enabled (required for microphone access)
- Test in Chrome/Edge for best WebRTC support
