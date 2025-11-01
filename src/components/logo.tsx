export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="iconGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f0f0f0" />
        </linearGradient>
      </defs>

      {/* Square with rounded corners */}
      <rect
        x="10"
        y="10"
        width="80"
        height="80"
        rx="18"
        ry="18"
        fill="url(#logoGradient)"
      />

      {/* Modern geometric icon - upward arrow/chevron representing growth and accountability */}
      {/* Outer bold chevron - centered */}
      <path
        d="M 50 35 L 68 53 L 62 59 L 50 47 L 38 59 L 32 53 Z"
        fill="url(#iconGradient)"
      />

      {/* Inner parallel chevron for depth - centered */}
      <path
        d="M 50 49 L 64 63 L 59 68 L 50 59 L 41 68 L 36 63 Z"
        fill="url(#iconGradient)"
        opacity="0.7"
      />
    </svg>
  );
}
