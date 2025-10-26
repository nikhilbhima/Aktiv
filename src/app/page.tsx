import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 gradient-warm-aura" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-2xl">
          {/* Logo/Brand */}
          <h1 className="text-6xl font-bold tracking-tight gradient-text">
            Aktiv
          </h1>

          {/* Tagline */}
          <p className="text-xl text-muted-foreground">
            Find real people to stay accountable with your goals
          </p>

          {/* CTA Button */}
          <div className="mt-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all hover:shadow-2xl hover:shadow-orange-500/30 hover:scale-105"
            >
              Explore Dashboard
              <span className="text-xl">→</span>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="mt-12 flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
