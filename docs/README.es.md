# Land Sales System

[English](../README.md) | [Español](README.es.md)

Land Sales System es una aplicación web full stack desarrollada para digitalizar las operaciones de un negocio familiar dedicado a la venta de terrenos.

El sistema centraliza la administración de manzanas y lotes, clientes, ventas financiadas de varios lotes, planes de mensualidades, pagos, estados de cuenta, recibos imprimibles y reportes operativos.

Fue creado a partir de una necesidad real del negocio y demuestra el desarrollo de una aplicación full stack con React, Spring Boot, PostgreSQL, flujos financieros transaccionales y controles explícitos de concurrencia.

> **Estado:** Proyecto funcional de portafolio en desarrollo activo. Los flujos principales de administración de lotes, clientes, ventas, financiamiento, pagos, estados de cuenta, recibos y reportes se encuentran implementados.

## Vista previa de la aplicación

| Estado de cuenta del cliente | Administración de lotes |
| --- | --- |
| ![Estado de cuenta del cliente](screenshots/account-statement.png) | ![Administración de lotes](screenshots/lots.png) |

| Plano de referencia | Registro de venta |
| --- | --- |
| ![Plano de referencia](screenshots/plane.png) | ![Flujo de registro de venta](screenshots/sale.png) |

| Registro de pago | Recibo imprimible |
| --- | --- |
| ![Registro de pago](screenshots/register-payment.png) | ![Recibo de pago imprimible](screenshots/receipt.png) |

## Problema y solución

Un negocio dedicado a la venta de terrenos necesita controlar la disponibilidad de los lotes, los clientes, las ventas financiadas, los planes de mensualidades, los pagos y los saldos pendientes.

Administrar estas operaciones mediante hojas de cálculo, registros escritos y documentos separados dificulta:

- Identificar los lotes adquiridos por cada cliente.
- Conservar condiciones de financiamiento diferentes para cada lote.
- Calcular correctamente los saldos financiados y pendientes.
- Aplicar un solo pago a varios lotes y mensualidades.
- Registrar pagos completos y parciales de mensualidades.
- Conservar saldos históricos para recibos y estados de cuenta.
- Consultar las ventas y los pagos registrados durante un periodo.

Land Sales System centraliza estos procesos en una sola aplicación web autenticada.

## Funcionalidades principales

### Manzanas y lotes

- Registrar y actualizar manzanas.
- Controlar la cantidad planeada y registrada de lotes.
- Registrar lotes individualmente.
- Generar varios lotes con numeración configurable.
- Almacenar superficie, frente, profundidad, precio y referencias de ubicación.
- Administrar los estados `AVAILABLE`, `BLOCKED` y `SOLD`.
- Conservar el historial de precios de cada lote.
- Mostrar un plano de referencia.

### Clientes

- Registrar y actualizar clientes.
- Buscar clientes por nombre o número de teléfono.
- Activar o desactivar registros de clientes.
- Consultar el detalle de cada cliente.
- Conservar la información histórica después de una desactivación.

### Ventas y financiamiento

- Registrar ventas que contengan uno o varios lotes disponibles.
- Definir un precio acordado independiente para cada lote.
- Definir un enganche independiente para cada lote.
- Calcular el financiamiento de cada lote por separado.
- Generar automáticamente los planes de mensualidades.
- Distribuir de forma segura las diferencias de redondeo decimal.
- Conservar el historial y detalle financiero de las ventas.
- Cambiar automáticamente los lotes vendidos al estado `SOLD`.
- Evitar la venta concurrente de un mismo lote físico.

### Estados de cuenta y pagos

- Consultar estados de cuenta por cliente.
- Revisar saldos pendientes por venta y lote financiado.
- Agrupar los planes de mensualidades por lote.
- Aplicar un solo pago a varios lotes y mensualidades.
- Exigir que las mensualidades se paguen en orden cronológico.
- Permitir un pago parcial en la última mensualidad seleccionada.
- Registrar pagos en efectivo y transferencia bancaria.
- Conservar los saldos anteriores y posteriores de cada pago.
- Consultar el historial de pagos y sus aplicaciones.
- Generar recibos HTML imprimibles.

### Reportes

- Generar un reporte general para un periodo seleccionado.
- Consultar la cantidad de ventas registradas y lotes vendidos.
- Revisar los importes acordados y los enganches recibidos.
- Consultar los pagos posteriores registrados durante el periodo.
- Calcular el total recibido, el total financiado y el saldo pendiente actual.
- Revisar los resultados agrupados por manzana.
- Imprimir una vista optimizada del reporte.

## Aspectos técnicos destacados

- Desarrollado a partir de un flujo de negocio real y no como un ejercicio CRUD básico.
- Clean Architecture orientada a funcionalidades en el frontend con React.
- Arquitectura en capas organizada por funcionalidades en el backend con Spring Boot.
- Autenticación JWT y endpoints REST protegidos.
- Contratos de API basados en DTOs y manejo centralizado de excepciones.
- Cálculos financieros controlados por el backend.
- Registro transaccional de ventas y pagos.
- Bloqueos pesimistas para proteger operaciones financieras concurrentes.
- Restricciones de PostgreSQL para mantener la integridad estructural y financiera.
- Migraciones versionadas de base de datos con Flyway.
- Aplicaciones históricas de pagos y conservación de saldos anteriores y posteriores.
- Documentación automática mediante OpenAPI y Swagger UI.

## Tecnologías

| Área | Tecnologías |
| --- | --- |
| Backend | Java 17, Spring Boot 4.1, Spring MVC, Spring Data JPA, Spring Security, Bean Validation, JWT, MapStruct, Flyway, JUnit, Mockito, Spring Test y Testcontainers |
| Frontend | React 19, TypeScript, Vite, Material UI, React Router, TanStack Query, React Hook Form, Zod y AG Grid Community |
| Base de datos | PostgreSQL 16 |
| Infraestructura | Docker, Docker Compose, Maven Wrapper, Makefile y volúmenes persistentes de PostgreSQL |
| Documentación de API | OpenAPI y Swagger UI |

## Arquitectura

El proyecto está organizado como un monorepositorio que contiene un backend con Spring Boot, un frontend con React, infraestructura de desarrollo basada en Docker y documentación técnica.

### Frontend

El frontend utiliza Clean Architecture orientada a funcionalidades:

```text
Página / Componente
        ↓
Hook
        ↓
Caso de uso
        ↓
Interfaz de repositorio
        ↓
Implementación del repositorio
        ↓
Cliente HTTP
        ↓
API REST
```

El código de presentación y aplicación depende de interfaces de repositorio en lugar de implementaciones HTTP específicas.

Los adaptadores de infraestructura implementan esas interfaces y se comunican con el backend mediante un cliente HTTP compartido.

### Backend

El backend utiliza una arquitectura en capas organizada por funcionalidades:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
PostgreSQL
```

Los controllers exponen contratos REST validados, los services implementan las reglas de negocio y los límites transaccionales, y los repositories administran la persistencia, las consultas, la paginación y los bloqueos de base de datos.

Los cálculos financieros no se implementan dentro de los controllers. La capa de servicios es la fuente de verdad para:

- Registro de ventas.
- Cálculos de financiamiento.
- Generación de mensualidades.
- Aplicación de pagos.
- Actualización de saldos.
- Transiciones de estado.
- Coordinación de transacciones.
- Protección contra conflictos concurrentes.

Para consultar los diagramas y la explicación completa de los flujos, revisa [Arquitectura](architecture.md).

## Modelo financiero

Un lote físico se almacena por separado de las condiciones financieras bajo las cuales fue vendido.

```text
Cliente
    └── Venta
          └── Lote de la venta
                └── Mensualidad
                      └── Aplicación del pago a la mensualidad

Pago
    └── Aplicación del pago al lote
          └── Aplicación del pago a la mensualidad
```

Esta separación permite que una venta contenga varios lotes con condiciones independientes:

- Precios acordados.
- Enganches.
- Saldos financiados.
- Cantidades de mensualidades.
- Importes mensuales.
- Saldos pendientes.

Los pagos se almacenan en tres niveles:

1. Encabezado del pago.
2. Importe aplicado a cada lote financiado.
3. Importe aplicado a cada mensualidad.

La aplicación conserva los saldos históricos en lugar de recalcular los detalles de pagos anteriores a partir de los valores actuales.

Los importes monetarios utilizan `NUMERIC(14,2)` y están protegidos mediante restricciones de base de datos.

Para consultar el modelo relacional completo, los índices y las restricciones, revisa [Diseño de base de datos](database.md).

## Reglas principales de negocio

- Una venta puede contener uno o varios lotes.
- Cada lote conserva condiciones comerciales y financieras independientes.
- El backend recalcula todos los importes financieros autoritativos.
- El precio acordado puede ser diferente al precio actual registrado para el lote.
- Un lote liquidado mediante el enganche no genera mensualidades.
- Las mensualidades representan meses de pago y no fechas límite automáticas.
- Las mensualidades no se convierten automáticamente en vencidas.
- El sistema no calcula intereses, mora, recargos ni penalizaciones.
- Los pagos deben aplicarse en orden cronológico.
- No puede pagarse una mensualidad posterior mientras una anterior conserve saldo.
- Solo la última mensualidad seleccionada puede recibir un pago parcial.
- Un pago puede cubrir mensualidades de varios lotes financiados.
- Un lote físico permanece en estado `SOLD` después de liquidar su financiamiento.
- Los números de pago son enteros positivos consecutivos, sin prefijos ni ceros a la izquierda. Los folios de venta se almacenan con el formato técnico `VTA-AAAA-######`; algunas respuestas pueden mostrar únicamente el consecutivo.

Para consultar todas las reglas documentadas, revisa [Reglas de negocio](business-rules.md).

## Instalación

### Requisitos

- Git
- Java 17
- Node.js y npm
- Docker Desktop o Docker Engine
- Docker Compose
- GNU Make para utilizar los comandos incluidos en el Makefile

### Configuración del entorno

Crea el archivo local de variables de entorno a partir de la plantilla incluida:

```bash
cp .env.example .env
```

Reemplaza las contraseñas y los valores JWT de ejemplo antes de iniciar la aplicación.

Nunca publiques:

- `.env`
- Contraseñas de base de datos
- Secretos JWT
- Información real de clientes
- Ventas o pagos reales

### Flujo recomendado de desarrollo

Desde la raíz del repositorio, inicia PostgreSQL, pgAdmin y el servicio de desarrollo del frontend:

```bash
make dev
```

Inicia el backend por separado:

```bash
cd land-sales-backend
./mvnw spring-boot:run
```

La configuración de Docker Compose para desarrollo no incluye un contenedor para el backend. Spring Boot está diseñado para ejecutarse desde IntelliJ IDEA o mediante Maven Wrapper.

### Ejecutar el frontend sin Docker

```bash
cd land-sales-frontend
npm ci
npm run dev
```

### Direcciones de desarrollo

| Servicio | Dirección |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| Ruta base de la API | `http://localhost:8080/api` |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| OpenAPI YAML | `http://localhost:8080/v3/api-docs.yaml` |
| PostgreSQL desde el host | `localhost:5434` |
| pgAdmin con el perfil de herramientas | `http://localhost:5052` |

Flyway aplica las migraciones pendientes cuando inicia el backend. Después, Hibernate valida el esquema resultante mediante `ddl-auto=validate`.

Para consultar la configuración completa, los comandos para Windows, la administración de servicios y la solución de problemas, revisa la [Guía de desarrollo](development-guide.md).

## Documentación de la API

Las rutas de la API utilizan el prefijo `/api`. Las operaciones protegidas requieren un token JWT válido mediante el esquema bearer.

Los módulos documentados incluyen:

- Autenticación.
- Manzanas y lotes.
- Clientes.
- Ventas.
- Estados de cuenta.
- Pagos.
- Reportes.

Los contratos detallados de solicitudes y respuestas se generan automáticamente mediante OpenAPI.

| Recurso | Dirección |
| --- | --- |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| OpenAPI YAML | `http://localhost:8080/v3/api-docs.yaml` |

Para consultar los endpoints organizados por módulo, revisa el [Resumen de la API REST](api-overview.md).

## Pruebas y verificación

La verificación del backend incluye soporte para pruebas unitarias y de integración con JUnit, Mockito, Spring Test y Testcontainers.

```bash
cd land-sales-backend
./mvnw test
./mvnw package
```

Las verificaciones del frontend incluyen compilación de TypeScript, ESLint, validaciones con Zod y compilación de producción.

```bash
cd land-sales-frontend
npm run lint
npm run build
```

Actualmente, el frontend no define un script de pruebas automatizadas. El repositorio no afirma un porcentaje específico de cobertura ni que el sistema esté completamente listo para producción sin evidencia adicional.

## Documentación

- [README principal en inglés](../README.md)
- [Arquitectura](architecture.md)
- [Reglas de negocio](business-rules.md)
- [Diseño de base de datos](database.md)
- [Resumen de la API REST](api-overview.md)
- [Guía de desarrollo](development-guide.md)
- [Manual de usuario](user-manual.md)
- [Guía de capturas](screenshots/README.md)

## Alcance y limitaciones

- Diseñado para un negocio familiar dedicado a la venta de terrenos.
- Pensado para un número pequeño de usuarios locales de confianza.
- Permite ventas que contienen uno o varios lotes.
- Conserva condiciones de financiamiento independientes para cada lote.
- Permite pagos ordenados, completos y parciales.
- No incluye pagos en línea ni procesamiento de tarjetas.
- No incluye un portal para clientes.
- No calcula mensualidades vencidas, intereses ni recargos.
- No genera automáticamente contratos con validez legal.
- Las pruebas automatizadas del frontend y las pruebas end-to-end permanecen como trabajo futuro.
- El endurecimiento para un despliegue de producción se encuentra fuera del alcance documentado actualmente.

## Licencia

Este repositorio no incluye actualmente una licencia de código abierto.

El código fuente se publica únicamente para revisión de portafolio y evaluación técnica. No se autoriza su reutilización, redistribución, modificación ni uso comercial sin la autorización explícita de la autora.

## Autora

Desarrollado por [AngelicaGuerOl](https://github.com/AngelicaGuerOl) como un proyecto de portafolio que demuestra la aplicación del desarrollo full stack a un flujo real de negocio.
