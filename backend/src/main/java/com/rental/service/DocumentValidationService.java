package com.rental.service;

import org.springframework.stereotype.Service;

@Service
public class DocumentValidationService {

    // Verhoeff algorithm multiplication table
    private static final int[][] d = {
        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 2, 3, 4, 0, 6, 7, 8, 9, 5},
        {2, 3, 4, 0, 1, 7, 8, 9, 5, 6},
        {3, 4, 0, 1, 2, 8, 9, 5, 6, 7},
        {4, 0, 1, 2, 3, 9, 5, 6, 7, 8},
        {5, 9, 8, 7, 6, 0, 4, 3, 2, 1},
        {6, 5, 9, 8, 7, 1, 0, 4, 3, 2},
        {7, 6, 5, 9, 8, 2, 1, 0, 4, 3},
        {8, 7, 6, 5, 9, 3, 2, 1, 0, 4},
        {9, 8, 7, 6, 5, 4, 3, 2, 1, 0}
    };

    // Verhoeff algorithm permutation table
    private static final int[][] p = {
        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 5, 7, 6, 2, 8, 3, 0, 9, 4},
        {5, 8, 0, 3, 7, 9, 6, 1, 4, 2},
        {8, 9, 1, 6, 0, 4, 3, 5, 2, 7},
        {9, 4, 5, 3, 1, 2, 6, 8, 7, 0},
        {4, 2, 8, 6, 5, 7, 3, 9, 0, 1},
        {2, 7, 9, 3, 8, 0, 6, 4, 1, 5},
        {7, 0, 4, 6, 9, 1, 3, 2, 5, 8}
    };

    /**
     * Validates 12-digit Aadhaar number format and Verhoeff checksum.
     */
    public boolean validateAadhaarFormat(String rawAadhaar) {
        if (rawAadhaar == null) return false;
        String clean = rawAadhaar.replaceAll("\\s+", "");
        if (!clean.matches("^[2-9][0-9]{11}$")) {
            return false;
        }

        // Verhoeff checksum calculation
        int c = 0;
        int[] myArray = new int[clean.length()];
        for (int i = 0; i < clean.length(); i++) {
            myArray[i] = Character.getNumericValue(clean.charAt(i));
        }

        for (int i = 0; i < myArray.length; i++) {
            c = d[c][p[(i % 8)][myArray[myArray.length - i - 1]]];
        }

        return c == 0;
    }

    /**
     * Validates 10-character PAN number format (5 uppercase letters, 4 digits, 1 uppercase letter).
     */
    public boolean validatePanFormat(String rawPan) {
        if (rawPan == null) return false;
        String clean = rawPan.trim().toUpperCase();
        return clean.matches("^[A-Z]{5}[0-9]{4}[A-Z]{1}$");
    }

    /**
     * Masks an Aadhaar number to format: "XXXX XXXX 1234"
     */
    public String maskAadhaar(String rawAadhaar) {
        if (rawAadhaar == null) return "XXXX XXXX XXXX";
        String clean = rawAadhaar.replaceAll("\\s+", "");
        if (clean.length() >= 4) {
            String last4 = clean.substring(clean.length() - 4);
            return "XXXX XXXX " + last4;
        }
        return "XXXX XXXX XXXX";
    }

    /**
     * Masks a PAN number to format: "XXXXX1234X"
     */
    public String maskPan(String rawPan) {
        if (rawPan == null) return "XXXXXXXXXX";
        String clean = rawPan.trim().toUpperCase();
        if (clean.length() == 10) {
            return "XXXXX" + clean.substring(5, 9) + clean.substring(9);
        }
        return "XXXXXXXXXX";
    }
}
