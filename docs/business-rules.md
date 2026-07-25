# Business Rules

[Back to the main README](../README.md)

This document describes the business rules confirmed in the backend services, DTOs, entities, and database constraints.

## Customers

- `fullName` and the primary `phone` are required.
- `alternatePhone` and `address` are optional.
- Text input is trimmed, and empty optional values are stored as `null`.
- Customers can be active or inactive; deactivation preserves the record and its historical relationships.
- Phone numbers are not unique, so multiple customers may share the same number.
- Newly created customers start as active.

## Blocks and Lots

- Block codes are normalized to uppercase and must be unique.
- A block stores its planned lot capacity separately from the number of registered lots.
- The `lotification_id` relationship is nullable for block records. The dashboard and lot query flow can operate without an active lotification; the optional relationship and filter remain for compatibility.
- A lot belongs to a block.
- When the request does not provide a lot code, the backend generates one from the block code and lot number.
- Lot area, dimensions, and price cannot be negative.
- New lots start with the `AVAILABLE` status.
- Manual lot status changes are limited to:

```text
AVAILABLE ↔ BLOCKED
```

- A physical lot becomes `SOLD` during sale registration.
- A sold lot remains physically marked as `SOLD` after its financing has been fully paid.
- Structural data cannot be modified after a lot has been sold.
- Lot price changes require a reason and are preserved in `lot_price_history`.
- Blocks containing registered lots cannot be deleted.
- Bulk lot generation validates the complete range and all conflicts before inserting any records.

## Sales

- The customer selected for a sale must exist and be active.
- A sale must contain at least one lot.
- Repeated lot IDs are not allowed within the same sale.
- Every selected lot must exist and have the `AVAILABLE` status.
- A sale may contain one or multiple lots.
- Each lot preserves its own:
  - Agreed price.
  - Down payment.
  - Financed amount.
  - Installment count.
  - Installment amount.
- The backend calculates all authoritative financial totals.
- Totals calculated or submitted by the frontend are not treated as authoritative.
- The agreed price may differ from the lot's current listed price.
- A full down payment is allowed. In that case, the sale lot is marked as `PAID` and does not generate installments.
- Financing generates monthly installments beginning in the month after the sale date.
- Sale creation is transactional.
- Selected lots are locked during sale registration to prevent conflicting concurrent sales.
- Supported sale states are:
  - `ACTIVE`
  - `PAID`
  - `CANCELLED`
- `CANCELLED` exists in the persistence model, but the current documented API does not expose a user-facing sale-cancellation operation.
- Sale numbers are consecutive positive integers without prefixes or leading zeros.

## Financing and Installments

- The financed amount is calculated as:

```text
financedAmount = agreedPrice - downPayment
```

- The down payment cannot be negative.
- The down payment cannot exceed the agreed price.
- A financed lot requires a positive installment count.
- A lot paid in full through the down payment generates zero installments.
- `paymentMonth` is normalized to the first day of its corresponding month.
- `paymentMonth` represents a payment period, not a payment deadline.
- Supported installment states are:
  - `PENDING`
  - `PARTIAL`
  - `PAID`
- Installments do not automatically become overdue.
- The system does not calculate:
  - Interest.
  - Late fees.
  - Penalties.
  - Surcharges.
- Installment amounts use decimal arithmetic.
- When equal division produces a rounding difference, the final installment absorbs the difference so the installment total exactly matches the financed amount.

## Payments

- Payment numbers are generated through `payment_number_seq`.
- Payment numbers are consecutive positive integers without prefixes or leading zeros.
- Supported payment methods are:
  - `CASH`
  - `TRANSFER`
- A payment must contain at least one allocation.
- The total payment amount must be greater than zero.
- One payment may cover multiple financed lots and multiple installments.
- Every allocation must belong to the selected customer and financed sale lot.
- A payment cannot exceed the outstanding balance of an installment or financed lot.
- Installments must be paid in chronological order.
- A later installment cannot be paid while an earlier installment still has an outstanding balance.
- Selected installments must be consecutive; gaps are not allowed.
- Only the final selected installment may receive a partial payment.
- All earlier selected installments must be paid in full.
- Payment allocation records preserve:
  - The balance before payment.
  - The applied amount.
  - The balance after payment.
- Historical allocation values are used to reproduce payment details and printable receipts.
- Payment registration updates the payment, financed lots, installments, and sale states in one transaction.
- Pessimistic locks protect payment registration from conflicting concurrent operations.
- The backend generates the payment date using the configured system time zone.
- A payment date cannot be earlier than the associated sale date.

## Account Statements and Reports

- Account statements include customers with registered sales.
- Account statements expose balances by financed lot and installment.
- Inactive customers may continue to appear in account statements because their historical obligations are preserved.
- Reports require an inclusive `dateFrom` and `dateTo` range.
- `dateFrom` cannot be later than `dateTo`.
- Report collection totals include:
  - Down payments from sales registered during the selected period.
  - Subsequent payments registered during the selected period.
- A down payment is not counted again as a regular payment.
- Report summaries exclude cancelled sales where the corresponding query applies the cancelled-status filter.

## User Interface Terminology

The application displays the following Spanish labels for internal states:

- `PENDING`: **Pendiente**
- `PARTIAL`: **Parcialmente pagada**
- `PAID`: **Pagada** for an installment
- `PAID`: **Liquidada** for a fully paid sale or financed lot
- `ACTIVE`: **En pagos** for a sale with an outstanding balance

## Related Documentation

- [Main README](../README.md)
- [Architecture](architecture.md)
- [Database Design](database.md)
- [REST API Overview](api-overview.md)
- [Development Guide](development-guide.md)
- [User Manual](user-manual.md)
