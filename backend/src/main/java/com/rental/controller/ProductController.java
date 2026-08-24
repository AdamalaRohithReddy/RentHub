package com.rental.controller;

import com.rental.entity.Product;
import com.rental.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products / Resources", description = "Endpoints for community resources")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    @Operation(summary = "Get available resources with optional search")
    public ResponseEntity<List<Product>> getProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId) {

        if (categoryId != null) {
            return ResponseEntity.ok(productRepository.findByCategoryId(categoryId));
        }

        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(productRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(search, search));
        }

        return ResponseEntity.ok(productRepository.findAll());
    }
}
