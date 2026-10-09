package com.rental.controller;

import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.dto.ResourceDTO.UpdateResourceRequest;
import com.rental.entity.ProductConditionHistory;
import com.rental.security.UserPrincipal;
import com.rental.service.ProductConditionHistoryService;
import com.rental.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@Tag(name = "Give For Rent & Resources", description = "Endpoints for creating, managing, and browsing community rental resources")
public class ResourceController {

    private final ResourceService resourceService;
    private final ProductConditionHistoryService conditionHistoryService;

    // Constructor Injection
    public ResourceController(ResourceService resourceService,
                              ProductConditionHistoryService conditionHistoryService) {
        this.resourceService = resourceService;
        this.conditionHistoryService = conditionHistoryService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new resource for rent with multiple camera-captured image uploads")
    public ResponseEntity<ResourceResponse> createResource(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("rentAmount") BigDecimal rentAmount,
            @RequestParam("rentDurationUnit") String rentDurationUnit,
            @RequestParam(value = "securityDeposit", required = false) BigDecimal securityDeposit,
            @RequestParam(value = "availableQuantity", defaultValue = "1") Integer availableQuantity,
            @RequestParam("availableFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableFrom,
            @RequestParam("availableUntil") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableUntil,
            @RequestParam("pickupMethod") String pickupMethod,
            @RequestParam("pickupLocation") String pickupLocation,
            @RequestParam("images") List<MultipartFile> images,
            @RequestParam(value = "conditionStatus", required = false) String conditionStatus,
            @RequestParam(value = "conditionScore", required = false) Integer conditionScore,
            @RequestParam(value = "detectedIssues", required = false) List<String> detectedIssues,
            @RequestParam(value = "ownerNotes", required = false) String ownerNotes,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ResourceResponse response = resourceService.createResource(
                currentUser.getId(),
                itemName,
                category,
                description,
                rentAmount,
                rentDurationUnit,
                securityDeposit,
                availableQuantity,
                availableFrom,
                availableUntil,
                pickupMethod,
                pickupLocation,
                images,
                conditionStatus,
                conditionScore,
                detectedIssues,
                ownerNotes
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-products")
    @Operation(summary = "Fetch products listed by the authenticated user")
    public ResponseEntity<List<ResourceResponse>> getMyProducts(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ResourceResponse> myProducts = resourceService.getMyProducts(currentUser.getId());
        return ResponseEntity.ok(myProducts);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Owner edits their listed product")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @RequestBody UpdateResourceRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ResourceResponse response = resourceService.updateResource(id, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Owner adds a camera-captured photo to an existing product")
    public ResponseEntity<ResourceResponse> addProductImage(
            @PathVariable Long id,
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ResourceResponse response = resourceService.addProductImage(id, currentUser.getId(), image);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @Operation(summary = "Owner deletes a photo from their product")
    public ResponseEntity<ResourceResponse> deleteProductImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        ResourceResponse response = resourceService.deleteProductImage(id, currentUser.getId(), imageId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/condition-history")
    @Operation(summary = "Get historical condition scans for a resource")
    public ResponseEntity<List<ProductConditionHistory>> getConditionHistory(@PathVariable Long id) {
        List<ProductConditionHistory> history = conditionHistoryService.getResourceHistory(id);
        return ResponseEntity.ok(history);
    }

    @GetMapping
    @Operation(summary = "Fetch all community resources for Home page display")
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        List<ResourceResponse> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource details by ID")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        ResourceResponse resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }
}
