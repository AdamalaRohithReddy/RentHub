-- ==========================================================
-- RentHub - Community Resource Sharing Database Schema
-- Database Name: renthub
-- ==========================================================

CREATE DATABASE IF NOT EXISTS renthub;
USE renthub;

-- 1. USERS & IDENTITY KYC TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    -- Verification & KYC
    is_phone_verified BOOLEAN DEFAULT TRUE,
    aadhaar_number VARCHAR(20) NOT NULL,
    aadhaar_doc_path VARCHAR(255),
    pan_doc_path VARCHAR(255),
    kyc_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'VERIFIED',
    role ENUM('ROLE_USER', 'ROLE_ADMIN') DEFAULT 'ROLE_USER',
    
    -- Community Trust Score
    trust_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. PHONE OTP TABLE (Temporary OTP verification)
CREATE TABLE IF NOT EXISTS phone_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_phone_otp (phone_number, otp_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. RESOURCES TABLE (Give for Rent Items)
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    rent_duration_unit VARCHAR(30) NOT NULL,
    security_deposit DECIMAL(10, 2) DEFAULT 0.00,
    available_from DATE NOT NULL,
    available_until DATE NOT NULL,
    pickup_method VARCHAR(100) NOT NULL,
    pickup_location VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resource_owner (owner_id),
    INDEX idx_resource_category (category),
    INDEX idx_resource_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. RESOURCE IMAGES TABLE (Image URLs & File Names in MySQL)
CREATE TABLE IF NOT EXISTS resource_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_resource_image_resource (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
