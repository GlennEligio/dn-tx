package com.glenneligio.dntx.model;

import lombok.Data;

@Data
public abstract class TransactionItem {
    abstract TransactionItem update(TransactionItem src);
}
