package com.rental.controller;

import com.rental.dto.OrderDTO.CreateOrderRequest;
import com.rental.dto.OrderDTO.OrderResponse;
import com.rental.dto.OrderDTO.RequestReturnRequest;
import com.rental.security.UserPrincipal;
import com.rental.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders & Rental Requests", description = "Endpoints for creating, managing, and tracking rental requests and returns")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "Customer creates a rental order request (does not deduct quantity until accepted)")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrderResponse response = orderService.createOrder(currentUser.getId(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Get all rental requests made by the current user (Borrower)")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<OrderResponse> myOrders = orderService.getMyOrders(currentUser.getId());
        return ResponseEntity.ok(myOrders);
    }

    @GetMapping("/received")
    @Operation(summary = "Get all rental requests received for products owned by current user (Vendor)")
    public ResponseEntity<List<OrderResponse>> getReceivedOrders(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<OrderResponse> receivedOrders = orderService.getReceivedOrders(currentUser.getId());
        return ResponseEntity.ok(receivedOrders);
    }

    @PutMapping("/{orderId}/accept")
    @Operation(summary = "Vendor accepts an order request (atomically deducts available quantity)")
    public ResponseEntity<OrderResponse> acceptOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrderResponse response = orderService.acceptOrder(orderId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/reject")
    @Operation(summary = "Vendor rejects an order request (zero quantity change)")
    public ResponseEntity<OrderResponse> rejectOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrderResponse response = orderService.rejectOrder(orderId, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/request-return")
    @Operation(summary = "Borrower requests to return a rented product")
    public ResponseEntity<OrderResponse> requestReturn(
            @PathVariable Long orderId,
            @RequestBody(required = false) RequestReturnRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        OrderResponse response = orderService.requestReturn(orderId, currentUser.getId(), request);
        return ResponseEntity.ok(response);
    }
}
