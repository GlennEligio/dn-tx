package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

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

    @Positive
    private BigDecimal ccAmount;
    @Positive
    private Double goldPerCC;
    @Positive(message = "goldPaid must be positive")
    private Double goldPaid;

    private String name;
    @Positive(message = "phpPaid must be positive")
    private Double phpPaid;
    @Positive(message = "goldPerPhp must be positive")
    private Double goldPerPhp;
    private String methodOfPayment;

    private String itemName;

    @PastOrPresent(message = "Must be either in past or present")
    private ZonedDateTime dateFinished;

    @Positive(message = "itemQuantity must be positive")
    private Long itemQuantity;

    @Positive(message = "itemPriceInGold must be positive")
    private Double itemPriceInGold;

    public Transaction toTransaction() {
        Transaction transaction = null;
        switch(TransactionType.getTransactionType(type)) {
            case CC2GOLD:
                CcToGoldTransaction transaction1 = new CcToGoldTransaction();
                transaction1.setUsername(username);
                transaction1.setCreator(creator);
                transaction1.setFileAttachments(fileAttachments);
                transaction1.setType(TransactionType.CC2GOLD);
                transaction1.setReversed(reversed);

                transaction1.setCcAmount(ccAmount);
                transaction1.setGoldPerCC(goldPerCC);
                transaction1.setGoldPaid(goldPaid);
                transaction1.setDateFinished(dateFinished);
                transaction = transaction1;
                break;
            case GOLD2PHP:
                GoldToPhpTransaction transaction2 = new GoldToPhpTransaction();
                transaction2.setUsername(username);
                transaction2.setCreator(creator);
                transaction2.setFileAttachments(fileAttachments);
                transaction2.setType(TransactionType.GOLD2PHP);
                transaction2.setReversed(reversed);

                transaction2.setName(name);
                transaction2.setPhpPaid(phpPaid);
                transaction2.setGoldPerPhp(goldPerPhp);
                transaction2.setMethodOfPayment(methodOfPayment);
                transaction2.setDateFinished(dateFinished);
                transaction = transaction2;
                break;
            case ITEM2GOLD:
                ItemToGoldTransaction transaction3 = new ItemToGoldTransaction();
                transaction3.setUsername(username);
                transaction3.setCreator(creator);
                transaction3.setFileAttachments(fileAttachments);
                transaction3.setType(TransactionType.ITEM2GOLD);
                transaction3.setReversed(reversed);

                transaction3.setItemName(itemName);
                transaction3.setItemQuantity(itemQuantity);
                transaction3.setItemPriceInGold(itemPriceInGold);
                transaction3.setDateFinished(dateFinished);
                transaction = transaction3;
                break;
        }
        return transaction;
    }
}
