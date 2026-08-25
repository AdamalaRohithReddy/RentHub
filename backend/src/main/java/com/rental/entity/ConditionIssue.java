package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.rental.entity.enums.ConditionIssueType;
import com.rental.entity.enums.IssueSeverity;
import jakarta.persistence.*;

@Entity
@Table(name = "condition_issues", indexes = {
    @Index(name = "idx_issue_scan", columnList = "condition_scan_id")
})
public class ConditionIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condition_scan_id", nullable = false)
    @JsonBackReference
    private ProductConditionScan conditionScan;

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", nullable = false, length = 50)
    private ConditionIssueType issueType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IssueSeverity severity;

    @Column(nullable = false, length = 255)
    private String description;

    public ConditionIssue() {}

    public ConditionIssue(ConditionIssueType issueType, IssueSeverity severity, String description) {
        this.issueType = issueType;
        this.severity = severity;
        this.description = description;
    }

    public ConditionIssue(ProductConditionScan conditionScan, ConditionIssueType issueType, 
                          IssueSeverity severity, String description) {
        this.conditionScan = conditionScan;
        this.issueType = issueType;
        this.severity = severity;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductConditionScan getConditionScan() { return conditionScan; }
    public void setConditionScan(ProductConditionScan conditionScan) { this.conditionScan = conditionScan; }

    public ConditionIssueType getIssueType() { return issueType; }
    public void setIssueType(ConditionIssueType issueType) { this.issueType = issueType; }

    public IssueSeverity getSeverity() { return severity; }
    public void setSeverity(IssueSeverity severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
