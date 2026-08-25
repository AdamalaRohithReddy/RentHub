package com.rental.dto;

import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ResourceDTO {

    public static class ResourceResponse {
        private Long id;
        private Long ownerId;
        private String ownerName;
        private String ownerPhone;
        private String itemName;
        private String category;
        private String description;
        private BigDecimal rentAmount;
        private String rentDurationUnit;
        private BigDecimal securityDeposit;
        private Integer totalQuantity;
        private Integer availableQuantity;
        private Integer rentedQuantity;
        private LocalDate availableFrom;
        private LocalDate availableUntil;
        private String pickupMethod;
        private String pickupLocation;
        private String pickupInstructions;
        private String returnInstructions;
        private String status;
        private LocalDateTime createdAt;
        private List<ImageResponse> images;
        private FinalConditionScanResponse conditionScan;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getOwnerId() { return ownerId; }
        public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

        public String getOwnerPhone() { return ownerPhone; }
        public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

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

        public List<ImageResponse> getImages() { return images; }
        public void setImages(List<ImageResponse> images) { this.images = images; }

        public FinalConditionScanResponse getConditionScan() { return conditionScan; }
        public void setConditionScan(FinalConditionScanResponse conditionScan) { this.conditionScan = conditionScan; }
    }

    public static class UpdateResourceRequest {
        private String itemName;
        private String category;
        private String description;
        private BigDecimal rentAmount;
        private String rentDurationUnit;
        private BigDecimal securityDeposit;
        private Integer totalQuantity;
        private String status;
        private String pickupMethod;
        private String pickupLocation;
        private String pickupInstructions;
        private String returnInstructions;

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

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getPickupMethod() { return pickupMethod; }
        public void setPickupMethod(String pickupMethod) { this.pickupMethod = pickupMethod; }

        public String getPickupLocation() { return pickupLocation; }
        public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }

        public String getPickupInstructions() { return pickupInstructions; }
        public void setPickupInstructions(String pickupInstructions) { this.pickupInstructions = pickupInstructions; }

        public String getReturnInstructions() { return returnInstructions; }
        public void setReturnInstructions(String returnInstructions) { this.returnInstructions = returnInstructions; }
    }

    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        private String fileName;

        public ImageResponse(Long id, String imageUrl, String fileName) {
            this.id = id;
            this.imageUrl = imageUrl;
            this.fileName = fileName;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
    }
}
