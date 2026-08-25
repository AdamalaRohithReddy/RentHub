package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.rental.entity.enums.ConditionIssueType;
import com.rental.entity.enums.IssueSeverity;
import jakarta.persistence.*;

@Entity
@Table(name = "condition_issue_history", indexes = {
    @Index(name = "idx_issue_history", columnList = "condition_history_id")
})
public class ConditionIssueHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "condition_history_id", nullable = false)
    @JsonBackReference
    private ProductConditionHistory conditionHistory;

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type", nullable = false, length = 50)
    private ConditionIssueType issueType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private IssueSeverity severity;

    @Column(nullable = false, length = 255)
    private String description;

    public ConditionIssueHistory() {}

    public ConditionIssueHistory(ConditionIssueType issueType, IssueSeverity severity, String description) {
        this.issueType = issueType;
        this.severity = severity;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductConditionHistory getConditionHistory() { return conditionHistory; }
    public void setConditionHistory(ProductConditionHistory conditionHistory) { this.conditionHistory = conditionHistory; }

    public ConditionIssueType getIssueType() { return issueType; }
    public void setIssueType(ConditionIssueType issueType) { this.issueType = issueType; }

    public IssueSeverity getSeverity() { return severity; }
    public void setSeverity(IssueSeverity severity) { this.severity = severity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
