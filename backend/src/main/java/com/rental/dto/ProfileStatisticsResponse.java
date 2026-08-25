package com.rental.dto;

public class ProfileStatisticsResponse {

    private Long productsListed;
    private Long currentlyRentedOut;
    private Long ordersMade;
    private Long activeRentals;
    private Long pendingRequests;

    public ProfileStatisticsResponse() {
        this.productsListed = 0L;
        this.currentlyRentedOut = 0L;
        this.ordersMade = 0L;
        this.activeRentals = 0L;
        this.pendingRequests = 0L;
    }

    public ProfileStatisticsResponse(Long productsListed, Long currentlyRentedOut, 
                                     Long ordersMade, Long activeRentals, Long pendingRequests) {
        this.productsListed = productsListed != null ? productsListed : 0L;
        this.currentlyRentedOut = currentlyRentedOut != null ? currentlyRentedOut : 0L;
        this.ordersMade = ordersMade != null ? ordersMade : 0L;
        this.activeRentals = activeRentals != null ? activeRentals : 0L;
        this.pendingRequests = pendingRequests != null ? pendingRequests : 0L;
    }

    public Long getProductsListed() { return productsListed; }
    public void setProductsListed(Long productsListed) { this.productsListed = productsListed; }

    public Long getCurrentlyRentedOut() { return currentlyRentedOut; }
    public void setCurrentlyRentedOut(Long currentlyRentedOut) { this.currentlyRentedOut = currentlyRentedOut; }

    public Long getOrdersMade() { return ordersMade; }
    public void setOrdersMade(Long ordersMade) { this.ordersMade = ordersMade; }

    public Long getActiveRentals() { return activeRentals; }
    public void setActiveRentals(Long activeRentals) { this.activeRentals = activeRentals; }

    public Long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(Long pendingRequests) { this.pendingRequests = pendingRequests; }
}
