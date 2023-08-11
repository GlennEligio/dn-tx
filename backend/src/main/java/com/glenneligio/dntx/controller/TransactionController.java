package com.glenneligio.dntx.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.glenneligio.dntx.dtos.CreateUpdateTransactionDto;
import com.glenneligio.dntx.model.Transaction;
import com.glenneligio.dntx.service.TransactionService;
import com.glenneligio.dntx.util.Utils;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transactions")
@Slf4j
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
    public ResponseEntity<Transaction> createTransaction(@RequestBody @Valid CreateUpdateTransactionDto transactionDto) {
        Transaction transactionCreated = service.createTransaction(transactionDto.toTransaction());
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(transactionCreated.getId()).toUri())
                .body(transactionCreated);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable String id,
                                                         @RequestBody @Valid CreateUpdateTransactionDto dto) {
        Transaction transactionUpdated = service.updateTransaction(id, dto.toTransaction());
        return ResponseEntity.ok(transactionUpdated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable String id) throws JsonProcessingException {
        service.deleteTransaction(id);
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        ObjectNode response = Utils.createObjectNodeFromMap(map);
        return ResponseEntity.ok(response);
    }
}
