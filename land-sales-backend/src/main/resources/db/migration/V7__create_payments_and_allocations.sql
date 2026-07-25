CREATE SEQUENCE payment_number_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    payment_number BIGINT NOT NULL DEFAULT nextval('payment_number_seq'),
    customer_id BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    total_amount NUMERIC(14, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    reference VARCHAR(100),
    received_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_payments_number UNIQUE (payment_number),
    CONSTRAINT fk_payments_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payments_received_by FOREIGN KEY (received_by) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT ck_payments_number_positive CHECK (payment_number > 0),
    CONSTRAINT ck_payments_total_positive CHECK (total_amount > 0),
    CONSTRAINT ck_payments_method CHECK (payment_method IN ('CASH', 'TRANSFER'))
);

CREATE TABLE payment_allocations (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL,
    sale_lot_id BIGINT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    balance_before NUMERIC(14, 2) NOT NULL,
    balance_after NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_allocations_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_payment_allocations_sale_lot FOREIGN KEY (sale_lot_id) REFERENCES sale_lots (id) ON DELETE RESTRICT,
    CONSTRAINT uk_payment_allocations_payment_lot UNIQUE (payment_id, sale_lot_id),
    CONSTRAINT ck_payment_allocations_amount_positive CHECK (amount > 0),
    CONSTRAINT ck_payment_allocations_balance_before_non_negative CHECK (balance_before >= 0),
    CONSTRAINT ck_payment_allocations_balance_after_non_negative CHECK (balance_after >= 0),
    CONSTRAINT ck_payment_allocations_balance_formula CHECK (balance_after = balance_before - amount)
);

CREATE TABLE installment_payment_allocations (
    id BIGSERIAL PRIMARY KEY,
    payment_allocation_id BIGINT NOT NULL,
    installment_id BIGINT NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    installment_balance_before NUMERIC(14, 2) NOT NULL,
    installment_balance_after NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_installment_allocations_payment_allocation FOREIGN KEY (payment_allocation_id) REFERENCES payment_allocations (id) ON DELETE RESTRICT,
    CONSTRAINT fk_installment_allocations_installment FOREIGN KEY (installment_id) REFERENCES sale_installments (id) ON DELETE RESTRICT,
    CONSTRAINT uk_installment_allocations_allocation_installment UNIQUE (payment_allocation_id, installment_id),
    CONSTRAINT ck_installment_allocations_amount_positive CHECK (amount > 0),
    CONSTRAINT ck_installment_allocations_before_non_negative CHECK (installment_balance_before >= 0),
    CONSTRAINT ck_installment_allocations_after_non_negative CHECK (installment_balance_after >= 0),
    CONSTRAINT ck_installment_allocations_balance_formula CHECK (installment_balance_after = installment_balance_before - amount)
);

CREATE INDEX idx_payments_customer ON payments (customer_id);
CREATE INDEX idx_payments_date ON payments (payment_date);
CREATE INDEX idx_payment_allocations_sale_lot ON payment_allocations (sale_lot_id);
CREATE INDEX idx_installment_allocations_installment ON installment_payment_allocations (installment_id);
