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

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50),
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. PRODUCTS / RESOURCES TABLE
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    item_condition ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR') DEFAULT 'GOOD',
    location VARCHAR(150),
    owner_id BIGINT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
