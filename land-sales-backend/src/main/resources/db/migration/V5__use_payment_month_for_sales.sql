ALTER TABLE sale_lots DROP CONSTRAINT IF EXISTS ck_sale_lots_payment_terms;
ALTER TABLE sale_installments DROP CONSTRAINT IF EXISTS ck_sale_installments_status;

UPDATE sale_installments
SET due_date = DATE_TRUNC('month', due_date)::date,
    status = CASE WHEN status IN ('PENDING', 'PARTIAL', 'PAID') THEN status ELSE 'PENDING' END;

ALTER TABLE sale_lots DROP COLUMN first_due_date;
ALTER TABLE sale_installments RENAME COLUMN due_date TO payment_month;

ALTER TABLE sale_lots
    ADD CONSTRAINT ck_sale_lots_payment_terms CHECK (
        (financed_amount = 0 AND installment_count = 0 AND installment_amount = 0 AND status = 'PAID')
        OR (financed_amount > 0 AND installment_count > 0 AND installment_amount > 0 AND status = 'ACTIVE')
    );

ALTER TABLE sale_installments
    ADD CONSTRAINT ck_sale_installments_status CHECK (status IN ('PENDING', 'PARTIAL', 'PAID')),
    ADD CONSTRAINT ck_sale_installments_payment_month_first_day
        CHECK (payment_month = DATE_TRUNC('month', payment_month)::date);

ALTER TABLE sale_installments
    ADD CONSTRAINT uk_sale_installments_payment_month UNIQUE (sale_lot_id, payment_month);

ALTER INDEX idx_sale_installments_sale_lot_due_date RENAME TO idx_sale_installments_sale_lot_payment_month;
