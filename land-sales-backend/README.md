# Land Sales Backend

Java 17 and Spring Boot backend for Land Sales System.

The public demo backend runs on Render as a Docker-based Web Service using this
module's `Dockerfile` and its `ENTRYPOINT`. Render provides `PORT`, and Spring
Boot reads it through `${PORT:8080}`.

Operational health:

- Render Health Check Path: `/actuator/health/liveness`
- General health: `/actuator/health`
- Spring Security permits `GET /actuator/health/**` without a JWT.

Runtime configuration is provided through environment variables such as
`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`,
`SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `APP_CORS_ALLOWED_ORIGINS`,
`APP_DEMO_ENABLED`, and `APP_DEMO_USERNAME`. Do not commit real Render, Neon, or
JWT secrets.

This module is documented from the repository root to keep architecture,
development, testing, and deployment instructions in one place.

Useful links:

- [Main README](../README.md)
- [REST API Overview](../docs/api-overview.md)
- [Database Design](../docs/database.md)
- [Development Guide](../docs/development-guide.md)
- [Deployment Guide](../docs/deployment.md)

Common command from this directory:

```bash
./mvnw -B clean verify
```
