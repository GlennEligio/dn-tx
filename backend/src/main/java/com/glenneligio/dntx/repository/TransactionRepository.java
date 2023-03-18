package com.glenneligio.dntx.repository;

import com.glenneligio.dntx.model.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    Optional<Transaction> findByUsernameAndId(String username, String id);

    List<Transaction> findByCreatorId(String id);
}
