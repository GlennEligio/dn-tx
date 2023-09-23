package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUpdateTransactionDto {
    @NotBlank(message = "Username can't be blank")
    private String username;
    @NotNull(message = "Creator must be present, at least the username")
    private Account creator;
    private List<FileAttachment> fileAttachments;

    @Pattern(regexp = "(CC2GOLD|GOLD2PHP|ITEM2GOLD)", message = "Transaction type can only be CC2GOLD, GOLD2PHP, or ITEM2GOLD")
    @NotNull(message = "Transaction type must be present")
    private String type;

    private Boolean reversed;

    @Valid
    @NotEmpty
    private List<TransactionItemDto> transactionItems;

    public Transaction toTransaction() {
        Transaction transaction = new Transaction();
        transaction.setUsername(username);
        transaction.setCreator(creator);
        transaction.setFileAttachments(fileAttachments);
        transaction.setType(TransactionType.getTransactionType(type));
        transaction.setReversed(reversed);

        transaction.setTransactionItems(transactionItems.stream()
                .map(t -> t.toTransactionItem(transaction.getType()))
                .collect(Collectors.toList()));
        return transaction;
    }
}
