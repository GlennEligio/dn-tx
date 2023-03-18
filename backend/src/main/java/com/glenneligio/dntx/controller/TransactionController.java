package com.glenneligio.dntx.controller;

import com.glenneligio.dntx.dtos.CreateUpdateTransactionDto;
import com.glenneligio.dntx.model.Transaction;
import com.glenneligio.dntx.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    @Autowired
    private TransactionService service;

    @GetMapping
    public ResponseEntity<List<Transaction>> getTransactions() {
        List<Transaction> transactions = service.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable String id) {
        Transaction transaction = service.getTransactionById(id);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/search")
    public ResponseEntity<Transaction> getTransactionByUsernameAndId(@RequestParam String username,
                                                                     @RequestParam String id) {
        return ResponseEntity.ok(service.getTransactionByUsernameAndId(username, id));
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody CreateUpdateTransactionDto transactionDto) {
        Transaction transactionCreated = service.createTransaction(transactionDto.toTransaction());
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(transactionCreated.getId()).toUri())
                .body(transactionCreated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable String id,
                                                         @RequestBody CreateUpdateTransactionDto dto) {
        Transaction transactionUpdated = service.updateTransaction(id, dto.toTransaction());
        return ResponseEntity.ok(transactionUpdated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable String id) {
        service.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }
}
