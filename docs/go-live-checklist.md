# YalinNews Go-Live Checklist

## Security
- Verify HTTPS-only deployment and HSTS on edge.
- Validate CORS allowlist for production domains only.
- Enable rate limiting and bot challenge on API gateway.
- Store JWT in secure HttpOnly cookie (production target).

## Observability
- Connect frontend error tracking (Sentry or equivalent).
- Enable backend structured logging and alert rules.
- Add uptime monitors for `/`, `/api/health`, and critical APIs.

## Performance
- Compress and cache media assets (WebP/AVIF variants).
- Configure CDN caching headers and cache busting.
- Track Core Web Vitals (LCP, CLS, INP) in production.

## Reliability
- Create rollback plan for frontend and backend releases.
- Validate database backup and restore flow.
- Run smoke tests: home, search, category filter, detail, admin.

## Content Operations
- Confirm editor/admin credentials and role permissions.
- Define breaking-news SOP (who publishes and who approves).
- Prepare fallback headline list for outages.
