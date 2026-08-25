package com.rental.repository;

import com.rental.entity.ConditionIssueHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionIssueHistoryRepository extends JpaRepository<ConditionIssueHistory, Long> {
    List<ConditionIssueHistory> findByConditionHistoryId(Long conditionHistoryId);
}
