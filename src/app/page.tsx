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

          {/* Phase indicator */}
          <div className="mt-12 p-6 rounded-xl gradient-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Phase 2: Dashboard UI
            </p>
            <h2 className="text-lg font-semibold">
              Beautiful Static Interface ✓
            </h2>
            <ul className="mt-4 text-sm text-muted-foreground space-y-2 text-left">
              <li>✓ Accountability/IRL mode toggle</li>
              <li>✓ Filters sidebar with categories</li>
              <li>✓ Profile & goal cards with progress</li>
              <li>✓ Discovery feed with match scores</li>
              <li>✓ Chat interface with message threads</li>
              <li>✓ Smooth animations & micro-interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
