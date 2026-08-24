package com.rental.repository;

import com.rental.entity.PhoneOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PhoneOtpRepository extends JpaRepository<PhoneOtp, Long> {
    Optional<PhoneOtp> findTopByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByIdDesc(
        String phoneNumber, String otpCode, LocalDateTime now
    );
}
