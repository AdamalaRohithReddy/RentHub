package com.rental.repository;

import com.rental.entity.ProductConditionHistory;
import com.rental.entity.enums.ConditionScanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductConditionHistoryRepository extends JpaRepository<ProductConditionHistory, Long> {

    @Query("SELECT h FROM ProductConditionHistory h WHERE h.resource.id = :resourceId ORDER BY h.scannedAt DESC")
    List<ProductConditionHistory> findByResourceIdOrderByScannedAtDesc(@Param("resourceId") Long resourceId);

    @Query("SELECT h FROM ProductConditionHistory h WHERE h.order.id = :orderId ORDER BY h.scannedAt DESC")
    List<ProductConditionHistory> findByOrderIdOrderByScannedAtDesc(@Param("orderId") Long orderId);

    @Query("SELECT h FROM ProductConditionHistory h WHERE h.resource.id = :resourceId AND h.scanType = :scanType ORDER BY h.scannedAt DESC")
    Optional<ProductConditionHistory> findTopByResourceIdAndScanTypeOrderByScannedAtDesc(@Param("resourceId") Long resourceId, @Param("scanType") ConditionScanType scanType);

    List<ProductConditionHistory> findByResource_IdOrderByScannedAtDesc(Long resourceId);
    List<ProductConditionHistory> findByOrder_IdOrderByScannedAtDesc(Long orderId);
    Optional<ProductConditionHistory> findTopByResource_IdAndScanTypeOrderByScannedAtDesc(Long resourceId, ConditionScanType scanType);
}
