package com.rental.controller;

import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.dto.ConditionScanDTO.PhotoScanResponse;
import com.rental.security.UserPrincipal;
import com.rental.service.ConditionScanService;
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
@RequestMapping("/api/condition-scan")
@Tag(name = "Product Condition Scanner", description = "Endpoints for scanning and analyzing visible condition of camera-captured product photos")
public class ConditionScanController {

    private final ConditionScanService conditionScanService;

    public ConditionScanController(ConditionScanService conditionScanService) {
        this.conditionScanService = conditionScanService;
    }

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Per-photo real-time quality check and condition scan for camera frame")
    public ResponseEntity<PhotoScanResponse> scanSinglePhoto(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam(value = "photoAngle", defaultValue = "Front") String photoAngle,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        PhotoScanResponse result = conditionScanService.analyzeSinglePhoto(
                itemName, category, photoAngle, file
        );

        return ResponseEntity.ok(result);
    }

    @PostMapping(value = "/final", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Combined final multi-angle condition scan across all accepted photos")
    public ResponseEntity<FinalConditionScanResponse> scanCombinedFinal(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("images") List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        FinalConditionScanResponse scanResult = conditionScanService.analyzeProductCondition(
                itemName, category, description, images
        );

        return ResponseEntity.ok(scanResult);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Scan uploaded product images and return AI visual condition analysis")
    public ResponseEntity<FinalConditionScanResponse> scanProductCondition(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("images") List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        FinalConditionScanResponse scanResult = conditionScanService.analyzeProductCondition(
                itemName, category, description, images
        );

        return ResponseEntity.ok(scanResult);
    }
}
