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

          {/* Phase indicator */}
          <div className="mt-12 p-6 rounded-xl gradient-card border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Phase 1 Complete
            </p>
            <h2 className="text-lg font-semibold">
              Foundation & Setup ✓
            </h2>
            <ul className="mt-4 text-sm text-muted-foreground space-y-2 text-left">
              <li>✓ Next.js 15 + TypeScript + Tailwind CSS</li>
              <li>✓ shadcn/ui components</li>
              <li>✓ PWA configuration</li>
              <li>✓ Claude-style warm gradients</li>
              <li>✓ Anthropic-inspired fonts (Geist)</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Ready for Phase 2: Dashboard UI
          </p>
        </div>
      </div>
    </div>
  );
}
