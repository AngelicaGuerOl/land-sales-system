# Land Sales System

## Docker development

This development setup runs PostgreSQL and the React/Vite frontend in Docker. The Spring Boot backend runs from IntelliJ at `http://localhost:8080`.

Use a single environment file at the repository root:

```bash
cp .env.example .env
```

Do not create a separate `land-sales-backend/.env`. The backend imports the root `.env` when it runs from IntelliJ, so Docker Compose and Spring Boot use the same database, JWT, and bootstrap admin variables.

### Using Make

Run these commands from WSL, Linux, or Git Bash with GNU Make installed.

Start PostgreSQL, pgAdmin, and the frontend:

```bash
make dev
```

Check status:

```bash
make ps
```

View logs:

```bash
make logs
```

Restart only the frontend:

```bash
make restart-frontend
```

Rebuild images:

```bash
make build
```

Stop containers without deleting data:

```bash
make down
```

`make down` preserves the PostgreSQL volume. Do not use `down -v` unless you intentionally want to delete all database information.

### Docker Compose equivalents

Start PostgreSQL and the frontend:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Check status:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml ps
```

View frontend logs:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
```

Stop containers without deleting data:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

Start pgAdmin:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile tools up -d
```

Default URLs:

- Frontend: `http://localhost:5173`
- Backend from IntelliJ: `http://localhost:8080`
- PostgreSQL from IntelliJ: `localhost:5434`
- pgAdmin: `http://localhost:5052`

The backend must be started manually from IntelliJ and available at `http://localhost:8080` for login and frontend `/api` requests to work. IntelliJ connects to PostgreSQL at `localhost:5434`. The browser calls `http://localhost:5173/api/...`; Vite forwards those requests to the backend at `http://localhost:8080`, avoiding CORS during development.

For pgAdmin, register the database connection with host `db`, port `5432`, database `DB_NAME`, username `DB_USER`, and password `DB_PASSWORD`.

### Plano de referencia

El PDF original se conserva en `docs/reference`. La copia pública utilizada por Vite está en `land-sales-frontend/public/reference`. Si se reemplaza el plano, deben actualizarse ambas copias. En un despliegue público futuro debe evaluarse servirlo mediante el backend autenticado.
