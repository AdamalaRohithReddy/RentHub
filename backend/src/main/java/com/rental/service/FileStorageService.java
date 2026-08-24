package com.rental.service;

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
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootUploadLocation;

    public FileStorageService(@Value("${file.upload-dir:uploads/kyc}") String uploadDir) {
        this.rootUploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            // Create root kyc folder and separate subfolders for aadhaar and pan
            Files.createDirectories(this.rootUploadLocation);
            Files.createDirectories(this.rootUploadLocation.resolve("aadhaar"));
            Files.createDirectories(this.rootUploadLocation.resolve("pan"));
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory structure for KYC uploads.", ex);
        }
    }

    /**
     * Stores KYC document in its dedicated subfolder (e.g., "aadhaar" or "pan")
     *
     * @param file The uploaded MultipartFile
     * @param subfolder Dedicated subfolder ("aadhaar" or "pan")
     * @param prefix Filename prefix ("aadhaar" or "pan")
     * @return The relative URL path (e.g., "/uploads/kyc/aadhaar/aadhaar-uuid.jpg")
     */
    public String storeKycFile(MultipartFile file, String subfolder, String prefix) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded document file cannot be empty");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.jpg");

        try {
            if (originalFilename.contains("..")) {
                throw new BadRequestException("Filename contains invalid path sequence: " + originalFilename);
            }

            // Ensure specific subfolder exists: uploads/kyc/{subfolder}
            Path targetDir = this.rootUploadLocation.resolve(subfolder).normalize();
            Files.createDirectories(targetDir);

            // Extract file extension
            String fileExtension = "";
            int extIndex = originalFilename.lastIndexOf('.');
            if (extIndex > 0) {
                fileExtension = originalFilename.substring(extIndex);
            }

            // Generate unique filename
            String uniqueFilename = prefix + "-" + UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = targetDir.resolve(uniqueFilename);

            // Copy file to the dedicated subfolder
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/kyc/" + subfolder + "/" + uniqueFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFilename + " in " + subfolder + " folder.", ex);
        }
    }

    public String storeFile(MultipartFile file, String prefix) {
        return storeKycFile(file, prefix.toLowerCase(), prefix.toLowerCase());
    }
}
