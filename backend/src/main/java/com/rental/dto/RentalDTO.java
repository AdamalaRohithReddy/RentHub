package com.rental.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class RentalDTO {

    public static class CreateRentalRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "End date is required")
        private LocalDate endDate;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    }
}
