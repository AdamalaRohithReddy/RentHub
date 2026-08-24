package com.rental.service;

import com.rental.dto.ResourceDTO.ImageResponse;
import com.rental.dto.ResourceDTO.ResourceResponse;
import com.rental.entity.Resource;
import com.rental.entity.ResourceImage;
import com.rental.entity.User;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.ResourceRepository;
import com.rental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final Path rootProductUploadLocation;

    public ResourceService(ResourceRepository resourceRepository, 
                           UserRepository userRepository,
                           @Value("${file.product-upload-dir:uploads/products}") String productUploadDir) {
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.rootProductUploadLocation = Paths.get(productUploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.rootProductUploadLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not initialize root folder for product uploads.", ex);
        }
    }

    /**
     * Converts a user's full name into a safe folder name.
     * Example: "Rohith Ready" -> "Rohith-Ready"
     */
    public String toSafeFolderName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "User-Unknown";
        }
        // Replace all consecutive whitespace or special characters with a hyphen
        String safe = fullName.trim().replaceAll("[^a-zA-Z0-9]+", "-");
        // Remove leading or trailing hyphens
        safe = safe.replaceAll("^-+|-+$", "");
        return safe.isEmpty() ? "User" : safe;
    }

    /**
     * Creates a new resource listing with multiple images stored in a user-wise folder.
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
            LocalDate availableFrom,
            LocalDate availableUntil,
            String pickupMethod,
            String pickupLocation,
            List<MultipartFile> images
    ) {
        // 1. Fetch logged-in user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in user not found with id: " + userId));

        // 2. Validate Form Data
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
            throw new BadRequestException("At least 1 product image is required.");
        }
        if (images.size() > 5) {
            throw new BadRequestException("A maximum of 5 images can be uploaded per product.");
        }

        // 4. User-Wise Folder Logic
        // Example: "Rohith Ready" -> "Rohith-Ready"
        String safeUsername = toSafeFolderName(user.getFullName());
        Path userFolder = this.rootProductUploadLocation.resolve(safeUsername).normalize();

        try {
            // If folder exists, reuses it; if not, creates it.
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
                availableFrom,
                availableUntil,
                pickupMethod.trim(),
                pickupLocation.trim()
        );

        // 6. Save Uploaded Images to User's Folder and generate Image URLs
        List<ResourceImage> resourceImages = new ArrayList<>();
        for (MultipartFile imageFile : images) {
            if (imageFile == null || imageFile.isEmpty()) {
                continue;
            }

            // Validate MIME type
            String contentType = imageFile.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Invalid file format. Only image files (JPG, PNG, WEBP, etc.) are allowed.");
            }

            String originalFilename = StringUtils.cleanPath(
                    imageFile.getOriginalFilename() != null ? imageFile.getOriginalFilename() : "product.jpg"
            );

            // Extract file extension
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex);
            } else {
                extension = ".jpg";
            }

            // Generate UUID-based unique filename
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            Path targetFilePath = userFolder.resolve(uniqueFileName);

            try {
                // Copy binary file to disk inside uploads/products/{safeUsername}/
                Files.copy(imageFile.getInputStream(), targetFilePath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new RuntimeException("Failed to save image file on server: " + originalFilename, ex);
            }

            // Generate relative URL path stored in MySQL
            String imageUrl = "/uploads/products/" + safeUsername + "/" + uniqueFileName;

            ResourceImage resourceImage = new ResourceImage(imageUrl, originalFilename);
            resource.addImage(resourceImage);
            resourceImages.add(resourceImage);
        }

        // 7. Save Resource & ResourceImages to MySQL
        Resource savedResource = resourceRepository.save(resource);
        System.out.println("✅ [Product Created] Item: " + savedResource.getItemName() + 
                           " | Owner: " + user.getFullName() + " | Folder: uploads/products/" + safeUsername + "/");

        return mapToResponse(savedResource);
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
     * Returns a specific resource by ID.
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
    private ResourceResponse mapToResponse(Resource res) {
        ResourceResponse dto = new ResourceResponse();
        dto.setId(res.getId());
        dto.setItemName(res.getItemName());
        dto.setCategory(res.getCategory());
        dto.setDescription(res.getDescription());
        dto.setRentAmount(res.getRentAmount());
        dto.setRentDurationUnit(res.getRentDurationUnit());
        dto.setSecurityDeposit(res.getSecurityDeposit());
        dto.setAvailableFrom(res.getAvailableFrom());
        dto.setAvailableUntil(res.getAvailableUntil());
        dto.setPickupMethod(res.getPickupMethod());
        dto.setPickupLocation(res.getPickupLocation());
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

        return dto;
    }
}
