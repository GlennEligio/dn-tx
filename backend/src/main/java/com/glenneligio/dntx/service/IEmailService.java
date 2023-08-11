package com.glenneligio.dntx.service;

public interface IEmailService {
    void sendEmail(String to, String subject, String body);
}
