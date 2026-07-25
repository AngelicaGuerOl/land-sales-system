# REST API Overview

[Back to the main README](../README.md)

All application API routes use the `/api` prefix.

The login endpoint is public. Other documented application endpoints require a valid JWT bearer token:

```http
Authorization: Bearer <token>
```

The backend controllers and DTOs define the exact request and response contracts. Springdoc generates the complete OpenAPI specification and Swagger UI from those contracts.

## Authentication

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Public | Authenticate with username and password and receive a JWT token. |
| `GET` | `/api/auth/me` | Bearer JWT | Return the authenticated user. |

## Blocks and Lots

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/blocks` | Bearer JWT | List blocks. The optional `lotificationId` parameter remains available as a compatibility filter. |
| `GET` | `/api/blocks/{id}` | Bearer JWT | Return one block by ID. |
| `POST` | `/api/blocks` | Bearer JWT | Create a block. |
| `PUT` | `/api/blocks/{id}` | Bearer JWT | Update a block. |
| `DELETE` | `/api/blocks/{id}` | Bearer JWT | Delete a block when it does not contain registered lots. |
| `POST` | `/api/blocks/{blockId}/lots/bulk` | Bearer JWT | Generate a validated range of lots in one transaction. |
| `GET` | `/api/lots` | Bearer JWT | List lots with optional block, status, search, and compatibility lotification filters. |
| `GET` | `/api/lots/{id}` | Bearer JWT | Return one lot by ID. |
| `POST` | `/api/lots` | Bearer JWT | Register one lot. |
| `PUT` | `/api/lots/{id}` | Bearer JWT | Update an editable lot. |
| `PATCH` | `/api/lots/{id}/status` | Bearer JWT | Change a lot between the `AVAILABLE` and `BLOCKED` states. |
| `GET` | `/api/lots/{id}/price-history` | Bearer JWT | Return the price-change history of a lot. |

## Customers

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/customers` | Bearer JWT | Return a paginated customer list with optional `page`, `size`, `search`, and `active` parameters. |
| `GET` | `/api/customers/{id}` | Bearer JWT | Return one customer by ID. |
| `POST` | `/api/customers` | Bearer JWT | Create an active customer. |
| `PUT` | `/api/customers/{id}` | Bearer JWT | Update customer contact information. |
| `PATCH` | `/api/customers/{id}/status` | Bearer JWT | Activate or deactivate a customer. |

## Sales

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/sales` | Bearer JWT | Create a transactional sale containing one or multiple available lots. |
| `GET` | `/api/sales` | Bearer JWT | Return paginated sale history with optional search, status, and date filters. |
| `GET` | `/api/sales/{id}` | Bearer JWT | Return sale details, per-lot financing conditions, and monthly installments. |

Sale registration calculates authoritative financial totals in the backend and locks the selected lots to protect against conflicting concurrent sales.

## Account Statements

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/account-statements/customers` | Bearer JWT | Return a paginated list of customers with sales and account totals. Supports `page`, `size`, and `search`. |
| `GET` | `/api/account-statements/customers/{customerId}` | Bearer JWT | Return the customer's sales, financed lot balances, and installments. |

## Payments

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/payments` | Bearer JWT | Register a payment and allocate it to ordered installments from one or multiple financed lots. |
| `GET` | `/api/payments` | Bearer JWT | Return paginated payment history with optional search, payment method, and date filters. |
| `GET` | `/api/payments/{id}` | Bearer JWT | Return payment allocations and historical balances. |

Payment registration is transactional and preserves the balances before and after each allocation.

## Reports

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/reports/summary` | Bearer JWT | Return the general report for the required inclusive `dateFrom` and `dateTo` parameters in `YYYY-MM-DD` format. |

## Compatibility Endpoints

The following endpoints remain available for legacy or reference lotification data.

| Method | Path | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/lotifications` | Bearer JWT | List legacy or reference lotification records. |
| `GET` | `/api/lotifications/{id}/map` | Bearer JWT | Return legacy map data for a lotification. |

The current frontend can query the dashboard and lot workflows without requiring an active lotification record. Blocks can also be created without a lotification because the database relationship is nullable. The optional `lotificationId` filter remains available for compatibility.

## Error Handling

The backend uses feature-specific exceptions and a global exception handler to return consistent HTTP error responses.

| Status | Meaning |
| --- | --- |
| `400 Bad Request` | Invalid request fields, parameters, date ranges, or business validation. |
| `401 Unauthorized` | Missing, invalid, or expired authentication. |
| `404 Not Found` | The requested resource does not exist. |
| `409 Conflict` | The operation conflicts with the current business state, availability, or financial balance. |

Error responses follow the shared exception-handler contract. JPA entities and persistence implementation details are not exposed directly.

## OpenAPI and Swagger UI

The backend uses `springdoc-openapi-starter-webmvc-ui` to generate the API specification and interactive documentation.

After starting the backend, the following resources are available:

| Resource | URL |
| --- | --- |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |
| OpenAPI YAML | `http://localhost:8080/v3/api-docs.yaml` |

### Authenticate in Swagger UI

1. Open Swagger UI.
2. Execute `POST /api/auth/login`.
3. Copy the JWT returned by the login request.
4. Select **Authorize**.
5. Enter the token in the bearer authentication field.
6. Execute the protected endpoint.

Swagger UI documents the generated request and response contracts, but it does not replace backend authentication, authorization, or business validation.

## Related Documentation

- [Main README](../README.md)
- [Architecture](architecture.md)
- [Business Rules](business-rules.md)
- [Database Design](database.md)
- [Development Guide](development-guide.md)
- [User Manual](user-manual.md)
