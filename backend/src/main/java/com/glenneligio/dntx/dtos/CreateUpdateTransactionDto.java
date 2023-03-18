package com.glenneligio.dntx.dtos;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
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
    private String id;
    private String username;
    private Account creator;
    private LocalDateTime dateFinished;
    private List<FileAttachment> fileAttachments;

    private TransactionType type;
    private BigDecimal ccAmount;
    private Double goldPerCC;
    private Double goldPaid;

    private String name;
    private Double phpPaid;
    private Double goldPerPhp;
    private String methodOfPayment;

    public Transaction toTransaction() {
        Transaction transaction = null;
        switch(type) {
            case CcToGold:
                CcToGoldTransaction transaction1 = new CcToGoldTransaction();
                transaction.setUsername(username);
                transaction.setCreator(creator);
                transaction.setDateFinished(dateFinished);
                transaction.setFileAttachments(fileAttachments);
                transaction.setType(type);
                transaction1.setCcAmount(ccAmount);
                transaction1.setGoldPerCC(goldPerCC);
                transaction1.setGoldPaid(goldPaid);
                transaction = transaction1;
                break;
            case GoldToPhp:
                GoldToPhpTransaction transaction2 = new GoldToPhpTransaction();
                transaction2.setUsername(username);
                transaction2.setCreator(creator);
                transaction2.setDateFinished(dateFinished);
                transaction2.setFileAttachments(fileAttachments);
                transaction2.setType(type);

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
