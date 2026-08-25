package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.rental.entity.enums.ConditionStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_condition_scans", indexes = {
    @Index(name = "idx_condition_scan_resource", columnList = "resource_id")
})
public class ProductConditionScan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false, unique = true)
    @JsonBackReference
    private Resource resource;

    @Column(name = "condition_score", nullable = false)
    private Integer conditionScore; // 0 - 100

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status", nullable = false, length = 30)
    private ConditionStatus conditionStatus; // EXCELLENT, GOOD, FAIR, POOR

    @Column(name = "confidence_score", nullable = false)
    private Integer confidenceScore; // e.g. 88 (88%)

    @Column(name = "has_damage", nullable = false)
    private Boolean hasDamage = false;

    @Column(name = "damage_details", length = 500)
    private String damageDetails;

    @Column(name = "scan_result", length = 1000)
    private String scanResult;

    @Column(name = "limitations", length = 1000)
    private String limitations;

    @Column(name = "is_vendor_verified", nullable = false)
    private Boolean isVendorVerified = true;

    @Column(name = "scanned_at", nullable = false, updatable = false)
    private LocalDateTime scannedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "conditionScan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ConditionIssue> issues = new ArrayList<>();

    public ProductConditionScan() {}

    public ProductConditionScan(Resource resource, Integer conditionScore, ConditionStatus conditionStatus,
                                Integer confidenceScore, Boolean hasDamage, String damageDetails, 
                                String scanResult, String limitations) {
        this.resource = resource;
        this.conditionScore = conditionScore;
        this.conditionStatus = conditionStatus;
        this.confidenceScore = confidenceScore;
        this.hasDamage = hasDamage;
        this.damageDetails = damageDetails;
        this.scanResult = scanResult;
        this.limitations = limitations;
        this.isVendorVerified = true;
        this.scannedAt = LocalDateTime.now();
    }

    public void addIssue(ConditionIssue issue) {
        issues.add(issue);
        issue.setConditionScan(this);
    }

    public void removeIssue(ConditionIssue issue) {
        issues.remove(issue);
        issue.setConditionScan(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public Integer getConditionScore() { return conditionScore; }
    public void setConditionScore(Integer conditionScore) { this.conditionScore = conditionScore; }

    public ConditionStatus getConditionStatus() { return conditionStatus; }
    public void setConditionStatus(ConditionStatus conditionStatus) { this.conditionStatus = conditionStatus; }

    public Integer getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

    public Boolean getHasDamage() { return hasDamage; }
    public void setHasDamage(Boolean hasDamage) { this.hasDamage = hasDamage; }

    public String getDamageDetails() { return damageDetails; }
    public void setDamageDetails(String damageDetails) { this.damageDetails = damageDetails; }

    public String getScanResult() { return scanResult; }
    public void setScanResult(String scanResult) { this.scanResult = scanResult; }

    public String getLimitations() { return limitations; }
    public void setLimitations(String limitations) { this.limitations = limitations; }

    public Boolean getIsVendorVerified() { return isVendorVerified; }
    public void setIsVendorVerified(Boolean isVendorVerified) { this.isVendorVerified = isVendorVerified; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }

    public List<ConditionIssue> getIssues() { return issues; }
    public void setImages(List<ConditionIssue> issues) { this.issues = issues; }
}
