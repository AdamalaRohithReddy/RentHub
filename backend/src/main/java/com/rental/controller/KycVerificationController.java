package com.rental.controller;

import com.rental.dto.KycDTO.KycVerificationResponse;
import com.rental.entity.enums.DocumentType;
import com.rental.security.UserPrincipal;
import com.rental.service.KycVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@Tag(name = "KYC & Aadhaar Verification", description = "Endpoints for Aadhaar and PAN document verification and quality analysis")
public class KycVerificationController {

    private final KycVerificationService kycVerificationService;

    public KycVerificationController(KycVerificationService kycVerificationService) {
        this.kycVerificationService = kycVerificationService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and verify an Aadhaar or PAN KYC document")
    public ResponseEntity<KycVerificationResponse> uploadKycDocument(
            @RequestParam("documentType") DocumentType documentType,
            @RequestParam("documentNumber") String documentNumber,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        KycVerificationResponse response = kycVerificationService.verifyDocument(
                currentUser.getId(), documentType, documentNumber, file
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    @Operation(summary = "Get current user's KYC verification status")
    public ResponseEntity<List<KycVerificationResponse>> getKycStatus(
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<KycVerificationResponse> response = kycVerificationService.getUserVerifications(currentUser.getId());
        return ResponseEntity.ok(response);
    }
}
