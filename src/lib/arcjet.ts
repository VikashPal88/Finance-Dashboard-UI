import arcjet, { shield, detectBot, tokenBucket, fixedWindow } from "@arcjet/next";

// Base Arcjet client with global protections
const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    // Shield protects against common attacks (SQLi, XSS, etc.)
    shield({ mode: "LIVE" }),
    // Block automated bot traffic, but allow search engine crawlers
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR"],
    }),
  ],
});

// ─── Auth Rate Limiting ──────────────────────────────────────────────────────
// Strict: 5 attempts per 10 minutes per IP for login/signup
export const authRateLimit = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "10m",
    max: 5,
  })
);

// ─── API Rate Limiting ──────────────────────────────────────────────────────
// Moderate: 60 requests per minute per IP for general API usage
export const apiRateLimit = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    refillRate: 10,
    interval: "10s",
    capacity: 60,
  })
);

// ─── Strict API Rate Limiting ────────────────────────────────────────────────
// Tight: 10 requests per minute for sensitive operations
export const strictRateLimit = aj.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
  })
);

export default aj;
