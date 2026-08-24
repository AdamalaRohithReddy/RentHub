package com.rental.dto;

import com.rental.entity.enums.KycStatus;
import com.rental.entity.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AuthDTO {

    // 1. Send OTP Request (Accepts Phone Number and optional Email)
    public static class SendOtpRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please enter a valid 10-digit Indian phone number starting with 6-9")
        private String phoneNumber;

        private String email;

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    // 2. Verify OTP Request
    public static class VerifyOtpRequest {
        @NotBlank(message = "Phone number is required")
        private String phoneNumber;

        @NotBlank(message = "OTP code is required")
        @Size(min = 6, max = 6, message = "OTP must be 6 digits")
        private String otp;

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    // 3. Register Request Form DTO
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 3, max = 100, message = "Full name must be between 3 and 100 characters")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number format")
        private String phoneNumber;

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @NotBlank(message = "Aadhaar number is required")
        @Pattern(regexp = "^\\d{12}$", message = "Aadhaar number must be 12 digits")
        private String aadhaarNumber;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getAadhaarNumber() { return aadhaarNumber; }
        public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }
    }

    // 4. Login Request
    public static class LoginRequest {
        @NotBlank(message = "Email or Phone Number is required")
        private String identifier;

        @NotBlank(message = "Password is required")
        private String password;

        public String getIdentifier() { return identifier; }
        public void setIdentifier(String identifier) { this.identifier = identifier; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // 5. Auth Response
    public static class AuthResponse {
        private Boolean success;
        private String message;
        private String token;
        private UserProfileResponse user;

        public AuthResponse(Boolean success, String message, String token, UserProfileResponse user) {
            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }

        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UserProfileResponse getUser() { return user; }
        public void setUser(UserProfileResponse user) { this.user = user; }
    }

    // 6. User Profile Response
    public static class UserProfileResponse {
        private Long id;
        private String fullName;
        private String email;
        private String phoneNumber;
        private Boolean isPhoneVerified;
        private String aadhaarMasked;
        private KycStatus kycStatus;
        private Role role;
        private Integer trustScore;
        private String dbMode;

        public UserProfileResponse() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public Boolean getIsPhoneVerified() { return isPhoneVerified; }
        public void setIsPhoneVerified(Boolean phoneVerified) { isPhoneVerified = phoneVerified; }

        public String getAadhaarMasked() { return aadhaarMasked; }
        public void setAadhaarMasked(String aadhaarMasked) { this.aadhaarMasked = aadhaarMasked; }

        public KycStatus getKycStatus() { return kycStatus; }
        public void setKycStatus(KycStatus kycStatus) { this.kycStatus = kycStatus; }

        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }

        public Integer getTrustScore() { return trustScore; }
        public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }

        public String getDbMode() { return dbMode; }
        public void setDbMode(String dbMode) { this.dbMode = dbMode; }
    }

    // 7. General API / OTP Response
    public static class ApiResponse {
        private Boolean success;
        private String message;
        private String debugOtp;

        public ApiResponse(Boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public ApiResponse(Boolean success, String message, String debugOtp) {
            this.success = success;
            this.message = message;
            this.debugOtp = debugOtp;
        }

        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getDebugOtp() { return debugOtp; }
        public void setDebugOtp(String debugOtp) { this.debugOtp = debugOtp; }
    }
}
