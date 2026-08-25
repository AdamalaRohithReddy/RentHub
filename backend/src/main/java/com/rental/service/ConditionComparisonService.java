package com.rental.service;

import com.rental.dto.ConditionScanDTO.ConditionIssueResponse;
import com.rental.dto.ConditionScanDTO.FinalConditionScanResponse;
import com.rental.entity.ConditionIssue;
import com.rental.entity.ProductConditionScan;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ConditionComparisonService {

    public static class ConditionComparisonResult {
        private String previousCondition;
        private Integer previousScore;
        private String currentCondition;
        private Integer currentScore;
        private Integer scoreDifference; // currentScore - previousScore
        private Boolean newIssuesDetected;
        private List<ConditionIssueResponse> newIssues = new ArrayList<>();
        private List<ConditionIssueResponse> existingIssues = new ArrayList<>();
        private String summary;

        public ConditionComparisonResult() {}

        public String getPreviousCondition() { return previousCondition; }
        public void setPreviousCondition(String previousCondition) { this.previousCondition = previousCondition; }

        public Integer getPreviousScore() { return previousScore; }
        public void setPreviousScore(Integer previousScore) { this.previousScore = previousScore; }

        public String getCurrentCondition() { return currentCondition; }
        public void setCurrentCondition(String currentCondition) { this.currentCondition = currentCondition; }

        public Integer getCurrentScore() { return currentScore; }
        public void setCurrentScore(Integer currentScore) { this.currentScore = currentScore; }

        public Integer getScoreDifference() { return scoreDifference; }
        public void setScoreDifference(Integer scoreDifference) { this.scoreDifference = scoreDifference; }

        public Boolean getNewIssuesDetected() { return newIssuesDetected; }
        public void setNewIssuesDetected(Boolean newIssuesDetected) { this.newIssuesDetected = newIssuesDetected; }

        public List<ConditionIssueResponse> getNewIssues() { return newIssues; }
        public void setNewIssues(List<ConditionIssueResponse> newIssues) { this.newIssues = newIssues; }

        public List<ConditionIssueResponse> getExistingIssues() { return existingIssues; }
        public void setExistingIssues(List<ConditionIssueResponse> existingIssues) { this.existingIssues = existingIssues; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }

    /**
     * Compares previous condition scan with current returned condition scan.
     */
    public ConditionComparisonResult compareConditions(ProductConditionScan prevScan, FinalConditionScanResponse currentScan) {
        ConditionComparisonResult result = new ConditionComparisonResult();

        int prevScore = (prevScan != null && prevScan.getConditionScore() != null) ? prevScan.getConditionScore() : 90;
        String prevCond = (prevScan != null && prevScan.getConditionStatus() != null) ? prevScan.getConditionStatus().name() : "GOOD";

        int currScore = (currentScan != null && currentScan.getConditionScore() != null) ? currentScan.getConditionScore() : 85;
        String currCond = (currentScan != null && currentScan.getConditionStatus() != null) ? currentScan.getConditionStatus().name() : "GOOD";

        int diff = currScore - prevScore;

        result.setPreviousCondition(prevCond);
        result.setPreviousScore(prevScore);
        result.setCurrentCondition(currCond);
        result.setCurrentScore(currScore);
        result.setScoreDifference(diff);

        Set<String> prevIssueKeys = new HashSet<>();
        if (prevScan != null && prevScan.getIssues() != null) {
            for (ConditionIssue issue : prevScan.getIssues()) {
                prevIssueKeys.add(issue.getIssueType().name());
            }
        }

        List<ConditionIssueResponse> newIssuesList = new ArrayList<>();
        List<ConditionIssueResponse> existingIssuesList = new ArrayList<>();

        if (currentScan != null && currentScan.getIssues() != null) {
            for (ConditionIssueResponse currIssue : currentScan.getIssues()) {
                if (currIssue.getIssueType() != null && !currIssue.getIssueType().name().equals("NO_MAJOR_DAMAGE")) {
                    if (prevIssueKeys.contains(currIssue.getIssueType().name())) {
                        existingIssuesList.add(currIssue);
                    } else {
                        newIssuesList.add(currIssue);
                    }
                }
            }
        }

        boolean hasNewIssues = !newIssuesList.isEmpty() || diff < -5;
        result.setNewIssuesDetected(hasNewIssues);
        result.setNewIssues(newIssuesList);
        result.setExistingIssues(existingIssuesList);

        if (diff < 0) {
            result.setSummary("Condition decreased by " + Math.abs(diff) + " points compared to initial listing (" + prevCond + " → " + currCond + ").");
        } else if (diff > 0) {
            result.setSummary("Condition score improved by +" + diff + " points.");
        } else {
            result.setSummary("Product condition matches previous state with zero change.");
        }

        return result;
    }
}
