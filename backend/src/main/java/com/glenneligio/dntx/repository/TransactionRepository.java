package com.glenneligio.dntx.repository;

import com.glenneligio.dntx.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends MongoRepository<Transaction, String> {

    Optional<Transaction> findByUsernameAndId(String username, String id);

    List<Transaction> findByCreatorId(String id);

    Page<Transaction> findByCreatorId(String id, Pageable pageable);

    List<Transaction> findByCreatorIdAndDateFinishedBetween(String id, LocalDateTime afterDate, LocalDateTime beforeDate);

}
