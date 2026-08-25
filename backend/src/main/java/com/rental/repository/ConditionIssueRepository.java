package com.rental.repository;

import com.rental.entity.ConditionIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConditionIssueRepository extends JpaRepository<ConditionIssue, Long> {
    List<ConditionIssue> findByConditionScanId(Long conditionScanId);
}
