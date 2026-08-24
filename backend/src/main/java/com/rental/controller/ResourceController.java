package com.rental.controller;

import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.security.UserPrincipal;
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
@Tag(name = "Give For Rent & Resources", description = "Endpoints for creating and browsing community rental resources")
public class ResourceController {

    private final ResourceService resourceService;

    // Constructor Injection
    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new resource for rent with multiple image uploads")
    public ResponseEntity<ResourceResponse> createResource(
            @RequestParam("itemName") String itemName,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("rentAmount") BigDecimal rentAmount,
            @RequestParam("rentDurationUnit") String rentDurationUnit,
            @RequestParam(value = "securityDeposit", required = false) BigDecimal securityDeposit,
            @RequestParam("availableFrom") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableFrom,
            @RequestParam("availableUntil") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availableUntil,
            @RequestParam("pickupMethod") String pickupMethod,
            @RequestParam("pickupLocation") String pickupLocation,
            @RequestParam("images") List<MultipartFile> images,
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
                availableFrom,
                availableUntil,
                pickupMethod,
                pickupLocation,
                images
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
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
