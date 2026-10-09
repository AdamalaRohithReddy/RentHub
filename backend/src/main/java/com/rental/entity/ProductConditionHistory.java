package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rental.entity.enums.ConditionScanType;
import com.rental.entity.enums.ConditionStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_condition_history", indexes = {
    @Index(name = "idx_history_resource", columnList = "resource_id"),
    @Index(name = "idx_history_order", columnList = "order_id"),
    @Index(name = "idx_history_scan_type", columnList = "scan_type")
})
public class ProductConditionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "owner", "images", "conditionScan"})
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "resource", "customer", "owner"})
    private Order order;

    @Column(name = "condition_score", nullable = false)
    private Integer conditionScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status", nullable = false, length = 30)
    private ConditionStatus conditionStatus;

    @Column(name = "confidence_score", nullable = false)
    private Integer confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "scan_type", nullable = false, length = 30)
    private ConditionScanType scanType;

    @Column(name = "scan_result", length = 1000)
    private String scanResult;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessor_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "aadhaarCardImageUrl", "panCardImageUrl"})
    private User assessor;

    @Column(name = "is_manual_override")
    private Boolean isManualOverride = false;

    @Column(name = "owner_notes", length = 1000)
    private String ownerNotes;

    @Column(name = "scanned_at", nullable = false)
    private LocalDateTime scannedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "conditionHistory", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ConditionIssueHistory> issues = new ArrayList<>();

    public ProductConditionHistory() {}

    public ProductConditionHistory(Resource resource, Order order, Integer conditionScore,
                                   ConditionStatus conditionStatus, Integer confidenceScore,
                                   ConditionScanType scanType, String scanResult) {
        this.resource = resource;
        this.order = order;
        this.conditionScore = conditionScore;
        this.conditionStatus = conditionStatus;
        this.confidenceScore = confidenceScore;
        this.scanType = scanType;
        this.scanResult = scanResult;
        this.scannedAt = LocalDateTime.now();
    }

    public ProductConditionHistory(Resource resource, Order order, Integer conditionScore,
                                   ConditionStatus conditionStatus, Integer confidenceScore,
                                   ConditionScanType scanType, String scanResult,
                                   String imageUrls, User assessor, Boolean isManualOverride, String ownerNotes) {
        this(resource, order, conditionScore, conditionStatus, confidenceScore, scanType, scanResult);
        this.imageUrls = imageUrls;
        this.assessor = assessor;
        this.isManualOverride = isManualOverride != null ? isManualOverride : false;
        this.ownerNotes = ownerNotes;
    }

    public void addIssue(ConditionIssueHistory issue) {
        issues.add(issue);
        issue.setConditionHistory(this);
    }

    // Helper getters for frontend / JSON serialization
    @Transient
    public Long getResourceId() {
        return resource != null ? resource.getId() : null;
    }

    @Transient
    public Long getOrderId() {
        return order != null ? order.getId() : null;
    }

    @Transient
    public String getAssessorName() {
        return assessor != null ? assessor.getFullName() : null;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Integer getConditionScore() { return conditionScore; }
    public void setConditionScore(Integer conditionScore) { this.conditionScore = conditionScore; }

    public ConditionStatus getConditionStatus() { return conditionStatus; }
    public void setConditionStatus(ConditionStatus conditionStatus) { this.conditionStatus = conditionStatus; }

    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

    public ConditionScanType getScanType() { return scanType; }
    public void setScanType(ConditionScanType scanType) { this.scanType = scanType; }

    public String getScanResult() { return scanResult; }
    public void setScanResult(String scanResult) { this.scanResult = scanResult; }

    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }

    public User getAssessor() { return assessor; }
    public void setAssessor(User assessor) { this.assessor = assessor; }

    public Boolean getIsManualOverride() { return isManualOverride; }
    public void setIsManualOverride(Boolean isManualOverride) { this.isManualOverride = isManualOverride; }

    public String getOwnerNotes() { return ownerNotes; }
    public void setOwnerNotes(String ownerNotes) { this.ownerNotes = ownerNotes; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }

    public List<ConditionIssueHistory> getIssues() { return issues; }
    public void setIssues(List<ConditionIssueHistory> issues) { this.issues = issues; }
}
