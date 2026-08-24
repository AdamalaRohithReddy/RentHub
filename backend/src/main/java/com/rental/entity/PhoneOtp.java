package com.rental.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phone_otps", indexes = {
    @Index(name = "idx_phone_otp", columnList = "phoneNumber, otpCode")
})
public class PhoneOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 6)
    private String otpCode;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public PhoneOtp() {}

    public PhoneOtp(String phoneNumber, String otpCode, LocalDateTime expiresAt) {
        this.phoneNumber = phoneNumber;
        this.otpCode = otpCode;
        this.expiresAt = expiresAt;
        this.isUsed = false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean used) { isUsed = used; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
