// Canonical site URL: explicit NEXT_PUBLIC_SITE_URL first, then the production
// domain Vercel provides automatically, then localhost for development.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/$/, "");
