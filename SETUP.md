# Quick Setup Guide

## 1. Environment Variables

Create `.env.local` in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
# Dev: http://localhost:3000
# Prod (your deployment): https://coach.leadmaker.agency
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: require both profiles.role = admin AND an email in this list (comma-separated).
# If omitted or empty, only profiles.role = admin is required.
# ADMIN_EMAILS=admin@yourcompany.com
```

**Important**: Get your Supabase keys from the Supabase dashboard (Settings > API).

## 2. Database

Migrations for this project are applied on Supabase. Tables include `virtual_receptionists`, `profiles`, `scenarios`, and related coaching data.

## 3. Admin user

1. Go to Supabase Dashboard > Authentication > Users and create a user (email + password), or use sign-up from `/login` if enabled.
2. In **Table Editor** > `profiles`, set `role` to `admin` for that user’s row (`id` must match `auth.users.id`).
3. If you use `ADMIN_EMAILS` in `.env.local`, add the same email there.
4. Sign in at `/login`. You will be redirected to `/admin` when `isAdmin` is true.

Regular users keep `role` = `user` (default) and are sent to `/practice`.

## 4. Run the application

```bash
npm run dev
```

Visit `http://localhost:3000` (redirects to `/login`).

## 5. Create agents (admin)

1. Open `/admin` (or `/admin/agents`).
2. Click **Create agent** and fill in slug, display name, prompt, first line, voice ID, optional description, sort order, and active flag.
3. Saving creates the agent in ElevenLabs (Conversational AI) and stores metadata in `virtual_receptionists`.
4. Active agents appear in the **AI agent** dropdown on `/practice` for learners.

## Notes

- The ElevenLabs API key is only used on the server (admin API routes and server code); it must never be exposed to the browser.
- Ensure your ElevenLabs account has sufficient quota for conversational agents.
- For production, use HTTPS (required for microphone access in the practice flow).
- Chrome or Edge are recommended for WebRTC.
