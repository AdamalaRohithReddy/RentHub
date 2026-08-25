-- ==========================================================
-- RentHub - Community Resource Sharing Database Schema
-- Database Name: renthub
-- ==========================================================

CREATE DATABASE IF NOT EXISTS renthub;
USE renthub;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    -- Verification & KYC
    is_phone_verified BOOLEAN DEFAULT TRUE,
    aadhaar_number VARCHAR(50) NOT NULL,
    aadhaar_doc_path VARCHAR(255),
    pan_doc_path VARCHAR(255),
    kyc_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'VERIFIED',
    role ENUM('ROLE_USER', 'ROLE_ADMIN') DEFAULT 'ROLE_USER',
    
    -- Community Trust Score
    trust_score INT DEFAULT 100,

    -- Profile Details
    profile_image_url VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. PHONE OTP TABLE
CREATE TABLE IF NOT EXISTS phone_otps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_phone_otp (phone_number, otp_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. KYC VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS kyc_verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    document_type VARCHAR(30) NOT NULL,
    document_image_path VARCHAR(255),
    document_status VARCHAR(30) NOT NULL DEFAULT 'VALID',
    ocr_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    document_detection_confidence INT DEFAULT 90,
    name_match_status VARCHAR(30) NOT NULL DEFAULT 'EXACT_MATCH',
    verification_method VARCHAR(100) DEFAULT 'OCR_AND_DOCUMENT_VALIDATION',
    verification_status VARCHAR(30) NOT NULL DEFAULT 'DETAILS_MATCHED',
    masked_document_number VARCHAR(50),
    rejection_reason VARCHAR(500),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_kyc_user (user_id),
    INDEX idx_kyc_document_type (document_type),
    INDEX idx_kyc_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. RESOURCES TABLE (Give for Rent Items & Owner Management)
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    rent_amount DECIMAL(10, 2) NOT NULL,
    rent_duration_unit VARCHAR(30) NOT NULL,
    security_deposit DECIMAL(10, 2) DEFAULT 0.00,
    total_quantity INT NOT NULL DEFAULT 1,
    available_quantity INT NOT NULL DEFAULT 1,
    rented_quantity INT NOT NULL DEFAULT 0,
    available_from DATE NOT NULL,
    available_until DATE NOT NULL,
    pickup_method VARCHAR(100) NOT NULL,
    pickup_location VARCHAR(150) NOT NULL,
    pickup_instructions VARCHAR(500),
    return_instructions VARCHAR(500),
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_resource_owner (owner_id),
    INDEX idx_resource_category (category),
    INDEX idx_resource_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. RESOURCE IMAGES TABLE
CREATE TABLE IF NOT EXISTS resource_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_resource_image_resource (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. PRODUCT CONDITION SCANS TABLE (Current/Active Scan)
CREATE TABLE IF NOT EXISTS product_condition_scans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL UNIQUE,
    condition_score INT NOT NULL,
    condition_status VARCHAR(30) NOT NULL,
    confidence_score INT NOT NULL,
    has_damage BOOLEAN NOT NULL DEFAULT FALSE,
    damage_details VARCHAR(500),
    scan_result VARCHAR(1000),
    limitations VARCHAR(1000),
    is_vendor_verified BOOLEAN NOT NULL DEFAULT TRUE,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    INDEX idx_condition_scan_resource (resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. CONDITION ISSUES TABLE
CREATE TABLE IF NOT EXISTS condition_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    condition_scan_id BIGINT NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (condition_scan_id) REFERENCES product_condition_scans(id) ON DELETE CASCADE,
    INDEX idx_issue_scan (condition_scan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ORDERS TABLE (Rental Requests & Return Tracking)
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    owner_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    rent_amount DECIMAL(10, 2) NOT NULL,
    rent_duration_unit VARCHAR(30) NOT NULL,
    security_deposit DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    return_note VARCHAR(500),
    return_requested_at DATETIME,
    return_confirmed_at DATETIME,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_resource (resource_id),
    INDEX idx_order_customer (customer_id),
    INDEX idx_order_owner (owner_id),
    INDEX idx_order_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. PRODUCT CONDITION HISTORY TABLE (Stores Every Condition Scan Separately)
CREATE TABLE IF NOT EXISTS product_condition_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    order_id BIGINT,
    condition_score INT NOT NULL,
    condition_status VARCHAR(30) NOT NULL,
    confidence_score INT NOT NULL,
    scan_type VARCHAR(30) NOT NULL,
    scan_result VARCHAR(1000),
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_history_resource (resource_id),
    INDEX idx_history_order (order_id),
    INDEX idx_history_scan_type (scan_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. CONDITION ISSUE HISTORY TABLE
CREATE TABLE IF NOT EXISTS condition_issue_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    condition_history_id BIGINT NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (condition_history_id) REFERENCES product_condition_history(id) ON DELETE CASCADE,
    INDEX idx_issue_history (condition_history_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. DAMAGE REPORTS TABLE
CREATE TABLE IF NOT EXISTS damage_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    reporter_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    previous_score INT,
    returned_score INT,
    score_difference INT,
    detected_issues VARCHAR(1000),
    status VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_damage_order (order_id),
    INDEX idx_damage_resource (resource_id),
    INDEX idx_damage_reporter (reporter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_id BIGINT,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
