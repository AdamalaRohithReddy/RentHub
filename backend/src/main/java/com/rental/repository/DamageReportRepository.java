package com.rental.repository;

import com.rental.entity.DamageReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DamageReportRepository extends JpaRepository<DamageReport, Long> {
    List<DamageReport> findByResourceIdOrderByReportedAtDesc(Long resourceId);
    List<DamageReport> findByOrderId(Long orderId);
    List<DamageReport> findByReporterIdOrderByReportedAtDesc(Long reporterId);
}
