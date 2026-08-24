package com.rental.controller;

import com.rental.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@Tag(name = "Email Service", description = "Endpoints for sending notification and welcome emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    @Operation(summary = "Send custom email message")
    public String sendEmail(@RequestParam String to) {
        emailService.sendEmail(
                to,
                "Welcome to RentHub",
                "Your registration was successful! Welcome to the Community Resource Sharing network."
        );

        return "Email sent successfully";
    }
}
