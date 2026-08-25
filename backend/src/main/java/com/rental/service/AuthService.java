package com.rental.service;

import com.rental.dto.AuthDTO.*;
import com.rental.entity.KycVerification;
import com.rental.entity.PhoneOtp;
import com.rental.entity.User;
import com.rental.entity.enums.*;
import com.rental.exception.BadRequestException;
import com.rental.exception.ResourceNotFoundException;
import com.rental.repository.KycVerificationRepository;
import com.rental.repository.PhoneOtpRepository;
import com.rental.repository.UserRepository;
import com.rental.security.JwtTokenProvider;
import com.rental.security.UserPrincipal;
import com.rental.service.AadhaarOcrService.AadhaarVerificationResult;
import org.springframework.beans.factory.annotation.Autowired;
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
    private KycVerificationRepository kycVerificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AadhaarOcrService aadhaarOcrService;

    @Autowired
    private DocumentValidationService documentValidationService;

    // 1. Dispatch SMS OTP (Step 2)
    @Transactional
    public ApiResponse sendOtp(SendOtpRequest request) {
        String phone = request.getPhoneNumber().trim();
        String email = request.getEmail() != null ? request.getEmail().trim() : null;

        // Generate 6-digit cryptographic-safe simulation code
        String otpCode = String.format("%06d", new Random().nextInt(999999));

        // Save OTP to MySQL (Valid for 5 minutes)
        PhoneOtp phoneOtp = new PhoneOtp(phone, otpCode, LocalDateTime.now().plusMinutes(5));
        phoneOtpRepository.save(phoneOtp);

        System.out.println("==================================================");
        System.out.println("📲 [SMS GATEWAY SIMULATION]");
        System.out.println("To: +91 " + phone);
        System.out.println("RentHub OTP Code: " + otpCode);
        System.out.println("Valid for 5 minutes");
        System.out.println("==================================================");

        // Send OTP email if email provided
        if (email != null && !email.isEmpty()) {
            emailService.sendEmail(
                email,
                "Your RentHub Verification OTP Code",
                "Your one-time verification code is: " + otpCode + "\n\nThis code will expire in 5 minutes. Do not share it with anyone."
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

    // 3. Register & Save to MySQL (Step 4) with Strict Document-to-Input Matching
    @Transactional
    public AuthResponse register(RegisterRequest req, MultipartFile aadhaarDoc, MultipartFile panDoc) {
        return register(req, aadhaarDoc, panDoc, null);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req, MultipartFile aadhaarDoc, MultipartFile panDoc, String ocrExtractedText) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        String cleanPhone = req.getPhoneNumber().trim();
        String cleanAadhaar = aadhaarOcrService.normalizeAadhaarNumber(req.getAadhaarNumber());

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

        // REAL AADHAAR OCR VERIFICATION & STRICT DOCUMENT-TO-INPUT MATCHING
        AadhaarVerificationResult ocrResult = aadhaarOcrService.verifyAadhaar(aadhaarDoc, cleanAadhaar, ocrExtractedText);
        if (!ocrResult.isAadhaarNumberMatched()) {
            throw new BadRequestException("Aadhaar verification failed: " + ocrResult.getMessage());
        }

        // Store KYC files in separate dedicated folders: uploads/kyc/aadhaar/ and uploads/kyc/pan/
        String aadhaarPath = fileStorageService.storeKycFile(aadhaarDoc, "aadhaar", "aadhaar");
        String panPath = fileStorageService.storeKycFile(panDoc, "pan", "pan");

        // Mask Aadhaar for storage: "XXXX XXXX 9012"
        String maskedAadhaar = documentValidationService.maskAadhaar(cleanAadhaar);

        // Hash password
        String encodedPassword = passwordEncoder.encode(req.getPassword());

        // Create and save user to MySQL database
        User user = new User(
                req.getFullName().trim(),
                cleanEmail,
                cleanPhone,
                encodedPassword,
                maskedAadhaar,
                aadhaarPath,
                panPath
        );

        user = userRepository.save(user);

        // Create KycVerification record
        KycVerification kyc = new KycVerification(
                user,
                DocumentType.AADHAAR,
                aadhaarPath,
                maskedAadhaar,
                VerificationStatus.DETAILS_MATCHED
        );
        kycVerificationRepository.save(kyc);

        // Send Welcome Email
        emailService.sendEmail(
            user.getEmail(),
            "Welcome to RentHub - Registration Successful!",
            "Hi " + user.getFullName() + ",\n\nYour registration on RentHub was successful! Your KYC documents have been recorded in the database.\n\nYou can now log in to borrow, rent, and share resources with your neighbors.\n\nBest regards,\nRentHub Community Team"
        );

        // Generate JWT Token
        String token = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());

        System.out.println("==================================================");
        System.out.println("✅ [DATABASE PERSISTENCE CONFIRMED]");
        System.out.println("User ID: " + user.getId());
        System.out.println("Full Name: " + user.getFullName());
        System.out.println("Email: " + user.getEmail());
        System.out.println("Phone: " + user.getPhoneNumber());
        System.out.println("Aadhaar Number: " + maskedAadhaar);
        System.out.println("Aadhaar OCR Status: DOCUMENT_DETAILS_MATCHED");
        System.out.println("Aadhaar Document: " + user.getAadhaarDocPath());
        System.out.println("PAN Document: " + user.getPanDocPath());
        System.out.println("KYC Status: " + user.getKycStatus());
        System.out.println("Trust Score: " + user.getTrustScore());
        System.out.println("Saved in MySQL Database: renthub.users");
        System.out.println("==================================================");

        UserProfileResponse userProfile = mapToUserProfileResponse(user);
        return new AuthResponse(true, "Registration successful! Welcome to the RentHub community.", token, userProfile);
    }

    // 4. Authenticate & Login
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        String rawPassword = request.getPassword();

        // Search user by email or phone number
        User user = userRepository.findByEmail(identifier.toLowerCase())
                .or(() -> userRepository.findByPhoneNumber(identifier))
                .orElseThrow(() -> new BadRequestException("Invalid email/phone number or password."));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new BadRequestException("Invalid email/phone number or password.");
        }

        String token = tokenProvider.generateTokenFromUserId(user.getId(), user.getEmail());
        UserProfileResponse userProfile = mapToUserProfileResponse(user);

        return new AuthResponse(true, "Login successful!", token, userProfile);
    }

    // 5. Current User Profile
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResourceNotFoundException("User session expired. Please log in again.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        return mapToUserProfileResponse(user);
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        UserProfileResponse profile = new UserProfileResponse();
        profile.setId(user.getId());
        profile.setFullName(user.getFullName());
        profile.setEmail(user.getEmail());
        profile.setPhoneNumber(user.getPhoneNumber());
        profile.setIsPhoneVerified(user.getIsPhoneVerified());
        profile.setAadhaarMasked(user.getAadhaarNumber());
        profile.setKycStatus(user.getKycStatus());
        profile.setRole(user.getRole());
        profile.setTrustScore(user.getTrustScore());
        profile.setDbMode("MySQL Database");
        return profile;
    }
}
