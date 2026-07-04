# Nebula AI - Production Deployment Checklist

Before deploying Nebula v1.0 RC1 to a production environment, ensure all items in this checklist have been verified and configured correctly.

## 1. Environment Variables
- [ ] `NODE_ENV` is set to `production`.
- [ ] Ensure `FRONTEND_URL` matches the production domain to prevent CORS issues.
- [ ] Verify `JWT_SECRET` and `SESSION_SECRET` are cryptographically secure and rotated.
- [ ] Verify all environment variables are securely injected into the CI/CD pipeline and not hardcoded.

## 2. HTTPS & Domain Setup
- [ ] Ensure TLS/SSL certificates are provisioned for both the frontend domain and the API backend.
- [ ] Enforce HTTPS redirects (e.g., using NGINX, AWS ALB, or Cloudflare).
- [ ] Configure HSTS headers for the frontend.

## 3. API Keys & External Services
- [ ] Ensure production API keys for AI Providers (Google Gemini, Anthropic Opus, OpenAI) are actively provisioned and have strict budget limits/alerts configured.
- [ ] Validate API keys have restricted scopes if applicable.

## 4. Database (PostgreSQL / Prisma)
- [ ] Apply all pending Prisma migrations (`npx prisma migrate deploy`).
- [ ] Confirm database connection uses SSL (`?sslmode=require` in connection string).
- [ ] Verify indexing is optimal for frequent queries (e.g., user sessions, workspace file structures).
- [ ] Ensure database user has restricted permissions (least privilege principle).

## 5. Vector Database (Qdrant)
- [ ] Transition Qdrant from Local In-Memory to Persistent Storage or Managed Cloud Instance.
- [ ] Configure authentication (API key) for Qdrant connection in the backend.
- [ ] Ensure Qdrant snapshots are enabled.

## 6. Health Checks & Monitoring
- [ ] Endpoint `/health` is exposed and actively monitored by the load balancer.
- [ ] Set up application performance monitoring (e.g., Sentry, Datadog) for Node.js and React.
- [ ] Ensure Winston/Pino logger is writing to persistent log storage with `info` or `error` level only (avoid `debug` in prod).

## 7. Backup Strategy
- [ ] Automate daily PostgreSQL backups with a retention policy of at least 30 days.
- [ ] Automate daily snapshots of the Qdrant Vector database collections.
- [ ] Test the disaster recovery pipeline by restoring from the latest backup in a staging environment.
