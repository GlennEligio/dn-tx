package com.glenneligio.dntx.service;


import com.glenneligio.dntx.exception.ApiException;
import com.glenneligio.dntx.model.Account;
import com.glenneligio.dntx.model.CcToGoldTransaction;
import com.glenneligio.dntx.model.GoldToPhpTransaction;
import com.glenneligio.dntx.model.Transaction;
import com.glenneligio.dntx.repository.TransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class TransactionService {

    private static final String CLASS_NAME = TransactionService.class.getName();

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private AccountService accountService;

    public Transaction createTransaction(Transaction transaction) {
        Account account = accountService.getAccountByUsername(transaction.getCreator().getUsername());
        transaction.setCreator(account);
        transaction.setDateFinished(LocalDateTime.now());
        switch(transaction.getType()) {
            case GoldToPhp:
                GoldToPhpTransaction goldToPhpTransaction = new GoldToPhpTransaction(transaction);
                return transactionRepository.save(goldToPhpTransaction);
            case CcToGold:
                CcToGoldTransaction ccToGoldTransaction = new CcToGoldTransaction(transaction);
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
            return transactionRepository.save(goldToPhpTransaction);
        } else if (transactionToBeUpdated instanceof CcToGoldTransaction ccToGoldTransaction) {
            log.info("Transaction is a Cc2Gold tx");
            ccToGoldTransaction.updateCcToGold(new CcToGoldTransaction(transaction));
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
}
