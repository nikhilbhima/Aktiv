# Aktiv - Find Your Accountability Partner & IRL Workout Buddies

A social accountability platform connecting people with similar goals for virtual accountability partnerships and in-person meetups in Bangalore.

## About Aktiv

Aktiv helps you stay consistent with your goals by connecting you with like-minded people. Whether you need someone to keep you accountable online or want to find workout buddies nearby, Aktiv has you covered.

### Two Modes:

- **Accountability Mode**: Find virtual accountability partners who share your goals (fitness, learning, reading, etc.)
- **IRL Mode**: Discover people nearby in Bangalore for in-person activities and meetups

## Tech Stack

**Frontend:**
- Next.js 15.5.6 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui components

**Backend:**
- Supabase Auth
- Supabase Database (PostgreSQL 15+)
- Supabase Realtime
- PostGIS (location-based matching)
- Row Level Security (RLS)

## Current Status

Phase 4/10 Complete - 40% Done

### Completed:
- Dashboard UI with Accountability/IRL mode toggle
- User profile cards with match scoring
- Filters sidebar (categories, distance)
- Goals management UI
- Chat interface with real-time messaging
- Supabase backend fully configured
- Performance optimized (13x faster match loading)

### Coming Next:
- Authentication & onboarding flow
- Landing page
- Safety & trust features
- IRL activity creation
- Production deployment

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nikhilbhima/Aktiv.git
cd aktiv-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
aktiv-app/
├── src/
│   ├── app/                    # Next.js app router
│   ├── components/             # React components
│   ├── contexts/               # React context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript types
├── supabase/
│   └── migrations/             # Database migrations
├── public/                     # Static assets
└── docs/                       # Documentation
```

## Documentation

Detailed documentation available in `/docs`:
- [Comprehensive Status Report](docs/COMPREHENSIVE_STATUS_REPORT.md)
- [Phase 3 Complete](docs/PHASE3_COMPLETE.md) - Supabase backend setup
- [Phase 4 Complete](docs/PHASE4_COMPLETE.md) - Dashboard functionality
- [Bug Fix Summary](docs/FINAL_BUG_FIX_SUMMARY.md)

## Contributing

This project is currently in active development. Contribution guidelines will be added soon.

## License

MIT License

---

Built with care in Bangalore
