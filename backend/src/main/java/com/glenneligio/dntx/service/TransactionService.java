package com.glenneligio.dntx.service;


import com.glenneligio.dntx.exception.ApiException;
import com.glenneligio.dntx.model.Account;
import com.glenneligio.dntx.model.CcToGoldTransaction;
import com.glenneligio.dntx.model.GoldToPhpTransaction;
import com.glenneligio.dntx.model.Transaction;
import com.glenneligio.dntx.repository.TransactionRepository;
import jakarta.validation.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class TransactionService {

    private static final String CLASS_NAME = TransactionService.class.getName();

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private Validator validator;
    @Autowired
    private AccountService accountService;

    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating transaction {}", transaction);
        Account account = accountService.getAccountByUsername(transaction.getCreator().getUsername());
        transaction.setCreator(account);
        transaction.setDateFinished(LocalDateTime.now());

        switch(transaction.getType()) {
            case GOLD2PHP:
                GoldToPhpTransaction goldToPhpTransaction = new GoldToPhpTransaction(transaction);
                validateGoldToPhpTransaction(goldToPhpTransaction);
                return transactionRepository.save(goldToPhpTransaction);
            case CC2GOLD:
                CcToGoldTransaction ccToGoldTransaction = new CcToGoldTransaction(transaction);
                validateCcToGoldTransaction(ccToGoldTransaction);
                return transactionRepository.save(ccToGoldTransaction);
            default:
                throw new ApiException("No transaction type specified", HttpStatus.BAD_REQUEST);
        }
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ApiException("No transaction exist with specified id", HttpStatus.NOT_FOUND));
    }

    public Transaction getTransactionByUsernameAndId(String username, String id) {
        return transactionRepository.findByUsernameAndId(username, id)
                .orElseThrow(() -> new ApiException("Not transaction exist with specified username and id", HttpStatus.NOT_FOUND));
    }

    public Transaction updateTransaction(String id, Transaction transaction) {
        final String METHOD_NAME = "updateTransaction";
        log.info("Inside {} of {} with inputs {} and {}", METHOD_NAME, CLASS_NAME, id, transaction);
        var transactionToBeUpdated = getTransactionById(id);

        // Check specified instance type of transaction, since each have different fields to update
        if(transactionToBeUpdated instanceof GoldToPhpTransaction goldToPhpTransaction) {
            log.info("Transaction is a Gold2Php tx");
            goldToPhpTransaction.updateGold2Php(new GoldToPhpTransaction(transaction));
            validateGoldToPhpTransaction(goldToPhpTransaction);
            return transactionRepository.save(goldToPhpTransaction);
        } else if (transactionToBeUpdated instanceof CcToGoldTransaction ccToGoldTransaction) {
            log.info("Transaction is a Cc2Gold tx");
            ccToGoldTransaction.updateCcToGold(new CcToGoldTransaction(transaction));
            validateCcToGoldTransaction(ccToGoldTransaction);
            return transactionRepository.save(ccToGoldTransaction);
        } else {
            transactionToBeUpdated.update(transaction);
            log.info("Transaction type is not defined");
            return transactionRepository.save(transactionToBeUpdated);
        }
    }

    public void deleteTransaction(String id) {
        var transactionToBeDeleted = getTransactionById(id);
        transactionRepository.deleteById(transactionToBeDeleted.getId());
    }

    public List<Transaction> getTransactionsByCreatorUsername(String username) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorId(account.getId());
    }

    public Page<Transaction> getTransactionPageByCreatorUsername(String username, int pageNumber, int pageSize) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorId(account.getId(), PageRequest.of(pageNumber, pageSize).withSort(Sort.by("dateFinished").descending()));
    }

    private void validateCcToGoldTransaction(CcToGoldTransaction ccToGoldTransaction) {
        Set<ConstraintViolation<CcToGoldTransaction>> violations = validator.validate(ccToGoldTransaction);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Invalid CcToGoldTransaction", violations);
        }
    }

    private void validateGoldToPhpTransaction(GoldToPhpTransaction goldToPhpTransaction) {
        Set<ConstraintViolation<GoldToPhpTransaction>> violations = validator.validate(goldToPhpTransaction);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Invalid GoldToPhpTransaction", violations);
        }
    }
}
