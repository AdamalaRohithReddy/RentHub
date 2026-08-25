package com.rental.entity;

import com.rental.entity.enums.OrderStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_resource", columnList = "resource_id"),
    @Index(name = "idx_order_customer", columnList = "customer_id"),
    @Index(name = "idx_order_owner", columnList = "owner_id"),
    @Index(name = "idx_order_status", columnList = "status")
})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "rent_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rentAmount;

    @Column(name = "rent_duration_unit", nullable = false, length = 30)
    private String rentDurationUnit;

    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "return_note", length = 500)
    private String returnNote;

    @Column(name = "return_requested_at")
    private LocalDateTime returnRequestedAt;

    @Column(name = "return_confirmed_at")
    private LocalDateTime returnConfirmedAt;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Order() {}

    public Order(Resource resource, User customer, User owner, Integer quantity, 
                 BigDecimal rentAmount, String rentDurationUnit, BigDecimal securityDeposit) {
        this.resource = resource;
        this.customer = customer;
        this.owner = owner;
        this.quantity = quantity;
        this.rentAmount = rentAmount;
        this.rentDurationUnit = rentDurationUnit;
        this.securityDeposit = securityDeposit != null ? securityDeposit : BigDecimal.ZERO;
        this.status = OrderStatus.PENDING;
        this.requestedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getRentAmount() { return rentAmount; }
    public void setRentAmount(BigDecimal rentAmount) { this.rentAmount = rentAmount; }

    public String getRentDurationUnit() { return rentDurationUnit; }
    public void setRentDurationUnit(String rentDurationUnit) { this.rentDurationUnit = rentDurationUnit; }

    public BigDecimal getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public String getReturnNote() { return returnNote; }
    public void setReturnNote(String returnNote) { this.returnNote = returnNote; }

    public LocalDateTime getReturnRequestedAt() { return returnRequestedAt; }
    public void setReturnRequestedAt(LocalDateTime returnRequestedAt) { this.returnRequestedAt = returnRequestedAt; }

    public LocalDateTime getReturnConfirmedAt() { return returnConfirmedAt; }
    public void setReturnConfirmedAt(LocalDateTime returnConfirmedAt) { this.returnConfirmedAt = returnConfirmedAt; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
