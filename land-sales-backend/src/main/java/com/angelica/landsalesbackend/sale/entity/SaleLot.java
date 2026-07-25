package com.angelica.landsalesbackend.sale.entity;

import com.angelica.landsalesbackend.lot.entity.Lot;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "sale_lots")
public class SaleLot {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "sale_id") private Sale sale;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "lot_id") private Lot lot;
    @Column(name = "agreed_price", nullable = false, precision = 14, scale = 2) private BigDecimal agreedPrice;
    @Column(name = "down_payment", nullable = false, precision = 14, scale = 2) private BigDecimal downPayment;
    @Column(name = "financed_amount", nullable = false, precision = 14, scale = 2) private BigDecimal financedAmount;
    @Column(name = "installment_count", nullable = false) private int installmentCount;
    @Column(name = "installment_amount", nullable = false, precision = 14, scale = 2) private BigDecimal installmentAmount;
    @Column(name = "outstanding_balance", nullable = false, precision = 14, scale = 2) private BigDecimal outstandingBalance;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SaleLotStatus status;
    @Column(nullable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
    @OneToMany(mappedBy = "saleLot", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST) private List<SaleInstallment> installments = new ArrayList<>();
    @PrePersist void prePersist() { LocalDateTime now = LocalDateTime.now(); createdAt = createdAt == null ? now : createdAt; updatedAt = updatedAt == null ? now : updatedAt; }
    @PreUpdate void preUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; } public Sale getSale() { return sale; } public void setSale(Sale v) { sale = v; }
    public Lot getLot() { return lot; } public void setLot(Lot v) { lot = v; }
    public BigDecimal getAgreedPrice() { return agreedPrice; } public void setAgreedPrice(BigDecimal v) { agreedPrice = v; }
    public BigDecimal getDownPayment() { return downPayment; } public void setDownPayment(BigDecimal v) { downPayment = v; }
    public BigDecimal getFinancedAmount() { return financedAmount; } public void setFinancedAmount(BigDecimal v) { financedAmount = v; }
    public int getInstallmentCount() { return installmentCount; } public void setInstallmentCount(int v) { installmentCount = v; }
    public BigDecimal getInstallmentAmount() { return installmentAmount; } public void setInstallmentAmount(BigDecimal v) { installmentAmount = v; }
    public BigDecimal getOutstandingBalance() { return outstandingBalance; } public void setOutstandingBalance(BigDecimal v) { outstandingBalance = v; }
    public SaleLotStatus getStatus() { return status; } public void setStatus(SaleLotStatus v) { status = v; }
    public List<SaleInstallment> getInstallments() { return installments; }
}
