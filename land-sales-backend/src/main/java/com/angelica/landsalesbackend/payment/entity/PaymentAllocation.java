package com.angelica.landsalesbackend.payment.entity;

import com.angelica.landsalesbackend.sale.entity.SaleLot;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_allocations", uniqueConstraints = @UniqueConstraint(name = "uk_payment_allocations_payment_lot", columnNames = {"payment_id", "sale_lot_id"}))
public class PaymentAllocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "payment_id") private Payment payment;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "sale_lot_id") private SaleLot saleLot;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal amount;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal balanceBefore;
    @Column(nullable = false, precision = 14, scale = 2) private BigDecimal balanceAfter;
    @Column(nullable = false) private LocalDateTime createdAt;
    @OneToMany(mappedBy = "paymentAllocation", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY) private List<InstallmentPaymentAllocation> installments = new ArrayList<>();
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public Payment getPayment() { return payment; } public void setPayment(Payment v) { payment = v; }
    public SaleLot getSaleLot() { return saleLot; } public void setSaleLot(SaleLot v) { saleLot = v; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal v) { amount = v; }
    public BigDecimal getBalanceBefore() { return balanceBefore; } public void setBalanceBefore(BigDecimal v) { balanceBefore = v; }
    public BigDecimal getBalanceAfter() { return balanceAfter; } public void setBalanceAfter(BigDecimal v) { balanceAfter = v; }
    public List<InstallmentPaymentAllocation> getInstallments() { return installments; }
}
