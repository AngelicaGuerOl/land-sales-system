# Land Sales System

[English](../README.md) | [Español](README.es.md)

[![CI](https://github.com/AngelicaGuerOl/land-sales-system/actions/workflows/ci.yml/badge.svg)](https://github.com/AngelicaGuerOl/land-sales-system/actions/workflows/ci.yml)

Sistema full stack desarrollado para un negocio familiar dedicado a la venta de
terrenos.

Centraliza manzanas, lotes, clientes, ventas financiadas, mensualidades, pagos,
estados de cuenta, recibos imprimibles, reportes operativos y la consulta del
plano de referencia.

El proyecto está basado en una necesidad real de negocio y demuestra desarrollo
full stack con React, Spring Boot, PostgreSQL, flujos financieros transaccionales
y APIs REST protegidas con JWT.

## Vista previa

| Estado de cuenta | Administración de lotes |
| --- | --- |
| ![Estado de cuenta](screenshots/account-statement.png) | ![Administración de lotes](screenshots/lots.png) |

| Registro de venta | Recibo imprimible |
| --- | --- |
| ![Registro de venta](screenshots/sale.png) | ![Recibo de pago](screenshots/receipt.png) |

## Problema de negocio

La operación de venta de terrenos requiere controlar la disponibilidad de lotes,
clientes, financiamientos, mensualidades, pagos y saldos pendientes.

Administrar esta información mediante hojas de cálculo, registros manuales y
recibos impresos dificulta conservar las condiciones financieras, aplicar pagos
correctamente y reproducir los saldos históricos.

Land Sales System reúne estos flujos en una aplicación autenticada.

## Funcionalidades principales

- Crear y administrar manzanas y lotes.
- Registrar lotes individuales o generarlos en bloque.
- Controlar los estados `AVAILABLE`, `BLOCKED` y `SOLD`.
- Registrar clientes y administrar su estado activo.
- Registrar ventas con uno o varios lotes.
- Configurar precio acordado y enganche de forma independiente por lote.
- Generar mensualidades con redondeo decimal exacto.
- Aplicar pagos completos o parciales en orden de mensualidad.
- Conservar saldos históricos antes y después de cada pago.
- Consultar estados de cuenta e historial de pagos.
- Generar recibos HTML imprimibles.
- Consultar reportes de ventas y pagos por periodo.
- Mostrar el plano local cuando sus recursos privados estén disponibles.

## Aspectos técnicos destacados

- Arquitectura frontend orientada a funcionalidades e inspirada en principios de Clean Architecture.
- Arquitectura backend en capas organizada por funcionalidades con Spring Boot.
- Autenticación JWT y endpoints REST protegidos.
- Contratos basados en DTOs, Bean Validation, MapStruct y manejo global de errores.
- Flujos transaccionales para registrar ventas y pagos.
- Bloqueos pesimistas para disponibilidad de lotes y operaciones financieras.
- Restricciones PostgreSQL y migraciones Flyway para integridad de datos.
- Campos financieros `NUMERIC(14,2)` y cálculos controlados por el backend.
- Documentación OpenAPI y Swagger UI.
- Pruebas frontend con Vitest, React Testing Library y MSW.
- Cobertura V8 y pruebas E2E con Playwright y Chromium.
- Entorno E2E aislado con Docker Compose.
- CI con GitHub Actions para backend, frontend, Docker y E2E.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Backend | Java 17, Spring Boot 4.1.0, Spring MVC, Spring Data JPA, Spring Security, JWT, MapStruct, Flyway y Bean Validation |
| Frontend | React 19, TypeScript, Vite, Material UI, React Router, TanStack Query, React Hook Form, Zod y AG Grid Community |
| Base de datos | PostgreSQL 16 |
| Calidad | JUnit, Mockito, Spring Test, Testcontainers, Vitest, React Testing Library, MSW, Playwright, cobertura V8 y ESLint |
| Infraestructura | Docker, Docker Compose, Maven Wrapper, Makefile y GitHub Actions |

## Arquitectura

Flujo de solicitudes del frontend:

```text
Página / Componente → Hook → Caso de uso → Interfaz de repositorio
→ Implementación de repositorio → Cliente HTTP → API REST
```

Flujo de solicitudes del backend:

```text
Controller → Service → Repository → PostgreSQL
```

La capa de servicios concentra las reglas de negocio, cálculos financieros,
transacciones, cambios de estado y coordinación de concurrencia.

## Reglas principales de negocio

- Una venta puede contener uno o varios lotes.
- Cada lote conserva sus propias condiciones comerciales y financieras.
- El backend recalcula los totales financieros autoritativos.
- Las mensualidades representan meses de pago, no fechas límite.
- No existen mora, intereses, recargos, penalizaciones ni estados vencidos.
- Los pagos deben aplicarse en orden de mensualidad.
- Solo la última mensualidad seleccionada puede recibir un pago parcial.
- El lote físico permanece en estado `SOLD` después de liquidar su financiamiento.
- Los números de pago son consecutivos, sin prefijos ni ceros a la izquierda.
- Los folios de venta utilizan el formato técnico `VTA-AAAA-######`.

Consulta las [Reglas de negocio](business-rules.md) para ver el detalle completo.

## Desarrollo local

### Requisitos

- Git.
- Java 17.
- Node.js y npm.
- Docker Desktop o Docker Engine.
- Docker Compose.
- GNU Make para utilizar los comandos incluidos.

### Variables de entorno

Desde la raíz del repositorio:

```bash
cp .env.example .env
```

Reemplaza las contraseñas y valores JWT de ejemplo antes de iniciar la
aplicación. Nunca publiques `.env`, secretos ni datos reales del negocio.

### Iniciar la aplicación

Desde la raíz del repositorio:

```bash
make dev
```

Este comando inicia PostgreSQL, pgAdmin y el servicio frontend de desarrollo.
Inicia el backend por separado:

```bash
cd land-sales-backend
./mvnw spring-boot:run
```

Direcciones de desarrollo:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API: `http://localhost:8080/api`
- pgAdmin: `http://localhost:5052`

La configuración Docker de desarrollo no incluye un contenedor para el backend.

### Recursos del plano de referencia

Los archivos originales del plano están excluidos de Git porque contienen
información privada del negocio. Para utilizar la función localmente, coloca
estos archivos en `land-sales-frontend/public/reference/`:

- `plano-lotificacion.pdf`
- `plano-lotificacion.webp`
- `plano-lotificacion-recortado.webp`

La aplicación muestra un mensaje alternativo cuando la imagen no está disponible.

## Documentación de la API

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- OpenAPI YAML: `http://localhost:8080/v3/api-docs.yaml`

Los endpoints protegidos requieren un token bearer JWT. Consulta el [Resumen de la API REST](api-overview.md).

## Verificación

Backend desde la raíz del repositorio:

```bash
cd land-sales-backend
./mvnw -B clean verify
```

Frontend desde la raíz del repositorio:

```bash
cd land-sales-frontend
npm ci
npm run lint
npm run test
npm run test:coverage
npm run build
```

E2E desde la raíz del repositorio:

```bash
docker compose -f docker-compose.e2e.yml up --build --wait -d
```

Luego ejecuta Playwright desde `land-sales-frontend/`:

```bash
cd land-sales-frontend
npm run test:e2e
```

Finalmente, vuelve a la raíz del repositorio y apaga el entorno E2E:

```bash
cd ..
docker compose -f docker-compose.e2e.yml down --volumes --remove-orphans
```

La guía técnica detallada está en inglés en la [Guía de testing](testing.md).

## Testing

La estrategia combina pruebas backend, pruebas frontend por módulos, simulación
de API con MSW, cobertura V8 y flujos E2E con Playwright.

Resultados actuales verificados:

| Métrica | Resultado |
| --- | ---: |
| Archivos de pruebas frontend | 23 |
| Pruebas frontend automatizadas | 148 |
| Statements | 88.12% |
| Branches | 81.38% |
| Functions | 84.00% |
| Lines | 89.69% |
| Flujos E2E Playwright | 2 |

Estos resultados corresponden al estado actual de la suite y deben actualizarse
cuando cambien las pruebas. La cobertura mide código ejecutado; no garantiza la
ausencia total de defectos.

## Documentación

- [Arquitectura](architecture.md)
- [Reglas de negocio](business-rules.md)
- [Diseño de base de datos](database.md)
- [Resumen de la API REST](api-overview.md)
- [Guía de desarrollo](development-guide.md)
- [Guía de testing](testing.md)
- [Manual de usuario](user-manual.md)
- [Guía de capturas](screenshots/README.md)
- [README principal en inglés](../README.md)

## Alcance y limitaciones

Actualmente el proyecto no incluye pagos con tarjeta en línea, portal para
clientes, intereses o mora, cancelación de pagos, facturación electrónica,
generación de contratos legales, despliegue continuo ni endurecimiento de
despliegue para producción.

## Licencia

Este repositorio no incluye actualmente una licencia de código abierto. El
código se publica para revisión y evaluación técnica de portafolio.

## Autora

Desarrollado por [AngelicaGuerOl](https://github.com/AngelicaGuerOl).
