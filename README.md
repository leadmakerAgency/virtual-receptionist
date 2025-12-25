# Virtual Receptionist Platform

A modern web application for managing and deploying AI-powered virtual receptionists using ElevenLabs Conversational AI.

## Features

- **Admin Portal**: Create, update, and delete virtual receptionist accounts
- **Dynamic Routing**: Each receptionist has a unique slug (e.g., `/john`, `/tammy`)
- **Multi-Stage Onboarding**: Smooth user experience with microphone permission and audio configuration
- **Real-Time Conversations**: Powered by ElevenLabs React SDK for seamless voice interactions
- **Modern UI**: Built with Next.js, TailwindCSS, and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI Voice**: ElevenLabs Conversational AI
- **Authentication**: Supabase Auth

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- ElevenLabs account with API key
- Environment variables configured

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bcvcfqyymwypwclsdeog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

The database migration has already been applied. The `virtual_receptionists` table includes:
- Unique slug for each receptionist
- ElevenLabs agent ID and configuration
- System prompt and first message
- Voice settings
- Active status

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage

### Admin Portal

1. Navigate to `/admin/login`
2. Sign in with your Supabase credentials
3. Create a new virtual receptionist:
   - Enter a unique slug (e.g., "john")
   - Configure the agent's prompt and first message
   - Select a voice ID from ElevenLabs
4. The receptionist will be available at `/{slug}`

### Public Receptionist Pages

When a user visits `/{slug}`, they'll go through these stages:

1. **Ready to Begin**: Welcome screen with interview information
2. **Microphone Access**: Automatic permission request
3. **Audio Configuration**: Select microphone and speaker devices
4. **Live Conversation**: Real-time voice interaction with the AI agent

## Project Structure

```
virtual-receptionist/
├── app/
│   ├── [slug]/              # Public receptionist pages
│   ├── admin/               # Admin portal
│   │   ├── receptionists/   # CRUD operations
│   │   └── login/           # Admin authentication
│   └── api/                 # API routes
│       ├── admin/           # Admin endpoints
│       └── receptionists/   # Public endpoints
├── components/
│   ├── admin/               # Admin components
│   ├── receptionist/        # Receptionist stage components
│   └── ui/                  # shadcn/ui components
├── hooks/                   # Custom React hooks
├── lib/
│   ├── elevenlabs/         # ElevenLabs client and types
│   └── supabase/           # Supabase clients
└── types/                  # TypeScript type definitions
```

## API Routes

### Admin Routes (Protected)

- `GET /api/admin/receptionists` - List all receptionists
- `POST /api/admin/receptionists` - Create new receptionist
- `GET /api/admin/receptionists/[id]` - Get receptionist details
- `PATCH /api/admin/receptionists/[id]` - Update receptionist
- `DELETE /api/admin/receptionists/[id]` - Delete receptionist
- `GET /api/admin/agents` - List ElevenLabs agents
- `POST /api/admin/agents` - Create ElevenLabs agent

### Public Routes

- `GET /api/receptionists/[slug]` - Get receptionist by slug

## Database Schema

### virtual_receptionists

- `id` (UUID, Primary Key)
- `slug` (Text, Unique) - URL-friendly identifier
- `name` (Text) - Display name
- `agent_id` (Text) - ElevenLabs agent ID
- `agent_config` (JSONB) - Full agent configuration
- `first_message` (Text) - Initial greeting
- `prompt` (Text) - System prompt
- `voice_id` (Text) - ElevenLabs voice ID
- `is_active` (Boolean) - Active status
- `created_at` (Timestamp)
- `updated_at` (Timestamp)
- `created_by` (UUID) - Reference to auth.users

## Security

- Row Level Security (RLS) enabled on Supabase tables
- Public read access for active receptionists
- Admin-only write access
- API routes protected with authentication
- Service role key used only server-side

## Development

### Adding New Components

Use shadcn/ui CLI to add components:

```bash
npx shadcn@latest add [component-name]
```

### Type Generation

Supabase types are manually maintained in `types/database.ts`. For automatic generation, use:

```bash
npx supabase gen types typescript --project-id bcvcfqyymwypwclsdeog > types/database.ts
```

## Troubleshooting

### Microphone Permission Issues

- Ensure HTTPS in production (required for microphone access)
- Check browser permissions in settings
- Test in Chrome/Edge for best WebRTC support

### ElevenLabs Connection Issues

- Verify API key is correct
- Check agent ID exists in ElevenLabs dashboard
- Ensure WebRTC is supported in the browser

### Database Connection Issues

- Verify Supabase URL and keys
- Check RLS policies are correctly configured
- Ensure service role key is set (for admin operations)

## License

Private project - All rights reserved
