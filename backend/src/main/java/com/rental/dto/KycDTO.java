package com.rental.dto;

import com.rental.entity.enums.DocumentStatus;
import com.rental.entity.enums.DocumentType;
import com.rental.entity.enums.NameMatchStatus;
import com.rental.entity.enums.VerificationStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class KycDTO {

    public static class KycVerificationResponse {
        private Long id;
        private DocumentType documentType;
        private DocumentStatus documentStatus;
        private VerificationStatus verificationStatus;
        private NameMatchStatus nameMatchStatus;
        private String maskedDocumentNumber;
        private Integer confidenceScore;
        private String qualityGrade;
        private List<String> passedChecks = new ArrayList<>();
        private List<String> observations = new ArrayList<>();
        private LocalDateTime verifiedAt;

        public KycVerificationResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public DocumentType getDocumentType() { return documentType; }
        public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

        public DocumentStatus getDocumentStatus() { return documentStatus; }
        public void setDocumentStatus(DocumentStatus documentStatus) { this.documentStatus = documentStatus; }

        public VerificationStatus getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

        public NameMatchStatus getNameMatchStatus() { return nameMatchStatus; }
        public void setNameMatchStatus(NameMatchStatus nameMatchStatus) { this.nameMatchStatus = nameMatchStatus; }

        public String getMaskedDocumentNumber() { return maskedDocumentNumber; }
        public void setMaskedDocumentNumber(String maskedDocumentNumber) { this.maskedDocumentNumber = maskedDocumentNumber; }

        public Integer getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(Integer confidenceScore) { this.confidenceScore = confidenceScore; }

        public String getQualityGrade() { return qualityGrade; }
        public void setQualityGrade(String qualityGrade) { this.qualityGrade = qualityGrade; }

        public List<String> getPassedChecks() { return passedChecks; }
        public void setPassedChecks(List<String> passedChecks) { this.passedChecks = passedChecks; }

        public List<String> getObservations() { return observations; }
        public void setObservations(List<String> observations) { this.observations = observations; }

        public LocalDateTime getVerifiedAt() { return verifiedAt; }
        public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    }
}
