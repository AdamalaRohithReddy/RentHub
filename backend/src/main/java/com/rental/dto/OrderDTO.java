package com.rental.dto;

import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.entity.enums.OrderStatus;
import com.rental.service.ConditionComparisonService.ConditionComparisonResult;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class OrderDTO {

    public static class CreateOrderRequest {
        @NotNull(message = "Resource ID is required")
        private Long resourceId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        public CreateOrderRequest() {}

        public CreateOrderRequest(Long resourceId, Integer quantity) {
            this.resourceId = resourceId;
            this.quantity = quantity;
        }

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class RequestReturnRequest {
        private String returnNote;

        public RequestReturnRequest() {}
        public RequestReturnRequest(String returnNote) { this.returnNote = returnNote; }

        public String getReturnNote() { return returnNote; }
        public void setReturnNote(String returnNote) { this.returnNote = returnNote; }
    }

    public static class ReportDamageRequest {
        @NotNull(message = "Damage description is required")
        private String description;
        private Integer returnedScore;
        private List<String> detectedIssues = new ArrayList<>();

        public ReportDamageRequest() {}

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getReturnedScore() { return returnedScore; }
        public void setReturnedScore(Integer returnedScore) { this.returnedScore = returnedScore; }

        public List<String> getDetectedIssues() { return detectedIssues; }
        public void setDetectedIssues(List<String> detectedIssues) { this.detectedIssues = detectedIssues; }
    }

    public static class OrderResponse {
        private Long id;
        private Long resourceId;
        private String itemName;
        private String category;
        private String firstImageUrl;
        
        private Long customerId;
        private String customerName;
        private String customerPhone;

        private Long ownerId;
        private String ownerName;
        private String ownerPhone;

        private Integer quantity;
        private BigDecimal rentAmount;
        private String rentDurationUnit;
        private BigDecimal securityDeposit;
        private OrderStatus status;
        private String returnNote;
        private LocalDateTime returnRequestedAt;
        private LocalDateTime returnConfirmedAt;
        private LocalDateTime requestedAt;
        private LocalDateTime updatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getFirstImageUrl() { return firstImageUrl; }
        public void setFirstImageUrl(String firstImageUrl) { this.firstImageUrl = firstImageUrl; }

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

        public Long getOwnerId() { return ownerId; }
        public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

        public String getOwnerName() { return ownerName; }
        public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

        public String getOwnerPhone() { return ownerPhone; }
        public void setOwnerPhone(String ownerPhone) { this.ownerPhone = ownerPhone; }

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

    public static class ReturnInspectionResponse {
        private OrderResponse order;
        private FinalConditionScanResponse returnedScan;
        private ConditionComparisonResult comparison;

        public ReturnInspectionResponse() {}
        public ReturnInspectionResponse(OrderResponse order, FinalConditionScanResponse returnedScan, ConditionComparisonResult comparison) {
            this.order = order;
            this.returnedScan = returnedScan;
            this.comparison = comparison;
        }

        public OrderResponse getOrder() { return order; }
        public void setOrder(OrderResponse order) { this.order = order; }

        public FinalConditionScanResponse getReturnedScan() { return returnedScan; }
        public void setReturnedScan(FinalConditionScanResponse returnedScan) { this.returnedScan = returnedScan; }

        public ConditionComparisonResult getComparison() { return comparison; }
        public void setComparison(ConditionComparisonResult comparison) { this.comparison = comparison; }
    }

    public static class DamageReportResponse {
        private Long id;
        private Long orderId;
        private Long resourceId;
        private String itemName;
        private String reporterName;
        private String description;
        private Integer previousScore;
        private Integer returnedScore;
        private Integer scoreDifference;
        private String detectedIssues;
        private String status;
        private LocalDateTime reportedAt;

        public DamageReportResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }

        public Long getResourceId() { return resourceId; }
        public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

        public String getReporterName() { return reporterName; }
        public void setReporterName(String reporterName) { this.reporterName = reporterName; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getPreviousScore() { return previousScore; }
        public void setPreviousScore(Integer previousScore) { this.previousScore = previousScore; }

        public Integer getReturnedScore() { return returnedScore; }
        public void setReturnedScore(Integer returnedScore) { this.returnedScore = returnedScore; }

        public Integer getScoreDifference() { return scoreDifference; }
        public void setScoreDifference(Integer scoreDifference) { this.scoreDifference = scoreDifference; }

        public String getDetectedIssues() { return detectedIssues; }
        public void setDetectedIssues(String detectedIssues) { this.detectedIssues = detectedIssues; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getReportedAt() { return reportedAt; }
        public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }
    }
}
