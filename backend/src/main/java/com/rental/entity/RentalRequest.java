package com.rental.entity;

import com.rental.entity.enums.RentalStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_requests")
public class RentalRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal deposit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RentalStatus status = RentalStatus.PENDING;

    @Column(length = 6)
    private String pickupPin;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RentalRequest() {}

    public RentalRequest(Product product, User borrower, LocalDate startDate, LocalDate endDate, 
                         BigDecimal totalCost, BigDecimal deposit, String pickupPin) {
        this.product = product;
        this.borrower = borrower;
        this.startDate = startDate;
        this.endDate = endDate;
        this.totalCost = totalCost;
        this.deposit = deposit;
        this.pickupPin = pickupPin;
        this.status = RentalStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public User getBorrower() { return borrower; }
    public void setBorrower(User borrower) { this.borrower = borrower; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }

    public RentalStatus getStatus() { return status; }
    public void setStatus(RentalStatus status) { this.status = status; }

    public String getPickupPin() { return pickupPin; }
    public void setPickupPin(String pickupPin) { this.pickupPin = pickupPin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
