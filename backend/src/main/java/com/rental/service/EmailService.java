package com.rental.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String message) {
        if (mailSender == null) {
            System.out.println("ℹ️ [EmailService Mock/Notice] JavaMailSender not configured. Subject: '" + subject + "' | To: " + to + " | Message: " + message);
            return;
        }

        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(message);

            mailSender.send(mail);
            System.out.println("📧 [Email Sent] Successfully sent email to " + to);
        } catch (Exception ex) {
            System.err.println("⚠️ [EmailService] Notice: Could not send email via SMTP (" + ex.getMessage() + "). Message content: " + message);
        }
    }
}
