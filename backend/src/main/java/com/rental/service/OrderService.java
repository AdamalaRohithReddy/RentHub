package com.rental.service;

import com.rental.dto.OrderDTO.CreateOrderRequest;
import com.rental.dto.OrderDTO.OrderResponse;
import com.rental.dto.OrderDTO.RequestReturnRequest;
import com.rental.entity.Order;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.NotificationType;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.OrderRepository;
import com.rental.repository.ResourceRepository;
import com.rental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Constructor Injection
    public OrderService(OrderRepository orderRepository,
                        ResourceRepository resourceRepository,
                        UserRepository userRepository,
                        NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    /**
     * Customer creates a new rental order request.
     */
    @Transactional
    public OrderResponse createOrder(Long customerId, CreateOrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        // Check customer is not the owner
        if (resource.getOwner().getId().equals(customerId)) {
            throw new BadRequestException("You cannot order or rent your own product.");
        }

        // Check quantity validation
        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new BadRequestException("Requested quantity must be at least 1.");
        }

        if (resource.getAvailableQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() + 
                                          ") exceeds current available quantity (" + resource.getAvailableQuantity() + ").");
        }

        // Create Order with PENDING status
        Order order = new Order(
                resource,
                customer,
                resource.getOwner(),
                request.getQuantity(),
                resource.getRentAmount(),
                resource.getRentDurationUnit(),
                resource.getSecurityDeposit()
        );

        Order savedOrder = orderRepository.save(order);

        // Send In-App Notification to Owner/Vendor
        notificationService.createNotification(
                resource.getOwner(),
                savedOrder,
                "New Rental Request",
                customer.getFullName() + " requested " + request.getQuantity() + " " + resource.getItemName() + ".",
                NotificationType.ORDER_REQUEST
        );

        System.out.println("📦 [Order Created] ID: " + savedOrder.getId() + " | Customer: " + customer.getFullName() + 
                           " | Owner: " + resource.getOwner().getFullName() + " | Qty: " + request.getQuantity() + " | Status: PENDING");

        return mapToResponse(savedOrder);
    }

    /**
     * Returns orders where current user is the customer (My Requests).
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(Long customerId) {
        return orderRepository.findByCustomerIdOrderByRequestedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns orders where current user is the product owner (Requests Received).
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getReceivedOrders(Long ownerId) {
        return orderRepository.findByOwnerIdOrderByRequestedAtDesc(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Vendor/Owner accepts an order request.
     * Decrements available quantity and increments rented quantity in Resource atomically with @Transactional.
     */
    @Transactional
    public OrderResponse acceptOrder(Long orderId, Long ownerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to accept this order.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only PENDING orders can be accepted. Current status: " + order.getStatus());
        }

        Resource resource = order.getResource();

        // Check latest available quantity
        if (resource.getAvailableQuantity() < order.getQuantity()) {
            throw new BadRequestException("Cannot accept order: Requested quantity (" + order.getQuantity() + 
                                          ") exceeds current available quantity (" + resource.getAvailableQuantity() + ").");
        }

        // Deduct available quantity and add to rented quantity
        int newAvailable = resource.getAvailableQuantity() - order.getQuantity();
        int newRented = (resource.getRentedQuantity() != null ? resource.getRentedQuantity() : 0) + order.getQuantity();
        resource.setAvailableQuantity(newAvailable);
        resource.setRentedQuantity(newRented);

        if (newAvailable == 0) {
            resource.setStatus("FULLY_RENTED");
        } else {
            resource.setStatus("PARTIALLY_RENTED");
        }

        resourceRepository.save(resource);

        // Update Order Status
        order.setStatus(OrderStatus.ACCEPTED);
        Order updatedOrder = orderRepository.save(order);

        // Send In-App Notification to Customer
        notificationService.createNotification(
                order.getCustomer(),
                updatedOrder,
                "Request Accepted",
                "Your rental request for " + resource.getItemName() + " was accepted.",
                NotificationType.ORDER_ACCEPTED
        );

        System.out.println("✅ [Order Accepted] Order ID: " + orderId + " | Remaining Avail Qty: " + newAvailable + " | Rented Qty: " + newRented);

        return mapToResponse(updatedOrder);
    }

    /**
     * Vendor/Owner rejects an order request.
     */
    @Transactional
    public OrderResponse rejectOrder(Long orderId, Long ownerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to reject this order.");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Only PENDING orders can be rejected. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.REJECTED);
        Order updatedOrder = orderRepository.save(order);

        // Send In-App Notification to Customer
        notificationService.createNotification(
                order.getCustomer(),
                updatedOrder,
                "Request Rejected",
                "Your rental request for " + order.getResource().getItemName() + " was rejected.",
                NotificationType.ORDER_REJECTED
        );

        return mapToResponse(updatedOrder);
    }

    /**
     * Borrower requests to return a rented product.
     */
    @Transactional
    public OrderResponse requestReturn(Long orderId, Long customerId, RequestReturnRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Strict customer authorization check
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You are not authorized to request return for this order.");
        }

        if (order.getStatus() != OrderStatus.ACCEPTED && order.getStatus() != OrderStatus.RENTED && order.getStatus() != OrderStatus.ACTIVE) {
            throw new BadRequestException("Return can only be requested for active rented orders. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        order.setReturnNote(req != null ? req.getReturnNote() : null);
        order.setReturnRequestedAt(LocalDateTime.now());

        Order updated = orderRepository.save(order);

        // Send Notification to Owner
        notificationService.createNotification(
                order.getOwner(),
                updated,
                "Product Return Request",
                order.getCustomer().getFullName() + " has requested to return " + order.getQuantity() + " unit(s) of " + order.getResource().getItemName() + ".",
                NotificationType.RETURN_REQUEST
        );

        System.out.println("🔄 [Return Requested] Order ID: " + orderId + " by " + order.getCustomer().getFullName());

        return mapToResponse(updated);
    }

    /**
     * Helper to map Entity to DTO Response.
     */
    public OrderResponse mapToResponse(Order order) {
        OrderResponse dto = new OrderResponse();
        dto.setId(order.getId());
        dto.setQuantity(order.getQuantity());
        dto.setRentAmount(order.getRentAmount());
        dto.setRentDurationUnit(order.getRentDurationUnit());
        dto.setSecurityDeposit(order.getSecurityDeposit());
        dto.setStatus(order.getStatus());
        dto.setReturnNote(order.getReturnNote());
        dto.setReturnRequestedAt(order.getReturnRequestedAt());
        dto.setReturnConfirmedAt(order.getReturnConfirmedAt());
        dto.setRequestedAt(order.getRequestedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        if (order.getResource() != null) {
            dto.setResourceId(order.getResource().getId());
            dto.setItemName(order.getResource().getItemName());
            dto.setCategory(order.getResource().getCategory());

            if (order.getResource().getImages() != null && !order.getResource().getImages().isEmpty()) {
                dto.setFirstImageUrl(order.getResource().getImages().get(0).getImageUrl());
            }
        }

        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getFullName());
            dto.setCustomerPhone(order.getCustomer().getPhoneNumber());
        }

        if (order.getOwner() != null) {
            dto.setOwnerId(order.getOwner().getId());
            dto.setOwnerName(order.getOwner().getFullName());
            dto.setOwnerPhone(order.getOwner().getPhoneNumber());
        }

        return dto;
    }
}
