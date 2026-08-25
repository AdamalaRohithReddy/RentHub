package com.rental.repository;

import com.rental.entity.ProductConditionHistory;
import com.rental.entity.enums.ConditionScanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductConditionHistoryRepository extends JpaRepository<ProductConditionHistory, Long> {
    List<ProductConditionHistory> findByResourceIdOrderByScannedAtDesc(Long resourceId);
    List<ProductConditionHistory> findByOrderIdOrderByScannedAtDesc(Long orderId);
    Optional<ProductConditionHistory> findTopByResourceIdAndScanTypeOrderByScannedAtDesc(Long resourceId, ConditionScanType scanType);
}
