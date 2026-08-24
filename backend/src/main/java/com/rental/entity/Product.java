package com.rental.entity;

import com.rental.entity.enums.ItemCondition;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category_id"),
    @Index(name = "idx_product_owner", columnList = "owner_id")
})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ItemCondition itemCondition = ItemCondition.GOOD;

    @Column(length = 150)
    private String location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private Boolean isAvailable = true;

    @Column(length = 255)
    private String imageUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Product() {}

    public Product(String title, String description, Category category, BigDecimal pricePerDay, 
                   BigDecimal depositAmount, ItemCondition itemCondition, String location, User owner, String imageUrl) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.pricePerDay = pricePerDay;
        this.depositAmount = depositAmount;
        this.itemCondition = itemCondition;
        this.location = location;
        this.owner = owner;
        this.imageUrl = imageUrl;
        this.isAvailable = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }

    public ItemCondition getItemCondition() { return itemCondition; }
    public void setItemCondition(ItemCondition itemCondition) { this.itemCondition = itemCondition; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean available) { isAvailable = available; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
