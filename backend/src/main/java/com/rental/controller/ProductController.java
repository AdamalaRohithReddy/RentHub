package com.rental.controller;

import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.dto.ResourceDTO.UpdateResourceRequest;
import com.rental.entity.Product;
import com.rental.repository.ProductRepository;
import com.rental.security.UserPrincipal;
import com.rental.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products / Resources", description = "Endpoints for community resources and product listings")
public class ProductController {

    private final ProductRepository productRepository;
    private final ResourceService resourceService;

    public ProductController(ProductRepository productRepository, ResourceService resourceService) {
        this.productRepository = productRepository;
        this.resourceService = resourceService;
    }

    @GetMapping
    @Operation(summary = "Get available resources with optional search")
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId) {

        if (categoryId != null) {
            return ResponseEntity.ok(productRepository.findByCategoryId(categoryId));
        }

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search));
        }

        // Return community resources from resourceService if available, else productRepository fallback
        List<ResourceResponse> communityResources = resourceService.getAllResources();
        if (communityResources != null && !communityResources.isEmpty()) {
            return ResponseEntity.ok(communityResources);
        }

        return ResponseEntity.ok(productRepository.findAll());
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

    @GetMapping("/{id}")
    @Operation(summary = "Get product details by ID")
    public ResponseEntity<ResourceResponse> getProductById(@PathVariable Long id) {
        ResourceResponse resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Owner updates their listed product")
    public ResponseEntity<ResourceResponse> updateProduct(
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
}
