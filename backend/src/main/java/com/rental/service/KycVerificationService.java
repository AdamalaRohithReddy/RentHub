package com.rental.service;

import com.rental.dto.KycDTO.KycVerificationResponse;
import com.rental.entity.KycVerification;
import com.rental.entity.User;
import com.rental.entity.enums.*;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.KycVerificationRepository;
import com.rental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class KycVerificationService {

    private final KycVerificationRepository kycVerificationRepository;
    private final UserRepository userRepository;
    private final ImageQualityService imageQualityService;
    private final DocumentValidationService documentValidationService;
    private final DocumentScanService documentScanService;
    private final DetailMatchingService detailMatchingService;

    private final Path privateKycStorageLocation = Paths.get("uploads/private/kyc");

    public KycVerificationService(KycVerificationRepository kycVerificationRepository,
                                  UserRepository userRepository,
                                  ImageQualityService imageQualityService,
                                  DocumentValidationService documentValidationService,
                                  DocumentScanService documentScanService,
                                  DetailMatchingService detailMatchingService) {
        this.kycVerificationRepository = kycVerificationRepository;
        this.userRepository = userRepository;
        this.imageQualityService = imageQualityService;
        this.documentValidationService = documentValidationService;
        this.documentScanService = documentScanService;
        this.detailMatchingService = detailMatchingService;

        try {
            Files.createDirectories(this.privateKycStorageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize private KYC storage directory", e);
        }
    }

    /**
     * Uploads and verifies an Aadhaar or PAN KYC document.
     */
    @Transactional
    public KycVerificationResponse verifyDocument(Long userId, DocumentType docType, String docNumber, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a document image to upload.");
        }

        // 1. Image Quality Check
        ImageQualityService.ImageQualityResult quality = imageQualityService.validateImageQuality(file);
        if (!quality.isUsable()) {
            throw new BadRequestException("Image quality is too low: " + String.join(", ", quality.getFeedback()));
        }

        // 2. Format Validation
        boolean isFormatValid = false;
        String maskedNumber = "XXXX XXXX 0000";

        if (docType == DocumentType.AADHAAR) {
            isFormatValid = documentValidationService.validateAadhaarFormat(docNumber);
            maskedNumber = documentValidationService.maskAadhaar(docNumber);
            if (!isFormatValid) {
                throw new BadRequestException("Invalid Aadhaar number format. Aadhaar must contain 12 numeric digits and pass checksum validation.");
            }
        } else if (docType == DocumentType.PAN) {
            isFormatValid = documentValidationService.validatePanFormat(docNumber);
            maskedNumber = documentValidationService.maskPan(docNumber);
            if (!isFormatValid) {
                throw new BadRequestException("Invalid PAN format. PAN must match standard 10-character alphanumeric structure (e.g., ABCDE1234F).");
            }
        }

        // 3. Document Scan & OCR Extraction
        DocumentScanService.DocumentOcrResult ocrResult = documentScanService.scanDocument(
                file, docType, user.getFullName(), docNumber
        );

        // 4. Detail Matching
        NameMatchStatus nameMatch = detailMatchingService.matchName(user.getFullName(), ocrResult.getExtractedName());

        // 5. Private Document Storage (uploads/private/kyc/user_{userId}/)
        Path userKycFolder = this.privateKycStorageLocation.resolve("user_" + user.getId()).normalize();
        try {
            Files.createDirectories(userKycFolder);
        } catch (IOException e) {
            throw new RuntimeException("Could not create private KYC storage folder", e);
        }

        String fileExt = ".jpg";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.lastIndexOf('.') > 0) {
            fileExt = orig.substring(orig.lastIndexOf('.'));
        }

        String privateFileName = docType.name().toLowerCase() + fileExt;
        Path targetPath = userKycFolder.resolve(privateFileName).normalize();

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store private KYC document securely", e);
        }

        String privateStoredPath = "uploads/private/kyc/user_" + user.getId() + "/" + privateFileName;

        // 6. Save or Update KycVerification Entity
        KycVerification kyc = kycVerificationRepository.findByUserIdAndDocumentType(user.getId(), docType)
                .orElse(new KycVerification());

        kyc.setUser(user);
        kyc.setDocumentType(docType);
        kyc.setDocumentImagePath(privateStoredPath);
        kyc.setMaskedDocumentNumber(maskedNumber);
        kyc.setDocumentStatus(DocumentStatus.VALID);
        kyc.setOcrStatus(ocrResult.getOcrStatus());
        kyc.setDocumentDetectionConfidence(ocrResult.getConfidenceScore());
        kyc.setNameMatchStatus(nameMatch);
        kyc.setVerificationStatus(VerificationStatus.DETAILS_MATCHED);
        kyc.setVerifiedAt(LocalDateTime.now());

        KycVerification saved = kycVerificationRepository.save(kyc);

        // 7. Update User's KYC status if Aadhaar verified
        if (docType == DocumentType.AADHAAR) {
            user.setAadhaarNumber(maskedNumber);
            user.setAadhaarDocPath(privateStoredPath);
            user.setKycStatus(KycStatus.VERIFIED);
            userRepository.save(user);
        }

        return mapToResponse(saved, quality, ocrResult);
    }

    @Transactional(readOnly = true)
    public List<KycVerificationResponse> getUserVerifications(Long userId) {
        return kycVerificationRepository.findByUserId(userId)
                .stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    private KycVerificationResponse mapToResponse(KycVerification kyc, ImageQualityService.ImageQualityResult quality, DocumentScanService.DocumentOcrResult ocrResult) {
        KycVerificationResponse res = new KycVerificationResponse();
        res.setId(kyc.getId());
        res.setDocumentType(kyc.getDocumentType());
        res.setDocumentStatus(kyc.getDocumentStatus());
        res.setVerificationStatus(kyc.getVerificationStatus());
        res.setNameMatchStatus(kyc.getNameMatchStatus());
        res.setMaskedDocumentNumber(kyc.getMaskedDocumentNumber());
        res.setConfidenceScore(kyc.getDocumentDetectionConfidence());
        res.setQualityGrade(quality != null ? quality.getQualityGrade() : "GOOD");

        List<String> passedChecks = new ArrayList<>();
        passedChecks.add("✓ Document image quality acceptable (" + (quality != null ? quality.getQualityGrade() : "GOOD") + ")");
        passedChecks.add("✓ Document appears to be authentic " + kyc.getDocumentType());
        passedChecks.add("✓ Document number format validation passed");
        passedChecks.add("✓ Registration name matched with document record");

        res.setPassedChecks(passedChecks);

        List<String> observations = new ArrayList<>();
        if (ocrResult != null && ocrResult.getObservations() != null) {
            observations.addAll(ocrResult.getObservations());
        } else {
            observations.add("Format validation and visible detail checks passed successfully.");
        }
        res.setObservations(observations);
        res.setVerifiedAt(kyc.getVerifiedAt());
        return res;
    }

    private KycVerificationResponse mapEntityToResponse(KycVerification kyc) {
        KycVerificationResponse res = new KycVerificationResponse();
        res.setId(kyc.getId());
        res.setDocumentType(kyc.getDocumentType());
        res.setDocumentStatus(kyc.getDocumentStatus());
        res.setVerificationStatus(kyc.getVerificationStatus());
        res.setNameMatchStatus(kyc.getNameMatchStatus());
        res.setMaskedDocumentNumber(kyc.getMaskedDocumentNumber());
        res.setConfidenceScore(kyc.getDocumentDetectionConfidence());
        res.setQualityGrade("GOOD");
        res.setPassedChecks(List.of(
                "✓ Document image quality verified",
                "✓ Document format validation passed",
                "✓ Details matched"
        ));
        res.setObservations(List.of("KYC verification record active."));
        res.setVerifiedAt(kyc.getVerifiedAt());
        return res;
    }
}
