package com.rental.service;

import com.rental.dto.ConditionScanDTO.ConditionIssueResponse;
import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.dto.ResourceDTO.ImageResponse;
import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.dto.ResourceDTO.UpdateResourceRequest;
import com.rental.entity.Order;
import com.rental.entity.ProductConditionScan;
import com.rental.entity.Resource;
import com.rental.entity.ResourceImage;
import com.rental.entity.User;
import com.rental.entity.enums.ConditionScanType;
import com.rental.entity.enums.OrderStatus;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.OrderRepository;
import com.rental.repository.ResourceRepository;
import com.rental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ConditionScanService conditionScanService;
    private final ProductConditionHistoryService conditionHistoryService;
    private final Path rootProductUploadLocation = Paths.get("uploads/products");

    // Constructor Injection
    public ResourceService(ResourceRepository resourceRepository, 
                           UserRepository userRepository,
                           OrderRepository orderRepository,
                           ConditionScanService conditionScanService,
                           ProductConditionHistoryService conditionHistoryService) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.conditionScanService = conditionScanService;
        this.conditionHistoryService = conditionHistoryService;
        try {
            Files.createDirectories(this.rootProductUploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize root product upload directory", e);
        }
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
     * Creates and saves a new community rental resource with user-wise image folder storage
     * and persists the product condition scan analysis & condition history.
     */
    @Transactional
    public ResourceResponse createResource(
            Long userId,
            String itemName,
            String category,
            String description,
            BigDecimal rentAmount,
            String rentDurationUnit,
            BigDecimal securityDeposit,
            Integer availableQuantity,
            LocalDate availableFrom,
            LocalDate availableUntil,
            String pickupMethod,
            String pickupLocation,
            List<MultipartFile> images
    ) {
        // 1. Fetch Logged-in User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // 2. Validate Fields
        if (!StringUtils.hasText(itemName)) {
            throw new BadRequestException("Item Name is required.");
        }
        if (!StringUtils.hasText(category)) {
            throw new BadRequestException("Category is required.");
        }
        if (!StringUtils.hasText(description)) {
            throw new BadRequestException("Description is required.");
        }
        if (rentAmount == null || rentAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Rent Amount must be greater than or equal to 0.");
        }
        if (!StringUtils.hasText(rentDurationUnit)) {
            throw new BadRequestException("Rent Duration Unit is required (e.g., Per Hour, Per Day, Per Week).");
        }
        if (availableQuantity == null || availableQuantity < 1) {
            throw new BadRequestException("Available Quantity must be a positive integer of at least 1.");
        }
        if (availableFrom == null || availableUntil == null) {
            throw new BadRequestException("Available From and Until dates are required.");
        }
        if (availableUntil.isBefore(availableFrom)) {
            throw new BadRequestException("Available Until date cannot be before Available From date.");
        }
        if (!StringUtils.hasText(pickupMethod)) {
            throw new BadRequestException("Pickup Method is required.");
        }
        if (!StringUtils.hasText(pickupLocation)) {
            throw new BadRequestException("Pickup Location is required.");
        }

        // 3. Validate Multiple Images (Min 1, Max 5)
        if (images == null || images.isEmpty() || images.stream().allMatch(MultipartFile::isEmpty)) {
            throw new BadRequestException("At least 1 product photo is required.");
        }
        if (images.size() > 5) {
            throw new BadRequestException("A maximum of 5 photos can be uploaded per product.");
        }

        // 4. User-Wise Folder Logic (e.g. "Rohith-Reddy")
        String safeUsername = toSafeFolderName(user.getFullName());
        Path userFolder = this.rootProductUploadLocation.resolve(safeUsername).normalize();

        try {
            Files.createDirectories(userFolder);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create user-specific image directory: " + userFolder, ex);
        }

        // 5. Create Resource Entity
        Resource resource = new Resource(
                user,
                itemName.trim(),
                category.trim(),
                description.trim(),
                rentAmount,
                rentDurationUnit.trim(),
                securityDeposit != null ? securityDeposit : BigDecimal.ZERO,
                availableQuantity,
                availableFrom,
                availableUntil,
                pickupMethod.trim(),
                pickupLocation.trim()
        );

        // 6. Save Images to User's Folder & Add to Resource
        for (MultipartFile imageFile : images) {
            if (imageFile == null || imageFile.isEmpty()) continue;

            String originalFilename = StringUtils.cleanPath(
                    imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "product.jpg"
            );

            // Generate UUID-based filename
            String fileExtension = "";
            int dotIdx = originalFilename.lastIndexOf('.');
            if (dotIdx > 0) {
                fileExtension = originalFilename.substring(dotIdx);
            }
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            Path targetFilePath = userFolder.resolve(uniqueFileName).normalize();

            try {
                Files.copy(imageFile.getInputStream(), targetFilePath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new RuntimeException("Failed to save image file on server: " + originalFilename, ex);
            }

            String imageUrl = "/uploads/products/" + safeUsername + "/" + uniqueFileName;
            ResourceImage resourceImage = new ResourceImage(imageUrl, originalFilename);
            resource.addImage(resourceImage);
        }

        // 7. Save Resource to MySQL
        Resource savedResource = resourceRepository.save(resource);

        // 8. Generate & Save Condition Scan Analysis and Record Condition History
        try {
            FinalConditionScanResponse scanResult = conditionScanService.analyzeProductCondition(
                    itemName, category, description, images
            );
            conditionScanService.saveConditionScan(savedResource, scanResult);
            conditionHistoryService.recordConditionHistory(savedResource, null, scanResult, ConditionScanType.INITIAL_LISTING);
        } catch (Exception ex) {
            System.err.println("⚠️ Could not generate condition scan automatically: " + ex.getMessage());
        }

        System.out.println("✅ [Product Created] Item: " + savedResource.getItemName() + 
                           " | Total Qty: " + savedResource.getTotalQuantity() + 
                           " | Available Qty: " + savedResource.getAvailableQuantity() + 
                           " | Owner: " + user.getFullName() + " | Folder: uploads/products/" + safeUsername + "/");

        return mapToResponse(savedResource);
    }

    /**
     * Returns products owned by the authenticated user (My Products page).
     */
    @Transactional(readOnly = true)
    public List<ResourceResponse> getMyProducts(Long ownerId) {
        return resourceRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Owner updates product details, quantities, and instructions.
     */
    @Transactional
    public ResourceResponse updateResource(Long resourceId, Long ownerId, UpdateResourceRequest req) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + resourceId));

        // Strict Owner Authorization Check
        if (!resource.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to edit this product.");
        }

        // Calculate currently rented quantity from active orders
        List<Order> activeOrders = orderRepository.findByResourceIdAndStatusIn(
                resourceId, 
                List.of(OrderStatus.ACCEPTED, OrderStatus.RENTED, OrderStatus.RETURN_REQUESTED, OrderStatus.RETURN_INSPECTION_PENDING)
        );
        int currentRented = activeOrders.stream().mapToInt(Order::getQuantity).sum();
        resource.setRentedQuantity(currentRented);

        // Validate Total Quantity Rule: totalQuantity >= rentedQuantity
        if (req.getTotalQuantity() != null) {
            if (req.getTotalQuantity() < currentRented) {
                throw new BadRequestException("Total quantity (" + req.getTotalQuantity() + 
                                              ") cannot be less than the quantity currently rented (" + currentRented + ").");
            }
            resource.setTotalQuantity(req.getTotalQuantity());
            resource.setAvailableQuantity(req.getTotalQuantity() - currentRented);
        }

        // Update fields if provided
        if (StringUtils.hasText(req.getItemName())) {
            resource.setItemName(req.getItemName().trim());
        }
        if (StringUtils.hasText(req.getCategory())) {
            resource.setCategory(req.getCategory().trim());
        }
        if (StringUtils.hasText(req.getDescription())) {
            resource.setDescription(req.getDescription().trim());
        }
        if (req.getRentAmount() != null && req.getRentAmount().compareTo(BigDecimal.ZERO) >= 0) {
            resource.setRentAmount(req.getRentAmount());
        }
        if (StringUtils.hasText(req.getRentDurationUnit())) {
            resource.setRentDurationUnit(req.getRentDurationUnit().trim());
        }
        if (req.getSecurityDeposit() != null) {
            resource.setSecurityDeposit(req.getSecurityDeposit());
        }
        if (StringUtils.hasText(req.getPickupMethod())) {
            resource.setPickupMethod(req.getPickupMethod().trim());
        }
        if (StringUtils.hasText(req.getPickupLocation())) {
            resource.setPickupLocation(req.getPickupLocation().trim());
        }
        if (req.getPickupInstructions() != null) {
            resource.setPickupInstructions(req.getPickupInstructions().trim());
        }
        if (req.getReturnInstructions() != null) {
            resource.setReturnInstructions(req.getReturnInstructions().trim());
        }

        // Compute Product Status
        if (resource.getAvailableQuantity() == 0 && resource.getTotalQuantity() > 0) {
            resource.setStatus("FULLY_RENTED");
        } else if (resource.getRentedQuantity() > 0 && resource.getAvailableQuantity() > 0) {
            resource.setStatus("PARTIALLY_RENTED");
        } else if (req.getStatus() != null && !req.getStatus().isEmpty()) {
            resource.setStatus(req.getStatus().trim());
        } else {
            resource.setStatus("AVAILABLE");
        }

        Resource updated = resourceRepository.save(resource);
        return mapToResponse(updated);
    }

    /**
     * Adds a camera-captured photo to an existing product.
     */
    @Transactional
    public ResourceResponse addProductImage(Long resourceId, Long ownerId, MultipartFile imageFile) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + resourceId));

        if (!resource.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to edit photos for this product.");
        }

        if (resource.getImages().size() >= 5) {
            throw new BadRequestException("Maximum 5 photos allowed per product.");
        }

        if (imageFile == null || imageFile.isEmpty()) {
            throw new BadRequestException("Image file is required.");
        }

        String safeUsername = toSafeFolderName(resource.getOwner().getFullName());
        Path userFolder = this.rootProductUploadLocation.resolve(safeUsername).normalize();

        try {
            Files.createDirectories(userFolder);
            String orig = StringUtils.cleanPath(imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "photo.jpg");
            String ext = orig.contains(".") ? orig.substring(orig.lastIndexOf('.')) : ".jpg";
            String uniqueName = UUID.randomUUID().toString() + ext;
            Path target = userFolder.resolve(uniqueName).normalize();
            Files.copy(imageFile.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/uploads/products/" + safeUsername + "/" + uniqueName;
            ResourceImage newImg = new ResourceImage(imageUrl, orig);
            resource.addImage(newImg);
            Resource saved = resourceRepository.save(resource);
            return mapToResponse(saved);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage(), e);
        }
    }

    /**
     * Deletes a photo from an existing product.
     */
    @Transactional
    public ResourceResponse deleteProductImage(Long resourceId, Long ownerId, Long imageId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + resourceId));

        if (!resource.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You are not authorized to modify photos for this product.");
        }

        if (resource.getImages().size() <= 1) {
            throw new BadRequestException("Product must have at least 1 photo.");
        }

        ResourceImage target = resource.getImages().stream()
                .filter(img -> img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with id: " + imageId));

        resource.removeImage(target);
        Resource saved = resourceRepository.save(resource);
        return mapToResponse(saved);
    }

    /**
     * Returns all resources for the Home page display.
     */
    @Transactional(readOnly = true)
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns a specific resource by ID for Product Details page.
     */
    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return mapToResponse(resource);
    }

    /**
     * Helper to map Entity to DTO Response.
     */
    public ResourceResponse mapToResponse(Resource res) {
        ResourceResponse dto = new ResourceResponse();
        dto.setId(res.getId());
        dto.setItemName(res.getItemName());
        dto.setCategory(res.getCategory());
        dto.setDescription(res.getDescription());
        dto.setRentAmount(res.getRentAmount());
        dto.setRentDurationUnit(res.getRentDurationUnit());
        dto.setSecurityDeposit(res.getSecurityDeposit());
        dto.setTotalQuantity(res.getTotalQuantity() != null ? res.getTotalQuantity() : res.getAvailableQuantity());
        dto.setAvailableQuantity(res.getAvailableQuantity());
        dto.setRentedQuantity(res.getRentedQuantity() != null ? res.getRentedQuantity() : 0);
        dto.setAvailableFrom(res.getAvailableFrom());
        dto.setAvailableUntil(res.getAvailableUntil());
        dto.setPickupMethod(res.getPickupMethod());
        dto.setPickupLocation(res.getPickupLocation());
        dto.setPickupInstructions(res.getPickupInstructions());
        dto.setReturnInstructions(res.getReturnInstructions());
        dto.setStatus(res.getStatus());
        dto.setCreatedAt(res.getCreatedAt());

        if (res.getOwner() != null) {
            dto.setOwnerId(res.getOwner().getId());
            dto.setOwnerName(res.getOwner().getFullName());
            dto.setOwnerPhone(res.getOwner().getPhoneNumber());
        }

        if (res.getImages() != null) {
            dto.setImages(res.getImages().stream()
                    .map(img -> new ImageResponse(img.getId(), img.getImageUrl(), img.getFileName()))
                    .collect(Collectors.toList()));
        } else {
            dto.setImages(new ArrayList<>());
        }

        // Map Condition Scan Report if present
        if (res.getConditionScan() != null) {
            ProductConditionScan scan = res.getConditionScan();
            FinalConditionScanResponse scanDto = new FinalConditionScanResponse();
            scanDto.setConditionScore(scan.getConditionScore());
            scanDto.setConditionStatus(scan.getConditionStatus());
            scanDto.setConfidenceScore(scan.getConfidenceScore());
            scanDto.setHasDamage(scan.getHasDamage());
            scanDto.setDamageDetails(scan.getDamageDetails());
            scanDto.setScanResult(scan.getScanResult());

            if (scan.getLimitations() != null && !scan.getLimitations().isEmpty()) {
                scanDto.setLimitations(Arrays.asList(scan.getLimitations().split("\\s*\\|\\s*")));
            }

            if (scan.getIssues() != null) {
                scanDto.setIssues(scan.getIssues().stream()
                        .map(i -> new ConditionIssueResponse(i.getIssueType(), i.getSeverity(), i.getDescription()))
                        .collect(Collectors.toList()));
            }

            dto.setConditionScan(scanDto);
        }

        return dto;
    }
}
