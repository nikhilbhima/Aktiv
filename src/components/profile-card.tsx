'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { type User } from '@/lib/mock-data';

interface ProfileCardProps {
  user: User;
  showDistance?: boolean;
  distance?: string;
  matchScore?: number;
  onMessageClick?: () => void;
}

export function ProfileCard({
  user,
  showDistance,
  distance,
  matchScore,
  onMessageClick,
}: ProfileCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-orange-500/30 transition-all hover:shadow-lg hover:shadow-orange-500/10 group">
      {/* Header with Avatar and Basic Info */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-16 w-16 ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{user.name}</h3>
            {matchScore && (
              <Badge
                variant="outline"
                className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400"
              >
                {matchScore}% match
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{user.username}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {user.bio}
      </p>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-base">🔥</span>
          <span className="font-semibold text-orange-400">
            {user.streakDays}
          </span>
          <span className="text-muted-foreground">day streak</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-base">✓</span>
          <span className="font-semibold text-green-400">
            {user.goalsCompleted}
          </span>
          <span className="text-muted-foreground">completed</span>
        </div>
      </div>

      {/* Location & Distance */}
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <span>📍</span>
        <span>{user.location}</span>
        {showDistance && distance && (
          <>
            <span>•</span>
            <span className="text-orange-400">{distance}</span>
          </>
        )}
      </div>

      {/* Social Links */}
      {user.socials && (
        <div className="flex items-center gap-3 mb-4">
          {user.socials.instagram && (
            <a
              href={`https://instagram.com/${user.socials.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-orange-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {user.socials.twitter && (
            <a
              href={`https://twitter.com/${user.socials.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-orange-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {user.socials.linkedin && (
            <a
              href={`https://linkedin.com/in/${user.socials.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-orange-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Action Button */}
      {onMessageClick && (
        <button
          onClick={onMessageClick}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all hover:shadow-lg hover:shadow-orange-500/30"
        >
          Send Message
        </button>
      )}
    </div>
  );
}
