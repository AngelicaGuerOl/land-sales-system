package com.angelica.landsalesbackend.sale.entity;

import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true, length = 30) private String folio;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "customer_id") private Customer customer;
    @Column(name = "sale_date", nullable = false) private LocalDate saleDate;
    @Column(name = "total_agreed_price", nullable = false, precision = 14, scale = 2) private BigDecimal totalAgreedPrice;
    @Column(name = "total_down_payment", nullable = false, precision = 14, scale = 2) private BigDecimal totalDownPayment;
    @Column(name = "total_financed_amount", nullable = false, precision = 14, scale = 2) private BigDecimal totalFinancedAmount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private SaleStatus status;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by") private User createdBy;
    @Column(nullable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
    @OneToMany(mappedBy = "sale", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST) private List<SaleLot> saleLots = new ArrayList<>();

    @PrePersist void prePersist() { LocalDateTime now = LocalDateTime.now(); createdAt = createdAt == null ? now : createdAt; updatedAt = updatedAt == null ? now : updatedAt; }
    @PreUpdate void preUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; } public void setId(Long v) { id = v; }
    public String getFolio() { return folio; } public void setFolio(String v) { folio = v; }
    public Customer getCustomer() { return customer; } public void setCustomer(Customer v) { customer = v; }
    public LocalDate getSaleDate() { return saleDate; } public void setSaleDate(LocalDate v) { saleDate = v; }
    public BigDecimal getTotalAgreedPrice() { return totalAgreedPrice; } public void setTotalAgreedPrice(BigDecimal v) { totalAgreedPrice = v; }
    public BigDecimal getTotalDownPayment() { return totalDownPayment; } public void setTotalDownPayment(BigDecimal v) { totalDownPayment = v; }
    public BigDecimal getTotalFinancedAmount() { return totalFinancedAmount; } public void setTotalFinancedAmount(BigDecimal v) { totalFinancedAmount = v; }
    public SaleStatus getStatus() { return status; } public void setStatus(SaleStatus v) { status = v; }
    public User getCreatedBy() { return createdBy; } public void setCreatedBy(User v) { createdBy = v; }
    public LocalDateTime getCreatedAt() { return createdAt; } public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<SaleLot> getSaleLots() { return saleLots; }
}
