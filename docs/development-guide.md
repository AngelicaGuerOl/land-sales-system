# Development Guide

[Back to the main README](../README.md)

## Overview

This guide explains how to configure, run, verify, and troubleshoot Land Sales System in a local development environment.

The recommended development setup uses:

- PostgreSQL through Docker.
- The React frontend through Docker or directly with Vite.
- The Spring Boot backend directly through IntelliJ IDEA or the Maven Wrapper.

The development Docker Compose configuration does not include a backend container.

This guide covers local development. Production deployment hardening is outside the currently documented scope.

## Prerequisites

Install the following tools:

- Git.
- Java 17.
- Node.js and npm.
- Docker Desktop or Docker Engine.
- Docker Compose.
- GNU Make when using the provided Makefile commands.

Maven does not need to be installed globally because the backend includes the Maven Wrapper.

The repository does not currently define an exact Node.js version through `.nvmrc` or the `engines` field in `package.json`. Verify the installed versions with:

```bash
node --version
npm --version
```

## Command Locations

Run commands from the following directories:

| Command type | Directory |
| --- | --- |
| Docker Compose and Make | Repository root |
| Backend Maven commands | `land-sales-backend/` |
| Frontend npm commands | `land-sales-frontend/` |

The main repository structure is:

```text
land-sales-system/
├── .github/workflows/ci.yml
├── land-sales-backend/
├── land-sales-frontend/
├── docs/
├── docker-compose.yml
├── docker-compose.dev.yml
├── docker-compose.e2e.yml
├── .env.example
├── Makefile
└── README.md
```

The detailed testing documentation is available at:

```text
docs/testing.md
```

## Environment Configuration

The repository uses a root `.env` file for local configuration.

Create it from the provided template.

### Linux, macOS, WSL, or Git Bash

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

The template contains configuration for:

- PostgreSQL.
- Backend and frontend ports.
- Vite API communication.
- pgAdmin.
- JWT authentication.
- Bootstrap administrator creation.

Replace all placeholder passwords and JWT values before starting the application.

Never commit:

- `.env`
- Database passwords
- JWT secrets
- Real customer information
- Real sales or payment data

The backend loads the root environment configuration when started from the repository root or the backend directory.

## Default Development Services

| Service | Default address |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| API base path | `http://localhost:8080/api` |
| PostgreSQL from the host | `localhost:5434` |
| Default database | `land_sales_db` |
| pgAdmin | `http://localhost:5052` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| OpenAPI YAML | `http://localhost:8080/v3/api-docs.yaml` |

These values may be changed through the root `.env` file.

## Recommended Development Workflow

### 1. Create the environment file

From the repository root:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 2. Start PostgreSQL, pgAdmin, and the frontend

```bash
make dev
```

The command uses:

```text
docker-compose.yml
docker-compose.dev.yml
```

The equivalent Docker Compose command is:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up -d --build
```

On Windows PowerShell:

```powershell
docker compose `
  -f docker-compose.yml `
  -f docker-compose.dev.yml `
  up -d --build
```

### 3. Start the backend

Linux, macOS, or WSL:

```bash
cd land-sales-backend
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
Set-Location land-sales-backend
.\mvnw.cmd spring-boot:run
```

The backend starts at:

```text
http://localhost:8080
```

During startup:

1. Flyway checks and applies pending migrations.
2. Hibernate validates the resulting schema.
3. Spring Security configures JWT authentication.
4. The REST API becomes available.

Hibernate uses:

```text
ddl-auto=validate
```

Flyway migrations are the source of truth for the database schema. Hibernate does not create or update the schema automatically.

### 4. Open the application

```text
http://localhost:5173
```

## Run the Backend from IntelliJ IDEA

The backend can run from IntelliJ while PostgreSQL and the frontend remain in Docker.

1. Open the repository or the `land-sales-backend` module.
2. Confirm that the project SDK uses Java 17.
3. Confirm that the root `.env` file exists.
4. Confirm that PostgreSQL is running.
5. Run the Spring Boot application class.
6. Verify that the backend starts on port `8080`.

## Run the Frontend Without Docker

The frontend can run directly through Vite.

```bash
cd land-sales-frontend
npm ci
npm run dev
```

Use `npm ci` when `package-lock.json` exists. It installs the dependency versions recorded in the lockfile.

Use `npm install` only when dependencies or the lockfile must be intentionally updated.

Vite proxies requests beginning with `/api` to the value configured in:

```text
VITE_API_PROXY_TARGET
```

The default target is:

```text
http://localhost:8080
```

The backend must be running for authenticated application workflows to work.

## Service Management

Run these commands from the repository root.

### Check service status

```bash
make ps
```

### View logs

```bash
make logs
```

To inspect an individual service:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs -f db
```

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs -f frontend
```

### Restart the frontend

```bash
make restart-frontend
```

### Rebuild the frontend

```bash
make rebuild-frontend
```

Rebuild the frontend after changing:

- Frontend dependencies.
- The frontend Dockerfile.
- Vite configuration.
- Docker development configuration.

### Stop services

```bash
make stop
```

### Remove development containers

```bash
make down
```

`make down` stops and removes the development containers without intentionally deleting the PostgreSQL volume.

Do not run:

```bash
docker compose down -v
```

unless deleting the local database volume is intentional. The `-v` option may permanently remove all local development records.

## Backend Verification

Run full backend verification:

```bash
cd land-sales-backend
./mvnw -B clean verify
```

On Windows PowerShell:

```powershell
Set-Location land-sales-backend
.\mvnw.cmd -B clean verify
```

The backend includes unit and integration test support with:

- JUnit.
- Mockito.
- Spring Test.
- Testcontainers.

Integration tests can start PostgreSQL through Testcontainers.

An external test database may be configured through:

```text
LAND_SALES_TEST_DB_URL
```

Do not run automated tests against a database containing real business data.

## Frontend Verification

Run frontend verification:

```bash
cd land-sales-frontend
npm ci
npm run lint
npm run test
npm run test:coverage
npm run build
```

This frontend verification sequence checks:

- Code quality through ESLint.
- Unit, component, and integration behavior through Vitest.
- Frontend coverage through V8.
- TypeScript compilation.
- Module resolution.
- Vite production bundling.
- Static asset generation.

## Testing and Verification

For backend tests, frontend tests, coverage, Playwright E2E, Docker Compose E2E,
and GitHub Actions instructions, see the [Testing Guide](testing.md).

## API Documentation

Springdoc OpenAPI generates API documentation from the backend controllers and DTO contracts.

After starting the backend, open:

| Resource | Address |
| --- | --- |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| OpenAPI YAML | `http://localhost:8080/v3/api-docs.yaml` |

Application API routes use the `/api` prefix.

Protected endpoints require:

```http
Authorization: Bearer <token>
```

### Authenticate in Swagger UI

1. Open Swagger UI.
2. Execute `POST /api/auth/login`.
3. Copy the returned JWT.
4. Select **Authorize**.
5. Enter the token in the bearer authentication field.
6. Execute the protected endpoint.

Swagger UI documents the generated API contracts, but it does not replace backend authentication or authorization.

See [REST API Overview](api-overview.md) for the endpoints organized by business feature.

## Database Migration Rules

Database changes must be introduced through new Flyway migrations located in:

```text
land-sales-backend/src/main/resources/db/migration/
```

Follow these rules:

- Do not rely on Hibernate to create or modify tables.
- Do not modify a migration that has already been applied.
- Create a new migration for every schema change.
- Keep JPA entities aligned with the resulting schema.
- Use constraints and indexes that support actual business rules or query patterns.
- Verify new installations and existing database upgrades when possible.
- Do not delete local volumes as the normal solution for migration errors.

See [Database Design](database.md) for the documented schema and integrity rules.

## Verification Before Commit

Run the checks that apply to the modified area.

### Backend changes

```bash
cd land-sales-backend
./mvnw -B clean verify
```

### Frontend changes

Run these checks when the change affects the frontend application or its test
suite.

```bash
cd land-sales-frontend
npm run lint
npm run test
npm run test:coverage
npm run build
```

### Repository check

From the repository root:

```bash
git diff --check
```

Also verify that:

- `.env` is not staged.
- No real credentials or business data are present.
- Generated build directories are not staged accidentally.
- Documentation links point to existing files.
- Screenshot names match their Markdown paths.
- New Flyway migrations use unique version numbers.
- Previously applied migrations were not modified.

## Troubleshooting

### Docker is not running

Verify Docker:

```bash
docker info
```

Start Docker Desktop or the Docker service, and then run:

```bash
make dev
```

### PostgreSQL does not start

Check the service status:

```bash
make ps
```

Inspect the database logs:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs db
```

Verify that:

- Docker is running.
- `.env` exists.
- Database variables are defined.
- Port `5434` is available.
- The PostgreSQL volume is accessible.

### A required port is already in use

Default ports are:

| Service | Port |
| --- | --- |
| PostgreSQL | `5434` |
| Backend | `8080` |
| Frontend | `5173` |
| pgAdmin | `5052` |

On Windows PowerShell:

```powershell
netstat -ano | Select-String ":8080"
```

On Linux or WSL:

```bash
ss -ltnp | grep 8080
```

Replace `8080` with the port being investigated.

Stop the conflicting process or update the corresponding configuration in `.env`. Keep the backend and frontend proxy values aligned after changing ports.

### Backend cannot connect to PostgreSQL

Confirm that PostgreSQL is running:

```bash
make ps
```

Verify:

- Database host and port.
- Database name.
- Database username and password.
- Root `.env` file.
- PostgreSQL container health.
- Backend working directory.

The default host connection is:

```text
localhost:5434
```

### Frontend cannot reach the backend

Verify that the backend is running at:

```text
http://localhost:8080
```

Check:

```text
VITE_API_PROXY_TARGET
```

The default value is:

```text
http://localhost:8080
```

After changing frontend environment values, restart or rebuild the frontend:

```bash
make restart-frontend
```

or:

```bash
make rebuild-frontend
```

### Requests return `401 Unauthorized`

Verify that:

- Login completed successfully.
- The frontend stored the JWT.
- The request includes the bearer token.
- The JWT secret matches the backend configuration.
- The token has not expired.
- The application user remains active.

Log in again after changing the JWT configuration.

### Flyway migration fails

Review the backend startup log and identify the failing migration.

- Correct an unapplied migration only when it has never been shared or executed elsewhere.
- Otherwise, create a new migration that safely corrects the schema.
- Keep the database schema and JPA entities aligned.
- Run the backend tests again.

Do not delete the PostgreSQL volume only to hide an invalid migration.

### Hibernate schema validation fails

A validation error indicates that the JPA entity model and the Flyway-managed schema do not match.

Verify:

- Applied migrations.
- Column names.
- Nullability.
- Numeric precision and scale.
- Enum storage.
- Foreign-key relationships.

Fix the incorrect definition through a new migration or the corresponding entity mapping.

### Frontend dependencies fail to install

Verify the installed versions:

```bash
node --version
npm --version
```

Then run:

```bash
cd land-sales-frontend
npm ci
```

Do not delete or regenerate `package-lock.json` unless dependency changes are intentional.

### Testcontainers cannot start PostgreSQL

Verify that Docker is available:

```bash
docker info
```

Testcontainers requires access to a running Docker environment.

Alternatively, configure a separate test database through:

```text
LAND_SALES_TEST_DB_URL
```

Do not use the normal development database when tests may modify or delete data.

## Development Practices

- Keep financial calculations in backend services.
- Do not trust totals calculated only by the frontend.
- Keep controllers focused on HTTP contracts.
- Keep repositories focused on persistence.
- Use DTOs instead of exposing JPA entities.
- Introduce schema changes through new Flyway migrations.
- Preserve frontend use cases and repository abstractions.
- Keep environment-specific values outside source control.
- Run tests, lint, and builds before committing significant changes.

See [Architecture](architecture.md) for the complete frontend and backend architectural responsibilities.

## Related Documentation

- [Main README](../README.md)
- [Architecture](architecture.md)
- [Business Rules](business-rules.md)
- [Database Design](database.md)
- [REST API Overview](api-overview.md)
- [Testing Guide](testing.md)
- [User Manual](user-manual.md)
