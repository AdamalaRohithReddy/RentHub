package com.rental.controller;

import com.rental.dto.ProfileStatisticsResponse;
import com.rental.dto.UpdateProfileRequest;
import com.rental.dto.UserProfileResponse;
import com.rental.exception.BadRequestException;
import com.rental.security.UserPrincipal;
import com.rental.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Profile", description = "Endpoints for managing authenticated user profile, avatar photo, and statistics")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get the current authenticated user's complete profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserProfileResponse profile = userService.getProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    @Operation(summary = "Update the current authenticated user's profile information")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserProfileResponse updated = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace the current authenticated user's profile photo")
    public ResponseEntity<UserProfileResponse> uploadProfilePhoto(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MultipartFile targetFile = photo != null ? photo : (file != null ? file : image);
        if (targetFile == null || targetFile.isEmpty()) {
            throw new BadRequestException("Please select an image file to upload as your profile photo.");
        }

        UserProfileResponse response = userService.uploadProfilePhoto(currentUser.getId(), targetFile);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/statistics")
    @Operation(summary = "Get the current authenticated user's live activity statistics")
    public ResponseEntity<ProfileStatisticsResponse> getProfileStatistics(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        ProfileStatisticsResponse stats = userService.getProfileStatistics(currentUser.getId());
        return ResponseEntity.ok(stats);
    }
}
