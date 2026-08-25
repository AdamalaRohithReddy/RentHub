package com.rental.service;

import com.rental.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImageQualityService {

    public static class ImageQualityResult {
        private boolean isUsable;
        private String qualityGrade; // "GOOD", "FAIR", "POOR"
        private int qualityScore;    // 0 - 100
        private List<String> feedback = new ArrayList<>();

        public ImageQualityResult(boolean isUsable, String qualityGrade, int qualityScore, List<String> feedback) {
            this.isUsable = isUsable;
            this.qualityGrade = qualityGrade;
            this.qualityScore = qualityScore;
            this.feedback = feedback;
        }

        public boolean isUsable() { return isUsable; }
        public String getQualityGrade() { return qualityGrade; }
        public int getQualityScore() { return qualityScore; }
        public List<String> getFeedback() { return feedback; }
    }

    /**
     * Inspects image format, dimensions, clarity, and file integrity.
     */
    public ImageQualityResult validateImageQuality(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            List<String> issues = List.of("No image file was provided.");
            return new ImageQualityResult(false, "POOR", 0, issues);
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            List<String> issues = List.of("Unsupported file type. Please provide a JPG, PNG, or WEBP image.");
            return new ImageQualityResult(false, "POOR", 0, issues);
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            List<String> issues = List.of("Image exceeds 10MB limit.");
            return new ImageQualityResult(false, "POOR", 20, issues);
        }

        List<String> feedback = new ArrayList<>();
        int score = 90;

        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            if (img == null) {
                feedback.add("The image file is corrupted or cannot be decoded.");
                return new ImageQualityResult(false, "POOR", 0, feedback);
            }

            int width = img.getWidth();
            int height = img.getHeight();

            if (width < 200 || height < 200) {
                score -= 40;
                feedback.add("Image resolution is very low. Please capture a closer, higher resolution photo.");
            } else if (width < 400 || height < 400) {
                score -= 15;
                feedback.add("Image resolution is slightly low.");
            } else {
                feedback.add("✓ High resolution image detected (" + width + "x" + height + "px)");
            }

            // Quick brightness sample
            long totalLuma = 0;
            int step = Math.max(1, (width * height) / 5000);
            int sampleCount = 0;

            for (int y = 0; y < height; y += (int)Math.sqrt(step)) {
                for (int x = 0; x < width; x += (int)Math.sqrt(step)) {
                    int rgb = img.getRGB(x, y);
                    int r = (rgb >> 16) & 0xFF;
                    int g = (rgb >> 8) & 0xFF;
                    int b = rgb & 0xFF;
                    // Standard luminance formula
                    totalLuma += (long)(0.299 * r + 0.587 * g + 0.114 * b);
                    sampleCount++;
                }
            }

            double avgLuma = sampleCount > 0 ? (double) totalLuma / sampleCount : 128;

            if (avgLuma < 35) {
                score -= 30;
                feedback.add("Image appears too dark. Please use better lighting.");
            } else if (avgLuma > 245) {
                score -= 25;
                feedback.add("Image appears overexposed / too bright.");
            } else {
                feedback.add("✓ Good lighting and contrast levels");
            }

            boolean isUsable = score >= 50;
            String grade = score >= 80 ? "GOOD" : (score >= 50 ? "FAIR" : "POOR");

            return new ImageQualityResult(isUsable, grade, Math.max(0, Math.min(100, score)), feedback);

        } catch (IOException e) {
            feedback.add("Failed to read image stream: " + e.getMessage());
            return new ImageQualityResult(false, "POOR", 0, feedback);
        }
    }
}
