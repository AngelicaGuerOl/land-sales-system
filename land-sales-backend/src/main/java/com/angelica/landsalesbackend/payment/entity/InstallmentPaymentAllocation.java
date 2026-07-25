package com.angelica.landsalesbackend.payment.entity;

import com.angelica.landsalesbackend.sale.entity.SaleInstallment;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "installment_payment_allocations", uniqueConstraints = @UniqueConstraint(name = "uk_installment_allocations_allocation_installment", columnNames = {"payment_allocation_id", "installment_id"}))
public class InstallmentPaymentAllocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "payment_allocation_id") private PaymentAllocation paymentAllocation;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "installment_id") private SaleInstallment installment;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal installmentBalanceBefore;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal installmentBalanceAfter;
    @Column(nullable = false) private LocalDateTime createdAt;
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public PaymentAllocation getPaymentAllocation() { return paymentAllocation; } public void setPaymentAllocation(PaymentAllocation v) { paymentAllocation = v; }
    public SaleInstallment getInstallment() { return installment; } public void setInstallment(SaleInstallment v) { installment = v; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal v) { amount = v; }
    public BigDecimal getInstallmentBalanceBefore() { return installmentBalanceBefore; } public void setInstallmentBalanceBefore(BigDecimal v) { installmentBalanceBefore = v; }
    public BigDecimal getInstallmentBalanceAfter() { return installmentBalanceAfter; } public void setInstallmentBalanceAfter(BigDecimal v) { installmentBalanceAfter = v; }
}
