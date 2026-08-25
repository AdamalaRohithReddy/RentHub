package com.rental.service;

import com.rental.entity.User;
import com.rental.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ProfileImageService {

    private final Path rootProfileUploadLocation;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public ProfileImageService(@Value("${file.profile-upload-dir:uploads/profiles}") String uploadDir) {
        this.rootProfileUploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootProfileUploadLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create directory structure for profile uploads.", ex);
        }
    }

    /**
     * Stores a profile photo in a user-specific folder: uploads/profiles/user_{userId}/
     * Safely deletes any previous profile photo before saving the new one.
     *
     * @param user The authenticated user
     * @param file The uploaded MultipartFile
     * @return The relative URL path (e.g., "/uploads/profiles/user_15/8f3d9-profile.jpg")
     */
    public String storeProfileImage(User user, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded profile image cannot be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Profile image exceeds the maximum allowed size of 10MB.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "profile.jpg"
        );

        if (originalFilename.contains("..")) {
            throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        // Validate image extension
        String fileExtension = "";
        int extIndex = originalFilename.lastIndexOf('.');
        if (extIndex > 0) {
            fileExtension = originalFilename.substring(extIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new BadRequestException("Unsupported image format: " + fileExtension + ". Allowed formats: JPG, JPEG, PNG, WEBP.");
        }

        // Validate MIME Content-Type
        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            throw new BadRequestException("Invalid file type. Only image files are allowed.");
        }

        try {
            // User-specific directory: uploads/profiles/user_{userId}/
            String userFolderName = "user_" + user.getId();
            Path userDir = this.rootProfileUploadLocation.resolve(userFolderName).normalize();
            Files.createDirectories(userDir);

            // Safely delete previous profile image if it exists
            deleteOldProfileImage(user.getProfileImageUrl());

            // Generate UUID-based unique filename
            String uniqueFilename = UUID.randomUUID().toString() + "-profile" + fileExtension;
            Path targetLocation = userDir.resolve(uniqueFilename);

            // Copy file to disk
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative URL for frontend & database persistence
            return "/uploads/profiles/" + userFolderName + "/" + uniqueFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store profile image for user ID: " + user.getId(), ex);
        }
    }

    /**
     * Deletes an old profile photo file from disk if present.
     */
    public void deleteOldProfileImage(String profileImageUrl) {
        if (profileImageUrl == null || profileImageUrl.trim().isEmpty()) {
            return;
        }

        try {
            String relativePath = profileImageUrl.startsWith("/") ? profileImageUrl.substring(1) : profileImageUrl;
            Path filePath = Paths.get(relativePath).toAbsolutePath().normalize();
            if (Files.exists(filePath) && !Files.isDirectory(filePath)) {
                Files.delete(filePath);
                System.out.println("🗑️ [CLEANUP] Deleted old profile image: " + filePath);
            }
        } catch (Exception ex) {
            System.err.println("⚠️ Could not delete old profile image: " + ex.getMessage());
        }
    }
}
