package com.rental.service;

import com.rental.dto.AuthDTO.*;
import com.rental.entity.PhoneOtp;
import com.rental.entity.User;
import com.rental.entity.enums.KycStatus;
import com.rental.entity.enums.Role;
import com.rental.exception.BadRequestException;
import com.rental.repository.PhoneOtpRepository;
import com.rental.repository.UserRepository;
import com.rental.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PhoneOtpRepository phoneOtpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    // 1. Send OTP (Dispatches via EmailService & SMS log)
    @Transactional
    public ApiResponse sendOtp(SendOtpRequest request) {
        String phone = request.getPhoneNumber().trim();
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;

        if (userRepository.existsByPhoneNumber(phone)) {
            throw new BadRequestException("This phone number is already registered. Please log in instead.");
        }

        if (email != null && !email.isEmpty() && userRepository.existsByEmail(email)) {
            throw new BadRequestException("This email address is already registered. Please log in instead.");
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        PhoneOtp phoneOtp = new PhoneOtp(phone, otpCode, expiresAt);
        phoneOtpRepository.save(phoneOtp);

        System.out.println("📱 [OTP Generated] Phone: " + phone + " | Code: " + otpCode);

        // Send OTP to Email using EmailService
        if (email != null && !email.isEmpty()) {
            emailService.sendEmail(
                email,
                "RentHub - Your OTP Verification Code",
                "Hello,\n\nYour 6-digit OTP verification code for RentHub is: " + otpCode + "\n\nThis OTP is valid for 5 minutes. Please do not share it with anyone.\n\nBest regards,\nRentHub Community Team"
            );
        }

        String msg = (email != null && !email.isEmpty())
            ? "OTP dispatched to " + email + " and +91 " + phone
            : "OTP dispatched to +91 " + phone;

        return new ApiResponse(true, msg, otpCode);
    }

    // 2. Verify OTP
    @Transactional
    public ApiResponse verifyOtp(VerifyOtpRequest request) {
        String phone = request.getPhoneNumber().trim();
        String otp = request.getOtp().trim();

        PhoneOtp phoneOtp = phoneOtpRepository
                .findTopByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByIdDesc(phone, otp, LocalDateTime.now())
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP code. Please enter the correct code or request a new one."));

        phoneOtp.setIsUsed(true);
        phoneOtpRepository.save(phoneOtp);

        return new ApiResponse(true, "Phone and Email successfully verified!");
    }

    // 3. Register & Save to MySQL (Step 4)
    @Transactional
    public AuthResponse register(RegisterRequest req, MultipartFile aadhaarDoc, MultipartFile panDoc) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanPhone = req.getPhoneNumber().trim();
        String cleanAadhaar = req.getAadhaarNumber().replaceAll("\\s+", "");

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        if (userRepository.existsByPhoneNumber(cleanPhone)) {
            throw new BadRequestException("An account with this phone number already exists.");
        }

        if (cleanAadhaar.length() != 12) {
            throw new BadRequestException("Aadhaar number must be exactly 12 numeric digits.");
        }

        if (aadhaarDoc == null || aadhaarDoc.isEmpty()) {
            throw new BadRequestException("Aadhaar document photo is mandatory for KYC.");
        }

        if (panDoc == null || panDoc.isEmpty()) {
            throw new BadRequestException("PAN card document photo is mandatory for KYC.");
        }

        // Store KYC files in separate dedicated folders: uploads/kyc/aadhaar/ and uploads/kyc/pan/
        String aadhaarPath = fileStorageService.storeKycFile(aadhaarDoc, "aadhaar", "aadhaar");
        String panPath = fileStorageService.storeKycFile(panDoc, "pan", "pan");

        // Hash password
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        // Create and save user to MySQL database
        User user = new User(
                req.getFullName().trim(),
                cleanEmail,
                cleanPhone,
                encodedPassword,
                cleanAadhaar,
                aadhaarPath,
                panPath
        );

        user = userRepository.save(user);

        // Send Welcome Email
        emailService.sendEmail(
            user.getEmail(),
            "Welcome to RentHub - Registration Successful!",
            "Hi " + user.getFullName() + ",\n\nYour registration on RentHub was successful! Your KYC documents have been recorded in the database.\n\nYou can now log in to borrow, rent, and share resources with your neighbors.\n\nBest regards,\nRentHub Community Team"
        );

        // Generate JWT Token
        String token = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());

        UserProfileResponse profile = mapToProfile(user);

        return new AuthResponse(true, "Registration successful! All details and KYC documents saved to MySQL.", token, profile);
    }

    // 4. Login
    public AuthResponse login(LoginRequest req) {
        String identifier = req.getIdentifier().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, req.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);

        User user;
        if (identifier.contains("@")) {
            user = userRepository.findByEmail(identifier.toLowerCase())
                    .orElseThrow(() -> new BadRequestException("User not found"));
        } else {
            user = userRepository.findByPhoneNumber(identifier)
                    .orElseThrow(() -> new BadRequestException("User not found"));
        }

        UserProfileResponse profile = mapToProfile(user);

        return new AuthResponse(true, "Login successful! Welcome to RentHub.", token, profile);
    }

    // 5. Get User Profile
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found with id: " + userId));
        return mapToProfile(user);
    }

    private UserProfileResponse mapToProfile(User user) {
        UserProfileResponse res = new UserProfileResponse();
        res.setId(user.getId());
        res.setFullName(user.getFullName());
        res.setEmail(user.getEmail());
        res.setPhoneNumber(user.getPhoneNumber());
        res.setIsPhoneVerified(user.getIsPhoneVerified());
        
        String aadhaar = user.getAadhaarNumber();
        if (aadhaar != null && aadhaar.length() >= 4) {
            res.setAadhaarMasked("XXXX-XXXX-" + aadhaar.substring(aadhaar.length() - 4));
        } else {
            res.setAadhaarMasked("Verified");
        }
        
        res.setKycStatus(user.getKycStatus());
        res.setRole(user.getRole());
        res.setTrustScore(user.getTrustScore());
        res.setDbMode("MySQL (renthub)");
        return res;
    }
}
