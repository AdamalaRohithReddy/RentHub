package com.rental.entity;

import com.rental.entity.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_verifications", indexes = {
    @Index(name = "idx_kyc_user", columnList = "user_id"),
    @Index(name = "idx_kyc_document_type", columnList = "document_type"),
    @Index(name = "idx_kyc_verification_status", columnList = "verification_status")
})
public class KycVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(name = "document_image_path", length = 255)
    private String documentImagePath; // Private server storage path

    @Enumerated(EnumType.STRING)
    @Column(name = "document_status", nullable = false, length = 30)
    private DocumentStatus documentStatus = DocumentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "ocr_status", nullable = false, length = 30)
    private OcrStatus ocrStatus = OcrStatus.SUCCESS;

    @Column(name = "document_detection_confidence")
    private Integer documentDetectionConfidence = 90;

    @Enumerated(EnumType.STRING)
    @Column(name = "name_match_status", nullable = false, length = 30)
    private NameMatchStatus nameMatchStatus = NameMatchStatus.EXACT_MATCH;

    @Column(name = "verification_method", length = 100)
    private String verificationMethod = "OCR_AND_DOCUMENT_VALIDATION";

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 30)
    private VerificationStatus verificationStatus = VerificationStatus.DETAILS_MATCHED;

    @Column(name = "masked_document_number", length = 50)
    private String maskedDocumentNumber; // e.g. "XXXX XXXX 1234"

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public KycVerification() {}

    public KycVerification(User user, DocumentType documentType, String documentImagePath, 
                           String maskedDocumentNumber, VerificationStatus verificationStatus) {
        this.user = user;
        this.documentType = documentType;
        this.documentImagePath = documentImagePath;
        this.maskedDocumentNumber = maskedDocumentNumber;
        this.verificationStatus = verificationStatus;
        this.documentStatus = DocumentStatus.VALID;
        this.ocrStatus = OcrStatus.SUCCESS;
        this.nameMatchStatus = NameMatchStatus.EXACT_MATCH;
        this.documentDetectionConfidence = 92;
        this.verificationMethod = "OCR_AND_DOCUMENT_VALIDATION";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public DocumentType getDocumentType() { return documentType; }
    public void setDocumentType(DocumentType documentType) { this.documentType = documentType; }

    public String getDocumentImagePath() { return documentImagePath; }
    public void setDocumentImagePath(String documentImagePath) { this.documentImagePath = documentImagePath; }

    public DocumentStatus getDocumentStatus() { return documentStatus; }
    public void setDocumentStatus(DocumentStatus documentStatus) { this.documentStatus = documentStatus; }

    public OcrStatus getOcrStatus() { return ocrStatus; }
    public void setOcrStatus(OcrStatus ocrStatus) { this.ocrStatus = ocrStatus; }

    public Integer getDocumentDetectionConfidence() { return documentDetectionConfidence; }
    public void setDocumentDetectionConfidence(Integer documentDetectionConfidence) { this.documentDetectionConfidence = documentDetectionConfidence; }

    public NameMatchStatus getNameMatchStatus() { return nameMatchStatus; }
    public void setNameMatchStatus(NameMatchStatus nameMatchStatus) { this.nameMatchStatus = nameMatchStatus; }

    public String getVerificationMethod() { return verificationMethod; }
    public void setVerificationMethod(String verificationMethod) { this.verificationMethod = verificationMethod; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getMaskedDocumentNumber() { return maskedDocumentNumber; }
    public void setMaskedDocumentNumber(String maskedDocumentNumber) { this.maskedDocumentNumber = maskedDocumentNumber; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
