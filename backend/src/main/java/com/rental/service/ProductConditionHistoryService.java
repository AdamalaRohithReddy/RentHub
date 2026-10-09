package com.rental.service;

import com.rental.dto.ConditionScanDTO.ConditionIssueResponse;
import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.entity.ConditionIssueHistory;
import com.rental.entity.Order;
import com.rental.entity.ProductConditionHistory;
import com.rental.entity.Resource;
import com.rental.entity.User;
import com.rental.entity.enums.ConditionScanType;
import com.rental.repository.ProductConditionHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductConditionHistoryService {

    private final ProductConditionHistoryRepository historyRepository;

    public ProductConditionHistoryService(ProductConditionHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Transactional
    public ProductConditionHistory recordConditionHistory(
            Resource resource,
            Order order,
            FinalConditionScanResponse scan,
            ConditionScanType scanType,
            List<String> imageUrls,
            User assessor,
            Boolean isManualOverride,
            String ownerNotes
    ) {
        if (resource == null || scan == null) return null;

        String joinedImageUrls = (imageUrls != null && !imageUrls.isEmpty()) ? String.join(",", imageUrls) : null;

        ProductConditionHistory history = new ProductConditionHistory(
                resource,
                order,
                scan.getConditionScore(),
                scan.getConditionStatus(),
                scan.getConfidenceScore(),
                scanType,
                scan.getScanResult(),
                joinedImageUrls,
                assessor,
                isManualOverride,
                ownerNotes
        );

        if (scan.getIssues() != null) {
            for (ConditionIssueResponse issueDto : scan.getIssues()) {
                ConditionIssueHistory issueHistory = new ConditionIssueHistory(
                        issueDto.getIssueType(),
                        issueDto.getSeverity(),
                        issueDto.getDescription()
                );
                history.addIssue(issueHistory);
            }
        }

        return historyRepository.save(history);
    }

    @Transactional
    public ProductConditionHistory recordConditionHistory(
            Resource resource,
            Order order,
            FinalConditionScanResponse scan,
            ConditionScanType scanType
    ) {
        return recordConditionHistory(resource, order, scan, scanType, null, null, false, null);
    }

    @Transactional(readOnly = true)
    public List<ProductConditionHistory> getResourceHistory(Long resourceId) {
        return historyRepository.findByResourceIdOrderByScannedAtDesc(resourceId);
    }
}
