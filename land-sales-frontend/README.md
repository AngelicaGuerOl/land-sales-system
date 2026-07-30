# Land Sales Frontend

React, TypeScript, and Vite frontend for Land Sales System.

The public demo frontend is deployed with Cloudflare Workers Static Assets. The
repository does not include `wrangler.toml`, so provider settings are managed in
Cloudflare.

Important build-time variables:

- `VITE_API_BASE_URL` points the browser to the deployed API, for example
  `https://land-sales-api.onrender.com/api`.
- `VITE_REFERENCE_PLAN_IMAGE_URL` is optional and overrides the reference-plan
  image path. When omitted, the app uses
  `/images/reference-plan/plan-reference-demo.png`.

`VITE_*` variables are embedded into the browser bundle and must never contain
secrets. The demo login uses `POST /api/auth/demo`; the frontend does not store
or expose a demo password.

This module is documented from the repository root to avoid duplicating setup
and deployment instructions.

Useful links:

- [Main README](../README.md)
- [Development Guide](../docs/development-guide.md)
- [Testing Guide](../docs/testing.md)
- [Deployment Guide](../docs/deployment.md)

Common commands from this directory:

```bash
npm ci
npm run dev
npm run lint
npm run test
npm run test:coverage
npm run build
npm run test:e2e
```
