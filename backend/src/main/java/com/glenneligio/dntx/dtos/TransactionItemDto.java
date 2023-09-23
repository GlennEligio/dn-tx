package com.glenneligio.dntx.dtos;

import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Slf4j
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionItemDto {

    // CC2GOLD
    @Positive
    private BigDecimal ccAmount;
    @Positive
    private Double goldPerCC;
    @Positive(message = "goldPaid must be positive")
    private Double goldPaid;

    // GOLD2PHP
    private String name;
    @Positive(message = "phpPaid must be positive")
    private Double phpPaid;
    @Positive(message = "goldPerPhp must be positive")
    private Double goldPerPhp;
    private String methodOfPayment;

    // ITEM2GOLD
    private String itemName;

    @PastOrPresent(message = "Must be either in past or present")
    private ZonedDateTime dateFinished;

    @Positive(message = "itemQuantity must be positive")
    private Long itemQuantity;

    @Positive(message = "itemPriceInGold must be positive")
    private Double itemPriceInGold;

    public TransactionItem toTransactionItem(TransactionType type) {
        TransactionItem transactionItem = null;
        switch(type) {
            case CC2GOLD:
                CcToGoldTransactionItem transaction1 = new CcToGoldTransactionItem();
                transaction1.setCcAmount(ccAmount);
                transaction1.setGoldPerCC(goldPerCC);
                transaction1.setGoldPaid(goldPaid);
                transactionItem = transaction1;
                break;
            case GOLD2PHP:
                GoldToPhpTransactionItem transaction2 = new GoldToPhpTransactionItem();
                transaction2.setName(name);
                transaction2.setPhpPaid(phpPaid);
                transaction2.setGoldPerPhp(goldPerPhp);
                transaction2.setMethodOfPayment(methodOfPayment);
                transactionItem = transaction2;
                break;
            case ITEM2GOLD:
                ItemToGoldTransactionItem transaction3 = new ItemToGoldTransactionItem();
                transaction3.setItemName(itemName);
                transaction3.setItemQuantity(itemQuantity);
                transaction3.setItemPriceInGold(itemPriceInGold);
                transactionItem = transaction3;
                break;
        }
        return transactionItem;
    }

}
