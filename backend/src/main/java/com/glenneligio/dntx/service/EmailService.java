package com.glenneligio.dntx.service;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService implements IEmailService{

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    public String fromAddress;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    public String createResetPasswordBody(String fullName, String resetPasswordLink, String origin) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("hh:mm a MMM. d, uuuu - z");
        String currentTime = ZonedDateTime.of(LocalDateTime.now(), ZoneId.of("GMT+8")).format(dateTimeFormatter);
        String body = MessageFormat.format("Hello {0},\n\n" +
                "You recently requested to reset your password for your DNTX account. Use the link below to reset it.\n\n" +
                "{1}\n\n" +
                "This password reset is only valid for the next 24 hours.\n" +
                "For security purposes, this request was received from: {2}\n" +
                "If you did not request a password reset, below Please send an email to this email address.\n\n" +
                "Best regards,\n" +
                "DN-TX team - {3}", fullName, resetPasswordLink, origin, currentTime);
        return body;
    }
}
