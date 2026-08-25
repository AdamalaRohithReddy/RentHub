package com.rental.repository;

import com.rental.entity.ProductConditionScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductConditionScanRepository extends JpaRepository<ProductConditionScan, Long> {
    Optional<ProductConditionScan> findByResourceId(Long resourceId);
}
