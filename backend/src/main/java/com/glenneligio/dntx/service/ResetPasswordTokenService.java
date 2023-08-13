package com.glenneligio.dntx.service;

import com.glenneligio.dntx.exception.ApiException;
import com.glenneligio.dntx.model.Account;
import com.glenneligio.dntx.model.ResetPasswordToken;
import com.glenneligio.dntx.repository.AccountRepository;
import com.glenneligio.dntx.repository.ResetPasswordTokenRepository;
import com.glenneligio.dntx.util.Utils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigInteger;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ResetPasswordTokenService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ResetPasswordTokenRepository resetPasswordTokenRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private EmailService emailService;

    public void redeemResetPasswordToken(String newPassword, String token) throws NoSuchAlgorithmException {
        String hashedToken = Utils.hashSHA256(token);
        log.info("Hashed token {}", hashedToken);

        // check if token does exist in database
        ResetPasswordToken resetPasswordToken = resetPasswordTokenRepository.findByToken(hashedToken)
                .orElseThrow(() -> new ApiException("Invalid password reset token", HttpStatus.BAD_REQUEST));
        useResetPasswordToken(hashedToken, resetPasswordToken.getAccountId(), newPassword);
    }

    @Transactional
    public void useResetPasswordToken(String hashedToken, String accountId, String newPassword) {
        // fetch all the tokens for the said account
        List<ResetPasswordToken> resetPasswordTokenListOfAccount = resetPasswordTokenRepository.findByAccountId(accountId);

        // check if the token still exist in the account's list of token
        // if not, it is already redeemed
        ResetPasswordToken match = null;
        for(ResetPasswordToken r : resetPasswordTokenListOfAccount) {
            if(r.getToken().equals(hashedToken)) {
                match = r;
            }
        }

        if(match == null) {
            throw new ApiException("Invalid password reset token", HttpStatus.BAD_REQUEST);
        }

        // delete all the tokens for this account
        resetPasswordTokenRepository.deleteAll(resetPasswordTokenListOfAccount);

        // check if the token is already expired
        if(match.getTokenExpirationDate().isBefore(LocalDateTime.now())) {
            throw new ApiException("Token has expired. Please try again.", HttpStatus.BAD_REQUEST);
        }

        // now we can update the password of the user
        Account account = accountRepository.findById(match.getAccountId())
                .orElseThrow(() -> new ApiException("Invalid password reset token", HttpStatus.BAD_REQUEST));
        account.setPassword(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }

    public String createPasswordToken() throws NoSuchAlgorithmException, InvalidKeySpecException {
        // Courtesy of superTokens code snippet from https://supertokens.com/blog/implementing-a-forgot-password-flow
        // we first generate a password reset token
        byte[] random = new byte[64];
        byte[] salt = new byte[64];

        new SecureRandom().nextBytes(random);
        new SecureRandom().nextBytes(salt);

        int iterations = 1000;
        String token = Utils
                .toHex(Utils.pbkdf2(Utils.bytesToString(random).toCharArray(), salt, iterations, 64 * 6));

        // we make it URL safe:
        token = Utils.convertToBase64(token);
        token = token.replace("=", "");
        token = token.replace("/", "");
        token = token.replace("+", "");

        return token;
    }

    public void createResetPasswordToken (Account account, String token) throws NoSuchAlgorithmException, InvalidKeySpecException {
        String hashedToken = Utils.hashSHA256(token);
        log.info("Hashed token {}, Token {}", hashedToken, token);

        ResetPasswordToken resetPasswordToken = new ResetPasswordToken();
        resetPasswordToken.setToken(hashedToken);
        resetPasswordToken.setTokenExpirationDate(LocalDateTime.now().plusDays(1));
        resetPasswordToken.setAccountId(account.getId());

        resetPasswordTokenRepository.save(resetPasswordToken);
    }
}
