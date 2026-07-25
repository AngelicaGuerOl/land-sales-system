ALTER TABLE sales DROP CONSTRAINT IF EXISTS ck_sales_status;

ALTER TABLE sales
    ADD CONSTRAINT ck_sales_status CHECK (status IN ('ACTIVE', 'PAID', 'CANCELLED'));
