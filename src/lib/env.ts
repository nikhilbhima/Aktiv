/**
 * Environment Variable Validation
 * Ensures all required environment variables are present
 */

export function validateEnv() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  const missing: string[] = []

  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(key => `  - ${key}`).join('\n')}\n\n` +
      'Please create a .env.local file with these variables.\n' +
      'See .env.local.example for reference.'
    )
  }

  return required as Record<string, string>
}

// Validate immediately when this module is imported
export const env = validateEnv()
