package com.rental.dto;

import com.rental.entity.enums.ConditionIssueType;
import com.rental.entity.enums.ConditionStatus;
import com.rental.entity.enums.IssueSeverity;

import java.util.ArrayList;
import java.util.List;

public class ConditionScanDTO {

    public static class ConditionIssueResponse {
        private ConditionIssueType issueType;
        private IssueSeverity severity;
        private String description;

        public ConditionIssueResponse() {}

        public ConditionIssueResponse(ConditionIssueType issueType, IssueSeverity severity, String description) {
            this.issueType = issueType;
            this.severity = severity;
            this.description = description;
        }

        public ConditionIssueType getIssueType() { return issueType; }
        public void setIssueType(ConditionIssueType issueType) { this.issueType = issueType; }

        public IssueSeverity getSeverity() { return severity; }
        public void setSeverity(IssueSeverity severity) { this.severity = severity; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class PhotoScanResponse {
        private String imageQuality;   // "GOOD", "FAIR", "POOR"
        private Integer qualityScore;  // 0 - 100
        private Boolean productDetected;
        private Integer conditionScore; // 0 - 100
        private List<ConditionIssueResponse> issues = new ArrayList<>();
        private List<String> passedChecks = new ArrayList<>();
        private List<String> qualityFeedback = new ArrayList<>();
        private String scanStatus;      // "SUCCESS", "POOR_QUALITY", "FAILED"

        public PhotoScanResponse() {}

        public String getImageQuality() { return imageQuality; }
        public void setImageQuality(String imageQuality) { this.imageQuality = imageQuality; }

        public Integer getQualityScore() { return qualityScore; }
        public void setQualityScore(Integer qualityScore) { this.qualityScore = qualityScore; }

        public Boolean getProductDetected() { return productDetected; }
        public void setProductDetected(Boolean productDetected) { this.productDetected = productDetected; }

        public Integer getConditionScore() { return conditionScore; }
        public void setConditionScore(Integer conditionScore) { this.conditionScore = conditionScore; }

        public List<ConditionIssueResponse> getIssues() { return issues; }
        public void setIssues(List<ConditionIssueResponse> issues) { this.issues = issues; }

        public List<String> getPassedChecks() { return passedChecks; }
        public void setPassedChecks(List<String> passedChecks) { this.passedChecks = passedChecks; }

        public List<String> getQualityFeedback() { return qualityFeedback; }
        public void setQualityFeedback(List<String> qualityFeedback) { this.qualityFeedback = qualityFeedback; }

        public String getScanStatus() { return scanStatus; }
        public void setScanStatus(String scanStatus) { this.scanStatus = scanStatus; }
    }

    public static class FinalConditionScanResponse {
        private Integer conditionScore;
        private ConditionStatus conditionStatus;
        private Integer confidenceScore;
        private Boolean hasDamage;
        private String damageDetails;
        private String scanResult;
        private List<String> positiveChecks = new ArrayList<>();
        private List<ConditionIssueResponse> issues = new ArrayList<>();
        private List<String> limitations = new ArrayList<>();

        public FinalConditionScanResponse() {}

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

        public List<String> getPositiveChecks() { return positiveChecks; }
        public void setPositiveChecks(List<String> positiveChecks) { this.positiveChecks = positiveChecks; }

        public List<ConditionIssueResponse> getIssues() { return issues; }
        public void setIssues(List<ConditionIssueResponse> issues) { this.issues = issues; }

        public List<String> getLimitations() { return limitations; }
        public void setLimitations(List<String> limitations) { this.limitations = limitations; }
    }

    // Alias for backward compatibility
    public static class ConditionScanResponse extends FinalConditionScanResponse {}
}
