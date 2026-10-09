package com.rental.repository;

import com.rental.entity.ConditionIssueHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionIssueHistoryRepository extends JpaRepository<ConditionIssueHistory, Long> {

    @Query("SELECT c FROM ConditionIssueHistory c WHERE c.conditionHistory.id = :conditionHistoryId")
    List<ConditionIssueHistory> findByConditionHistoryId(@Param("conditionHistoryId") Long conditionHistoryId);

    List<ConditionIssueHistory> findByConditionHistory_Id(Long conditionHistoryId);
}
