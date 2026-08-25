package com.rental.repository;

import com.rental.entity.KycVerification;
import com.rental.entity.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycVerificationRepository extends JpaRepository<KycVerification, Long> {
    List<KycVerification> findByUserId(Long userId);
    Optional<KycVerification> findByUserIdAndDocumentType(Long userId, DocumentType documentType);
}
