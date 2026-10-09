package com.rental.service;

import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.dto.OrderDTO.DamageReportResponse;
import com.rental.dto.OrderDTO.OrderResponse;
import com.rental.dto.OrderDTO.ReportDamageRequest;
import com.rental.dto.OrderDTO.ReturnInspectionResponse;
import com.rental.entity.DamageReport;
import com.rental.entity.Order;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.ConditionScanType;
import com.rental.entity.enums.NotificationType;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.DamageReportRepository;
import com.rental.repository.OrderRepository;
import com.rental.repository.ResourceRepository;
import com.rental.service.ConditionComparisonService.ConditionComparisonResult;
import com.rental.entity.ResourceImage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReturnService {

    private final OrderRepository orderRepository;
    private final ResourceRepository resourceRepository;
    private final DamageReportRepository damageReportRepository;
    private final ConditionScanService conditionScanService;
    private final ConditionComparisonService comparisonService;
    private final ProductConditionHistoryService historyService;
    private final NotificationService notificationService;
    private final OrderService orderService;

    public ReturnService(OrderRepository orderRepository,
                         ResourceRepository resourceRepository,
                         DamageReportRepository damageReportRepository,
                         ConditionScanService conditionScanService,
                         ConditionComparisonService comparisonService,
                         ProductConditionHistoryService historyService,
                         NotificationService notificationService,
                         OrderService orderService) {
        this.orderRepository = orderRepository;
        this.resourceRepository = resourceRepository;
        this.damageReportRepository = damageReportRepository;
        this.conditionScanService = conditionScanService;
        this.comparisonService = comparisonService;
        this.historyService = historyService;
        this.notificationService = notificationService;
        this.orderService = orderService;
    }

    /**
     * Converts a user's full name to a safe folder name (e.g. "Rohith Reddy" -> "Rohith-Reddy")
     */
    public String toSafeFolderName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "user-default";
        }
        return name.trim().replaceAll("[^a-zA-Z0-9.-]", "-").replaceAll("-+", "-");
    }

    /**
     * Returns all return requests received by the product owner.
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOwnerPendingReturns(Long ownerId) {
        return orderRepository.findByOwnerIdAndStatusInOrderByRequestedAtDesc(
                ownerId,
                List.of(OrderStatus.RETURN_REQUESTED, OrderStatus.RETURN_INSPECTION_PENDING)
        ).stream().map(orderService::mapToResponse).collect(Collectors.toList());
    }

    /**
     * Returns details of an order for inspection.
     */
    @Transactional(readOnly = true)
    public OrderResponse getReturnOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(userId) && !order.getCustomer().getId().equals(userId)) {
            throw new BadRequestException("You are not authorized to view this return request.");
        }

        return orderService.mapToResponse(order);
    }

    /**
     * Owner captures photos of returned product and runs automated condition inspection & comparison.
     */
    @Transactional
    public ReturnInspectionResponse scanReturnedProduct(Long orderId, Long ownerId, List<MultipartFile> photos) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to inspect this returned item.");
        }

        OrderStatus status = order.getStatus();
        if (status == OrderStatus.RETURNED || status == OrderStatus.RETURN_CONFIRMED || status == OrderStatus.DAMAGE_REPORTED) {
            throw new BadRequestException("Return inspection has already been completed for this order. Current status: " + status);
        }
        if (status == OrderStatus.CANCELLED_BY_CUSTOMER || status == OrderStatus.CANCELLED_BY_VENDOR || status == OrderStatus.REJECTED) {
            throw new BadRequestException("Cannot inspect a cancelled or rejected order.");
        }

        if (photos == null || photos.isEmpty()) {
            throw new BadRequestException("Please capture at least 3 camera photos of the returned item.");
        }

        Resource resource = order.getResource();
        User owner = order.getOwner();

        // 1. Save returned camera inspection photos to disk under user's returns directory
        String safeUsername = toSafeFolderName(owner.getFullName());
        Path returnsFolder = Paths.get("uploads/products").resolve(safeUsername).resolve("returns").normalize();
        try {
            Files.createDirectories(returnsFolder);
        } catch (IOException e) {
            throw new RuntimeException("Could not create return uploads directory: " + returnsFolder, e);
        }

        List<String> returnedImageUrls = new ArrayList<>();
        for (MultipartFile photo : photos) {
            if (photo == null || photo.isEmpty()) continue;
            String orig = StringUtils.cleanPath(photo.getOriginalFilename() != null ? photo.getOriginalFilename() : "return.jpg");
            String ext = orig.contains(".") ? orig.substring(orig.lastIndexOf('.')) : ".jpg";
            String uniqueName = "return_" + orderId + "_" + UUID.randomUUID().toString() + ext;
            Path target = returnsFolder.resolve(uniqueName).normalize();
            try {
                Files.copy(photo.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                returnedImageUrls.add("/uploads/products/" + safeUsername + "/returns/" + uniqueName);
            } catch (IOException ex) {
                throw new RuntimeException("Failed to save return inspection image: " + orig, ex);
            }
        }

        // 2. Run multi-angle visual condition scan on returned photos
        FinalConditionScanResponse returnedScan = conditionScanService.analyzeProductCondition(
                resource.getItemName(),
                resource.getCategory(),
                "Returned by " + order.getCustomer().getFullName() + " (Order #" + orderId + ")",
                photos
        );

        // 3. Compare returned scan with original / current product condition
        ConditionComparisonResult comparison = comparisonService.compareConditions(
                resource.getConditionScan(),
                returnedScan
        );

        // 4. Record AFTER_RETURN scan history with returned photos & assessor
        historyService.recordConditionHistory(
                resource,
                order,
                returnedScan,
                ConditionScanType.AFTER_RETURN,
                returnedImageUrls,
                owner,
                false,
                "Return inspection scan for order #" + orderId
        );

        // 5. Update Order status to RETURN_INSPECTION_PENDING
        order.setStatus(OrderStatus.RETURN_INSPECTION_PENDING);
        orderRepository.save(order);

        List<String> originalImages = (resource.getImages() != null) ?
                resource.getImages().stream().map(ResourceImage::getImageUrl).collect(Collectors.toList()) :
                new ArrayList<>();

        System.out.println("🔍 [Return Inspected] Order ID: " + orderId + " | Score Diff: " + comparison.getScoreDifference() + " | New Issues: " + comparison.getNewIssuesDetected());

        return new ReturnInspectionResponse(
                orderService.mapToResponse(order),
                returnedScan,
                comparison,
                originalImages,
                returnedImageUrls
        );
    }

    /**
     * Owner confirms return and restores product quantity safely in @Transactional block.
     * Flow:
     * - Order status updated to RETURNED
     * - Add order quantity back to product's available quantity
     * - Save updated product in database
     * - Save updated order in database
     * - Prevent duplicate quantity restoration
     */
    @Transactional
    public OrderResponse confirmReturn(Long orderId, Long ownerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to confirm this return.");
        }

        OrderStatus currentStatus = order.getStatus();

        // Check if already returned / duplicate update prevention
        if (currentStatus == OrderStatus.RETURNED || currentStatus == OrderStatus.RETURN_CONFIRMED) {
            throw new BadRequestException("This order return has already been confirmed.");
        }

        if (currentStatus != OrderStatus.RETURN_REQUESTED && currentStatus != OrderStatus.RETURN_INSPECTION_PENDING) {
            throw new BadRequestException("Return can only be confirmed for pending return orders. Current status: " + currentStatus);
        }

        Resource resource = order.getResource();

        // 1. Update Order Status to RETURNED
        order.setStatus(OrderStatus.RETURNED);
        order.setReturnConfirmedAt(LocalDateTime.now());
        Order updatedOrder = orderRepository.save(order);

        // 2. Safely Restore Available Quantity and Decrement Rented Quantity
        int restoredAvailable = resource.getAvailableQuantity() + order.getQuantity();
        int restoredRented = Math.max(0, (resource.getRentedQuantity() != null ? resource.getRentedQuantity() : order.getQuantity()) - order.getQuantity());

        resource.setAvailableQuantity(restoredAvailable);
        resource.setRentedQuantity(restoredRented);

        if (restoredRented == 0) {
            resource.setStatus("AVAILABLE");
        } else {
            resource.setStatus("PARTIALLY_RENTED");
        }

        // 3. Save the updated product in the database
        resourceRepository.save(resource);

        // 4. Send Notification to Borrower
        notificationService.createNotification(
                order.getCustomer(),
                updatedOrder,
                "Return Confirmed",
                "Your return of " + order.getQuantity() + " unit(s) of " + resource.getItemName() + " has been confirmed by " + resource.getOwner().getFullName() + ". Status: RETURNED.",
                NotificationType.RETURN_CONFIRMED
        );

        System.out.println("✅ [Return Confirmed & Quantity Restored] Order ID: " + orderId + 
                           " | Restored Qty: +" + order.getQuantity() + 
                           " | New Available Qty: " + restoredAvailable + 
                           " | New Rented Qty: " + restoredRented + 
                           " | Order Status: RETURNED");

        return orderService.mapToResponse(updatedOrder);
    }

    /**
     * Owner reports damage detected on returned item.
     */
    @Transactional
    public DamageReportResponse reportDamage(Long orderId, Long ownerId, ReportDamageRequest req) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!order.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to report damage for this order.");
        }

        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == OrderStatus.DAMAGE_REPORTED || currentStatus == OrderStatus.RETURNED || currentStatus == OrderStatus.RETURN_CONFIRMED) {
            throw new BadRequestException("Return inspection has already been finalized for this order.");
        }
        if (currentStatus != OrderStatus.RETURN_REQUESTED && currentStatus != OrderStatus.RETURN_INSPECTION_PENDING) {
            throw new BadRequestException("Damage can only be reported for orders undergoing return inspection. Current status: " + currentStatus);
        }

        Resource resource = order.getResource();

        int prevScore = resource.getConditionScan() != null ? resource.getConditionScan().getConditionScore() : 90;
        int currScore = req.getReturnedScore() != null ? req.getReturnedScore() : 70;
        int diff = currScore - prevScore;

        String detectedIssuesStr = req.getDetectedIssues() != null ? String.join(", ", req.getDetectedIssues()) : "Damage detected during return inspection.";

        DamageReport damageReport = new DamageReport(
                order,
                resource,
                order.getOwner(),
                req.getDescription().trim(),
                prevScore,
                currScore,
                diff,
                detectedIssuesStr
        );

        DamageReport savedReport = damageReportRepository.save(damageReport);

        // Update Order Status to DAMAGE_REPORTED
        order.setStatus(OrderStatus.DAMAGE_REPORTED);
        order.setReturnConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Restore quantity so inventory is not permanently locked
        int restoredAvailable = resource.getAvailableQuantity() + order.getQuantity();
        int restoredRented = Math.max(0, (resource.getRentedQuantity() != null ? resource.getRentedQuantity() : order.getQuantity()) - order.getQuantity());
        resource.setAvailableQuantity(restoredAvailable);
        resource.setRentedQuantity(restoredRented);
        if (restoredRented == 0) {
            resource.setStatus("AVAILABLE");
        } else {
            resource.setStatus("PARTIALLY_RENTED");
        }
        resourceRepository.save(resource);

        // Send Notification to Borrower
        notificationService.createNotification(
                order.getCustomer(),
                order,
                "Damage Reported on Return",
                "The owner reported potential wear/damage on returned " + resource.getItemName() + ": " + req.getDescription(),
                NotificationType.DAMAGE_REPORTED
        );

        System.out.println("⚠️ [Damage Reported] Order ID: " + orderId + " | Issues: " + detectedIssuesStr);

        return mapDamageReportToResponse(savedReport);
    }

    private DamageReportResponse mapDamageReportToResponse(DamageReport report) {
        DamageReportResponse dto = new DamageReportResponse();
        dto.setId(report.getId());
        dto.setOrderId(report.getOrder().getId());
        dto.setResourceId(report.getResource().getId());
        dto.setItemName(report.getResource().getItemName());
        dto.setReporterName(report.getReporter().getFullName());
        dto.setDescription(report.getDescription());
        dto.setPreviousScore(report.getPreviousScore());
        dto.setReturnedScore(report.getReturnedScore());
        dto.setScoreDifference(report.getScoreDifference());
        dto.setDetectedIssues(report.getDetectedIssues());
        dto.setStatus(report.getStatus());
        dto.setReportedAt(report.getReportedAt());
        return dto;
    }
}
