package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resources", indexes = {
    @Index(name = "idx_resource_owner", columnList = "owner_id"),
    @Index(name = "idx_resource_category", columnList = "category"),
    @Index(name = "idx_resource_status", columnList = "status")
})
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "item_name", nullable = false, length = 150)
    private String itemName;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "rent_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rentAmount;

    @Column(name = "rent_duration_unit", nullable = false, length = 30)
    private String rentDurationUnit; // "Per Hour", "Per Day", "Per Week"

    @Column(name = "security_deposit", precision = 10, scale = 2)
    private BigDecimal securityDeposit = BigDecimal.ZERO;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity = 1;

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity = 1;

    @Column(name = "rented_quantity", nullable = false)
    private Integer rentedQuantity = 0;

    @Column(name = "available_from", nullable = false)
    private LocalDate availableFrom;

    @Column(name = "available_until", nullable = false)
    private LocalDate availableUntil;

    @Column(name = "pickup_method", nullable = false, length = 100)
    private String pickupMethod;

    @Column(name = "pickup_location", nullable = false, length = 150)
    private String pickupLocation;

    @Column(name = "pickup_instructions", length = 500)
    private String pickupInstructions;

    @Column(name = "return_instructions", length = 500)
    private String returnInstructions;

    @Column(nullable = false, length = 30)
    private String status = "AVAILABLE"; // "AVAILABLE", "PARTIALLY_RENTED", "FULLY_RENTED", "UNAVAILABLE", "OUT_OF_STOCK"

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ResourceImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private ProductConditionScan conditionScan;

    public Resource() {}

    public Resource(User owner, String itemName, String category, String description,
                    BigDecimal rentAmount, String rentDurationUnit, BigDecimal securityDeposit,
                    Integer availableQuantity, LocalDate availableFrom, LocalDate availableUntil,
                    String pickupMethod, String pickupLocation) {
        this.owner = owner;
        this.itemName = itemName;
        this.category = category;
        this.description = description;
        this.rentAmount = rentAmount;
        this.rentDurationUnit = rentDurationUnit;
        this.securityDeposit = securityDeposit != null ? securityDeposit : BigDecimal.ZERO;
        this.totalQuantity = availableQuantity != null ? availableQuantity : 1;
        this.availableQuantity = availableQuantity != null ? availableQuantity : 1;
        this.rentedQuantity = 0;
        this.availableFrom = availableFrom;
        this.availableUntil = availableUntil;
        this.pickupMethod = pickupMethod;
        this.pickupLocation = pickupLocation;
        this.status = "AVAILABLE";
        this.createdAt = LocalDateTime.now();
    }

    public void addImage(ResourceImage image) {
        images.add(image);
        image.setResource(this);
    }

    public void removeImage(ResourceImage image) {
        images.remove(image);
        image.setResource(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getRentAmount() { return rentAmount; }
    public void setRentAmount(BigDecimal rentAmount) { this.rentAmount = rentAmount; }

    public String getRentDurationUnit() { return rentDurationUnit; }
    public void setRentDurationUnit(String rentDurationUnit) { this.rentDurationUnit = rentDurationUnit; }

    public BigDecimal getSecurityDeposit() { return securityDeposit; }
    public void setSecurityDeposit(BigDecimal securityDeposit) { this.securityDeposit = securityDeposit; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Integer getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(Integer availableQuantity) { this.availableQuantity = availableQuantity; }

    public Integer getRentedQuantity() { return rentedQuantity; }
    public void setRentedQuantity(Integer rentedQuantity) { this.rentedQuantity = rentedQuantity; }

    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }

    public LocalDate getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDate availableUntil) { this.availableUntil = availableUntil; }

    public String getPickupMethod() { return pickupMethod; }
    public void setPickupMethod(String pickupMethod) { this.pickupMethod = pickupMethod; }

    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

    public String getPickupInstructions() { return pickupInstructions; }
    public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }

    public String getReturnInstructions() { return returnInstructions; }
    public void setReturnInstructions(String returnInstructions) { this.returnInstructions = returnInstructions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ResourceImage> getImages() { return images; }
    public void setImages(List<ResourceImage> images) { this.images = images; }

    public ProductConditionScan getConditionScan() { return conditionScan; }
    public void setConditionScan(ProductConditionScan conditionScan) { this.conditionScan = conditionScan; }
}
