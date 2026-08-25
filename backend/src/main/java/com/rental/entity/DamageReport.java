package com.rental.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "damage_reports", indexes = {
    @Index(name = "idx_damage_order", columnList = "order_id"),
    @Index(name = "idx_damage_resource", columnList = "resource_id"),
    @Index(name = "idx_damage_reporter", columnList = "reporter_id")
})
public class DamageReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "previous_score")
    private Integer previousScore;

    @Column(name = "returned_score")
    private Integer returnedScore;

    @Column(name = "score_difference")
    private Integer scoreDifference;

    @Column(name = "detected_issues", length = 1000)
    private String detectedIssues;

    @Column(nullable = false, length = 30)
    private String status = "REPORTED";

    @Column(name = "reported_at", nullable = false)
    private LocalDateTime reportedAt = LocalDateTime.now();

    public DamageReport() {}

    public DamageReport(Order order, Resource resource, User reporter, String description,
                        Integer previousScore, Integer returnedScore, Integer scoreDifference,
                        String detectedIssues) {
        this.order = order;
        this.resource = resource;
        this.reporter = reporter;
        this.description = description;
        this.previousScore = previousScore;
        this.returnedScore = returnedScore;
        this.scoreDifference = scoreDifference;
        this.detectedIssues = detectedIssues;
        this.status = "REPORTED";
        this.reportedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

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
