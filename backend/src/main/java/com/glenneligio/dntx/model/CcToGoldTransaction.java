package com.glenneligio.dntx.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "transactions")
@Slf4j
public class CcToGoldTransaction extends Transaction{

    @Positive(message = "CcToGoldTransaction's cc amount must be positive")
    @NotNull(message = "Cc amount must not be null")
    private BigDecimal ccAmount;

    @Positive(message = "CcToGoldTransaction's gold per cc ratio must be positive")
    @NotNull(message = "Cc amount must not be null")
    private Double goldPerCC;

    @Positive(message = "CcToGoldTransaction's gold paid must be positive")
    @NotNull(message = "Gold paid must not be null")
    private Double goldPaid;

    public CcToGoldTransaction(Transaction t)  {
        this.setUsername(t.getUsername());
        this.setCreator(t.getCreator());
        this.setDateFinished(t.getDateFinished());
        this.setFileAttachments(t.getFileAttachments());
        this.setType(t.getType());

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        try {
            String txString = mapper.writeValueAsString(t);
            JsonNode jsonNode = mapper.readTree(txString);
            log.info(txString);
            this.setCcAmount(jsonNode.get("ccAmount").decimalValue());
            this.setGoldPerCC(jsonNode.get("goldPerCC").asDouble());
            this.setGoldPaid(jsonNode.get("goldPaid").asDouble());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    public void updateCcToGold(CcToGoldTransaction t) {
        super.update(t);
        this.ccAmount = t.getCcAmount();
        this.goldPerCC = t.getGoldPerCC();
        this.goldPaid = t.getGoldPaid();
    }
}
