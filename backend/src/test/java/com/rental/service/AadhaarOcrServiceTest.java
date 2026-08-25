package com.rental.service;

import com.rental.service.AadhaarOcrService.AadhaarVerificationResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

class AadhaarOcrServiceTest {

    private AadhaarOcrService ocrService;
    private ImageQualityService imageQualityService;
    private DocumentValidationService documentValidationService;

    @BeforeEach
    void setUp() {
        imageQualityService = new ImageQualityService();
        documentValidationService = new DocumentValidationService();
        ocrService = new AadhaarOcrService(imageQualityService, documentValidationService);
    }

    private byte[] createTestImage() throws IOException {
        BufferedImage image = new BufferedImage(400, 250, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = image.createGraphics();
        g2d.setColor(Color.WHITE);
        g2d.fillRect(0, 0, 400, 250);
        g2d.setColor(Color.BLACK);
        g2d.drawString("Government of India", 20, 40);
        g2d.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        return baos.toByteArray();
    }

    @Test
    @DisplayName("Should MATCH when OCR text contains the entered 12-digit Aadhaar number")
    void testAadhaarMatch() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "aadhaarDoc",
                "aadhaar_card.jpg",
                "image/jpeg",
                createTestImage()
        );

        String enteredNumber = "5432 1098 7654";
        String ocrText = "Government of India \n Name: Rohith Kumar \n 5432 1098 7654 \n Mera Aadhaar Meri Pehchan";

        AadhaarVerificationResult result = ocrService.verifyAadhaar(file, enteredNumber, ocrText);

        assertTrue(result.isAadhaarNumberMatched(), "Should match when number in document equals entered number");
        assertEquals("DOCUMENT_DETAILS_MATCHED", result.getVerificationStatus());
        assertEquals("XXXX XXXX 7654", result.getMaskedExtractedNumber());
    }

    @Test
    @DisplayName("Should REJECT when OCR text has a DIFFERENT 12-digit Aadhaar number (Mismatch)")
    void testAadhaarMismatch() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "aadhaarDoc",
                "aadhaar_card.jpg",
                "image/jpeg",
                createTestImage()
        );

        // Entered number: 5432 1098 7654
        String enteredNumber = "5432 1098 7654";
        // OCR text has a different number: 9876 5432 1098
        String ocrText = "Government of India \n Name: Someone Else \n 9876 5432 1098 \n Mera Aadhaar";

        AadhaarVerificationResult result = ocrService.verifyAadhaar(file, enteredNumber, ocrText);

        assertFalse(result.isAadhaarNumberMatched(), "Must NOT match when number in document is different");
        assertEquals("AADHAAR_NUMBER_MISMATCH", result.getVerificationStatus());
        assertEquals("XXXX XXXX 1098", result.getMaskedExtractedNumber());
        assertEquals("XXXX XXXX 7654", result.getMaskedEnteredNumber());
        assertTrue(result.getMessage().contains("Mismatch"));
    }

    @Test
    @DisplayName("Should REJECT when NO 12-digit Aadhaar number is found in the uploaded image")
    void testAadhaarNotDetected() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "aadhaarDoc",
                "random_photo.jpg",
                "image/jpeg",
                createTestImage()
        );

        String enteredNumber = "5432 1098 7654";
        String ocrText = "Random receipt text without any twelve digit number";

        AadhaarVerificationResult result = ocrService.verifyAadhaar(file, enteredNumber, ocrText);

        assertFalse(result.isAadhaarNumberMatched(), "Must NOT match when no number is detected");
        assertEquals("AADHAAR_NUMBER_NOT_DETECTED", result.getVerificationStatus());
    }
}
