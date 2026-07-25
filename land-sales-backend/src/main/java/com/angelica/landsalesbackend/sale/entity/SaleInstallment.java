package com.angelica.landsalesbackend.sale.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "sale_installments")
public class SaleInstallment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "sale_lot_id") private SaleLot saleLot;
    @Column(name = "installment_number", nullable = false) private int installmentNumber;
    @Column(name = "payment_month", nullable = false) private LocalDate paymentMonth;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(name = "paid_amount", nullable = false, precision = 14, scale = 2) private BigDecimal paidAmount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SaleInstallmentStatus status;
    @Column(nullable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
    @PrePersist void prePersist() { LocalDateTime now = LocalDateTime.now(); createdAt = createdAt == null ? now : createdAt; updatedAt = updatedAt == null ? now : updatedAt; }
    @PreUpdate void preUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; } public SaleLot getSaleLot() { return saleLot; } public void setSaleLot(SaleLot v) { saleLot = v; }
    public int getInstallmentNumber() { return installmentNumber; } public void setInstallmentNumber(int v) { installmentNumber = v; }
    public LocalDate getPaymentMonth() { return paymentMonth; } public void setPaymentMonth(LocalDate v) { paymentMonth = v; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal v) { amount = v; }
    public BigDecimal getPaidAmount() { return paidAmount; } public void setPaidAmount(BigDecimal v) { paidAmount = v; }
    public SaleInstallmentStatus getStatus() { return status; } public void setStatus(SaleInstallmentStatus v) { status = v; }
}
