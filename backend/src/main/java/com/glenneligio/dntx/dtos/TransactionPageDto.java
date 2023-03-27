package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.model.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionPageDto {
    private List<Transaction> transactions;
    private int totalPages;
    private long totalTransactions;
    private int pageNumber;
    private int pageSize;
}
