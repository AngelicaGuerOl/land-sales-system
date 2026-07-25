package com.angelica.landsalesbackend.payment.entity;

import com.angelica.landsalesbackend.customer.entity.Customer;
import com.angelica.landsalesbackend.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payments")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "payment_number", nullable = false, unique = true) private Long paymentNumber;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "customer_id") private Customer customer;
    @Column(name = "payment_date", nullable = false) private LocalDate paymentDate;
    @Column(name = "total_amount", nullable = false, precision = 14, scale = 2) private BigDecimal totalAmount;
    @Enumerated(EnumType.STRING) @Column(name = "payment_method", nullable = false, length = 20) private PaymentMethod paymentMethod;
    @Column(length = 100) private String reference;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "received_by") private User receivedBy;
    @Column(nullable = false) private LocalDateTime createdAt;
    @OneToMany(mappedBy = "payment", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY) private List<PaymentAllocation> allocations = new ArrayList<>();
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
    public Long getId() { return id; } public Long getPaymentNumber() { return paymentNumber; } public void setPaymentNumber(Long v) { paymentNumber = v; }
    public Customer getCustomer() { return customer; } public void setCustomer(Customer v) { customer = v; }
    public LocalDate getPaymentDate() { return paymentDate; } public void setPaymentDate(LocalDate v) { paymentDate = v; }
    public BigDecimal getTotalAmount() { return totalAmount; } public void setTotalAmount(BigDecimal v) { totalAmount = v; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; } public void setPaymentMethod(PaymentMethod v) { paymentMethod = v; }
    public String getReference() { return reference; } public void setReference(String v) { reference = v; }
    public User getReceivedBy() { return receivedBy; } public void setReceivedBy(User v) { receivedBy = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<PaymentAllocation> getAllocations() { return allocations; }
}
