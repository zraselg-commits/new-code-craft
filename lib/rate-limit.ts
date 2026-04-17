/**
 * Simple in-memory rate limiter.
 * Resets on server restart — for production, use Redis.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstAttempt > 30 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number; // seconds
}

/**
 * Check rate limit for a given key (e.g. IP address).
 * @param key      Identifier (IP address, user ID, etc.)
 * @param maxAttempts  Max requests allowed in the window
 * @param windowMs     Window duration in milliseconds
 * @param lockoutMs    Lockout duration after exceeding limit
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
  lockoutMs = 15 * 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Check if currently locked out
  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.lockedUntil - now) / 1000),
    };
  }

  // Reset window if expired
  if (!entry || now - entry.firstAttempt > windowMs) {
    store.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  // Increment count
  const newCount = entry.count + 1;
  if (newCount >= maxAttempts) {
    store.set(key, {
      count: newCount,
      firstAttempt: entry.firstAttempt,
      lockedUntil: now + lockoutMs,
    });
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil(lockoutMs / 1000),
    };
  }

  store.set(key, { ...entry, count: newCount });
  return { allowed: true, remaining: maxAttempts - newCount };
}

/** Reset rate limit for a key (e.g. on successful login) */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
