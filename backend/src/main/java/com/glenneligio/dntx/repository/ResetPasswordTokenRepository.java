package com.glenneligio.dntx.repository;

import com.glenneligio.dntx.model.ResetPasswordToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ResetPasswordTokenRepository extends MongoRepository<ResetPasswordToken, String> {

    Optional<ResetPasswordToken> findByToken(String token);
    List<ResetPasswordToken> findByAccountId(String accountId);
}
