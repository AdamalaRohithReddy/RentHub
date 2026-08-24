package com.rental.controller;

import com.rental.dto.AuthDTO.*;
import com.rental.security.UserPrincipal;
import com.rental.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication & KYC", description = "Endpoints for OTP verification, KYC registration, and login")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/send-otp")
    @Operation(summary = "Step 2: Dispatch 6-digit SMS OTP to phone number")
    public ResponseEntity<ApiResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        ApiResponse response = authService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Step 2: Verify phone OTP")
    public ResponseEntity<ApiResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        ApiResponse response = authService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Step 4: Submit registration with Aadhaar & PAN KYC files and save to MySQL")
    public ResponseEntity<AuthResponse> register(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phoneNumber") String phoneNumber,
            @RequestParam("password") String password,
            @RequestParam("aadhaarNumber") String aadhaarNumber,
            @RequestParam("aadhaarDoc") MultipartFile aadhaarDoc,
            @RequestParam("panDoc") MultipartFile panDoc) {

        RegisterRequest request = new RegisterRequest();
        request.setFullName(fullName);
        request.setEmail(email);
        request.setPhoneNumber(phoneNumber);
        request.setPassword(password);
        request.setAadhaarNumber(aadhaarNumber);

        AuthResponse response = authService.register(request, aadhaarDoc, panDoc);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user via Email/Phone and Password")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserProfileResponse profile = authService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(profile);
    }
}
