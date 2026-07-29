# Testing Guide

[Back to the main README](../README.md)

## Overview

Land Sales System uses automated testing to reduce regressions, validate
business behavior, verify integrations, and exercise critical browser workflows
in a reproducible way.

The test strategy covers backend services, frontend validation and UI behavior,
API integration through mocks, production builds, Docker image construction, and
end-to-end execution against PostgreSQL, Spring Boot, and React.

No test suite guarantees the complete absence of defects. The goal is to protect
important behavior with meaningful assertions and reproducible checks.

## Testing Strategy

The project keeps many fast tests near the code they exercise and only a small
number of E2E tests for critical full-system workflows.

```text
Static checks
-> Backend tests
-> Frontend schema/component/integration tests
-> Coverage
-> Production build
-> Docker build
-> Playwright E2E
```

Test levels:

- Backend tests validate service behavior, persistence-related assumptions, and
  Spring integration where needed.
- Frontend schema tests validate Zod rules.
- Frontend component tests verify observable UI behavior.
- Frontend page/integration tests keep React Query, use cases, repositories, the
  HTTP client, and MSW in the flow.
- End-to-end tests run a browser against the real frontend, backend, and
  PostgreSQL services.

## Testing Tools

| Tool | Purpose |
| --- | --- |
| JUnit | Backend test framework |
| Mockito | Backend mocks and isolated behavior |
| Spring Test | Spring integration testing |
| Testcontainers | Real disposable infrastructure for backend tests |
| Vitest | Frontend test runner |
| React Testing Library | Component and page behavior |
| user-event | User interaction simulation |
| jsdom | Browser-like test environment |
| MSW | HTTP API simulation |
| V8 Coverage | Frontend coverage measurement |
| Playwright | Real-browser E2E testing |
| ESLint | Static code validation |
| GitHub Actions | Continuous integration |

## Backend Testing

Backend tests live under:

```text
land-sales-backend/src/test/
```

Run backend verification from `land-sales-backend/`:

```bash
./mvnw -B clean verify
```

This command compiles the backend, runs tests, verifies the Maven lifecycle, and
uses the Maven Wrapper so a global Maven installation is not required.

The backend test stack includes JUnit, Mockito, Spring Test, and Testcontainers.
Testcontainers can start PostgreSQL for integration scenarios. GitHub Actions
configures Java 17 with the Temurin distribution before running Maven.

Do not run backend tests against a database that contains real business data.

## Frontend Test Organization

Frontend tests use `*.test.ts` and `*.test.tsx` files under:

```text
land-sales-frontend/src/
```

Shared test infrastructure lives in:

```text
land-sales-frontend/src/test/
├── setup.ts
├── server.ts
├── handlers.ts
└── render.tsx
```

Responsibilities:

- `setup.ts` configures jest-dom, MSW lifecycle, React cleanup, storage cleanup,
  and mock restoration.
- `server.ts` creates the MSW Node server.
- `handlers.ts` contains reusable fixtures and HTTP handlers.
- `render.tsx` provides `renderWithProviders` with Material UI, MemoryRouter,
  and an isolated TanStack Query `QueryClient`.

Frontend integration flow:

```text
Page / Component
-> Hook
-> Use Case
-> Repository
-> HTTP Client
-> MSW handler
```

MSW simulates the API boundary while preserving most of the real frontend
architecture.

## Covered Frontend Areas

Current frontend tests cover:

- Authentication: login behavior, validation, pending state, and errors.
- Protected and public routes: redirect behavior with and without a token.
- HTTP client: authorization header, `skipAuth`, API errors, and `401` handling.
- Customers: validation, create/edit forms, listing, search, status changes,
  loading, empty, error, success, and query invalidation.
- Lots: validation, create/edit flows, filters, details, status changes, price
  changes, restrictions, loading, empty, error, and success states.
- Sales: schemas, list/detail views, new sale flow, validation, lookup data, and
  API error handling.
- Payments: payment history, detail, receipt, payment registration, validation,
  success, and error states.
- Account statements: customer statement list, detail, payment registration, and
  account summary behavior.
- Reports: loading, error, success, empty states, filters, and report values.
- Validation schemas: auth, customers, lots, sales, and payments.

The current suite does not provide comprehensive automated coverage for
Dashboard, Blocks, or Reference Plan.

## Running Frontend Verification

Run from `land-sales-frontend/`:

```bash
npm ci
npm run lint
npm run test
npm run test:watch
npm run test:coverage
npm run build
```

| Script | Purpose |
| --- | --- |
| `npm run lint` | Runs ESLint over the frontend source. |
| `npm run test` | Runs Vitest once. |
| `npm run test:watch` | Runs Vitest in watch mode for local development. |
| `npm run test:coverage` | Runs Vitest with V8 coverage. |
| `npm run build` | Runs TypeScript build and Vite production bundling. |
| `npm run test:e2e` | Runs Playwright E2E tests. |
| `npm run test:e2e:ui` | Opens Playwright UI mode when the environment supports it. |

## Understanding Coverage

Coverage reports measure which code was executed by the test suite:

- Statements: executed statements.
- Branches: executed conditional paths.
- Functions: executed functions.
- Lines: executed source lines.

Current verified frontend coverage:

| Metric | Result |
| --- | ---: |
| Statements | 88.12% |
| Branches | 81.38% |
| Functions | 84.00% |
| Lines | 89.69% |

Coverage does not prove that the application is free of defects. The project
does not currently enforce coverage thresholds. The goal is meaningful behavior
coverage, not an artificial percentage or 100% coverage for its own sake.

## End-to-End Architecture

Frontend integration tests stop at MSW:

```text
React
-> HTTP client
-> MSW
```

E2E tests exercise the full local system:

```text
Playwright / Chromium
-> React frontend
-> Vite /api proxy
-> Spring Boot backend
-> PostgreSQL
```

## E2E Environment

The E2E stack is defined in:

```text
docker-compose.e2e.yml
```

It uses:

- Project name `land-sales-e2e`.
- PostgreSQL 16 Alpine with a disposable E2E database.
- Backend built from `land-sales-backend/Dockerfile`.
- Frontend built from `land-sales-frontend/Dockerfile.dev`.
- Health checks for PostgreSQL, backend Actuator, and frontend Vite.
- Spring profile `prod` for the backend container.
- Flyway at backend startup.
- Vite `/api` proxy to `http://backend:8080`.
- An isolated Docker network.

Default local addresses:

| Service | Address |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| Backend health | `http://localhost:8080/actuator/health` |

Relevant E2E variables:

- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_FULL_NAME`
- `JWT_SECRET`
- `PLAYWRIGHT_BASE_URL`
- `E2E_ADMIN_USERNAME`
- `E2E_ADMIN_PASSWORD`

The E2E credentials and JWT values are fictitious and are not suitable for
production.

## Covered E2E Flows

### Authentication flow

The browser test:

1. Opens the login page.
2. Authenticates with the E2E administrator.
3. Reaches the dashboard.
4. Navigates to Reports.
5. Logs out.
6. Returns to login.

### Customer creation flow

The browser test:

1. Authenticates with the E2E administrator.
2. Opens Customers.
3. Creates a unique fictitious customer.
4. Searches for that customer.
5. Verifies that the customer appears in the list.

There is no E2E flow for sales or payments yet.

## Running E2E Locally

From the repository root:

```bash
docker compose -f docker-compose.e2e.yml down --volumes --remove-orphans
docker compose -f docker-compose.e2e.yml config
docker compose -f docker-compose.e2e.yml up --build --wait -d
docker compose -f docker-compose.e2e.yml ps
```

From `land-sales-frontend/`:

```bash
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

Optional UI mode:

```bash
npm run test:e2e:ui
```

The UI mode may not work in headless or non-graphical environments.

To open an existing Playwright HTML report:

```bash
npx playwright show-report
```

After E2E verification, stop the environment from the repository root:

```bash
docker compose -f docker-compose.e2e.yml down --volumes --remove-orphans
```

## Continuous Integration

The workflow is defined in:

```text
.github/workflows/ci.yml
```

Triggers:

- Pull requests targeting `main`.
- Pushes to `main`.
- Manual workflow dispatch.

### Backend verification

- Runs on Ubuntu.
- Sets up Java 17 Temurin.
- Uses Maven cache with `land-sales-backend/pom.xml`.
- Runs `./mvnw -B clean verify`.

### Frontend verification

- Runs on Ubuntu.
- Sets up Node.js 22.
- Uses npm cache with `land-sales-frontend/package-lock.json`.
- Runs `npm ci`.
- Runs `npm run lint`.
- Runs `npm run test`.
- Runs `npm run build`.

The workflow does not currently run `npm run test:coverage`; coverage remains
available through the local script.

### Backend Docker build

- Uses Docker Buildx.
- Builds from `./land-sales-backend`.
- Uses `./land-sales-backend/Dockerfile`.
- Tags the image as `land-sales-backend:ci`.
- Does not publish the image.
- Does not deploy the application.

### E2E verification

- Installs frontend dependencies.
- Installs Playwright Chromium and Linux dependencies.
- Validates `docker-compose.e2e.yml`.
- Starts the E2E environment with health checks.
- Runs `npm run test:e2e`.
- Collects Docker logs when E2E fails.
- Uploads Playwright report, Playwright test results, and Docker logs when E2E
  fails.
- Always stops the E2E environment.

GitHub Actions is used for CI only. It does not deploy to Render, Cloudflare, or
any cloud platform.

## Failure Artifacts

When E2E fails, the workflow can upload these artifacts when the files are
available:

- `playwright-report/`
- `test-results/`
- Screenshots.
- Traces.
- `e2e-docker-logs.txt`.

These artifacts are for debugging failed browser runs and Docker service
startup/runtime issues.

## Test Data and Security

- E2E data is fictitious.
- The E2E database is separate from the local development database.
- Do not use real customer, sale, or payment data in tests.
- Do not commit `.env`, production JWT secrets, or real passwords.
- E2E credentials are intentionally test-only values.

## Current Results

| Verification | Current result |
| --- | --- |
| Frontend test files | 23 |
| Frontend tests | 148 passed |
| Statement coverage | 88.12% |
| Branch coverage | 81.38% |
| Function coverage | 84.00% |
| Line coverage | 89.69% |
| Playwright flows | 2 passed |
| ESLint | Passed |
| Production build | Passed |
| E2E Compose validation | Passed |

These values reflect the current verification state and should be updated when
the suite changes.

## Known Non-Blocking Warnings

- Vite may warn that a production chunk is larger than 500 kB.
- A Material UI warning may appear in the Lots initial filter test while select
  options are loading.

These warnings are currently non-blocking and do not make the verified suites
fail.

## Troubleshooting

### Chromium does not start on Linux

If Chromium fails with a missing library such as `libnspr4.so`, install the
browser and system dependencies:

```bash
cd land-sales-frontend
npx playwright install --with-deps chromium
```

### Inspect Docker Compose logs

From the repository root:

```bash
docker compose -f docker-compose.e2e.yml logs backend
docker compose -f docker-compose.e2e.yml logs frontend
docker compose -f docker-compose.e2e.yml logs e2e-db
```

### Check E2E health

```bash
docker compose -f docker-compose.e2e.yml ps
curl http://localhost:8080/actuator/health
```

### Open the Playwright report

```bash
cd land-sales-frontend
npx playwright show-report
```

### CORS and localhost

`http://localhost:5173` and `http://127.0.0.1:5173` are different origins for
CORS. The E2E configuration uses `http://localhost:5173` because that matches
the origin allowed by the backend.

### Avoid timeout-based fixes

Do not increase timeouts as the first response to unstable tests. Prefer waiting
for observable states, accessible elements, network requests, query invalidation,
or specific UI feedback.
