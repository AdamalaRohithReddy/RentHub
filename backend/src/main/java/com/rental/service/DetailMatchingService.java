package com.rental.service;

import com.rental.entity.enums.NameMatchStatus;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class DetailMatchingService {

    /**
     * Compares user registered name with extracted OCR name.
     */
    public NameMatchStatus matchName(String registeredName, String ocrExtractedName) {
        if (registeredName == null || ocrExtractedName == null) {
            return NameMatchStatus.NOT_APPLICABLE;
        }

        String regClean = registeredName.trim().toLowerCase().replaceAll("[^a-z\\s]", "");
        String ocrClean = ocrExtractedName.trim().toLowerCase().replaceAll("[^a-z\\s]", "");

        if (regClean.isEmpty() || ocrClean.isEmpty()) {
            return NameMatchStatus.NOT_APPLICABLE;
        }

        if (regClean.equals(ocrClean)) {
            return NameMatchStatus.EXACT_MATCH;
        }

        Set<String> regTokens = new HashSet<>(Arrays.asList(regClean.split("\\s+")));
        Set<String> ocrTokens = new HashSet<>(Arrays.asList(ocrClean.split("\\s+")));

        // Check if all tokens of one exist in the other
        if (ocrTokens.containsAll(regTokens) || regTokens.containsAll(ocrTokens)) {
            return NameMatchStatus.EXACT_MATCH;
        }

        // Count overlapping name tokens
        Set<String> intersection = new HashSet<>(regTokens);
        intersection.retainAll(ocrTokens);

        if (!intersection.isEmpty()) {
            return NameMatchStatus.PARTIAL_MATCH;
        }

        return NameMatchStatus.MISMATCH;
    }
}
