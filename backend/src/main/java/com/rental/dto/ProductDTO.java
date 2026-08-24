package com.rental.dto;

import com.rental.entity.enums.ItemCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProductDTO {

    public static class CreateProductRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Price per day is required")
        private BigDecimal pricePerDay;

        private BigDecimal depositAmount = BigDecimal.ZERO;

        private ItemCondition itemCondition = ItemCondition.GOOD;

        private String location;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public BigDecimal getPricePerDay() { return pricePerDay; }
        public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

        public BigDecimal getDepositAmount() { return depositAmount; }
        public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }

        public ItemCondition getItemCondition() { return itemCondition; }
        public void setItemCondition(ItemCondition itemCondition) { this.itemCondition = itemCondition; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }
}
