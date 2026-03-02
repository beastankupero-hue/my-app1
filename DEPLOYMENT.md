# AmbitionOS - Deployment Guide

## Project Overview

AmbitionOS is a premium productivity SaaS platform built for ambitious students and creators.

**Tech Stack:**
- React 18 + TypeScript
- Vite
- TailwindCSS
- Supabase (Database + Auth)
- Lucide React (Icons)

## Features

**Core Pages:**
- Dashboard - Overview with Top 3 Priorities, XP progress, focus hours
- Tasks - Task management with filters, priorities, completion animations
- Focus Mode - Pomodoro-style timer with session tracking
- Analytics - Productivity charts and statistics
- Settings - Profile and preferences management

**Key Features:**
- Authentication with email/password
- Dark/light mode toggle
- Keyboard shortcuts (Press 'T' for quick task add)
- Collapsible sidebar
- Responsive design
- Glassmorphism UI elements
- Smooth animations and transitions
- XP and streak gamification

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

The `.env` file is already configured with Supabase credentials.

### 3. Run Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Deployment to Vercel

### Method 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Method 2: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Vite settings
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### Environment Variables

When deploying, ensure these environment variables are set:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Keyboard Shortcuts

- `T` - Open Quick Add Task modal
- `ESC` - Close Quick Add modal

## Database Schema

The app uses Supabase with the following tables:
- `user_profiles` - User XP, streak, settings
- `tasks` - User tasks with priorities and due dates
- `focus_sessions` - Focus mode session tracking

All tables have Row Level Security enabled.

## Future Extensions

The codebase is ready to be extended with:
- Email notifications
- Team collaboration
- Advanced analytics
- Mobile app (React Native)
- API integrations

## Design System

**Colors:**
- Primary: Blue to Cyan gradient
- Spacing: 8px system
- Border radius: lg/xl (8px/12px)
- Shadows: Soft, color-matched
- Typography: System fonts with proper hierarchy

**Animations:**
- Transitions: 200ms
- Hover states with scale transforms
- Fade-in and slide-up animations
- Smooth page transitions

## Production Checklist

- [x] TypeScript compilation
- [x] Production build successful
- [x] Dark mode working
- [x] Responsive design
- [x] Authentication flow
- [x] Database RLS policies
- [x] Error handling
- [x] Loading states
- [x] Keyboard shortcuts
- [x] Accessibility (WCAG contrast)

## Support

For issues or questions, refer to:
- React: https://react.dev
- Vite: https://vitejs.dev
- Supabase: https://supabase.com/docs
- TailwindCSS: https://tailwindcss.com

---

Built with focus and ambition.
