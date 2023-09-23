package com.glenneligio.dntx.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.exception.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.http.HttpStatus;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "transactions")
@JsonIgnoreProperties(value = {"creator"})
public class Transaction implements Serializable {

    @Id
    private String id;

    @NotBlank(message = "Transaction's username must not be blank")
    private String username;
    @DBRef
    @NotNull(message = "Transaction's creator must not be null")
    private Account creator;
    @PastOrPresent(message = "Transaction's date finished must be only present or past")
    private ZonedDateTime dateFinished;
    private List<FileAttachment> fileAttachments;

    private boolean reversed;

    private TransactionType type;
    @NotEmpty
    private List<TransactionItem> transactionItems;

    public void update(Transaction t) {
        this.username = t.getUsername();
        this.fileAttachments = t.getFileAttachments();
        this.dateFinished = t.getDateFinished();
        this.reversed = t.isReversed();
        this.transactionItems = convertTransactionItems(t);
    }

    public static List<TransactionItem> convertTransactionItems(Transaction transaction) {
        switch (transaction.getType()) {
            case GOLD2PHP:
                return transaction.getTransactionItems().stream().map(GoldToPhpTransactionItem::new).collect(Collectors.toList());
            case CC2GOLD:
                return transaction.getTransactionItems().stream().map(CcToGoldTransactionItem::new).collect(Collectors.toList());
            case ITEM2GOLD:
                return transaction.getTransactionItems().stream().map(ItemToGoldTransactionItem::new).collect(Collectors.toList());
            default:
                throw new ApiException("No transaction type specified", HttpStatus.BAD_REQUEST);
        }
    }
}
