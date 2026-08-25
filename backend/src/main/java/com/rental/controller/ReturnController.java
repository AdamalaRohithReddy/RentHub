package com.rental.controller;

import com.rental.dto.OrderDTO.DamageReportResponse;
import com.rental.dto.OrderDTO.OrderResponse;
import com.rental.dto.OrderDTO.ReportDamageRequest;
import com.rental.dto.OrderDTO.ReturnInspectionResponse;
import com.rental.security.UserPrincipal;
import com.rental.service.ReturnService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
@Tag(name = "Return Management & Inspection", description = "Endpoints for inspecting returned products, condition comparison, return confirmation, and damage reporting")
public class ReturnController {

    private final ReturnService returnService;

    public ReturnController(ReturnService returnService) {
        this.returnService = returnService;
    }

    @GetMapping("/owner")
    @Operation(summary = "Get all pending product return requests for the current product owner")
    public ResponseEntity<List<OrderResponse>> getOwnerPendingReturns(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<OrderResponse> returns = returnService.getOwnerPendingReturns(currentUser.getId());
        return ResponseEntity.ok(returns);
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Get return details for a specific order")
    public ResponseEntity<OrderResponse> getReturnOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrderResponse response = returnService.getReturnOrder(orderId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{orderId}/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Owner scans returned product with camera photos, runs condition analysis and comparison")
    public ResponseEntity<ReturnInspectionResponse> scanReturnedProduct(
            @PathVariable Long orderId,
            @RequestParam("images") List<MultipartFile> images,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ReturnInspectionResponse response = returnService.scanReturnedProduct(orderId, currentUser.getId(), images);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/confirm")
    @Operation(summary = "Owner confirms product return and restores available quantity safely")
    public ResponseEntity<OrderResponse> confirmReturn(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrderResponse response = returnService.confirmReturn(orderId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/report-damage")
    @Operation(summary = "Owner reports wear/damage detected during return inspection")
    public ResponseEntity<DamageReportResponse> reportDamage(
            @PathVariable Long orderId,
            @Valid @RequestBody ReportDamageRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        DamageReportResponse response = returnService.reportDamage(orderId, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }
}
