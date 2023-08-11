package com.glenneligio.dntx.repository;

import com.glenneligio.dntx.model.Account;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface AccountRepository extends MongoRepository<Account, String> {

    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);
}
