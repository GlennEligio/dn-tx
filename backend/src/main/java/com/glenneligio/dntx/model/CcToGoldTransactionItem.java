package com.glenneligio.dntx.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Slf4j
public class CcToGoldTransactionItem extends TransactionItem {

    @Positive(message = "CcToGoldTransaction's cc amount must be positive")
    @NotNull(message = "Cc amount must not be null")
    private BigDecimal ccAmount;

    @Positive(message = "CcToGoldTransaction's gold per cc ratio must be positive")
    @NotNull(message = "Cc amount must not be null")
    private Double goldPerCC;

    @Positive(message = "CcToGoldTransaction's gold paid must be positive")
    @NotNull(message = "Gold paid must not be null")
    private Double goldPaid;

    public CcToGoldTransactionItem(TransactionItem t)  {
        log.info("Updating cc to gold transaction item: {}", t);
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        try {
            String txString = mapper.writeValueAsString(t);
            JsonNode jsonNode = mapper.readTree(txString);
            this.setCcAmount(jsonNode.get("ccAmount").decimalValue());
            this.setGoldPerCC(jsonNode.get("goldPerCC").asDouble());
            this.setGoldPaid(jsonNode.get("goldPaid").asDouble());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public TransactionItem update(TransactionItem t) {
        CcToGoldTransactionItem src = new CcToGoldTransactionItem(t);
        this.ccAmount = src.getCcAmount();
        this.goldPerCC = src.getGoldPerCC();
        this.goldPaid = src.getGoldPaid();
        return this;
    }
}