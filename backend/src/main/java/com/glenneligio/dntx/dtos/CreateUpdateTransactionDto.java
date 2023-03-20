package com.glenneligio.dntx.dtos;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    @Pattern(regexp = "(CC2GOLD|GOLD2PHP)", message = "Transaction type can only be CcToGold or GoldToPhp")
    @NotNull(message = "Transaction type must be present")
    private String type;

    @Positive
    private BigDecimal ccAmount;
    private Double goldPerCC;
    private Double goldPaid;

    private String name;
    private Double phpPaid;
    private Double goldPerPhp;
    private String methodOfPayment;

    public Transaction toTransaction() {
        Transaction transaction = null;
        switch(TransactionType.getTransactionType(type)) {
            case CcToGold:
                CcToGoldTransaction transaction1 = new CcToGoldTransaction();
                transaction1.setUsername(username);
                transaction1.setCreator(creator);
                transaction1.setFileAttachments(fileAttachments);
                transaction1.setType(TransactionType.CcToGold);
                transaction1.setCcAmount(ccAmount);
                transaction1.setGoldPerCC(goldPerCC);
                transaction1.setGoldPaid(goldPaid);
                transaction = transaction1;
                break;
            case GoldToPhp:
                GoldToPhpTransaction transaction2 = new GoldToPhpTransaction();
                transaction2.setUsername(username);
                transaction2.setCreator(creator);
                transaction2.setFileAttachments(fileAttachments);
                transaction2.setType(TransactionType.GoldToPhp);

                transaction2.setName(name);
                transaction2.setPhpPaid(phpPaid);
                transaction2.setGoldPerPhp(goldPerPhp);
                transaction2.setMethodOfPayment(methodOfPayment);
                transaction = transaction2;
                break;
        }
        return transaction;
    }
}
