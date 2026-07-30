# Land Sales System

[English](README.md) | [Español](docs/README.es.md)

[![CI](https://github.com/AngelicaGuerOl/land-sales-system/actions/workflows/ci.yml/badge.svg)](https://github.com/AngelicaGuerOl/land-sales-system/actions/workflows/ci.yml)

A full-stack management system developed for a family-owned land sales business.

It centralizes blocks, lots, customers, financed sales, monthly installments,
payments, account statements, printable receipts, operational reports, and a
reference-plan view.

The project is based on a real business need and demonstrates React, Spring
Boot, PostgreSQL, transactional financial workflows, and JWT-protected REST APIs.

## Live Demo

Try the deployed application:

**Demo:** https://land-sales-system.angelica-guerrero.workers.dev/

Select **Explore Demo** to access the application using a prepared demo account
and fictional data.

> The demo uses free-tier infrastructure. The first request after a period of
> inactivity may take a few seconds while the backend starts.

## Application Preview

| Account statement | Lot management |
| --- | --- |
| ![Account statement](docs/screenshots/account-statement.png) | ![Lot management](docs/screenshots/lots.png) |

| Sale registration | Printable receipt |
| --- | --- |
| ![Sale registration](docs/screenshots/sale.png) | ![Payment receipt](docs/screenshots/receipt.png) |

## Business Problem

Land sales operations require accurate tracking of lot availability, customers,
financing, installments, payments, and outstanding balances.

Managing this information through spreadsheets, handwritten records, and printed
receipts makes it difficult to preserve financial conditions, apply payments
correctly, and reproduce historical balances.

Land Sales System brings these workflows into one authenticated application.

## Core Features

- Create and manage blocks and lots.
- Register individual lots or generate lots in bulk.
- Track `AVAILABLE`, `BLOCKED`, and `SOLD` lot states.
- Register customers and manage their active status.
- Create sales containing one or multiple lots.
- Configure agreed price and down payment independently per lot.
- Generate monthly installment plans with exact decimal rounding.
- Apply complete or partial payments in installment order.
- Preserve historical balances before and after payments.
- Consult customer account statements and payment history.
- Generate printable HTML receipts.
- Consult sales and payment reports by period.
- Display a reference plan. Private plan files are excluded from Git, while the
  public demo uses a fictitious sanitized image.

## Technical Highlights

- Feature-oriented frontend architecture inspired by Clean Architecture principles.
- Feature-oriented layered architecture in the Spring Boot backend.
- JWT authentication and protected REST endpoints.
- DTO-based contracts, Bean Validation, MapStruct, and global error handling.
- Transactional sale and payment workflows.
- Pessimistic locking for lot availability and financial operations.
- PostgreSQL constraints and Flyway migrations for data integrity.
- `NUMERIC(14,2)` financial fields and backend-controlled calculations.
- OpenAPI and Swagger UI documentation.
- Automated frontend testing with Vitest, React Testing Library, and MSW.
- V8 test coverage and Playwright E2E testing with Chromium.
- Isolated E2E environment with PostgreSQL, Spring Boot, React, and Docker Compose.
- CI for backend, frontend, Docker image build, and E2E verification.
- Public portfolio demo deployed with Cloudflare Workers Static Assets, Render,
  and Neon.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Backend | Java 17, Spring Boot 4.1.0, Spring MVC, Spring Data JPA, Spring Security, JWT, MapStruct, Flyway, Bean Validation |
| Frontend | React 19, TypeScript, Vite, Material UI, React Router, TanStack Query, React Hook Form, Zod, AG Grid Community |
| Database | PostgreSQL 16 |
| Quality | JUnit, Mockito, Spring Test, Testcontainers, Vitest, React Testing Library, MSW, Playwright, V8 Coverage, ESLint |
| Infrastructure | Docker, Docker Compose, Maven Wrapper, Makefile, GitHub Actions |
| Deployment | Cloudflare Workers Static Assets, Render, Neon |

## Architecture

Frontend request flow:

```text
Page / Component → Hook → Use Case → Repository Interface
→ Repository Implementation → HTTP Client → REST API
```

Backend request flow:

```text
Controller → Service → Repository → PostgreSQL
```

The service layer owns business rules, financial calculations, transaction
boundaries, state transitions, and concurrency coordination.

## Deployment

The public deployment is a portfolio demo, not a production installation for
real business operations.

| Layer | Public deployment |
| --- | --- |
| Frontend | Cloudflare Workers Static Assets |
| Backend API | Render, Spring Boot container |
| Database | Neon managed PostgreSQL |
| Verification | GitHub Actions CI for backend, frontend, Docker, and E2E checks |

The deployed frontend talks to:

- API base: `https://land-sales-api.onrender.com/api`
- Render liveness check: `https://land-sales-api.onrender.com/actuator/health/liveness`
- General health endpoint: `https://land-sales-api.onrender.com/actuator/health`

The backend uses environment variables for PostgreSQL, JWT, CORS, bootstrap
admin, and demo access configuration. GitHub Actions verifies the code on pull
requests and pushes to `main`, but it does not deploy the application.
Cloudflare and Render deployments are managed through their external GitHub
integrations.

See the [Deployment Guide](docs/deployment.md) for environment variables,
deployment flow, and operational notes.

## Important Business Rules

- A sale may contain one or multiple lots.
- Each lot keeps independent commercial and financing conditions.
- The backend recalculates authoritative financial totals.
- Installments represent payment months, not due dates.
- There are no late fees, interest, penalties, or overdue states.
- Payments must be applied in installment order.
- Only the final selected installment may receive a partial amount.
- A physical lot remains `SOLD` after its financing is completed.
- Payment numbers are consecutive integers without prefixes or leading zeros.
- Sale numbers are consecutive positive integers without prefixes or leading zeros.

See [Business Rules](docs/business-rules.md) for the complete rules.

## Local Development

### Requirements

- Git.
- Java 17.
- Node.js and npm.
- Docker Desktop or Docker Engine.
- Docker Compose.
- GNU Make for the provided Makefile commands.

### Environment

From the repository root:

```bash
cp .env.example .env
```

Replace placeholder passwords and JWT values before starting the application.
Never commit `.env`, secrets, or real business data.

### Start the Application

From the repository root:

```bash
make dev
```

This starts PostgreSQL, pgAdmin, and the frontend development service. Start
the backend separately:

```bash
cd land-sales-backend
./mvnw spring-boot:run
```

Development URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API: `http://localhost:8080/api`
- pgAdmin: `http://localhost:5052`

The development Compose configuration does not include a backend container.

### Reference Plan Assets

The real plan files are excluded from Git because they contain private business
information. A private local file may be placed under
`land-sales-frontend/public/reference/`, but it is used only when
`VITE_REFERENCE_PLAN_IMAGE_URL` points to its public path. The public demo uses
the versioned fictitious image at
`land-sales-frontend/public/images/reference-plan/plan-reference-demo.png`,
served by default from `/images/reference-plan/plan-reference-demo.png`.

## API Documentation

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- OpenAPI YAML: `http://localhost:8080/v3/api-docs.yaml`

Protected endpoints require a JWT bearer token. See the [REST API Overview](docs/api-overview.md).

## Verification

Backend verification from the repository root:

```bash
cd land-sales-backend
./mvnw -B clean verify
```

This compiles the backend and runs the backend test suite.

Frontend verification from the repository root:

```bash
cd land-sales-frontend
npm ci
npm run lint
npm run test
npm run test:coverage
npm run build
```

| Command | Purpose |
| --- | --- |
| `npm run lint` | Runs ESLint. |
| `npm run test` | Runs the frontend test suite with Vitest. |
| `npm run test:coverage` | Runs frontend tests with V8 coverage. |
| `npm run build` | Runs TypeScript build and Vite production bundling. |

E2E verification from the repository root:

```bash
docker compose -f docker-compose.e2e.yml up --build --wait -d
```

Then run Playwright from `land-sales-frontend/`:

```bash
cd land-sales-frontend
npm run test:e2e
```

Finally, return to the repository root and stop the E2E environment:

```bash
cd ..
docker compose -f docker-compose.e2e.yml down --volumes --remove-orphans
```

See the [Testing Guide](docs/testing.md) for the complete workflow.

## Testing

The project uses a layered testing strategy: backend tests validate services and
integration behavior, frontend tests cover schemas, components, pages, routing,
HTTP behavior, and API integration through MSW, and Playwright verifies critical
browser flows against a real frontend, backend, and PostgreSQL database.

Current verified frontend results:

| Metric | Result |
| --- | ---: |
| Test files | 24 |
| Automated frontend tests | 162 |
| Statements | 89.97% |
| Branches | 82.62% |
| Functions | 86.12% |
| Lines | 92.25% |
| Playwright E2E flows | 2 |

These results describe the current suite and should be updated as the project
evolves. Coverage measures executed code; it does not prove that the application
is defect-free.

## Documentation

- [Architecture](docs/architecture.md)
- [Business Rules](docs/business-rules.md)
- [Database Design](docs/database.md)
- [REST API Overview](docs/api-overview.md)
- [Development Guide](docs/development-guide.md)
- [Deployment Guide](docs/deployment.md)
- [Testing Guide](docs/testing.md)
- [Spanish README](docs/README.es.md)
- [User Manual](docs/user-manual.md)
- [Screenshot Guidelines](docs/screenshots/README.md)

## Scope and Limitations

The project does not currently include online card payments, a customer portal,
interest or late fees, payment cancellation, electronic invoicing, legally
binding contract generation, or production deployment hardening.

The public deployment is a portfolio demo hosted on free-tier infrastructure and
is not configured as a production environment for real business operations.

## License

This repository does not currently include an open-source license. The source
code is published for portfolio review and technical evaluation.

## Author

Developed by [AngelicaGuerOl](https://github.com/AngelicaGuerOl).
