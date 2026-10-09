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
     * 1. Customer creates a new rental order request.
     * Rule: Do NOT reduce available quantity when the customer only sends a request.
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

        // Create Order with PENDING status (Quantity in Resource is NOT reduced yet)
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
     * 2. Vendor/Owner accepts an order request.
     * Rule: Reduce available quantity ONLY when the vendor accepts the request.
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

        // Deduct available quantity and add to rented quantity atomically
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

        // Update Order Status to ACCEPTED
        order.setStatus(OrderStatus.ACCEPTED);
        Order updatedOrder = orderRepository.save(order);

        // Send In-App Notification to Customer
        notificationService.createNotification(
                order.getCustomer(),
                updatedOrder,
                "Request Accepted",
                "Your rental request for " + resource.getItemName() + " was accepted by " + order.getOwner().getFullName() + ".",
                NotificationType.ORDER_ACCEPTED
        );

        System.out.println("✅ [Order Accepted] Order ID: " + orderId + " | Remaining Avail Qty: " + newAvailable + " | Rented Qty: " + newRented);

        return mapToResponse(updatedOrder);
    }

    /**
     * 3. Vendor/Owner rejects a pending order request.
     * Rule: Zero quantity change since quantity was never deducted.
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
     * 4. Customer cancels their order request.
     * Rules:
     * - If PENDING: Set CANCELLED_BY_CUSTOMER, no quantity change (never deducted).
     * - If ACCEPTED/RENTED/ACTIVE: Set CANCELLED_BY_CUSTOMER, restore ordered quantity to available quantity.
     * - Prevent duplicate quantity restoration.
     */
    @Transactional
    public OrderResponse cancelOrderByCustomer(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new BadRequestException("You are not authorized to cancel this order.");
        }

        OrderStatus currentStatus = order.getStatus();

        // Check if already cancelled or returned (Idempotency safeguard)
        if (currentStatus == OrderStatus.CANCELLED_BY_CUSTOMER ||
            currentStatus == OrderStatus.CANCELLED_BY_VENDOR ||
            currentStatus == OrderStatus.CANCELLED ||
            currentStatus == OrderStatus.RETURNED ||
            currentStatus == OrderStatus.RETURN_CONFIRMED ||
            currentStatus == OrderStatus.REJECTED) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + currentStatus);
        }

        Resource resource = order.getResource();

        if (currentStatus == OrderStatus.PENDING) {
            // Pending request was never accepted -> do NOT change product quantity
            order.setStatus(OrderStatus.CANCELLED_BY_CUSTOMER);
        } else if (currentStatus == OrderStatus.ACCEPTED || 
                   currentStatus == OrderStatus.RENTED || 
                   currentStatus == OrderStatus.ACTIVE) {
            // Accepted order had quantity deducted -> restore quantity
            restoreResourceQuantity(resource, order.getQuantity());
            order.setStatus(OrderStatus.CANCELLED_BY_CUSTOMER);
        } else {
            throw new BadRequestException("Cannot cancel order in status: " + currentStatus);
        }

        Order updatedOrder = orderRepository.save(order);

        // Notify Vendor
        notificationService.createNotification(
                order.getOwner(),
                updatedOrder,
                "Order Cancelled by Customer",
                order.getCustomer().getFullName() + " cancelled the rental order for " + resource.getItemName() + ".",
                NotificationType.ORDER_CANCELLED
        );

        System.out.println("❌ [Cancelled by Customer] Order ID: " + orderId + " | Previous Status: " + currentStatus + " | New Status: CANCELLED_BY_CUSTOMER");

        return mapToResponse(updatedOrder);
    }

    /**
     * 5. Vendor cancels an order (even after accepting it).
     * Rules:
     * - If PENDING: Set CANCELLED_BY_VENDOR, no quantity change.
     * - If ACCEPTED/RENTED/ACTIVE: Set CANCELLED_BY_VENDOR, restore ordered quantity to available quantity.
     * - Notify the customer.
     * - Prevent duplicate quantity restoration.
     */
    @Transactional
    public OrderResponse cancelOrderByVendor(Long orderId, Long vendorId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(vendorId)) {
            throw new BadRequestException("You are not authorized to cancel this order.");
        }

        OrderStatus currentStatus = order.getStatus();

        // Check if already cancelled or returned (Idempotency safeguard)
        if (currentStatus == OrderStatus.CANCELLED_BY_CUSTOMER ||
            currentStatus == OrderStatus.CANCELLED_BY_VENDOR ||
            currentStatus == OrderStatus.CANCELLED ||
            currentStatus == OrderStatus.RETURNED ||
            currentStatus == OrderStatus.RETURN_CONFIRMED ||
            currentStatus == OrderStatus.REJECTED) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + currentStatus);
        }

        Resource resource = order.getResource();

        if (currentStatus == OrderStatus.PENDING) {
            // Pending request was never accepted -> do NOT change product quantity
            order.setStatus(OrderStatus.CANCELLED_BY_VENDOR);
        } else if (currentStatus == OrderStatus.ACCEPTED || 
                   currentStatus == OrderStatus.RENTED || 
                   currentStatus == OrderStatus.ACTIVE) {
            // Accepted order had quantity deducted -> restore quantity
            restoreResourceQuantity(resource, order.getQuantity());
            order.setStatus(OrderStatus.CANCELLED_BY_VENDOR);
        } else {
            throw new BadRequestException("Cannot cancel order in status: " + currentStatus);
        }

        Order updatedOrder = orderRepository.save(order);

        // Notify Customer
        notificationService.createNotification(
                order.getCustomer(),
                updatedOrder,
                "Order Cancelled by Vendor",
                "Vendor " + order.getOwner().getFullName() + " cancelled the rental order for " + resource.getItemName() + ".",
                NotificationType.ORDER_CANCELLED
        );

        System.out.println("❌ [Cancelled by Vendor] Order ID: " + orderId + " | Previous Status: " + currentStatus + " | New Status: CANCELLED_BY_VENDOR");

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
     * Helper to safely restore quantity back to product inventory and update resource status.
     */
    private void restoreResourceQuantity(Resource resource, int quantityToRestore) {
        int restoredAvailable = resource.getAvailableQuantity() + quantityToRestore;
        int restoredRented = Math.max(0, (resource.getRentedQuantity() != null ? resource.getRentedQuantity() : quantityToRestore) - quantityToRestore);

        resource.setAvailableQuantity(restoredAvailable);
        resource.setRentedQuantity(restoredRented);

        if (restoredRented == 0) {
            resource.setStatus("AVAILABLE");
        } else {
            resource.setStatus("PARTIALLY_RENTED");
        }

        resourceRepository.save(resource);
        System.out.println("📦 [Quantity Restored] Resource ID: " + resource.getId() + " | Restored Qty: +" + quantityToRestore + 
                           " | New Avail: " + restoredAvailable + " | New Rented: " + restoredRented);
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
            dto.setResourceAvailableQuantity(order.getResource().getAvailableQuantity());
            dto.setResourceTotalQuantity(order.getResource().getTotalQuantity());

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
